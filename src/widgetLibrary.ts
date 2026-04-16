
export type WidgetKind =
  | "hero"
  | "stats"
  | "chart"
  | "activity"
  | "notes"
  | "table"
  | "gallery"
  | "testimonial"
  | "profile";

export type CardStyleName =
  | "glass"
  | "clean"
  | "bordered"
  | "floating"
  | "neon"
  | "matte"
  | "glossy";

export type ButtonStyleName = "soft" | "glass" | "pill" | "outline" | "neon";
export type ChartSkin = "bars" | "area" | "line";

export type WidgetVisibility = {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
};

export type WidgetStyleOverride = {
  cardStyle?: CardStyleName;
  buttonStyleMode?: ButtonStyleName;
  accent?: string;
  glowColor?: string;
  radius?: number;
  shadowBoost?: number;
  opacityBoost?: number;
  glowBoost?: number;
  chartSkin?: ChartSkin;
};

export type TableRow = {
  name: string;
  status: string;
  value: string;
};

export type WidgetData = {
  subtitle: string;
  body: string;
  imageUrl: string;
  statA: string;
  statB: string;
  statC: string;
  tags: string[];
  quote: string;
  person: string;
  role: string;
  ctaLabel: string;
  chartPoints: number[];
  tableRows: TableRow[];
  galleryLabels: string[];
  listItems: string[];
};

export type Widget = {
  id: string;
  kind: WidgetKind;
  title: string;
  icon: string;
  span: number;
  hidden: boolean;
  collapsed: boolean;
  locked: boolean;
  visibility: WidgetVisibility;
  style: WidgetStyleOverride;
  data: WidgetData;
};

export type WidgetTemplate = {
  kind: WidgetKind;
  label: string;
  description: string;
  icon: string;
  defaultSpan: number;
};

export const ICON_OPTIONS = [
  "✨",
  "📊",
  "🧊",
  "⚡",
  "🖼️",
  "🧩",
  "🧠",
  "🛍️",
  "🗂️",
  "🌈",
  "💬",
  "📈",
  "🔮",
  "🪄",
  "📱",
  "🧪",
  "🌙",
  "☀️",
  "🚀",
  "🔐",
  "🫧",
  "🧭",
  "🪩",
];

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    kind: "hero",
    label: "Hero",
    description: "Large headline with a CTA and supporting message.",
    icon: "✨",
    defaultSpan: 3,
  },
  {
    kind: "stats",
    label: "Stats",
    description: "Three KPI cards for a dashboard summary.",
    icon: "📊",
    defaultSpan: 2,
  },
  {
    kind: "chart",
    label: "Chart",
    description: "Animated mock chart with bar, area, or line skins.",
    icon: "📈",
    defaultSpan: 2,
  },
  {
    kind: "activity",
    label: "Activity",
    description: "Feed-style list for updates and events.",
    icon: "🧭",
    defaultSpan: 1,
  },
  {
    kind: "notes",
    label: "Notes",
    description: "Text callout with chips and ideas.",
    icon: "🪄",
    defaultSpan: 1,
  },
  {
    kind: "table",
    label: "Table",
    description: "Structured rows for data-heavy mockups.",
    icon: "🗂️",
    defaultSpan: 2,
  },
  {
    kind: "gallery",
    label: "Gallery",
    description: "Image placeholders for visual-heavy layouts.",
    icon: "🖼️",
    defaultSpan: 2,
  },
  {
    kind: "testimonial",
    label: "Testimonial",
    description: "Quote block with name and role.",
    icon: "💬",
    defaultSpan: 1,
  },
  {
    kind: "profile",
    label: "Profile",
    description: "Avatar card with tags and quick facts.",
    icon: "🧠",
    defaultSpan: 1,
  },
];

function makeId(kind: WidgetKind) {
  const seed = Math.random().toString(36).slice(2, 9);
  return `${kind}-${seed}`;
}

function defaultTableRows(kind: WidgetKind): TableRow[] {
  if (kind === "table") {
    return [
      { name: "Onboarding flow", status: "Draft", value: "78%" },
      { name: "Upgrade modal", status: "Review", value: "52%" },
      { name: "Dashboard skin", status: "Live", value: "96%" },
      { name: "Pricing card", status: "Testing", value: "61%" },
    ];
  }

  return [
    { name: "North", status: "Healthy", value: "$18.4K" },
    { name: "South", status: "Watch", value: "$12.6K" },
    { name: "West", status: "Growing", value: "$24.1K" },
  ];
}

function defaultData(kind: WidgetKind): WidgetData {
  switch (kind) {
    case "hero":
      return {
        subtitle: "Frontend only",
        body:
          "Focus on the visual system first. Drag cards around, flip between glass and glow presets, and style the surface until it feels right.",
        imageUrl:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        statA: "24.8K",
        statB: "5.2%",
        statC: "$18.4K",
        tags: ["Glass", "Glow", "Prototype"],
        quote: "",
        person: "",
        role: "",
        ctaLabel: "Explore styles",
        chartPoints: [34, 46, 42, 58, 71, 67, 82],
        tableRows: defaultTableRows(kind),
        galleryLabels: ["Primary", "Secondary", "Tertiary"],
        listItems: ["Drag widgets", "Change background", "Tune micro-interactions"],
      };
    case "stats":
      return {
        subtitle: "Overview",
        body: "A compact KPI row for hero sections and dashboards.",
        imageUrl: "",
        statA: "24.8K",
        statB: "5.2%",
        statC: "$18.4K",
        tags: ["Visitors", "Conversion", "Revenue"],
        quote: "",
        person: "",
        role: "",
        ctaLabel: "",
        chartPoints: [41, 50, 55, 61, 72, 68, 83],
        tableRows: defaultTableRows(kind),
        galleryLabels: [],
        listItems: ["Visitors up 12.4%", "Conversions up 1.1%", "Revenue up 8.6%"],
      };
    case "chart":
      return {
        subtitle: "Revenue trend",
        body: "Use the chart skin control to swap between bars, line, and area.",
        imageUrl: "",
        statA: "72%",
        statB: "+18%",
        statC: "4.8m",
        tags: ["Weekly", "Live", "Motion"],
        quote: "",
        person: "",
        role: "",
        ctaLabel: "",
        chartPoints: [28, 36, 42, 38, 54, 62, 58, 76, 69],
        tableRows: defaultTableRows(kind),
        galleryLabels: [],
        listItems: ["Monday jump", "Wednesday pullback", "Friday spike"],
      };
    case "activity":
      return {
        subtitle: "Recent changes",
        body: "Perfect for status feeds, changelogs, or update streams.",
        imageUrl: "",
        statA: "",
        statB: "",
        statC: "",
        tags: ["Live"],
        quote: "",
        person: "",
        role: "",
        ctaLabel: "",
        chartPoints: [24, 33, 46, 39, 51, 57, 62],
        tableRows: defaultTableRows(kind),
        galleryLabels: [],
        listItems: [
          "Homepage hero updated with softer blur",
          "Sidebar spacing reduced by 8px",
          "CTA accent switched to violet glow",
          "Table card widened for tablet preview",
        ],
      };
    case "notes":
      return {
        subtitle: "Quick notes",
        body:
          "Keep a running list of visual ideas, experiments, or prompts for your AI coding agent.",
        imageUrl: "",
        statA: "",
        statB: "",
        statC: "",
        tags: ["Glass", "Glow", "Rounded", "Dense", "Clean", "Dark"],
        quote: "",
        person: "",
        role: "",
        ctaLabel: "",
        chartPoints: [21, 27, 33, 45, 52, 58],
        tableRows: defaultTableRows(kind),
        galleryLabels: [],
        listItems: [
          "Try a milky glass preset",
          "Reduce hover by 30%",
          "Push the accent toward indigo",
        ],
      };
    case "table":
      return {
        subtitle: "Structured data",
        body: "A table is helpful when the page needs heavier information density.",
        imageUrl: "",
        statA: "",
        statB: "",
        statC: "",
        tags: ["Rows", "Columns"],
        quote: "",
        person: "",
        role: "",
        ctaLabel: "",
        chartPoints: [35, 37, 39, 42, 49, 55],
        tableRows: defaultTableRows(kind),
        galleryLabels: [],
        listItems: ["Draft", "Review", "Live", "Testing"],
      };
    case "gallery":
      return {
        subtitle: "Image placeholders",
        body:
          "Useful for app cards, portfolio blocks, galleries, and ecommerce previews.",
        imageUrl:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
        statA: "",
        statB: "",
        statC: "",
        tags: ["Visual", "Grid"],
        quote: "",
        person: "",
        role: "",
        ctaLabel: "",
        chartPoints: [28, 39, 48, 64, 72],
        tableRows: defaultTableRows(kind),
        galleryLabels: ["Overview", "Card UI", "Details"],
        listItems: ["Upload a new image URL", "Swap the card tint", "Add a stronger glow"],
      };
    case "testimonial":
      return {
        subtitle: "Customer voice",
        body: "A clean quote block helps you judge typography and spacing decisions quickly.",
        imageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
        statA: "",
        statB: "",
        statC: "",
        tags: ["Quote"],
        quote:
          "This let us move from vague design ideas to a polished frontend without waiting on backend work.",
        person: "Avery Stone",
        role: "Product Lead",
        ctaLabel: "",
        chartPoints: [26, 34, 38, 49, 58, 64],
        tableRows: defaultTableRows(kind),
        galleryLabels: [],
        listItems: ["Readable", "Confident", "Clean"],
      };
    case "profile":
      return {
        subtitle: "Team card",
        body:
          "Use this for profile summaries, account cards, or creator spotlights.",
        imageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
        statA: "12 yrs",
        statB: "48 launches",
        statC: "94 NPS",
        tags: ["Design Systems", "Motion", "UI"],
        quote: "",
        person: "Jordan Lee",
        role: "Lead Designer",
        ctaLabel: "View profile",
        chartPoints: [31, 39, 44, 51, 66, 72],
        tableRows: defaultTableRows(kind),
        galleryLabels: [],
        listItems: ["Product surfaces", "Brand systems", "Interaction polish"],
      };
    default:
      return {
        subtitle: "",
        body: "",
        imageUrl: "",
        statA: "",
        statB: "",
        statC: "",
        tags: [],
        quote: "",
        person: "",
        role: "",
        ctaLabel: "",
        chartPoints: [28, 34, 42, 38, 54],
        tableRows: defaultTableRows(kind),
        galleryLabels: [],
        listItems: [],
      };
  }
}

export function createWidget(kind: WidgetKind, overrides: Partial<Widget> = {}): Widget {
  const template = WIDGET_TEMPLATES.find((item) => item.kind === kind);

  return {
    id: overrides.id ?? makeId(kind),
    kind,
    title: overrides.title ?? template?.label ?? "Widget",
    icon: overrides.icon ?? template?.icon ?? "✨",
    span: overrides.span ?? template?.defaultSpan ?? 1,
    hidden: overrides.hidden ?? false,
    collapsed: overrides.collapsed ?? false,
    locked: overrides.locked ?? false,
    visibility:
      overrides.visibility ?? {
        desktop: true,
        tablet: true,
        mobile: true,
      },
    style: overrides.style ?? {},
    data: overrides.data ?? defaultData(kind),
  };
}

export const DEFAULT_WIDGETS: Widget[] = [
  createWidget("hero", { title: "Design-first dashboard", span: 3 }),
  createWidget("stats", { title: "KPI Overview", span: 2 }),
  createWidget("chart", { title: "Revenue Trend", span: 1 }),
  createWidget("activity", { title: "Activity Feed", span: 1 }),
  createWidget("table", { title: "Release Pipeline", span: 2 }),
  createWidget("testimonial", { title: "What teams say", span: 1 }),
  createWidget("gallery", { title: "Surface Gallery", span: 2 }),
  createWidget("profile", { title: "Designer Profile", span: 1 }),
  createWidget("notes", { title: "Prompt Notes", span: 1 }),
];
