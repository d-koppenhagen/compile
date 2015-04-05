'use strict'

var fs = require('fs')

var compilers = {}

//special case function that 'handles' errors itself
exports.load = function(log) {
  fs.readdir('./compiler/', function(error, files) {
    if (error){
      log.fatal('Could not load ANY compilers!')
      log.error(error)
      return
    }
    for (var i = 0; i < files.length; i++) {
      if (files[i] !== 'compiler' && files[i].slice(0, 8) === 'compiler') {
        compilers[files[i].slice(9, -3)] = require('./' + files[i])
      }
    }
  })
}

exports.compile = function(data, error) {
  if (!data.hasOwnProperty('type')) {
    error(new Error('Datafile does not contain a \'type\' field!'))
    return
  }
  if (compilers[data.type]) {
    error(compilers[data.type](data))
  } else {
    error(new Error('No compiler found for data type \'' + data.type + '\''))
  }
}
