import {ReactNode} from "react"
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface LayoutProps {
    children : ReactNode
}

export default function Layout({children}: LayoutProps) {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans h-screen`}
    >
     {children}
    </div>
  );
}
