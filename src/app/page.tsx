import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";

import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PersonSchema } from "@/components/schema/person-schema";
import { Metadata } from 'next';
import { Icons } from "@/components/icons";
import ShinyButton from "@/components/ui/shiny-button";
import { AgeCounter } from "@/components/age-counter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FlipAvatar } from "@/components/flip-avatar";
import { SteamHoverCard } from "@/components/steam-hover-card";
import { YouTubeHoverCard } from "@/components/youtube-hover-card";
import { XHoverCard } from "@/components/x-hover-card";
import { LinkedInHoverCard } from "@/components/linkedin-hover-card";
import { InstagramHoverCard } from "@/components/instagram-hover-card";
import { CodePenHoverCard } from "@/components/codepen-hover-card";
import { BuyMeACoffeeHoverCard } from "@/components/bmc-hover-card";
import { DiscordHoverCard } from "@/components/discord-hover-card";
import { SteamNowPlaying } from "@/components/steam-now-playing";
import { BirthdayFireworks } from "@/components/birthday-fireworks";
import { BirthdayHat } from "@/components/birthday-hat";
import { VisitorCounter } from "@/components/lazy-client";
import { SocialGlowLink } from "@/components/social-glow-link";
import { GitHubCalendarSection } from "@/components/github-calendar-section";
import { TechStackSection } from "@/components/tech-stack-section";
import { ProjectsSection } from "@/components/projects-section";

const BLUR_FADE_DELAY = 0.04;

// Brand colors for social icon hover glow
const SOCIAL_BRAND_COLORS: Record<string, string> = {
  GitHub: "#333333",
  LinkedIn: "#0a66c2",
  X: "#1da1f2",
  Youtube: "#ff0000",
  Instagram: "#e4405f",
  Steam: "#00adee",
  CodePen: "#47cf73",
  Discord: "#5865f2",
  buyMeACoffee: "#ffdd00",
};
// Plain-text description — DATA.summary is markdown and leaks syntax into meta tags
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
        url: `${DATA.url}/portfolio.png`,
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
    images: [`${DATA.url}/portfolio.png`],
  },
};

function SectionLabel({ label }: { label: string }) {
  return (
    <span className="inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
      {label}
    </span>
  );
}

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
              <div className="flex-col flex flex-1 space-y-1.5">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                  yOffset={8}
                  text={`hey, ${DATA.name.split(" ")[0]} here`}
                  as="h1"
                />
                <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
                  <AgeCounter />
                </BlurFade>
                <BlurFadeText
                  className="max-w-[600px] text-muted-foreground md:text-xl"
                  delay={BLUR_FADE_DELAY}
                  text={DATA.description}
                />
              </div>
              <BlurFade delay={BLUR_FADE_DELAY}>
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

            {/* About */}
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
                {DATA.summary}
              </Markdown>
            </BlurFade>

            {/* Social links + Now Playing */}
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

                      if (name === "Steam") {
                        return (
                          <SteamHoverCard key={name}>
                            {socialLink}
                          </SteamHoverCard>
                        );
                      }

                      if (name === "Youtube") {
                        return (
                          <YouTubeHoverCard key={name}>
                            {socialLink}
                          </YouTubeHoverCard>
                        );
                      }

                      if (name === "X") {
                        return (
                          <XHoverCard key={name}>
                            {socialLink}
                          </XHoverCard>
                        );
                      }

                      if (name === "LinkedIn") {
                        return (
                          <LinkedInHoverCard key={name}>
                            {socialLink}
                          </LinkedInHoverCard>
                        );
                      }

                      if (name === "Instagram") {
                        return (
                          <InstagramHoverCard key={name}>
                            {socialLink}
                          </InstagramHoverCard>
                        );
                      }

                      if (name === "CodePen") {
                        return (
                          <CodePenHoverCard key={name}>
                            {socialLink}
                          </CodePenHoverCard>
                        );
                      }

                      if (name === "buyMeACoffee") {
                        return (
                          <BuyMeACoffeeHoverCard key={name}>
                            {socialLink}
                          </BuyMeACoffeeHoverCard>
                        );
                      }

                      if (name === "Discord") {
                        return (
                          <DiscordHoverCard key={name}>
                            {socialLink}
                          </DiscordHoverCard>
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

{/* ─── SKILLS ─── */}
        <section id="skills">
          <TechStackSection />
        </section>

        {/* ─── FEATURED PROJECTS ─── */}
        <section id="projects">
          <ProjectsSection />
        </section>

{/* ─── WORK ─── */}
        <section id="work">
          <div className="flex min-h-0 flex-col gap-y-3">
            <BlurFade delay={BLUR_FADE_DELAY * 12}>
              <SectionLabel label="Career" />
              <h2 className="mt-1.5 text-xl font-bold tracking-tight">Work Experience</h2>
            </BlurFade>
            <div className="space-y-3">
              {DATA.work.map((work, id) => (
                <BlurFade
                  key={work.company}
                  delay={BLUR_FADE_DELAY * 12.5 + id * 0.05}
                >
                  <ResumeCard
                    key={work.company}
                    logoUrl={work.logoUrl}
                    altText={work.company}
                    title={work.company}
                    subtitle={work.title}
                    href={work.href}
                    badges={work.badges}
                    period={`${work.start} - ${work.end}`}
                    description={work.description}
                    redacted={(work as any).redacted}
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        </section>


        {/* ─── EDUCATION ─── */}
        <section id="education">
          <div className="flex min-h-0 flex-col gap-y-3">
            <BlurFade delay={BLUR_FADE_DELAY * 13}>
              <SectionLabel label="Academic" />
              <h2 className="mt-1.5 text-xl font-bold tracking-tight">Education</h2>
            </BlurFade>
            {DATA.education.map((education, id) => (
              <BlurFade
                key={education.school}
                delay={BLUR_FADE_DELAY * 13.5 + id * 0.05}
              >
                <ResumeCard
                  key={education.school}
                  href={education.href}
                  logoUrl={education.logoUrl}
                  altText={education.school}
                  title={education.school}
                  subtitle={education.degree}
                  period={`${education.start} - ${education.end}`}
                />
              </BlurFade>
            ))}
          </div>
        </section>


        {/* ─── NOW PLAYING ─── */}
        {Boolean(DATA.contact.social.Steam.navbar) && (
          <BlurFade delay={BLUR_FADE_DELAY * 13.5}>
            <SteamNowPlaying />
          </BlurFade>
        )}

        

{/* ─── CONTACT ─── */}
        <section id="contact">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card/60 via-card/40 to-card/20 py-12 text-center group/contact">
              {/* Animated gradient mesh */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 60% 40% at 20% 50%, hsl(var(--foreground)) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 80% 50%, hsl(var(--foreground)) 0%, transparent 70%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-foreground/10 blur-3xl transition-all duration-700 group-hover/contact:bg-foreground/15 group-hover/contact:scale-110"
              />
              {/* Subtle animated border glow on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/contact:opacity-100"
                style={{
                  background: "radial-gradient(ellipse 80% 50% at 50% 100%, hsl(var(--foreground) / 0.06) 0%, transparent 70%)",
                }}
              />
              <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
              <SectionLabel label="Get in touch" />
              <p className="text-xl text-muted-foreground">
               I'd love to hear from you.
              </p>
              <a
                href={DATA.contact.social.X.navbar ? DATA.contact.social.X.url : DATA.contact.social.GitHub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/cta inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-background/70 px-5 py-2.5 text-sm font-medium shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-background hover:shadow-lg hover:border-foreground/20"
              >
                <span className="relative">
                  <Avatar className="size-6 transition-transform duration-300 group-hover/cta:scale-110">
                    <AvatarImage src={DATA.avatarUrl} alt={DATA.name} />
                    <AvatarFallback>{DATA.initials}</AvatarFallback>
                  </Avatar>
                  <span className="absolute inset-0 rounded-full animate-ping bg-foreground/10 group-hover/cta:bg-foreground/20" style={{ animationDuration: '2s' }} />
                </span>
                Let's talk
                <span className="transition-transform duration-200 group-hover/cta:translate-x-0.5">→</span>
              </a>
              </div>
            </div>
          </BlurFade>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-border/40 pt-8 pb-4">
          <BlurFade delay={BLUR_FADE_DELAY * 17}>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">{DATA.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Full Stack Developer from Tunisia.
                  <br />Building modern web applications.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Links</p>
                <div className="flex flex-col gap-1.5">
                  {DATA.navbar.slice(1).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Meta</p>
                <div className="flex flex-col gap-1.5">
                  <Link href="/sitemap.xml" className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1">
                    Sitemap
                  </Link>
                  <Link href="/rss.xml" className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1">
                    RSS Feed
                  </Link>
                  <a
                    href={DATA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-all duration-200 w-fit hover:translate-x-1"
                  >
                    Source Code
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-border/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} {DATA.name}. Open source under{' '}
                <a
                  href="https://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
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

