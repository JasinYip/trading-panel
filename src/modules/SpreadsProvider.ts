import produce from 'immer'
import { reverse, sortBy } from 'lodash'
import { observable } from 'mobx'
import { action, computed } from 'mobx'
import PriceSubscriber from './PricesSubscriber'

export enum ACTION_NAME {
  UPDATE_CURRENT_PRICE = 'UPDATE_CURRENT_PRICE',
  UPDATE_FUTURE_PRICE = 'UPDATE_FUTURE_PRICE',
}

export class Spread {
  symbol: string // 采用期货 symbol，如 adausd_210924
  _currentPrice: number = 0
  _futurePrice: number = 0
  diffRate: number = 0

  constructor (symbol: string) {
    this.symbol = symbol
  }

  get currentPrice (): number { return this._currentPrice }
  set currentPrice (newPrice: number) {
    this._currentPrice = newPrice
    this.diffRate = (this._futurePrice - this._currentPrice) / this._currentPrice
  }

  get futurePrice (): number { return this._futurePrice }
  set futurePrice (newPrice: number) {
    this._futurePrice = newPrice
    this.diffRate = (this._futurePrice - this._currentPrice) / this._currentPrice
  }
}

export default class SpreadProvider {
  @observable spreads: Map<string, Spread> = new Map
  @computed get spreadRank(): Spread[] {
    return reverse(sortBy(Array.from(this.spreads.values()).filter(s => s.diffRate !== Infinity), 'diffRate'))
  }
  @computed get groupedSpreadRank(): Map<string, Spread[]> {
    return this.spreadRank.reduce((rst, spread) => {
      const deliveryDateStr = spread.symbol.split('_')[1]
      if (!rst.get(deliveryDateStr)) { rst.set(deliveryDateStr, []) }

      rst.get(deliveryDateStr)!.push(spread)

      return rst
    }, new Map<string, Spread[]>())
  }

  constructor (priceSubscriber: PriceSubscriber) {
    const updateCurrentPrice = this.updateCurrentPrice.bind(this)
    priceSubscriber.currentPrice$.subscribe({
      next({ symbol, price }) {
        updateCurrentPrice(symbol, price)
      }
    })
    const updateFuturePrice = this.updateFuturePrice.bind(this)
    priceSubscriber.futurePrice$.subscribe({
      next({ symbol, price }) {
        updateFuturePrice(symbol, price)
      }
    })
  }

  @action updateCurrentPrice (symbol: string, price: number) {
    const getFutureSymbolPrefix = (symbol: string) => symbol.slice(0, -1)
    const futureSymbolPrefix = getFutureSymbolPrefix(symbol)
    const futureSymbols = Array.from(this.spreads.keys())
      .filter((futureSymbol) => futureSymbol.startsWith(futureSymbolPrefix))

    futureSymbols.forEach(sybl => {
      this.spreads.get(sybl)!.currentPrice = price
    })
  }

  @action updateFuturePrice (symbol: string, price: number) {
    if (!this.spreads.has(symbol)) { this.spreads.set(symbol, new Spread(symbol)) }
    this.spreads.get(symbol)!.futurePrice = price
  }
}
