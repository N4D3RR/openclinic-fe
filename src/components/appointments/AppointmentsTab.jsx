import { useState, useEffect } from "react"
import { Button, Spinner } from "react-bootstrap"
import StatusBadge from "../common/StatusBadge"
import api from "../../services/api"
import AppointmentForm from "./AppointmentForm"
import { BsPencilFill, BsPlusLg } from "react-icons/bs"

const AppointmentsTab = function ({ patientId }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const loadAppointments = function () {
    api
      .get("/api/appointments/patient/" + patientId + "?page=0&size=20")
      .then(function (data) {
        setAppointments(data.content || [])
      })
      .finally(function () {
        setLoading(false)
      })
  }
  useEffect(
    function () {
      loadAppointments()
    },
    [patientId],
  )

  const handleEdit = function (appointment) {
    setSelectedAppointment(appointment)
    setShowModal(true)
  }

  const handleNew = function () {
    setSelectedAppointment(null)
    setShowModal(true)
  }

  const handleSaved = function () {
    setShowModal(false)
    setSelectedAppointment(null)
    loadAppointments()
  }

  if (loading)
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner
          animation="border"
          size="sm"
          style={{ color: "var(--bs-primary)" }}
        />
      </div>
    )

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
        <span className="text-secondary small">
          {appointments.length} appuntament
          {appointments.length === 1 ? "o" : "i"}
        </span>
        <Button
          size="sm"
          className="border-0 fw-semibold btn-clinic"
          onClick={handleNew}
        >
          <BsPlusLg className="me-1" size={11} />
          Nuovo Appuntamento
        </Button>
      </div>

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
                <tr
                  key={a.id}
                  onClick={function () {
                    handleEdit(a)
                  }}
                  style={{ cursor: "pointer" }}
                >
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
      <AppointmentForm
        show={showModal}
        appointment={selectedAppointment}
        selectedDate={null}
        preselectedPatientId={patientId}
        onClose={function () {
          setShowModal(false)
          setSelectedAppointment(null)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

export default AppointmentsTab
