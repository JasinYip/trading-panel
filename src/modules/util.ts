// export function extractSymbol
import { isNumber } from 'lodash'

export function isFutureSymbol (symbol: string): boolean {
  const splited = symbol.split('_')
  if (splited.length !== 2) { return false }

  const deliveryDate = parseInt(splited[1])
  if (Number.isNaN(deliveryDate) || !isNumber(deliveryDate)) { return false }

  return true
}
