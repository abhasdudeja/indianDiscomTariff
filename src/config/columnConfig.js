/**
 * Configuration for CSV columns display
 * 
 * This file maps CSV column names to their display labels and determines
 * which columns appear in the tooltip and document view.
 * 
 * To add a new column:
 * 1. Add the column to your CSV file
 * 2. Add an entry here with: columnName: { label: 'Display Name', showInTooltip: true, showInDocument: true }
 * 
 * Special columns (id, name, description, document_path) are always included and don't need to be here.
 */

export const columnConfig = {
  // Standard columns with custom labels
  capital: {
    label: 'Capital',
    showInTooltip: true,
    showInDocument: true,
    order: 1
  },
  population: {
    label: 'Population',
    showInTooltip: true,
    showInDocument: true,
    order: 2
  },
  area: {
    label: 'Area',
    showInTooltip: true,
    showInDocument: true,
    order: 3
  },
  language: {
    label: 'Official Language',
    showInTooltip: true,
    showInDocument: true,
    order: 4
  },
  
  // Additional data columns
  gdp: {
    label: 'GDP',
    showInTooltip: true,
    showInDocument: true,
    order: 5
  },
  literacy_rate: {
    label: 'Literacy Rate',
    showInTooltip: true,
    showInDocument: true,
    order: 6
  },
  districts: {
    label: 'Districts',
    showInTooltip: true,
    showInDocument: true,
    order: 7
  },
  major_cities: {
    label: 'Major Cities',
    showInTooltip: true,
    showInDocument: true,
    order: 8
  },
  
  // Add more columns here as needed
  // Example:
  // tourism_rating: {
  //   label: 'Tourism Rating',
  //   showInTooltip: true,
  //   showInDocument: true,
  //   order: 9
  // }
}

/**
 * Columns that should be excluded from display (internal use only)
 */
export const excludedColumns = [
  'id',
  'name',
  'description',
  'document_path',
  'table_data' // Legacy support
]

/**
 * Get display label for a column
 * @param {string} columnName - The CSV column name
 * @returns {string} - Display label
 */
export const getColumnLabel = (columnName) => {
  if (columnConfig[columnName]) {
    return columnConfig[columnName].label
  }
  // Auto-generate label from column name (capitalize and replace underscores)
  return columnName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Check if a column should be shown in tooltip
 * @param {string} columnName - The CSV column name
 * @returns {boolean}
 */
export const shouldShowInTooltip = (columnName) => {
  if (excludedColumns.includes(columnName)) return false
  if (columnConfig[columnName]) {
    return columnConfig[columnName].showInTooltip !== false
  }
  // By default, show all columns in tooltip
  return true
}

/**
 * Check if a column should be shown in document view
 * @param {string} columnName - The CSV column name
 * @returns {boolean}
 */
export const shouldShowInDocument = (columnName) => {
  if (excludedColumns.includes(columnName)) return false
  if (columnConfig[columnName]) {
    return columnConfig[columnName].showInDocument !== false
  }
  // By default, show all columns in document view
  return true
}

/**
 * Get all displayable columns from a state object, sorted by order
 * @param {Object} state - State data object
 * @returns {Array} - Array of {key, label, value, order} objects
 */
export const getDisplayableColumns = (state, showInTooltip = true) => {
  if (!state) return []
  
  const columns = Object.keys(state)
    .filter(key => {
      // Filter out excluded columns
      if (excludedColumns.includes(key)) return false
      // Filter by tooltip/document preference
      if (showInTooltip) {
        return shouldShowInTooltip(key)
      } else {
        return shouldShowInDocument(key)
      }
    })
    .map(key => {
      const config = columnConfig[key] || {}
      return {
        key,
        label: getColumnLabel(key),
        value: state[key],
        order: config.order || 999 // Default order for unconfigured columns
      }
    })
    .filter(col => col.value !== '' && col.value !== null && col.value !== undefined) // Filter empty values
    .sort((a, b) => a.order - b.order) // Sort by order
  
  return columns
}
