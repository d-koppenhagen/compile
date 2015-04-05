'use strict'

var fs = require('fs')

var compilers = {}

/**
 * Loads all compilers in the './compiler/' directory and adds them to the list of known compilers
 * NOTE: special case function that 'handles' errors itself
 * @param {Log} log the logger used to record events
 */
exports.load = function(log) {
  fs.readdir('./compiler/', function(error, files) {
    if (error){
      log.fatal('Could not load ANY compilers!')
      log.error(error)
      return
    }

    //loop through all files of this directory
    for (var i = 0; i < files.length; i++) {

      //do not import this file OR any file not starting with 'compiler_'
      if (files[i] !== 'compiler' && files[i].slice(0, 9) === 'compiler_') {

        /**
        /* import the currently selected file and register it for its specific type
        /* the type to register it under is defined by the name of the file without the 'compiler_' prefix and without the '.js' suffix
        /* this results in the regex: /compiler_(.*)\.js/
        */
        compilers[files[i].slice(9, -3)] = require('./' + files[i])
      }
    }
  })
}

/**
 * Computes additional information for the template
 * @param  {Object}
 * @return {Error} error Any Error that might occur
 */
exports.compile = function(data) {
  //check to see if the data object supports formatting by checking its type field
  if (!data.hasOwnProperty('type')) {
    return new Error('Datafile does not contain a \'type\' field!')
  }

  //check if we have a compiler registered for this type of document
  if (compilers[data.type]) {
    //if we have a compiler, call its method to compute the final data to be put into the template
    return compilers[data.type](data)
  } else {
    //if we don't have a compiler for this document, tell the layer above
    return new Error('No compiler found for data type \'' + data.type + '\'')
  }
}
