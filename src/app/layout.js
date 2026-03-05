import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50">
        
        {/* Content Area */}
        <div className="flex-grow">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>

        {/* Footer */}
        <Footer />

      </body>
    </html>
  );
}