import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import BackToTop from "@/components/BackToTop";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 dark:bg-black dark:text-slate-100">
        <ThemeProvider>
          <div className="flex-grow">
            <AuthProvider>
              {children}
            </AuthProvider>
          </div>
          <Footer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}