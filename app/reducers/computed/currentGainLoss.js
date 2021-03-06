import sumPerformanceCalc from './sumPerformanceCalc'

const currentGainLoss = (trader, performance, decisions) => {
  let winningMarkets = decisions.reduce(
    (obj, decision) => {
      obj[decision.decisionId] = decision.passed ? 'yes' : 'no';
      return obj
    },
    {}
  )
  return sumPerformanceCalc('GainLoss', trader, performance, winningMarkets)
}

export default currentGainLoss
