import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Placeholder landing — the real marketing page lands in a later phase.
 * Kept minimal so the shell, tokens, and type have something to sit on.
 */
export default function Home() {
  return (
    <div className="mx-auto flex max-w-[68ch] flex-col items-start gap-6 py-12 animate-enter">
      <span className="eyebrow">AI career &amp; workforce innovations</span>
      <h1 className="text-2xl font-semibold sm:text-3xl">
        Map the gap. Follow a roadmap built from real careers. Leave with a
        credential an employer can verify.
      </h1>
      <p className="text-base text-ink-muted">
        Ladda takes what you already know, measures it against the role you want,
        and builds every step of the path from the public trajectories of people
        already doing that job.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/intake">Try as Amara</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dev/preview">Design system preview</Link>
        </Button>
      </div>
    </div>
  );
}
