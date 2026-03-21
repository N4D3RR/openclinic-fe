import { useState, useEffect } from "react"
import { Modal, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap"
import api from "../../services/api"

const emptyForm = {
  appointmentId: "",
  cost: "",
  date: "",
  notes: "",
  surface: "",
}

//TODO:
// Props:
// - show: boolean
// - patientId: UUID del paziente
// - procedureId: UUID della prestazione (precompilata dal piano)
// - procedureName: nome della prestazione (per visualizzazione)
// - toothNumber: numero dente FDI (precompilato dal piano)
// - quotedPrice: prezzo preventivato (precompila il costo)
// - onClose: callback chiusura
// - onSaved: callback dopo salvataggio

const TreatmentForm = function ({
  show,
  patientId,
  procedureId,
  procedureName,
  toothNumber,
  quotedPrice,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState("")

  useEffect(
    function () {
      if (!show) return
      setError("")
      setLoadingData(true)

      // carico gli appuntamenti del paziente per il select (opzionale)
      api
        .get("/api/appointments/patient/" + patientId + "?page=0&size=50")
        .then(function (data) {
          setAppointments(data.content || [])
          setLoadingData(false)
        })
        .catch(function () {
          // se fallisce, procedo senza appuntamenti
          setAppointments([])
          setLoadingData(false)
        })

      // precompilo il form
      setForm({
        appointmentId: "",
        cost: quotedPrice || "",
        date: new Date().toISOString().substring(0, 10),
        notes: "",
        surface: "",
      })
    },
    [show, patientId, quotedPrice],
  )

  const handleChange = function (e) {
    const { name, value } = e.target
    setForm(function (prev) {
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = function (e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    //creo il Treatment
    const treatmentPayload = {
      patientId: patientId,
      procedureId: procedureId,
      cost: parseFloat(form.cost),
      date: form.date,
      notes: form.notes || null,
      imageUrl: null,
    }

    //appointmentId opzionale
    if (form.appointmentId) {
      treatmentPayload.appointmentId = form.appointmentId
    }

    api
      .post("/api/treatments", treatmentPayload)
      .then(function (treatment) {
        //creo il TreatedTooth collegato al treatment appena creato
        const treatedToothPayload = {
          treatmentId: treatment.id,
          toothCode: toothNumber,
          surface: form.surface || null,
        }

        return api.post("/api/treated-teeth", treatedToothPayload)
      })
      .then(function () {
        setLoading(false)
        onSaved()
      })
      .catch(function (err) {
        setError(err.message || "Errore durante il salvataggio")
        setLoading(false)
      })
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          Registra Trattamento Eseguito
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {loadingData ? (
            <div className="d-flex justify-content-center py-3">
              <Spinner animation="border" style={{ color: "#2a9d8f" }} />
            </div>
          ) : (
            <>
              {/* Prestazione precompilata, non modificabile */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Prestazione
                </Form.Label>
                <Form.Control
                  type="text"
                  value={procedureName || ""}
                  disabled
                />
              </Form.Group>

              {/* Dente precompilato, non modificabile */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Dente (FDI)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={toothNumber || ""}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Superficie
                    </Form.Label>
                    <Form.Select
                      name="surface"
                      value={form.surface}
                      onChange={handleChange}
                    >
                      <option value="">Nessuna</option>
                      <option value="MESIAL">Mesiale</option>
                      <option value="DISTAL">Distale</option>
                      <option value="BUCCAL">Vestibolare</option>
                      <option value="LINGUAL">Linguale</option>
                      <option value="OCCLUSAL">Occlusale</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Costo + Data */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Costo effettivo (€) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="cost"
                      value={form.cost}
                      onChange={handleChange}
                      required
                      min={0.01}
                      step={0.01}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Data esecuzione *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().substring(0, 10)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Appuntamento opzionale */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Appuntamento associato
                  <span className="text-muted fw-normal ms-1">(opzionale)</span>
                </Form.Label>
                <Form.Select
                  name="appointmentId"
                  value={form.appointmentId}
                  onChange={handleChange}
                >
                  <option value="">Nessun appuntamento</option>
                  {appointments.map(function (a) {
                    const dateStr = new Date(a.dateTime).toLocaleString(
                      "it-IT",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )
                    const dentist = a.dentist
                      ? a.dentist.firstName + " " + a.dentist.lastName
                      : ""
                    return (
                      <option key={a.id} value={a.id}>
                        {dateStr} — {dentist} ({a.status})
                      </option>
                    )
                  })}
                </Form.Select>
              </Form.Group>

              {/* Note */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Note
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            type="submit"
            className="border-0 fw-semibold"
            style={{ backgroundColor: "#2a9d8f" }}
            disabled={loading || loadingData}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Registra Trattamento"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default TreatmentForm
