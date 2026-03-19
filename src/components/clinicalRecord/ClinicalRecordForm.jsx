import { useState, useEffect } from "react"
import { Modal, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap"
import api from "../../services/api"

const emptyForm = {
  anamnesis: "",
  allergies: "",
  medications: "",
  notes: "",
  signedConsent: false,
}
// se clinicalRecord è null → crea, se è un oggetto → modifica
const ClinicalRecordForm = function ({
  show,
  clinicalRecord,
  patientId,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // quando cambia clinicalRecord (apro modifica) precompilo i campi
  // quando clinicalRecord è null (apro crea) svuoto i campi
  useEffect(
    function () {
      if (clinicalRecord) {
        //modifica
        setForm({
          anamnesis: clinicalRecord.anamnesis || "",
          allergies: clinicalRecord.allergies || "",
          medications: clinicalRecord.medications || "",
          notes: clinicalRecord.notes || "",
          signedConsent: clinicalRecord.signedConsent || false,
        })
      } else {
        setForm(emptyForm)
      }
      setError("")
    },
    [clinicalRecord, show],
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

    if (clinicalRecord) {
      // modifica — ClinicalRecordUpdateDTO
      const payload = {
        anamnesis: form.anamnesis || null,
        allergies: form.allergies || null,
        medications: form.medications || null,
        notes: form.notes || null,
        signedConsent: form.signedConsent,
      }

      api
        .put("/api/clinical-records/" + clinicalRecord.id, payload)
        .then(function () {
          setLoading(false)
          onSaved()
        })
        .catch(function (err) {
          setError(err.message || "Errore durante il salvataggio")
          setLoading(false)
        })
    } else {
      // creazione — ClinicalRecordCreateDTO
      const payload = {
        patientId: patientId,
        anamnesis: form.anamnesis || null,
        allergies: form.allergies || null,
        medications: form.medications || null,
        notes: form.notes || null,
      }

      api
        .post("/api/clinical-records", payload)
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

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          {clinicalRecord
            ? "Modifica Cartella Clinica"
            : "Nuova Cartella Clinica"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Anamnesi
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="anamnesis"
              value={form.anamnesis}
              onChange={handleChange}
              placeholder="Patologie pregresse, condizioni sistemiche..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Allergie
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder="Allergie a farmaci, lattice, materiali..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Farmaci in uso
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="medications"
              value={form.medications}
              onChange={handleChange}
              placeholder="Farmaci assunti regolarmente..."
            />
          </Form.Group>

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

          {/* signedConsent solo in modifica — il create DTO non ce l'ha */}
          {clinicalRecord && (
            <Form.Group>
              <Form.Check
                type="checkbox"
                name="signedConsent"
                label="Consenso informato firmato"
                checked={form.signedConsent}
                onChange={handleChange}
              />
            </Form.Group>
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
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : clinicalRecord ? (
              "Salva Modifiche"
            ) : (
              "Crea Cartella Clinica"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ClinicalRecordForm
