import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve("src");
const catalogPath = path.join(ROOT, "i18n", "LanguageContext.tsx");
const catalogSource = fs.readFileSync(catalogPath, "utf8");

const catalog = { pl: new Set(), en: new Set(), de: new Set() };
for (const lang of ["pl", "en", "de"]) {
  const re = new RegExp(`${lang}:\\s*"((?:\\\\.|[^"\\\\])*)"`, "g");
  for (const match of catalogSource.matchAll(re)) {
    catalog[lang].add(match[1].replaceAll('\\\\"', '"').trim().toLocaleLowerCase());
  }
}

const polishSignal = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|\b(?:brak|wybierz|dodaj|usuń|edytuj|zapisz|kwota|nazwa|data|cel|cele|wydatek|wydatki|przychód|przychody|majątek|zobowiązania|portfel|środki|miesiąc|konto|gotówka|dług|termin|kategoria|źródło|wynik|wartość|dochód|nadwyżka|odłożone|rata|postęp|zwolnij|anuluj|zamknij)\b/i;
const englishSignal = /\b(?:add|edit|delete|save|cancel|income|expense|expenses|goal|goals|portfolio|portfolios|wealth|capital|debt|cashflow|value|available|source|amount|date|name|category|status|month|monthly|review|history|current|target|progress|deadline|mission|level|rules|rule|active|close|open|ready|assets|liabilities|growth|control|settings|language|today|yesterday|bonds|performance|primary|next|action|snapshot|frozen|analysis|quick|insight|road|movement|chart|structure|allocation|required|tracking|one-off|watch)\b/i;
const visibleAttrs = new Set(["title", "placeholder", "aria-label", "alt", "label", "description", "subtitle", "badge"]);
const neutralExact = new Set(["system", "api", "ai", "pln", "btc", "eth", "etf", "free"]);

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}
function isCatalogued(value, lang) {
  return catalog[lang].has(normalize(value).toLocaleLowerCase());
}
function collectFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", "dist"].includes(entry.name)) collectFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const findings = [];
function check(value, file, node, sourceFile) {
  const text = normalize(value);
  if (!text || text.length < 2 || /^[-+]?\d[\d\s.,%/:-]*(?:zł|PLN)?$/i.test(text)) return;
  if (/^(?:https?:\/\/|\/[^ ]+\.(?:webp|png|jpg|jpeg|svg))/.test(text)) return;
  if (neutralExact.has(text.toLocaleLowerCase())) return;

  if (isCatalogued(text, "pl") || isCatalogued(text, "en") || isCatalogued(text, "de")) return;

  let lang = null;
  if (polishSignal.test(text)) lang = "pl";
  else if (englishSignal.test(text)) lang = "en";
  if (!lang || isCatalogued(text, lang)) return;

  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  findings.push({ file: path.relative(process.cwd(), file), line: line + 1, lang, text });
}

for (const file of collectFiles(ROOT)) {
  if (file === catalogPath) continue;
  const source = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  function visit(node) {
    if (ts.isJsxText(node)) check(node.getText(sf), file, node, sf);
    if (ts.isJsxAttribute(node) && visibleAttrs.has(node.name.getText(sf))) {
      if (node.initializer && ts.isStringLiteral(node.initializer)) check(node.initializer.text, file, node, sf);
      if (node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression && ts.isStringLiteral(node.initializer.expression)) {
        check(node.initializer.expression.text, file, node, sf);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

const unique = [...new Map(findings.map((item) => [`${item.file}:${item.line}:${item.text}`, item])).values()];
if (unique.length) {
  console.error(`i18n audit: ${unique.length} visible strings are not covered by the PL/EN/DE catalogue:\n`);
  for (const item of unique) console.error(`${item.file}:${item.line} [${item.lang}] ${item.text}`);
  process.exit(1);
}

console.log("i18n audit OK: visible PL/EN JSX strings are covered by the multilingual catalogue (PL/EN/DE).");
