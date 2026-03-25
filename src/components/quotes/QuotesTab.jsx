import { useState, useEffect } from "react"
import { Button, Spinner } from "react-bootstrap"
import StatusBadge from "../common/StatusBadge"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"
import { BsPlusLg } from "react-icons/bs"
import QuoteForm from "./QuoteForm"

const QuotesTab = function ({ patientId, refreshKey }) {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()

  const fetchQuotes = function () {
    setLoading(true)
    api
      .get("/api/quotes/patient/" + patientId + "?page=0&size=20")
      .then(function (data) {
        setQuotes(data.content || [])
      })
      .finally(function () {
        setLoading(false)
      })
  }

  useEffect(
    function () {
      fetchQuotes()
    },
    [patientId, refreshKey],
  )

  const grandTotal = quotes.reduce(function (acc, q) {
    return (
      acc +
      (q.items
        ? q.items.reduce(function (s, i) {
            return s + Number(i.quotedPrice)
          }, 0)
        : 0)
    )
  }, 0)

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

  if (quotes.length === 0)
    return <p className="text-muted mt-3">Nessun preventivo registrato</p>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
        <span className="text-muted small">
          {quotes.length} preventiv{quotes.length === 1 ? "o" : "i"}
        </span>
        <Button
          size="sm"
          className="border-0 fw-semibold btn-clinic"
          onClick={function () {
            setShowForm(true)
          }}
        >
          <BsPlusLg className="me-1" size={12} />
          Nuovo Preventivo
        </Button>
      </div>
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
              <tr
                key={q.id}
                style={{ cursor: "pointer" }}
                onClick={function () {
                  navigate("/quotes/" + q.id)
                }}
              >
                <td>{new Date(q.createdAt).toLocaleDateString("it-IT")}</td>
                <td>
                  <StatusBadge status={q.status} />
                </td>
                <td>
                  {q.dentist
                    ? q.dentist.firstName + " " + q.dentist.lastName
                    : "—"}
                </td>
                <td>{q.items ? q.items.length + " voci" : "-"}</td>
                <td className="text-muted" style={{ fontSize: 13 }}>
                  {q.notes || "-"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {quotes.length > 0 && (
        <div className="text-end fw-bold mt-2" style={{ fontSize: 15 }}>
          Totale preventivi: € {grandTotal.toFixed(2)}
        </div>
      )}

      <QuoteForm
        show={showForm}
        patientId={patientId}
        onClose={function () {
          setShowForm(false)
        }}
        onSaved={function () {
          setShowForm(false)
          fetchQuotes()
        }}
      />
    </>
  )
}

export default QuotesTab
