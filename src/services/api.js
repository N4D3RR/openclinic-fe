const API_URL = import.meta.env.VITE_API_URL

const getToken = function () {
  return localStorage.getItem("token")
}

const apiFetch = function (endpoint, options) {
  const token = getToken()
  const headers = {}

  if (options && options.headers) {
    Object.assign(headers, options.headers)
  }

  // Se il body NON è FormData, aggiungo Content-Type JSON
  if (!(options && options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers["Authorization"] = "Bearer " + token
  }

  return fetch(API_URL + endpoint, {
    ...options,
    headers: headers,
  }).then(function (res) {
    if (res.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
      return Promise.reject({ message: "Session expired" })
    }

    if (res.status === 204) {
      return null
    }

    if (!res.ok) {
      return res.json().then(function (err) {
        return Promise.reject(err)
      })
    }

    return res.json()
  })
}

//per non ripetere ogni volta header e token
//cosi posso fare api.get, api.post, etc

const api = {
  get: function (endpoint) {
    return apiFetch(endpoint, { method: "GET" })
  },

  post: function (endpoint, body) {
    return apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  put: function (endpoint, body) {
    return apiFetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  },

  delete: function (endpoint) {
    return apiFetch(endpoint, { method: "DELETE" })
  },

  upload: function (endpoint, formData) {
    return apiFetch(endpoint, {
      method: "POST",
      body: formData,
    })
  },
}

export default api
