import { Routes, Route } from 'react-router-dom'
import { StatesDataProvider } from './contexts/StatesDataContext'
import IndiaMap from './components/IndiaMap'
import DocumentView from './components/DocumentView'
import UtilitiesList from './components/UtilitiesList'
import UtilityDetail from './components/UtilityDetail'
import './App.css'

function App() {
  return (
    <div className="App">
      <StatesDataProvider>
        <Routes>
          <Route path="/" element={<IndiaMap />} />
          <Route path="/document/:stateId" element={<DocumentView />} />
          <Route path="/utilities/:stateId" element={<UtilitiesList />} />
          <Route path="/utility/:stateId/:utilityId" element={<UtilityDetail />} />
        </Routes>
      </StatesDataProvider>
    </div>
  )
}

export default App
