'use strict';

var utils = require('../utils/utils');
var constants = require('@tradle/constants');
var translate = utils.translate
var bankStyles = require('../styles/bankStyles')
var DEFAULT_PRODUCT_ROW_BG_COLOR = '#f7f7f7'
var DEFAULT_PRODUCT_ROW_TEXT_COLOR = '#757575'
var PRODUCT_ROW_BG_COLOR, PRODUCT_ROW_TEXT_COLOR
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  Platform,
  View
} from 'react-native'

import React, { Component } from 'react'

class MessageTypeRow extends Component {
  constructor(props) {
    super(props);
    PRODUCT_ROW_BG_COLOR = this.props.bankStyle.PRODUCT_ROW_BG_COLOR || DEFAULT_PRODUCT_ROW_BG_COLOR
    PRODUCT_ROW_TEXT_COLOR = this.props.bankStyle.PRODUCT_ROW_TEXT_COLOR || DEFAULT_PRODUCT_ROW_TEXT_COLOR
  }
  render() {
    var resource = this.props.resource;
    if (resource.autoCreate)
      return <View style={{height: 0}} />;
    var me = utils.getMe();
    var to = this.props.to;
    var ownerPhoto, hasOwnerPhoto;
    if (resource.owner  &&  resource.owner.photos)  {
      hasOwnerPhoto = true;
      var uri = utils.getImageUri(resource.owner.photos[0].url);
      ownerPhoto =
        <View style={[styles.cell, {marginVertical: 2}]}>
          <Image source={{uri: uri}} style={styles.msgImage} />
        </View>
    }
    else
      ownerPhoto = <View style={[styles.cell, {marginVertical: 20}]} />
    var renderedRow = [];
    var onPressCall = this.props.onSelect;

    var addStyle, inRow;
    if (!renderedRow.length) {
      var vCols = translate(resource);
      if (vCols)
        renderedRow = <Text style={[styles.modelTitle, {color: PRODUCT_ROW_TEXT_COLOR}]} numberOfLines={2}>{vCols}</Text>;
    }
    var verPhoto;
    if (resource.owner  &&  resource.owner.photos) {
      var ownerImg = resource.owner.photos[0].url;
      var url = utils.getImageUri(ownerImg);
      verPhoto = <Image source={{uri: ownerImg}} style={styles.ownerImage} />
    }
    var viewStyle = { marginVertical: StyleSheet.hairlineWidth, backgroundColor: PRODUCT_ROW_BG_COLOR }
    return (
      <TouchableHighlight style={viewStyle} onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
        {renderedRow}
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({
  modelTitle: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 18,
    fontWeight: '400',
    marginVertical: 15,
    marginLeft: 15
  },
  cell: {
    paddingLeft: 20
  },
  msgImage: {
    backgroundColor: '#dddddd',
    height: 40,
    marginRight: 5,
    width: 40,
    borderRadius: 20,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  ownerImage: {
    backgroundColor: '#dddddd',
    height: 30,
    width: 30,
    marginTop: -5,
    position: 'absolute',
    right: 10,
    borderRadius: 15,
    borderColor: '#cccccc',
    borderWidth: 1
  },
});

module.exports = MessageTypeRow;