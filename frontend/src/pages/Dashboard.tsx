// src/pages/Dashboard.tsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Typography, Card, message } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success("Berhasil logout");
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          background: "#fff",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Button
          type="primary"
          icon={<LogoutOutlined />}
          danger
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Header>

      <Content style={{ padding: "24px" }}>
        <Card>
          <Title level={4}>Selamat datang, {user?.name || "User"} 👋</Title>
          <Paragraph>
            Anda berhasil login ke sistem sebagai <b>{user?.role}</b>.
          </Paragraph>
        </Card>
      </Content>
    </Layout>
  );
}
