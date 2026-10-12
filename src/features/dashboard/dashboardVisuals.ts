export type PanelArtwork = {
  image: string;
  overlayClass: string;
  objectPosition?: string;
  imageScale?: number;
};

export type DashboardMetricKind = "income" | "expenses" | "surplus" | "savings";

const metricArtworks: Record<DashboardMetricKind, PanelArtwork> = {
  income: {
    image: "/achievements/v3/starter.webp",
    overlayClass: "from-[#0b1322] via-[#0b1322]/96 to-[#0b1322]/75",
    objectPosition: "center",
    imageScale: 1.05,
  },
  expenses: {
    image: "/goals/v2/debt-payoff.webp",
    overlayClass: "from-[#0b1322] via-[#0b1322]/96 to-[#0b1322]/75",
    objectPosition: "center",
    imageScale: 1.05,
  },
  surplus: {
    image: "/achievements/v3/capital-flow.webp",
    overlayClass: "from-[#0b1322] via-[#0b1322]/96 to-[#0b1322]/78",
    objectPosition: "center",
    imageScale: 1.05,
  },
  savings: {
    image: "/achievements/v3/safety-shield.webp",
    overlayClass: "from-[#0b1322] via-[#0b1322]/96 to-[#0b1322]/75",
    objectPosition: "center",
    imageScale: 1.04,
  },
};

export function getDashboardMetricArtwork(kind: DashboardMetricKind): PanelArtwork {
  return metricArtworks[kind];
}

export function getCashflowSectionArtwork(): PanelArtwork {
  return {
    image: "/achievements/v3/capital-flow.webp",
    overlayClass: "from-[#0b1322] via-[#0b1322]/94 to-[#0b1322]/84",
    objectPosition: "center",
    imageScale: 1.05,
  };
}
