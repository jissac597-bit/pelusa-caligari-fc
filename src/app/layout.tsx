import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pelusa Caligari FC | Portal Oficial",
  description: "Estadísticas, plantilla y administración oficial de Pelusa Caligari FC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-pelusa-black text-white relative">
        {/* Fondo de Estadio Global */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed pointer-events-none -z-20"
          style={{ backgroundImage: "url('/bg-futbol.jpg')" }}
        />
        {/* Capa Oscura Superpuesta (80% opacidad para máxima legibilidad) */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-[1px] pointer-events-none -z-10" />

        <main className="relative z-0 flex-1">{children}</main>
      </body>
    </html>
  );
}
