import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ProfileFact, ProfileLink } from '~/lib/profile-fields';
import { EditIconLink } from '~/components/owner/OwnerActions';
import { PostContent } from '~/components/post/PostContent';
import { Button } from '~/components/ui/button';
import { ProfileLinks } from './ProfileLinks';

export interface HeroLink {
  href: string;
  label: string;
}

interface AboutHeroProps {
  eyebrow: string;
  name: string;
  tagline: string;
  /** "글 42편", "읽은 책 17권" … — a meta line under the introduction. */
  stats: readonly string[];
  /** Contact links, right under the name so a visitor finds them without scrolling. */
  links: readonly ProfileLink[];
  facts: readonly ProfileFact[];
  /** The owner's markdown introduction. */
  content: string;
  primaryLink: HeroLink;
  secondaryLink: HeroLink | null;
  isOwner: boolean;
}

/**
 * The first screen: the whole introduction — name, short intro, contact links,
 * facts and the longer story — ending in the two ways into the blog.
 */
export function AboutHero({
  eyebrow,
  name,
  tagline,
  stats,
  links,
  facts,
  content,
  primaryLink,
  secondaryLink,
  isOwner,
}: AboutHeroProps) {
  return (
    <section aria-labelledby="about-hero-heading" className="pt-[var(--space-xl)] pb-[var(--space-section)]">
      <div className="mx-auto max-w-[var(--page-width)] px-4 sm:px-6">
        <div className="max-w-[var(--content-width)]">
          <div className="flex items-center gap-[var(--space-2xs)]">
            <p className="text-xs font-semibold text-accent-foreground">{eyebrow}</p>
            {isOwner && <EditIconLink href="/admin/about" size="icon-xs" />}
          </div>

          <h1
            id="about-hero-heading"
            className="mt-[var(--space-2xs)] font-heading text-[length:var(--text-display)] leading-[var(--leading-tight)] tracking-[var(--tracking-display)] text-balance break-keep"
          >
            {name}
          </h1>
          {tagline && (
            <p className="mt-[var(--space-2xs)] text-[length:var(--text-lg)] text-pretty text-muted-foreground">
              {tagline}
            </p>
          )}

          {stats.length > 0 && (
            <ul className="mt-[var(--space-sm)] flex flex-wrap gap-x-[var(--space-sm)] gap-y-[var(--space-3xs)] text-xs text-muted-foreground tabular-nums">
              {stats.map((stat) => (
                <li key={stat}>{stat}</li>
              ))}
            </ul>
          )}

          {links.length > 0 && (
            <div className="mt-[var(--space-md)]">
              <ProfileLinks links={links} />
            </div>
          )}

          {facts.length > 0 && <HeroFacts facts={facts} />}

          {content.trim() && (
            <div className="mt-[var(--space-lg)]">
              <PostContent content={content} />
            </div>
          )}

          <div className="mt-[var(--space-lg)] flex flex-wrap gap-[var(--space-2xs)]">
            <Button asChild size="lg">
              <Link href={primaryLink.href}>
                {primaryLink.label}
                <ArrowRight />
              </Link>
            </Button>
            {secondaryLink && (
              <Button asChild size="lg" variant="outline">
                <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Label beside answer — no rules, just a narrow label column and even line spacing. */
function HeroFacts({ facts }: { facts: readonly ProfileFact[] }) {
  return (
    <dl className="mt-[var(--space-lg)] space-y-[var(--space-2xs)] text-sm">
      {facts.map((fact, index) => (
        <div
          key={`${index}-${fact.label}`}
          className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-[var(--space-sm)] sm:grid-cols-[7rem_minmax(0,1fr)]"
        >
          <dt className="text-muted-foreground">{fact.label}</dt>
          <dd className="break-keep">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
