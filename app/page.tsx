import UploadForm from "../components/UploadForm";

export default function Home() {
  return (
    <div
      style={{
        background: "white",
        padding: 32,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}
    >
      <h1 style={{ marginTop: 0 }}>ZIP リポジトリ解析ツール</h1>
      <p style={{ color: "#555" }}>
        ローカルのリポジトリを ZIP にしてアップロードすると、構造と内容を解析します。
      </p>

      <UploadForm />
    </div>
  );
}
