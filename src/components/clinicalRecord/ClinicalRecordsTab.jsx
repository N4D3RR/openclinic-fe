import { useState, useEffect } from "react"
import { Spinner, Badge, Button } from "react-bootstrap"
import ClinicalRecordForm from "../clinicalRecord/ClinicalRecordForm"
import api from "../../services/api"

const ClinicalField = function ({ label, value }) {
  return (
    <div className="col-md-12">
      <div className="text-secondary small fw-semibold mb-1">{label}</div>
      <div
        className="border rounded p-2 bg-light"
        style={{ fontSize: 14, minHeight: 40, whiteSpace: "pre-wrap" }}
      >
        {value || <span className="text-muted">Non specificato</span>}
      </div>
    </div>
  )
}

const ClinicalRecordTab = function ({ patientId }) {
  const [clinicalRecord, setClinicalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const loadRecord = function () {
    api
      .get("/api/clinical-records/patient/" + patientId)
      .then(function (data) {
        setClinicalRecord(data)
      })
      .catch(function () {
        setClinicalRecord(null)
      })
      .finally(function () {
        setLoading(false)
      })
  }

  useEffect(
    function () {
      loadRecord()
    },
    [patientId],
  )

  if (loading)
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" size="sm" style={{ color: "#2a9d8f" }} />
      </div>
    )

  return (
    <>
      {!clinicalRecord ? (
        <div className="text-center py-4">
          <p className="text-muted mt-3">Nessuna cartella clinica registrata</p>
          <Button
            className="border-0 fw-semibold"
            style={{ backgroundColor: "#2a9d8f" }}
            onClick={function () {
              setShowModal(true)
            }}
          >
            Crea Cartella Clinica
          </Button>
        </div>
      ) : (
        <div className="mt-3">
          <div className="d-flex justify-content-end mb-3">
            <Button
              size="sm"
              className="border-0 fw-semibold"
              style={{ backgroundColor: "#2a9d8f" }}
              onClick={function () {
                setShowModal(true)
              }}
            >
              Modifica
            </Button>
          </div>
          <div className="row g-3 mb-4">
            <ClinicalField label="Anamnesi" value={clinicalRecord.anamnesis} />
            <ClinicalField label="Allergie" value={clinicalRecord.allergies} />
            <ClinicalField
              label="Farmaci in uso"
              value={clinicalRecord.medications}
            />
            <ClinicalField label="Note" value={clinicalRecord.notes} />
            <div className="col-md-6">
              <div className="text-secondary small fw-semibold mb-1">
                Consenso firmato
              </div>
              <Badge
                pill
                className={
                  clinicalRecord.signedConsent
                    ? "badge-accepted"
                    : "badge-cancelled"
                }
                style={{ fontWeight: 600, fontSize: 12 }}
              >
                {clinicalRecord.signedConsent ? "Sì" : "No"}
              </Badge>
            </div>
          </div>

          <h6 className="fw-bold mb-3">
            Documenti (
            {clinicalRecord.documents ? clinicalRecord.documents.length : 0})
          </h6>
          {!clinicalRecord.documents ||
          clinicalRecord.documents.length === 0 ? (
            <p className="text-muted">Nessun documento allegato</p>
          ) : (
            <div className="row g-2">
              {clinicalRecord.documents.map(function (doc) {
                return (
                  <div key={doc.id} className="col-md-4">
                    <div className="border rounded p-3">
                      <div className="fw-semibold" style={{ fontSize: 14 }}>
                        {doc.fileName}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {doc.type} ·{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString("it-IT")}
                      </div>
                      {doc.notes && (
                        <div
                          className="text-muted mt-1"
                          style={{ fontSize: 12 }}
                        >
                          {doc.notes}
                        </div>
                      )}
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-secondary mt-2"
                        style={{ fontSize: 12 }}
                      >
                        Apri
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <ClinicalRecordForm
        show={showModal}
        clinicalRecord={clinicalRecord}
        patientId={patientId}
        onClose={function () {
          setShowModal(false)
        }}
        onSaved={function () {
          setShowModal(false)
          loadRecord()
        }}
      />
    </>
  )
}

export default ClinicalRecordTab
