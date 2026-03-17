import { useState, useEffect, useContext } from "react"
import { Button, Alert, Table, Spinner, Pagination } from "react-bootstrap"
import { BsPlusLg, BsPencilFill, BsTrashFill } from "react-icons/bs"
import TopBar from "../components/layout/TopBar"
import ProcedureForm from "../components/procedures/ProcedureForm"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"

const ProceduresPage = function () {
  const { isAdmin } = useContext(AuthContext)

  const [procedures, setProcedures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState(null)

  useEffect(
    function () {
      fetchProcedures()
    },
    [page],
  )

  const fetchProcedures = function () {
    setLoading(true)
    setError("")
    api
      .get("/api/procedures?page=" + page + "&size=10")
      .then(function (data) {
        setProcedures(data.content)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch(function () {
        setError("Errore nel caricamento delle prestazioni")
        setLoading(false)
      })
  }

  const handleNew = function () {
    setSelectedProcedure(null)
    setShowModal(true)
  }

  const handleEdit = function (procedure) {
    setSelectedProcedure(procedure)
    setShowModal(true)
  }

  const handleDelete = function (id) {
    if (!window.confirm("Sei sicuro di voler eliminare questa prestazione?"))
      return
    api
      .delete("/api/procedures/" + id)
      .then(function () {
        fetchProcedures()
      })
      .catch(function () {
        setError("Errore durante l'eliminazione")
      })
  }

  const handleSaved = function () {
    setShowModal(false)
    setSelectedProcedure(null)
    fetchProcedures()
  }

  const renderPagination = function () {
    if (totalPages <= 1) return null
    const items = []
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={function () {
            setPage(i)
          }}
        >
          {i + 1}
        </Pagination.Item>,
      )
    }
    return (
      <Pagination className="justify-content-center mt-3 mb-0">
        <Pagination.Prev
          onClick={function () {
            setPage(page - 1)
          }}
          disabled={page === 0}
        />
        {items}
        <Pagination.Next
          onClick={function () {
            setPage(page + 1)
          }}
          disabled={page === totalPages - 1}
        />
      </Pagination>
    )
  }

  return (
    <>
      <TopBar title="Prestazioni" />

      <div className="d-flex justify-content-between align-items-center mb-3">
        {error && (
          <Alert variant="danger" className="mb-0 py-2">
            {error}
          </Alert>
        )}
        {isAdmin() && (
          <div className="ms-auto">
            <Button
              onClick={handleNew}
              className="border-0 fw-semibold"
              style={{ backgroundColor: "#2a9d8f" }}
            >
              <BsPlusLg className="me-2" />
              Nuova Prestazione
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" style={{ color: "#2a9d8f" }} />
        </div>
      ) : procedures.length === 0 ? (
        <div className="text-center text-muted py-5">
          Nessuna prestazione registrata
        </div>
      ) : (
        <>
          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Codice</th>
                <th>Nome</th>
                <th>Descrizione</th>
                <th>Durata</th>
                <th>Prezzo</th>
                {isAdmin() && <th></th>}
              </tr>
            </thead>
            <tbody>
              {procedures.map(function (proc) {
                return (
                  <tr key={proc.id}>
                    <td>
                      <span
                        className="font-monospace fw-semibold"
                        style={{ fontSize: 13 }}
                      >
                        {proc.code}
                      </span>
                    </td>
                    <td className="fw-semibold">{proc.name}</td>
                    <td className="text-muted" style={{ fontSize: 13 }}>
                      {proc.description || "—"}
                    </td>
                    <td>{proc.durationInMinutes} min</td>
                    <td className="fw-semibold">
                      € {Number(proc.price).toFixed(2)}
                    </td>
                    {isAdmin() && (
                      <td
                        className="text-end"
                        onClick={function (e) {
                          e.stopPropagation()
                        }}
                      >
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          title="Modifica"
                          onClick={function () {
                            handleEdit(proc)
                          }}
                        >
                          <BsPencilFill size={13} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Elimina"
                          onClick={function () {
                            handleDelete(proc.id)
                          }}
                        >
                          <BsTrashFill size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </Table>
          {renderPagination()}
        </>
      )}

      <ProcedureForm
        show={showModal}
        procedure={selectedProcedure}
        onClose={function () {
          setShowModal(false)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

export default ProceduresPage
