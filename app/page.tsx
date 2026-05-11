import UploadForm from "../components/UploadForm";

export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Repo Crawler (ZIP / No API)</h1>
      <p>ローカルで git clone したリポジトリを ZIP にしてアップロードしてください。</p>
      <UploadForm />
    </main>
  );
}
