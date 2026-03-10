// JSDoc types for state and utility data

/**
 * @typedef {Object} TableData
 * @property {string} label
 * @property {string} value
 */

/** 
 * EV charging tariff for a specific year
 * @typedef {Object} YearlyTariff
 * @property {number} year
 * @property {string} tariffPerUnit - Base energy charge per kWh (e.g., "5.50")
 * @property {string} [demandCharge] - Demand charge (e.g., "150/kVA" or "120/kW")
 * @property {string} [peakSurcharge] - Peak-hours surcharge per kWh (added to base)
 * @property {string} [offPeakSubsidy] - Off-peak subsidy per kWh (subtracted from base)
 * @property {string} [peakHours] - When peak rates apply (e.g., "18:00–22:00" or "6 PM–10 PM")
 * @property {string} [offPeakHours] - When off-peak rates apply (e.g., "22:00–06:00" or "10 PM–6 AM")
 * @property {string} [fixedCharge] - Fixed monthly charge (e.g., "500/month" or "100/kW/month")
 * @property {string} [tariffCategory] - Tariff category (e.g., "EV Public Charging", "LT Industrial")
 * @property {string} [notes] - Notes: GST, validity, minimum charge, etc.
 * @property {string} [tariffOrderUrl] - URL to official tariff order document
 */

/**
 * @typedef {Object} UtilityProvider
 * @property {string} id
 * @property {string} name
 * @property {string} type - e.g., "DISCOM", "Transmission", etc.
 * @property {YearlyTariff[]} [yearlyTariffs] - EV charging tariffs by year (newest first)
 * @property {Object} [contact]
 * @property {string} [contact.phone]
 * @property {string} [contact.email]
 * @property {string} [contact.website]
 * @property {string} [description]
 * @property {TableData[]} [additionalInfo]
 */

/**
 * @typedef {Object} StateInfo
 * @property {string} id
 * @property {string} name
 * @property {UtilityProvider[]} [utilities]
 * @property {string} [capital]
 * @property {string} [population]
 * @property {string} [area]
 * @property {string} [language]
 * @property {string} [description]
 * @property {string} [documentPath]
 * @property {TableData[]} [tableData]
 */

export { };
