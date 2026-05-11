export const metadata = {
  title: "Repo Scanner",
  description: "Upload a ZIP and scan repository contents"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui",
          background: "#f5f5f5"
        }}
      >
        <header
          style={{
            background: "#0070f3",
            color: "white",
            padding: "16px 24px",
            fontSize: 20,
            fontWeight: "bold"
          }}
        >
          Repo Scanner
        </header>

        <main style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
