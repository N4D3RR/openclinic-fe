import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap"
import { BsClipboard2PulseFill } from "react-icons/bs"
import { AuthContext } from "../context/AuthContext"

const API_URL = import.meta.env.VITE_API_URL

const LoginPage = function () {
  //state campi form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  //loading e error
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  //prendo dal Context la funzione login per salvare token e utente
  const { login } = useContext(AuthContext)

  //redirect alla dashboard dopo il login
  const navigate = useNavigate()

  const handleSubmit = function (e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    // 1. POST /auth/login - ricevo accessToken (LoginResDTO)
    fetch(API_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (err) {
            throw err
          })
        }
        return res.json()
      })
      .then(function (data) {
        // 2. GET /api/users/me con il token ricevuto
        //BE restituisce UserResponseDTO
        return fetch(API_URL + "/api/users/me", {
          headers: { Authorization: "Bearer " + data.accessToken },
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Errore caricamento utente")
            return res.json()
          })
          .then(function (userData) {
            // 3. Salvo token e user nel context
            //login() salva token e user in localStorage e state
            login(data.accessToken, userData)
            navigate("/")
          })
      })
      .catch(function (err) {
        setError(err.message || "Credenziali non valide")
        setLoading(false)
      })
  }

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <Card
        className="p-4 shadow border-0"
        style={{ maxWidth: 400, width: "100%", borderRadius: 16 }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 mb-3"
            style={{
              width: 56,
              height: 56,
              backgroundColor: "rgba(42, 157, 143, 0.1)",
              color: "#2a9d8f",
            }}
          >
            <BsClipboard2PulseFill size={28} />
          </div>
          <h1
            className="fw-bold mb-0"
            style={{ fontSize: 24, letterSpacing: -0.5 }}
          >
            OpenClinic
          </h1>
          <p className="text-secondary mt-1" style={{ fontSize: 14 }}>
            Gestionale Odontoiatrico
          </p>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        {/* Form login*/}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Email
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="email@openclinic.it"
              value={email}
              onChange={function (e) {
                setEmail(e.target.value)
              }}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small text-secondary">
              Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={function (e) {
                setPassword(e.target.value)
              }}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            className="w-100 fw-bold border-0"
            style={{
              backgroundColor: "#2a9d8f",
              padding: "11px",
              fontSize: 15,
            }}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Accedi"}
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
