import React from 'react'
import { connect } from 'react-redux'
import { newDecision, hidePanel } from '../actions'

import CreateDecisionMarketForm from '../components/CreateDecisionMarketForm'

const ZERO_BYTES_32 = '0x0000000000000000000000000000000000000000000000000000000000000000'

const mapDispatchToProps = dispatch => ({
  createDecision: async values => {
    dispatch(hidePanel())
    dispatch(newDecision(ZERO_BYTES_32, values.question))
  }
})

export default connect(
  null,
  mapDispatchToProps
)(CreateDecisionMarketForm)
