import { useState } from "react"
import { Form, Row, Col } from "react-bootstrap"
import StatusBadge from "../common/StatusBadge"
import { BsPencilFill } from "react-icons/bs"

const AppointmentListView = function ({ appointments, onEdit, onRangeChange }) {
  const [filterStatus, setFilterStatus] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")

  const handleFromChange = function (e) {
    setFilterFrom(e.target.value)
    if (e.target.value && filterTo) {
      onRangeChange(new Date(e.target.value), new Date(filterTo))
    }
  }

  const handleToChange = function (e) {
    setFilterTo(e.target.value)
    if (filterFrom && e.target.value) {
      onRangeChange(new Date(filterFrom), new Date(e.target.value))
    }
  }

  const filtered = appointments.filter(function (a) {
    if (filterStatus && a.status !== filterStatus) return false
    return true
  })

  return (
    <>
      <Row className="g-2 mb-3">
        <Col md={3}>
          <Form.Control
            type="date"
            size="sm"
            value={filterFrom}
            onChange={handleFromChange}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="date"
            size="sm"
            value={filterTo}
            onChange={handleToChange}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            size="sm"
            value={filterStatus}
            onChange={function (e) {
              setFilterStatus(e.target.value)
            }}
          >
            <option value="">Tutti gli stati</option>
            <option value="CONFIRMED">Confermato</option>
            <option value="COMPLETED">Completato</option>
            <option value="CANCELLED">Cancellato</option>
            <option value="NO_SHOW">Non presentato</option>
          </Form.Select>
        </Col>
        <Col md={3} className="text-muted small d-flex align-items-center">
          {filtered.length} appuntament{filtered.length === 1 ? "o" : "i"}
        </Col>
      </Row>

      {filtered.length === 0 ? (
        <p className="text-muted">Nessun appuntamento trovato</p>
      ) : (
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Data e ora</th>
              <th>Paziente</th>
              <th>Durata</th>
              <th>Dentista</th>
              <th>Stato</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(function (a) {
              return (
                <tr
                  key={a.id}
                  style={{ cursor: "pointer" }}
                  onClick={function () {
                    onEdit(a)
                  }}
                >
                  <td className="fw-semibold">
                    {new Date(a.dateTime).toLocaleString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    {a.patient
                      ? a.patient.firstName + " " + a.patient.lastName
                      : "—"}
                  </td>
                  <td>{a.duration} min</td>
                  <td>
                    {a.dentist
                      ? a.dentist.firstName + " " + a.dentist.lastName
                      : "—"}
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="text-muted" style={{ fontSize: 13 }}>
                    {a.notes || "—"}
                  </td>
                  <td>
                    <BsPencilFill size={12} className="text-secondary" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </>
  )
}

export default AppointmentListView
