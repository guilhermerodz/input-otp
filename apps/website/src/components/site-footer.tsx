import { siteConfig } from '../config/site'

const FOOTER_LINKS = [
  { label: 'GitHub', href: siteConfig.links.github },
  { label: 'npm', href: 'https://www.npmjs.com/package/input-otp' },
  { label: 'X', href: siteConfig.links.twitter },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          MIT licensed. Built by{' '}
          <a
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            guilhermerodz
          </a>
          .
        </p>

        <nav aria-label="Footer" className="flex items-center gap-6">
          {FOOTER_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
