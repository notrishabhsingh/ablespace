import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/theme-provider';
import {
  ColorProvider,
  accentPrePaintScript,
} from '@/components/providers/color-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pyramid — Task Management',
  description:
    'A task management workspace: boards, lists, projects and rich task detail with light/dark and accent theming.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: next-themes and the accent script mutate <html>
    // attributes before React hydrates, which is expected and safe here.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: accentPrePaintScript }} />
      </head>
      <body
        className={cn(
          inter.variable,
          'min-h-screen bg-background font-sans text-foreground antialiased',
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ColorProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
