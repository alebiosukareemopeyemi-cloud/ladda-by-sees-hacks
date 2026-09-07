"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Content } from "@/components/ui/content";
import { ErrorWithRetry } from "@/components/ui/error-with-retry";

/* ------------------------------------------------------------------ */
/*  data                                                              */
/* ------------------------------------------------------------------ */

const NEUTRALS = [
  { name: "paper", cls: "bg-paper", role: "app background" },
  { name: "surface", cls: "bg-surface", role: "cards, inputs" },
  { name: "line", cls: "bg-line", role: "hairlines, borders" },
  { name: "ink", cls: "bg-ink", role: "primary text" },
  { name: "ink-muted", cls: "bg-ink-muted", role: "secondary text" },
] as const;

const ACCENTS = [
  { name: "growth", cls: "bg-growth", role: "progress · roadmap · primary CTA" },
  { name: "growth-soft", cls: "bg-growth-soft", role: "growth fills, chips" },
  { name: "verified", cls: "bg-verified", role: "credentials · verification" },
  { name: "verified-soft", cls: "bg-verified-soft", role: "verified fills" },
  { name: "gap", cls: "bg-gap", role: "gaps & warnings ONLY" },
  { name: "gap-soft", cls: "bg-gap-soft", role: "warning fills" },
] as const;

const TYPE_SCALE = [
  { px: 12, cls: "text-xs" },
  { px: 14, cls: "text-sm" },
  { px: 16, cls: "text-base" },
  { px: 20, cls: "text-lg" },
  { px: 26, cls: "text-xl" },
  { px: 34, cls: "text-2xl" },
  { px: 46, cls: "text-3xl" },
] as const;

/* ------------------------------------------------------------------ */
/*  layout helpers                                                    */
/* ------------------------------------------------------------------ */

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 border-t border-line pt-8">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  cls,
  role,
}: {
  name: string;
  cls: string;
  role: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-16 rounded-card border border-line ${cls}`}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-0.5">
        <code className="font-mono text-xs text-ink">--color-{name}</code>
        <span className="text-xs text-ink-muted">{role}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  async-state demo                                                  */
/* ------------------------------------------------------------------ */

type View = "loading" | "content" | "error";

function AsyncStateDemo() {
  const [view, setView] = React.useState<View>("loading");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(["loading", "content", "error"] as const).map((v) => (
          <Button
            key={v}
            size="sm"
            variant={view === v ? "primary" : "outline"}
            onClick={() => setView(v)}
          >
            {v}
          </Button>
        ))}
      </div>
      <Content
        loading={view === "loading"}
        error={view === "error" ? "The roadmap service didn't respond." : null}
        onRetry={() => setView("content")}
        retry={{ title: "Couldn't build the roadmap" }}
      >
        <Card>
          <CardHeader>
            <span className="eyebrow">Data Analyst</span>
            <CardTitle>Gap score 62</CardTitle>
            <CardDescription>
              Six steps stand between where you are and this role.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-ink-muted">
            This is the resting content state — the fade + rise you just saw is
            the §9 page-enter transition, and it settles here.
          </CardContent>
        </Card>
      </Content>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  page                                                              */
/* ------------------------------------------------------------------ */

export default function DevPreviewPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Dev · throwaway</span>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em]">
          Design system preview
        </h1>
        <p className="max-w-[68ch] text-sm text-ink-muted">
          Every token, the type scale, the rethemed primitives, and the three
          async states. Toggle the theme in the nav to check both palettes.
          Delete <code className="font-mono text-xs">app/dev</code> before ship.
        </p>
      </header>

      {/* ---- colour ------------------------------------------------ */}
      <Section eyebrow="Tokens" title="Colour — neutrals">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {NEUTRALS.map((s) => (
            <Swatch key={s.name} {...s} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Tokens" title="Colour — accents (two, with meaning)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ACCENTS.map((s) => (
            <Swatch key={s.name} {...s} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-2 rounded-pill bg-growth-soft px-3 py-1 text-xs font-medium text-growth">
            growth = progress
          </span>
          <span className="inline-flex items-center gap-2 rounded-pill bg-verified-soft px-3 py-1 text-xs font-medium text-verified">
            verified = credentials
          </span>
          <span className="inline-flex items-center gap-2 rounded-pill bg-gap-soft px-3 py-1 text-xs font-medium text-gap">
            gap = warnings only
          </span>
        </div>
      </Section>

      {/* ---- type ------------------------------------------------- */}
      <Section eyebrow="Tokens" title="Type scale — 12 · 14 · 16 · 20 · 26 · 34 · 46">
        <div className="flex flex-col divide-y divide-line">
          {TYPE_SCALE.map(({ px, cls }) => (
            <div
              key={px}
              className="grid grid-cols-[3.5rem_1fr] items-baseline gap-4 py-3 sm:grid-cols-[5rem_1fr]"
            >
              <span className="font-mono text-xs tabular-nums text-ink-muted">
                {px}px
              </span>
              <p className={`${cls} font-display font-semibold`}>
                The climb, one step at a time
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5 rounded-card border border-line p-4">
            <span className="eyebrow">Display</span>
            <p className="font-display text-lg font-semibold">Bricolage Grotesque</p>
            <p className="text-xs text-ink-muted">Headings, gap score, step titles</p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-card border border-line p-4">
            <span className="eyebrow">Body</span>
            <p className="font-sans text-lg">Instrument Sans</p>
            <p className="text-xs text-ink-muted">Running text · 400 / 500</p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-card border border-line p-4">
            <span className="eyebrow">Data</span>
            <p className="font-mono text-lg tabular-nums">JetBrains Mono 0123</p>
            <p className="text-xs text-ink-muted">Labels, scores, credential ids</p>
          </div>
        </div>
      </Section>

      {/* ---- buttons -------------------------------------------- */}
      <Section eyebrow="Primitives" title="Button — rethemed shadcn">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="verified">Verified</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="warn">Warn</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      {/* ---- inputs -------------------------------------------- */}
      <Section eyebrow="Primitives" title="Input">
        <div className="grid max-w-xl gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Target role</span>
            <Input placeholder="e.g. Data Analyst" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Invalid</span>
            <Input aria-invalid defaultValue="not-an-email" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Disabled</span>
            <Input disabled placeholder="Unavailable" />
          </label>
        </div>
      </Section>

      {/* ---- cards + dialog ----------------------------------- */}
      <Section eyebrow="Primitives" title="Card & Dialog">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Static card</CardTitle>
              <CardDescription>
                A hairline, no shadow — elevation is for interactive surfaces.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-ink-muted">
              Radius 12px. Fill is <code className="font-mono text-xs">surface</code>.
            </CardContent>
            <CardFooter>
              <span className="eyebrow">footer</span>
            </CardFooter>
          </Card>

          <Card interactive>
            <CardHeader>
              <CardTitle>Interactive card</CardTitle>
              <CardDescription>
                Hover for the lift — 1px rise plus the pop shadow.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-ink-muted">
              This is the treatment a clickable roadmap step gets.
            </CardContent>
          </Card>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rethemed dialog</DialogTitle>
              <DialogDescription>
                Radix under the hood; ink wash overlay, surface panel, climb
                easing on enter. Nothing here reads as stock shadcn.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="primary">Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      {/* ---- async states ------------------------------------ */}
      <Section
        eyebrow="Async"
        title="Three designed states — skeleton · content · error"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">1 · Skeleton</span>
            <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
              <Skeleton className="h-5 w-2/5" />
              <SkeletonText lines={3} />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow">2 · Content wrapper</span>
            <AsyncStateDemo />
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow">3 · Error with retry</span>
            <ErrorWithRetry
              title="Couldn't reach the mentor"
              message="The connection dropped mid-reply. Your progress is saved."
              onRetry={() => {}}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
