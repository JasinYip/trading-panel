import produce from 'immer'

export enum ACTION_NAME {
  UPDATE_CURRENT_PRICE = 'UPDATE_CURRENT_PRICE',
  UPDATE_FUTURE_PRICE = 'UPDATE_FUTURE_PRICE',
}

interface UpdateCurrentPriceAction {
  type: ACTION_NAME.UPDATE_CURRENT_PRICE
  symbol: string
  price: number
}
interface UpdateFuturePriceAction {
  type: ACTION_NAME.UPDATE_FUTURE_PRICE
  symbol: string
  price: number
}

type Action = UpdateCurrentPriceAction | UpdateFuturePriceAction


export class Spread {
  symbol: string // 期货 symbol，如 adausd_210924
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

export default function spreadRankReducer (spreads: { [symbol: string]: Spread }, action: Action) {
  switch (action.type) {
    case ACTION_NAME.UPDATE_FUTURE_PRICE: {
      const { symbol, price } = action;
      return produce(spreads, ds => {
        if (!ds[symbol]) { ds[symbol] = new Spread(symbol) }
        ds[symbol].futurePrice = price
      });
    }
    case ACTION_NAME.UPDATE_CURRENT_PRICE: {
      const getFutureSymbolPrefix = (symbol: string) => symbol.slice(0, -1)
      const futureSymbolPrefix = getFutureSymbolPrefix(action.symbol)
      const futureSymbols = Object.keys(spreads).filter(futureSymbol => futureSymbol.startsWith(futureSymbolPrefix))

      return produce(spreads, ds => {
        futureSymbols.forEach(sybl => {
          ds[sybl].currentPrice = action.price
        })
      })
    }
    default: return spreads;
  }
}
