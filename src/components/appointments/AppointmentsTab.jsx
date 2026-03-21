import { useState, useEffect } from "react"
import { Spinner } from "react-bootstrap"
import StatusBadge from "../common/StatusBadge"
import api from "../../services/api"

const AppointmentsTab = function ({ patientId }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(
    function () {
      api
        .get("/api/appointments/patient/" + patientId + "?page=0&size=20")
        .then(function (data) {
          setAppointments(data.content || [])
        })
        .finally(function () {
          setLoading(false)
        })
    },
    [patientId],
  )

  if (loading)
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" size="sm" style={{ color: "#2a9d8f" }} />
      </div>
    )

  if (appointments.length === 0)
    return <p className="text-muted mt-3">Nessun appuntamento registrato</p>

  return (
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
  )
}

export default AppointmentsTab
