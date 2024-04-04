# secret-stack

create secure peer to peer networks using secret-handshakes.

This provides a framework to make building secure, decentralized systems easier.
(such as [ssb-server](https://github.com/ssbc/ssb-server) which this was refactored out of ;)

This module:

* uses [secret-handshake](https://github.com/auditdrivencrypto/secret-handshake) to set up a shared key for use between two peers with public / private keys (and verify the other peer)
* uses [multiserver](https://github.com/ssb-js/multiserver) to handle different ways of connecting to other peers over different protocols (who you then handshake with)
* uses [muxrpc](https://github.com/ssb-js/muxrpc) to provide a remote process call (rpc) interface to peers who have authenticated and connected allowing them to call methods on each other (like "please give me all mix's messages since yesterday"). This is all encrypted with the shared key set up by secret handshake.
* provides a plugin stack which allows you to
    - add new protocols to multiserver
    - add muxrpc methods
    - add plugins which persist state (like ssb-db, which when you add it essentially turns this into secure-scuttlebutt)
    - add plugins which let you listen and automate some things (eg replicate my friends when I connect to nicoth)

## Example

``` js
var SecretStack = require('secret-stack')
var databasePlugin = require('./some-database')
var bluetoothPlugin = require('./bluetooth')
var config = require('./some-config')

var App = SecretStack({ global: { appKey: '1KHLiKZvAvjbY1ziZEHMXawbCEIM6qwjCDm3VYRan/s=' } })
  .use(databasePlugin)
  .use(bluetoothPlugin)

var app = App(config)
```
See also: [`talk.js`](./examples/talk.js) and [`listen.js`](./examples/listen.js)

For documentation on plugins, see [PLUGINS.md](./PLUGINS.md).


## API

### `SecretStack(opts) => App`

Initialize a new app factory.

`opts` is an Object with properties:
- `appKey` - _String, 32 bytes_ a high entropy (i.e. random) key which is fixed for your app. Actors who do not know this value will not be able to connect to instances of your app.
- `permissions` - _Object_ (optional), you can set default permissions which will be the foundation for all permissions subsequently added. See [muxrpc permissions](https://github.com/ssb-js/muxrpc#permissions)

NOTE - you can also add other properties to opts. These will be merged with `config` later to form the final config passed to each plugin. (i.e. `merge(opts, config)`)


### `App.use(plugin) => App`

Add a plugin to the factory. See [PLUGINS.md](PLUGINS.md) for more details.

Returns the App (with plugin now installed)

### `App(config) => app`

Start the app and returns an EventEmitter with methods (core and plugin) attached.

`config` is an (optional) Object with:
- `config.global` - an object containing data available for all plugins
  - `config.global.keys` - _String_ a sodium ed25519 key pair
- `config[pluginName]` - an object containing data only available to the plugin with name `pluginName`. Note that `pluginName` is the camelCase of `plugin.name`.

`config` will be passed to each plugin as they're initialised (as `merge(opts, config)` which opts were those options `SecretStack` factory was initialised with), with only `config.global` and `config[pluginName]` available to each plugin.

This `app` as an EventEmitter emits the following events:

- `'multiserver:listening'`: emitted once the app's multiserver server is set up successfully, with no arguments
- `'rpc:connect'`: emitted every time a peer has been successfully connected with us, with the arguments:
  - `rpc`: the muxrpc object to call the peer's remote functions, includes `rpc.stream` and `rpc.stream.address` (the multiserver address for this remote peer)
  - `isClient`: a boolean indicating whether we are the client (true) or the server (false)
- `'close'`: emitted once `app.close()` has finished teardown logic, with the arguments:
  - `err`: if there was any error during closing

### app.getAddress()

get a string representing the address of this node.
it will be `ip:port:<base64:pubkey>`.

### app.connect(address, cb)

create a rpc connection to another instance.
Address should be the form returned by `getAddress`

### app.auth(publicKey, cb)

Query what permissions a given public key is assigned.
it's not intended for this to be exposed over the network,
but rather to extend this method to create plugable permissions systems.

``` js
app.auth.hook(function (auth, args) {
  var pub = args[0]
  var cb = args[1]
  //call the first auth fn, and then hook the callback.
  auth(pub, function (err, perms) {
    if(err)  cb(err)
    //optionally set your own perms for this pubkey.
    else if(accepted)
       cb(null, permissions)

    //or if you wish to reject them
    else if(rejected)
      cb(new Error('reject'))

    //fallback to default (the next hook, or the anonymous config, if defined)
    else
      cb()
  })
})
```

### `app.close()`

close the app!

Optionally takes `(err, callback)`

----

## TODO document

> mix: I think some of these are exposed over muxrpc (as they're in the manifest)
and some can only be run locally if you have access to the instance of `app` you
got returned after initialising it.

### `app.id => String`  (alias `publicKey`)

### `app.getManifest() => Object` (alias: `manifest`)


### `auth: 'async'`
### `address: 'sync'`
### `config => Object'`
### `multiserver.parse: 'sync',`
### `multiserver.address: 'sync'`
### `multiserver.transport: 'sync'`
### `multiserver.transform: 'sync'`


## License

MIT
