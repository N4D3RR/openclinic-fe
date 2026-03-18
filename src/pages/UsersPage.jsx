import { useContext, useState, useEffect } from "react"
import { Button, Alert, Table, Spinner, Pagination } from "react-bootstrap"
import { BsPlusLg, BsPencilFill, BsTrashFill } from "react-icons/bs"
import TopBar from "../components/layout/TopBar"
import UserForm from "../components/users/UserForm"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"

const UsersPage = function () {
  const { isAdmin } = useContext(AuthContext)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(
    function () {
      fetchUsers()
    },
    [page],
  )

  const fetchUsers = function () {
    setLoading(true)
    setError("")
    api
      .get("/api/users?page=" + page + "&size=10")
      .then(function (data) {
        setUsers(data.content)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch(function () {
        setError("Errore nel caricamento degli utenti")
        setLoading(false)
      })
  }

  const handleNew = function () {
    setSelectedUser(null)
    setShowModal(true)
  }

  const handleEdit = function (user) {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleDelete = function (id) {
    if (!window.confirm("Sei sicuro di voler eliminare questo utente?")) return
    api
      .delete("/api/users/" + id)
      .then(function () {
        fetchUsers()
      })
      .catch(function () {
        setError("Errore durante l'eliminazione")
      })
  }

  const handleSaved = function () {
    setShowModal(false)
    setSelectedUser(null)
    fetchUsers()
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
      <TopBar title="Utenti" />

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
              Nuovo Utente
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" style={{ color: "#2a9d8f" }} />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-muted py-5">
          Nessun utente registrato
        </div>
      ) : (
        <>
          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Ruolo</th>

                {isAdmin() && <th></th>}
              </tr>
            </thead>
            <tbody>
              {users.map(function (usr) {
                return (
                  <tr key={usr.id}>
                    <td className="fw-semibold">
                      {usr.firstName} {usr.lastName}
                    </td>
                    <td className="fw-semibold">{usr.email}</td>
                    <td className="text-muted" style={{ fontSize: 13 }}>
                      {usr.role || "—"}
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
                            handleEdit(usr)
                          }}
                        >
                          <BsPencilFill size={13} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Elimina"
                          onClick={function () {
                            handleDelete(usr.id)
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

      <UserForm
        show={showModal}
        user={selectedUser}
        onClose={function () {
          setShowModal(false)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

export default UsersPage
