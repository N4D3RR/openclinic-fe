import { useState, useEffect, useContext } from "react"
import { Modal, Form, Button, Spinner, Alert, Table } from "react-bootstrap"
import { AuthContext } from "../../context/AuthContext"
import api from "../../services/api"

const OdontogramQuoteModal = function ({
  show,
  patientId,
  cartItems,
  onClose,
  onSaved,
}) {
  const { isAdmin } = useContext(AuthContext)
  const [dentists, setDentists] = useState([])
  const [dentistId, setDentistId] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(
    function () {
      if (!show) return
      setError("")
      setNotes("")
      //copio il carrello in items locali per permettere modifica prezzi
      setItems(
        cartItems.map(function (c) {
          return {
            toothNumber: c.toothNumber,
            procedure: c.procedure,
            quotedPrice: c.procedure.price || "",
          }
        }),
      )

      if (isAdmin()) {
        api
          .get("/api/users/role?role=DENTIST&page=0&size=100")
          .then(function (data) {
            setDentists(data.content || [])
          })
          .catch(function () {})
      }
    },
    [show, cartItems],
  )

  const handlePriceChange = function (index, value) {
    setItems(function (prev) {
      const updated = [...prev]
      updated[index] = { ...updated[index], quotedPrice: value }
      return updated
    })
  }

  const handleSubmit = function (e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const quotePayload = {
      patientId: patientId,
      notes: notes || null,
    }
    if (isAdmin() && dentistId) quotePayload.dentistId = dentistId

    //1 creo il preventivo
    api
      .post("/api/quotes", quotePayload)
      .then(function (quote) {
        //2 aggiungo tutte le voci in sequenza con reduce
        //ad ogni iterazione chain è la promise dell'operazione precedente, .then essegue il post successivo solo al completamento del precedente
        //faccio un post sequenziale con reduce su promise chain, con promise.all sarebbero stati in parallelo, rischio di creare inconsistenza nel db in caso di fallimento di uno dei post
        return items.reduce(function (chain, item) {
          return chain.then(function () {
            return api.post("/api/quote-items", {
              quoteId: quote.id,
              procedureId: item.procedure.id,
              toothNumber: parseInt(item.toothNumber),
              quotedPrice: parseFloat(item.quotedPrice),
            })
          })
        }, Promise.resolve())
      })
      .then(function () {
        setLoading(false)
        onSaved()
      })
      .catch(function (err) {
        setError(err.message || "Errore durante il salvataggio")
        setLoading(false)
      })
  }

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          Crea Preventivo dall'Odontogramma
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Tabella voci prezzi modificabili */}
          <Table size="sm" className="mb-3">
            <thead className="table-light">
              <tr>
                <th>Dente</th>
                <th>Prestazione</th>
                <th>Prezzo (€)</th>
              </tr>
            </thead>
            <tbody>
              {items.map(function (item, i) {
                return (
                  <tr key={i}>
                    <td>{item.toothNumber}</td>
                    <td>{item.procedure.name}</td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.quotedPrice}
                        onChange={function (e) {
                          handlePriceChange(i, e.target.value)
                        }}
                        required
                        min={0.01}
                        step={0.01}
                        style={{ width: 90 }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>

          {isAdmin() && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                Dentista{" "}
                <span className="text-muted fw-normal">(opzionale)</span>
              </Form.Label>
              <Form.Select
                value={dentistId}
                onChange={function (e) {
                  setDentistId(e.target.value)
                }}
              >
                <option value="">Nessun dentista assegnato</option>
                {dentists.map(function (d) {
                  return (
                    <option key={d.id} value={d.id}>
                      {d.lastName} {d.firstName}
                    </option>
                  )
                })}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group>
            <Form.Label className="fw-semibold small text-secondary">
              Note
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={notes}
              onChange={function (e) {
                setNotes(e.target.value)
              }}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            type="submit"
            className="border-0 fw-semibold btn-clinic"
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Crea Preventivo"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default OdontogramQuoteModal
