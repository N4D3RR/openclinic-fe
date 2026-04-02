import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, Tab, Spinner, Alert, Badge, Button } from "react-bootstrap"
import { BsArrowLeft, BsPencilFill } from "react-icons/bs"
import TopBar from "../components/layout/TopBar"
import PatientForm from "../components/patients/PatientForm"
import Odontogram from "../components/odontogram/Odontogram"
import AppointmentsTab from "../components/appointments/AppointmentsTab"
import ClinicalRecordsTab from "../components/clinical-record/ClinicalRecordsTab"
import TreatmentPlansTab from "../components/treatment-plan/TreatmentPlansTab"
import QuotesTab from "../components/quotes/QuotesTab"
import PaymentsTab from "../components/payments/PaymentsTab"
import api from "../services/api"

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

const PatientDetailPage = function () {
  const { id } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)

  const [quotesRefreshKey, setQuotesRefreshKey] = useState(0)

  const loadPatient = function () {
    setLoading(true)
    api
      .get("/api/patients/" + id)
      .then(function (data) {
        setPatient(data)
      })
      .catch(function () {
        setError("Paziente non trovato")
      })
      .finally(function () {
        setLoading(false)
      })
  }

  useEffect(
    function () {
      loadPatient()
    },
    [id],
  )

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: "var(--bs-primary)" }} />
      </div>
    )

  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <title>Dettaglio Paziente — OpenClinic</title>
      <TopBar
        title={patient.firstName + " " + patient.lastName}
        subtitle={"CF: " + patient.fiscalCode}
      />

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
          className="border-0 fw-semibold  btn-clinic"
          onClick={function () {
            setShowEditModal(true)
          }}
        >
          <BsPencilFill className="me-2" size={13} />
          Modifica
        </Button>
      </div>

      <Tabs defaultActiveKey="odontogram" className="mb-4">
        <Tab eventKey="odontogram" title="Odontogramma">
          <div className="mt-3">
            <Odontogram
              patientId={id}
              onQuoteSaved={function () {
                setQuotesRefreshKey(function (k) {
                  return k + 1
                })
              }}
            />
          </div>
        </Tab>

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

        <Tab eventKey="appointments" title="Appuntamenti">
          <AppointmentsTab patientId={id} />
        </Tab>

        <Tab eventKey="clinical" title="Cartella Clinica" mountOnEnter>
          <ClinicalRecordsTab patientId={id} />
        </Tab>

        <Tab eventKey="treatment-plans" title="Piani di Cura">
          <TreatmentPlansTab patientId={id} />
        </Tab>

        <Tab eventKey="quotes" title="Preventivi">
          <QuotesTab patientId={id} refreshKey={quotesRefreshKey} />
        </Tab>

        <Tab eventKey="payments" title="Pagamenti">
          <PaymentsTab patientId={id} />
        </Tab>
      </Tabs>

      <PatientForm
        show={showEditModal}
        patient={patient}
        onClose={function () {
          setShowEditModal(false)
        }}
        onSaved={function () {
          setShowEditModal(false)
          loadPatient()
        }}
      />
    </>
  )
}

export default PatientDetailPage
