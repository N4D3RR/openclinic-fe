import { useState, useEffect } from "react"
import { Spinner, Card, Button } from "react-bootstrap"
import { BsCheckCircleFill } from "react-icons/bs"
import StatusBadge from "../common/StatusBadge"
import TreatmentForm from "../treatments/TreatmentForm"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"

const TreatmentPlansTab = function ({ patientId }) {
  const [treatmentPlans, setTreatmentPlans] = useState([])
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)
  const [selectedPlanItem, setSelectedPlanItem] = useState(null)
  const navigate = useNavigate()

  const loadData = function () {
    Promise.allSettled([
      api.get("/api/treatment-plans/patient/" + patientId + "?page=0&size=20"),
      api.get("/api/treatments/patient/" + patientId + "?page=0&size=100"),
    ]).then(function (results) {
      if (results[0].status === "fulfilled")
        setTreatmentPlans(results[0].value.content || [])
      if (results[1].status === "fulfilled")
        setTreatments(results[1].value.content || [])
      setLoading(false)
    })
  }

  useEffect(
    function () {
      loadData()
    },
    [patientId],
  )

  const isItemCompleted = function (quoteItem) {
    return treatments.some(function (t) {
      if (!t.procedure || t.procedure.id !== quoteItem.procedure.id)
        return false
      return t.treatedToothList.some(function (tt) {
        return tt.toothCode === quoteItem.toothNumber
      })
    })
  }

  if (loading)
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" size="sm" style={{ color: "#2a9d8f" }} />
      </div>
    )

  if (treatmentPlans.length === 0)
    return <p className="text-muted mt-3">Nessun piano di cura registrato</p>

  return (
    <>
      {treatmentPlans.map(function (tp) {
        const totalItems =
          tp.quote && tp.quote.items ? tp.quote.items.length : 0
        const completedItems =
          tp.quote && tp.quote.items
            ? tp.quote.items.filter(function (item) {
                return isItemCompleted(item)
              }).length
            : 0

        return (
          <Card key={tp.id} className="border-0 shadow-sm mb-3 mt-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <StatusBadge status={tp.status} />
                  <span className="text-muted ms-3" style={{ fontSize: 13 }}>
                    {tp.startDate
                      ? new Date(tp.startDate).toLocaleDateString("it-IT")
                      : "-"}
                    {" → "}
                    {tp.expectedEndDate
                      ? new Date(tp.expectedEndDate).toLocaleDateString("it-IT")
                      : "—"}
                  </span>
                </div>
                <div className="fw-bold" style={{ fontSize: 15 }}>
                  €{" "}
                  {tp.totalAmount != null
                    ? Number(tp.totalAmount).toFixed(2)
                    : "0.00"}
                </div>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  style={{ fontSize: 12 }}
                  onClick={function () {
                    navigate("/treatment-plans/" + tp.id)
                  }}
                >
                  Dettaglio →
                </Button>
              </div>

              {totalItems > 0 && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      Avanzamento: {completedItems}/{totalItems} prestazioni
                    </span>
                    <span
                      className="fw-semibold"
                      style={{ fontSize: 12, color: "#2a9d8f" }}
                    >
                      {Math.round((completedItems / totalItems) * 100)}%
                    </span>
                  </div>
                  <div
                    className="rounded-pill overflow-hidden"
                    style={{ height: 6, backgroundColor: "#e2e8f0" }}
                  >
                    <div
                      className="h-100 rounded-pill"
                      style={{
                        width:
                          Math.round((completedItems / totalItems) * 100) + "%",
                        backgroundColor: "#2a9d8f",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              )}

              {tp.clinicalNotes && (
                <div className="text-muted mb-3" style={{ fontSize: 13 }}>
                  {tp.clinicalNotes}
                </div>
              )}

              {tp.quote && tp.quote.items && tp.quote.items.length > 0 && (
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Stato</th>
                      <th>Prestazione</th>
                      <th>Dente</th>
                      <th>Prezzo prev.</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tp.quote.items.map(function (item) {
                      const completed = isItemCompleted(item)
                      return (
                        <tr
                          key={item.id}
                          style={{ opacity: completed ? 0.6 : 1 }}
                        >
                          <td>
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
                          <td>{item.toothNumber}</td>
                          <td>€ {Number(item.quotedPrice).toFixed(2)}</td>
                          <td className="text-end">
                            {!completed && (
                              <Button
                                size="sm"
                                className="border-0 fw-semibold"
                                style={{
                                  backgroundColor: "#2a9d8f",
                                  fontSize: 12,
                                }}
                                onClick={function () {
                                  setSelectedPlanItem(item)
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
              )}
            </Card.Body>
          </Card>
        )
      })}

      <TreatmentForm
        show={showTreatmentModal}
        patientId={patientId}
        procedureId={selectedPlanItem ? selectedPlanItem.procedure.id : null}
        procedureName={selectedPlanItem ? selectedPlanItem.procedure.name : ""}
        toothNumber={selectedPlanItem ? selectedPlanItem.toothNumber : null}
        quotedPrice={selectedPlanItem ? selectedPlanItem.quotedPrice : ""}
        onClose={function () {
          setShowTreatmentModal(false)
        }}
        onSaved={function () {
          setShowTreatmentModal(false)
          setSelectedPlanItem(null)
          loadData()
        }}
      />
    </>
  )
}

export default TreatmentPlansTab
