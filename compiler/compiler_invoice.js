'use strict'

var _ = require('lodash')

/**
 *
 * @param data the data object to be compiled
 * @param log the log to be used for any console output
 * @returns {*} error any error that might occur
 */
module.exports = function (data, log) {
  //check if the 'document.content' is an array
  var content = data.document.content
  if (content.constructor === Array) {
    //if it is, we need to calculate the subtotal and total values of the invoice

    var currentSub = 0
    var totalSum = 0
    var tax = 0

    //by looping through every index (the indexes are IN ORDER because we are working with an array)
    _.forEach(content, function (value) {
      //this is the part where additional Information is added per entry

      //if we have an entry
      if (value.type === 'entry') {
        //calculate the actual price of this entry and apply the discount
        value.body.amount = (value.body.quantity * value.body.pricePerUnit)

        //check if this entry is discounted
        if (value.body.hasOwnProperty('discount')) {

          //check if this discount is a fixed discount, or a percentage
          if (value.body.discount.type === 'fixed') {
            //simply subtract the fixed amount
            value.body.amount -= value.body.discount.amount
          } else {

            //calculate the end result by multiplying 'value.body.amount' by 100% - 'value.body.discount.amount'
            value.body.amount *= (1 - (value.body.discount.amount / 100))
          }
        }

        //check if this  object has a special tax base specified
        if (value.hasOwnProperty('tax')) {
          tax += (value.body.tax / 100) * value.body.amount
        } else {
          //if it has not, use the global tax base
          tax += (data.document.tax / 100) * value.body.amount
        }

        //lastly, we increment our subtotal
        currentSub += value.body.amount
      }
      //if we have a subtotal
      else if (value.type === 'subtotal') {
        //we set its value
        value.amount = currentSub
        //increment the total
        totalSum += currentSub
        //and reset the current subtotal counter for the next iteration
        currentSub = 0
      }
    })

    //calculate the total sum even if there are no subbtotals left
    if (currentSub !== 0) {
      totalSum += currentSub
      currentSub = 0
    }

    //load 'document.total' or create a default if the 'total' object is undefined
    var total = data.document.total || {auto: true}

    if (total.auto) {
      log.warn('JSON data did not contain a \'total\' field. This could lead to unexpected behaviour!')
    }

    //assign the netto, the tax and the gross values
    //by checking if there are total discounts
    //WARNING: 'Fixed' discounts are applied AFTER Tax calculations, iff they are calculated for the whole invoice
    if (total.hasOwnProperty('discount')) {
      if (total.discount.type === 'fixed') {
        if (total.discount.amount !== 0) {
          log.info('applying fixed discount at the invoice level!')
          log.debug('The discount applied will be AFTER tax calculations')
        }
        //see warning above
        total.nett = totalSum - total.discount.amount
        total.tax = tax
      } else {
        //apply the standard discount calculation
        var percentage = (1 - (total.discount.amount / 100.0))
        total.nett = totalSum * percentage
        total.tax = tax * percentage
      }
    } else {
      total.nett = totalSum
      total.tax = tax
    }
    total.gross = total.nett + total.tax
    data.document.total = total
  } else {
    //if the 'document.content' object is NOT an array, we cannot compile it
    return new Error('Invoice document did NOT have a content array')
  }

  //no error, just return null
  return null
}
