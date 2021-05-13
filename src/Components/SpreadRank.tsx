import React, { useEffect, useReducer } from 'react'
import { Table } from 'antd';
import spreadsReducer, { ACTION_NAME } from '../modules/spreadsReducer';
import { reverse, sortBy } from 'lodash';
import FCManager from '../modules/FCManager';

function useForceUpdate() {
  const [_, dispatch] = useReducer(x => x + 1, 0);
  return dispatch;
}


export default function SpreadRank () {
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

  const tableColumns = [
    {
      title: 'symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Current',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
    },
    {
      title: 'Future',
      dataIndex: 'futurePrice',
      key: 'futurePrice',
    },
    {
      title: 'Diff Rate',
      dataIndex: 'diffRate',
      key: 'diffRate',
    },
  ]

  const tableDataSource = spreadsRank.map(({ symbol, currentPrice, futurePrice, diffRate }) => ({
    symbol: symbol.toUpperCase(),
    currentPrice: currentPrice.toFixed(3),
    futurePrice: futurePrice.toFixed(3),
    diffRate: `${(diffRate * 100).toFixed(2)}%`,
  }))

  return (
    <Table
      style={{ width: 600 }}
      pagination={false}

      size="small"
      columns={tableColumns}
      dataSource={tableDataSource}
    />
  )
}
