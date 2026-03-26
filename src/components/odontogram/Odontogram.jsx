import { useMemo, useState, useCallback, useEffect } from "react"
import { Odontogram as TeethChart } from "react-odontogram"
import "react-odontogram/style.css"
import { Button, Badge, Spinner, ListGroup, Offcanvas } from "react-bootstrap"
import api from "../../services/api"
import TreatmentForm from "../treatments/TreatmentForm"
import OdontogramQuoteModal from "./OdontogramQuoteModal"

//TODO: aggiungere a Procedure un enum type per classificare le procedure e assegnare un colore.
//feature futura, class proceduretype per permettere all'utente di creare nuova categoria con colore

const PROCEDURE_COLORS = [
  {
    label: "Visita",
    color: "#64748b",
    keys: ["vis001", "visita", "controllo", "routine"],
  },
  {
    label: "Igiene",
    color: "var(--bs-success)",
    keys: ["det001", "detartrasi", "igiene", "scaling", "pulizia", "tartaro"],
  },
  {
    label: "Otturazione",
    color: "var(--bs-primary)",
    keys: [
      "otu001",
      "otu002",
      "otturazione",
      "filling",
      "composita",
      "restauro",
    ],
  },
  {
    label: "Endodonzia",
    color: "var(--bs-warning)",
    keys: ["end001", "end002", "endodonzia", "devitalizzazione", "root canal"],
  },
  {
    label: "Corona/Protesi",
    color: "#8b5cf6",
    keys: ["cor001", "pr0001", "corona", "protesi", "ceramica", "porcellana"],
  },
  {
    label: "Impianto",
    color: "#3b82f6",
    keys: ["imp001", "impianto", "implant", "fixture", "osteointegrato"],
  },
  {
    label: "Estrazione",
    color: "var(--bs-danger)",
    keys: ["est001", "est002", "estrazione", "extraction", "osteotomia"],
  },
  {
    label: "Sbiancamento",
    color: "#f0abfc",
    keys: ["bia001", "sbiancamento", "whitening", "led"],
  },
  {
    label: "Chirurgia",
    color: "#f97316",
    keys: ["aen001", "gengivectomia", "gengiva", "chirurgia"],
  },
  {
    label: "Radiologia",
    color: "#94a3b8",
    keys: [
      "rxp001",
      "rxe001",
      "radiografia",
      "ortopantomografia",
      "panoramica",
      "endorale",
      "rx",
    ],
  },
]

const getProcedureColor = function (name, code, description) {
  const fields = [name, code, description]
    .filter(Boolean)
    .map(function (f) {
      return f.toLowerCase()
    })
    .join(" ")

  if (!fields) return null

  const match = PROCEDURE_COLORS.find(function (p) {
    return p.keys.some(function (k) {
      return fields.includes(k)
    })
  })
  return match ? match.color : "var(--bs-primary)"
}

const EmptyPanel = function () {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center h-100 text-muted"
      style={{ minHeight: 200 }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-2 opacity-50"
      >
        <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      <p className="small mb-0">Seleziona un dente</p>
    </div>
  )
}

const ToothPanel = function ({
  selectedTooth,
  toothTreatments,
  showProcPicker,
  procedures,
  loadingProc,
  onAddTreatment,
  onSelectProcedure,
  onAddToQuote,
  selectedProcedure,
  pendingProcedure,
  onConfirmQuote,
  onConfirmTreatment,
}) {
  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#f1f5f9",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--bs-primary)",
            flexShrink: 0,
          }}
        >
          {selectedTooth}
        </span>
        <span className="fw-semibold" style={{ fontSize: 15 }}>
          Dente {selectedTooth}
        </span>
      </div>

      {toothTreatments.length === 0 ? (
        <p className="text-muted small mb-3">Nessun trattamento registrato.</p>
      ) : (
        <ListGroup variant="flush" className="mb-3">
          {toothTreatments.map(function (t, i) {
            return (
              <ListGroup.Item key={i} className="px-0 py-2">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      flexShrink: 0,
                      backgroundColor:
                        getProcedureColor(
                          t.procedureName,
                          t.procedureCode,
                          t.procedureDescription,
                        ) ?? "#94a3b8",
                    }}
                  />
                  <strong style={{ fontSize: 13 }}>{t.procedureName}</strong>
                  {t.procedureCode && (
                    <Badge bg="secondary" style={{ fontSize: 10 }}>
                      {t.procedureCode}
                    </Badge>
                  )}
                </div>
                <div className="text-muted ms-3" style={{ fontSize: 12 }}>
                  {t.date} · €{t.cost}
                  {t.surface && " · " + t.surface}
                  {t.notes && <div className="fst-italic mt-1">{t.notes}</div>}
                </div>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      )}

      {showProcPicker ? (
        <>
          <hr className="my-2" />
          <p className="fw-semibold small text-secondary mb-2">
            Seleziona prestazione:
          </p>
          {loadingProc ? (
            <div className="d-flex justify-content-center py-2">
              <Spinner
                animation="border"
                size="sm"
                style={{ color: "var(--bs-primary)" }}
              />
            </div>
          ) : (
            <ListGroup style={{ maxHeight: 240, overflowY: "auto" }}>
              {procedures.map(function (p) {
                return (
                  <ListGroup.Item
                    key={p.id}
                    action
                    onClick={function () {
                      onSelectProcedure(p)
                    }}
                    style={{ cursor: "pointer", fontSize: 13 }}
                  >
                    <Badge bg="secondary" className="me-2">
                      {p.code}
                    </Badge>
                    {p.name}
                    {p.price != null && (
                      <span className="text-muted ms-2 small">€{p.price}</span>
                    )}
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          )}
        </>
      ) : (
        <>
          {pendingProcedure ? (
            <>
              <hr className="my-2" />
              <p className="small text-secondary mb-2">
                <strong>{pendingProcedure.name}</strong> — cosa vuoi fare?
              </p>
              <Button
                size="sm"
                className="border-0 fw-semibold w-100 btn-clinic"
                onClick={onConfirmTreatment}
              >
                ✓ Registra trattamento
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                className="fw-semibold w-100 mt-2 btn-clinic"
                style={{
                  border: "1px solid var(--bs-primary)",
                }}
                onClick={onConfirmQuote}
              >
                + Aggiungi al preventivo
              </Button>
            </>
          ) : (
            /* bottone iniziale per aprire il picker */
            <Button
              size="sm"
              className="border-0 fw-semibold w-100 btn-clinic"
              onClick={onAddTreatment}
            >
              + Seleziona prestazione
            </Button>
          )}
        </>
      )}
    </div>
  )
}

const Odontogram = function ({ patientId, onQuoteSaved }) {
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTooth, setSelectedTooth] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [procedures, setProcedures] = useState([])
  const [showProcPicker, setShowProcPicker] = useState(false)
  const [loadingProc, setLoadingProc] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState(null)
  const [showTreatmentForm, setShowTreatmentForm] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [quoteCart, setQuoteCart] = useState([])
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [pendingProcedure, setPendingProcedure] = useState(null)

  useEffect(function () {
    const handleResize = function () {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return function () {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const loadTreatments = useCallback(
    function () {
      if (!patientId) return
      setLoading(true)
      api
        .get("/api/treatments/patient/" + patientId + "?page=0&size=100")
        .then(function (data) {
          setTreatments(data.content ?? [])
          setLoading(false)
        })
        .catch(function () {
          setTreatments([])
          setLoading(false)
        })
    },
    [patientId],
  )

  useEffect(
    function () {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadTreatments()
    },
    [loadTreatments],
  )

  const toothMap = useMemo(
    function () {
      const map = {}
      treatments.forEach(function (t) {
        t.treatedToothList?.forEach(function (tt) {
          const key = String(tt.toothCode)
          if (!map[key]) map[key] = []
          map[key].push({
            procedureName: t.procedure?.name ?? "",
            procedureCode: t.procedure?.code ?? "",
            procedureDescription: t.procedure?.description ?? "",
            date: t.date,
            cost: t.cost,
            notes: t.notes,
            surface: tt.surface,
          })
        })
      })
      return map
    },
    [treatments],
  )

  const defaultSelected = useMemo(
    function () {
      return Object.keys(toothMap).map(function (code) {
        return "teeth-" + code
      })
    },
    [toothMap],
  )

  const teethConditions = useMemo(
    function () {
      const groups = {}
      Object.entries(toothMap).forEach(function (entry) {
        const code = entry[0]
        const treats = entry[1]
        const color =
          getProcedureColor(
            treats[0]?.procedureName,
            treats[0]?.procedureCode,
            treats[0]?.procedureDescription,
          ) ?? "var(--bs-primary)"
        if (!groups[color]) {
          groups[color] = {
            label: treats[0]?.procedureName ?? "Trattamento",
            teeth: [],
            fillColor: color,
            outlineColor: color,
          }
        }
        groups[color].teeth.push("teeth-" + code)
      })
      return Object.values(groups)
    },
    [toothMap],
  )

  const handleChange = useCallback(function (selectedTeeth) {
    if (!selectedTeeth || selectedTeeth.length === 0) return
    const tooth = selectedTeeth[0]
    const fdiCode = tooth.notations?.fdi ?? tooth.id.replace("teeth-", "")
    setSelectedTooth(fdiCode)
    setShowProcPicker(false)
    setSelectedProcedure(null)
    if (window.innerWidth < 768) {
      setShowDrawer(true)
    }
  }, [])

  const handleOpenProcPicker = function () {
    if (procedures.length === 0) {
      setLoadingProc(true)
      api
        .get("/api/procedures?page=0&size=100")
        .then(function (data) {
          setProcedures(data.content ?? [])
          setLoadingProc(false)
        })
        .catch(function () {
          setProcedures([])
          setLoadingProc(false)
        })
    }
    setShowProcPicker(true)
  }

  const handleSelectProcedure = function (proc) {
    setSelectedProcedure(proc)
    setPendingProcedure(proc)
    setShowProcPicker(false)
  }

  const handleTreatmentSaved = function () {
    setShowTreatmentForm(false)
    setSelectedProcedure(null)
    loadTreatments()
  }

  const handleAddToQuote = function (proc) {
    setQuoteCart(function (prev) {
      //evito duplicati stessa procedura e stesso dente
      const exists = prev.some(function (item) {
        return (
          item.toothNumber === selectedTooth && item.procedure.id === proc.id
        )
      })
      if (exists) return prev
      return [...prev, { toothNumber: selectedTooth, procedure: proc }]
    })
    setShowProcPicker(false)
  }

  const handleConfirmTreatment = function () {
    setPendingProcedure(null)
    setShowTreatmentForm(true)
    setShowDrawer(false)
  }

  const handleConfirmQuote = function () {
    if (!pendingProcedure) return
    setQuoteCart(function (prev) {
      const exists = prev.some(function (item) {
        return (
          item.toothNumber === selectedTooth &&
          item.procedure.id === pendingProcedure.id
        )
      })
      if (exists) return prev
      return [
        ...prev,
        { toothNumber: selectedTooth, procedure: pendingProcedure },
      ]
    })
    setPendingProcedure(null)
  }

  const tooltipContent = useCallback(function (payload) {
    if (!payload) return null
    return (
      <div style={{ minWidth: 120, fontSize: 13 }}>
        <strong>Dente {payload.notations?.fdi}</strong>
        <div className="text-muted" style={{ fontSize: 11 }}>
          {payload.type}
        </div>
      </div>
    )
  }, [])

  const toothTreatments = toothMap[String(selectedTooth)] ?? []

  const panelContent = selectedTooth ? (
    <ToothPanel
      selectedTooth={selectedTooth}
      toothTreatments={toothTreatments}
      showProcPicker={showProcPicker}
      procedures={procedures}
      loadingProc={loadingProc}
      onAddTreatment={handleOpenProcPicker}
      onSelectProcedure={handleSelectProcedure}
      selectedProcedure={selectedProcedure}
      onAddToQuote={handleAddToQuote}
      pendingProcedure={pendingProcedure}
      onConfirmTreatment={handleConfirmTreatment}
      onConfirmQuote={handleConfirmQuote}
    />
  ) : (
    <EmptyPanel />
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" style={{ color: "var(--bs-primary)" }} />
      </div>
    )
  }

  return (
    <>
      <style>{`
        .odontogram-shell {
          margin: 0 auto;
          width: 100%;
        }

        .odontogram-shell .Odontogram g:focus,
        .odontogram-shell .Odontogram g:focus-visible {
          outline: none;
        }

        .tooth-panel {
          border-left: 1px solid #e2e8f0;
          padding-left: 1.25rem;
          min-height: 200px;
        }

        @media (max-width: 767px) {
          .tooth-panel { display: none; }
        }
      `}</style>

      <div className="row align-items-start g-3">
        {/* Odontogramma */}
        <div className="col-12 col-md-8">
          <div className="odontogram-shell">
            <TeethChart
              singleSelect
              layout="square"
              notation="FDI"
              defaultSelected={defaultSelected}
              teethConditions={teethConditions}
              onChange={handleChange}
              showLabels={false}
              tooltip={{
                placement: "top",
                margin: 10,
                content: tooltipContent,
              }}
              styles={{ width: "100%" }}
            />
          </div>

          {/* Legenda */}
          <div className="d-flex flex-wrap gap-3 justify-content-center mt-2">
            {PROCEDURE_COLORS.map(function (p) {
              return (
                <div
                  key={p.label}
                  className="d-flex align-items-center gap-1"
                  style={{ fontSize: 11 }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: p.color,
                      flexShrink: 0,
                    }}
                  />
                  <span className="text-secondary">{p.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pannello laterale — solo desktop */}
        <div className="col-md-4 d-none d-md-block">
          <div className="tooth-panel">{panelContent}</div>
        </div>
      </div>

      {/* Drawer mobile */}
      <Offcanvas
        show={showDrawer}
        onHide={function () {
          setShowDrawer(false)
          setShowProcPicker(false)
        }}
        placement="bottom"
        style={{
          height: "auto",
          maxHeight: "70vh",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Offcanvas.Header
          closeButton
          style={{ borderBottom: "1px solid #e2e8f0" }}
        >
          <Offcanvas.Title style={{ fontSize: 16, fontWeight: 700 }}>
            Dente {selectedTooth}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ overflowY: "auto" }}>
          {panelContent}
        </Offcanvas.Body>
      </Offcanvas>

      <TreatmentForm
        show={showTreatmentForm}
        patientId={patientId}
        procedureId={selectedProcedure?.id}
        procedureName={selectedProcedure?.name}
        toothNumber={selectedTooth ? Number(selectedTooth) : null}
        quotedPrice={selectedProcedure?.price}
        onClose={function () {
          setShowTreatmentForm(false)
          if (isMobile) {
            setShowDrawer(true)
          }
        }}
        onSaved={handleTreatmentSaved}
      />

      <OdontogramQuoteModal
        show={showQuoteModal}
        patientId={patientId}
        cartItems={quoteCart}
        onClose={function () {
          setShowQuoteModal(false)
        }}
        onSaved={function () {
          setShowQuoteModal(false)
          setQuoteCart([])
          //onquotesaved non è required
          if (onQuoteSaved) onQuoteSaved()
        }}
      />
      {quoteCart.length > 0 && (
        <div
          className="my-4 p-3 rounded"
          style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac" }}
        >
          {/* Header con contatore e bottoni */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              <strong>{quoteCart.length}</strong> voci nel preventivo
            </span>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="outline-danger"
                onClick={function () {
                  setQuoteCart([])
                }}
              >
                Svuota
              </Button>
              <Button
                size="sm"
                className="border-0 fw-semibold btn-clinic"
                onClick={function () {
                  setShowQuoteModal(true)
                }}
              >
                Crea preventivo →
              </Button>
            </div>
          </div>

          {/* Lista voci */}
          <ul className="list-unstyled mb-0">
            {quoteCart.map(function (item, i) {
              return (
                <li
                  key={i}
                  className="d-flex align-items-center justify-content-between py-1"
                  style={{
                    fontSize: 12,
                    borderBottom:
                      i < quoteCart.length - 1 ? "1px solid #bbf7d0" : "none",
                  }}
                >
                  <span>
                    <strong className="me-1">Dente {item.toothNumber}</strong>
                    <span className="text-muted">— {item.procedure.name}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 text-danger"
                    style={{ fontSize: 12 }}
                    onClick={function () {
                      setQuoteCart(function (prev) {
                        return prev.filter(function (_, idx) {
                          return idx !== i
                        })
                      })
                    }}
                  >
                    ✕
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}

export default Odontogram
