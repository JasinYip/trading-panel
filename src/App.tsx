import React, { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import axios from 'axios';

// const wsClient = new WebSocket('wss://stream.binance.com:9443/ws')

// function sendSubscribe () {
//   wsClient.send(JSON.stringify({
//     method: 'SUBSCRIBE',
//     params: [
//       'adausd_next_quarter@agg'
//       // "!miniTicker@arr",
//       // "adausd_210924@aggSnap",
//       // "adausd_210924@markPrice",
//       // "adausd@indexPrice",
//       // "!markPriceMini@arr",
//       // "adausd_210924@depth@500ms",
//       // "!contractInfo"
//       // 'adausd_210924@aggTrade',
//       // 'btcusdt@aggTrade',
//       // 'btcusdt@depth',
//     ],
//     id: 1
//   }))
// }

function App() {
  const [currPrice, setCurrPrice] = useState(0)
  const [futurePrice, setFuturePrice] = useState(0)
  const [fuCuDiffPer, setFuCuDiffPer] = useState(0)
  const [high, setHigh] = useState(false)

  // useEffect(() => {
  //   wsClient.addEventListener('open', () => console.log('socket: open'))
  //   wsClient.addEventListener('error', (err) => console.error('socket: error', err))
  //   wsClient.addEventListener('close', () => console.log('socket: close'))
  //   wsClient.addEventListener('message', (msg) => {
  //     const data = JSON.parse(msg.data);
  //     console.log('socket: message, msg:', JSON.parse(msg.data), msg)
  //     setCount(data.find(d => d.s === 'ADAUSDT').c)
  //   })
  // }, [])

  useEffect(() => {
    setInterval(() => {
      Promise.all([
        axios.get('https://api.binance.com/api/v1/ticker/price?symbol=ADAUSDT'),
        axios.get('https://dapi.binance.com/dapi/v1/ticker/price?symbol=ADAUSD_210924')
      ]).then(ress => {
        const c = parseFloat(ress[0].data.price);
        const f = parseFloat(ress[1].data[0].price);
        const d = (f - c) / c * 100
        setCurrPrice(c)
        setFuturePrice(f)
        setFuCuDiffPer(d)
        if (d >= 9) { setHigh(true) } else { setHigh(false) }
      })
    }, 1000)
  }, [])

  return (
    <div className="App">
      <p>currPrice: {currPrice}</p>
      <p>futurePrice: {futurePrice}</p>
      <p style={{ color: high ? 'red' : 'black', fontSize: high ? '5em' : '1em' }}>fuCuDiffPer: {fuCuDiffPer.toFixed(2) + '%'}</p>
      {/* <button onClick={sendSubscribe}>send</button> */}
    </div>
  )
}

export default App
