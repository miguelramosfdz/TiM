/*

  a bootstrap like style

*/
'use strict';

var ICON_BORDER_COLOR = '#D7E6ED';
var BACKGROUND_COLOR = /*'#2E3B4E';*/'#7AAAC3';
var ERROR_COLOR = '#a94442';
var HELP_COLOR = '#999999';
var BORDER_COLOR = '#cccccc';
var DISABLED_COLOR = '#777777';
var DISABLED_BACKGROUND_COLOR = '#eeeeee';
var FONT_SIZE = 12;
var FONT_SIZE_1 = 17;
var FONT_WEIGHT = '500';

var utils = require('../utils/utils')

var buttonStyles = Object.freeze({
  icon: {
    width: 30,
    height: 30,
    // paddingLeft: 4, // for not outline icon
    // borderWidth: 1,
    // borderColor: ICON_BORDER_COLOR,
    // borderRadius: 15,
  },
  row: {
    flexDirection: 'row',
  },
  container: {
    alignSelf: 'center',
    paddingHorizontal: 7,
    marginTop: 10,
    // marginBottom: Platform.OS === 'ios' ? 10 : 0
    // marginTop: 16,
    // width: 120
  },
  buttons: {
    // marginTop: -80,
    // opacity: 0.8,
    // height: 63,
    // height: 90,
    // backgroundColor: BACKGROUND_COLOR,
    flexDirection: 'row',
    backgroundColor: '#a0a0a0',
    justifyContent: 'center',
    alignSelf: 'stretch'
  },
  text: {
    color: '#ffffff',
    paddingBottom: 10,
    // fontWeight: FONT_WEIGHT,
    fontSize: utils.getFontSize(FONT_SIZE),
    alignSelf: 'center',
    // marginTop: -6,
    // paddingTop: 10,
    // height: 45
  },

  row1: {
    flexDirection: 'row',
    alignSelf: 'center',
    position: 'absolute',
    left: 30,
    top: 5
  },
  icon1: {
    width: 25,
    height: 25,
    paddingTop: 2
    // paddingLeft: 5,
    // borderWidth: 1,
    // borderColor: ICON_BORDER_COLOR,
    // borderRadius: 15,
    // borderWidth: 2,
    // borderRadius: 12,
  },
  container1: {
    flex: 1,
    // position: 'absolute',
    // right: 10
    paddingHorizontal: 10
  },
  buttonContent: {
    // padding: 15,
    alignSelf: 'center',
    width: 150,
    height: 40,
    borderRadius: 10,
    backgroundColor: BACKGROUND_COLOR,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#466690'
  },
  text1: {
    paddingTop: 3,
    color: '#ffffff',
    fontFamily: 'Avenir Next',
    // fontWeight: '800',
    fontSize: utils.getFontSize(FONT_SIZE_1)
  }
});

module.exports = buttonStyles;