export type FlagCode = "PL" | "GB" | "DE" | "ES" | "US" | "EU" | "CH";

export function FlagIcon({ code, className = "h-8 w-11" }: { code: FlagCode; className?: string }) {
  const common = `overflow-hidden rounded-md shadow-sm ring-1 ring-white/10 ${className}`;

  switch (code) {
    case "PL":
      return (
        <svg viewBox="0 0 36 24" className={common} aria-label="Poland flag" role="img">
          <rect width="36" height="12" fill="#fff" />
          <rect y="12" width="36" height="12" fill="#dc143c" />
        </svg>
      );
    case "GB":
      return (
        <svg viewBox="0 0 36 24" className={common} aria-label="United Kingdom flag" role="img">
          <rect width="36" height="24" fill="#012169" />
          <path d="M0 0 36 24M36 0 0 24" stroke="#fff" strokeWidth="5" />
          <path d="M0 0 36 24M36 0 0 24" stroke="#c8102e" strokeWidth="2.5" />
          <path d="M18 0v24M0 12h36" stroke="#fff" strokeWidth="7" />
          <path d="M18 0v24M0 12h36" stroke="#c8102e" strokeWidth="4" />
        </svg>
      );
    case "DE":
      return (
        <svg viewBox="0 0 36 24" className={common} aria-label="Germany flag" role="img">
          <rect width="36" height="8" fill="#000" />
          <rect y="8" width="36" height="8" fill="#dd0000" />
          <rect y="16" width="36" height="8" fill="#ffce00" />
        </svg>
      );
    case "ES":
      return (
        <svg viewBox="0 0 36 24" className={common} aria-label="Spain flag" role="img">
          <rect width="36" height="24" fill="#aa151b" />
          <rect y="6" width="36" height="12" fill="#f1bf00" />
          <rect x="10" y="9" width="2.5" height="6" rx="0.6" fill="#aa151b" opacity=".9" />
        </svg>
      );
    case "US":
      return (
        <svg viewBox="0 0 36 24" className={common} aria-label="United States flag" role="img">
          <rect width="36" height="24" fill="#fff" />
          {Array.from({ length: 7 }).map((_, index) => (
            <rect key={index} y={index * (24 / 7)} width="36" height={24 / 14} fill="#b22234" />
          ))}
          <rect width="16" height="12.9" fill="#3c3b6e" />
          {Array.from({ length: 12 }).map((_, index) => (
            <circle key={index} cx={2 + (index % 4) * 3.7} cy={2 + Math.floor(index / 4) * 3.4} r="0.65" fill="#fff" />
          ))}
        </svg>
      );
    case "EU": {
      const stars = Array.from({ length: 12 }, (_, index) => {
        const angle = (index * Math.PI * 2) / 12 - Math.PI / 2;
        return { x: 18 + Math.cos(angle) * 7, y: 12 + Math.sin(angle) * 7 };
      });
      return (
        <svg viewBox="0 0 36 24" className={common} aria-label="European Union flag" role="img">
          <rect width="36" height="24" fill="#003399" />
          {stars.map((star, index) => <circle key={index} cx={star.x} cy={star.y} r="1" fill="#ffcc00" />)}
        </svg>
      );
    }
    case "CH":
      return (
        <svg viewBox="0 0 36 24" className={common} aria-label="Switzerland flag" role="img">
          <rect width="36" height="24" fill="#d52b1e" />
          <rect x="15" y="5" width="6" height="14" fill="#fff" />
          <rect x="11" y="9" width="14" height="6" fill="#fff" />
        </svg>
      );
  }
}
