'use strict'

var utils = require('../utils/utils')
var translate = utils.translate
import {
  DatePickerIOS,
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Easing,
  Animated
} from 'react-native'

import React from 'react'

var Picker = React.createClass({
  componentDidMount: function() {
    Animated.timing(this.props.offSet, {
      duration: 300,
      toValue: 10,
      easing: Easing.elastic(1)
    }).start()
  },
  closeModal() {
    Animated.timing(this.props.offSet, {
      duration: 300,
      toValue: utils.dimensions(Picker).width
    }).start(this.props.closeModal);
  },
  render() {
    return (
      <Animated.View style={{ transform: [{translateY: this.props.offSet}] }}>
        <View style={styles.closeButtonContainer}>
          <TouchableHighlight onPress={ () => {
            this.closeModal()
          }} underlayColor="transparent" style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{translate('setDateValue')}</Text>
          </TouchableHighlight>
        </View>
        <DatePickerIOS
          date={this.props.value || new Date()}
          mode='date'
          onFocus={(time) => {
            this.props.changeTime(time, this.props.prop)
          }}
          onDateChange={(time) => this.props.changeTime(time, this.props.prop)}>
        </DatePickerIOS>
      </Animated.View>
    )
  },

})

var styles = StyleSheet.create({
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopColor: '#e2e2e2',
    borderTopWidth: 1,
    borderBottomColor: '#e2e2e2',
    borderBottomWidth:1
  },
  closeButton: {
    paddingRight:10,
    paddingTop:10,
    paddingBottom:10
  },
  closeButtonText: {
    color: 'red',
    fontSize: 17
  }
});

module.exports = Picker
