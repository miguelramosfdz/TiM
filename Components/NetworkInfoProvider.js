'use strict'

import {
  View,
  StyleSheet,
  Text,
  Alert,
  Animated,
  TouchableOpacity
} from 'react-native'

import React, { Component } from 'react'
import utils from '../utils/utils'
var translate = utils.translate
var constants = require('@tradle/constants');
const TYPE = constants.TYPE
const ORGANIZATION = constants.TYPES.ORGANIZATION

class NetworkInfoProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fadeAnim: new Animated.Value(0), // init opacity 0
    }
  }

  componentDidMount() {
     Animated.timing(          // Uses easing functions
       this.state.fadeAnim,    // The value to drive
       {toValue: 1, duration: 5000}            // Configuration
     ).start();                // Don't forget start!
  }

  render() {
    let isOrg = this.props.resource  &&  this.props.resource[TYPE] === ORGANIZATION
    let isOnline = this.props.online || (typeof this.props.online === 'undefined')
    let providerOffline = this.props.resource  &&  isOrg  &&  !isOnline
    let dn = this.props.resource
           ? this.props.isConnected
               ? translate('learnMoreDescriptionTo', utils.getDisplayName(this.props.resource))
               : translate('learnMoreServerIsDown', utils.getDisplayName(this.props.resource))
           : translate('learnMoreDescription')
    if (this.props.connected  &&  !providerOffline && !this.props.serverOffline)
      return <View/>

    let msg = this.props.connected
            ? (providerOffline ? translate('providerIsOffline', utils.getDisplayName(this.props.resource)) : translate('serverIsUnreachable'))
            : translate('noNetwork')

    return  <Animated.View style={{opacity: this.state.fadeAnim}}>
              <View style={styles.bar}>
                <Text style={styles.text}>{msg}</Text>
                <TouchableOpacity onPress={() => Alert.alert(translate('offlineMode'), dn, null)}>
                  <Text style={styles.text}>{translate('learnMore')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
      // return <View style={styles.bar}>
      //          <Text style={styles.text}>{msg}</Text>
      //          <TouchableOpacity onPress={() => Alert.alert(translate('offlineMode'), dn, null)}>
      //            <Text style={styles.text}>{translate('learnMore')}</Text>
      //          </TouchableOpacity>
      //        </View>
  }
}

var styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FF9B30',
    padding: 7,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  text: {
    fontSize: 18,
    color: '#ffffff',
    alignSelf: 'center',
    marginHorizontal: 10
  },
});

module.exports = NetworkInfoProvider
