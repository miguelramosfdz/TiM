
import {
  Platform
} from 'react-native'

import DeviceInfo from 'react-native-device-info'
import extend from 'xtend'
import environment from '../environment.json'

const LOCAL_IP = (function () {
  if (Platform.OS === 'web') {
    return 'localhost'
  }

  if (DeviceInfo.isEmulator()) {
    return Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
  }


  return require('./localIP')
})()

const splash = {
  tradle: require('../img/splash1536x2048.png'),
  aviva: require('../img/Aviva.png')
}

const splashContrastColor = {
  tradle: '#eeeeee',
  aviva: '#004db5'
}

const brandBG = {
  tradle: require('../img/bg.png'),
  aviva: require('../img/Aviva.png')
}

const navBarHeight = Platform.select({
  android: 85,
  ios: 64
})

const merged = extend({
  GCM_SENDER_ID: '633104277721',
  serviceID: 'tradle',
  accessGroup: '94V7783F74.io.tradle.dev',
  LOCAL_IP: LOCAL_IP,
  LOCAL_SERVER: `http://${LOCAL_IP}:44444`,
  pushServerURL: __DEV__ ? `http://${LOCAL_IP}:48284` : 'https://push1.tradle.io',
  isAndroid: function () {
    return Platform.OS === 'android'
  },
  isIOS: function () {
    return Platform.OS === 'ios'
  },
  isWeb: function () {
    return Platform.OS === 'web'
  },
  allowAddServer: true,
  allowForgetMe: true,
  get prefillForms() {
    if (typeof PREFILL_FORMS === 'boolean') return PREFILL_FORMS

    return __DEV__
  },
  serverToSendLog: __DEV__ ? `http://${LOCAL_IP}:44444/userlog` : 'https://azure1.tradle.io/userlog',
  showMyQRCode: false,
  homePage: true,
  useKeychain: true,
  pauseOnTransition: true,
  profileTitle: 'profile',
  homePageScanQRCodePrompt: false,
  // auth settings
  // require touch id or device passcode
  initWithDeepLink: '/profile',
  requireDeviceLocalAuth: false,
  autoOptInTouchId: false,
  autoRegister: false,
  requireSoftPIN: false,
  locale: {
    language: DeviceInfo.getDeviceLocale(),
    country: DeviceInfo.getDeviceCountry()
  },
  // timeout after partial scan results have been processed
  blinkIDScanTimeoutInternal: 10000,
  // timeout from beginning to end of scan operation
  blinkIDScanTimeoutExternal: 30000,
  registerForPushNotifications: true,
  hideVerificationsInChat: false,
  hideProductApplicationInChat: false,
  landingPage: null, //"AvivaIntroView",
  showCollapsed: null, //{'tradle.PhotoID': 'document'}
  splashBackground: 'tradle',
  splashContrastColor: 'tradle',
  brandBackground: 'tradle',
  delayBetweenExpensiveTasks: 100,
  appName: 'Tradle',
  navBarHeight: navBarHeight,
  timeZoneOffset: new Date().getTimezoneOffset() * 60 * 1000,
  analyticsIdIsPermalink: __DEV__,
  analyticsEnabled: !__DEV__,
  deepLinkHost: 'link.tradle.io'
}, environment)

merged.splashBackground = splash[merged.splashBackground]
merged.splashContrastColor = splashContrastColor[merged.splashContrastColor]
merged.brandBackground = brandBG[merged.brandBackground]

exports = module.exports = merged
