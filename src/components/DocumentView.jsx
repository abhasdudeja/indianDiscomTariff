import { useParams, useNavigate, Link } from 'react-router-dom'
import { getDisplayableColumns } from '../config/columnConfig.js'
import { useStatesData } from '../contexts/StatesDataContext'
import './DocumentView.css'

const DocumentView = () => {
  const { stateId } = useParams()
  const navigate = useNavigate()
  const { getStateById, isLoading, error } = useStatesData()
  const state = stateId ? getStateById(stateId) : null

  if (isLoading) {
    return (
      <div className="document-view">
        <div className="document-container">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading state data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="document-view">
        <div className="document-container">
          <div className="error-container">
            <h2>Error loading data</h2>
            <p>{error}</p>
            <Link to="/" className="back-button">Back to Map</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="document-view">
        <div className="document-container">
          <div className="error-container">
            <h2>State not found</h2>
            <p>The state you're looking for doesn't exist.</p>
            <Link to="/" className="back-button">Back to Map</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="document-view">
      <div className="document-container">
        <div className="document-header">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Map
          </button>
          <h1>{state.name}</h1>
        </div>

        <div className="document-content">
          <div className="state-info-card">
            <div className="info-section">
              <h2>State Information</h2>
              <div className="info-grid">
                {/* Dynamically render all columns from CSV */}
                {getDisplayableColumns(state, false).map((col) => (
                  <div key={col.key} className="info-item">
                    <span className="info-label">{col.label}:</span>
                    <span className="info-value">{col.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="description-section">
              <h2>About {state.name}</h2>
              <p>{state.description}</p>
            </div>

            <div className="document-section">
              <h2>Document</h2>
              <div className="document-link-container">
                <p>Click the button below to view the document for {state.name}:</p>
                <a
                  href={state.documentPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  View Document →
                </a>
                <p className="document-note">
                  <small>
                    Note: You can update the document path in the CSV file (public/states-data.csv)
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentView
