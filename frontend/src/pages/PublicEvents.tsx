import { useEffect, useState } from "react";
import api from "../api/axios";
import { Input, Card, Row, Col, Spin, Empty, Modal } from "antd";

type Event = {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  venue: string;
  status: string;
  organizer?: {
    id: number;
    name: string;
  };
};

export default function PublicEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const EVENTS_PER_PAGE = 6;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events", {
        params: {
          status: "published",
          sort: "start_datetime",
          order: sort,
          per_page: 100,
        },
      });
      setAllEvents(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat event:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [sort]);

  useEffect(() => {
    const filtered = allEvents.filter((event) =>
      event.title.toLowerCase().includes(search.toLowerCase())
    );

    const start = (currentPage - 1) * EVENTS_PER_PAGE;
    const end = start + EVENTS_PER_PAGE;
    setVisibleEvents(filtered.slice(start, end));
  }, [allEvents, search, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const openModal = (event: Event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setModalVisible(false);
  };

  // Buat total halaman
  const totalPages = Math.ceil(
    allEvents.filter((event) =>
      event.title.toLowerCase().includes(search.toLowerCase())
    ).length / EVENTS_PER_PAGE
  );

  // Fungsi untuk render pagination custom
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

  return (
    <div
      style={{
        backgroundColor: "#FFF8F0",
        minHeight: "100vh",
        width: "100vw",
      }}
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
        <h1
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Tech Events
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Input
            placeholder="Cari judul event..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              minWidth: 220,
              maxWidth: 360,
              height: 40,
              borderRadius: 999, // Biar oval seperti search bar modern
              padding: "0 16px",
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s",
            }}
            onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #FA541C33")}
            onBlur={(e) =>
              (e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)")
            }
          />

          <a href="/login">
            <button
              style={{
                padding: "8px 20px",
                fontWeight: 600,
                backgroundColor: "#fff",
                color: "#FA541C",
                border: "1px solid transparent",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
              onMouseOver={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.backgroundColor = "#FFF8F0";
                btn.style.color = "#FA541C";
              }}
              onMouseOut={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.backgroundColor = "#fff";
                btn.style.color = "#FA541C";
              }}
            >
              Login
            </button>
          </a>
        </div>
      </div>

      <div style={{ padding: "2rem" }}>
        {loading ? (
          <Spin size="large" tip="Memuat event..." />
        ) : visibleEvents.length === 0 ? (
          <Empty description="Tidak ada event ditemukan." />
        ) : (
          <Row gutter={[16, 16]}>
            {visibleEvents.map((event) => (
              <Col xs={24} sm={12} md={8} key={event.id}>
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
                        title={event.title}
                      >
                        {event.title}
                      </span>
                      {event.organizer && (
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
                          {event.organizer.name}
                        </span>
                      )}
                    </div>
                  }
                  bordered
                  hoverable
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => openModal(event)}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 6px 15px rgba(0,0,0,0.15)")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 4px 10px rgba(0,0,0,0.05)")
                  }
                >
                  <p style={{ color: "#595959", minHeight: 60 }}>
                    {event.description}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Pagination */}
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
    </div>
  );
}
