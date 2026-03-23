import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spinner, Alert, Card, Button, Badge } from "react-bootstrap"
import { BsArrowLeft, BsCheckCircleFill } from "react-icons/bs"
import TopBar from "../components/layout/TopBar"
import StatusBadge from "../components/common/StatusBadge"
import TreatmentForm from "../components/treatments/TreatmentForm"
import api from "../services/api"
import AppointmentForm from "../components/appointments/AppointmentForm"

const TreatmentPlanDetailPage = function () {
  const { id } = useParams()
  const navigate = useNavigate()

  const [plan, setPlan] = useState(null)
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

  const loadData = function () {
    Promise.allSettled([
      api.get("/api/treatment-plans/" + id),
      api.get("/api/treatments/patient/"),
    ]).then(function (results) {
      if (results[0].status === "fulfilled") {
        const p = results[0].value
        setPlan(p)
        // carica i trattamenti del paziente ora che abbiamo il patientId
        api
          .get(
            "/api/treatments/patient/" +
              p.quote.patient.id +
              "?page=0&size=100",
          )
          .then(function (data) {
            setTreatments(data.content || [])
          })
      } else {
        setError("Piano di cura non trovato")
      }
      setLoading(false)
    })
  }

  useEffect(
    function () {
      api
        .get("/api/treatment-plans/" + id)
        .then(function (p) {
          setPlan(p)
          return api.get(
            "/api/treatments/patient/" +
              p.quote.patient.id +
              "?page=0&size=100",
          )
        })
        .then(function (data) {
          setTreatments(data.content || [])
          setLoading(false)
        })
        .catch(function () {
          setError("Piano di cura non trovato")
          setLoading(false)
        })
    },
    [id],
  )

  const isItemCompleted = function (quoteItem) {
    return treatments.some(function (t) {
      if (!t.procedure || t.procedure.id !== quoteItem.procedure.id)
        return false
      return t.treatedToothList.some(function (tt) {
        return String(tt.toothCode) === String(quoteItem.toothNumber)
      })
    })
  }

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: "#2a9d8f" }} />
      </div>
    )

  if (error) return <Alert variant="danger">{error}</Alert>

  const items = plan.quote?.items || []
  const completedItems = items.filter(isItemCompleted).length
  const totalItems = items.length
  const progressPct =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const patient = plan.quote?.patient

  return (
    <>
      <TopBar
        title={"Piano di Cura"}
        subtitle={patient ? patient.firstName + " " + patient.lastName : ""}
      />

      <div className="d-flex align-items-center justify-content-between mb-4">
        <Button
          variant="link"
          className="text-secondary p-0 text-decoration-none"
          onClick={function () {
            patient ? navigate("/patients/" + patient.id) : navigate(-1)
          }}
        >
          <BsArrowLeft className="me-1" />
          {patient
            ? "Torna a " + patient.firstName + " " + patient.lastName
            : "Indietro"}
        </Button>
        <div className="d-flex align-items-center gap-2">
          <StatusBadge status={plan.status} />
          {plan.status === "IN_PROGRESS" && (
            <Button
              size="sm"
              className="border-0 fw-semibold"
              style={{ backgroundColor: "#2a9d8f", fontSize: 12 }}
              onClick={function () {
                setShowAppointmentModal(true)
              }}
            >
              + Nuovo appuntamento
            </Button>
          )}
        </div>
      </div>

      {/* Card riepilogo */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="text-secondary small fw-semibold mb-1">
                Inizio
              </div>
              <div>
                {plan.startDate
                  ? new Date(plan.startDate).toLocaleDateString("it-IT")
                  : "—"}
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-secondary small fw-semibold mb-1">
                Fine prevista
              </div>
              <div>
                {plan.expectedEndDate
                  ? new Date(plan.expectedEndDate).toLocaleDateString("it-IT")
                  : "—"}
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-secondary small fw-semibold mb-1">
                Importo totale
              </div>
              <div className="fw-bold">
                €{" "}
                {plan.totalAmount != null
                  ? Number(plan.totalAmount).toFixed(2)
                  : "0.00"}
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-secondary small fw-semibold mb-1">
                Avanzamento
              </div>
              <div className="fw-bold" style={{ color: "#2a9d8f" }}>
                {completedItems}/{totalItems} prestazioni ({progressPct}%)
              </div>
            </div>
          </div>

          {totalItems > 0 && (
            <div className="mt-3">
              <div
                className="rounded-pill overflow-hidden"
                style={{ height: 8, backgroundColor: "#e2e8f0" }}
              >
                <div
                  className="h-100 rounded-pill"
                  style={{
                    width: progressPct + "%",
                    backgroundColor: "#2a9d8f",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          )}

          {plan.clinicalNotes && (
            <div className="text-muted mt-3" style={{ fontSize: 13 }}>
              {plan.clinicalNotes}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Tabella voci */}
      {items.length === 0 ? (
        <p className="text-muted">Nessuna voce nel piano di cura</p>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Stato</th>
                  <th>Prestazione</th>
                  <th>Dente</th>
                  <th>Prezzo prev.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(function (item) {
                  const completed = isItemCompleted(item)
                  return (
                    <tr key={item.id} style={{ opacity: completed ? 0.6 : 1 }}>
                      <td className="ps-3">
                        {completed ? (
                          <span
                            className="d-flex align-items-center gap-1"
                            style={{ color: "#22c55e" }}
                          >
                            <BsCheckCircleFill size={14} />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              Eseguito
                            </span>
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#f59e0b",
                            }}
                          >
                            Da fare
                          </span>
                        )}
                      </td>
                      <td className="fw-semibold">{item.procedure.name}</td>
                      <td>{item.toothNumber || "—"}</td>
                      <td>€ {Number(item.quotedPrice).toFixed(2)}</td>
                      <td className="text-end pe-3">
                        {!completed && (
                          <Button
                            size="sm"
                            className="border-0 fw-semibold"
                            style={{
                              backgroundColor: "#2a9d8f",
                              fontSize: 12,
                            }}
                            onClick={function () {
                              setSelectedItem(item)
                              setShowTreatmentModal(true)
                            }}
                          >
                            Registra trattamento
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      )}

      <TreatmentForm
        show={showTreatmentModal}
        patientId={patient?.id}
        procedureId={selectedItem?.procedure.id}
        procedureName={selectedItem?.procedure.name}
        toothNumber={selectedItem?.toothNumber}
        quotedPrice={selectedItem?.quotedPrice}
        onClose={function () {
          setShowTreatmentModal(false)
        }}
        onSaved={function () {
          setShowTreatmentModal(false)
          setSelectedItem(null)
          // ricarica i trattamenti
          api
            .get("/api/treatments/patient/" + patient.id + "?page=0&size=100")
            .then(function (data) {
              setTreatments(data.content || [])
            })
        }}
      />
      <AppointmentForm
        show={showAppointmentModal}
        preselectedPatientId={patient?.id}
        preselectedPlanId={id}
        onClose={function () {
          setShowAppointmentModal(false)
        }}
        onSaved={function () {
          setShowAppointmentModal(false)
          loadData()
        }}
      />
    </>
  )
}

export default TreatmentPlanDetailPage
