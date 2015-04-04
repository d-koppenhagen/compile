'use strict'

var bunyan = require('bunyan')
var restify = require('restify')
var mustache = require('mustache')
var fs = require('fs')
var async = require('async')
var _ = require('lodash')

var log = new bunyan.createLogger({
  name: 'storycrm.compile',
  serializers: {
  req: bunyan.stdSerializers.req
  }
})

var server = restify.createServer({
  name: 'storycrm.compile',
  version: '0.1.0',
  log: log
})

server.use(restify.queryParser())

/**
 * Errors are always sent upstream and they should be caught and logged to our bunyan logger
 * @param  {object}
 */
function logErrorAndReturn (error) {
  if (error) {
    log.error(error)
  }
}

server.get('/document', function (request, response, next){

  var template
  var data

  /**
   * Reads the necessary files in parallel from drive and processes them if necessary
   */
  async.parallel({
    /**
     * Reads the LaTeX template and saves it as a String
     * @return {String}
     */
    template: function(callback){
      fs.readFile('exampletemplate.tex', 'utf8', function (error, file) {
        logErrorAndReturn(error)
        template = file
        callback(null, template)
      })
    },

    /**
     * Reads the file and converts the JSON to an object.
     * @return {Object}
     */
    data: function(callback){
      fs.readFile('exampledata.json', 'utf8', function (error, file) {
        logErrorAndReturn(error)
        /**
         * Converts the JSON string to an object for further processing. Lo-Dash and
         * Mustache require an object.
         * @type {String}
         */
        data = JSON.parse(file)

        /**
         * Mustache tempaltes are logicless, so you can not write if statements
         * but you can check wheater a variable is true. We store the content types
         * as "type": "whatever" but Mustache needs "whatever": true.
         * Now we query for type and set an item based on the type to true.
         */
        _.forIn(data.document.content, function(value) {
          value[value.type] = true
        })

        callback(null, data)
      })
    }
    },

    /**
     * Renders tex template and compiles pdf if necessary
     * @param  {Object}
     * @param  {Array}
     */
    function(error, result){

      /**
       * LaTeX and Mustache are using curly brackets. To avoid that we set the
       * delimiters to "<" and ">".
       */
      mustache.parse(result.template, ['<', '>'])

      var texfile = mustache.render(result.template, result.data)

      /**
       * Detects the desired output and responds with either the parsed tex file
       * or the compiled pdf file. The tex file is mainly used for debugging purposes.
       */
      if (request.params.type === 'tex') {
        response.setHeader('content-type', 'text/plain')
        response.charSet('utf-8')
        response.send(texfile)
        next()
      } else {
        var latexStream = require('latex')(texfile)
        latexStream.pipe(response)
        next()
      }

    }
  )
})

/**
 * Starts our server
 */
server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url)
})
