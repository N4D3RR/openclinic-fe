import { createContext, useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL

//Creo il Context accessibile da qualsiasi componente
//quando un componente fa useContext(AuthContext) gli passo token, user, login(), logout(). isAdmin, etc
export const AuthContext = createContext()

const AuthProvider = function ({ children }) {
  //STATE
  //Token JWT inizializzato leggendo da localStorage
  const [token, setToken] = useState(localStorage.getItem("token"))
  //Dati utente (id, firstName, lastName, email, role, createdAt) dal localStorage
  const [user, setUser] = useState(function () {
    const saved = localStorage.getItem("user")
    //Se c'è un utente salvato lo parso da stringa JSON a oggetto - oppure null
    return saved ? JSON.parse(saved) : null
  })
  //loading = true mentre verifico se il token è ancora valido
  const [loading, setLoading] = useState(true)

  //FUNZIONI

  //Login salva il token e l'utente sia nello state che in localStorage
  const login = function (accessToken, userData) {
    localStorage.setItem("token", accessToken)
    localStorage.setItem("user", JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }

  //Logout cancella state e localStorage
  const logout = function () {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  //Funzioni per controllare il ruolo dell'utente loggato. Le uso nella Sidebar per mostrare/nascondere voci di menu
  //e nei componenti per abilitare/disabilitare funzionalità
  const isAdmin = function () {
    return user && user.role === "ADMIN"
  }

  const isSecretary = function () {
    return user && user.role === "SECRETARY"
  }

  const isDentist = function () {
    return user && user.role === "DENTIST"
  }

  const isHygienist = function () {
    return user && user.role === "HYGIENIST"
  }

  //VERIFICA TOKEN AL PRIMO CARICAMENTO
  useEffect(function () {
    if (token) {
      //Se ho un token in localStorage, verifico che sia ancora valido
      //chiamando GET /api/users/me — se il token è scaduto, il backend
      //risponde 401 e so che devo fare logout
      fetch(API_URL + "/api/users/me", {
        headers: { Authorization: "Bearer " + token },
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Token not valid")
          return res.json()
        })
        .then(function (userData) {
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          setLoading(false)
        })
        .catch(function () {
          logout()
          setLoading(false)
        })
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //PROVIDER

  //il Provider rende disponibili questi valori
  //a qualsiasi componente figlio che faccia useContext(AuthContext)
  return (
    <AuthContext.Provider
      value={{
        token, //il JWT per le chiamate API
        user, //oggetto utente { id, firstName, lastName, email, role }
        loading, //true mentre verifico il token al refresh
        login, //funzione per salvare token + utente dopo il login
        logout, //funzione per cancellare tutto e tornare al login
        isAdmin, //verifico se l'utente è ADMIN, SECRETARY, DENTIST, HYGIENIST
        isSecretary,
        isDentist,
        isHygienist,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
