import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Card,
  Row,
  Col,
  Spin,
  Empty,
  Modal,
  Avatar,
  Dropdown,
  Menu,
  Typography,
  DatePicker,
  Button,
  Select,
  Switch,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  BulbOutlined,
  BulbFilled,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

type Event = {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  venue: string;
  status: string;
  image_url?: string;
  price: number;
  max_participants: number;
  organizer_id: number;
  organizer?: {
    id: number;
    name: string;
  };
};

const { Title } = Typography;

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modalTambahVisible, setModalTambahVisible] = useState(false);
  const [form] = Form.useForm();
  const [price, setPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState(""); // Untuk input berformat rupiah
  const [startDatetime, setStartDatetime] = useState<string>("");
  const [endDatetime, setEndDatetime] = useState<string>("");
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
    const num = parseInt(raw, 10);

    if (!isNaN(num)) {
      setPrice(num); // Simpan sebagai angka
      setPriceInput(
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(num)
      );
    } else {
      setPrice(null);
      setPriceInput("");
    }
  };

  const EVENTS_PER_PAGE = 6;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let res;

      if (user?.role === "organizer") {
        res = await api.get("/my-events");
        setEvents(res.data.data || []);
      } else {
        // Admin hanya lihat event yang published
        res = await api.get("/events", {
          params: {
            status: "published",
            sort: "start_datetime",
            order: "asc",
            per_page: 100,
          },
        });

        setEvents(res.data.data || []);
      }

      console.log("Events fetched:", user?.role, user?.id);
    } catch (err) {
      console.error("Gagal memuat event:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && user?.role) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    const filtered = events.filter((ev) =>
      ev.title.toLowerCase().includes(search.toLowerCase())
    );
    const start = (currentPage - 1) * EVENTS_PER_PAGE;
    const end = start + EVENTS_PER_PAGE;
    setVisibleEvents(filtered.slice(start, end));
  }, [events, search, currentPage]);

  const totalPages = Math.ceil(
    events.filter((ev) => ev.title.toLowerCase().includes(search.toLowerCase()))
      .length / EVENTS_PER_PAGE
  );

  const openModal = (event: Event, editMode: boolean = false) => {
    setSelectedEvent(event);

    if (editMode) {
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        venue: event.venue,
        status: event.status,
        price: event.price,
        max_participants: event.max_participants,
        image_url: event.image_url || "",
      });
      setPriceInput(
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(event.price)
      );
      setStartDatetime(event.start_datetime);
      setEndDatetime(event.end_datetime);
      setModalTambahVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setModalVisible(false);
  };

  const showNotif = (message: string, duration = 2000) => {
    setNotifMessage(message);
    setNotifVisible(true);

    setTimeout(() => {
      setNotifVisible(false);
      setNotifMessage("");
    }, duration);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        ...values,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        price: price ?? 0,
      };

      if (selectedEvent) {
        // Update
        await api.put(`/events/${selectedEvent.id}`, data);
        showNotif("✅Event berhasil diperbarui!");
      } else {
        // Tambah baru
        await api.post("/events", data);
        showNotif("✅Event berhasil ditambahkan!");
      }

      setModalTambahVisible(false);
      setSelectedEvent(null);
      form.resetFields();
      fetchEvents();
    } catch (err) {
      console.error(err);
      showNotif("❌Terjadi kesalahan saat menyimpan event.");
    }
  };

  const handleDelete = async (eventId: number) => {
    try {
      await api.delete(`/events/${eventId}`);
      showNotif("✅Event berhasil dihapus!");

      fetchEvents();
    } catch (err) {
      console.error(err);
      showNotif("❌Gagal menghapus event.");
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pages.push("...");
      }
    }

    const circleButtonStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: "none",
      backgroundColor: "#fff",
      color: "#FA541C",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap", // ⬅ penting agar responsif
          gap: 12,
          marginTop: 32,
          padding: "8px 16px",
          background: "#F84F39",
          borderRadius: 999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          maxWidth: "100%",
        }}
      >
        {/* Tombol Sebelumnya */}
        <button
          style={{
            ...circleButtonStyle,
            opacity: currentPage === 1 ? 0.4 : 1,
          }}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          {"<"}
        </button>

        {/* Tombol Angka & ... */}
        {pages.map((p, idx) => (
          <button
            key={idx}
            style={{
              ...circleButtonStyle,
              backgroundColor: p === currentPage ? "#FFFFFF" : "#fff",
              color: "#FA541C",
              cursor: p === "..." ? "default" : "pointer",
              fontWeight: p === currentPage ? "bold" : "normal",
              boxShadow: p === currentPage ? "0 0 0 2px #FA541C inset" : "none",
            }}
            disabled={p === "..."}
            onClick={() => typeof p === "number" && setCurrentPage(p)}
          >
            {p}
          </button>
        ))}

        {/* Tombol Selanjutnya */}
        <button
          style={{
            ...circleButtonStyle,
            opacity: currentPage === totalPages ? 0.4 : 1,
          }}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {">"}
        </button>
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{ minHeight: "100vh", width: "100vw" }}
      className={darkMode ? "dark-mode" : ""}
    >
      {/* Top Bar */}
      <div
        style={{
          backgroundColor: "#FA541C",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <Title level={3} style={{ margin: 0, color: "#fff" }}>
          Tech Events
        </Title>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Switch
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
            checked={darkMode}
            onChange={setDarkMode}
          />
        </div>

        <Dropdown overlay={userMenu} trigger={["click"]}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: 8,
            }}
          >
            <Avatar icon={<UserOutlined />} />
            <span style={{ color: "#fff", fontWeight: 600 }}>{user?.name}</span>
            <DownOutlined style={{ color: "#fff" }} />
          </div>
        </Dropdown>
      </div>
      {user?.role === "organizer" && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            margin: "1rem 2rem 0 2rem",
          }}
        >
          <button
            onClick={() => setModalTambahVisible(true)}
            style={{
              backgroundColor: "#FA541C",
              color: "#fff",
              padding: "8px 20px",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#ff7545";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#FA541C";
            }}
          >
            + Tambah Event
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "2rem" }}>
        {loading ? (
          <Spin size="large" tip="Memuat event..." />
        ) : visibleEvents.length === 0 ? (
          <Empty description="Tidak ada event ditemukan." />
        ) : (
          <Row gutter={[16, 16]}>
            {visibleEvents.map((ev) => (
              <Col xs={24} sm={12} md={8} key={ev.id}>
                <Card
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "70%",
                          display: "inline-block",
                        }}
                        title={ev.title}
                      >
                        {ev.title}
                      </span>
                      {user?.role === "organizer" ? (
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 8,
                            backgroundColor:
                              ev.status === "published"
                                ? "#52c41a"
                                : ev.status === "draft"
                                ? "#faad14"
                                : "#f5222d",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor: "default",
                            fontSize: "12px",
                            textTransform: "capitalize",
                          }}
                        >
                          {ev.status}
                        </span>
                      ) : (
                        ev.organizer && (
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: 8,
                              backgroundColor: "#FA541C",
                              color: "#fff",
                              fontWeight: "bold",
                              cursor: "default",
                              fontSize: "12px",
                            }}
                          >
                            {ev.organizer.name}
                          </span>
                        )
                      )}
                    </div>
                  }
                  bordered
                  hoverable
                  style={{
                    backgroundColor: "#FFF8F0",
                    borderRadius: 12,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => openModal(ev)}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 6px 15px rgba(0,0,0,0.15)")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 4px 10px rgba(0,0,0,0.05)")
                  }
                  actions={
                    user?.role === "organizer" && ev.organizer_id === user.id
                      ? [
                          <Button
                            style={{
                              padding: "15px 70px",
                              backgroundColor: "#faad14",
                              color: "#fff",
                            }}
                            key="edit"
                            type="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(ev, true);
                            }}
                            onMouseOver={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "#ffc53d"; // warna kuning terang saat hover
                            }}
                            onMouseOut={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "#faad14";
                            }}
                          >
                            Edit
                          </Button>,
                          <Button
                            style={{
                              padding: "15px 70px",
                              backgroundColor: "#f5222d",
                              color: "#fff",
                            }}
                            key="delete"
                            type="link"
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              setEventToDelete(ev);
                              setDeleteConfirmVisible(true);
                            }}
                            onMouseOver={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "#ff4d4f"; // merah terang saat hover
                            }}
                            onMouseOut={(e) => {
                              (
                                e.target as HTMLButtonElement
                              ).style.backgroundColor = "#f5222d";
                            }}
                          >
                            Delete
                          </Button>,
                        ]
                      : undefined
                  }
                >
                  <p style={{ color: "#595959", minHeight: 60 }}>
                    {ev.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {/* Harga */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 12px",
                        borderRadius: 8,
                        backgroundColor: "#52c41a", // hijau
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      <MoneyCollectOutlined style={{ marginRight: 6 }} />
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format((ev as any).price || 0)}
                    </span>

                    {/* Max Peserta */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 12px",
                        borderRadius: 8,
                        backgroundColor: "#1890ff", // biru cerah
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      <UserOutlined style={{ marginRight: 6 }} />
                      {(ev as any).max_participants || 0} Peserta
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {renderPagination()}
      </div>

      {/* Modal Detail */}
      <Modal
        title={selectedEvent?.title}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        bodyStyle={{ borderRadius: 12 }}
      >
        {selectedEvent && (
          <div style={{ color: "#595959" }}>
            <p>{selectedEvent.description}</p>
            <p>
              <strong>Tanggal Mulai:</strong>{" "}
              {new Date(selectedEvent.start_datetime).toLocaleDateString(
                "id-ID",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
            <p>
              <strong>Tanggal Selesai:</strong>{" "}
              {new Date(selectedEvent.end_datetime).toLocaleDateString(
                "id-ID",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
            <p>
              <strong>Tempat:</strong> {selectedEvent.venue}
            </p>
          </div>
        )}
      </Modal>
      <Modal
        title={selectedEvent ? "Update Event" : "Tambah Event Baru"}
        open={modalTambahVisible}
        onCancel={() => {
          form.resetFields();
          setModalTambahVisible(false);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "draft", price: 0 }}
        >
          <Form.Item
            label="Judul"
            name="title"
            rules={[{ required: true, message: "Judul wajib diisi" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Deskripsi"
            name="description"
            rules={[{ required: true, message: "Deskripsi wajib diisi" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Tempat"
            name="venue"
            rules={[{ required: true, message: "Tempat wajib diisi" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Tanggal & Waktu Mulai" required>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(value) => {
                setStartDatetime(value ? value.toISOString() : "");
              }}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="Tanggal & Waktu Selesai" required>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(value) => {
                setEndDatetime(value ? value.toISOString() : "");
              }}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Status wajib dipilih" }]}
          >
            <Select>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="published">Published</Select.Option>
              {selectedEvent && (
                <Select.Option value="cancelled">Cancelled</Select.Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item label="Harga" name="price">
            <Input
              value={priceInput}
              onChange={handlePriceChange}
              placeholder="Masukkan harga"
            />
          </Form.Item>

          <Form.Item
            label="Max Peserta"
            name="max_participants"
            rules={[{ required: true, message: "Jumlah peserta wajib diisi" }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item label="Image URL" name="image_url">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Simpan Event
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={deleteConfirmVisible}
        title="Yakin ingin menghapus event ini?"
        onOk={() => {
          if (eventToDelete) {
            handleDelete(eventToDelete.id);
          }
          setDeleteConfirmVisible(false);
          setEventToDelete(null);
        }}
        onCancel={() => {
          setDeleteConfirmVisible(false);
          setEventToDelete(null);
        }}
        okText="Hapus"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        <p>{eventToDelete?.title}</p>
      </Modal>
      <Modal
        open={notifVisible}
        footer={null}
        closable={false}
        centered
        bodyStyle={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: "bold",
          padding: "24px 16px",
        }}
      >
        {notifMessage}
      </Modal>
    </div>
  );
}
