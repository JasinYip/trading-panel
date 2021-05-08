import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'

const wsClient = new WebSocket('wss://stream.binance.com:9443/ws/adausdt@aggTrade')

wsClient.addEventListener('open', () => console.log('socket: open'))
wsClient.addEventListener('error', (err) => console.error('socket: error', err))
wsClient.addEventListener('message', (msg) => console.log('socket: message, msg:', msg))
wsClient.addEventListener('close', () => console.log('socket: close'))

function sendSubscribe () {
  wsClient.send(JSON.stringify({
    method: 'SUBSCRIBE',
    params: [
      'btcusdt@aggTrade',
      'btcusdt@depth',
    ],
    id: 1
  }))
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <button onClick={sendSubscribe}>send</button>
    </div>
  )
}

export default App
