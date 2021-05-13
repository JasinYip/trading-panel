import React, { useEffect, useReducer } from 'react'
import { Table } from 'antd';
import spreadsReducer, { ACTION_NAME, Spread } from '../modules/spreadsReducer';
import { reverse, sortBy } from 'lodash';
import FCManager from '../modules/FCManager';
import { ColumnsType } from 'antd/lib/table';

function useForceUpdate() {
  const [_, dispatch] = useReducer(x => x + 1, 0);
  return dispatch;
}

interface SpreadTableItem {
  symbol: string
  currentPrice: string
  futurePrice: string
  diffRate: string
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

  const tableColumns: ColumnsType<SpreadTableItem> = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      align: 'right',
      width: 1
    },
    {
      title: 'Current',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      align: 'right',
    },
    {
      title: 'Future',
      dataIndex: 'futurePrice',
      key: 'futurePrice',
      align: 'right',
    },
    {
      title: 'Diff Rate',
      dataIndex: 'diffRate',
      key: 'diffRate',
      align: 'right',
    },
  ]

  const groups = spreadsRank.reduce((rst, spread) => {
    const deliveryDateStr = spread.symbol.split('_')[1]
    if (!rst.get(deliveryDateStr)) { rst.set(deliveryDateStr, []) }

    rst.get(deliveryDateStr)!.push(spread)

    return rst
  }, new Map<string, Spread[]>())

  const tables = Array.from(groups.entries()).map(([deliveryDate, rank]) => {
    const tableDataSource: SpreadTableItem[] = rank.map(({ symbol, currentPrice, futurePrice, diffRate }) => ({
      symbol: symbol.toUpperCase(),
      currentPrice: currentPrice.toFixed(3),
      futurePrice: futurePrice.toFixed(3),
      diffRate: `${(diffRate * 100).toFixed(2)}%`,
    }))

    return <div>
      <h4 style={{textAlign: 'left'}}>{deliveryDate}</h4>
      <Table
        style={{ width: 600, marginBottom: 30 }}
        pagination={false}
        size="small"
        columns={tableColumns}
        dataSource={tableDataSource}
      />
    </div>
  })

  return <>{...tables}</>
}
