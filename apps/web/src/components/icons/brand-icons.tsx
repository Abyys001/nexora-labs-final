// GENERATED FILE — do not edit by hand.
// Source of truth: engineering-kit/assets/icons/cybercina (generate-icons.mjs
// defines the icons, build-tsx.mjs emits this file). To change an icon,
// edit the kit and run: node assets/icons/cybercina/build-tsx.mjs
import type { ReactElement, SVGProps } from "react";

export const industryIconNames = ["automotive", "aviation", "banking-payments", "construction", "currency-exchange", "ecommerce-retail", "education", "energy-utilities", "enterprise", "finance", "fintech", "food-beverage", "healthcare", "logistics", "media-entertainment", "mortgage-lending", "oil-gas", "other", "professional-services", "publishing", "real-estate", "retail-fmcg", "sme", "sports", "startups", "travel-hospitality"] as const;
export const serviceIconNames = ["ai-machine-learning", "analytics", "api-integrations", "automation", "cloud", "crm", "cybersecurity", "data-engineering", "devops", "digital-transformation", "ecommerce", "mobile-development", "saas", "software-development", "ui-ux", "web-development"] as const;

export type BrandIconName =
  | (typeof industryIconNames)[number]
  | (typeof serviceIconNames)[number];

const ICON_PATHS: Record<BrandIconName, ReactElement> = {
  "automotive": (
    <>
        <path d="M8 30 L11 21 C12 18 15 16 18 16 L30 16 C33 16 36 18 37 21 L40 30" />
          <rect x="6" y="28" width="36" height="8" rx="3" />
          <circle cx="15" cy="36" r="3" />
          <circle cx="33" cy="36" r="3" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M4 22 L8 22" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M4 27 L7 27" />
          <rect className="i-pulse" x="27.5" y="18.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "aviation": (
    <>
        <path d="M6 26 L36 26 L42 22 L42 26 L36 30 L6 30 Z" />
          <path d="M16 26 L10 16 L15 16 L22 26" />
          <path d="M16 26 L10 36 L15 36 L22 26" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M4 28 L14 28" />
          <rect className="i-pulse" x="38.5" y="19.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "banking-payments": (
    <>
        <rect x="6" y="12" width="36" height="24" rx="3" />
          <line x1="6" y1="19" x2="42" y2="19" />
          <g className="i-scan">
          <path d="M32 26 C34 28 34 31 32 33" />
          <path d="M35 23 C39 27 39 32 35 36" />
          </g>
          <rect className="i-pulse" x="10" y="25" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "construction": (
    <>
        <line x1="6" y1="40" x2="18" y2="40" />
          <line x1="12" y1="40" x2="12" y2="8" />
          <line x1="12" y1="10" x2="40" y2="10" />
          <line x1="12" y1="17" x2="24" y2="10" />
          <g className="i-shift">
          <line x1="34" y1="10" x2="34" y2="26" />
          </g>
          <rect className="i-shift" x="31" y="26" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "currency-exchange": (
    <>
        <circle cx="14" cy="24" r="6" />
          <circle cx="34" cy="24" r="6" />
          <g className="i-orbit">
          <path d="M16 14 C24 8 32 10 36 18" />
          <path d="M12 30 C16 38 24 40 32 34" />
          </g>
          <rect className="i-pulse" x="21" y="21" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "ecommerce-retail": (
    <>
        <path className="i-draw" pathLength="1" strokeDasharray="1" d="M8 12 C10 8 14 8 16 12 C18 8 22 8 24 12 C26 8 30 8 32 12 C34 8 38 8 40 12" />
          <g className="i-shift">
          <path d="M10 18 L15 18 L19 33 L36 33 L40 20 L17 20" />
          <circle cx="21" cy="39" r="2.5" />
          <circle cx="34" cy="39" r="2.5" />
          </g>
          <rect className="i-pulse" x="25.5" y="23.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "education": (
    <>
        <path d="M6 18 L24 10 L42 18 L24 26 Z" />
          <path d="M14 21 L14 32 C14 35 34 35 34 32 L34 21" />
          <g className="i-shift">
          <line x1="42" y1="18" x2="42" y2="30" />
          </g>
          <rect className="i-pulse" x="39.5" y="29.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "energy-utilities": (
    <>
        <circle cx="24" cy="24" r="16" />
          <path className="i-pulse" d="M26 10 L16 26 L23 26 L21 38 L33 20 L25 20 Z" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "enterprise": (
    <>
        <rect x="6" y="26" width="8" height="14" rx="2" />
          <rect x="18" y="14" width="10" height="26" rx="2" />
          <rect x="32" y="20" width="8" height="20" rx="2" />
          <line x1="23" y1="14" x2="23" y2="8" />
          <g className="i-scan">
          <line x1="6" y1="30" x2="40" y2="30" />
          </g>
          <rect className="i-pulse" x="20.5" y="5.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "finance": (
    <>
        <line x1="8" y1="40" x2="8" y2="8" />
          <line x1="8" y1="40" x2="42" y2="40" />
          <path className="i-draw" pathLength="1" strokeDasharray="1" d="M12 32 L20 24 L28 30 L38 14" />
          <rect className="i-pulse" x="35" y="11" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "fintech": (
    <>
        <circle cx="24" cy="24" r="16" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M12 20 L20 20 L20 28 L28 28 L28 32 L36 32" />
          <rect className="i-pulse" x="17.5" y="17.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "food-beverage": (
    <>
        <path d="M12 18 L12 32 C12 37 36 37 36 32 L36 18 Z" />
          <path d="M36 20 L40 20 C42 20 42 28 36 28" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M18 14 C18 11 21 11 21 8" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M27 14 C27 11 30 11 30 8" />
          <rect className="i-pulse" x="21" y="24" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "healthcare": (
    <>
        <path d="M24 38 C10 29 8 20 14 15 C18 12 23 13 24 18 C25 13 30 12 34 15 C40 20 38 29 24 38 Z" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M14 24 L19 24 L22 18 L26 30 L29 24 L34 24" />
          <rect className="i-pulse" x="16.5" y="21.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "logistics": (
    <>
        <rect x="6" y="16" width="22" height="16" rx="3" />
          <path d="M28 22 L36 22 L40 26 L40 32 L28 32" />
          <circle cx="14" cy="36" r="3" />
          <circle cx="34" cy="36" r="3" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M6 12 L18 12" />
          <rect className="i-pulse" x="3.5" y="9.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "media-entertainment": (
    <>
        <circle cx="24" cy="24" r="16" />
          <path className="i-pulse" d="M20 16 L32 24 L20 32 Z" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "mortgage-lending": (
    <>
        <path d="M8 24 L24 10 L40 24" />
          <path d="M13 22 L13 40 L35 40 L35 22" />
          <circle cx="30" cy="15" r="3" />
          <line x1="32.1" y1="17.1" x2="36" y2="21" />
          <rect className="i-pulse" x="21" y="29" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "oil-gas": (
    <>
        <path d="M24 8 L14 34 L34 34 Z" />
          <line x1="10" y1="34" x2="38" y2="34" />
          <line x1="24" y1="34" x2="24" y2="40" />
          <g className="i-shift">
          <path d="M24 16 C21 20 21 23 24 24 C27 23 27 20 24 16 Z" fill="var(--icon-accent, currentColor)" stroke="none" />
          </g>
    </>
  ),
  "other": (
    <>
        <rect x="8" y="8" width="14" height="14" rx="3" />
          <rect x="26" y="8" width="14" height="14" rx="3" />
          <rect x="8" y="26" width="14" height="14" rx="3" />
          <rect className="i-pulse" x="26" y="26" width="14" height="14" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "professional-services": (
    <>
        <rect x="8" y="20" width="20" height="16" rx="3" />
          <path d="M14 20 L14 16 C14 14 16 13 18 13 C20 13 22 14 22 16 L22 20" />
          <rect x="26" y="12" width="14" height="22" rx="2" />
          <g className="i-scan">
          <line x1="29" y1="18" x2="37" y2="18" />
          </g>
          <rect className="i-pulse" x="15.5" y="25.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "publishing": (
    <>
        <path d="M24 12 C20 9 12 9 8 11 L8 36 C12 34 20 34 24 37 C28 34 36 34 40 36 L40 11 C36 9 28 9 24 12 Z" />
          <line x1="24" y1="12" x2="24" y2="37" />
          <rect className="i-shift" x="30.5" y="14.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "real-estate": (
    <>
        <rect x="10" y="12" width="28" height="28" rx="3" />
          <line x1="10" y1="24" x2="38" y2="24" />
          <line x1="24" y1="12" x2="24" y2="40" />
          <line x1="20" y1="30" x2="20" y2="36" />
          <line x1="28" y1="30" x2="28" y2="36" />
          <rect className="i-pulse" x="28" y="15" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "retail-fmcg": (
    <>
        <path d="M12 16 L16 8 L32 8 L36 16" />
          <rect x="9" y="16" width="30" height="24" rx="3" />
          <line x1="17" y1="24" x2="17" y2="34" />
          <line x1="22" y1="24" x2="22" y2="34" />
          <line x1="28" y1="24" x2="28" y2="34" />
          <line x1="33" y1="24" x2="33" y2="34" />
          <g className="i-scan">
          <line x1="9" y1="29" x2="39" y2="29" />
          </g>
    </>
  ),
  "sme": (
    <>
        <path d="M8 20 L24 10 L40 20" />
          <rect x="10" y="20" width="28" height="20" rx="2" />
          <rect x="21" y="28" width="6" height="12" rx="1" />
          <g className="i-shift">
          <circle cx="15" cy="34" r="2" />
          <line x1="15" y1="36" x2="15" y2="40" />
          <circle cx="33" cy="34" r="2" />
          <line x1="33" y1="36" x2="33" y2="40" />
          </g>
          <rect className="i-blink" x="29" y="23" width="4" height="4" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "sports": (
    <>
        <path d="M16 10 L32 10 L32 20 C32 27 28 30 24 30 C20 30 16 27 16 20 Z" />
          <path d="M16 13 L10 13 L10 18 C10 21 13 22 16 21" />
          <path d="M32 13 L38 13 L38 18 C38 21 35 22 32 21" />
          <line x1="24" y1="30" x2="24" y2="35" />
          <line x1="17" y1="39" x2="31" y2="39" />
          <line x1="24" y1="35" x2="24" y2="39" />
          <rect className="i-pulse" x="21" y="15" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "startups": (
    <>
        <path d="M24 6 C30 10 32 18 30 28 L18 28 C16 18 18 10 24 6 Z" />
          <path d="M18 28 L12 34 L18 32 Z" />
          <path d="M30 28 L36 34 L30 32 Z" />
          <circle cx="24" cy="17" r="3" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M10 40 C14 30 18 24 22 20" />
          <path className="i-pulse" d="M21 30 C21 35 24 40 24 40 C24 40 27 35 27 30 Z" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "travel-hospitality": (
    <>
        <circle cx="24" cy="24" r="16" />
          <g className="i-orbit">
          <path d="M24 24 L30 14 L26 26 L24 24 L18 34 Z" />
          </g>
          <rect className="i-pulse" x="21.5" y="21.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "ai-machine-learning": (
    <>
        <circle cx="12" cy="14" r="2" />
          <circle cx="12" cy="34" r="2" />
          <circle cx="36" cy="14" r="2" />
          <circle cx="36" cy="34" r="2" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M12 14 L24 24 L12 34" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M36 14 L24 24 L36 34" />
          <rect className="i-pulse" x="20.5" y="20.5" width="7" height="7" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "analytics": (
    <>
        <line x1="8" y1="40" x2="8" y2="8" />
          <line x1="8" y1="40" x2="42" y2="40" />
          <rect x="13" y="28" width="5" height="12" rx="2" />
          <rect x="23" y="20" width="5" height="20" rx="2" />
          <rect x="33" y="12" width="5" height="28" rx="2" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M15 28 L25 20 L35 12" />
          <rect className="i-pulse" x="32" y="9" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "api-integrations": (
    <>
        <path d="M14 20 L14 12 L22 12 L22 20" />
          <path d="M34 28 L34 36 L26 36 L26 28" />
          <rect x="8" y="20" width="12" height="8" rx="3" />
          <rect x="28" y="20" width="12" height="8" rx="3" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M20 24 L28 24" />
          <rect className="i-pulse" x="21.5" y="21.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "automation": (
    <>
        <rect x="6" y="18" width="10" height="10" rx="3" />
          <rect x="32" y="18" width="10" height="10" rx="3" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M16 23 L32 23" />
          <path className="i-draw" pathLength="1" strokeDasharray="1" d="M27 18 L32 23 L27 28" />
          <rect className="i-pulse" x="21.5" y="5.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "cloud": (
    <>
        <path d="M16 32 C10 32 8 28 8 25 C8 21 11 18 15 18 C16 13 20 10 25 10 C31 10 35 14 35 20 C39 20 41 23 41 27 C41 30 38 32 35 32 Z" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M18 25 L24 20 L30 25" />
          <rect className="i-pulse" x="21.5" y="17.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "crm": (
    <>
        <circle cx="24" cy="10" r="3" />
          <circle cx="10" cy="34" r="3" />
          <circle cx="38" cy="34" r="3" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M24 13 L10 31" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M24 13 L38 31" />
          <rect className="i-pulse" x="21" y="21" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "cybersecurity": (
    <>
        <path d="M24 6 L38 11 L38 24 C38 33 32 39 24 42 C16 39 10 33 10 24 L10 11 Z" />
          <g className="i-scan">
          <line x1="13" y1="24" x2="35" y2="24" />
          </g>
          <rect className="i-pulse" x="21" y="21" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "data-engineering": (
    <>
        <rect x="6" y="30" width="6" height="10" rx="2" />
          <rect x="16" y="22" width="6" height="18" rx="2" />
          <rect x="26" y="14" width="6" height="26" rx="2" />
          <path className="i-flow" pathLength="1" strokeDasharray="1" d="M9 30 L19 22 L29 14 L39 8" />
          <rect className="i-pulse" x="36" y="5" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "devops": (
    <>
        <circle cx="17" cy="24" r="9" />
          <circle className="i-flow" pathLength="1" strokeDasharray="1" cx="31" cy="24" r="9" />
          <rect className="i-pulse" x="21.5" y="21.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "digital-transformation": (
    <>
        <rect x="6" y="18" width="12" height="12" rx="3" />
          <g className="i-shift">
          <line x1="20" y1="24" x2="30" y2="24" />
          <path d="M26 19 L30 24 L26 29" />
          </g>
          <line x1="34" y1="12" x2="34" y2="16" />
          <line x1="34" y1="32" x2="34" y2="36" />
          <line x1="30" y1="16" x2="34" y2="16" />
          <line x1="34" y1="16" x2="38" y2="16" />
          <rect className="i-pulse" x="30.5" y="20.5" width="7" height="7" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "ecommerce": (
    <>
        <path d="M12 16 L16 8 L32 8 L36 16" />
          <rect x="9" y="16" width="30" height="24" rx="3" />
          <rect className="i-pulse" x="21" y="24" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "mobile-development": (
    <>
        <rect x="15" y="6" width="18" height="36" rx="3" />
          <g className="i-shift">
          <line x1="19" y1="14" x2="29" y2="14" />
          <line x1="19" y1="20" x2="26" y2="20" />
          <line x1="19" y1="26" x2="29" y2="26" />
          </g>
          <rect className="i-pulse" x="21.5" y="31.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "saas": (
    <>
        <rect x="12" y="20" width="26" height="16" rx="3" />
          <g className="i-shift">
          <rect x="9" y="15" width="26" height="16" rx="3" />
          </g>
          <rect x="6" y="10" width="26" height="16" rx="3" />
          <rect className="i-pulse" x="6.5" y="10.5" width="5" height="5" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "software-development": (
    <>
        <path className="i-draw" pathLength="1" strokeDasharray="1" d="M19 9 L8 24 L19 39" />
          <path className="i-draw" pathLength="1" strokeDasharray="1" d="M29 9 L40 24 L29 39" />
          <rect className="i-blink" x="21" y="21" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "ui-ux": (
    <>
        <rect x="8" y="8" width="32" height="32" rx="3" />
          <path d="M18 30 L18 24 L30 12 L36 18 L24 30 Z" />
          <rect className="i-pulse" x="32" y="10" width="6" height="6" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
  "web-development": (
    <>
        <rect x="6" y="10" width="36" height="28" rx="3" />
          <line x1="6" y1="17" x2="42" y2="17" />
          <circle cx="24" cy="29" r="7" />
          <g className="i-shift">
          <line x1="24" y1="24" x2="24" y2="16" />
          </g>
          <rect className="i-pulse" x="9" y="11.5" width="4" height="4" rx="3" fill="var(--icon-accent, currentColor)" stroke="none" />
    </>
  ),
};

export interface BrandIconProps extends SVGProps<SVGSVGElement> {
  name: BrandIconName;
  title?: string;
}

/**
 * Cybercina brand icon. Renders aria-hidden unless `title` is given.
 * Pair with a `.group` ancestor (or `[data-active]` / `.icon-live`) and
 * set `--icon-accent` to drive the icon's motion + lime accent — see
 * engineering-kit/assets/icons/cybercina/icons.css.
 */
export function BrandIcon({ name, title, className, ...props }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {ICON_PATHS[name]}
    </svg>
  );
}
