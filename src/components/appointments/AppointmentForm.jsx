import { useState, useEffect, useContext } from "react"
import { Modal, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap"
import { AuthContext } from "../../context/AuthContext"
import api from "../../services/api"

const emptyForm = {
  patientId: "",
  userId: "",
  dateTime: "",
  duration: "",
  status: "CONFIRMED",
  notes: "",
}
const AppointmentForm = function ({
  show,
  appointment,
  selectedDate,
  onClose,
  onSaved,
}) {
  const { isAdmin } = useContext(AuthContext)

  const [form, setForm] = useState(emptyForm)
  const [patients, setPatients] = useState([])
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState("")
  // quando modale si apre, carico pazienti e dentisti
  // e precompilo il form se è una modifica
  useEffect(
    function () {
      if (!show) return
      setError("")
      setLoadingData(true)

      // carico pazienti e dentisti in parallelo
      Promise.all([
        api.get("/api/patients?page=0&size=100"),
        api.get("/api/users/role?role=DENTIST&page=0&size=100"),
      ])
        .then(function (results) {
          setPatients(results[0].content)
          setDentists(results[1].content)
          setLoadingData(false)
        })
        .catch(function () {
          setError("Errore nel caricamento dei dati")
          setLoadingData(false)
        })

      // precompilo il form
      if (appointment) {
        // modifica — prendo i dati dall'appuntamento esistente
        setForm({
          patientId: appointment.patient ? appointment.patient.id : "",
          userId: appointment.dentist ? appointment.dentist.id : "",
          // dateTime dal backend arriva come "2026-03-17T09:00:00"
          // l'input datetime-local vuole "2026-03-17T09:00" (senza secondi)
          dateTime: appointment.dateTime
            ? appointment.dateTime.substring(0, 16)
            : "",
          duration: appointment.duration || "",
          status: appointment.status || "CONFIRMED",
          notes: appointment.notes || "",
        })
      } else if (selectedDate) {
        // creazione da click su slot — precompilo la data
        setForm({
          ...emptyForm,
          dateTime: selectedDate.substring(0, 16),
        })
      } else {
        setForm(emptyForm)
      }
    },
    [appointment, selectedDate, show],
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

    if (appointment) {
      // modifica — AppointmentUpdateDTO
      const payload = {
        dateTime: form.dateTime + ":00",
        duration: parseInt(form.duration),
        status: form.status,
        notes: form.notes || null,
      }

      api
        .put("/api/appointments/" + appointment.id, payload)
        .then(function () {
          setLoading(false)
          onSaved()
        })
        .catch(function (err) {
          setError(err.message || "Errore durante il salvataggio")
          setLoading(false)
        })
    } else {
      // creazione — AppointmentCreateDTO
      const payload = {
        patientId: form.patientId,
        userId: form.userId,
        dateTime: form.dateTime + ":00",
        duration: parseInt(form.duration),
        notes: form.notes || null,
      }

      api
        .post("/api/appointments", payload)
        .then(function () {
          setLoading(false)
          onSaved()
        })
        .catch(function (err) {
          setError(err.message || "Errore durante il salvataggio")
          setLoading(false)
        })
    }
  }

  // elimina appuntamento
  const handleDelete = function () {
    if (!window.confirm("Sei sicuro di voler eliminare questo appuntamento?"))
      return
    setLoading(true)
    api
      .delete("/api/appointments/" + appointment.id)
      .then(function () {
        setLoading(false)
        onSaved()
      })
      .catch(function (err) {
        setError(err.message || "Errore durante l'eliminazione")
        setLoading(false)
      })
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          {appointment ? "Modifica Appuntamento" : "Nuovo Appuntamento"}
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
              {/* Paziente — select in creazione, testo fisso in modifica */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Paziente *
                </Form.Label>
                {appointment ? (
                  <Form.Control
                    type="text"
                    value={
                      appointment.patient
                        ? appointment.patient.firstName +
                          " " +
                          appointment.patient.lastName
                        : ""
                    }
                    disabled
                  />
                ) : (
                  <Form.Select
                    name="patientId"
                    value={form.patientId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleziona un paziente...</option>
                    {patients.map(function (p) {
                      return (
                        <option key={p.id} value={p.id}>
                          {p.lastName} {p.firstName} — {p.fiscalCode}
                        </option>
                      )
                    })}
                  </Form.Select>
                )}
              </Form.Group>

              {/* Dentista — select */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Dentista
                </Form.Label>
                <Form.Select
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  disabled={!!appointment}
                >
                  <option value="">Seleziona un dentista...</option>
                  {dentists.map(function (d) {
                    return (
                      <option key={d.id} value={d.id}>
                        {d.lastName} {d.firstName}
                      </option>
                    )
                  })}
                </Form.Select>
              </Form.Group>

              {/* Data e ora + Durata */}
              <Row className="mb-3">
                <Col md={7}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Data e ora *
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="dateTime"
                      value={form.dateTime}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Durata (minuti) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      required
                      min={15}
                      step={15}
                      placeholder="30"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Stato — solo in modifica */}
              {appointment && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Stato
                  </Form.Label>
                  <Form.Select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="CONFIRMED">Confermato</option>
                    <option value="COMPLETED">Completato</option>
                    <option value="CANCELLED">Annullato</option>
                    <option value="NO_SHOW">No Show</option>
                  </Form.Select>
                </Form.Group>
              )}

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
          {/* Elimina — solo in modifica */}
          {appointment && (
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              disabled={loading}
              className="me-auto"
            >
              Elimina
            </Button>
          )}
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
            ) : appointment ? (
              "Salva Modifiche"
            ) : (
              "Crea Appuntamento"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AppointmentForm
