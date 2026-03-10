import { createContext, useContext, useState, useEffect } from 'react'
import { loadStatesDataFromCSV } from '../utils/csvLoader'

const StatesDataContext = createContext(undefined)

export function StatesDataProvider({ children }) {
    const [statesData, setStatesData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const data = await loadStatesDataFromCSV('/states-data.csv')
                setStatesData(data)
            } catch (err) {
                console.error('Failed to load states data from CSV:', err)
                setError(err instanceof Error ? err.message : 'Failed to load data')
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const getStateById = (id) => {
        return statesData.find(state => state.id === id)
    }

    return (
        <StatesDataContext.Provider value={{ statesData, isLoading, error, getStateById }}>
            {children}
        </StatesDataContext.Provider>
    )
}

export function useStatesData() {
    const context = useContext(StatesDataContext)
    if (context === undefined) {
        throw new Error('useStatesData must be used within a StatesDataProvider')
    }
    return context
}
