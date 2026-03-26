import { useState } from "react"
import { Button, Badge } from "react-bootstrap"
import { BsFilePdf, BsImage, BsFileEarmark, BsTrash } from "react-icons/bs"
import DocumentUploadForm from "./DocumentUploadForm"
import api from "../../services/api"

const TYPE_LABELS = {
  XRAY: { label: "Radiografia", color: "#6366f1" },
  CONSENT: { label: "Consenso", color: "var(--bs-warning)" },
  REPORT: { label: "Referto", color: "#3b82f6" },
  PRESCRIPTION: { label: "Ricetta", color: "var(--bs-success)" },
  INVOICE: { label: "Fattura", color: "#8b5cf6" },
  OTHER: { label: "Altro", color: "#94a3b8" },
}

const getFileIcon = function (fileName) {
  if (!fileName) return <BsFileEarmark size={18} />
  const ext = fileName.split(".").pop().toLowerCase()
  if (ext === "pdf") return <BsFilePdf size={18} className="text-danger" />
  if (["jpg", "jpeg", "png"].includes(ext))
    return <BsImage size={18} className="text-primary" />
  return <BsFileEarmark size={18} className="text-secondary" />
}

const DocumentsSection = function ({ clinicalRecordId, documents, onRefresh }) {
  const [showUpload, setShowUpload] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = function (docId) {
    if (!window.confirm("Eliminare questo documento?")) return
    setDeletingId(docId)
    api
      .delete("/api/documents/" + docId)
      .then(function () {
        onRefresh()
      })
      .finally(function () {
        setDeletingId(null)
      })
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0">
          Documenti ({documents ? documents.length : 0})
        </h6>
        <Button
          size="sm"
          className="border-0 fw-semibold btn-clinic"
          style={{ fontSize: 12 }}
          onClick={function () {
            setShowUpload(true)
          }}
        >
          + Carica documento
        </Button>
      </div>

      {!documents || documents.length === 0 ? (
        <p className="text-muted small">Nessun documento allegato</p>
      ) : (
        <div className="row g-2">
          {documents.map(function (doc) {
            const typeInfo = TYPE_LABELS[doc.type] || TYPE_LABELS.OTHER
            return (
              <div key={doc.id} className="col-md-4">
                <div
                  className="border rounded p-3 h-100"
                  style={{ fontSize: 13 }}
                >
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2 min-w-0 flex-grow-1 overflow-hidden">
                      {getFileIcon(doc.fileName)}
                      <span
                        className="fw-semibold text-truncate d-block"
                        style={{ fontSize: 13 }}
                        title={doc.fileName}
                      >
                        {doc.fileName}
                      </span>
                    </div>
                    <Button
                      className="btn btn-link p-0 text-danger flex-shrink-0"
                      style={{ fontSize: 13 }}
                      onClick={function () {
                        handleDelete(doc.id)
                      }}
                      disabled={deletingId === doc.id}
                      title="Elimina"
                    >
                      <BsTrash size={14} />
                    </Button>
                  </div>

                  <div className="d-flex align-items-center gap-2 mt-2">
                    <Badge
                      pill
                      bg=""
                      style={{
                        backgroundColor: typeInfo.color,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {typeInfo.label}
                    </Badge>
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      {new Date(doc.uploadedAt).toLocaleDateString("it-IT")}
                    </span>
                  </div>

                  {doc.notes && (
                    <div
                      className="text-muted mt-2"
                      style={{ fontSize: 11, fontStyle: "italic" }}
                    >
                      {doc.notes}
                    </div>
                  )}

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-secondary mt-2 w-100"
                    style={{ fontSize: 11 }}
                  >
                    Apri
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <DocumentUploadForm
        show={showUpload}
        clinicalRecordId={clinicalRecordId}
        onClose={function () {
          setShowUpload(false)
        }}
        onSaved={function () {
          setShowUpload(false)
          onRefresh()
        }}
      />
    </>
  )
}

export default DocumentsSection
