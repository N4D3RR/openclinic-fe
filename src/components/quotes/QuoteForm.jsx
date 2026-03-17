import { useState, useEffect, useContext } from "react"
import { Modal, Form, Button, Spinner, Alert } from "react-bootstrap"
import { AuthContext } from "../../context/AuthContext"
import api from "../../services/api"

const QuoteForm = function ({ show, onClose, onSaved }) {
  const { isAdmin } = useContext(AuthContext)

  const emptyForm = {
    patientId: "",
    dentistId: "",
    notes: "",
  }

  const [form, setForm] = useState(emptyForm)
  const [patients, setPatients] = useState([])
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState("")

  useEffect(
    function () {
      if (!show) return
      setForm(emptyForm)
      setError("")
      setLoadingData(true)

      // se ADMIN carico anche i dentisti, altrimenti solo i pazienti
      const requests = [api.get("/api/patients?page=0&size=100")]
      if (isAdmin()) {
        requests.push(api.get("/api/users/role?role=DENTIST&page=0&size=100"))
      }

      Promise.all(requests)
        .then(function (results) {
          setPatients(results[0].content)
          if (isAdmin() && results[1]) {
            setDentists(results[1].content)
          }
          setLoadingData(false)
        })
        .catch(function () {
          setError("Errore nel caricamento dei dati")
          setLoadingData(false)
        })
    },
    [show],
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

    const payload = {
      patientId: form.patientId,
      notes: form.notes || null,
    }

    // dentistId incluso solo se ADMIN e ha selezionato un dentista
    if (isAdmin() && form.dentistId) {
      payload.dentistId = form.dentistId
    }

    api
      .post("/api/quotes", payload)
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
          Nuovo Preventivo
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
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Paziente *
                </Form.Label>
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
              </Form.Group>

              {/* select dentista — visibile solo all'ADMIN */}
              {isAdmin() && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Dentista
                    <span className="text-muted fw-normal ms-1">
                      (opzionale)
                    </span>
                  </Form.Label>
                  <Form.Select
                    name="dentistId"
                    value={form.dentistId}
                    onChange={handleChange}
                  >
                    <option value="">Nessun dentista assegnato</option>
                    {dentists.map(function (d) {
                      return (
                        <option key={d.id} value={d.id}>
                          {d.lastName} {d.firstName}
                        </option>
                      )
                    })}
                  </Form.Select>
                </Form.Group>
              )}

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
              "Crea Preventivo"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default QuoteForm
