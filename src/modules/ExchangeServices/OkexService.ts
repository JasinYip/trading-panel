import pako from 'pako'


export default class OkexService {
  wsClient = new WebSocket('wss://real.okex.com:8443/ws/v3')

  constructor () {
    this.wsClient.binaryType = 'arraybuffer'
    this.wsClient.addEventListener('error', err => console.error('okex ws err:', err))
    this.wsClient.addEventListener('message', msg => {
      console.log('okex msg:', JSON.parse(pako.inflateRaw(msg.data, { to: 'string' })))
    })
    this.wsClient.addEventListener('open', () => {
      this.wsClient.send(JSON.stringify({
        op: 'subscribe',
        args: ['futures/mark_price:ADA-USD-210625']
      }))
    })
  }

  subscribe () {
  }

  fetchAll
}
