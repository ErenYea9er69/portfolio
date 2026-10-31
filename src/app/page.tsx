import { DATA } from "@/data/resume";
import Link from "next/link";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";

import Image from "next/image";
import { ResumeCard } from "@/components/resume-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PersonSchema } from "@/components/schema/person-schema";
import { Metadata } from 'next';
import { AgeCounter } from "@/components/age-counter";
import { FlipAvatar } from "@/components/flip-avatar";
import { BirthdayHat } from "@/components/birthday-hat";
import { VisitorCounter, BirthdayFireworks, GitHubCalendarSection, XHoverCard } from "@/components/lazy-client";
import { SocialGlowLink } from "@/components/social-glow-link";
import { TechStackSection } from "@/components/tech-stack-section";
import { ProjectsSection } from "@/components/projects-section";

const BLUR_FADE_DELAY = 0.04;

const SOCIAL_BRAND_COLORS: Record<string, string> = {
  GitHub: "#333333",
  X: "#1da1f2",
};

const HOME_DESCRIPTION =
  "Freelance full stack developer from Tunisia. I build with Next.js, TypeScript and React — MyNet, ScopyAI, anime-site and more.";

export const metadata: Metadata = {
  title: DATA.name,
  description: HOME_DESCRIPTION,
  openGraph: {
    title: DATA.name,
    description: HOME_DESCRIPTION,
    url: DATA.url,
    siteName: DATA.name,
    images: [
      {
        url: `${DATA.url}/api/og`,
        width: 1200,
        height: 630,
        alt: `${DATA.name}'s Portfolio`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: DATA.name,
    description: HOME_DESCRIPTION,
    creator: '@ErenYea9er',
    images: [`${DATA.url}/api/og`],
  },
};

export default function Page() {
  return (
    <>
      <BirthdayFireworks />
      <main className="flex min-h-[100dvh] flex-col space-y-12 sm:space-y-14">
        <PersonSchema />

        {/* ─── HERO ─── */}
        <section id="hero">
          <div className="mx-auto w-full space-y-8">
            <div className="flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-col flex flex-1 space-y-2">
                <BlurFadeText
                  priority
                  delay={BLUR_FADE_DELAY}
                  className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                  yOffset={8}
                  text="Hey, Welcome here"
                  as="h1"
                />
                <BlurFade priority delay={BLUR_FADE_DELAY * 1.5}>
                  <AgeCounter />
                </BlurFade>
                <BlurFadeText
                  priority
                  className="max-w-[600px] text-muted-foreground md:text-xl"
                  delay={BLUR_FADE_DELAY}
                  text={DATA.description}
                />
              </div>
              <BlurFade priority delay={BLUR_FADE_DELAY}>
                <div className="profile-wrapper">
                  <FlipAvatar
                    src={DATA.avatarUrl}
                    hoverSrc="/github-avatar.png"
                    alt={DATA.name}
                    fallback={DATA.initials}
                  />
                  <BirthdayHat />
                </div>
              </BlurFade>
            </div>

            {/* Bio / About with clean typographic hierarchy (no AI icon slop in prose) */}
            <BlurFade priority delay={BLUR_FADE_DELAY * 3}>
              <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  I’m <strong className="font-semibold text-foreground">Rayen</strong>, a{" "}
                  <strong className="font-semibold text-foreground">Full Stack Engineer</strong> with{" "}
                  <strong className="font-semibold text-foreground">2+ years of experience</strong> based in Tunisia.
                </p>
                <p>
                  I build end-to-end web applications with{" "}
                  <span className="font-medium text-foreground">React</span>,{" "}
                  <span className="font-medium text-foreground">Next.js</span>,{" "}
                  <span className="font-medium text-foreground">TypeScript</span>, and{" "}
                  <span className="font-medium text-foreground">Node.js</span> — from database schemas and API architecture through to polished, fluid user interfaces.
                </p>
                <p>
                  On the backend I build with{" "}
                  <span className="font-medium text-foreground">Express</span>,{" "}
                  <span className="font-medium text-foreground">PostgreSQL</span>,{" "}
                  <span className="font-medium text-foreground">MongoDB</span>, and{" "}
                  <span className="font-medium text-foreground">Supabase</span>, focusing on type safety, deterministic failure handling, and real-time responsiveness.
                </p>
              </div>
            </BlurFade>

            {/* Social links */}
            <div className="inline-flex flex-col gap-3 items-start">
              <BlurFade delay={BLUR_FADE_DELAY * 4.5}>
                <div className="flex flex-wrap items-center gap-3">
                  {Object.entries(DATA.contact.social)
                    .filter(([_, social]) => social.navbar !== false)
                    .map(([name, social]) => {
                      const brandColor = SOCIAL_BRAND_COLORS[name];
                      const socialLink = (
                        <SocialGlowLink
                          href={social.url}
                          name={name}
                          brandColor={brandColor}
                        >
                          <social.icon className="size-5 transition-colors duration-200" />
                        </SocialGlowLink>
                      );

                      if (name === "X") {
                        return (
                          <XHoverCard key={name}>
                            {socialLink}
                          </XHoverCard>
                        );
                      }

                      return (
                        <Tooltip key={name}>
                          <TooltipTrigger asChild>
                            {socialLink}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{social.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                </div>
              </BlurFade>
            </div>
          </div>
        </section>

        {/* ─── GITHUB ACTIVITY ─── */}
        <section id="github-activity">
          <GitHubCalendarSection />
        </section>

        {/* ─── SKILLS & TECH STACK ─── */}
        <section id="skills">
          <TechStackSection />
        </section>

        {/* ─── FEATURED PROJECTS ─── */}
        <section id="projects">
          <ProjectsSection />
        </section>

        {/* ─── EXPERIENCE & EDUCATION (Merged side-by-side 50/50 to reduce scrolling) ─── */}
        <section id="experience-education" className="scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* Left Column (50%): Work Experience */}
            <div id="work" className="flex min-h-0 flex-col gap-y-3 h-full">
              <BlurFade delay={BLUR_FADE_DELAY * 12}>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Work Experience
                </h2>
              </BlurFade>
              <div className="space-y-3 flex-1 flex flex-col">
                {DATA.work.map((work, id) => (
                  <BlurFade
                    key={work.company}
                    delay={BLUR_FADE_DELAY * 12.3 + id * 0.05}
                    className="flex-1 flex flex-col"
                  >
                    <ResumeCard
                      className="h-full flex-1"
                      logoUrl={work.logoUrl}
                      altText={work.company}
                      title={work.company}
                      subtitle={work.title}
                      href={work.href}
                      badges={work.badges}
                      period={work.start ? `${work.start} - ${work.end}` : work.end}
                      description={work.description}
                      redacted={(work as any).redacted}
                      type="work"
                    />
                  </BlurFade>
                ))}
              </div>
            </div>

            {/* Right Column (50%): Education */}
            <div id="education" className="flex min-h-0 flex-col gap-y-3 h-full">
              <BlurFade delay={BLUR_FADE_DELAY * 12.2}>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Education
                </h2>
              </BlurFade>
              <div className="space-y-3 flex-1 flex flex-col">
                {DATA.education.map((education, id) => (
                  <BlurFade
                    key={education.school}
                    delay={BLUR_FADE_DELAY * 12.5 + id * 0.05}
                    className="flex-1 flex flex-col"
                  >
                    <ResumeCard
                      className="h-full flex-1"
                      logoUrl={education.logoUrl}
                      altText={education.school}
                      title={education.school}
                      subtitle={education.degree}
                      href={education.href}
                      period={education.start ? `${education.start} - ${education.end}` : education.end}
                      description={education.description}
                      type="education"
                    />
                  </BlurFade>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section id="contact">
          <BlurFade delay={BLUR_FADE_DELAY * 14}>
            <div className="relative overflow-hidden rounded-2xl border border-border/70 dark:border-white/[0.08] bg-gradient-to-b from-card/80 via-card/50 to-card/30 dark:from-zinc-950/70 dark:via-zinc-900/50 dark:to-zinc-950/70 py-12 text-center group/contact backdrop-blur-xl shadow-xs">
              <div className="relative z-10 flex flex-col items-center justify-center space-y-4 px-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Get in touch
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                  Have a project in mind, an opportunity, or just want to chat tech? Let's connect.
                </p>
                <div className="pt-2">
                  <a
                    href={DATA.contact.social.X.navbar ? DATA.contact.social.X.url : DATA.contact.social.GitHub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/cta inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-background hover:shadow-md hover:border-foreground/30 cursor-pointer"
                  >
                    <div className="relative size-6 overflow-hidden rounded-full">
                      <Image
                        src={DATA.avatarUrl}
                        alt={DATA.name}
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    </div>
                    <span>Let's talk</span>
                    <span className="transition-transform duration-200 group-hover/cta:translate-x-0.5">→</span>
                  </a>
                </div>
              </div>
            </div>
          </BlurFade>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-border/40 pt-8 pb-12 sm:pb-8">
          <BlurFade delay={BLUR_FADE_DELAY * 15}>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{DATA.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Full Stack Developer from Tunisia.
                  <br />Building modern, high-performance web software.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</p>
                <div className="flex flex-col gap-1">
                  {DATA.navbar.slice(1).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1 py-1 min-h-[28px] inline-flex items-center"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/cli"
                    className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1 py-1 min-h-[28px] inline-flex items-center"
                  >
                    CLI Mode
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta</p>
                <div className="flex flex-col gap-1">
                  <Link href="/sitemap.xml" className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1 py-1 min-h-[28px] inline-flex items-center">
                    Sitemap
                  </Link>
                  <Link href="/robots.txt" className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1 py-1 min-h-[28px] inline-flex items-center">
                    Robots.txt
                  </Link>
                  <a
                    href={DATA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1 py-1 min-h-[28px] inline-flex items-center"
                  >
                    Portfolio Source
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-border/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} {DATA.name}. Open source under{' '}
                <a
                  href="https://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors font-medium"
                >
                  MIT
                </a>
              </p>
              <VisitorCounter />
            </div>
          </BlurFade>
        </footer>
      </main>
    </>
  );
}
