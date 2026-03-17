import { Prompt } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-prompt",
});

export const metadata = {
  title: "Rizan's Thrift POS",
  description: "Modern POS & CRM for Thrift Shops",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} font-sans antialiased`}>
        {/* Sidebar (desktop only via CSS class) */}
        <Sidebar />

        {/* Bottom nav (mobile only via CSS class) */}
        <BottomNav />

        {/* Main content area shifts right on desktop, has bottom padding on mobile */}
        <main className="app-main">
          <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
