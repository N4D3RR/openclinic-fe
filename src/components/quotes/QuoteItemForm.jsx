import { useState, useEffect } from "react"
import { Modal, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap"
import api from "../../services/api"

const emptyForm = {
  procedureId: "",
  toothNumber: "",
  quotedPrice: "",
}
const QuoteItemForm = function ({ show, quoteId, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [procedures, setProcedures] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingProcedures, setLoadingProcedures] = useState(false)
  const [error, setError] = useState("")

  useEffect(
    function () {
      if (!show) return
      setForm(emptyForm)
      setError("")
      setLoadingProcedures(true)
      api
        .get("/api/procedures?page=0&size=100")
        .then(function (data) {
          setProcedures(data.content)
          setLoadingProcedures(false)
        })
        .catch(function () {
          setError("Errore nel caricamento delle prestazioni")
          setLoadingProcedures(false)
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

  // quando scelgo la prestazione, precompilo il prezzo con quello di listino
  const handleProcedureChange = function (e) {
    const selectedId = e.target.value
    const selectedProc = procedures.find(function (p) {
      return p.id === selectedId
    })
    setForm(function (prev) {
      return {
        ...prev,
        procedureId: selectedId,
        // precompilo con il prezzo di listino — il dentista può modificarlo
        quotedPrice: selectedProc ? selectedProc.price : "",
      }
    })
  }

  const handleSubmit = function (e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const payload = {
      quoteId: quoteId,
      procedureId: form.procedureId,
      toothNumber: parseInt(form.toothNumber),
      quotedPrice: parseFloat(form.quotedPrice),
    }

    api
      .post("/api/quote-items", payload)
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
          Aggiungi Voce al Preventivo
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Prestazione *
            </Form.Label>
            {loadingProcedures ? (
              <div className="d-flex justify-content-center py-2">
                <Spinner
                  animation="border"
                  size="sm"
                  style={{ color: "#2a9d8f" }}
                />
              </div>
            ) : (
              <Form.Select
                name="procedureId"
                value={form.procedureId}
                onChange={handleProcedureChange}
                required
              >
                <option value="">Seleziona una prestazione...</option>
                {procedures.map(function (proc) {
                  return (
                    <option key={proc.id} value={proc.id}>
                      [{proc.code}] {proc.name} — €{" "}
                      {Number(proc.price).toFixed(2)}
                    </option>
                  )
                })}
              </Form.Select>
            )}
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Numero Dente (FDI) *
                </Form.Label>
                <Form.Control
                  type="number"
                  name="toothNumber"
                  value={form.toothNumber}
                  onChange={handleChange}
                  required
                  min={11}
                  max={48}
                  placeholder="es. 21"
                />
                <Form.Text className="text-muted">
                  Notazione FDI: 11-18, 21-28, 31-38, 41-48
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Prezzo preventivato (€) *
                </Form.Label>
                <Form.Control
                  type="number"
                  name="quotedPrice"
                  value={form.quotedPrice}
                  onChange={handleChange}
                  required
                  min={0.01}
                  step={0.01}
                />
                <Form.Text className="text-muted">
                  Precompilato con il prezzo di listino
                </Form.Text>
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
            disabled={loading || loadingProcedures}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Aggiungi"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default QuoteItemForm
