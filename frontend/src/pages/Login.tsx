// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
  Card,
  Checkbox,
} from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";

const { Title } = Typography;

export default function Login() {
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();
  const { login, token } = useAuth();

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    setError("");
    try {
      await login(values.email, values.password, remember);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#FFF8F0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          border: "none",
        }}
        bodyStyle={{ padding: "2rem" }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: 0,
              color: "#FA541C",
              fontWeight: "bold",
            }}
          >
            Login Tech Events
          </Title>

          {error && <Alert message={error} type="error" showIcon />}

          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Silakan masukkan email" },
                { type: "email", message: "Format email tidak valid" },
              ]}
            >
              <Input
                placeholder="Masukkan email"
                size="large"
                style={{
                  borderRadius: 8,
                  transition: "all 0.3s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Silakan masukkan password" }]}
            >
              <Input.Password
                placeholder="Masukkan password"
                size="large"
                style={{
                  borderRadius: 8,
                  transition: "all 0.3s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox
                checked={remember}
                onChange={(e: CheckboxChangeEvent) =>
                  setRemember(e.target.checked)
                }
              >
                Ingat saya
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                style={{
                  background:
                    "linear-gradient(90deg, #FA541C 0%, #FF7A45 100%)",
                  border: "none",
                  borderRadius: 999,
                  fontWeight: 600,
                  height: 45,
                  fontSize: "16px",
                  boxShadow: "0 4px 12px rgba(250, 84, 28, 0.25)",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.filter =
                    "brightness(1.05)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.filter =
                    "brightness(1)";
                }}
                onMouseDown={(e) => {
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(0.98)";
                }}
                onMouseUp={(e) => {
                  (e.target as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
