import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
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
        status="403"
        title="403"
        subTitle="Maaf, Anda tidak memiliki akses ke halaman ini."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Kembali ke Beranda
          </Button>
        }
      />
    </div>
  );
}
