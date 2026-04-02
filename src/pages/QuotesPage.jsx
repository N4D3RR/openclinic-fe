import { useState, useEffect } from "react"
import {
  Button,
  Alert,
  Table,
  Spinner,
  Pagination,
  Row,
  Col,
  Card,
  Form,
} from "react-bootstrap"
import { BsPlusLg, BsEyeFill, BsTrashFill } from "react-icons/bs"
import { useNavigate } from "react-router-dom"
import TopBar from "../components/layout/TopBar"
import QuoteForm from "../components/quotes/QuoteForm"
import StatusBadge from "../components/common/StatusBadge"
import api from "../services/api"

const QuotesPage = function () {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [kpi, setKpi] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [statusFilter, setStatusFilter] = useState("")
  const [patientFilter, setPatientFilter] = useState("")
  const [patients, setPatients] = useState([])

  const fetchQuotes = function () {
    setLoading(true)
    setError("")

    let endpoint = "/api/quotes?page=" + page + "&size=10"

    if (patientFilter) {
      endpoint =
        "/api/quotes/patient/" + patientFilter + "?page=" + page + "&size=10"
      if (statusFilter) endpoint += "&status=" + statusFilter
    } else if (statusFilter) {
      endpoint =
        "/api/quotes/status?status=" +
        statusFilter +
        "&page=" +
        page +
        "&size=10"
    }

    api
      .get(endpoint)
      .then(function (data) {
        setQuotes(data.content)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch(function () {
        setError("Errore nel caricamento dei preventivi")
        setLoading(false)
      })
  }

  const fetchKpi = function () {
    api
      .get("/api/quotes/kpi")
      .then(function (data) {
        setKpi(data)
      })
      .catch(function () {})
  }

  useEffect(
    function () {
      fetchQuotes()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, statusFilter, patientFilter],
  )

  useEffect(function () {
    fetchKpi()
    api
      .get("/api/patients?page=0&size=200")
      .then(function (data) {
        setPatients(data.content)
      })
      .catch(function () {})
  }, [])

  const handleDelete = function (id) {
    if (!window.confirm("Sei sicuro di voler eliminare questo preventivo?"))
      return
    api
      .delete("/api/quotes/" + id)
      .then(function () {
        fetchQuotes()
        fetchKpi()
      })
      .catch(function () {
        setError("Errore durante l'eliminazione")
      })
  }

  const handleSaved = function () {
    setShowModal(false)
    fetchQuotes()
    fetchKpi()
  }

  const handleResetFilters = function () {
    setStatusFilter("")
    setPatientFilter("")
    setPage(0)
  }

  const hasFilters = statusFilter || patientFilter

  const renderPagination = function () {
    if (totalPages <= 1) return null
    const items = []
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={function () {
            setPage(i)
          }}
        >
          {i + 1}
        </Pagination.Item>,
      )
    }
    return (
      <Pagination className="justify-content-center mt-3 mb-0">
        <Pagination.Prev
          onClick={function () {
            setPage(page - 1)
          }}
          disabled={page === 0}
        />
        {items}
        <Pagination.Next
          onClick={function () {
            setPage(page + 1)
          }}
          disabled={page === totalPages - 1}
        />
      </Pagination>
    )
  }

  return (
    <>
      <title>Preventivi — OpenClinic</title>
      <TopBar title="Preventivi" />
      {/* KPI */}
      {kpi && (
        <Row className="g-3 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-3">
                <div className="text-muted small fw-semibold text-nowrap">
                  Totali
                </div>
                <div
                  className="fw-bold fs-4"
                  style={{ color: "var(--bs-color-sidebar)" }}
                >
                  {kpi.total}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-3">
                <div className="text-muted small fw-semibold text-nowrap">
                  Accettati
                </div>
                <div
                  className="fw-bold fs-4"
                  style={{ color: "var(--bs-success)" }}
                >
                  {kpi.accepted}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-3">
                <div className="text-muted small fw-semibold text-nowrap">
                  In attesa
                </div>
                <div
                  className="fw-bold fs-4"
                  style={{ color: "var(--bs-warning)" }}
                >
                  {kpi.sent}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-3">
                <div className="text-muted small fw-semibold text-nowrap">
                  Rifiutati
                </div>
                <div
                  className="fw-bold fs-4"
                  style={{ color: "var(--bs-danger)" }}
                >
                  {kpi.rejected}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {error && (
          <Alert variant="danger" className="mb-0 py-2">
            {error}
          </Alert>
        )}

        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Form.Select
            style={{ width: 180 }}
            value={statusFilter}
            onChange={function (e) {
              setPage(0)
              setStatusFilter(e.target.value)
            }}
          >
            <option value="">Tutti gli stati</option>
            <option value="DRAFT">Bozza</option>
            <option value="SENT">Inviato</option>
            <option value="ACCEPTED">Accettato</option>
            <option value="REJECTED">Rifiutato</option>
          </Form.Select>

          <Form.Select
            style={{ width: 220 }}
            value={patientFilter}
            onChange={function (e) {
              setPage(0)
              setPatientFilter(e.target.value)
            }}
          >
            <option value="">Tutti i pazienti</option>
            {patients.map(function (p) {
              return (
                <option key={p.id} value={p.id}>
                  {p.lastName} {p.firstName}
                </option>
              )
            })}
          </Form.Select>

          {hasFilters && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleResetFilters}
            >
              ✕ Reset
            </Button>
          )}
        </div>

        <div className="ms-auto">
          <Button
            onClick={function () {
              setShowModal(true)
            }}
            className="border-0 fw-semibold btn-clinic"
          >
            <BsPlusLg className="me-2" />
            Nuovo Preventivo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" style={{ color: "var(--bs-primary)" }} />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center text-muted py-5">
          Nessun preventivo registrato
        </div>
      ) : (
        <>
          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Data</th>
                <th>Paziente</th>
                <th>Dentista</th>
                <th>Voci</th>
                <th>Totale</th>
                <th>Stato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(function (quote) {
                // calcolo totale sommando quotedPrice di ogni item
                const total = quote.items
                  ? quote.items.reduce(function (acc, item) {
                      return acc + Number(item.quotedPrice)
                    }, 0)
                  : 0

                return (
                  <tr
                    key={quote.id}
                    onClick={function () {
                      navigate("/quotes/" + quote.id)
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      {new Date(quote.createdAt).toLocaleDateString("it-IT")}
                    </td>
                    <td className="fw-semibold">
                      {quote.patient.firstName} {quote.patient.lastName}
                    </td>
                    <td>
                      {quote.dentist
                        ? quote.dentist.firstName + " " + quote.dentist.lastName
                        : "—"}
                    </td>
                    <td>{quote.items ? quote.items.length : 0} voci</td>
                    <td className="fw-semibold">€ {total.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={quote.status} />
                    </td>
                    <td
                      className="text-end"
                      onClick={function (e) {
                        e.stopPropagation()
                      }}
                    >
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        title="Apri"
                        onClick={function () {
                          navigate("/quotes/" + quote.id)
                        }}
                      >
                        <BsEyeFill size={13} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Elimina"
                        onClick={function () {
                          handleDelete(quote.id)
                        }}
                      >
                        <BsTrashFill size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
          {renderPagination()}
        </>
      )}

      <QuoteForm
        show={showModal}
        onClose={function () {
          setShowModal(false)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

export default QuotesPage
