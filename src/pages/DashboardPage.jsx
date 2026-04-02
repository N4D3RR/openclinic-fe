import { useState, useEffect } from "react"
import { Card, Row, Col, Spinner, Alert, Button } from "react-bootstrap"
import {
  BsCalendarPlus,
  BsPersonPlusFill,
  BsSearch,
  BsClockFill,
  BsExclamationTriangleFill,
} from "react-icons/bs"
import { useNavigate } from "react-router-dom"
import TopBar from "../components/layout/TopBar"
import StatusBadge from "../components/common/StatusBadge"
import api from "../services/api"
import PatientForm from "../components/patients/PatientForm"

const DashboardPage = function () {
  const navigate = useNavigate()

  // appuntamenti di oggi
  const [appointments, setAppointments] = useState([])
  const [loadingAppts, setLoadingAppts] = useState(true)

  // preventivi in attesa
  const [pendingQuotes, setPendingQuotes] = useState([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)

  const [showPatientModal, setShowPatientModal] = useState(false)
  const [error, setError] = useState("")

  //creo la data odierna
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  useEffect(function () {
    // range di oggi: da mezzanotte a 23:59
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // fetch appuntamenti di oggi
    api
      .get(
        "/api/appointments/date-range?from=" +
          todayStart.toISOString() +
          "&to=" +
          todayEnd.toISOString(),
      )
      .then(function (data) {
        setAppointments(data.content || [])
      })
      .catch(function () {
        setError("Errore nel caricamento degli appuntamenti")
      })
      .finally(function () {
        setLoadingAppts(false)
      })

    // fetch preventivi inviati (in attesa di risposta)
    api
      .get("/api/quotes/status?status=SENT&page=0&size=5")
      .then(function (data) {
        setPendingQuotes(data.content || [])
      })
      .catch(function () {
        // ignoro — potrebbe essere 403 per ruolo SECRETARY
      })
      .finally(function () {
        setLoadingQuotes(false)
      })
  }, [])

  // conta appuntamenti completati
  const completedCount = appointments.filter(function (a) {
    return a.status === "COMPLETED"
  }).length

  return (
    <>
      <title>Dashboard — OpenClinic</title>
      <TopBar title="Dashboard" subtitle={today} />

      {error && <Alert variant="danger">{error}</Alert>}

      {/*AZIONI RAPIDE  */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card
            className="border-0 shadow-sm h-100"
            style={{ cursor: "pointer" }}
            onClick={function () {
              navigate("/appointments")
            }}
          >
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "rgba(42, 157, 143, 0.1)",
                  color: "var(--bs-primary)",
                }}
              >
                <BsCalendarPlus size={20} />
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: 14 }}>
                  Nuovo Appuntamento
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Apri l'agenda
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="border-0 shadow-sm h-100"
            style={{ cursor: "pointer" }}
            onClick={function () {
              setShowPatientModal(true)
            }}
          >
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  color: "#3b82f6",
                }}
              >
                <BsPersonPlusFill size={20} />
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: 14 }}>
                  Nuovo Paziente
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Registra anagrafica
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="border-0 shadow-sm h-100"
            style={{ cursor: "pointer" }}
            onClick={function () {
              navigate("/quotes")
            }}
          >
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  color: "var(--bs-warning)",
                }}
              >
                <BsExclamationTriangleFill size={20} />
              </div>
              <div>
                <div className="fw-bold" style={{ fontSize: 14 }}>
                  Preventivi
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {pendingQuotes.length} in attesa di risposta
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/*APPUNTAMENTI DI OGGI */}
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pt-3 pb-0 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0">
                  Appuntamenti di oggi ({appointments.length})
                </h6>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  {completedCount}/{appointments.length} completati
                </span>
              </div>
              {/* barra progresso */}
              {appointments.length > 0 && (
                <div
                  className="mt-2 rounded-pill overflow-hidden"
                  style={{ height: 5, backgroundColor: "#e2e8f0" }}
                >
                  <div
                    className="h-100 rounded-pill"
                    style={{
                      width:
                        Math.round(
                          (completedCount / appointments.length) * 100,
                        ) + "%",
                      backgroundColor: "var(--bs-primary)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              )}
            </Card.Header>
            <Card.Body className="px-0 py-2">
              {loadingAppts ? (
                <div className="d-flex justify-content-center py-4">
                  <Spinner
                    animation="border"
                    style={{ color: "var(--bs-primary)" }}
                  />
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">
                  Nessun appuntamento per oggi
                </p>
              ) : (
                appointments.map(function (a, i) {
                  const isPast = a.status === "COMPLETED"
                  const time = new Date(a.dateTime).toLocaleTimeString(
                    "it-IT",
                    { hour: "2-digit", minute: "2-digit" },
                  )

                  return (
                    <div
                      key={a.id}
                      className="d-flex align-items-center gap-3 px-3 py-2"
                      style={{
                        borderTop: i === 0 ? "none" : "1px solid #f0f3f7",
                        opacity: isPast ? 0.5 : 1,
                        cursor: "pointer",
                      }}
                      onClick={function () {
                        navigate("/patients/" + a.patient.id)
                      }}
                    >
                      {/* Orario */}
                      <div style={{ width: 52 }}>
                        <div
                          className="fw-bold"
                          style={{
                            fontSize: 14,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {time}
                        </div>
                        <div
                          className="text-muted d-flex align-items-center gap-1"
                          style={{ fontSize: 11 }}
                        >
                          <BsClockFill size={10} />
                          {a.duration}'
                        </div>
                      </div>

                      {/* Linea colorata */}
                      <div
                        className="rounded-pill"
                        style={{
                          width: 3,
                          height: 36,
                          backgroundColor: isPast
                            ? "#9ba8b7"
                            : "var(--bs-primary)",
                        }}
                      />

                      {/* Info */}
                      <div className="flex-grow-1">
                        <div
                          className="fw-semibold"
                          style={{
                            fontSize: 14,
                            textDecoration: isPast ? "line-through" : "none",
                          }}
                        >
                          {a.patient.firstName} {a.patient.lastName}
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {a.dentist
                            ? a.dentist.firstName + " " + a.dentist.lastName
                            : "—"}
                          {a.notes ? " — " + a.notes : ""}
                        </div>
                      </div>

                      {/* Stato */}
                      <StatusBadge status={a.status} />
                    </div>
                  )
                })
              )}
            </Card.Body>
          </Card>
        </Col>

        {/*PREVENTIVI IN ATTESA */}
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom-0 pt-3 pb-2 px-3">
              <h6 className="fw-bold mb-0">Preventivi in attesa</h6>
            </Card.Header>
            <Card.Body className="px-0 py-2">
              {loadingQuotes ? (
                <div className="d-flex justify-content-center py-4">
                  <Spinner
                    animation="border"
                    style={{ color: "var(--bs-primary)" }}
                  />
                </div>
              ) : pendingQuotes.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">
                  Nessun preventivo in attesa
                </p>
              ) : (
                pendingQuotes.map(function (q, i) {
                  // calcolo totale
                  const total = q.items
                    ? q.items.reduce(function (acc, item) {
                        return acc + Number(item.quotedPrice)
                      }, 0)
                    : 0

                  return (
                    <div
                      key={q.id}
                      className="px-3 py-2"
                      style={{
                        borderTop: i === 0 ? "none" : "1px solid #f0f3f7",
                        cursor: "pointer",
                      }}
                      onClick={function () {
                        navigate("/quotes/" + q.id)
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold" style={{ fontSize: 13 }}>
                          {q.patient.firstName} {q.patient.lastName}
                        </span>
                        <StatusBadge status={q.status} />
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          {q.items ? q.items.length + " voci" : "—"}
                        </span>
                        <span
                          className="fw-bold"
                          style={{
                            fontSize: 13,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          € {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <PatientForm
        show={showPatientModal}
        patient={null}
        onClose={function () {
          setShowPatientModal(false)
        }}
        onSaved={function () {
          setShowPatientModal(false)
        }}
      />
    </>
  )
}

export default DashboardPage

// TODO: avvisi (pz inattivi + pensare ad altre features)
