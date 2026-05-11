export const metadata = {
  title: "Repo Scanner",
  description: "Upload a ZIP and scan repository contents"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
