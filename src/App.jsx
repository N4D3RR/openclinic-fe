import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useContext } from "react"
import AuthProvider, { AuthContext } from "./context/AuthContext"
import AppLayout from "./components/layout/AppLayout"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import { Spinner } from "react-bootstrap"
import "./styles/App.scss"
import PatientsPage from "./pages/PatientsPage"
import PatientDetailPage from "./pages/PatientDetailPage"
import ProceduresPage from "./pages/ProceduresPage"
import QuotesPage from "./pages/QuotesPage"
import QuoteDetailPage from "./pages/QuoteDetailPage"
import AppointmentsPage from "./pages/AppointmentsPage"
import UsersPage from "./pages/UsersPage"

//pagine che richiedono autenticazione
//durante la verifica, spinner attivo
//se l'utente no ha token viene reindirizzato al login
const ProtectedRoute = function ({ children }) {
  const { token, loading } = useContext(AuthContext)

  {
    /* LOADING */
  }
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" style={{ color: "#2a9d8f" }} />
      </div>
    )
  }

  //redirect al login
  if (!token) {
    return <Navigate to="/login" />
  }

  return children
}

//utente già loggato
//se va su /login viene reindirizzato alla dashboard
const PublicRoute = function ({ children }) {
  const { token, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" style={{ color: "#2a9d8f" }} />
      </div>
    )
  }

  //redirect alla dashboard
  if (token) {
    return <Navigate to="/" />
  }

  return children
}

function App() {
  return (
    //Single Page Application (la pagina non si ricarica mai)
    <BrowserRouter>
      {/* AuthProvider rende token e user accessibili in tutta l'app con UserContext(AuthContext) */}
      <AuthProvider>
        <Routes>
          {/* Login - public route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Tutte le pagine protette — avvolte in ProtectedRoute + AppLayout.
              AppLayout mostra la sidebar + il contenuto della pagina.
              Le Route figlie vengono renderizzate dentro l'<Outlet /> di AppLayout. 
              Outlet è dove vengono renderizzate le pagine children */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/quotes/:id" element={<QuoteDetailPage />} />
            {/* <Route path="/payments" element={<PaymentsPage />} /> */}
            <Route path="/procedures" element={<ProceduresPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* path non riconosciuto fa redirect alla dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
