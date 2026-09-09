import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';
import { AuthProvider } from '@/lib/auth/AuthContext';
import ContactButton from '@/components/ui/ContactButton';
import GoogleTranslate from '@/components/ui/GoogleTranslate';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ATILA - Intelligent Procurement for Modern Enterprises',
  description: 'Built by Aatral Technologies, ATILA reflects real-world enterprise procurement challenges and best practices delivered through a modern, secure SaaS platform.',
  icons: {
    icon: '/png/productLogo.png',
    apple: '/png/productLogo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>       
        <link rel="icon" href="/png/productLogo.png" type="image/png" />
        {/* Prevent dark-mode flash: apply the saved/system theme before first paint.
            Reads the same 'atila-theme' key used by src/store/slices/uiSlice.ts. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('atila-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <StoreProvider>
          <AuthProvider>
            <GoogleTranslate />
            {children}
            <ContactButton />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
