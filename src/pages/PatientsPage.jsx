import { useState, useEffect } from "react"
import { Button, Alert } from "react-bootstrap"
import { BsPersonPlusFill } from "react-icons/bs"
import TopBar from "../components/layout/TopBar"
import PatientTable from "../components/patients/PatientTable"
import PatientForm from "../components/patients/PatientForm"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

const PatientsPage = function () {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // paginazione
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // modale
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null) // null = crea, oggetto = modifica

  useEffect(
    function () {
      fetchPatients()
    },
    [page],
  )

  const fetchPatients = function () {
    setLoading(true)
    setError("")
    api
      .get("/api/patients?page=" + page + "&size=10")
      .then(function (data) {
        setPatients(data.content)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch(function () {
        setError("Errore nel caricamento dei pazienti")
        setLoading(false)
      })
  }

  // apre modale per nuovo paziente
  const handleNew = function () {
    setSelectedPatient(null)
    setShowModal(true)
  }

  // apre modale precompilata per modifica
  const handleEdit = function (patient) {
    setSelectedPatient(patient)
    setShowModal(true)
  }

  // elimina paziente con conferma
  const handleDelete = function (id) {
    if (!window.confirm("Sei sicuro di voler eliminare questo paziente?"))
      return
    api
      .delete("/api/patients/" + id)
      .then(function () {
        fetchPatients()
      })
      .catch(function () {
        setError("Errore durante l'eliminazione")
      })
  }

  // chiamato dal PatientForm dopo salvataggio
  const handleSaved = function () {
    setShowModal(false)
    setSelectedPatient(null)
    fetchPatients()
  }

  return (
    <>
      <title>Pazienti — OpenClinic</title>
      <TopBar title="Pazienti" />

      <div className="d-flex justify-content-between align-items-center mb-3">
        {error && (
          <Alert variant="danger" className="mb-0 py-2">
            {error}
          </Alert>
        )}
        <div className="ms-auto">
          <Button
            onClick={handleNew}
            className="border-0 fw-semibold btn-clinic"
          >
            <BsPersonPlusFill className="me-2" />
            Nuovo Paziente
          </Button>
        </div>
      </div>

      <PatientTable
        patients={patients}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelect={function (id) {
          navigate("/patients/" + id)
        }}
      />

      <PatientForm
        show={showModal}
        patient={selectedPatient}
        onClose={function () {
          setShowModal(false)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

export default PatientsPage
