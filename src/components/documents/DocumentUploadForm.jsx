import { useState } from "react"
import { Modal, Button, Form, Spinner } from "react-bootstrap"
import api from "../../services/api"

const DOCUMENT_TYPES = [
  "XRAY",
  "CONSENT",
  "REPORT",
  "PRESCRIPTION",
  "INVOICE",
  "OTHER",
]

const DocumentUploadForm = function ({
  show,
  clinicalRecordId,
  onClose,
  onSaved,
}) {
  const [file, setFile] = useState(null)
  const [type, setType] = useState("REPORT")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = function (e) {
    e.preventDefault()
    if (!file) {
      setError("Seleziona un file")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("clinicalRecordId", clinicalRecordId)
    formData.append("type", type)
    if (notes) formData.append("notes", notes)

    setLoading(true)
    setError("")

    api
      .upload("/api/documents", formData)
      .then(function () {
        setFile(null)
        setType("REPORT")
        setNotes("")
        onSaved()
      })
      .catch(function (err) {
        setError(err?.message || "Errore durante il caricamento")
      })
      .finally(function () {
        setLoading(false)
      })
  }

  const handleClose = function () {
    setFile(null)
    setType("REPORT")
    setNotes("")
    setError("")
    onClose()
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          Carica documento
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div
            className="alert alert-danger py-2 mb-3"
            style={{ fontSize: 13 }}
          >
            {error}
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              File
            </Form.Label>
            <Form.Control
              type="file"
              onChange={function (e) {
                setFile(e.target.files[0] || null)
              }}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Tipo documento
            </Form.Label>
            <Form.Select
              value={type}
              onChange={function (e) {
                setType(e.target.value)
              }}
            >
              {DOCUMENT_TYPES.map(function (t) {
                return (
                  <option key={t} value={t}>
                    {t}
                  </option>
                )
              })}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Note <span className="text-muted">(opzionale)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={notes}
              onChange={function (e) {
                setNotes(e.target.value)
              }}
              placeholder="Descrizione o osservazioni..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" onClick={handleClose} disabled={loading}>
              Annulla
            </Button>
            <Button
              type="submit"
              className="border-0 fw-semibold btn-clinic"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : null}
              Carica
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default DocumentUploadForm
