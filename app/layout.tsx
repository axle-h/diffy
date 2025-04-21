import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import './global.css'
import React from 'react'
import { Provider } from '@/components/ui/provider'
import { Toaster } from '@/components/ui/toaster'

const rubik = Rubik({
    subsets: ['latin'],
    variable: '--font-rubik',
})

export const metadata: Metadata = {
    title: 'diffy',
    description: 'Generate diffs with LLMs from public Github',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={rubik.variable} suppressHydrationWarning>
            <head>
                <title>diffy</title>
                <link
                    rel="icon"
                    type="image/png"
                    href="/favicon-96x96.png"
                    sizes="96x96"
                />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <meta name="apple-mobile-web-app-title" content="diffy" />
                <link rel="manifest" href="/site.webmanifest" />
            </head>
            <body>
                <Provider>
                    <Toaster />
                    {children}
                </Provider>
            </body>
        </html>
    )
}
