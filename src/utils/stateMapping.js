// Mapping between @react-map/india state codes and our state IDs
export const stateCodeToId = {
  'AP': 'andhra-pradesh',
  'AR': 'arunachal-pradesh',
  'AS': 'assam',
  'BR': 'bihar',
  'CT': 'chhattisgarh',
  'GA': 'goa',
  'GJ': 'gujarat',
  'HR': 'haryana',
  'HP': 'himachal-pradesh',
  'JH': 'jharkhand',
  'KA': 'karnataka',
  'KL': 'kerala',
  'MP': 'madhya-pradesh',
  'MH': 'maharashtra',
  'MN': 'manipur',
  'ML': 'meghalaya',
  'MZ': 'mizoram',
  'NL': 'nagaland',
  'OR': 'odisha',
  'PB': 'punjab',
  'RJ': 'rajasthan',
  'SK': 'sikkim',
  'TN': 'tamil-nadu',
  'TG': 'telangana',
  'TR': 'tripura',
  'UP': 'uttar-pradesh',
  'UT': 'uttarakhand',
  'WB': 'west-bengal',
  'DL': 'delhi',
  'JK': 'jammu-kashmir',
  'LA': 'ladakh',
  'PY': 'puducherry', // Union Territory
  'AN': 'andaman-nicobar', // Union Territory
  'CH': 'chandigarh', // Union Territory
  'DN': 'daman-diu', // Union Territory
  'LD': 'lakshadweep', // Union Territory
}

export const getIdFromStateCode = (stateCode) => {
  return stateCodeToId[stateCode]
}

export const getStateCodeFromId = (id) => {
  const entry = Object.entries(stateCodeToId).find(([_, value]) => value === id)
  return entry ? entry[0] : undefined
}

// Mapping from state names (as returned by the library) to our state IDs
export const stateNameToId = {
  'Andhra Pradesh': 'andhra-pradesh',
  'Arunachal Pradesh': 'arunachal-pradesh',
  'Assam': 'assam',
  'Bihar': 'bihar',
  'Chhattisgarh': 'chhattisgarh',
  'Goa': 'goa',
  'Gujarat': 'gujarat',
  'Haryana': 'haryana',
  'Himachal Pradesh': 'himachal-pradesh',
  'Jharkhand': 'jharkhand',
  'Karnataka': 'karnataka',
  'Kerala': 'kerala',
  'Madhya Pradesh': 'madhya-pradesh',
  'Maharashtra': 'maharashtra',
  'Manipur': 'manipur',
  'Meghalaya': 'meghalaya',
  'Mizoram': 'mizoram',
  'Nagaland': 'nagaland',
  'Odisha': 'odisha',
  'Punjab': 'punjab',
  'Rajasthan': 'rajasthan',
  'Sikkim': 'sikkim',
  'Tamil Nadu': 'tamil-nadu',
  'Telangana': 'telangana',
  'Tripura': 'tripura',
  'Uttar Pradesh': 'uttar-pradesh',
  'Uttarakhand': 'uttarakhand',
  'West Bengal': 'west-bengal',
  'Delhi': 'delhi',
  'Jammu and Kashmir': 'jammu-kashmir',
  'Jammu & Kashmir': 'jammu-kashmir',
  'Ladakh': 'ladakh',
  'Puducherry': 'puducherry',
  'Andaman and Nicobar Islands': 'andaman-nicobar',
  'Andaman & Nicobar Islands': 'andaman-nicobar',
  'Chandigarh': 'chandigarh',
  'Daman and Diu': 'daman-diu',
  'Daman & Diu': 'daman-diu',
  'Lakshadweep': 'lakshadweep',
}

// Clean state identifier by removing library-specific suffixes
const cleanStateIdentifier = (input) => {
  // Remove suffixes like "-_r_0_", "-_r_1_", etc. that the library adds
  return input.replace(/[-_]?_[a-z]_\d+_?$/i, '').trim()
}

// Get state ID from either state code or state name
export const getIdFromStateCodeOrName = (input) => {
  // Clean the input first to remove any library suffixes
  const cleanedInput = cleanStateIdentifier(input)
  
  // First try as state code (uppercase 2-letter code)
  const upperInput = cleanedInput.toUpperCase().trim()
  if (upperInput.length === 2 && stateCodeToId[upperInput]) {
    return stateCodeToId[upperInput]
  }
  
  // Then try as state name (exact match)
  if (stateNameToId[cleanedInput]) {
    return stateNameToId[cleanedInput]
  }
  
  // Try case-insensitive match for state name
  const normalizedInput = cleanedInput.trim()
  const nameEntry = Object.entries(stateNameToId).find(
    ([name]) => name.toLowerCase() === normalizedInput.toLowerCase()
  )
  if (nameEntry) {
    return nameEntry[1]
  }
  
  return undefined
}
