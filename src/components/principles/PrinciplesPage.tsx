"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Bot,
  BookOpen,
  Layers,
  Users,
  GitBranch,
  Crown,
  MessageSquareQuote,
  Target,
  Radar,
  Image as ImageIcon,
  ExternalLink,
  BadgeCheck,
  Maximize2,
  MonitorPlay,
  Plug,
  ShieldCheck,
  MessageSquare,
  Cog,
  GitCompare,
  ListChecks,
  BellRing,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContentMapGraph } from "@/components/principles/ContentMapGraph";
import { cn } from "@/lib/utils";

/**
 * GitHub Pages project-site base path. Plain <img> tags do NOT get Next's
 * `basePath` auto-applied (only next/link and next/image do), so wireframe /
 * screenshot sources are prefixed manually to resolve under
 * https://vaesposito.github.io/tome-ux-principles/.
 */
const BASE_PATH = "/tome-ux-principles";
const asset = (p: string) => (p.startsWith("/") ? `${BASE_PATH}${p}` : p);

/**
 * Webex brand glyph. Duplicated as a small inline SVG (rather than imported
 * from ProjectWiki, where it is a private helper) so this page stays
 * self-contained and does not modify the wiki components. Uses
 * `fill="currentColor"` so it inherits the surrounding text color.
 */
function WebexGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M21.78 7.376c.512 1.181.032 2.644-1.11 3.106-2.157.888-3-1.295-3-1.295-.236-.55-.727-1.496-1.335-1.496-.204 0-.503 0-.94.844-.229.443-.434 1.185-.616 1.84l-.09.32c-.373-1.587-.821-3.454-1.536-4.816-.195-.38-.42-.74-.673-1.08a5.135 5.135 0 0 1 1.743-1.337 4.891 4.891 0 0 1 2.112-.463c1.045 0 2.765.338 4.227 2.227.167.206.317.424.448.654.278.441.52.904.726 1.383l.043.113zM.02 8.4C-.15 7.105.8 5.845 1.953 5.755c1.794-.157 2.36 1.385 2.455 1.89l.022.137c.07.44.29 1.838.48 2.744.078.4.244 1.013.353 1.416l.006.022.026.092c.11.4.232.799.362 1.193.185.548.399 1.085.641 1.61.47.955.93 1.45 1.367 1.45.203 0 .512 0 .96-.878.283-.59.512-1.208.684-1.845.373 1.598.811 3.128 1.495 4.456.205.406.444.794.715 1.16a5.124 5.124 0 0 1-1.742 1.338 4.88 4.88 0 0 1-2.112.461c-1.548 0-3.727-.698-5.339-4.005a22.407 22.407 0 0 1-1.078-2.824 26.848 26.848 0 0 1-.693-2.656 48.56 48.56 0 0 1-.215-1.114C.191 9.603.074 8.872.02 8.4zm22.047-2.645-.202-.022h-.052c.222.392.421.797.597 1.215l.053.113c.322.76.346 1.614.068 2.391a3.079 3.079 0 0 1-1.552 1.749 2.93 2.93 0 0 1-1.228.28 3.115 3.115 0 0 1-.854-.135c-.299 1.182-.768 2.634-1.195 3.511-.427.877-.93 1.451-1.378 1.451-.192 0-.501 0-.95-.877a10.746 10.746 0 0 1-.683-1.845 38.722 38.722 0 0 1-.396-1.575 12.67 12.67 0 0 1-.136-.598l-.002-.01c-.406-1.778-.865-3.645-1.655-5.142A8.263 8.263 0 0 0 11.52 4.8a5.136 5.136 0 0 0-1.748-1.34A4.892 4.892 0 0 0 7.654 3c-1.036 0-2.754.338-4.217 2.228.466.223.867.562 1.164.984.305.433.499.933.565 1.458.076.563.256 1.654.47 2.688l.001.007c.021.11.042.221.073.342.126-.34.25-.642.38-.955l.112-.271.128-.293c.235-.55.726-1.496 1.324-1.496.213 0 .513 0 .95.844.296.606.532 1.239.706 1.89.138.507.276 1.047.394 1.587.04.148.07.296.101.444l.006.028c.427 1.879.875 3.69 1.644 5.187.159.317.34.622.545.911.15.215.31.422.48.62 1.27 1.45 2.733 1.8 3.843 1.8 1.548 0 3.738-.698 5.35-4.006.822-1.7 1.515-4.208 1.772-5.48.256-1.27.449-2.419.534-3.115.04-.307.023-.618-.051-.918-.075-.299-.205-.579-.382-.825a2.247 2.247 0 0 0-.653-.607 2.143 2.143 0 0 0-.826-.296z" />
    </svg>
  );
}

/** A small labelled "source" chip used in the ingest → agent → wiki flow. */
function SourceChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm">
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </div>
  );
}

// ─── Persona matrix data ─────────────────────────────────────────────
export type PersonaAccent = "indigo" | "teal" | "amber";

export interface Persona {
  key: string;
  title: string;
  subtitle: string;
  accent: PersonaAccent;
  Icon: React.ComponentType<{ className?: string }>;
  need: string;
  scope: string;
}

export const PERSONAS: Persona[] = [
  {
    key: "internal",
    title: "Internal team",
    subtitle: "Dev · Arch · Product · Design · BizDev · Marketing · PM",
    accent: "indigo",
    Icon: Users,
    need: "Shared awareness of what changed, what is blocked, and what each function should do next.",
    scope: "Full signal view across all functions",
  },
  {
    key: "complementary",
    title: "Complementary teams",
    subtitle: "Adjacent delivery teams",
    accent: "teal",
    Icon: GitBranch,
    need: "Dependency clarity — what interfaces, timelines, or directions are changing that affect their work.",
    scope:
      "Interface-scoped — only what touches shared APIs, timelines, or deliverables",
  },
  {
    key: "executive",
    title: "Executive leadership",
    subtitle: "Sponsors · Stakeholders",
    accent: "amber",
    Icon: Crown,
    need: "Confidence that teams know what they are doing and are progressing against commitments.",
    scope:
      "Outcome-scoped — commitments, KPIs, key risks, decisions needing input",
  },
];

const ACCENT_STYLES: Record<
  PersonaAccent,
  {
    header: string;
    iconWrap: string;
    icon: string;
    title: string;
    pill: string;
    ring: string;
    dot: string;
  }
> = {
  indigo: {
    header:
      "bg-gradient-to-br from-indigo-500/15 to-violet-500/10 border-b border-indigo-500/25",
    iconWrap: "bg-indigo-500/15 border border-indigo-500/30",
    icon: "text-indigo-300",
    title: "text-indigo-200",
    pill: "bg-indigo-500/10 border-indigo-500/25 text-indigo-100/90",
    ring: "hover:border-indigo-500/40",
    dot: "bg-indigo-400",
  },
  teal: {
    header:
      "bg-gradient-to-br from-teal-500/15 to-emerald-500/10 border-b border-teal-500/25",
    iconWrap: "bg-teal-500/15 border border-teal-500/30",
    icon: "text-teal-300",
    title: "text-teal-200",
    pill: "bg-teal-500/10 border-teal-500/25 text-teal-100/90",
    ring: "hover:border-teal-500/40",
    dot: "bg-teal-400",
  },
  amber: {
    header:
      "bg-gradient-to-br from-amber-500/15 to-orange-700/10 border-b border-amber-500/25",
    iconWrap: "bg-amber-500/15 border border-amber-500/30",
    icon: "text-amber-300",
    title: "text-amber-200",
    pill: "bg-amber-500/10 border-amber-500/25 text-amber-100/90",
    ring: "hover:border-amber-500/40",
    dot: "bg-amber-400",
  },
};

/** A muted uppercase row label shared across persona rows. */
function RowLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      <span className="text-muted-foreground/70">{icon}</span>
      {children}
    </div>
  );
}

function PersonaCard({ persona, index }: { persona: Persona; index: number }) {
  const s = ACCENT_STYLES[persona.accent];
  const { Icon } = persona;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-colors",
        s.ring,
      )}
    >
      {/* Colored header */}
      <div className={cn("flex items-start gap-3 p-5", s.header)}>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            s.iconWrap,
          )}
        >
          <Icon className={cn("h-5 w-5", s.icon)} />
        </div>
        <div className="min-w-0">
          <h3 className={cn("text-base font-bold leading-tight", s.title)}>
            {persona.title}
          </h3>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {persona.subtitle}
          </p>
        </div>
      </div>

      {/* Body rows */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <RowLabel icon={<Target className="h-3 w-3" />}>Need</RowLabel>
          <p className="text-sm leading-relaxed text-foreground/90">
            {persona.need}
          </p>
        </div>

        <div className="space-y-1.5">
          <RowLabel icon={<Radar className="h-3 w-3" />}>Scope</RowLabel>
          <p className="text-sm leading-relaxed text-foreground/90">
            {persona.scope}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Wireframe gallery data ──────────────────────────────────────────
interface Wireframe {
  src: string;
  title: string;
  caption: string;
}

const BROWSING_WIREFRAMES: Wireframe[] = [
  {
    src: "/wireframes/projects-hub.png",
    title: "Projects hub",
    caption:
      "Browse every initiative and switch context instantly. Filter by BHAG, swimlane, status, and type, with an always-on assistant that answers questions about any project. The entry point for wider teams building a map of Outshift work.",
  },
  {
    src: "/wireframes/projects-grouped.png",
    title: "Projects grouped by dimension",
    caption:
      "The same hub collapsed into BHAGs or swimlanes, so leadership and complementary teams can scan initiatives by strategic goal instead of one project at a time.",
  },
];

const PROJECT_WIREFRAMES: Wireframe[] = [
  {
    src: "/wireframes/overview-general.png",
    title: "Project overview — General",
    caption:
      "The shared baseline: source connections (GitHub, Jira), key dates, milestone progress, and latest artifacts at a glance.",
  },
  {
    src: "/wireframes/overview-team.png",
    title: "Project overview — Team",
    caption:
      "The internal team's operating picture: conflicts, pending actions and decisions, per-person updates, latest meetings, and artifacts.",
  },
  {
    src: "/wireframes/overview-leadership.png",
    title: "Project overview — Leadership (SLT)",
    caption:
      "The executive lens: milestone completion, KPIs, and a market-fit radar that tie day-to-day progress back to strategic goals.",
  },
];

/**
 * A wireframe screenshot card that opens the full-size screenshot in a modal
 * lightbox. The clickable surface is a native `<button>` (via Radix
 * `DialogTrigger asChild`), so Enter/Space, focus-visible rings, and screen
 * reader semantics come for free; the Radix `Dialog` handles Escape, backdrop
 * click, focus restore, body scroll lock, and the close button.
 *
 * The screenshots are light-themed, so the image sits inside a subtle bordered
 * frame with a light backdrop. `width`/`height` reserve a ~3:2 box to avoid
 * layout shift while the lazy thumbnail loads.
 */
function WireframeCard({
  wireframe,
  index,
}: {
  wireframe: Wireframe;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`Expand wireframe: ${wireframe.title}`}
            className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="relative border-b border-border bg-muted/30 p-3">
              <div className="overflow-hidden rounded-lg border border-border bg-white/95">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(wireframe.src)}
                  alt={`Wireframe: ${wireframe.title}`}
                  width={1512}
                  height={1008}
                  loading="lazy"
                  className="h-auto w-full"
                  style={{ aspectRatio: "3 / 2" }}
                />
              </div>
              {/* Hover cue: expand */}
              <span className="pointer-events-none absolute right-5 top-5 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 className="h-3 w-3" />
                Expand
              </span>
            </div>
            <div className="flex flex-col gap-1.5 p-5">
              <h4 className="text-sm font-bold text-foreground">
                {wireframe.title}
              </h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {wireframe.caption}
              </p>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-4 sm:p-6">
          <DialogTitle className="pr-8 text-base">{wireframe.title}</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            {wireframe.caption}
          </DialogDescription>
          <div className="max-h-[74vh] overflow-auto rounded-lg border border-border bg-white/95">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(wireframe.src)}
              alt={`Wireframe (full size): ${wireframe.title}`}
              className="h-auto w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/**
 * Subsection title tier — one consistent size/weight for every subsection
 * heading on the page (personas, content map, wireframe groups, workflow
 * impact, embed labels). Sits clearly below the section-title tier
 * (`text-2xl font-bold`) and above body text.
 */
function Subheading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-base font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

// ─── Content map data ────────────────────────────────────────────────
export type Volatility = "High" | "Medium" | "Low";

export interface StablePage {
  file: string;
  volatility: Volatility;
  description: string;
  owner: string;
  sources: string[];
}

export const STABLE_PAGES: StablePage[] = [
  {
    file: "offer-definition.md",
    volatility: "High",
    description:
      "What we're building, for whom, differentiators, value prop, out-of-scope",
    owner: "Product",
    sources: [
      "GitHub issues",
      "Confluence",
      "Interview notes",
      "Design findings",
      "SharePoint",
    ],
  },
  {
    file: "product-roadmap.md",
    volatility: "Medium",
    description:
      "Strategic sequencing — themes, bets, capability areas, timeframes",
    owner: "Product",
    sources: [
      "Confluence/SharePoint (authoritative)",
      "GitHub/Jira epics (corroborating)",
    ],
  },
  {
    file: "technical-commitments.md",
    volatility: "Low",
    description:
      "Platform, data model, API contracts, integration choices, ADRs",
    owner: "Eng + Arch jointly",
    sources: ["GitHub ADRs", "Miro boards", "Confluence"],
  },
  {
    file: "market-understanding.md",
    volatility: "Medium",
    description: "Validated segments, partner status, confirmed vs. hypothetical",
    owner: "Product",
    sources: [
      "Interview notes",
      "BizDev target list",
      "Design usability findings",
    ],
  },
  {
    file: "active-commitments.md",
    volatility: "Medium",
    description: "What was promised, to whom, by when, who owns it",
    owner: "Project Management",
    sources: ["Jira/Linear", "Meeting decisions", "Leadership inputs"],
  },
  {
    file: "operating-agreements.md",
    volatility: "Low",
    description: "Decision authority, cadences, 'ready to build' definitions",
    owner: "Project Management",
    sources: ["Team formation", "Retrospectives", "Meeting records"],
  },
  {
    file: "glossary.md",
    volatility: "Low",
    description: "Shared language — grounds all agent synthesis",
    owner: "All roles",
    sources: ["Human-curated", "All functions"],
  },
];

export interface DynamicPage {
  file: string;
  description: string;
  sources: string[];
}

export interface DynamicGroup {
  fn: string;
  pages: DynamicPage[];
}

export const DYNAMIC_GROUPS: DynamicGroup[] = [
  {
    fn: "Engineering",
    pages: [
      {
        file: "activity.md",
        description: "Commits, PRs, releases vs. roadmap",
        sources: ["GitHub", "Jira"],
      },
      {
        file: "architecture-status.md",
        description: "ADR updates, tech risk flags",
        sources: ["GitHub ADRs", "Miro", "Confluence"],
      },
    ],
  },
  {
    fn: "Product",
    pages: [
      {
        file: "discovery.md",
        description: "Learnings, conviction shifts, hypotheses",
        sources: ["Dovetail", "Miro", "Confluence", "Webex channels"],
      },
      {
        file: "offer-status.md",
        description: "Roadmap progress, KPI tracking",
        sources: ["GitHub issues", "Confluence", "SharePoint"],
      },
    ],
  },
  {
    fn: "Design",
    pages: [
      {
        file: "design-status.md",
        description: "Prototypes in test, usability findings",
        sources: ["Figma", "Miro", "Confluence"],
      },
    ],
  },
  {
    fn: "BizDev",
    pages: [
      {
        file: "target-signals.md",
        description: "Curated target pipeline by type",
        sources: ["Target list (Confluence)", "SharePoint", "Webex channels"],
      },
    ],
  },
  {
    fn: "Marketing",
    pages: [
      {
        file: "marketing-status.md",
        description: "Campaigns, content, launch plans",
        sources: ["Confluence", "SharePoint"],
      },
    ],
  },
  {
    fn: "Project Mgmt",
    pages: [
      {
        file: "status.md",
        description: "RAG vs. commitments, blockers",
        sources: ["Jira/Linear", "Confluence"],
      },
      {
        file: "open-actions.md",
        description: "Actions from meetings, age, owner",
        sources: ["Meeting records (Git)", "Webex channels"],
      },
    ],
  },
  {
    fn: "Team-level",
    pages: [
      {
        file: "standup-draft.md",
        description: "Cross-function daily synthesis",
        sources: ["All dynamic pages", "Webex channels"],
      },
      {
        file: "weekly-synthesis.md",
        description: "Learning, direction, commitments",
        sources: ["All pages + signals"],
      },
    ],
  },
];

// ─── In-page section navigation ──────────────────────────────────────
const SECTIONS = [
  { id: "context", label: "Context" },
  { id: "who-its-for", label: "Personas & needs" },
  { id: "wireframes", label: "Wireframes" },
  { id: "integrated", label: "Integrated wireframes" },
  { id: "workflow", label: "Workflow impact considerations" },
] as const;

/**
 * Sticky in-page nav. Sticks within the standalone (explain) layout's inner
 * `overflow-y-auto` scroll container (the page no longer nests a Radix
 * ScrollArea, so `position: sticky` works). Active section is tracked with an
 * IntersectionObserver; links smooth-scroll and are keyboard accessible.
 */
function SectionNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: [0, 0.1, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActive(id);
  };

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => jump(e, s.id)}
            aria-current={active === s.id ? "true" : undefined}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active === s.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── Integrated wireframes: static screenshots ───────────────────────
interface IntegratedShot {
  src: string;
  title: string;
  path: string;
  caption: string;
}

const INTEGRATED_SHOTS: IntegratedShot[] = [
  {
    src: "/wireframes/integrated-dashboard.png",
    title: "Executive dashboard",
    path: "/projects/dashboard",
    caption:
      "Portfolio health across every project — milestone progress, KPIs, key dates, and a market-fit radar in one leadership view.",
  },
  {
    src: "/wireframes/integrated-tome.png",
    title: "Tome project overview",
    path: "/projects/tome",
    caption:
      "A single project's operating picture — source connections, conflicts, pending actions and decisions, team updates, and latest meetings.",
  },
];

/**
 * A static screenshot card of a page in the running product. The screenshot is
 * a native `<button>` (via Radix `DialogTrigger asChild`) that click-expands
 * into the same modal lightbox used by the Figma wireframe gallery, so
 * keyboard, focus, and screen-reader semantics come for free. An "Open live"
 * link is kept in the header — outside the expand button, to avoid nesting
 * interactive elements — so the working route stays reachable.
 */
function ScreenshotCard({
  shot,
  index,
}: {
  shot: IntegratedShot;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
    >
      <Dialog>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Header: title + open-live link (link sits outside the trigger) */}
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
            <Subheading className="truncate">{shot.title}</Subheading>
            <a
              href={shot.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Open live
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Click-to-expand screenshot thumbnail */}
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`Expand screenshot: ${shot.title}`}
              className="group relative block w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(shot.src)}
                alt={`Screenshot: ${shot.title}`}
                loading="lazy"
                className="block max-h-[520px] w-full object-cover object-top"
              />
              <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 className="h-3 w-3" />
                Expand
              </span>
            </button>
          </DialogTrigger>
        </div>

        <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden p-4 sm:p-6">
          <DialogTitle className="pr-8 text-base">{shot.title}</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            {shot.caption}
          </DialogDescription>
          <div className="max-h-[74vh] overflow-auto rounded-lg border border-border bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(shot.src)}
              alt={`Screenshot (full size): ${shot.title}`}
              className="h-auto w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Integrated wireframes: workflow impact ──────────────────────────
interface WorkflowItem {
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const WORKFLOW_ITEMS: WorkflowItem[] = [
  {
    title: "Connect the sources",
    desc: "Wire in all source systems (GitHub, Jira, Confluence, Webex, Figma…) so synthesis stays grounded.",
    Icon: Plug,
  },
  {
    title: "Human-verified content",
    desc: "Content is editable so people can verify correctness of what agents write.",
    Icon: ShieldCheck,
  },
  {
    title: "Updates via the assistant",
    desc: "Instead of daily/weekly meetings, teams tell the assistant what they're working on; it adds those updates to the overview.",
    Icon: MessageSquare,
  },
  {
    title: "Activity-rule status",
    desc: "Project status updates automatically from activity rules (e.g. how long a project has been inactive).",
    Icon: Cog,
  },
  {
    title: "Cross-source delta detection",
    desc: "Agents (as identified by PMs) surface deltas between different sources; a human reviews them.",
    Icon: GitCompare,
  },
  {
    title: "Pending actions & decisions",
    desc: "Agents identify pending actions/decisions that need human follow-up and resolution.",
    Icon: ListChecks,
  },
  {
    title: "Follow-up notifications",
    desc: "A notification system helps teams follow up on the above.",
    Icon: BellRing,
  },
  {
    title: "Corrections, feedback & suggestions management",
    desc: "Capture and manage corrections, feedback, and suggestions on wiki content — routed to the right owner and resolved (the suggestion-queue bridge from the content map).",
    Icon: MessageSquareQuote,
  },
];

function WorkflowCard({ item }: { item: WorkflowItem }) {
  const { Icon } = item;
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <h4 className="text-sm font-semibold text-foreground">
          {item.title}
        </h4>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {item.desc}
      </p>
    </div>
  );
}

/**
 * A small "Created by …" authorship credit pill. Shared by the PM credit in
 * "Personas & needs" and the Design credits on the Wireframes-onward sections so
 * they stay visually consistent. The pill itself never carries a link.
 */
function CreditPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
      <BadgeCheck className="h-4 w-4" />
      {children}
    </span>
  );
}

// ─── Main page ───────────────────────────────────────────────────────
export function PrinciplesPage() {
  return (
    <div className="pb-24">
      {/* Sticky in-page section nav (sticks within the layout scroll area) */}
      <SectionNav />

      <div className="mx-auto max-w-6xl p-6">
        <div className="space-y-20">
          {/* ══════════ SECTION: Context ══════════ */}
          <section id="context" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">What Tome is</h2>
                <p className="text-sm text-muted-foreground">
                  General context about the project
                </p>
              </div>
            </div>

            {/* Value prop */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h3 className="text-xl font-semibold leading-snug sm:text-2xl">
                Auto-updating project wikis, written for people — not raw feeds.
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Tome keeps a project&apos;s wiki current by ingesting activity
                from <span className="font-medium text-foreground">GitHub</span>{" "}
                repos, <span className="font-medium text-foreground">Webex</span>{" "}
                rooms, and{" "}
                <span className="font-medium text-foreground">Confluence</span>{" "}
                spaces, then having an agent rewrite the wiki pages in prose.
                Instead of scrolling raw feeds or transcripts, you get
                synthesized, readable summaries of what&apos;s actually happening
                across a project.
              </p>

              {/* Positioning statement */}
              <p className="mt-5 flex items-start gap-2 text-sm font-medium text-primary sm:text-base">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  At its core, Tome is a coordination &amp; velocity engine for
                  tiny teams.
                </span>
              </p>

              {/* Ingest → agent → wiki flow */}
              <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <SourceChip
                    icon={<GithubIcon className="h-4 w-4" />}
                    label="GitHub"
                  />
                  <SourceChip
                    icon={<WebexGlyph className="h-4 w-4" />}
                    label="Webex"
                  />
                  <SourceChip
                    icon={<Layers className="h-4 w-4" />}
                    label="Confluence"
                  />
                </div>

                <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
                <ArrowRight className="h-4 w-4 rotate-90 self-center text-muted-foreground sm:hidden" />

                <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary shadow-sm">
                  <Bot className="h-4 w-4" />
                  Agent synthesis
                </div>

                <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
                <ArrowRight className="h-4 w-4 rotate-90 self-center text-muted-foreground sm:hidden" />

                <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Readable wiki
                </div>
              </div>
            </div>
          </section>

          {/* Section divider — full-bleed (spans full page width) */}
          <div className="relative left-1/2 right-1/2 -mx-[50vw] h-px w-screen bg-border/60" />

          {/* ══════════ SECTION: Personas & needs (PM-authored) ══════════ */}
          <section id="who-its-for" className="scroll-mt-24 space-y-10">
            <div className="space-y-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Personas &amp; needs</h2>
                    <p className="text-sm text-muted-foreground">
                      Who this project is for, what each persona is looking for,
                      and which sources provide it
                    </p>
                  </div>
                </div>

                {/* PM authorship credit — scoped to this section */}
                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <CreditPill>Created by the Product Management</CreditPill>
                  <a
                    href="https://musical-kataifi-2d0e91.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                  >
                    View the full content map
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                As both a knowledge repository and a work tool, Tome has to serve
                the distinct people who rely on it. The Product Management team
                mapped out{" "}
                <span className="font-medium text-foreground">
                  who this is for
                </span>
                , what each persona needs from such a space, and{" "}
                <span className="font-medium text-foreground">
                  which sources
                </span>{" "}
                could supply that content.
              </p>
            </div>

            {/* Subsection B1: The personas */}
            <div className="space-y-5">
              <Subheading>The personas — who &amp; what they need</Subheading>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Three primary audiences: the{" "}
                <span className="font-medium text-foreground">
                  project teams
                </span>{" "}
                doing the work (follow up and coordinate more efficiently), the{" "}
                <span className="font-medium text-foreground">wider teams</span>{" "}
                around them (stay informed about the different Outshift
                initiatives), and{" "}
                <span className="font-medium text-foreground">leadership</span>{" "}
                (ensure projects stay aligned to strategic goals).
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {PERSONAS.map((persona, i) => (
                  <PersonaCard key={persona.key} persona={persona} index={i} />
                ))}
              </div>
            </div>

            {/* Subsection B2: The content map (single interactive graph) */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Subheading>The content map</Subheading>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Different personas will want to see different content. In this
                  map, personas are connected to content they might want to
                  access (per role, static or dynamic), and a connection to
                  potential data sources for them is shown.
                </p>
              </div>

              <ContentMapGraph
                stablePages={STABLE_PAGES}
                dynamicGroups={DYNAMIC_GROUPS}
                personas={PERSONAS}
              />
            </div>
          </section>

          {/* Section divider — full-bleed (spans full page width) */}
          <div className="relative left-1/2 right-1/2 -mx-[50vw] h-px w-screen bg-border/60" />

          {/* ══════════ SECTION: Wireframes ══════════ */}
          <section id="wireframes" className="scroll-mt-24 space-y-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Wireframes</h2>
                  <p className="text-sm text-muted-foreground">
                    From principles and personas to screens
                  </p>
                </div>
              </div>

              {/* Design authorship credit — scoped to this section */}
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <CreditPill>Created by the Design</CreditPill>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Design translated these needs into wireframe screens. The same data
              is reframed per persona — a shared baseline, a team coordination
              view, and a leadership outcomes view. Click any screen to view it
              full size.
            </p>

            {/* Subgroup: Browsing across projects (screens 1–2) */}
            <div className="space-y-4">
              <Subheading>Browsing across projects</Subheading>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {BROWSING_WIREFRAMES.map((wireframe, i) => (
                  <WireframeCard
                    key={wireframe.src}
                    wireframe={wireframe}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Subgroup: Inside a project (screens 3–5) */}
            <div className="space-y-4">
              <Subheading>Inside a project</Subheading>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                The same project overview, reframed for each persona from the
                matrix above:{" "}
                <span className="font-medium text-foreground">General</span> is
                the shared baseline,{" "}
                <span className="font-medium text-indigo-200">Team</span> maps to
                the Internal team, and{" "}
                <span className="font-medium text-amber-200">
                  Leadership (SLT)
                </span>{" "}
                maps to Executive leadership.
              </p>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {PROJECT_WIREFRAMES.map((wireframe, i) => (
                  <WireframeCard
                    key={wireframe.src}
                    wireframe={wireframe}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Prototype link */}
            <div>
              <a
                href="https://www.figma.com/proto/mCSJhBUzt49P0iCbAG1SWR/Tiny-teams-with-tokens?node-id=55-7157&starting-point-node-id=55%3A7157"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View the interactive prototype in Figma
              </a>
            </div>
          </section>

          {/* Section divider — full-bleed (spans full page width) */}
          <div className="relative left-1/2 right-1/2 -mx-[50vw] h-px w-screen bg-border/60" />

          {/* ══════════ SECTION: Integrated wireframes ══════════ */}
          <section id="integrated" className="scroll-mt-24 space-y-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <MonitorPlay className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Integrated wireframes</h2>
                  <p className="text-sm text-muted-foreground">
                    The concepts, realized in the running product
                  </p>
                </div>
              </div>

              {/* Design authorship credit — scoped to this section */}
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <CreditPill>Created by the Design</CreditPill>
                <a
                  href="https://github.com/vaesposito/tome-ux"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  Permissions required
                </a>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              We adapted the current version of TOME, integrating some of the
              elements recommended in the wireframes. For Tome to move from a{" "}
              <span className="font-medium text-foreground">
                context &amp; accuracy engine
              </span>{" "}
              to a{" "}
              <span className="font-medium text-foreground">
                coordination &amp; velocity engine
              </span>{" "}
              for tiny teams, the wireframes need real workflow impact — not just
              screens.
            </p>

            {/* Static screenshots of the running app (full-width, click to expand) */}
            <div className="grid grid-cols-1 gap-5">
              {INTEGRATED_SHOTS.map((shot, i) => (
                <ScreenshotCard key={shot.src} shot={shot} index={i} />
              ))}
            </div>
          </section>

          {/* Section divider — full-bleed (spans full page width) */}
          <div className="relative left-1/2 right-1/2 -mx-[50vw] h-px w-screen bg-border/60" />

          {/* ══════════ SECTION: Workflow impact considerations ══════════ */}
          <section id="workflow" className="scroll-mt-24 space-y-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Workflow impact considerations
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    What it takes to turn those screens into real velocity
                  </p>
                </div>
              </div>

              {/* Design authorship credit — scoped to this section */}
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <CreditPill>Created by the Design</CreditPill>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Turning those screens into velocity takes changes across the whole
              workflow — grounding the sources, keeping humans in the loop,
              driving updates through the assistant, and letting automation and
              agents surface what needs attention.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {WORKFLOW_ITEMS.map((item) => (
                <WorkflowCard key={item.title} item={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
