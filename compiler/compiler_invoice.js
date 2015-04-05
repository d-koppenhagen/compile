'use strict'

var _ = require('lodash')

module.exports = function(data) {
  var content = data.document.content
  if (content.constructor === Array)
  {
    var currentSub = 0
    var totalSum = 0
    _.forEach(content, function(value) {
      if (value.type === 'entry'){
        currentSub += value.body.amount
      }
      else if (value.type === 'subtotal') {
        value.amount = currentSub
        totalSum += currentSub
        currentSub = 0
      }
    })

    //calculate the total sum even if there are no subbtotals
    if (currentSub !== 0)
    {
      totalSum += currentSub
      currentSub = 0
    }

    //TODO: implement 'total'
    var total = data.document.total || {shipping: 0.0, packing: 0.0}
    total.nett = totalSum
    total.tax = totalSum * 0.19
    total.gross = total.nett + total.tax + total.shipping + total.packing



  } else {
    return new Error('Invoice document did NOT have a content array')
  }
}
