import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { InputGroup, Form } from "react-bootstrap"
import { BsSearch } from "react-icons/bs"
import api from "../../services/api"

//titolo pagina e ricerca globale pazienti
const TopBar = function ({ title, subtitle }) {
  const [searchQuery, setSearchQuery] = useState("") //input utente
  const [searchResults, setSearchResults] = useState([]) //risultati
  const [showResults, setShowResults] = useState(false) //mostra o nascondi risultati
  const navigate = useNavigate()

  //funzione di ricerca ad ogni input dell'utente
  const handleSearch = function (e) {
    const query = e.target.value
    setSearchQuery(query)

    //inizia la ricerca solo dopo due caratteri scritti
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    //GET /api/patients/search?lastName= &size=5
    // PatientController.searchByLastName()
    api
      .get(
        "/api/patients/search?lastName=" +
          encodeURIComponent(query) +
          "&size=5",
      )
      .then(function (data) {
        setSearchResults(data.content || [])
        setShowResults(true)
      })
      .catch(function () {
        setSearchResults([])
      })
  }

  //clicco sul risultato e mi rimanda alla pagina paziente
  const handleSelectPatient = function (patient) {
    setSearchQuery("")
    setShowResults(false)
    setSearchResults([])
    navigate("/patients/" + patient.id)
  }

  const handleBlur = function () {
    setTimeout(function () {
      setShowResults(false)
    }, 200)
  }

  return (
    <div className="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h1
          className="fw-bold mb-0"
          style={{ fontSize: 24, letterSpacing: -0.5 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-secondary mb-0 mt-1" style={{ fontSize: 14 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* campo di ricerca */}
      <div style={{ position: "relative" }}>
        <InputGroup style={{ width: 280 }}>
          <InputGroup.Text className="bg-white border-end-0">
            <BsSearch className="text-muted" size={16} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Cerca paziente..."
            className="border-start-0"
            value={searchQuery}
            onChange={handleSearch}
            onBlur={handleBlur}
            onFocus={function () {
              if (searchResults.length > 0) setShowResults(true)
            }}
          />
        </InputGroup>

        {/* Dropdown risultati */}
        {showResults && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map(function (patient) {
              return (
                <div
                  key={patient.id}
                  className="px-3 py-2"
                  style={{ cursor: "pointer" }}
                  onMouseDown={function () {
                    handleSelectPatient(patient)
                  }}
                >
                  <div className="fw-semibold" style={{ fontSize: 14 }}>
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {patient.taxCode}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TopBar
