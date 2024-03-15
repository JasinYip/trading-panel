import React, { useEffect, useState } from 'react'
import './App.css'
import SpreadRank from './Components/SpreadRank'
import PricesSubscriber from './modules/PricesSubscriber'
import SpreadsProvider from './modules/SpreadsProvider'

const pricesSubscriber = new PricesSubscriber()
const spreadsProvider = new SpreadsProvider(pricesSubscriber)

const REFRESH_INTERVAL = 3600; // 1 hour
const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

function App() {
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)

  useEffect(() => {
    setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          window.location.reload(); // 刷新页面
        }
        return prevCountdown - 1;
      });
    }, 1000)
  }, [])

  return (<>
    <SpreadRank spreadsProvider={spreadsProvider} />
    <span >Auto refresh in {formatTime(Math.floor(countdown / 60))}:{formatTime(countdown % 60)}</span>
  </>)
}

export default App
