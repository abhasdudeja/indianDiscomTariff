import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStatesData } from '../contexts/StatesDataContext'
import { formatTariffPerUnit, formatDemandCharge, formatSurcharge, formatSubsidy, formatTariff } from '../utils/formatters'
import './UtilitiesList.css'

const UtilitiesList = () => {
    const { stateId } = useParams()
    const navigate = useNavigate()
    const { getStateById, isLoading } = useStatesData()
    const state = stateId ? getStateById(stateId) : null

    if (isLoading) {
        return (
            <div className="utilities-list-container">
                <div className="loading-container">
                    <h2>Loading...</h2>
                    <p>Please wait while we load the data.</p>
                </div>
            </div>
        )
    }

    if (!state) {
        // When we have a valid route param but no data in our CSV,
        // still show a clear message and a prominent Back to Map button.
        const prettyName = stateId
            ? stateId
                .replace(/[-_]+/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, (ch) => ch.toUpperCase())
            : 'this state'

        return (
            <div className="utilities-list-container">
                <div className="utilities-header">
                    <button onClick={() => navigate('/')} className="back-button">
                        ← Back to Map
                    </button>
                    <h1>No EV Charging Data - {prettyName}</h1>
                </div>
                <div className="no-utilities">
                    <p>No EV charging tariff information is available yet for {prettyName}.</p>
                </div>
            </div>
        )
    }

    if (!state.utilities || state.utilities.length === 0) {
        return (
            <div className="utilities-list-container">
                <div className="utilities-header">
                    <button onClick={() => navigate('/')} className="back-button">
                        ← Back to Map
                    </button>
                    <h1>EV Charging Utilities - {state.name}</h1>
                </div>
                <div className="no-utilities">
                    <p>No EV charging tariff information available for {state.name}.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="utilities-list-container">
            <div className="utilities-header">
                <button onClick={() => navigate('/')} className="back-button">
                    ← Back to Map
                </button>
                <h1>EV Charging Utilities - {state.name}</h1>
                <p className="utilities-count">{state.utilities.length} Utility Provider{state.utilities.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="utilities-grid">
                {state.utilities.map((utility) => {
                    const latestTariff = utility.yearlyTariffs?.[0]
                    return (
                        <div key={utility.id} className="utility-card" onClick={() => navigate(`/utility/${stateId}/${utility.id}`)}>
                            <div className="utility-card-header">
                                <h2>{utility.name}</h2>
                                <span className="utility-type">{utility.type}</span>
                            </div>
                            {utility.description && (
                                <p className="utility-description">{utility.description}</p>
                            )}
                            {latestTariff && (
                                <div className="utility-tariff-preview">
                                    <h3>EV Charging Tariff {latestTariff.year}</h3>
                                    {latestTariff.tariffCategory && (
                                        <span className="utility-card-category">{latestTariff.tariffCategory}</span>
                                    )}
                                    <div className="tariff-list">
                                        {latestTariff.tariffPerUnit && (
                                            <div className="tariff-item">
                                                <span className="tariff-label">Base:</span>
                                                <span className="tariff-value">{formatTariffPerUnit(latestTariff.tariffPerUnit)}</span>
                                            </div>
                                        )}
                                        {latestTariff.peakSurcharge && (
                                            <div className="tariff-item tariff-tod">
                                                <span className="tariff-label">Peak:</span>
                                                <span className="tariff-value tod-surcharge">{formatSurcharge(latestTariff.peakSurcharge)}</span>
                                            </div>
                                        )}
                                        {latestTariff.offPeakSubsidy && (
                                            <div className="tariff-item tariff-tod">
                                                <span className="tariff-label">Off-peak:</span>
                                                <span className="tariff-value tod-subsidy">{formatSubsidy(latestTariff.offPeakSubsidy)}</span>
                                            </div>
                                        )}
                                        {latestTariff.demandCharge && (
                                            <div className="tariff-item">
                                                <span className="tariff-label">Demand:</span>
                                                <span className="tariff-value">{formatDemandCharge(latestTariff.demandCharge)}</span>
                                            </div>
                                        )}
                                        {latestTariff.fixedCharge && (
                                            <div className="tariff-item">
                                                <span className="tariff-label">Fixed:</span>
                                                <span className="tariff-value">{formatTariff(latestTariff.fixedCharge)}</span>
                                            </div>
                                        )}
                                    </div>
                                    {utility.yearlyTariffs && utility.yearlyTariffs.length > 1 && (
                                        <p className="tariff-years-note">{utility.yearlyTariffs.length} years of tariff data available</p>
                                    )}
                                </div>
                            )}
                            <div className="utility-card-footer">
                                <span className="view-details">Click to view details →</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default UtilitiesList
