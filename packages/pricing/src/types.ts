export type ItemKind =
  | "solution"
  | "feature"
  | "platform"
  | "integration"
  | "ai"
  | "design"
  | "support"
  | "maintenance";

export type Complexity = "s" | "m" | "l" | "xl";

/** Currency amount rounding step. "none" keeps two decimal places. */
export type Rounding = "none" | 1 | 10 | 50 | 100;

export type PricingItem = {
  id: string;
  kind: ItemKind;
  categoryId: string;
  label: string;
  blurb: string;
  icon: string;
  price: number;
  complexity: Complexity;
  recommends: string[];
  requires: string[];
  addons: string[];
  active: boolean;
  sort: number;
};

export type PricingCategory = {
  id: string;
  label: string;
  icon: string;
  sort: number;
};

export type Multiplier = {
  id: string;
  label: string;
  description: string;
  multiplier: number;
  sort: number;
};

export type TimelineOption = Multiplier & { weeks: number };

export type PricingSettings = {
  additionalSolutionFactor: number;
  rangeLow: number;
  rangeHigh: number;
  roundTo: number;
};

export type PricingCatalog = {
  version: string;
  items: PricingItem[];
  categories: PricingCategory[];
  complexity: Multiplier[];
  timelines: TimelineOption[];
  scale: Multiplier[];
  settings: PricingSettings;
};

export type Selection = {
  solutionTypes: string[];
  features: string[];
  platforms: string[];
  integrations: string[];
  ai: string[];
  design: string[];
  support?: string;
  maintenance?: string;
  complexity: string;
  timeline: string;
  userScale?: string;
};

export type EstimateLine = {
  key: string;
  label: string;
  amount: number;
  detail?: string;
};

export type EstimateAdjustment = {
  key: "complexity" | "scale" | "timeline";
  label: string;
  multiplier: number;
  amount: number;
  reason: string;
};

export type Estimate = {
  catalogVersion: string;
  lines: EstimateLine[];
  subtotal: number;
  adjustments: EstimateAdjustment[];
  total: number;
  range: { low: number; high: number };
  monthly: { support: number; maintenance: number };
};

export type ScheduleStatus =
  | "scheduled"
  | "awaiting"
  | "paid"
  | "partially-paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export type RequestPaymentStatus =
  | "not-started"
  | "awaiting-payment"
  | "partially-paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export type PaymentPlanKind = "full" | "split-completion" | "split-development";

export type CurrencyContext = { rate: number; rounding: Rounding };

export type ScheduleInput = {
  plan: PaymentPlanKind;
  totalGbp: number;
  acceptanceDate: Date | string;
  timelineWeeks: number;
  secondDueDate?: Date | string;
  currency?: CurrencyContext;
};

export type ScheduleItem = {
  sequence: number;
  label: string;
  amountGbp: number;
  amountInCurrency?: number;
  dueDate: string;
};
