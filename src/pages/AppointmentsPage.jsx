import { useState } from "react"
import api from "../services/api"
import TopBar from "../components/layout/TopBar"
import { Spinner } from "react-bootstrap"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"

const AppointmentsPage = function () {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  //converto appuntamenti del BE nel formato richiesto da FullCalendar
  const mapToApp = function (appointmentsList) {
    return appointmentsList.map(function (a) {
      const start = new Date(a.dateTime)
      const end = new Date(a.dateTime)
      end.setMinutes(end.getMinutes() + a.duration)

      return {
        id: a.id,
        title: a.patient.firstName + " " + a.patient.lastName,
        start: start.toISOString,
        end: start.toISOString,
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
          to.toISOString(),
      )
      .then(function (data) {
        setAppointments(data.content)
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
    fetchAppointments(info.start, info.end)
  }

  //click su slot vuoto apre modale creazione con data impostata sul giorno premuto
  const handleDateClick = function (info) {
    setSelectedAppointment(null)
    setSelectedDate(info.dateStr)
    setShowModal(true)
  }

  const handleEventClick = function (info) {
    setSelectedAppointment(info.event.extendedProps.appointment)
    setSelectedDate(null)
    setShowModal(true)
  }

  return (
    <>
      <TopBar title="Agenda" />

      {loading && <Spinner animation="border" />}

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
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: "09:00",
          endTime: "19:00",
        }}
        events={mapToApp(appointments)}
        datesSet={handleDateSet}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
    </>
  )
}
//TODO: modale appointmentForm
//TODO: migliorare calendario con time slot da 15 min, filtro o divisione per operatore/poltrona, drag and drop appuntamenti
export default AppointmentsPage
