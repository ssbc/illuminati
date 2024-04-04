// First start the server usign node talk.js
// Note the computer's IP address and port and change the alice.connect
// comman accordingly
var Illuminati = require('../')
var crypto = require('crypto')
var seeds = require('./seeds')

//deterministic keys make testing easy.
function hash (s) {
  return crypto.createHash('sha256').update(s).digest()
}

var appkey = hash('test_key')

var create = Illuminati({
  appKey: appkey,
}).use({
  manifest: {
    hello: 'sync'
  },
  permissions: {
    anonymous: { allow: ['hello'], deny: null }
  },
  init: function (api) {
    return {
      hello: function (name) {
        return 'Hello, ' + name + '.'
      }
    }
  }
})

var alice = create({ seed: seeds.alice })
alice.connect("net:10.0.1.52:57691~shs:bob3PzV+FJy8Xs6TtRBbWPhnOi53Brp7A+AG66XsJCY=", function (){})
