import React, { useEffect, useReducer } from 'react'
import { Table } from 'antd';
import './SpreadRank.css'
import { ColumnsType } from 'antd/lib/table';
import { observer } from 'mobx-react';
import SpreadProvider from '../modules/SpreadsProvider';
import moment from 'moment';

/**
 * 计算距离交割日的天数
 *
 * @param {string} futureDate 交割日，如 '210925'
 * @returns {number} 天数
 */
 function getDayDiff (futureDate: string): number {
  const today = moment();
  const future = moment('20' + futureDate);
  return future.diff(today, 'days')
}

function useForceUpdate() {
  const [_, dispatch] = useReducer(x => x + 1, 0);
  return dispatch;
}

const highlightSymbols = [
  'ETH'
]

interface SpreadTableItem {
  symbol: string
  currentPrice: string
  futurePrice: string
  diffRate: string
}

const shouldBeHighlight = (symbol: string): boolean => !!highlightSymbols.find(highlightSymbol => symbol.startsWith(highlightSymbol));

export default observer(function SpreadRank ({ spreadsProvider }: { spreadsProvider: SpreadProvider }) {
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    setInterval(forceUpdate, 1000)
  }, [])

  if (spreadsProvider.spreadRank.length === 0) {
    return <div>loading...</div>
  }

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
      title: 'Spot Rate',
      dataIndex: 'diffRate',
      key: 'diffRate',
      align: 'right',
    },
    {
      title: '% P. A',
      dataIndex: 'diffRateAnnual',
      key: 'diffRateAnnual',
      align: 'right',
    },
  ]

  const tables = Array.from(spreadsProvider.groupedSpreadRank.entries()).map(([deliveryDate, rank]) => {
    const remainingDays = getDayDiff(deliveryDate)
    const tableDataSource: SpreadTableItem[] = rank.map(({ symbol, currentPrice, futurePrice, diffRate }) => ({
      symbol: symbol.toUpperCase(),
      currentPrice: currentPrice.toFixed(3),
      futurePrice: futurePrice.toFixed(3),
      diffRate: `${(diffRate * 100).toFixed(2)}%`,
      diffRateAnnual: `${(diffRate / (remainingDays / 365) * 100).toFixed(2)}%`,
    }))

    return <Table
      key={deliveryDate}
      style={{ width: 600, marginBottom: 30 }}
      pagination={false}
      size="small"
      title={() => `${deliveryDate} (~${remainingDays}d/${(remainingDays / 30).toFixed(2)}m)`}
      columns={tableColumns}
      dataSource={tableDataSource}
      rowKey="symbol"
      rowClassName={spread => shouldBeHighlight(spread.symbol) ? 'highlight' : ''}
    />
  })

  return <>{...tables}</>
})
