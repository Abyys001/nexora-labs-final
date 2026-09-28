export interface ProposalPdfLineItem {
  label: string;
  price: number;
}

export interface ProposalPdfScheduleItem {
  label: string;
  amountGbp: number;
  amountInCurrency: number | null;
  dueDate: string;
}

export interface ProposalPdfData {
  reference: string;
  client: { name: string; company: string | null; email: string };
  createdAt: Date;
  validUntil: string | null;
  summary: string;
  scope: { title: string; body: string }[];
  requirements: string[];
  featuresByKind: { kind: string; label: string; items: ProposalPdfLineItem[] }[];
  automatedEstimateGbp: number;
  finalPriceGbp: number | null;
  currency: string;
  exchangeRate: number | null;
  amountInCurrency: number | null;
  paymentPlan: { plan: string; items: ProposalPdfScheduleItem[] } | null;
  timelineLabel: string | null;
  assumptions: string[];
  exclusions: string[];
  nextSteps: string[];
}
