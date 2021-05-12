import axios from 'axios'
import { isFutureSymbol } from './util'
import FutureCurrentArbitrageMonitor from './FutureCurrentArbitrageMonitor';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

enum TickerType {
  CURRENT = 'CURRENT',
  FUTURE = 'FUTURE',
}

export interface Ticker {
  symbol: string
  ps: string
  price: string
  time: number
}


interface BinanceCurrentAggTradePayload {
  e: string // 事件类型，例："aggTrade",
  E: number // 事件时间，例：123456789,
  s: string // 交易对，例："BNBBTC",
  a: number // 归集交易ID，例：12345,
  p: string // 成交价格，例："0.001",
  q: string // 成交笔数，例："100",
  f: number // 被归集的首个交易ID，例：100,
  l: number // 被归集的末次交易ID，例：105,
  T: number // 成交时间，例：123456785,
  m: boolean // 买方是否是做市方。如true，则此次成交是一个主动卖出单，否则是一个主动买入单，例：true,
  M: boolean // 请忽略该字段，例：true
}

interface BinanceFutureAggTradePayload {
  e: string  // 事件类型，例："aggTrade"
  E: number  // 事件时间，例：1591261134288
  a: number  // 归集成交ID，例：424951
  s: string  // 交易对，例："BTCUSD_200626"
  p: string  // 成交价格，例："9643.5"
  q: string  // 成交量，例："2"
  f: number  // 被归集的首个交易ID，例：606073
  l: number  // 被归集的末次交易ID，例：606073
  T: number  // 成交时间，例：1591261134199
  m: boolean // 买方是否是做市方。如true,则此次成交是一个主动卖出单,否则是一个主动买入单，例： false
}

interface BinanceResultNullPayload {
  result: null,
  id: number
}

export interface PriceVariation {
  symbol: string
  price: number
  tradeTime: number
  eventTime: number
}

export default class FCManager {
  monitors: FutureCurrentArbitrageMonitor[] = []

  currentWsClient = new WebSocket('wss://stream.binance.com/ws')
  futureWsClient = new WebSocket('wss://dstream.binance.com/ws')

  currentPrice$: Subject<PriceVariation>
  futurePrice$: Subject<PriceVariation>

  readys = 0
  requestId = 0

  constructor () {
    this.currentPrice$ = this._initSubject(TickerType.CURRENT, this.currentWsClient);
    this.futurePrice$ = this._initSubject(TickerType.FUTURE, this.futureWsClient);
  }

  private _initSubject (type: TickerType, wsClient: WebSocket): Subject<PriceVariation> {
    const subject = new Subject<PriceVariation>()

    wsClient.addEventListener('open', () => {
      this.readys++
      if (this.readys === 2) { this.generateAllFCPairs() }
    })
    wsClient.addEventListener('error', (err) => subject.error(err))
    wsClient.addEventListener('close', () => subject.complete())
    if (type === TickerType.CURRENT) {
      wsClient.addEventListener('message', (msg) => {
        const parsed = JSON.parse(msg.data)
        if (parsed.result === null) { return; }

        const payload: BinanceCurrentAggTradePayload = parsed;

        const priceVariation: PriceVariation = {
          symbol: payload.s.toLowerCase(),
          price: parseFloat(payload.p),
          tradeTime: payload.T,
          eventTime: payload.E,
        }

        // console.debug(`[${type}] socket: message, priceVariation:`, priceVariation)
        subject.next(priceVariation)
      })

    }
    else if (type === TickerType.FUTURE) {
      wsClient.addEventListener('message', (msg) => {
        const parsed = JSON.parse(msg.data)
        if (parsed.result === null) { return; }

        const payload: BinanceFutureAggTradePayload = parsed;

        const priceVariation: PriceVariation = {
          symbol: payload.s.toLowerCase(),
          price: parseFloat(payload.p),
          tradeTime: payload.T,
          eventTime: payload.E,
        }

        // console.debug(`[${type}] socket: message, priceVariation:`, priceVariation)
        subject.next(priceVariation)
      })
    }

    return subject;
  }

  private async _fetchAllSupportedSymbols (): Promise<Ticker[]> {
    const res = await axios.get('https://dapi.binance.com/dapi/v1/ticker/price')
    return res.data.filter((item: Ticker) => isFutureSymbol(item.symbol));
  }

  private _subscribeTicker (type: TickerType, symbols: string[]) {
    const wsClient = type === TickerType.FUTURE ? this.futureWsClient : this.currentWsClient;
    const id = this.requestId++;
    const payload = {
      method: 'SUBSCRIBE',
      params: symbols,
      id,
    };
    console.log('[subscribeTicker] type:', type, 'payload:', payload)
    wsClient.send(JSON.stringify(payload))
  }

  async generateAllFCPairs () {
    const futureTicker = await this._fetchAllSupportedSymbols()
    const symbols = futureTicker.map(ticker => ({
      currentSymbol: `${ticker.ps}T`.toLowerCase(),
      futureSymbol: ticker.symbol.toLowerCase()
    }))

    console.log(symbols)

    this._subscribeTicker(TickerType.CURRENT, symbols.map(sybl => sybl.currentSymbol + '@aggTrade'))
    this._subscribeTicker(TickerType.FUTURE, symbols.map(sybl => sybl.futureSymbol + '@aggTrade'))
  }

}
