"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Standalone layout for explanatory / marketing-style pages (e.g. the
 * Principles & Personas page). This is deliberately NOT the CAIPE app shell:
 * it does not render AppHeader, LiveStreamBanner, NPSSurvey, or the floating
 * AssistantWidget, and it does not call useUserInit. Root providers (theme,
 * fonts, auth, toast) still come from the root layout, so we only add a slim
 * standalone top bar + a scrollable content container here.
 */
export function ExplainShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-background noise-overlay">
      {/* Slim standalone top bar */}
      <header className="h-14 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Wordmark */}
          <Link
            href="/principles"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <span className="text-base font-bold gradient-text">TOME</span>
            <span className="hidden sm:inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Suggested updates
            </span>
          </Link>

          {/* Nav slot (room for more explainer pages later) + back-to-app link */}
          <nav className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/principles"
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Principles
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Open app
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Scrollable content region. `overflow-x-hidden` guards against the
          full-bleed (`w-screen`) section dividers on the principles page: on
          platforms with classic (space-taking) scrollbars, `100vw` exceeds the
          content width by the scrollbar width, so we clip that horizontal
          overflow to avoid a stray horizontal scrollbar. */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
