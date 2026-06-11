import React from "react"
import type { Metadata } from 'next'
import { Poppins, Crimson_Text, Newsreader, Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })
const crimsonText = Crimson_Text({ subsets: ['latin'], weight: ['400', '600', '700'] })
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--f-display',
})
const geist = Geist({ subsets: ['latin'], variable: '--f-body' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--f-mono' })

export const metadata: Metadata = {
  title: 'LAUNCH Employer Dashboard',
  description: 'Filter and explore student capability profiles powered by LAUNCH',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#ffffff',
    viewportFit: 'cover',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${newsreader.variable} ${geist.variable} ${geistMono.variable}`}>
      <head>
        <style>{`
          :root {
            --font-serif: '${newsreader.style.fontFamily}', 'Newsreader', Georgia, serif;
            --font-sans: '${geist.style.fontFamily}', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: '${geistMono.style.fontFamily}', 'Geist Mono', ui-monospace, monospace;
            --font-display: '${newsreader.style.fontFamily}', 'Newsreader', Georgia, serif;
            --font-body: '${geist.style.fontFamily}', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
            --legacy-font-poppins: '${poppins.style.fontFamily}';
            --legacy-font-crimson: '${crimsonText.style.fontFamily}';
          }
        `}</style>
      </head>
      <body className={`antialiased bg-background text-foreground`} style={{ fontFamily: 'var(--font-body)' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
