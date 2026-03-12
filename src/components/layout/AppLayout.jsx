import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

//mostra sempre la sidebar a sinistra e il contenuto della pagina a destra
//con Outlet renderizzo la Route figlia attiva. evito di creare una pagina per ogni route e inserirci dentro Sidebar
const AppLayout = function () {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content flex-grow-1">
        <Outlet />
      </div>
    </div>
  )
}

export default AppLayout
