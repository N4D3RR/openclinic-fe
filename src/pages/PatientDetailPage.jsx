import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, Tab, Spinner, Alert, Badge, Button } from "react-bootstrap"
import { BsArrowLeft, BsPencilFill } from "react-icons/bs"
import TopBar from "../components/layout/TopBar"
import PatientForm from "../components/patients/PatientForm"

import api from "../services/api"
import StatusBadge from "../components/common/StatusBadge"

const PatientDetailPage = function () {
  const { id } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [clinicalRecord, setClinicalRecord] = useState(null)
  const [treatmentPlans, setTreatmentPlans] = useState([])
  const [quotes, setQuotes] = useState([])
  const [payments, setPayments] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(
    function () {
      fetchAll()
    },
    [id],
  )

  const fetchAll = function () {
    setLoading(true)
    setError("")

    // carico sempre paziente e appuntamenti
    // clinical record, treatment plans, quotes, payments in parallelo
    // uso Promise.allSettled per non bloccare tutto se una chiamata fallisce (es. 403 per ruolo)
    Promise.allSettled([
      api.get("/api/patients/" + id),
      api.get("/api/appointments/patient/" + id + "?page=0&size=20"),
      api.get("/api/clinical-records/patient/" + id),
      api.get("/api/treatment-plans/patient/" + id + "?page=0&size=20"),
      api.get("/api/quotes/patient/" + id + "?page=0&size=20"),
      api.get("/api/payments/patient/" + id + "?page=0&size=20"),
    ]).then(function (results) {
      // paziente — obbligatorio
      if (results[0].status === "fulfilled") {
        setPatient(results[0].value)
      } else {
        setError("Paziente non trovato")
      }

      // appuntamenti — Page<>
      if (results[1].status === "fulfilled") {
        setAppointments(results[1].value.content || [])
      }

      // cartella clinica — oggetto singolo (non Page)
      if (results[2].status === "fulfilled") {
        setClinicalRecord(results[2].value)
      }

      // piani di cura — Page<>
      if (results[3].status === "fulfilled") {
        setTreatmentPlans(results[3].value.content || [])
      }

      // preventivi — Page<> (solo ADMIN/DENTIST, 403 ignorato)
      if (results[4].status === "fulfilled") {
        setQuotes(results[4].value.content || [])
      }

      // pagamenti — Page<> (solo ADMIN/SECRETARY, 403 ignorato)
      if (results[5].status === "fulfilled") {
        setPayments(results[5].value.content || [])
      }

      setLoading(false)
    })
  }

  const handlePatientSaved = function () {
    setShowEditModal(false)
    fetchAll()
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: "#2a9d8f" }} />
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  return (
    <>
      <TopBar
        title={patient.firstName + " " + patient.lastName}
        subtitle={"CF: " + patient.fiscalCode}
      />

      {/* Intestazione scheda */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <Button
          variant="link"
          className="text-secondary p-0 text-decoration-none"
          onClick={function () {
            navigate("/patients")
          }}
        >
          <BsArrowLeft className="me-1" /> Torna ai pazienti
        </Button>
        <Button
          className="border-0 fw-semibold"
          style={{ backgroundColor: "#2a9d8f" }}
          onClick={function () {
            setShowEditModal(true)
          }}
        >
          <BsPencilFill className="me-2" size={13} />
          Modifica
        </Button>
      </div>

      {/* Tab */}
      <Tabs defaultActiveKey="anagrafica" className="mb-4">
        {/* TAB 1 — Anagrafica */}
        <Tab eventKey="anagrafica" title="Anagrafica">
          <div className="row g-3 mt-1">
            <InfoField label="Nome" value={patient.firstName} />
            <InfoField label="Cognome" value={patient.lastName} />
            <InfoField
              label="Data di nascita"
              value={
                patient.birthDate
                  ? new Date(patient.birthDate).toLocaleDateString("it-IT")
                  : "—"
              }
            />
            <InfoField label="Codice Fiscale" value={patient.fiscalCode} mono />
            <InfoField label="Email" value={patient.email} />
            <InfoField label="Telefono" value={patient.phone} />
            <InfoField label="Indirizzo" value={patient.address || "—"} />
            <div className="col-md-6">
              <div className="text-secondary small fw-semibold mb-1">
                Consenso Email
              </div>
              <Badge
                pill
                className={
                  patient.emailConsent ? "badge-accepted" : "badge-cancelled"
                }
                style={{ fontWeight: 600, fontSize: 12 }}
              >
                {patient.emailConsent ? "Sì" : "No"}
              </Badge>
            </div>
            <InfoField
              label="Registrato il"
              value={
                patient.createdAt
                  ? new Date(patient.createdAt).toLocaleDateString("it-IT")
                  : "—"
              }
            />
          </div>
        </Tab>

        {/* TAB 2 — Appuntamenti */}
        <Tab
          eventKey="appointments"
          title={"Appuntamenti (" + appointments.length + ")"}
        >
          {appointments.length === 0 ? (
            <p className="text-muted mt-3">Nessun appuntamento registrato</p>
          ) : (
            <table className="table table-hover align-middle mt-3">
              <thead className="table-light">
                <tr>
                  <th>Data e ora</th>
                  <th>Durata</th>
                  <th>Dentista</th>
                  <th>Stato</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(function (a) {
                  return (
                    <tr key={a.id}>
                      <td className="fw-semibold">
                        {new Date(a.dateTime).toLocaleString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>{a.duration} min</td>
                      <td>
                        {a.dentist
                          ? a.dentist.firstName + " " + a.dentist.lastName
                          : "—"}
                      </td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {a.notes || "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Tab>

        {/* TAB 3 — Cartella Clinica */}
        <Tab eventKey="clinical" title="Cartella Clinica">
          {!clinicalRecord ? (
            <p className="text-muted mt-3">
              Nessuna cartella clinica registrata
            </p>
          ) : (
            <div className="mt-3">
              <div className="row g-3 mb-4">
                <ClinicalField
                  label="Anamnesi"
                  value={clinicalRecord.anamnesis}
                />
                <ClinicalField
                  label="Allergie"
                  value={clinicalRecord.allergies}
                />
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

              {/* Documenti allegati */}
              <h6 className="fw-bold mb-3">
                Documenti (
                {clinicalRecord.documents ? clinicalRecord.documents.length : 0}
                )
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
                            {new Date(doc.uploadedAt).toLocaleDateString(
                              "it-IT",
                            )}
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
        </Tab>

        {/* TAB 4 — Piani di Cura */}
        <Tab
          eventKey="treatment-plans"
          title={"Piani di Cura (" + treatmentPlans.length + ")"}
        >
          {treatmentPlans.length === 0 ? (
            <p className="text-muted mt-3">Nessun piano di cura registrato</p>
          ) : (
            <table className="table table-hover align-middle mt-3">
              <thead className="table-light">
                <tr>
                  <th>Stato</th>
                  <th>Inizio</th>
                  <th>Fine prevista</th>
                  <th>Importo totale</th>
                  <th>Note cliniche</th>
                </tr>
              </thead>
              <tbody>
                {treatmentPlans.map(function (tp) {
                  return (
                    <tr key={tp.id}>
                      <td>
                        <StatusBadge status={tp.status} />
                      </td>
                      <td>
                        {tp.startDate
                          ? new Date(tp.startDate).toLocaleDateString("it-IT")
                          : "—"}
                      </td>
                      <td>
                        {tp.expectedEndDate
                          ? new Date(tp.expectedEndDate).toLocaleDateString(
                              "it-IT",
                            )
                          : "—"}
                      </td>
                      <td className="fw-semibold">
                        {tp.totalAmount != null
                          ? "€ " + Number(tp.totalAmount).toFixed(2)
                          : "—"}
                      </td>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {tp.clinicalNotes || "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Tab>

        {/* TAB 5 — Preventivi */}
        <Tab eventKey="quotes" title={"Preventivi (" + quotes.length + ")"}>
          {quotes.length === 0 ? (
            <p className="text-muted mt-3">Nessun preventivo registrato</p>
          ) : (
            <table className="table table-hover align-middle mt-3">
              <thead className="table-light">
                <tr>
                  <th>Data</th>
                  <th>Stato</th>
                  <th>Dentista</th>
                  <th>Voci</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(function (q) {
                  return (
                    <tr key={q.id}>
                      <td>
                        {new Date(q.createdAt).toLocaleDateString("it-IT")}
                      </td>
                      <td>
                        <StatusBadge status={q.status} />
                      </td>
                      <td>
                        {q.dentist
                          ? q.dentist.firstName + " " + q.dentist.lastName
                          : "—"}
                      </td>
                      <td>{q.items ? q.items.length + " voci" : "—"}</td>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {q.notes || "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Tab>

        {/* TAB 6 — Pagamenti */}
        <Tab eventKey="payments" title={"Pagamenti (" + payments.length + ")"}>
          {payments.length === 0 ? (
            <p className="text-muted mt-3">Nessun pagamento registrato</p>
          ) : (
            <table className="table table-hover align-middle mt-3">
              <thead className="table-light">
                <tr>
                  <th>Data</th>
                  <th>Importo</th>
                  <th>Metodo</th>
                  <th>Stato</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(function (p) {
                  return (
                    <tr key={p.id}>
                      <td>
                        {new Date(p.paymentDate).toLocaleDateString("it-IT")}
                      </td>
                      <td className="fw-semibold">
                        € {Number(p.amount).toFixed(2)}
                      </td>
                      <td>{p.method}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="text-muted" style={{ fontSize: 13 }}>
                        {p.notes || "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Tab>
      </Tabs>

      {/* Modale modifica paziente */}
      <PatientForm
        show={showEditModal}
        patient={patient}
        onClose={function () {
          setShowEditModal(false)
        }}
        onSaved={handlePatientSaved}
      />
    </>
  )
}

// Componenti interni di supporto ──────────────────────────────────────────

// Campo anagrafica — label + valore su 2 colonne
const InfoField = function ({ label, value, mono }) {
  return (
    <div className="col-md-6">
      <div className="text-secondary small fw-semibold mb-1">{label}</div>
      <div className={mono ? "font-monospace" : ""} style={{ fontSize: 15 }}>
        {value || "—"}
      </div>
    </div>
  )
}

// Campo cartella clinica — testo lungo su tutta la larghezza
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

export default PatientDetailPage
