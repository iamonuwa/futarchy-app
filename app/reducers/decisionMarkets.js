import _ from 'lodash'
import { ONE } from '../constants/values'
import decisionStatuses from '../constants/decisionStatuses'

const decisionMarkets = (state = [], action) => {
  switch (action.type) {
    case 'NEW_DECISION_TX_PENDING':
      return [
        ...state,
        ...(
          _.find(state, { question: action.question }) ?
            [] : [{
              pending: true,
              decisionId: action.txHash,
              question: action.question
            }]
        )
      ]
    case 'START_DECISION_EVENT':
      const { returnValues, blocktime } = action
      return _.sortBy([
        ..._.filter(
          state,
          decision => !(decision.pending && decision.question == returnValues.metadata)
        ),
        {
          pending: false,
          decisionId: returnValues.decisionId,
          question: returnValues.metadata,
          lowerBound: returnValues.marketLowerBound,
          upperBound: returnValues.marketUpperBound,
          startDate: returnValues.startDate,
          decisionResolutionDate: returnValues.decisionResolutionDate,
          priceResolutionDate: returnValues.priceResolutionDate,

          // TODO: get the actual status based on time until the trading period is over.
          //       and the oracle's resolution date. We need to add the resolution period
          //       in addition to the trading period to the Futarchy.sol contract
          status: getStatus({
            blocktime,
            decisionResolutionDate: returnValues.decisionResolutionDate,
            priceResolutionDate: returnValues.priceResolutionDate
          })
        }
      ], decision => decision.startDate ? parseInt(decision.startDate) * -1 : 0)
    case 'DECISION_DATA_LOADED':
      const { decisionId, decisionData } = action
      return state.map(decision => {
          if  (decision.decisionId == decisionId) {
            decision.passed = decisionData.passed
            decision.resolved = decisionData.resolved
            decision.decisionResolutionDate = decisionData.decisionResolutionDate
          }
          return decision
      })
    case 'AVG_DECISION_MARKET_PRICES_LOADED':
      return state.map(decision => {
        if (decision.decisionId == action.decisionId) {
          decision.yesMarketPrice = calcPriceAsPercentage(action.yesMarketPrice),
          decision.noMarketPrice = calcPriceAsPercentage(action.noMarketPrice),
          decision.yesMarketPredictedPrice = calcPredictedPrice(
            decision.yesMarketPrice,
            decision.lowerBound,
            decision.upperBound
          )
          decision.noMarketPredictedPrice = calcPredictedPrice(
            decision.noMarketPrice,
            decision.lowerBound,
            decision.upperBound
          )
        }
        return decision
      })
    case 'MARGINAL_PRICES_LOADED':
      // TODO: refactor logic from AVG_DECISION_MARKET_PRICES_LOADED and write tests
      return state.map(decision => {
        if (decision.decisionId == action.decisionId) {
          decision.yesMarketMarginalPrice = calcPriceAsPercentage(action.yesMarginalPrice),
          decision.noMarketMarginalPrice = calcPriceAsPercentage(action.noMarginalPrice),
          decision.yesMarketMarginalPredictedPrice = calcPredictedPrice(
            decision.yesMarketMarginalPrice,
            decision.lowerBound,
            decision.upperBound
          )
          decision.noMarketMarginalPredictedPrice = calcPredictedPrice(
            decision.noMarketMarginalPrice,
            decision.lowerBound,
            decision.upperBound
          )
        }
        return decision
      })
    case 'YES_NO_MARKET_DATA_LOADED':
      return state.map(decision => {
        if (decision.decisionId == action.decisionId) {
          decision.yesMarketFee = action.yesMarketFee,
          decision.noMarketFee = action.noMarketFee,
          decision.yesMarketFunding = action.yesMarketFunding,
          decision.noMarketFunding = action.noMarketFunding,
          decision.yesShortOutcomeTokensSold = action.yesShortOutcomeTokensSold,
          decision.yesLongOutcomeTokensSold = action.yesLongOutcomeTokensSold,
          decision.noShortOutcomeTokensSold = action.noShortOutcomeTokensSold,
          decision.noLongOutcomeTokensSold = action.noLongOutcomeTokensSold
        }
        return decision
      })
    case 'PROP_VALUE_LOADED':
      if (action.prop == 'blocktime') {
        return state.map(decision => {
          decision.status = getStatus({
            blocktime: action.value,
            decisionResolutionDate: decision.decisionResolutionDate,
            priceResolutionDate: decision.priceResolutionDate
          })
          return decision
        })
      } else {
        return state
      }
    case 'NET_OUTCOME_TOKENS_SOLD_FOR_DECISION_LOADED':
      return state.map(decision => {
        if (decision.id == action.decisionId) {
          if ( action.marketIndex == 0 ) {
            decision.yesMarketShortOutcomeTokensSold = action.shortOutcomeTokensSold,
            decision.yesMarketLongOutcomeTokensSold = action.longOutcomeTokensSold
          } else if (action.marketIndex == 1) {
            decision.noMarketShortOutcomeTokensSold = action.shortOutcomeTokensSold,
            decision.yesMarketLongOutcomeTokensSold = action.longOutcomeTokensSold
          }
        }
      })
    default:
      return state
  }
}

function getStatus ({
  blocktime,
  decisionResolutionDate,
  priceResolutionDate
}) {
  if (!blocktime) {
    return null
  }
  const blocktimeInt = parseInt(blocktime)
  const decisionResolutionDateInt = parseInt(decisionResolutionDate)
  const priceResolutionDateInt = parseInt(priceResolutionDate)
  if (blocktimeInt < decisionResolutionDateInt)
  {
    return decisionStatuses.OPEN
  } else if (blocktimeInt >= decisionResolutionDateInt &&
             blocktimeInt < priceResolutionDateInt)
  {
    return decisionStatuses.RESOLVED
  } else if (blocktimeInt >= priceResolutionDate) {
    return decisionStatuses.CLOSED
  }
}

function calcPriceAsPercentage (price) {
  return parseInt(price) / ONE
}

function calcPredictedPrice (pricePercentage, lowerBound, upperBound) {
  const lowerBoundInt = parseInt(lowerBound)
  const upperBoundInt = parseInt(upperBound)
  return lowerBoundInt + ((upperBoundInt - lowerBoundInt) * pricePercentage)
}

export default decisionMarkets
