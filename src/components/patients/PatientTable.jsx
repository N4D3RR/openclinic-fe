import { Table, Spinner, Pagination, Badge } from "react-bootstrap"
import { BsPencilFill, BsTrashFill } from "react-icons/bs"

const PatientTable = function ({
  patients,
  loading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onSelect,
}) {
  // genera i numeri di pagina da mostrare
  const renderPagination = function () {
    if (totalPages <= 1) return null

    const items = []
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={function () {
            onPageChange(i)
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
            onPageChange(page - 1)
          }}
          disabled={page === 0}
        />
        {items}
        <Pagination.Next
          onClick={function () {
            onPageChange(page + 1)
          }}
          disabled={page === totalPages - 1}
        />
      </Pagination>
    )
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: "#2a9d8f" }} />
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="text-center text-muted py-5">Nessun paziente trovato</div>
    )
  }

  return (
    <>
      <Table hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>Nominativo</th>
            <th>Codice Fiscale</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Consenso Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {patients.map(function (patient) {
            return (
              <tr
                key={patient.id}
                onClick={function () {
                  onSelect(patient.id)
                }}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div className="fw-semibold">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {/* birthDate arriva come array [yyyy, mm, dd] da Spring */}
                    {patient.birthDate
                      ? new Date(patient.birthDate).toLocaleDateString("it-IT")
                      : "—"}
                  </div>
                </td>
                <td>
                  <span className="font-monospace" style={{ fontSize: 13 }}>
                    {patient.fiscalCode}
                  </span>
                </td>
                <td>{patient.email}</td>
                <td>{patient.phone}</td>
                <td>
                  <Badge
                    pill
                    className={
                      patient.emailConsent
                        ? "badge-accepted"
                        : "badge-cancelled"
                    }
                    style={{ fontWeight: 600, fontSize: 12 }}
                  >
                    {patient.emailConsent ? "Sì" : "No"}
                  </Badge>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    title="Modifica"
                    onClick={function () {
                      onEdit(patient)
                    }}
                  >
                    <BsPencilFill size={13} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Elimina"
                    onClick={function () {
                      onDelete(patient.id)
                    }}
                  >
                    <BsTrashFill size={13} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>

      {renderPagination()}
    </>
  )
}

export default PatientTable
