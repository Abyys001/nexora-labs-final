import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import type { ProposalPdfData } from "./proposal-pdf.types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = path.join(dirname, "..", "..", "assets", "fonts");

/**
 * Brand fonts when the asset directory shipped with the build, PDFKit's
 * built-in standard fonts otherwise — `registerFont` never throws on a missing
 * file, it fails later at first use, so existence has to be checked up front.
 */
function resolveFonts(): { body: string; heading: string; mono: string } {
  const file = (name: string, fallback: string): string => {
    const candidate = path.join(fontsDir, name);
    return existsSync(candidate) ? candidate : fallback;
  };
  return {
    body: file("DMSans-Variable.ttf", "Helvetica"),
    heading: file("Boldonse-Regular.ttf", "Helvetica-Bold"),
    mono: file("JetBrainsMono-Variable.ttf", "Courier"),
  };
}

const LIME = "#BFF747";
const BLACK = "#0A0A0A";
const GREY = "#6B7280";
const LIGHT_GREY = "#E5E7EB";

const PLAN_LABELS: Record<string, string> = {
  full: "100% upfront",
  "split-completion": "50% deposit, 50% on completion",
  "split-development": "50% deposit, 50% during development",
};

const MARGIN = 50;
const PHONE = "020 7046 6615";

/** Width of the text column between the page margins. */
function contentWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - MARGIN * 2;
}

/**
 * PDFKit keeps the last `x` it was given, so any positioned or width-constrained
 * `text()` shifts every later flowing call. Every block below starts from the
 * margin explicitly, and this puts the cursor back afterwards.
 */
function resetX(doc: PDFKit.PDFDocument): void {
  doc.x = MARGIN;
}

function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00.000Z`) : value;
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function money(amount: number, currency: string): string {
  const symbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

@Injectable()
export class PdfService {
  /** Resolved once per process; the fonts themselves must be registered on every document. */
  private readonly fonts = resolveFonts();

  async renderProposal(data: ProposalPdfData): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    this.registerFonts(doc);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

    this.coverPage(doc, data);
    doc.addPage();
    this.summarySection(doc, data);
    this.scopeOfWorkSection(doc, data);
    this.scopeSection(doc, data);
    this.featuresSection(doc, data);
    this.pricingSection(doc, data);
    this.scheduleSection(doc, data);
    this.closingSections(doc, data);
    this.paginate(doc);

    doc.end();
    return done;
  }

  /**
   * PDFKit registers fonts per document, not per process — a cached "already
   * registered" flag leaves every document after the first without them.
   */
  private registerFonts(doc: PDFKit.PDFDocument): void {
    doc.registerFont("Body", this.fonts.body);
    doc.registerFont("Heading", this.fonts.heading);
    doc.registerFont("Mono", this.fonts.mono);
  }

  private coverPage(doc: PDFKit.PDFDocument, data: ProposalPdfData): void {
    const bandHeight = 260;
    doc.rect(0, 0, doc.page.width, bandHeight).fill(BLACK);
    doc.rect(0, bandHeight - 6, doc.page.width, 6).fill(LIME);

    doc.fillColor("#FFFFFF").font("Heading").fontSize(30).text("CYBERCINA", MARGIN, 90, { characterSpacing: 1 });
    doc.font("Body").fontSize(12).fillColor(LIME).text("COMMERCIAL PROPOSAL", MARGIN, 140);

    doc.fillColor(BLACK).font("Body").fontSize(11);
    const infoTop = bandHeight + 50;
    const rows: [string, string][] = [
      ["Reference", data.reference],
      ["Client", data.client.name],
      ["Company", data.client.company ?? "—"],
      ["Date", data.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
      ["Valid until", data.validUntil ? formatDate(data.validUntil) : "—"],
    ];
    let y = infoTop;
    for (const [label, value] of rows) {
      doc.font("Mono").fontSize(9).fillColor(GREY).text(label.toUpperCase(), MARGIN, y, { characterSpacing: 0.5 });
      doc.font("Body").fontSize(13).fillColor(BLACK).text(value, MARGIN, y + 14);
      y += 46;
    }
  }

  private sectionTitle(doc: PDFKit.PDFDocument, title: string): void {
    this.ensureSpace(doc, 80);
    doc.moveDown(1.2);
    doc.font("Heading").fontSize(13).fillColor(BLACK).text(title.toUpperCase(), MARGIN, doc.y, { width: contentWidth(doc), characterSpacing: 0.5 });
    const lineY = doc.y + 4;
    doc.moveTo(MARGIN, lineY).lineTo(doc.page.width - MARGIN, lineY).lineWidth(2).strokeColor(LIME).stroke();
    doc.moveDown(1);
    doc.font("Body").fontSize(10.5).fillColor(BLACK);
    resetX(doc);
  }

  private ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
    const bottom = doc.page.height - doc.page.margins.bottom;
    if (doc.y + height > bottom) {
      doc.addPage();
    }
  }

  private bulletList(doc: PDFKit.PDFDocument, items: string[]): void {
    if (items.length === 0) {
      doc.font("Body").fontSize(10.5).fillColor(GREY).text("None specified.", MARGIN, doc.y, { width: contentWidth(doc) });
      resetX(doc);
      return;
    }
    for (const item of items) {
      this.ensureSpace(doc, 20);
      doc.font("Body").fontSize(10.5).fillColor(BLACK).text(`•  ${item}`, MARGIN, doc.y, { width: contentWidth(doc), lineGap: 2 });
    }
    resetX(doc);
  }

  private summarySection(doc: PDFKit.PDFDocument, data: ProposalPdfData): void {
    this.sectionTitle(doc, "Project Summary");
    doc.font("Body").fontSize(10.5).fillColor(BLACK).text(data.summary, MARGIN, doc.y, { width: contentWidth(doc), lineGap: 3 });
    resetX(doc);
  }

  private scopeOfWorkSection(doc: PDFKit.PDFDocument, data: ProposalPdfData): void {
    if (data.scope.length === 0) return;
    this.sectionTitle(doc, "Scope of Work");
    for (const entry of data.scope) {
      this.ensureSpace(doc, 60);
      doc.font("Body").fontSize(11.5).fillColor(BLACK).text(entry.title, MARGIN, doc.y, { width: contentWidth(doc) });
      doc.moveDown(0.2);
      doc.font("Body").fontSize(10.5).fillColor(GREY).text(entry.body, MARGIN, doc.y, { width: contentWidth(doc), lineGap: 2 });
      doc.moveDown(0.7);
    }
    resetX(doc);
  }

  private scopeSection(doc: PDFKit.PDFDocument, data: ProposalPdfData): void {
    this.sectionTitle(doc, "Requirements");
    this.bulletList(doc, data.requirements);
  }

  private featuresSection(doc: PDFKit.PDFDocument, data: ProposalPdfData): void {
    this.sectionTitle(doc, "Feature Breakdown");
    for (const group of data.featuresByKind) {
      if (group.items.length === 0) continue;
      // Keep a group's label, column headers and first row together.
      this.ensureSpace(doc, 80);
      doc.font("Body").fontSize(11).fillColor(BLACK).text(group.label, MARGIN, doc.y, { width: contentWidth(doc) });
      doc.moveDown(0.2);
      this.table(
        doc,
        [
          { header: "Item", width: 380 },
          { header: "Indicative price", width: 100, align: "right" },
        ],
        group.items.map((item) => [item.label, money(item.price, "GBP")]),
      );
      doc.moveDown(0.6);
    }
  }

  private table(
    doc: PDFKit.PDFDocument,
    columns: { header: string; width: number; align?: "left" | "right" }[],
    rows: string[][],
  ): void {
    const rowHeight = 20;
    const startX = MARGIN;
    const drawHeader = () => {
      this.ensureSpace(doc, rowHeight + 4);
      const y = doc.y;
      doc.font("Mono").fontSize(8.5).fillColor(GREY);
      let x = startX;
      for (const col of columns) {
        doc.text(col.header.toUpperCase(), x, y, { width: col.width, align: col.align ?? "left" });
        x += col.width;
      }
      resetX(doc);
      doc.moveDown(0.6);
      doc.moveTo(startX, doc.y).lineTo(startX + columns.reduce((s, c) => s + c.width, 0), doc.y).strokeColor(LIGHT_GREY).lineWidth(1).stroke();
      doc.moveDown(0.3);
    };

    drawHeader();
    for (const row of rows) {
      this.ensureSpace(doc, rowHeight);
      const y = doc.y;
      let x = startX;
      doc.font("Body").fontSize(10).fillColor(BLACK);
      row.forEach((cell, i) => {
        const col = columns[i];
        doc.text(cell, x, y, { width: col.width, align: col.align ?? "left" });
        x += col.width;
      });
      resetX(doc);
      doc.moveDown(0.9);
    }
    resetX(doc);
  }

  private pricingSection(doc: PDFKit.PDFDocument, data: ProposalPdfData): void {
    this.sectionTitle(doc, "Pricing");

    this.ensureSpace(doc, 60);
    doc.font("Mono").fontSize(9).fillColor(GREY).text("AUTOMATED ESTIMATE (INDICATIVE)", MARGIN, doc.y, { width: contentWidth(doc) });
    doc.font("Body").fontSize(16).fillColor(BLACK).text(money(data.automatedEstimateGbp, "GBP"), MARGIN, doc.y, { width: contentWidth(doc) });
    doc.moveDown(0.6);

    if (data.finalPriceGbp !== null) {
      doc.font("Mono").fontSize(9).fillColor(GREY).text("FINAL COMMERCIAL PRICE", MARGIN, doc.y, { width: contentWidth(doc) });
      doc.font("Heading").fontSize(20).fillColor(BLACK).text(money(data.finalPriceGbp, "GBP"), MARGIN, doc.y, { width: contentWidth(doc) });
      if (data.currency !== "GBP" && data.amountInCurrency !== null && data.exchangeRate !== null) {
        doc
          .font("Body")
          .fontSize(10)
          .fillColor(GREY)
          .text(
            `${money(data.amountInCurrency, data.currency)} at a rate of 1 GBP = ${data.exchangeRate.toFixed(4)} ${data.currency}`,
            MARGIN,
            doc.y,
            { width: contentWidth(doc) },
          );
      }
    } else {
      doc.font("Body").fontSize(11).fillColor(GREY).text("Final commercial price to be confirmed.", MARGIN, doc.y, { width: contentWidth(doc) });
    }
    resetX(doc);
    doc.moveDown(0.8);
  }

  private scheduleSection(doc: PDFKit.PDFDocument, data: ProposalPdfData): void {
    this.sectionTitle(doc, "Payment Plan");
    if (!data.paymentPlan) {
      doc.font("Body").fontSize(10.5).fillColor(GREY).text("Payment plan to be chosen by the client.", MARGIN, doc.y, { width: contentWidth(doc) });
      resetX(doc);
      return;
    }
    doc.font("Body").fontSize(11).fillColor(BLACK).text(`Plan: ${PLAN_LABELS[data.paymentPlan.plan] ?? data.paymentPlan.plan}`, MARGIN, doc.y, { width: contentWidth(doc) });
    resetX(doc);
    doc.moveDown(0.4);

    // The converted column only earns its place when the client is not billed in GBP.
    const showCurrency = data.currency !== "GBP";
    this.table(
      doc,
      showCurrency
        ? [
            { header: "Instalment", width: 200 },
            { header: "Due", width: 130 },
            { header: "Amount (GBP)", width: 90, align: "right" as const },
            { header: `In ${data.currency}`, width: 75, align: "right" as const },
          ]
        : [
            { header: "Instalment", width: 250 },
            { header: "Due", width: 145 },
            { header: "Amount", width: 100, align: "right" as const },
          ],
      data.paymentPlan.items.map((item) =>
        showCurrency
          ? [item.label, formatDate(item.dueDate), money(item.amountGbp, "GBP"), item.amountInCurrency !== null ? money(item.amountInCurrency, data.currency) : "—"]
          : [item.label, formatDate(item.dueDate), money(item.amountGbp, "GBP")],
      ),
    );

    if (data.timelineLabel) {
      doc.moveDown(0.6);
      doc.font("Body").fontSize(10.5).fillColor(BLACK).text(`Delivery timeline: ${data.timelineLabel}`, MARGIN, doc.y, { width: contentWidth(doc) });
      resetX(doc);
    }
  }

  private closingSections(doc: PDFKit.PDFDocument, data: ProposalPdfData): void {
    this.sectionTitle(doc, "Assumptions");
    this.bulletList(doc, data.assumptions);

    this.sectionTitle(doc, "Exclusions");
    this.bulletList(doc, data.exclusions);

    this.sectionTitle(doc, "Next Steps");
    this.bulletList(doc, data.nextSteps);
  }

  private paginate(doc: PDFKit.PDFDocument): void {
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const bottom = doc.page.height - 30;
      doc.font("Mono").fontSize(8).fillColor(GREY);
      doc.text(PHONE, MARGIN, bottom, { width: 200, align: "left", lineBreak: false });
      doc.text(`${i + 1} / ${range.count}`, doc.page.width - MARGIN - 100, bottom, { width: 100, align: "right", lineBreak: false });
    }
  }
}
