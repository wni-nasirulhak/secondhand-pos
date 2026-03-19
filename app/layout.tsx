import './globals.css'

export const metadata = {
  title: 'My App',
  description: 'Deployed with Cloudflare Pages',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
