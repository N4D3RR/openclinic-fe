import { useState, useEffect } from "react"
import { Modal, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap"
import api from "../../services/api"

const emptyForm = {
  firstName: "",
  lastName: "",
  birthDate: "",
  fiscalCode: "",
  email: "",
  phone: "",
  address: "",
  emailConsent: false,
}
// se patient è null → crea, se è un oggetto → modifica
const PatientForm = function ({ show, patient, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // quando cambia patient (apro modifica) precompilo i campi
  // quando patient è null (apro crea) svuoto i campi
  useEffect(
    function () {
      if (patient) {
        setForm({
          firstName: patient.firstName || "",
          lastName: patient.lastName || "",
          // birthDate dal BE arriva come "yyyy-MM-dd" — formato corretto per input date
          birthDate: patient.birthDate
            ? patient.birthDate.toString().split("T")[0]
            : "",
          fiscalCode: patient.fiscalCode || "",
          email: patient.email || "",
          phone: patient.phone || "",
          address: patient.address || "",
          emailConsent: patient.emailConsent || false,
        })
      } else {
        setForm(emptyForm)
      }
      setError("")
    },
    [patient, show],
  )

  const handleChange = function (e) {
    const { name, value, type, checked } = e.target
    setForm(function (prev) {
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }
    })
  }

  const handleSubmit = function (e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    // il BE vuole birthDate come "yyyy-MM-dd" — l'input date lo fornisce già così
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      birthDate: form.birthDate, // "yyyy-MM-dd" ← formato corretto per LocalDate
      fiscalCode: form.fiscalCode.toUpperCase(),
      email: form.email,
      phone: form.phone,
      address: form.address || null,
      emailConsent: form.emailConsent,
    }

    const request = patient
      ? api.put("/api/patients/" + patient.id, payload) // modifica
      : api.post("/api/patients", payload) // crea

    request
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
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          {patient ? "Modifica Paziente" : "Nuovo Paziente"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Nome *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Cognome *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Data di Nascita *
                </Form.Label>
                <Form.Control
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split("T")[0]} // non future
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Codice Fiscale *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fiscalCode"
                  value={form.fiscalCode}
                  onChange={handleChange}
                  required
                  minLength={16}
                  maxLength={16}
                  className="text-uppercase font-monospace"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Email *
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Telefono *
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Indirizzo
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group>
            <Form.Check
              type="checkbox"
              name="emailConsent"
              label="Consenso ricezione comunicazioni via email (GDPR)"
              checked={form.emailConsent}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            type="submit"
            className="border-0 fw-semibold"
            style={{ backgroundColor: "#2a9d8f" }}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : patient ? (
              "Salva Modifiche"
            ) : (
              "Crea Paziente"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default PatientForm
