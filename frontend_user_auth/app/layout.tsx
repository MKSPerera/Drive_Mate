import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'DriveMate Admin',
  description: 'Admin dashboard for DriveMate platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${fontSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

