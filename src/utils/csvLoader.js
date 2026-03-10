import Papa from 'papaparse'

/**
 * Loads and parses state data from a CSV file with EV charging tariff information.
 * Supports multi-year tariffs: one row per utility per year.
 * @param {string} csvPath - Path to the CSV file (relative to public folder)
 * @returns {Promise<Array>} Promise that resolves to an array of StateInfo objects
 */
export async function loadStatesDataFromCSV(csvPath = '/states-data.csv') {
  try {
    const response = await fetch(csvPath)
    if (!response.ok) {
      throw new Error(`Failed to load CSV file: ${response.statusText}`)
    }

    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value?.trim() ?? '',
        complete: (results) => {
          try {
            // state_id -> state
            const stateMap = new Map()

            for (const row of results.data) {
              const stateId = row.state_id?.trim() || row.id?.trim()
              const stateName = row.state_name?.trim() || row.name?.trim()

              if (!stateId || !stateName) continue

              // Get or create state
              let state = stateMap.get(stateId)
              if (!state) {
                state = {
                  id: stateId,
                  name: stateName,
                  utilities: [],
                  // State metadata
                  capital: row.capital || undefined,
                  population: row.population || undefined,
                  area: row.area || undefined,
                  language: row.language || undefined,
                  description: row.description || undefined,
                  documentPath: row.document_path || undefined,
                  gdp: row.gdp || undefined,
                  literacy_rate: row.literacy_rate || undefined,
                  districts: row.districts || undefined,
                  major_cities: row.major_cities || undefined,
                }
                stateMap.set(stateId, state)
              } else {
                // Merge metadata if present (in case first row was utility-only but this one has metadata)
                // In our current CSV structure, metadata should be duplicated across rows or present in at least one.
                if (!state.capital && row.capital) state.capital = row.capital
                if (!state.population && row.population) state.population = row.population
                if (!state.area && row.area) state.area = row.area
                if (!state.language && row.language) state.language = row.language
                if (!state.description && row.description) state.description = row.description
                if (!state.documentPath && row.document_path) state.documentPath = row.document_path
              }

              // If this row has utility data
              // Support both detailed schema (with utility_id) and simple schemas like public/states-data.csv
              const rawUtilityId = row.utility_id?.trim() || row.utility_name?.trim()
              const rawUtilityName = row.utility_name?.trim()
              const hasUtilityData = !!rawUtilityId || !!rawUtilityName

              if (hasUtilityData) {
                const utilityId = rawUtilityId || rawUtilityName
                let utility = state.utilities.find((u) => u.id === utilityId)

                // Create utility if first time we see it
                if (!utility) {
                  const additionalInfo = []

                  // Generic additional info label/value pairs
                  if (row.additional_info_1_label?.trim() && row.additional_info_1_value?.trim()) {
                    additionalInfo.push({
                      label: row.additional_info_1_label.trim(),
                      value: row.additional_info_1_value.trim(),
                    })
                  }
                  if (row.additional_info_2_label?.trim() && row.additional_info_2_value?.trim()) {
                    additionalInfo.push({
                      label: row.additional_info_2_label.trim(),
                      value: row.additional_info_2_value.trim(),
                    })
                  }

                  // Map simple states-data.csv columns into structured fields
                  if (row.service_territory) {
                    additionalInfo.push({
                      label: 'Service Territory',
                      value: row.service_territory,
                    })
                  }
                  if (row.regulator_serc) {
                    additionalInfo.push({
                      label: 'Regulator (SERC)',
                      value: row.regulator_serc,
                    })
                  }

                  utility = {
                    id: utilityId,
                    name: rawUtilityName || utilityId, // Fallback name
                    // For simple CSV (states-data.csv), use discom_type as the utility "type" if utility_type is not present
                    type: row.utility_type?.trim() || row.discom_type?.trim() || 'DISCOM',
                    description: row.utility_description?.trim() || undefined,
                    additionalInfo: additionalInfo.length > 0 ? additionalInfo : undefined,
                    yearlyTariffs: [],
                  }

                  const hasContact = row.contact_phone || row.contact_email || row.contact_website
                  if (hasContact) {
                    utility.contact = {
                      phone: row.contact_phone?.trim() || undefined,
                      email: row.contact_email?.trim() || undefined,
                      website: row.contact_website?.trim() || undefined,
                    }
                  }

                  state.utilities.push(utility)
                }

                // Add yearly tariff if this row has year + tariff data
                const year = row.year?.trim() ? parseInt(row.year.trim(), 10) : NaN
                const tariffPerUnit = row.tariff_per_unit?.trim()
                const demandCharge = row.demand_charge?.trim()

                if (!isNaN(year) && (tariffPerUnit || demandCharge)) {
                  const yearlyTariff = {
                    year,
                    tariffPerUnit: tariffPerUnit || '',
                    demandCharge: demandCharge || undefined,
                    peakSurcharge: row.peak_surcharge?.trim() || undefined,
                    offPeakSubsidy: row.off_peak_subsidy?.trim() || undefined,
                    peakHours: row.peak_hours?.trim() || undefined,
                    offPeakHours: row.off_peak_hours?.trim() || undefined,
                    fixedCharge: row.fixed_charge?.trim() || undefined,
                    tariffCategory: row.tariff_category?.trim() || undefined,
                    notes: row.notes?.trim() || undefined,
                    tariffOrderUrl: row.tariff_order_url?.trim() || undefined,
                  }
                  utility.yearlyTariffs = utility.yearlyTariffs || []
                  utility.yearlyTariffs.push(yearlyTariff)
                }
              }
            }

            // Sort yearly tariffs descending (newest first)
            for (const state of stateMap.values()) {
              for (const utility of state.utilities || []) {
                if (utility.yearlyTariffs?.length) {
                  utility.yearlyTariffs.sort((a, b) => b.year - a.year)
                }
              }
            }

            const statesData = Array.from(stateMap.values())
            resolve(statesData)
          } catch (error) {
            reject(new Error(`Failed to parse CSV data: ${error}`))
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`))
        },
      })
    })
  } catch (error) {
    console.error('Error loading CSV file:', error)
    throw error
  }
}
