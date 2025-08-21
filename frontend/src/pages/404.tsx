import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFF8F0",
        width: "100vw",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Halaman yang Anda cari tidak ditemukan."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Kembali ke Beranda
          </Button>
        }
      />
    </div>
  );
}
