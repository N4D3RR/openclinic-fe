import { useState, useEffect } from "react"
import { Spinner } from "react-bootstrap"
import StatusBadge from "../common/StatusBadge"
import api from "../../services/api"

const PaymentsTab = function ({ patientId }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(
    function () {
      api
        .get("/api/payments/patient/" + patientId + "?page=0&size=20")
        .then(function (data) {
          setPayments(data.content || [])
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

  if (payments.length === 0)
    return <p className="text-muted mt-3">Nessun pagamento registrato</p>

  return (
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
              <td>{new Date(p.paymentDate).toLocaleDateString("it-IT")}</td>
              <td className="fw-semibold">€ {Number(p.amount).toFixed(2)}</td>
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
  )
}

export default PaymentsTab
