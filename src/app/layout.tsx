import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Image Generator Pro",
  description: "Generate stunning images with AI using advanced Flux models. Professional-grade image generation for creators and businesses.",
  keywords: ["AI", "image generation", "art", "artificial intelligence", "Flux", "creative tools", "commercial license"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen`}>
        {/* Simple Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-xl text-gray-800">ImageGen Pro</span>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-800 font-medium transition-colors">Generate</a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-800 font-medium transition-colors">Pricing</a>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </nav>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}