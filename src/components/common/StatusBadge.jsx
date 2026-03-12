import { Badge } from "react-bootstrap"

//mappo ogni statuts del BE con il corrispettivo italiano e classe CSS
const statusMap = {
  //Appointment STATUS
  CONFIRMED: { label: "Confermato", className: "badge-confirmed" },
  COMPLETED: { label: "Completato", className: "badge-completed" },
  CANCELLED: { label: "Annullato", className: "badge-cancelled" },
  NO_SHOW: { label: "No Show", className: "badge-no-show" },

  //Quote STATUS
  DRAFT: { label: "Bozza", className: "badge-draft" },
  SENT: { label: "Inviato", className: "badge-sent" },
  ACCEPTED: { label: "Accettato", className: "badge-accepted" },
  REJECTED: { label: "Rifiutato", className: "badge-rejected" },
  EXPIRED: { label: "Scaduto", className: "badge-cancelled" },

  //Payment STATUS
  PAID: { label: "Pagato", className: "badge-paid" },
  PENDING: { label: "In attesa", className: "badge-pending" },
  PARTIAL: { label: "Parziale", className: "badge-partial" },

  //TreatmentPlan STATUS
  PLANNED: { label: "Pianificato", className: "badge-confirmed" },
  IN_PROGRESS: { label: "In corso", className: "badge-sent" },
}

const StatusBadge = function ({ status }) {
  const config = statusMap[status] || {
    label: status,
    className: "badge-draft",
  }

  return (
    <Badge
      pill
      className={config.className}
      style={{ fontWeight: 600, fontSize: 12 }}
    >
      {config.label}
    </Badge>
  )
}

export default StatusBadge
