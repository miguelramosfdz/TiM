'use strict'

import React from 'react'
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
  Platform
} from 'react-native'

import omit from 'object.omit'

const CENTER = false
const noop = () => {}

export default function SimpleModal (props) {
  const { title='', message='', buttons=[], style=DEFAULT_STYLES } = props
  let centerButtonStyle
  // if (buttons.length === 1) {
  //   centerButtonStyle = { flex: 1 }
  // }

  const renderedButtons = buttons.map(function (button, i) {
    const { text, onPress } = button
    const isCancel = buttons.length === 2 && i === 0
    const buttonStyle = isCancel ? style.cancel : style.ok
    const textStyle = isCancel ? style.cancelText : style.okText
    return (
      <TouchableOpacity onPress={onPress} style={[style.button, buttonStyle, centerButtonStyle]} key={'simple-modal-btn-' + i}>
        <Text style={textStyle}>{text}</Text>
      </TouchableOpacity>
    )
  })

  const head = title && (
    <View style={style.head}>
      <Text style={style.title}>{title}</Text>
    </View>
  )

  const modalProps = omit(props, ['title', 'message', 'buttons'])
  if (Platform.OS === 'android' && !modalProps.onRequestClose) {
    modalProps.onRequestClose = noop
  }

  return (
    <Modal {...modalProps} >
      <View style={style.container}>
        <View style={style.box}>
          {head}
          <View style={style.body}>
            <Text style={style.message}>{message || ''}</Text>
          </View>
          <View style={[style.buttonsContainer, centerButtonStyle]}>
            {renderedButtons}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const DEFAULT_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  box: {
    padding: 20,
    // maxWidth: 600,
    backgroundColor: '#ffffff',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 10, height: 10 },
    // boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)'
  },
  head: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1, //StyleSheet.hairlineWidth,
    borderBottomColor: '#eee'
  },
  body: {
    marginBottom: 20,
    paddingBottom: 5,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#eeeeee'
    // alignItems: 'center',
  },
  // close: {
  //   alignSelf: 'flex-end'
  // },
  title: {
    alignSelf: 'center',
    fontSize: 30
  },
  message: {
    alignSelf: 'flex-start',
    fontSize: 20
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: CENTER ? 'center' : 'flex-end'
  },
  button: {
    flex: CENTER ? 1 : null,
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eeeeee',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  cancel: {
    marginRight: 10
  },
  ok: {
    backgroundColor: '#77ADFC',
    borderColor: '#77ADFC',
    // colors from bootstrap:
    // backgroundColor: '#337ab7',
    // borderColor: '#337ab7'
  },
  okText: {
    color: '#fff'
  }
})
