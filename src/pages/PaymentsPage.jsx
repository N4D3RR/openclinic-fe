import { useEffect, useState } from "react"
import api from "../services/api"
import PaymentForm from "../components/payments/PaymentForm"
import TopBar from "../components/layout/TopBar"
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap"
import { BsCashCoin } from "react-icons/bs"
import PaymentTable from "../components/payments/PaymentTable"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const PaymentsPage = function () {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // paginazione
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // modale
  const [showModal, setShowModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [statusFilter, setStatusFilter] = useState("")

  // filtro date e KPI da BE
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [kpi, setKpi] = useState(null)

  // KPI: si carica una volta sola e dopo ogni salvataggio/eliminazione
  const fetchKpi = function () {
    api
      .get("/api/payments/kpi")
      .then(function (data) {
        setKpi(data)
      })
      .catch(function () {})
  }

  const fetchPayments = function () {
    setLoading(true)
    setError("")

    let endpoint
    if (dateFrom && dateTo) {
      endpoint =
        "/api/payments/date-range?from=" +
        dateFrom +
        "&to=" +
        dateTo +
        "&page=" +
        page +
        "&size=10" +
        (statusFilter ? "&status=" + statusFilter : "")
    } else if (statusFilter) {
      endpoint =
        "/api/payments/status?status=" +
        statusFilter +
        "&page=" +
        page +
        "&size=10"
    } else {
      endpoint = "/api/payments?page=" + page + "&size=10"
    }

    api
      .get(endpoint)
      .then(function (data) {
        setPayments(data.content)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch(function () {
        setError("Errore nel caricamento dei pagamenti")
        setLoading(false)
      })
  }

  useEffect(function () {
    fetchKpi()
  }, [])

  useEffect(
    function () {
      fetchPayments()
    },
    [page, statusFilter, dateFrom, dateTo],
  )

  const handleNew = function () {
    setSelectedPayment(null)
    setShowModal(true)
  }

  // apre modale precompilata per modifica
  const handleEdit = function (payment) {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  // elimina paziente con conferma
  const handleDelete = function (id) {
    if (!window.confirm("Sei sicuro di voler eliminare questo pagamento?"))
      return
    api
      .delete("/api/payments/" + id)
      .then(function () {
        fetchPayments()
        fetchKpi()
      })
      .catch(function () {
        setError("Errore durante l'eliminazione")
      })
  }

  // chiamato dal PaymentForm dopo salvataggio
  const handleSaved = function () {
    setShowModal(false)
    setSelectedPayment(null)
    fetchPayments()
    fetchKpi()
  }

  // dati grafico dal KPI BE (ordinati ASC per il grafico)
  const chartData = kpi
    ? [...kpi.monthlyRevenue].reverse().map(function (item) {
        const date = new Date(item.year, item.month - 1)
        return {
          month: date.toLocaleDateString("it-IT", {
            month: "short",
            year: "numeric",
          }),
          total: Number(item.total),
        }
      })
    : []

  return (
    <>
      <TopBar title="Pagamenti & Report" />

      {error && (
        <Alert variant="danger" className="mb-0 py-2">
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <div className="text-muted small fw-semibold">
                Totale incassato
              </div>
              <div className="fw-bold fs-4" style={{ color: "#22c55e" }}>
                € {kpi ? Number(kpi.totalPaid).toFixed(2) : "—"}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <div className="text-muted small fw-semibold">Da incassare</div>
              <div className="fw-bold fs-4" style={{ color: "#f59e0b" }}>
                € {kpi ? Number(kpi.totalPending).toFixed(2) : "—"}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <div className="text-muted small fw-semibold">
                Pagamenti completati
              </div>
              <div className="fw-bold fs-4" style={{ color: "#2a9d8f" }}>
                {kpi ? kpi.paidCount : "—"}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <div className="text-muted small fw-semibold">In sospeso</div>
              <div className="fw-bold fs-4" style={{ color: "#ef4444" }}>
                {kpi ? kpi.pendingCount : "—"}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Card comparativa mese corrente vs precedente */}
      {kpi && Number(kpi.previousMonth) > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="d-flex align-items-center gap-4 py-3">
            <div>
              <div className="text-muted small fw-semibold">Mese corrente</div>
              <div className="fw-bold fs-5">
                € {Number(kpi.currentMonth).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted small fw-semibold">
                Mese precedente
              </div>
              <div className="fw-bold fs-5">
                € {Number(kpi.previousMonth).toFixed(2)}
              </div>
            </div>
            {(function () {
              const delta = Number(kpi.currentMonth) - Number(kpi.previousMonth)
              const pct = Math.abs(
                (delta / Number(kpi.previousMonth)) * 100,
              ).toFixed(1)
              return (
                <div
                  className={
                    delta >= 0 ? "text-success fw-bold" : "text-danger fw-bold"
                  }
                >
                  {delta >= 0 ? "▲" : "▼"} {pct}% vs mese precedente
                </div>
              )
            })()}
          </Card.Body>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h6 className="fw-bold mb-3">Andamento incassi</h6>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2a9d8f" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2a9d8f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  tickFormatter={function (v) {
                    return v >= 1000
                      ? "€" + (v / 1000).toFixed(1) + "k"
                      : "€" + v
                  }}
                />
                <Tooltip
                  formatter={function (v) {
                    return ["€ " + Number(v).toFixed(2), "Incassato"]
                  }}
                  labelStyle={{ fontWeight: 600 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2a9d8f"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ fill: "#2a9d8f", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}

      {/* Filtri e bottone */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2 align-items-center">
          <Form.Control
            type="date"
            style={{ width: 160 }}
            value={dateFrom}
            onChange={function (e) {
              setPage(0)
              setDateFrom(e.target.value)
            }}
          />
          <span className="text-muted small">→</span>
          <Form.Control
            type="date"
            style={{ width: 160 }}
            value={dateTo}
            onChange={function (e) {
              setPage(0)
              setDateTo(e.target.value)
            }}
          />
          {(dateFrom || dateTo) && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={function () {
                setDateFrom("")
                setDateTo("")
                setPage(0)
              }}
            >
              ✕
            </Button>
          )}
          <Form.Select
            style={{ width: 200 }}
            value={statusFilter}
            onChange={function (e) {
              setPage(0)
              setStatusFilter(e.target.value)
            }}
          >
            <option value="">Tutti gli stati</option>
            <option value="PAID">Pagati</option>
            <option value="PENDING">In attesa</option>
            <option value="PARTIAL">Parziali</option>
          </Form.Select>
        </div>

        <Button
          onClick={handleNew}
          className="border-0 fw-semibold"
          style={{ backgroundColor: "#2a9d8f" }}
        >
          <BsCashCoin className="me-2" />
          Nuovo Pagamento
        </Button>
      </div>

      {/* Tabella pagamenti */}
      <PaymentTable
        payments={payments}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PaymentForm
        show={showModal}
        payment={selectedPayment}
        onClose={function () {
          setShowModal(false)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

export default PaymentsPage
