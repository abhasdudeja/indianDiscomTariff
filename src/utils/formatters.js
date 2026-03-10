/**
 * Formats a tariff value for display by prepending the rupee symbol.
 * Strips any existing ₹ from the value so the symbol is always added by the app.
 * @param {string} value
 * @returns {string}
 */
export function formatTariff(value) {
    const cleaned = value.replace(/^₹\s*/u, '').trim()
    return cleaned ? `₹${cleaned}` : ''
}

/** 
 * Formats energy charge per unit for EV charging (₹X/kWh)
 * @param {string} value
 * @returns {string}
 */
export function formatTariffPerUnit(value) {
    const cleaned = value.replace(/^₹\s*/u, '').replace(/\/kWh$/i, '').trim()
    return cleaned ? `₹${cleaned}/kWh` : ''
}

/** 
 * Formats demand charge (₹X/kVA or ₹X/kW)
 * @param {string} value
 * @returns {string}
 */
export function formatDemandCharge(value) {
    return formatTariff(value)
}

/** 
 * Formats peak surcharge for display: +₹X/kWh
 * @param {string} value
 * @returns {string}
 */
export function formatSurcharge(value) {
    const cleaned = value.replace(/^[+₹\s]*/u, '').replace(/\/kWh$/i, '').trim()
    return cleaned ? `+₹${cleaned}/kWh` : ''
}

/** 
 * Formats off-peak subsidy for display: −₹X/kWh
 * @param {string} value
 * @returns {string}
 */
export function formatSubsidy(value) {
    const cleaned = value.replace(/^[-₹\s]*/u, '').replace(/\/kWh$/i, '').trim()
    return cleaned ? `−₹${cleaned}/kWh` : ''
}
