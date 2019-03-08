import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import decisionStatuses from '../constants/decisionStatuses'
import MarketCircles from '../components/MarketCircles'

const findDecisionById = (decisions, decisionId) => _.find(
  decisions,
  { decisionId }
)

const mapStateToProps = (state, ownProps) => {
  const decision = findDecisionById(state.decisionMarkets, ownProps.decisionId)
  return {
    yesDisplayPrice: decision.yesMarketAveragePricePredicted,
    noDisplayPrice: decision.noMarketAveragePricePredicted,
    yesPercentage: decision.yesMarketAveragePricePercentage,
    noPercentage: decision.noMarketAveragePricePercentage,
    marketWinner: decision.status !== decisionStatuses.OPEN && decision.winningMarket
  }
}

export default connect(
  mapStateToProps
)(MarketCircles)
