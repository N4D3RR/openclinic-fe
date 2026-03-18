import { useState, useEffect } from "react"
import { Modal, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap"
import api from "../../services/api"

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "",
}

const UserForm = function ({ show, user, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(
    function () {
      if (user) {
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          password: "",
          role: user.role || "",
        })
      } else {
        setForm(emptyForm)
      }
      setError("")
    },
    [user, show],
  )

  const handleChange = function (e) {
    const { name, value, type, checked } = e.target
    setForm(function (prev) {
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }
    })
  }

  const handleSubmit = function (e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role,
    }

    if (form.password) {
      payload.password = form.password
    }

    const request = user
      ? api.put("/api/users/" + user.id, payload) // modifica
      : api.post("/api/users", payload) // crea

    request
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
          {user ? "Modifica Utente" : "Nuovo Utente"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Nome *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={50}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Cognome *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={50}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Email *
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required={!user}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Password {user ? "(lascia vuoto per non cambiare)" : "*"}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Ruolo *
                </Form.Label>
                <Form.Select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleziona un ruolo...</option>
                  <option value="ADMIN">Admin</option>
                  <option value="DENTIST">Dentista</option>
                  <option value="HYGIENIST">Igienista</option>
                  <option value="SECRETARY">Segretaria</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            type="submit"
            className="border-0 fw-semibold"
            style={{ backgroundColor: "#2a9d8f" }}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : user ? (
              "Salva Modifiche"
            ) : (
              "Crea Utente"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
export default UserForm
