'use strict';

var Reflux = require('reflux');
var debug = require('debug')('Actions')

var actionProps = {}
var asyncActions = [
  'addApp',
  'addItem',
  'addMessage',
  'addModelFromUrl',
  'addNewIdentity',
  'addVerification',
  'addAll',

  'getItem',
  'getMe',
  'getTo',
  'getFrom',
  'getEmployeeInfo',
  'getTemporary',

  'removeIdentity',
  'showIdentityList',
  'changeIdentity',

  'reloadDB',
  'reloadModels',
  'list',
  'listSharedWith',
  'messageList',
  'productList',
  'start',
  'share',
  'startTransition',
  'endTransition',
  'talkToRepresentative',
  'saveTemporary',
  'cleanup',
  'forgetMe',
  'updateMe',
  'scheduleUpdate',

  'genPairingData',
  'sendPairingRequest',
  'processPairingRequest',
  'processPairingResponse',
  'pairingRequestAccepted',

  'getAllContexts',
  'getAllSharedContexts',

  'getAllPartials',
  'hasPartials',
  'viewChat',

  'exploreBacklink',
  'getDetails',
  'getProvider',
  'acceptTermsAndChat',
  'setPreferences',
  'getDocuments',
  'hasTestProviders'
]

var syncActions = [
  'setAuthenticated',
  'downloadedCodeUpdate',
  'showModal',
  'hideModal',
  'setProviderStyle'
]

asyncActions.forEach(name => actionProps[name] = {})
syncActions.forEach(name => {
  actionProps[name] = { sync: true }
})

var Actions = Reflux.createActions(actionProps)

Object.keys(Actions).forEach((name) => {
  var fn = Actions[name]
  Actions[name] = function () {
    debug('Actions.' + name)
    return fn.apply(this, arguments)
  }

  for (var p in fn) {
    Actions[name][p] = fn[p]
  }
})

module.exports = Actions;
