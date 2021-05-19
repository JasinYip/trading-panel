import React from 'react'
import './App.css'
import SpreadRank from './Components/SpreadRank'
import PricesSubscriber from './modules/PricesSubscriber'
import SpreadsProvider from './modules/SpreadsProvider'

const pricesSubscriber = new PricesSubscriber()
const spreadsProvider = new SpreadsProvider(pricesSubscriber)

function App() {

  return (
    <div className="App" style={{ padding: 10 }}>
      <SpreadRank spreadsProvider={spreadsProvider} />
    </div>
  )
}

export default App
