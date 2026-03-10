import { useParams, useNavigate } from 'react-router-dom'
import { useStatesData } from '../contexts/StatesDataContext'
import { formatTariffPerUnit, formatDemandCharge, formatSurcharge, formatSubsidy, formatTariff } from '../utils/formatters'
import './UtilityDetail.css'

const UtilityDetail = () => {
    const { stateId, utilityId } = useParams()
    const navigate = useNavigate()
    const { getStateById, isLoading } = useStatesData()
    const state = stateId ? getStateById(stateId) : null
    const utility = state?.utilities?.find(u => u.id === utilityId)

    if (isLoading) {
        return (
            <div className="utility-detail-container">
                <div className="loading-container">
                    <h2>Loading...</h2>
                    <p>Please wait while we load the data.</p>
                </div>
            </div>
        )
    }

    if (!state || !utility) {
        return (
            <div className="utility-detail-container">
                <div className="error-container">
                    <h2>Utility not found</h2>
                    <p>The utility provider you're looking for doesn't exist.</p>
                    <button onClick={() => navigate('/')} className="back-button">
                        Back to Map
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="utility-detail-container">
            <div className="utility-detail-header">
                <button onClick={() => navigate(`/utilities/${stateId}`)} className="back-button">
                    ← Back to Utilities
                </button>
                <div className="header-content">
                    <h1>{utility.name}</h1>
                    <div className="utility-meta">
                        <span className="utility-type-badge">{utility.type}</span>
                        <span className="state-name">{state.name}</span>
                    </div>
                </div>
            </div>

            <div className="utility-detail-content">
                {utility.description && (
                    <div className="info-section">
                        <h2>About</h2>
                        <p>{utility.description}</p>
                    </div>
                )}

                {utility.yearlyTariffs && utility.yearlyTariffs.length > 0 && (
                    <div className="info-section tariff-section">
                        <h2>EV Charging Tariff Information</h2>
                        {utility.yearlyTariffs[0]?.tariffCategory && (
                            <p className="tariff-category-badge">Category: {utility.yearlyTariffs[0].tariffCategory}</p>
                        )}
                        <p className="tariff-intro">Base energy charge, time-of-day rates (peak surcharge / off-peak subsidy), demand charge, and fixed charge where applicable.</p>
                        <div className="tariff-table-wrapper">
                            <table className="tariff-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Base (₹/kWh)</th>
                                        <th>Peak (+)</th>
                                        <th>Off-peak (−)</th>
                                        <th>Demand</th>
                                        <th>Fixed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {utility.yearlyTariffs.map((yt) => (
                                        <tr key={yt.year}>
                                            <td>{yt.year}</td>
                                            <td>{yt.tariffPerUnit ? formatTariffPerUnit(yt.tariffPerUnit) : '—'}</td>
                                            <td className="tod-cell tod-surcharge">{yt.peakSurcharge ? formatSurcharge(yt.peakSurcharge) : '—'}</td>
                                            <td className="tod-cell tod-subsidy">{yt.offPeakSubsidy ? formatSubsidy(yt.offPeakSubsidy) : '—'}</td>
                                            <td>{yt.demandCharge ? formatDemandCharge(yt.demandCharge) : '—'}</td>
                                            <td>{yt.fixedCharge ? formatTariff(yt.fixedCharge) : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {(utility.yearlyTariffs.some(yt => yt.peakHours || yt.offPeakHours)) && (
                            <div className="tariff-hours-box">
                                <h3 className="tariff-hours-title">Applicable time slots</h3>
                                {utility.yearlyTariffs
                                    .filter(yt => yt.peakHours || yt.offPeakHours)
                                    .map(yt => (
                                        <div key={yt.year} className="tariff-hours-row">
                                            <span className="tariff-hours-year">{yt.year}:</span>
                                            {yt.peakHours && <span>Peak {yt.peakHours}</span>}
                                            {yt.peakHours && yt.offPeakHours && <span className="tariff-hours-sep"> · </span>}
                                            {yt.offPeakHours && <span>Off-peak {yt.offPeakHours}</span>}
                                        </div>
                                    ))}
                            </div>
                        )}
                        <p className="tariff-tod-legend">Peak = surcharge added to base; Off-peak = subsidy subtracted from base.</p>
                        {utility.yearlyTariffs.some(yt => yt.notes) && (
                            <div className="tariff-notes-box">
                                <strong>Note:</strong>{' '}
                                {utility.yearlyTariffs
                                    .filter(yt => yt.notes)
                                    .map(yt => `${yt.year}: ${yt.notes}`)
                                    .join(' | ')}
                            </div>
                        )}
                        {utility.yearlyTariffs.some(yt => yt.tariffOrderUrl) && (
                            <div className="tariff-order-links">
                                {utility.yearlyTariffs
                                    .filter(yt => yt.tariffOrderUrl)
                                    .map(yt => (
                                        <a key={yt.year} href={yt.tariffOrderUrl} target="_blank" rel="noopener noreferrer" className="tariff-order-anchor">
                                            View official tariff order ({yt.year}) →
                                        </a>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {utility.contact && (
                    <div className="info-section contact-section">
                        <h2>Contact Information</h2>
                        <div className="contact-grid">
                            {utility.contact.phone && (
                                <div className="contact-item">
                                    <span className="contact-label">Phone:</span>
                                    <a href={`tel:${utility.contact.phone}`} className="contact-value">
                                        {utility.contact.phone}
                                    </a>
                                </div>
                            )}
                            {utility.contact.email && (
                                <div className="contact-item">
                                    <span className="contact-label">Email:</span>
                                    <a href={`mailto:${utility.contact.email}`} className="contact-value">
                                        {utility.contact.email}
                                    </a>
                                </div>
                            )}
                            {utility.contact.website && (
                                <div className="contact-item">
                                    <span className="contact-label">Website:</span>
                                    <a
                                        href={utility.contact.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-value"
                                    >
                                        {utility.contact.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {utility.additionalInfo && utility.additionalInfo.length > 0 && (
                    <div className="info-section additional-info-section">
                        <h2>Additional Information</h2>
                        <div className="info-table">
                            {utility.additionalInfo.map((info, index) => (
                                <div key={index} className="info-row">
                                    <span className="info-label">{info.label}:</span>
                                    <span className="info-value">{info.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UtilityDetail
