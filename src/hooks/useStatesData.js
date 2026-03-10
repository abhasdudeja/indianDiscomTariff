import { useState, useEffect } from 'react'
import { loadStatesFromCSV } from '../utils/csvLoader.js'

/**
 * Custom hook to load states data from CSV
 * @param {string} csvPath - Path to the CSV file (default: '/states-data.csv')
 * @returns {Object} - { statesData, isLoading, error }
 */
export const useStatesData = (csvPath = '/states-data.csv') => {
  const [statesData, setStatesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await loadStatesFromCSV(csvPath)
        setStatesData(data)
      } catch (err) {
        console.error('Failed to load states data from CSV:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [csvPath])

  return { statesData, isLoading, error }
}

/**
 * Helper function to get state by ID from the loaded data
 * @param {Array} statesData - Array of state objects
 * @param {string} id - State ID to find
 * @returns {Object|null} - State object or null if not found
 */
export const getStateById = (statesData, id) => {
  if (!statesData || !id) return null
  return statesData.find(state => state.id === id) || null
}
