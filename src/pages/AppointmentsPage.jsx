import { useState } from "react"
import api from "../services/api"
import TopBar from "../components/layout/TopBar"
import { Spinner, Alert, Button } from "react-bootstrap"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { BsCalendar3, BsListUl, BsPlusLg } from "react-icons/bs"
import AppointmentListView from "../components/appointments/AppointmentListView"
import AppointmentForm from "../components/appointments/AppointmentForm"

// colori per stato appuntamento
const statusColors = {
  CONFIRMED: { bg: "var(--bs-primary)", border: "#21867a" },
  COMPLETED: { bg: "#9ba8b7", border: "#8494a5" },
  CANCELLED: { bg: "#ef4444", border: "#dc2626" },
  NO_SHOW: { bg: "#f59e0b", border: "#d97706" },
}

//bug timezone di FullCalendar
//toISOString converte in UTC, sottragg TimezoneOffset locale per avere orario corretto
const toLocalISO = function (date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .substring(0, 19)
}

const AppointmentsPage = function () {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  const [currentRange, setCurrentRange] = useState({ from: null, to: null })
  const [view, setView] = useState("calendar")

  //converto appuntamenti del BE nel formato richiesto da FullCalendar
  const mapToApp = function (appointmentsList) {
    return appointmentsList.map(function (a) {
      const start = new Date(a.dateTime)
      const end = new Date(a.dateTime)
      end.setMinutes(end.getMinutes() + a.duration)

      const colors = statusColors[a.status] || statusColors.CONFIRMED

      return {
        id: a.id,
        title: a.patient.firstName + " " + a.patient.lastName,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: "#fff",
        extendedProps: { appointment: a },
      }
    })
  }

  //fetch appuntamenti in base al range visibile nel calendario
  const fetchAppointments = function (from, to) {
    setLoading(true)
    setError("")
    api
      .get(
        "/api/appointments/date-range?from=" +
          from.toISOString() +
          "&to=" +
          to.toISOString() +
          "&page=0&size=200",
      )
      .then(function (data) {
        setAppointments(data.content || [])
      })
      .catch(function () {
        setError("Errore nel caricamento degli appuntamenti")
      })
      .finally(function () {
        setLoading(false)
      })
  }

  //quando cambio settimana, rifaccio il fetch
  const handleDateSet = function (info) {
    setCurrentRange({ from: info.start, to: info.end })
    fetchAppointments(info.start, info.end)
  }

  //click su slot vuoto apre modale creazione con data impostata sul giorno premuto
  const handleDateClick = function (info) {
    setSelectedAppointment(null)
    setSelectedDate(info.dateStr)
    setShowModal(true)
  }

  //click su appuntamento apre modale modifica
  const handleEventClick = function (info) {
    setSelectedAppointment(info.event.extendedProps.appointment)
    setSelectedDate(null)
    setShowModal(true)
  }

  // drag & drop — sposta appuntamento a nuova data/ora
  const handleEventDrop = function (info) {
    const appointment = info.event.extendedProps.appointment
    const newDateTime = toLocalISO(info.event.start)
    //prendo id dall'evento, non più dalle props appointment.id per evitare errori
    const appointmentId = info.event.id

    api
      .put("/api/appointments/" + appointmentId, {
        dateTime: newDateTime,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes || null,
      })
      .then(function () {
        // aggiorno la lista senza ricaricare tutto
        if (currentRange.from && currentRange.to) {
          fetchAppointments(currentRange.from, currentRange.to)
        }
      })
      .catch(function () {
        // se il backend rifiuta, rimetto l'evento dov'era
        info.revert()
        setError("Errore nello spostamento dell'appuntamento")
      })
  }

  // resize — cambia durata trascinando il bordo inferiore
  const handleEventResize = function (info) {
    const appointment = info.event.extendedProps.appointment
    // calcolo la nuova durata in minuti
    const newDuration = Math.round(
      (info.event.end.getTime() - info.event.start.getTime()) / 60000,
    )
    const appointmentId = info.event.id

    api
      .put("/api/appointments/" + appointmentId, {
        dateTime: toLocalISO(info.event.start),
        duration: newDuration,
        status: appointment.status,
        notes: appointment.notes || null,
      })
      .then(function () {
        if (currentRange.from && currentRange.to) {
          fetchAppointments(currentRange.from, currentRange.to)
        }
      })
      .catch(function () {
        info.revert()
        setError("Errore nella modifica della durata")
      })
  }

  // callback dopo create/edit/delete da modale
  const handleSaved = function () {
    setShowModal(false)
    setSelectedAppointment(null)
    setSelectedDate(null)
    if (currentRange.from && currentRange.to) {
      fetchAppointments(currentRange.from, currentRange.to)
    }
  }

  return (
    <>
      <title>Agenda — OpenClinic</title>
      <TopBar title="Agenda" />

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={function () {
            setError("")
          }}
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <Button
            size="sm"
            className={
              view === "calendar"
                ? "border-0 fw-semibold btn-clinic"
                : "border-0 fw-semibold btn-outline-clinic"
            }
            variant={view === "calendar" ? undefined : "outline-secondary"}
            onClick={function () {
              setView("calendar")
            }}
          >
            <BsCalendar3 className="me-1" size={13} />
            Calendario
          </Button>
          <Button
            size="sm"
            className={view === "list" ? "border-0 fw-semibold btn-clinic" : ""}
            variant={view === "list" ? undefined : "outline-secondary"}
            onClick={function () {
              setView("list")
            }}
          >
            <BsListUl className="me-1" size={13} />
            Lista
          </Button>
        </div>
        {view === "list" && (
          <Button
            size="sm"
            className="border-0 fw-semibold btn-clinic"
            onClick={function () {
              setSelectedAppointment(null)
              setSelectedDate(null)
              setShowModal(true)
            }}
          >
            <BsPlusLg className="me-1" size={11} />
            Nuovo Appuntamento
          </Button>
        )}
      </div>

      {loading && <Spinner animation="border" size="sm" className="mb-3" />}

      {view === "calendar" ? (
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="it"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "timeGridDay,timeGridWeek",
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:15:00"
          slotLabelInterval="01:00"
          allDaySlot={false}
          height="auto"
          nowIndicator={true}
          weekends={false}
          selectable={true}
          editable={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "19:00",
          }}
          events={mapToApp(appointments)}
          datesSet={handleDateSet}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
        />
      ) : (
        <AppointmentListView
          appointments={appointments}
          onEdit={function (a) {
            setSelectedAppointment(a)
            setSelectedDate(null)
            setShowModal(true)
          }}
          onRangeChange={function (from, to) {
            setCurrentRange({ from, to })
            fetchAppointments(from, to)
          }}
        />
      )}
      <AppointmentForm
        show={showModal}
        appointment={selectedAppointment}
        selectedDate={selectedDate}
        onClose={function () {
          setShowModal(false)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

//TODO: migliorare calendario con time slot da 15 min, filtro o divisione per operatore/poltrona
export default AppointmentsPage
