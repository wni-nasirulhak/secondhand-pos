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
        {children}
      </body>
    </html>
  );
}
