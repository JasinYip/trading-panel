import React, { useEffect, useReducer } from 'react'
import './App.css'
import spreadsReducer, { ACTION_NAME } from './modules/spreadsReducer';
import { reverse, sortBy } from 'lodash';
import FCManager from './modules/FCManager';

function useForceUpdate() {
  const [_, dispatch] = useReducer(x => x + 1, 0);
  return dispatch;
}


function App() {
  const [spreads, dispatchSpreads] = useReducer(spreadsReducer, {});
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    setInterval(forceUpdate, 500)
    const fcManager = new FCManager
    fcManager.currentPrice$.subscribe({
      next(priceVariation) {
        dispatchSpreads({
          type: ACTION_NAME.UPDATE_CURRENT_PRICE,
          price: priceVariation.price,
          symbol: priceVariation.symbol,
        })
      }
    })
    fcManager.futurePrice$.subscribe({
      next (priceVariation) {
        dispatchSpreads({
          type: ACTION_NAME.UPDATE_FUTURE_PRICE,
          price: priceVariation.price,
          symbol: priceVariation.symbol,
        })
      }
    })
  }, [])

  const spreadsRank = reverse(sortBy(Object.values(spreads).filter(s => s.diffRate !== Infinity), 'diffRate'));

  return (
    <div className="App">
      {spreadsRank.map(spread => (
        <p key={spread.symbol}>{`${spread.symbol}\t${(spread.diffRate * 100).toFixed(2)}%`}</p>
      ))}
    </div>
  )
}

export default App
