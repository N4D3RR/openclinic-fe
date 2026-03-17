import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Alert, Spinner, Table, Badge } from "react-bootstrap"
import { BsArrowLeft, BsPlusLg, BsTrashFill } from "react-icons/bs"
import TopBar from "../components/layout/TopBar"
import StatusBadge from "../components/common/StatusBadge"
import QuoteItemForm from "../components/quotes/QuoteItemForm"
import api from "../services/api"

const QuoteDetailPage = function () {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showItemModal, setShowItemModal] = useState(false)

  useEffect(
    function () {
      fetchQuote()
    },
    [id],
  )

  const fetchQuote = function () {
    setLoading(true)
    setError("")
    api
      .get("/api/quotes/" + id)
      .then(function (data) {
        setQuote(data)
        setLoading(false)
      })
      .catch(function () {
        setError("Errore nel caricamento del preventivo")
        setLoading(false)
      })
  }

  const handleStatusChange = function (newStatus) {
    const label =
      newStatus === "ACCEPTED"
        ? "Sei sicuro di voler ACCETTARE questo preventivo? Verrà creato un Piano di Cura."
        : "Sei sicuro di voler cambiare lo stato del preventivo?"
    if (!window.confirm(label)) return

    api
      .put("/api/quotes/" + id, { status: newStatus, notes: quote.notes })
      .then(function (data) {
        setQuote(data)
      })
      .catch(function () {
        setError("Errore durante l'aggiornamento dello stato")
      })
  }

  const handleDeleteItem = function (itemId) {
    if (!window.confirm("Rimuovere questa voce dal preventivo?")) return
    api
      .delete("/api/quote-items/" + itemId)
      .then(function () {
        fetchQuote()
      })
      .catch(function () {
        setError("Errore durante la rimozione della voce")
      })
  }

  const handleItemSaved = function () {
    setShowItemModal(false)
    fetchQuote()
  }

  // calcolo totale
  const total =
    quote && quote.items
      ? quote.items.reduce(function (acc, item) {
          return acc + Number(item.quotedPrice)
        }, 0)
      : 0

  // un preventivo non DRAFT non può essere modificato
  const isDraft = quote && quote.status === "DRAFT"

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
        title={
          "Preventivo — " +
          quote.patient.firstName +
          " " +
          quote.patient.lastName
        }
        subtitle={new Date(quote.createdAt).toLocaleDateString("it-IT")}
      />

      {/* Intestazione */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <Button
          variant="link"
          className="text-secondary p-0 text-decoration-none"
          onClick={function () {
            navigate("/quotes")
          }}
        >
          <BsArrowLeft className="me-1" /> Torna ai preventivi
        </Button>

        <div className="d-flex align-items-center gap-2">
          <StatusBadge status={quote.status} />
          {/* bottoni cambio stato — solo se DRAFT */}
          {isDraft && (
            <>
              <Button
                size="sm"
                className="border-0 fw-semibold"
                style={{ backgroundColor: "#2a9d8f" }}
                onClick={function () {
                  handleStatusChange("SENT")
                }}
              >
                Segna come Inviato
              </Button>
            </>
          )}
          {/* accetta — solo se SENT */}
          {quote.status === "SENT" && (
            <>
              <Button
                size="sm"
                variant="success"
                className="fw-semibold"
                onClick={function () {
                  handleStatusChange("ACCEPTED")
                }}
              >
                ✓ Accetta — Crea Piano di Cura
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                className="fw-semibold"
                onClick={function () {
                  handleStatusChange("REJECTED")
                }}
              >
                ✕ Rifiuta
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Riepilogo testata */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="text-secondary small fw-semibold mb-1">Paziente</div>
          <div className="fw-semibold">
            {quote.patient.firstName} {quote.patient.lastName}
          </div>
        </div>
        <div className="col-md-4">
          <div className="text-secondary small fw-semibold mb-1">Dentista</div>
          <div>
            {quote.dentist
              ? quote.dentist.firstName + " " + quote.dentist.lastName
              : "—"}
          </div>
        </div>
        <div className="col-md-4">
          <div className="text-secondary small fw-semibold mb-1">Note</div>
          <div className="text-muted" style={{ fontSize: 14 }}>
            {quote.notes || "—"}
          </div>
        </div>
        {/* se esiste già un TreatmentPlan collegato */}
        {quote.treatmentPlanId && (
          <div className="col-md-12">
            <Alert variant="success" className="py-2 mb-0">
              Piano di Cura creato —{" "}
              <span
                className="fw-semibold"
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={function () {
                  navigate("/treatment-plans/" + quote.treatmentPlanId)
                }}
              >
                Visualizza Piano di Cura
              </span>
            </Alert>
          </div>
        )}
      </div>

      {/* Voci preventivo */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">
          Voci ({quote.items ? quote.items.length : 0})
        </h6>
        {/* aggiungi voce solo se DRAFT */}
        {isDraft && (
          <Button
            size="sm"
            className="border-0 fw-semibold"
            style={{ backgroundColor: "#2a9d8f" }}
            onClick={function () {
              setShowItemModal(true)
            }}
          >
            <BsPlusLg className="me-1" />
            Aggiungi Voce
          </Button>
        )}
      </div>

      {!quote.items || quote.items.length === 0 ? (
        <div className="text-center text-muted py-4">
          Nessuna voce aggiunta al preventivo
        </div>
      ) : (
        <Table hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Prestazione</th>
              <th>Codice</th>
              <th>Dente (FDI)</th>
              <th>Prezzo preventivato</th>
              <th>Prezzo di listino</th>
              {isDraft && <th></th>}
            </tr>
          </thead>
          <tbody>
            {quote.items.map(function (item) {
              return (
                <tr key={item.id}>
                  <td className="fw-semibold">{item.procedure.name}</td>
                  <td>
                    <span className="font-monospace" style={{ fontSize: 13 }}>
                      {item.procedure.code}
                    </span>
                  </td>
                  <td>{item.toothNumber}</td>
                  <td className="fw-semibold">
                    € {Number(item.quotedPrice).toFixed(2)}
                  </td>
                  <td className="text-muted">
                    € {Number(item.procedure.price).toFixed(2)}
                  </td>
                  {isDraft && (
                    <td
                      className="text-end"
                      onClick={function (e) {
                        e.stopPropagation()
                      }}
                    >
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Rimuovi"
                        onClick={function () {
                          handleDeleteItem(item.id)
                        }}
                      >
                        <BsTrashFill size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
            {/* riga totale */}
            <tr className="table-light fw-bold">
              <td colSpan={isDraft ? 3 : 3}>Totale</td>
              <td>€ {total.toFixed(2)}</td>
              <td colSpan={isDraft ? 2 : 1}></td>
            </tr>
          </tbody>
        </Table>
      )}

      <QuoteItemForm
        show={showItemModal}
        quoteId={id}
        onClose={function () {
          setShowItemModal(false)
        }}
        onSaved={handleItemSaved}
      />
    </>
  )
}

export default QuoteDetailPage
