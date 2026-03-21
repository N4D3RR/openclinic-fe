import { useState, useEffect } from "react"
import { Spinner } from "react-bootstrap"
import StatusBadge from "../common/StatusBadge"
import api from "../../services/api"

const QuotesTab = function ({ patientId }) {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(
    function () {
      api
        .get("/api/quotes/patient/" + patientId + "?page=0&size=20")
        .then(function (data) {
          setQuotes(data.content || [])
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

  if (quotes.length === 0)
    return <p className="text-muted mt-3">Nessun preventivo registrato</p>

  return (
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
              <td>{new Date(q.createdAt).toLocaleDateString("it-IT")}</td>
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
  )
}

export default QuotesTab
