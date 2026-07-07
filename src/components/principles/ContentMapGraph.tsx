"use client";

import React, { useMemo, useState } from "react";
import type {
  StablePage,
  DynamicGroup,
  Persona,
  PersonaAccent,
} from "./PrinciplesPage";

/**
 * ContentMapGraph
 * ---------------
 * A compact, interactive three-tier node-link graph that replaces the long
 * content-map card list. It mixes all four dimensions in one picture:
 *
 *   Personas (left)  ←  Content pages (middle)  ←  Sources (right)
 *
 * (Sources still feed pages, which serve personas — only the geometry is
 * mirrored so personas read on the left and sources on the right.)
 *
 * - Stable vs Dynamic pages are encoded by color + border style (solid indigo
 *   vs dashed emerald).
 * - Hovering / focusing any node highlights its connected path in BOTH
 *   directions and dims the rest. With nothing active every node + edge is
 *   fully legible, so the graph degrades to a readable static state (no meaning
 *   depends on hover).
 *
 * Implemented as a single responsive SVG (viewBox scaling) — no extra deps.
 * All coordinates are computed deterministically from node counts, so no DOM
 * measurement is needed.
 */

type Col = "source" | "page" | "persona";
type PageType = "stable" | "dynamic";

const ACCENT_HEX: Record<PersonaAccent, string> = {
  indigo: "#818cf8",
  teal: "#2dd4bf",
  amber: "#fbbf24",
};
const STABLE_COLOR = "#818cf8";
const DYNAMIC_COLOR = "#34d399";
const NEUTRAL = "#94a3b8";

/**
 * Top-to-bottom grouping order for the middle content-page column, by role.
 * Team-level pages (the cross-function daily/weekly syntheses) sit at the TOP,
 * then the individual functions in their delivery order.
 */
const ROLE_ORDER = [
  "Team-level",
  "Engineering",
  "Product",
  "Design",
  "BizDev",
  "Marketing",
  "Project Mgmt",
];

/** Compact tag/shortcut shown inline on each content-page node. */
const ROLE_SHORTCUT: Record<string, string> = {
  Engineering: "ENG",
  Product: "PM",
  Design: "DES",
  BizDev: "BIZ",
  Marketing: "MKT",
  "Project Mgmt": "OPS",
  "Team-level": "TEAM",
};

/**
 * Reconcile the variant owner/function spellings that appear in the source
 * data onto the canonical role names used by ROLE_ORDER + ROLE_SHORTCUT. The
 * source pages carry a few looser strings ("Eng + Arch jointly",
 * "Project Management", "All roles") that would otherwise miss the role map —
 * falling to the bottom via the roleRank fallback and rendering a wrong
 * slice(0,4) tag. Mapping them here keeps every page grouped and tagged
 * correctly without editing the source data. (Only the role used for grouping
 * + tagging is normalized; each page's sources are left untouched.)
 */
const ROLE_ALIASES: Record<string, string> = {
  "Eng + Arch jointly": "Engineering",
  "Project Management": "Project Mgmt",
  "All roles": "Team-level",
};

/** Canonical role for a raw owner/`fn` string (identity if already canonical). */
const normalizeOwner = (owner: string) => ROLE_ALIASES[owner] ?? owner;

const roleRank = (owner: string) => {
  const i = ROLE_ORDER.indexOf(owner);
  return i === -1 ? ROLE_ORDER.length : i;
};

const roleTag = (owner: string) =>
  ROLE_SHORTCUT[owner] ?? owner.slice(0, 4).toUpperCase();

/** Preferred left-column order for normalized source nodes. */
const SOURCE_ORDER = [
  "GitHub",
  "Jira/Linear",
  "Confluence",
  "SharePoint",
  "Figma",
  "Miro",
  "Dovetail",
  "Interview notes",
  "BizDev target list",
  "Design findings",
  "Webex",
  "Meeting records",
  "Leadership inputs",
  "Team knowledge",
];

/** Normalize a raw source string into one or more canonical source nodes. */
function canonicalSources(raw: string): string[] {
  const v = raw.toLowerCase();
  const out = new Set<string>();
  if (v.includes("github")) out.add("GitHub");
  if (v.includes("jira") || v.includes("linear")) out.add("Jira/Linear");
  if (v.includes("confluence")) out.add("Confluence");
  if (v.includes("sharepoint")) out.add("SharePoint");
  if (v.includes("figma")) out.add("Figma");
  if (v.includes("miro")) out.add("Miro");
  if (v.includes("dovetail")) out.add("Dovetail");
  if (v.includes("interview")) out.add("Interview notes");
  if (v.includes("webex")) out.add("Webex");
  if (v.includes("meeting") || v.includes("retrospective"))
    out.add("Meeting records");
  if (v.includes("leadership")) out.add("Leadership inputs");
  if (v.includes("target list") || v.includes("bizdev"))
    out.add("BizDev target list");
  if (v.includes("design")) out.add("Design findings");
  if (out.size === 0) out.add("Team knowledge");
  return [...out];
}

/**
 * Derived persona ↔ page mapping (does not exist in the source data). Each
 * persona is connected to the pages that serve its needs; some pages serve
 * more than one persona (e.g. product-roadmap.md, glossary.md), which shows up
 * as cross edges.
 */
const PERSONA_PAGES: Record<string, string[]> = {
  internal: [
    "technical-commitments.md",
    "active-commitments.md",
    "operating-agreements.md",
    "glossary.md",
    "activity.md",
    "architecture-status.md",
    "discovery.md",
    "design-status.md",
    "marketing-status.md",
    "open-actions.md",
    "standup-draft.md",
    "weekly-synthesis.md",
    "meetings/agendas/YYYY-MM-DD.md",
    "meetings/records/YYYY-MM-DD.md",
    "suggestions/pending.md",
    "suggestions/resolved.md",
  ],
  complementary: [
    "offer-definition.md",
    "product-roadmap.md",
    "technical-commitments.md",
    "market-understanding.md",
    "glossary.md",
    "architecture-status.md",
    "target-signals.md",
  ],
  executive: [
    "product-roadmap.md",
    "market-understanding.md",
    "active-commitments.md",
    "glossary.md",
    "offer-status.md",
    "status.md",
    "weekly-synthesis.md",
  ],
};

const dedupe = (a: string[]) => [...new Set(a)];

// ─── Layout constants (SVG viewBox units) ────────────────────────────
// Tiers, left → right: Personas · Content pages · Sources.
const W = 820;
const BODY_TOP = 34;
const BODY_H = 540;
const H = BODY_TOP + BODY_H + 12;
const PER_X = 6;
const PER_W = 166;
const PAGE_X = 322;
const PAGE_W = 190;
const SRC_X = 664;
const SRC_W = 150;
const SRC_H = 19;
const PAGE_H = 17;
const PER_H = 42;

interface GraphPage {
  file: string;
  type: PageType;
  /** Owning role/function (e.g. "Engineering", "Product"). Rendered on the node. */
  owner: string;
  sources: string[];
  personas: string[];
}

/**
 * Cross-cutting content-map groupings that live outside the per-function
 * stable/dynamic data passed in as props, but appear on the reference map:
 *
 *   - Meeting layer: event-sourced pages that accumulate in git (agendas
 *     generated pre-meeting, records written post-meeting and never
 *     overwritten). Fed by the "Meeting records" (Git) source.
 *   - Suggestion queue: the bridge from agent observation to stable-page
 *     review. `pending` holds conflicts between fresh signals and stable
 *     beliefs awaiting human review; `resolved` is the git audit trail of how
 *     those beliefs evolved. Derived from agent synthesis ("Team knowledge")
 *     and the git history ("GitHub" / "Meeting records") — NOT wired to Webex,
 *     which per the reference map feeds only the four dynamic pages below.
 *
 * Injected here (rather than in the source data) so this graph owns the single
 * cross-cutting view. Both groups are owned by the "Team-level" role (so they
 * carry the TEAM tag and sort within the Team-level group) and use canonical
 * source names (matching SOURCE_ORDER) so edges + tags resolve with no
 * fallback. Treated as `dynamic` (dashed emerald) since they are
 * event-sourced / accumulating.
 */
const EXTRA_PAGES: Omit<GraphPage, "personas">[] = [
  {
    file: "meetings/agendas/YYYY-MM-DD.md",
    type: "dynamic",
    owner: "Team-level",
    sources: ["Meeting records"],
  },
  {
    file: "meetings/records/YYYY-MM-DD.md",
    type: "dynamic",
    owner: "Team-level",
    sources: ["Meeting records"],
  },
  {
    file: "suggestions/pending.md",
    type: "dynamic",
    owner: "Team-level",
    sources: ["Team knowledge", "Meeting records"],
  },
  {
    file: "suggestions/resolved.md",
    type: "dynamic",
    owner: "Team-level",
    sources: ["GitHub", "Meeting records"],
  },
];

export function ContentMapGraph({
  stablePages,
  dynamicGroups,
  personas,
}: {
  stablePages: StablePage[];
  dynamicGroups: DynamicGroup[];
  personas: Persona[];
}) {
  const [active, setActive] = useState<{ col: Col; id: string } | null>(null);

  const model = useMemo(() => {
    const rawPages: GraphPage[] = [
      ...stablePages.map((p) => ({
        file: p.file,
        type: "stable" as PageType,
        owner: normalizeOwner(p.owner),
        sources: dedupe(p.sources.flatMap(canonicalSources)),
        personas: [] as string[],
      })),
      ...dynamicGroups.flatMap((g) =>
        g.pages.map((p) => ({
          file: p.file,
          type: "dynamic" as PageType,
          owner: normalizeOwner(g.fn),
          sources: dedupe(p.sources.flatMap(canonicalSources)),
          personas: [] as string[],
        })),
      ),
      ...EXTRA_PAGES.map((p) => ({ ...p, personas: [] as string[] })),
    ];

    const byFile = new Map(rawPages.map((p) => [p.file, p]));
    for (const key of Object.keys(PERSONA_PAGES)) {
      for (const file of PERSONA_PAGES[key]) {
        const page = byFile.get(file);
        if (page) page.personas.push(key);
      }
    }

    // Group content pages by role (Engineering → … → Team-level); within a
    // role, order alphabetically by filename for a stable, sensible layout.
    rawPages.sort((a, b) => {
      const r = roleRank(a.owner) - roleRank(b.owner);
      return r !== 0 ? r : a.file.localeCompare(b.file);
    });

    const used = new Set<string>();
    rawPages.forEach((p) => p.sources.forEach((s) => used.add(s)));
    const sources = SOURCE_ORDER.filter((s) => used.has(s));
    const personaOrder = personas.map((p) => p.key);

    return { pages: rawPages, sources, personaOrder };
  }, [stablePages, dynamicGroups, personas]);

  const personaMeta = useMemo(
    () =>
      new Map(personas.map((p) => [p.key, { label: p.title, accent: p.accent }])),
    [personas],
  );

  // Positions: each column spreads its nodes evenly across the body height.
  const { srcPos, pagePos, perPos } = useMemo(() => {
    const yOf = (i: number, n: number) => BODY_TOP + (BODY_H / n) * (i + 0.5);
    return {
      srcPos: new Map(
        model.sources.map((s, i) => [s, yOf(i, model.sources.length)]),
      ),
      pagePos: new Map(
        model.pages.map((p, i) => [p.file, yOf(i, model.pages.length)]),
      ),
      perPos: new Map(
        model.personaOrder.map((k, i) => [
          k,
          yOf(i, model.personaOrder.length),
        ]),
      ),
    };
  }, [model]);

  // Highlight sets for the currently active node (both directions).
  const hl = useMemo(() => {
    if (!active) return null;
    const source = new Set<string>();
    const page = new Set<string>();
    const persona = new Set<string>();
    if (active.col === "persona") {
      persona.add(active.id);
      model.pages.forEach((p) => {
        if (p.personas.includes(active.id)) {
          page.add(p.file);
          p.sources.forEach((s) => source.add(s));
        }
      });
    } else if (active.col === "page") {
      const p = model.pages.find((x) => x.file === active.id);
      if (p) {
        page.add(p.file);
        p.sources.forEach((s) => source.add(s));
        p.personas.forEach((k) => persona.add(k));
      }
    } else {
      source.add(active.id);
      model.pages.forEach((p) => {
        if (p.sources.includes(active.id)) {
          page.add(p.file);
          p.personas.forEach((k) => persona.add(k));
        }
      });
    }
    return { source, page, persona };
  }, [active, model]);

  const setOf = (col: Col) =>
    col === "source" ? hl?.source : col === "page" ? hl?.page : hl?.persona;

  const nodeOpacity = (col: Col, id: string) =>
    !hl ? 1 : setOf(col)?.has(id) ? 1 : 0.14;

  const edgePath = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };

  const activate = (col: Col, id: string) => setActive({ col, id });
  const clear = () => setActive(null);
  const toggle = (col: Col, id: string) =>
    setActive((a) => (a && a.col === col && a.id === id ? null : { col, id }));

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[680px]"
          role="img"
          aria-label="Content map: personas (left) are served by content pages (middle) that are fed by sources (right). Stable pages are indigo; dynamic pages are dashed emerald."
          onMouseLeave={clear}
        >
          {/* Column headers */}
          <text
            x={SRC_X + SRC_W / 2}
            y={16}
            textAnchor="middle"
            fill={NEUTRAL}
            fontSize={11}
            fontWeight={700}
            letterSpacing={1}
          >
            SOURCES
          </text>
          <text
            x={PAGE_X + PAGE_W / 2}
            y={16}
            textAnchor="middle"
            fill={NEUTRAL}
            fontSize={11}
            fontWeight={700}
            letterSpacing={1}
          >
            CONTENT PAGES
          </text>
          <text
            x={PER_X + PER_W / 2}
            y={16}
            textAnchor="middle"
            fill={NEUTRAL}
            fontSize={11}
            fontWeight={700}
            letterSpacing={1}
          >
            PERSONAS
          </text>

          {/* Edges: source → page */}
          <g fill="none">
            {model.pages.map((p) =>
              p.sources.map((s) => {
                const y1 = srcPos.get(s);
                const y2 = pagePos.get(p.file);
                if (y1 == null || y2 == null) return null;
                const on = !!hl && hl.source.has(s) && hl.page.has(p.file);
                const opacity = hl ? (on ? 0.85 : 0.04) : 0.12;
                const stroke = on
                  ? p.type === "stable"
                    ? STABLE_COLOR
                    : DYNAMIC_COLOR
                  : NEUTRAL;
                return (
                  <path
                    key={`${s}->${p.file}`}
                    d={edgePath(SRC_X, y1, PAGE_X + PAGE_W, y2)}
                    stroke={stroke}
                    strokeWidth={on ? 1.6 : 1}
                    opacity={opacity}
                    style={{ transition: "opacity 150ms" }}
                  />
                );
              }),
            )}

            {/* Edges: page → persona */}
            {model.pages.map((p) =>
              p.personas.map((k) => {
                const y1 = pagePos.get(p.file);
                const y2 = perPos.get(k);
                if (y1 == null || y2 == null) return null;
                const on = !!hl && hl.page.has(p.file) && hl.persona.has(k);
                const opacity = hl ? (on ? 0.9 : 0.04) : 0.14;
                const stroke = on
                  ? (personaMeta.get(k)?.accent
                      ? ACCENT_HEX[personaMeta.get(k)!.accent]
                      : NEUTRAL)
                  : NEUTRAL;
                return (
                  <path
                    key={`${p.file}->${k}`}
                    d={edgePath(PAGE_X, y1, PER_X + PER_W, y2)}
                    stroke={stroke}
                    strokeWidth={on ? 1.8 : 1}
                    opacity={opacity}
                    style={{ transition: "opacity 150ms" }}
                  />
                );
              }),
            )}
          </g>

          {/* Source nodes */}
          {model.sources.map((s) => {
            const y = srcPos.get(s)!;
            return (
              <g
                key={s}
                tabIndex={0}
                role="button"
                aria-label={`Source: ${s}. Highlight the pages it feeds.`}
                onMouseEnter={() => activate("source", s)}
                onFocus={() => activate("source", s)}
                onBlur={clear}
                onClick={() => toggle("source", s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle("source", s);
                  }
                }}
                style={{
                  cursor: "pointer",
                  opacity: nodeOpacity("source", s),
                  transition: "opacity 150ms",
                }}
                className="outline-none focus-visible:outline-none"
              >
                <rect
                  x={SRC_X}
                  y={y - SRC_H / 2}
                  width={SRC_W}
                  height={SRC_H}
                  rx={5}
                  fill="rgba(148,163,184,0.08)"
                  stroke="rgba(148,163,184,0.35)"
                />
                <text
                  x={SRC_X + 10}
                  y={y}
                  dominantBaseline="central"
                  fill="#cbd5e1"
                  fontSize={9.5}
                >
                  {s}
                </text>
                <title>{`Source: ${s}`}</title>
              </g>
            );
          })}

          {/* Page nodes */}
          {model.pages.map((p) => {
            const y = pagePos.get(p.file)!;
            const color = p.type === "stable" ? STABLE_COLOR : DYNAMIC_COLOR;
            const tag = roleTag(p.owner);
            // Compact role pill sitting left of the monospace filename, all on
            // one line: `[ENG] activity.md`.
            const pillH = 11;
            const pillPadX = 4;
            const pillX = PAGE_X + 8;
            const pillW = tag.length * 4.3 + pillPadX * 2;
            const fileX = pillX + pillW + 5;
            return (
              <g
                key={p.file}
                tabIndex={0}
                role="button"
                aria-label={`${p.type} page: ${p.file}, owned by ${p.owner}. Highlight its sources and the personas it serves.`}
                onMouseEnter={() => activate("page", p.file)}
                onFocus={() => activate("page", p.file)}
                onBlur={clear}
                onClick={() => toggle("page", p.file)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle("page", p.file);
                  }
                }}
                style={{
                  cursor: "pointer",
                  opacity: nodeOpacity("page", p.file),
                  transition: "opacity 150ms",
                }}
                className="outline-none focus-visible:outline-none"
              >
                <rect
                  x={PAGE_X}
                  y={y - PAGE_H / 2}
                  width={PAGE_W}
                  height={PAGE_H}
                  rx={5}
                  fill={`${color}22`}
                  stroke={color}
                  strokeOpacity={0.7}
                  strokeWidth={1}
                  strokeDasharray={p.type === "dynamic" ? "3 2" : undefined}
                />
                {/* Owner/role tag — compact pill tinted to the node color,
                    sitting inline (left of) the monospace filename. */}
                <rect
                  x={pillX}
                  y={y - pillH / 2}
                  width={pillW}
                  height={pillH}
                  rx={3}
                  fill={`${color}33`}
                  stroke={color}
                  strokeOpacity={0.5}
                  strokeWidth={0.75}
                />
                <text
                  x={pillX + pillW / 2}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize={6.5}
                  fontWeight={700}
                  letterSpacing={0.4}
                >
                  {tag}
                </text>
                <text
                  x={fileX}
                  y={y}
                  dominantBaseline="central"
                  fill="#e2e8f0"
                  fontSize={7.5}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {p.file}
                </text>
                <title>{`${p.type} page: ${p.file} · ${p.owner}`}</title>
              </g>
            );
          })}

          {/* Persona nodes */}
          {model.personaOrder.map((k) => {
            const y = perPos.get(k)!;
            const meta = personaMeta.get(k);
            const accent = meta ? ACCENT_HEX[meta.accent] : NEUTRAL;
            return (
              <g
                key={k}
                tabIndex={0}
                role="button"
                aria-label={`Persona: ${meta?.label ?? k}. Highlight the pages that serve it and their sources.`}
                onMouseEnter={() => activate("persona", k)}
                onFocus={() => activate("persona", k)}
                onBlur={clear}
                onClick={() => toggle("persona", k)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle("persona", k);
                  }
                }}
                style={{
                  cursor: "pointer",
                  opacity: nodeOpacity("persona", k),
                  transition: "opacity 150ms",
                }}
                className="outline-none focus-visible:outline-none"
              >
                <rect
                  x={PER_X}
                  y={y - PER_H / 2}
                  width={PER_W}
                  height={PER_H}
                  rx={8}
                  fill={`${accent}22`}
                  stroke={accent}
                  strokeOpacity={0.8}
                />
                <text
                  x={PER_X + PER_W / 2}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={accent}
                  fontSize={11}
                  fontWeight={700}
                >
                  {meta?.label ?? k}
                </text>
                <title>{`Persona: ${meta?.label ?? k}`}</title>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm"
            style={{
              background: `${STABLE_COLOR}33`,
              border: `1px solid ${STABLE_COLOR}`,
            }}
          />
          Stable page
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm border border-dashed"
            style={{
              background: `${DYNAMIC_COLOR}22`,
              borderColor: DYNAMIC_COLOR,
            }}
          />
          Dynamic page
        </span>
        <span className="text-muted-foreground/70">
          Hover, focus, or tap a node to trace its connections.
        </span>
      </div>
    </div>
  );
}
