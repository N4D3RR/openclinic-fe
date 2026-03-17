import { useState, useEffect } from "react"
import { Modal, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap"
import api from "../../services/api"

const ProcedureForm = function ({ show, procedure, onClose, onSaved }) {
  const emptyForm = {
    code: "",
    name: "",
    description: "",
    durationInMinutes: "",
    price: "",
  }

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(
    function () {
      if (procedure) {
        setForm({
          code: procedure.code || "",
          name: procedure.name || "",
          description: procedure.description || "",
          durationInMinutes: procedure.durationInMinutes || "",
          price: procedure.price || "",
        })
      } else {
        setForm(emptyForm)
      }
      setError("")
    },
    [procedure, show],
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

    // code non è nel ProcedureUpdateDTO → incluso solo in creazione
    const payload = procedure
      ? {
          name: form.name,
          description: form.description || null,
          durationInMinutes: parseInt(form.durationInMinutes),
          price: parseFloat(form.price),
        }
      : {
          code: form.code,
          name: form.name,
          description: form.description || null,
          durationInMinutes: parseInt(form.durationInMinutes),
          price: parseFloat(form.price),
        }

    const request = procedure
      ? api.put("/api/procedures/" + procedure.id, payload)
      : api.post("/api/procedures", payload)

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
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          {procedure ? "Modifica Prestazione" : "Nuova Prestazione"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* code solo in creazione — non presente in ProcedureUpdateDTO */}
          {!procedure && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                Codice *
              </Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="font-monospace"
                placeholder="es. D0120"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Nome *
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Descrizione
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Durata (minuti) *
                </Form.Label>
                <Form.Control
                  type="number"
                  name="durationInMinutes"
                  value={form.durationInMinutes}
                  onChange={handleChange}
                  required
                  min={5}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Prezzo (€) *
                </Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min={0.01}
                  step={0.01}
                />
              </Form.Group>
            </Col>
          </Row>
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
            ) : procedure ? (
              "Salva Modifiche"
            ) : (
              "Crea Prestazione"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ProcedureForm
