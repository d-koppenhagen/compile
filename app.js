'use strict'

var bunyan = require('bunyan')
var restify = require('restify')
var mustache = require('mustache')
var fs = require('fs')
var async = require('async')
var _ = require('lodash')
var request = require('request')
var config = require('config')

var compiler = require('./compiler/compiler')

var service = config.get('Service')

var log = bunyan.createLogger({
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
 * @param error
 */
function logError(error) {
  if (error) {
    if (error.constructor === Array) {
      for (var i = 0; i < error.length; i++) {
        logError(error[i])
      }
    } else {
      log.error(error)
    }
  }
}

compiler.load(log)

server.get('/document/:documentID', function (req, res, next) {

  var template
  var data

  /**
   * Reads the necessary files in parallel from drive and processes them if necessary
   */
  async.parallel({
      /**
       * Reads the LaTeX template and saves it as a String
       * @return String
       */
      template: function (callback) {
        fs.readFile('exampletemplate.tex', 'utf8', function (error, file) {
          logError(error)
          template = file
          callback(null, template)
        })
      },

      /**
       * Reads the file and converts the JSON to an object.
       * @return Object
       */
      data: function (callback) {
        request(service.datastore + '/' + req.params.documentID, function (error, res, body) {
          logError(error)

          if (res.statusCode !== 200 && res.statusCode !== 304) {
            log.error('Received status code ' + res.statusCode + ' from datastore!')
            return
          }

          try {
            /**
             * Converts the JSON string to an object for further processing. Lo-Dash and
             * Mustache require an object.
             * @type String
             */
            data = JSON.parse(body)
          } catch (e) {
            log.fatal(e)
            throw e
          }

          /**
           * Compute and add any additional data based on a specialised compiler
           */
          logError(compiler.compile(data))

          /**
           * Mustache tempaltes are logicless, so you can not write if statements
           * but you can check whether a variable is true or false. We store the content types
           * as "type": "whatever" but Mustache needs "whatever": true.
           * Now we query for type and set an item based on the type to true.
           */
          _.forEach(data.document.content, function (value) {
            value[value.type] = true
          })

          callback(null, data)
        })
      }
    },

    /**
     * Renders tex template and compiles pdf if necessary
     * @param error
     * @param result
     */
    function (error, result) {

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
      if (req.params.type === 'tex') {
        res.setHeader('content-type', 'text/plain')
        res.charSet('utf-8')
        res.send(texfile)
        next()
      } else {
        var latexStream = require('latex')(texfile, {command: 'xelatex'})
        latexStream.pipe(res)
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
