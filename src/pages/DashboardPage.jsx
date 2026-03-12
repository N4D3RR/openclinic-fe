import TopBar from "../components/layout/TopBar"

// TODO: lista appuntamenti di oggi
// TODO: azioni rapide (nuovo appuntamento, cerca pz)
// TODO: avvisi (preventivi in attesa, pz inattivi)

const DashboardPage = function () {
  //creo la data odierna
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <TopBar title="Dashboard" subtitle={today} />
      <p className="text-muted">
        Appuntamenti di oggi, azioni rapide e avvisi appariranno qui.
      </p>
    </>
  )
}

export default DashboardPage
