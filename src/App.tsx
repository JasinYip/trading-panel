import React from 'react'
import './App.css'
import SpreadRank from './Components/SpreadRank'
import OkexService from './modules/ExchangeServices/OkexService'
import PricesSubscriber from './modules/PricesSubscriber'
import SpreadsProvider from './modules/SpreadsProvider'

const pricesSubscriber = new PricesSubscriber()
const spreadsProvider = new SpreadsProvider(pricesSubscriber)

const okex = new OkexService

function App() {

  return (
    <div className="App" style={{ padding: 10 }}>
      <SpreadRank spreadsProvider={spreadsProvider} />
    </div>
  )
}

export default App
