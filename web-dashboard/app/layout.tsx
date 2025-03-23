import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import FirebaseInit from '@/components/firebase-init'

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

/**
 * Metadata for the application
 * Includes title, description, and favicon settings
 */
export const metadata: Metadata = {
  title: 'DriveMate',
  description: 'Transportation management platform',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/DM-center.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/DM-center.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/DM center.png" />
        <link rel="apple-touch-icon" href="/DM center.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <FirebaseInit />
        {children}
      </body>
    </html>
  )
}

