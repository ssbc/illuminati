// On one server use: node listen.js
// On another server use: node talk.js
var crypto = require('crypto')
var SecretStack = require('../lib')
var seeds = require('./seeds')

// deterministic keys make testing easy.
function hash (s) {
  return crypto.createHash('sha256').update(s).digest()
}

var appkey = hash('test_key')

var create = SecretStack({
  appKey: appkey
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

var bob = create({ seed: seeds.bob })
  bob.on('rpc:connect', function (rpc, isClient) {
    console.log(rpc.stream.address.substr(0, 4))
    console.log(rpc.stream.address.length)
  })

console.log(bob.address())
