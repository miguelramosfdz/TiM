'use strict';

var debug = require('debug')('NewResource')
var utils = require('../utils/utils');
var translate = utils.translate
var NewItem = require('./NewItem');
var ResourceList = require('./ResourceList')
var GridItemsList = require('./GridItemsList')
var PhotoView = require('./PhotoView');
var ResourceView = require('./ResourceView');
var ResourceMixin = require('./ResourceMixin');
var PageView = require('./PageView')
var t = require('tcomb-form-native');
var extend = require('extend');
var Actions = require('../Actions/Actions');
var Store = require('../Store/Store');
var Reflux = require('reflux');
var reactMixin = require('react-mixin');
var Icon = require('react-native-vector-icons/Ionicons');
var rStyles = require('../styles/registrationStyles');
var NewResourceMixin = require('./NewResourceMixin');
var reactMixin = require('react-mixin');
var equal = require('deep-equal')
var constants = require('@tradle/constants');
var termsAndConditions = require('../termsAndConditions.json')
var StyleSheet = require('../StyleSheet')
import dismissKeyboard from 'react-native/Libraries/Utilities/dismissKeyboard'
import ImageInput from './ImageInput'
var chatStyles = require('../styles/chatStyles')

var TextInputState = require('TextInputState')

import CustomIcon from '../styles/customicons'
const ENUM = 'tradle.Enum'
var LINK_COLOR
const DEFAULT_LINK_COLOR = '#a94442'
const FORM_ERROR = 'tradle.FormError'
const PHOTO = 'tradle.Photo'

var Form = t.form.Form;
var stylesheet = require('../styles/styles')

import Native, {
  // StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Platform,
  // StatusBar,
  Alert,
  Navigator,
  TouchableOpacity,
  Animated
} from 'react-native';

import React, { Component, PropTypes } from 'react'
import ActivityIndicator from './ActivityIndicator'
import platformStyles from '../styles/platform'
import { makeResponsive } from 'react-native-orient'
import BackgroundImage from './BackgroundImage'
import ENV from '../utils/env'

const BG_IMAGE = ENV.brandBackground

class NewResource extends Component {
  static displayName = 'NewResource';
  props: {
    navigator: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    originatingMessage: PropTypes.object,
    editCols: PropTypes.string,
    callback: PropTypes.func,
    returnRoute: PropTypes.object,
    additionalInfo: PropTypes.bool,
    doNotSend: PropTypes.bool
  };

  constructor(props) {
    super(props);
    if (this.props.bankStyle)
      LINK_COLOR = this.props.bankStyle.LINK_COLOR || DEFAULT_LINK_COLOR
    else
      LINK_COLOR = DEFAULT_LINK_COLOR
    var r = {};
    if (props.resource)
      r = utils.clone(props.resource) //extend(true, r, props.resource)
    else
      r[constants.TYPE] = props.model.id
    var isRegistration = !utils.getMe()  && this.props.model.id === constants.TYPES.PROFILE  &&  (!this.props.resource || !this.props.resource[constants.ROOT_HASH]);

    this.state = {
      resource: r,
      isUploading: !isRegistration  &&  (!r[constants.ROOT_HASH] || Object.keys(r).length === 2),
      isRegistration: isRegistration,
      isLoadingVideo: false,
      isPrefilled: this.props.isPrefilled,
      modal: {},
      termsAccepted: isRegistration ? false : true
    }
    var currentRoutes = this.props.navigator.getCurrentRoutes()
    var currentRoutesLength = currentRoutes.length
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.onSavePressed.bind(this)

    this.scrollviewProps = {
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle: 50,
      onScroll: this.onScroll.bind(this)
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    let isUpdate = nextState.err                             ||
           this.props.orientation !== nextProps.orientation  ||
           nextState.missedRequiredOrErrorValue              ||
           this.state.modal !== nextState.modal              ||
           this.state.prop !== nextState.prop                ||
           this.state.isUploading !== nextState.isUploading  ||
           this.state.itemsCount !== nextState.itemsCount    ||
           this.state.isLoadingVideo !== nextState.isLoadingVideo  ||
           this.state.keyboardSpace !== nextState.keyboardSpace    ||
           this.state.inFocus !== nextState.inFocus                ||
           // this.state.termsAccepted !== nextState.termsAccepted    ||
          !equal(this.state.resource, nextState.resource)

    if (!isUpdate)
      isUpdate = !utils.compare(this.props.resource, nextProps.resource)
    return isUpdate
           // nextState.isModalOpen !== this.state.isModalOpen  ||
           // this.state.modalVisible != nextState.modalVisible ||
  }
  componentWillMount() {
    if (this.state.resource[constants.ROOT_HASH]  &&  Object.keys(this.state.resource).length === 2)
      Actions.getItem(utils.getId(this.state.resource))
    else if (this.state.isUploading)
      Actions.getTemporary(this.state.resource[constants.TYPE])
  }

  componentDidMount() {
    this.listenTo(Store, 'itemAdded');
  }


  componentDidUpdate() {
    if (!this.state.missedRequiredOrErrorValue  ||  utils.isEmpty(this.state.missedRequiredOrErrorValue)) return

    let viewCols = this.props.model.viewCols
    let first
    for (let p in this.state.missedRequiredOrErrorValue) {
      if (!viewCols) {
        first = p
        break
      }

      if (!first || viewCols.indexOf(p) < viewCols.indexOf(first)) {
        first = p
      }
    }
    let ref = this.refs.form.getComponent(first) || this.refs[first]
    if (!ref) return

    if (!utils.isEmpty(this.state.missedRequiredOrErrorValue)  &&  !this.state.noScroll) {
      utils.scrollComponentIntoView(this, ref)
      this.state.noScroll = true
    }
  }

  itemAdded(params) {
    var resource = params.resource;
    if (params.action === 'languageChange') {
      this.props.navigator.popToTop()
      return
    }
    if (params.action === 'noChanges') {
      this.setState({err: translate('nothingChanged'), submitted: false})
      return
    }
    if (params.action === 'getItem'  &&  utils.getId(this.state.resource) === utils.getId(params.resource)) {
      this.setState({
        resource: params.resource,
        isUploading: false
      })
      return
    }
    if (params.action === 'getTemporary') {
      var r = {}
      extend(r, this.state.resource)
      extend(r, params.resource)
      this.setState({
        resource: r,
        isUploading: false
      })
      return
    }

    if (params.action === 'runVideo'  && this.state.isRegistration) {
      if (this.props.callback)
        this.setState({isLoadingVideo: true})
        return;
    }
    if (!resource  &&  params.error &&  params.action === 'addItem') {
      this.state.submitted = false
      console.log('addItem: submitted = false')
      Alert.alert(
        params.error,
      )
      var actionParams = {
        query: this.state.filter,
        modelName: this.props.modelName,
        to: this.props.resource,
      }
      return
    }
    if (!resource  ||  (params.action !== 'addItem'  &&  params.action !== 'addMessage')) {
      return;
    }
    if (this.state.resource[constants.TYPE] !== resource[constants.TYPE])
      return
    if (params.error) {
      if (resource[constants.TYPE] == this.state.resource[constants.TYPE])
        this.setState({err: params.error, resource: resource, isRegistration: this.state.isRegistration});
      console.log('addItem error: submitted = false')
      this.state.submitted = false
      return;
    }
    if (params.action === 'addItem') {
      // If the resource was being modified, show the list of parties with whom the resource has been
      // previously shared and allow customer to choose who he wants to sharae the modifications with
      // if (resource._sharedWith  &&  resource._sharedWith.length > 1) {
      //   this.showSharedWithList(params.resource)
      //   return
      // }
    }
    if (this.props.callback) {
      utils.onNextTransitionEnd(this.props.navigator, () => this.state.submitted = false)
      this.props.callback(resource);
      return;
    }

    var self = this;
    var title = utils.getDisplayName(resource, this.props.model.properties);
    var isMessage = utils.isMessage(this.props.model)
    // When message created the return page is the chat window,
    // When profile or some contact info changed/added the return page is Profile view page
    if (isMessage) {
      if (this.props.originatingMessage  &&  resource[constants.ROOT_HASH] !== this.props.originatingMessage[constants.ROOT_HASH]) {
        var params = {
          value: {documentCreated: true, document: resource[constants.NONCE]},
          resource: this.props.originatingMessage,
          meta: utils.getModel(this.props.originatingMessage[constants.TYPE]).value
        }
        Actions.addItem(params)
        this.props.navigator.pop();
        return;
      }
    }
    var currentRoutes = self.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    var navigateTo = (currentRoutesLength == 2)
             ? this.props.navigator.replace
             : this.props.navigator.replacePrevious
    // Editing form originated from chat
    if (this.props.chat) {
      let routes = this.props.navigator.getCurrentRoutes()
      this.props.navigator.popToRoute(routes[routes.length - 3])
      return
    }
    navigateTo({
      id: 3,
      title: title,
      component: ResourceView,
      titleTextColor: '#7AAAC3',
      rightButtonTitle: translate('edit'),
      backButtonTitle: translate('back'),
      onRightButtonPress: {
        title: title,
        id: 4,
        component: NewResource,
        rightButtonTitle: translate('done'),
        backButtonTitle: translate('back'),
        titleTextColor: '#7AAAC3',
        passProps: {
          model: self.props.model,
          resource: resource,
          currency: this.props.currency,
          bankStyle: this.props.bankStyle
        }
      },
      passProps: {
        resource: resource,
        currency: this.props.currency,
        bankStyle: this.props.bankStyle
      }
    });
    if (currentRoutesLength != 2)
      this.props.navigator.pop();
//     console.log('itemAdded: submitted = false')
//     this.state.submitted = false
  }
  // Show providers this resource was shared with and allow customer to choose
  // which providers to share the changes with
  showSharedWithList(newResource) {
    if (!this.props.resource  ||  !this.props.resource._sharedWith)
      return
    this.props.navigator.replace({
      id: 10,
      title: translate('shareChangesWith'),
      backButtonTitle: translate('back'),
      component: ResourceList,
      rightButtonTitle: translate('Done'),
      passProps: {
        message: translate('chooseCompaniesToShareChangesWith'),
        modelName: constants.TYPES.ORGANIZATION,
        to: this.state.resource.to,
        resource: this.props.resource,
        callback:  this.shareWith.bind(this, newResource),
        chat: this.props.chat,
        bankStyle: this.props.bankStyle,
        currency: this.props.currency
      }
    });
  }
  // The form/verification was shared with other providers and now it is edited.
  // Offer to share the form with the same providers it was originally share
  shareWith(newResource, list) {
    if (list.length)
      Actions.share(newResource, list)
    this.props.navigator.pop()
  }
  onSavePressed() {
    if (this.state.submitted)
      return

    this.state.submitted = true
    this.state.noScroll = false
    var resource = this.state.resource;

    var value = this.refs.form.getValue();
    if (!value) {
      value = this.refs.form.refs.input.state.value;
      if (!value)
        value = {}
    }

    // value is a tcomb Struct
    var json = utils.clone(value);
    let isNew = !resource[constants.ROOT_HASH]
    this.checkEnums(json, resource)
    if (this.floatingProps) {
      for (var p in this.floatingProps) {
        if (isNew  ||  resource[p] !== this.floatingProps[p])
          json[p] = this.floatingProps[p]
      }
    }
    var required = this.props.model.required;
    if (!required) {
      let props = this.props.model.properties
      required = []
      for (var p in props) {
        if (p.charAt(0) !== '_'  &&  !props[p].readOnly)
          required.push(p)
      }
    }
    var missedRequiredOrErrorValue = {}
    required.forEach((p) =>  {
      var v = (typeof json[p] !== 'undefined') || json[p] ? json[p] : (this.props.resource ? this.props.resource[p] : null); //resource[p];
      if (v) {
        if (typeof v === 'string'  &&  !v.length) {
          v = null
          delete json[p]
        }
        else if (typeof v === 'object')  {
          let ref = this.props.model.properties[p].ref
          if (ref) {
            let rModel = utils.getModel(ref).value
            if (ref === constants.TYPES.MONEY) {
              if (!v.value || (typeof v.value === 'string'  &&  !v.value.length)) {
                missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
                return
              }
            }
            else if (ref === 'tradle.Photo')
              return
            else if (!rModel.subClassOf  ||  rModel.subClassOf !== ENUM) {
              var units = this.props.model.properties[p].units
              if (units)
                v = v.value
              else {
                if (v.value === '')
                  v = null
                delete json[p]
              }
              return
            }
          }
          else if (this.props.model.properties[p].type === 'array'  &&  !v.length) {
            missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
            return
          }
        }
      }
      if (this.props.model.properties[p].type  === 'boolean'  &&  typeof v !== 'undefined')
        return
      var isDate = Object.prototype.toString.call(v) === '[object Date]'
      if (!v  ||  (isDate  &&  isNaN(v.getTime())))  {
        var prop = this.props.model.properties[p]
        if (prop.items  &&  prop.items.backlink)
          return
        if ((prop.ref) ||  isDate  ||  prop.items) {
          if (resource && resource[p])
            return;
          missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired') //'This field is required'
        }
        else if (!prop.displayAs)
          missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
      }
    })

    var err = this.validateProperties(json)
    for (var p in err)
      missedRequiredOrErrorValue[p] = err[p]

    // if ('scanJson' in missedRequiredOrErrorValue) {
    //   if (utils.isAndroid() || utils.isWeb()) {
    //     delete missedRequiredOrErrorValue.scanJson
    //     json.scanJson = { ocrNotSupported: true }
    //   }
    // }

    if (!utils.isEmpty(missedRequiredOrErrorValue)) {
      console.log('onSavePressed not all required: submitted = false')

      this.state.submitted = false
      var state = {
        missedRequiredOrErrorValue: missedRequiredOrErrorValue
      }
      this.setState(state)
      return;
    }
    if (!value)
      debugger

    var r = {}
    extend(true, r, resource)
    json._context = r._context ||  (this.props.originatingMessage  &&  this.props.originatingMessage._context)
    delete r.url
    var params = {
      value: json,
      resource: r,
      meta: this.props.model,
      isRegistration: this.state.isRegistration
    };
    if (this.props.chat)
      params.chat = this.props.chat
    params.doNotSend = this.props.doNotSend
    Actions.addItem(params)
  }
  // HACK: the value for property of the type that is subClassOf Enum is set on resource
  // and it is different from what tcomb sets in the text field
  checkEnums(json, resource) {
    var props = this.props.model.properties
    for (var p in json) {
      if (!props[p]  ||  !props[p].ref)
        continue
      let m = utils.getModel(props[p].ref).value
      if (m.subClassOf  &&  m.subClassOf === ENUM)
        json[p] = resource[p]
    }
  }
  addFormValues() {
    var value = this.refs.form.getValue();
    var json = value ? value : this.refs.form.refs.input.state.value;
    var resource = this.state.resource;
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = this.props.model.id;
    }
    for (var p in json)
      if (!resource[p] && json[p])
        resource[p] = json[p];
    return resource;
  }
  onAddItem(propName, item) {
    if (!item)
      return;
    var resource = this.addFormValues();
    if (this.props.model.properties[propName].items.ref)
      item[constants.TYPE] = this.props.model.properties[propName].items.ref
    var items = resource[propName];
    if (!items) {
      items = [];
      resource[propName] = items;
    }
    items.push(item);
    var itemsCount = this.state.itemsCount ? this.state.itemsCount  + 1 : 1
    if (this.state.missedRequiredOrErrorValue)
      delete this.state.missedRequiredOrErrorValue[propName]
    this.setState({
      resource: resource,
      itemsCount: itemsCount,
      prop: propName,
      inFocus: propName
    });
  }

  onNewPressed(bl) {
    var resource = this.addFormValues();
    this.setState({resource: resource, err: '', inFocus: bl.name});
    // if (bl.name === 'photos') {
    //   this.showChoice(bl);
    //   return;
    // }
    var blmodel = bl.items.ref ? utils.getModel(bl.items.ref).value : this.props.model
    if (bl.items.ref  &&  bl.allowToAdd) {
      this.props.navigator.push({
        id: 10,
        title: translate(bl, blmodel), // Add new ' + bl.title,
        backButtonTitle: translate('back'),
        component: ResourceList,
        passProps: {
          modelName: bl.items.ref,
          to: this.state.resource.to,
          resource: this.state.resource,
          isChooser: true,
          prop: bl,
          callback:    this.setChosenValue.bind(this),
          bankStyle: this.props.bankStyle,
          currency: this.props.currency
        }
      });
      return
    }
    this.props.navigator.push({
      id: 6,
      title: translate('addNew', translate(bl, blmodel)), // Add new ' + bl.title,
      backButtonTitle: translate('back'),
      component: NewItem,
      rightButtonTitle: translate('done'),
      passProps: {
        metadata: bl,
        resource: this.state.resource,
        parentMeta: this.props.model,
        onAddItem: this.onAddItem.bind(this),
        currency: this.props.currency
      }
    });
  }

  render() {
    if (this.state.isUploading)
      return <View/>
    var props = this.props;
    var parentBG = {backgroundColor: '#7AAAC3'};
    var resource = this.state.resource;

    var meta =  props.model;
    if (this.props.setProperty)
      this.state.resource[this.props.setProperty.name] = this.props.setProperty.value;
    var data = {};
    var model = {};
    var arrays = [];
    extend(true, data, resource);
    var isMessage = utils.isMessage(meta)
    var isFinancialProduct = isMessage  &&  this.props.model.subClassOf && this.props.model.subClassOf === constants.TYPES.FINANCIAL_PRODUCT
    var showSendVerificationForm = false;
    var formToDisplay;
    if (isMessage) {
      var len = resource.message  &&  utils.splitMessage(resource.message).length;
      if (len < 2)
        showSendVerificationForm = true;
      else
        data.message = '';
    }
    var params = {
        meta: meta,
        data: data,
        model: model,
        items: arrays,
        onEndEditing: this.onEndEditing.bind(this),
        component: NewResource
      };
    if (this.props.editCols)
      params.editCols = this.props.editCols;
    let isRegistration = this.state.isRegistration
    if (isRegistration)
      params.isRegistration = true
    if (this.props.originatingMessage  &&  this.props.originatingMessage[constants.TYPE] === FORM_ERROR) {
      params.errors = {}
      this.props.originatingMessage.errors.forEach((r) => {
        params.errors[r.name] = r.error
      })
    }

    var options = this.getFormFields(params);

    var Model = t.struct(model);

    var itemsMeta
    if (this.props.editCols) {
      itemsMeta = []
      this.props.editCols.forEach(function(p) {
        if (meta.properties[p].type === 'array')
          itemsMeta.push(meta.properties[p])
      })
    }
    else
      itemsMeta = utils.getItemsMeta(meta);

    var self = this;
    var arrayItems = [];
    var itemsArray
    for (var p in itemsMeta) {
      var bl = itemsMeta[p]
      if (bl.icon === 'ios-telephone-outline') {
        bl.icon = 'ios-call-outline'
      }

      if (bl.readOnly  ||  bl.items.backlink) {
        arrayItems.push(<View key={this.getNextKey()} ref={bl.name} />)
        continue
      }
      let blmodel = meta
      var counter, count = 0
      itemsArray = null
      var count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
      if (count  &&  (bl.name === 'photos' || bl.items.ref === PHOTO))
        arrayItems.push(this.getPhotoItem(bl, styles))
      else
        arrayItems.push(this.getItem(bl, styles))
    }
    if (isRegistration)
      Form.stylesheet = rStyles
    else
      Form.stylesheet = stylesheet

    // var style = isRegistration
    //           ? DeviceHeight < 600 ? {marginTop: 100} : {marginTop: DeviceHeight / 4}
    //           : platformStyles.container
    var {width, height} = utils.dimensions(NewResource)
    // var style = [platformStyles.container, {backgroundColor: 'transparent', height: DeviceHeight}]
    if (!options)
      options = {}
    options.auto = 'placeholders';
    options.tintColor = 'red'
    var photoStyle = /*isMessage && !isFinancialProduct ? {marginTop: -35} :*/ styles.photoBG;
    var button = isRegistration
               ? <View>
                   <TouchableOpacity style={styles.thumbButton}
                        onPress={() => {
                          if (this.state.termsAccepted)
                            this.onSavePressed()
                          else
                            this.showTermsAndConditions()
                        }}>
                      <View style={styles.getStarted}>
                         <Text style={styles.getStartedText}>ENTER</Text>
                      </View>
                   </TouchableOpacity>
                 </View>
               : <View style={{height: 0}} />
    var formStyle = isRegistration
                  ? {justifyContent: 'center', height: height - (height > 1000 ? 0 : isRegistration ? 50 : 100)}
                  : {justifyContent: 'flex-start'}
    let jsonProps = utils.getPropertiesWithRange('json', meta)
    let jsons = []
    if (jsonProps  &&  jsonProps.length) {
      jsonProps.forEach((prop) => {
        let val = this.state.resource[prop.name]
        if (val) {
          let params = {prop: prop, json: val, jsonRows: [], isView: true}
          jsons.push(this.showJson(params))
        }
      })
    }
    if (!jsons.length)
      jsons = <View/>
    var content =
      <ScrollView style={{backgroundColor: 'transparent'}}
                  ref='scrollView' {...this.scrollviewProps}
                  keyboardShouldPersistTaps={true}
                  keyboardDismissMode={isRegistration || Platform.OS === 'ios' ? 'on-drag' : 'interactive'}>
        <View style={[styles.container, formStyle]}
          onStartShouldSetResponderCapture={(e) => {
            if (Platform.OS === 'android') {
              const focusField = TextInputState.currentlyFocusedField();

              if (focusField != null && e.nativeEvent.target != focusField)
                dismissKeyboard();
            }
          }}>
          <View style={isRegistration ? {marginHorizontal: height > 1000 ? 50 : 30} : {marginHorizontal: 10}}>
            <Form ref='form' type={Model} options={options} value={data} onChange={this.onChange.bind(this)}/>
            {button}
            <View style={{marginTop: isRegistration ? 0 : -10, paddingBottom: 20}}>
              {arrayItems}
            </View>
            {jsons}
            <View style={{alignItems: 'center', marginTop: 50}}>
             {this.state.isLoadingVideo
                  ? <ActivityIndicator animating={true} size='large' color='#ffffff'/>
                  : <View/>
               }
            </View>
          </View>
        </View>
      </ScrollView>

    // var submit
    // if (!isRegistration)
    //   submit = <View style={styles.submitButton}>
    //              <TouchableOpacity onPress={this.onSavePressed.bind(this)}>
    //                 <View style={[chatStyles.shareButton, {width: 100, backgroundColor: '#fdfdfd', paddingHorizontal: 10, justifyContent: 'center'}]}>
    //                   <Text style={chatStyles.shareText}>{translate('Submit')}</Text>
    //                   <Icon name='ios-send' size={25} style={{color: '#7AAAC3', paddingLeft: 5, transform: [{rotate: '45deg'}] }} />
    //                 </View>
    //               </TouchableOpacity>
    //             </View>
    // StatusBar.setHidden(true);
    let bankStyle = this.props.bankStyle
    if (!isRegistration) {
      if (this.state.err) {
        Alert.alert(this.state.err)
        this.state.err = null
      }
      var submit
      if (!isRegistration  &&  bankStyle  &&  bankStyle.submitBarInFooter)
        submit = <TouchableOpacity onPress={this.onSavePressed.bind(this)}>
                   <View style={{marginHorizontal: -3, marginBottom: -2, backgroundColor: bankStyle.CONTEXT_BACKGROUND_COLOR, borderTopColor: bankStyle.CONTEXT_BACKGROUND_COLOR, borderTopWidth: StyleSheet.hairlineWidth, height: 45, justifyContent: 'center', alignItems: 'center'}}>
                     <View style={{backgroundColor: 'transparent', paddingHorizontal: 10, justifyContent: 'center'}}>
                       <Text style={{fontSize: 24,color: bankStyle.CONTEXT_TEXT_COLOR}}>{translate('next')}</Text>
                     </View>
                   </View>
                 </TouchableOpacity>

      let contentSeparator = utils.getContentSeparator(bankStyle)
      return <PageView style={platformStyles.container} separator={contentSeparator}>
               {content}
               {submit}
              </PageView>
    }
    let title
    if (!isRegistration  &&  !bankStyle.LOGO_NEEDS_TEXT) {
      title = <View style={{backgroundColor: bankStyle.CONTEXT_BACKGROUND_COLOR, borderTopColor: bankStyle.CONTEXT_BACKGROUND_COLOR, borderTopWidth: StyleSheet.hairlineWidth, height: 25, justifyContent: 'center', alignItems: 'center'}}>
                {translate(meta)}
              </View>
    }
    return (
      <View style={{height: height}}>
        <BackgroundImage source={BG_IMAGE} />
        <View style={{justifyContent: 'center', height: height}}>
        {isRegistration
          ? <View style={styles.logo}>
              <CustomIcon name='tradle' size={40} color='#ffffff' style={{padding: 10}}/>
            </View>
          : {title}
        }
        {content}
        </View>
      </View>
    )
  }
  showTermsAndConditions() {
    this.props.navigator.push({
      id: 3,
      component: ResourceView,
      title: translate('termsAndConditions'),
      backButtonTitle: translate('back'),
      rightButtonTitle: translate('Accept'),
      passProps: {
        resource: termsAndConditions,
        action: this.acceptTsAndCs.bind(this)
      }
   })
  }
  acceptTsAndCs() {
    this.setState({termsAccepted: true})
    if (this.state.resource.firstName)
      this.onSavePressed()
    else
      this.props.navigator.pop()
  }

  cancelItem(pMeta, item) {
    var list = this.state.resource[pMeta.name];
    for (var i=0; i<list.length; i++) {
      if (equal(list[i], item)) {
        list.splice(i, 1);
        this.setState({
          resource: this.state.resource,
          itemsCount: list.length
        })
        return
      }
    }
  }

  showItems(prop, model, event) {
    var resource = this.state.resource;
    var model = (this.props.model  ||  this.props.metadata)
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = model.id;
    }

    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate('tapToRemovePhotos'), //Tap to remove photos',
      titleTintColor: 'red',
      id: 19,
      component: GridItemsList,
      noLeftButton: true,
      rightButtonTitle: translate('done'),
      passProps: {
        prop:        prop.name,
        resource:    resource,
        onAddItem:   this.onAddItem.bind(this),
        list:        resource[prop.name],
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenValue.bind(this),
      }
    });
  }
  getItem(bl, styles) {
    let resource = this.state.resource
    if (utils.isHidden(bl.name, resource))
      return
    let meta = this.props.model
    let blmodel = meta
    var counter, count = 0
    let itemsArray = null
    var count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
    let lcolor = this.getLabelAndBorderColor(bl.name)
    let isPhoto = bl.name === 'photos' || bl.items.ref === PHOTO
    if (count) {
      let val = <View>{this.renderItems(resource[bl.name], bl, this.cancelItem.bind(this))}</View>

      var separator = <View style={styles.separator}></View>
      let cstyle = count ? styles.activePropTitle : styles.noItemsText
      itemsArray = <View>
                     <Text style={[cstyle, {color: lcolor}]}>{translate(bl, blmodel)}</Text>
                     {val}
                   </View>

      counter = <View style={[styles.itemsCounterEmpty, {paddingBottom: 10, marginTop: 15}]}>
                  <Icon name={bl.icon || 'md-add'} size={bl.icon ? 25 : 20}  color={LINK_COLOR} />
                </View>
    }
    else {
      itemsArray = <Text style={count ? styles.itemsText : styles.noItemsText}>{translate(bl, blmodel)}</Text>
      counter = <View style={[styles.itemsCounterEmpty]}>{
                  isPhoto
                    ? <Icon name='ios-camera-outline'  size={25} color={LINK_COLOR} />
                    : <Icon name={bl.icon || 'md-add'}   size={bl.icon ? 25 : 20} color={LINK_COLOR} />
                  }

                </View>
    }
    var err = this.state.missedRequiredOrErrorValue
            ? this.state.missedRequiredOrErrorValue[bl.name]
            : null
    var errTitle = translate('thisFieldIsRequired')
    var error = err
              ? <View style={styles.error}>
                  <Text style={styles.errorText}>{errTitle}</Text>
                </View>
              : <View/>

    var aiStyle = [{flex: 7}, count ? {paddingTop: 0} : {paddingTop: 15, paddingBottom: 7}]
    var actionableItem = isPhoto
      ? <ImageInput prop={bl} style={aiStyle} onImage={item => this.onAddItem(bl.name, item)}>
          {itemsArray}
        </ImageInput>
      : <TouchableOpacity style={aiStyle}
            onPress={this.onNewPressed.bind(this, bl, meta)}>
          {itemsArray}
        </TouchableOpacity>

    let istyle = [styles.itemButton]
    if (err)
      istyle.push({marginBottom: 10})
    else if (!count)
      istyle.push({paddingBottom: 0, height: 70})
    else {
      let height = resource[bl.name].photo ? 55 : 45
      istyle.push({paddingBottom: 0, height: count * height + 35})
    }

    var acStyle = [{flex: 1, position: 'absolute', right: 0}, count ? {paddingTop: 0} : {marginTop: 15, paddingBottom: 7}]
    var actionableCounter = isPhoto
      ? <ImageInput prop={bl} style={acStyle} onImage={item => this.onAddItem(bl.name, item)}>
          {counter}
        </ImageInput>
      : <TouchableOpacity style={acStyle}
            onPress={this.onNewPressed.bind(this, bl, meta)}>
          {counter}
        </TouchableOpacity>
    return (
      <View key={this.getNextKey()}>
        <View style={[istyle, {marginHorizontal: 10, borderBottomColor: lcolor}]} ref={bl.name}>
          <View style={styles.items}>
            {actionableItem}
            {actionableCounter}
          </View>
        </View>
        {error}
      </View>
    );
  }
  getPhotoItem(bl, styles) {
    let meta = this.props.model
    let resource = this.state.resource
    let blmodel = meta
    var counter, count = 0
    let itemsArray = null
    let lcolor = this.getLabelAndBorderColor(bl.name)
    var count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
    if (count) {
      var items = []
      var arr = resource[bl.name]
      var n = Math.min(arr.length, 7)
      for (var i=0; i<n; i++) {
        items.push(<Image resizeMode='cover' style={styles.thumb} source={{uri: arr[i].url}}  key={this.getNextKey()} onPress={() => {
          this.openModal(arr[i])
        }}/>)
      }
      itemsArray =
        <View style={[styles.photoStrip, count ? {marginTop: -25} : {marginTop: 0}]}>
          <Text style={[styles.activePropTitle, {color: lcolor}]}>{translate(bl, blmodel)}</Text>
          <View style={styles.photoStripItems}>{items}</View>
        </View>
      counter =
        <View>
          <View style={{marginTop: 25, paddingHorizontal: 5}}>
            <Icon name='ios-camera-outline'  size={25} color={LINK_COLOR} />
          </View>
        </View>;
    }
    else {
      itemsArray = <Text style={count ? styles.itemsText : styles.noItemsText}>{translate(bl, blmodel)}</Text>
      counter = <View style={[styles.itemsCounterEmpty]}>
                  <Icon name='ios-camera-outline'  size={25} color={LINK_COLOR} />
                </View>
    }
    var title = translate(bl, blmodel) //.title || utils.makeLabel(p)
    var err = this.state.missedRequiredOrErrorValue
            ? this.state.missedRequiredOrErrorValue[bl.name]
            : null
    var errTitle = translate('thisFieldIsRequired')
    var error = err
              ? <View style={styles.error}>
                  <Text style={styles.errorText}>{errTitle}</Text>
                </View>
              : <View/>
    var actionableItem = count
                       ?  <TouchableOpacity style={{flex: 7, paddingTop: 15}}
                           onPress={this.showItems.bind(this, bl, meta)}>
                            {itemsArray}
                          </TouchableOpacity>
                       : <ImageInput
                           prop={bl}
                           style={[{flex: 7}, count ? {paddingTop: 0} : {paddingTop: 15, paddingBottom: 7}]}
                           underlayColor='transparent'
                           onImage={item => this.onAddItem(bl.name, item)}>
                           {itemsArray}
                         </ImageInput>

    let istyle = [count ? styles.photoButton : styles.itemButton, {marginHorizontal: 10, borderBottomColor: lcolor}]

    return (
      <View key={this.getNextKey()}>
        <View style={istyle} ref={bl.name}>
          <View style={styles.items}>
            {actionableItem}
            <ImageInput
                prop={bl}
                underlayColor='transparent' style={[{flex: 1, position: 'absolute', right: 0}, count ? {marginTop: 15} : {marginTop: 15, paddingBottom: 7}]}
                onImage={item => this.onAddItem(bl.name, item)}>
              {counter}
            </ImageInput>
          </View>
        </View>
        {error}
      </View>
    );
  }
  onEndEditing(prop, event) {
    if (this.state.resource[prop]  ||  event.nativeEvent.text.length)
      this.state.resource[prop] = event.nativeEvent.text;
  }
  onChange(value, properties) {
    if (!properties)
      return
    properties.forEach((p) => {
      this.state.resource[p] = value[p];
    })
  }

  onSubmitEditing(msg) {
    msg = msg ? msg : this.state.userInput;
    var assets = this.state.selectedAssets;
    var isNoAssets = utils.isEmpty(assets);
    if (!msg  &&  isNoAssets)
      return;
    var me = utils.getMe();
    var resource = {from: utils.getMe(), to: this.props.resource.to};
    var model = this.props.model;

    var toName = utils.getDisplayName(resource.to, utils.getModel(resource.to[constants.TYPE]).value.properties);
    var meta = utils.getModel(me[constants.TYPE]).value.properties;
    var meName = utils.getDisplayName(me, meta);
    var modelName = constants.TYPES.SIMPLE_MESSAGE;
    var value = {
      message: msg
              ?  model.isInterface ? msg : '[' + msg + '](' + model.id + ')'
              : '',

      from: {
        id: utils.getId(me),
        title: meName
      },
      to: {
        id: utils.getId(resource),
        title: toName
      },

      time: new Date().getTime()
    }
    value[constants.TYPE] = modelName;
    if (this.props.context)
      value._context = this.props.context

    if (!isNoAssets) {
      var photos = [];
      for (var assetUri in assets)
        photos.push({url: assetUri, title: 'photo'});

      value.photos = photos;
    }
    this.setState({userInput: '', selectedAssets: {}});
    Actions.addMessage({msg: value}); //, this.state.resource, utils.getModel(modelName).value);
  }
}
reactMixin(NewResource.prototype, Reflux.ListenerMixin);
reactMixin(NewResource.prototype, NewResourceMixin);
reactMixin(NewResource.prototype, ResourceMixin);
NewResource = makeResponsive(NewResource)

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  noItemsText: {
    fontSize: 20,
    color: '#AAAAAA',
    // alignSelf: 'center',
    // paddingLeft: 10
  },
  itemsText: {
    fontSize: 20,
    color: '#000000',
    // alignSelf: 'center',
    paddingLeft: 10
  },
  itemsCounterEmpty: {
    paddingHorizontal: 5
  },
  itemsCounter: {
    borderColor: '#2E3B4E',
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
    paddingHorizontal: 5,
  },
  itemButton: {
    height: 60,
    marginLeft: 10,
    // marginLeft: 10,
    borderColor: '#ffffff',
    borderBottomColor: '#b1b1b1',
    borderBottomWidth: 1,
    paddingBottom: 10,
    justifyContent: 'flex-end',
  },
  photoButton: {
    marginLeft: 10,
    borderColor: '#ffffff',
    borderBottomColor: '#b1b1b1',
    borderBottomWidth: 1,
    // paddingBottom: 5,
  },

  photoBG: {
    // marginTop: -15,
    alignItems: 'center',
    paddingBottom: 10,
    // backgroundColor: '#245D8C'
  },
  err: {
    // paddingVertical: 10,
    flexWrap: 'wrap',
    paddingHorizontal: 25,
    fontSize: 16,
    color: 'darkred',
  },
  getStartedText: {
    // color: '#f0f0f0',
    color: '#eeeeee',
    fontSize: 20,
    fontWeight:'300',
    alignSelf: 'center'
  },
  getStarted: {
    backgroundColor: '#467EAE', //'#2892C6',
    paddingVertical: 10,
    marginLeft: 10,
    alignSelf: 'stretch',
  },
  thumbButton: {
    marginTop: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width:  40,
    height: 40,
    marginRight: 2,
    borderRadius: 5
  },
  error: {
    marginTop: -10,
    backgroundColor: 'transparent'
  },
  errorText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#a94442'
  },
  items: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activePropTitle: {
    fontSize: 12,
    marginTop: 20,
    paddingBottom: 5,
    // marginBottom: 5,
    color: '#bbbbbb'
  },
  photoStrip: {
    paddingBottom: 5
  },
  photoStripItems: {
    flexDirection: 'row'
  },
  logo: {
    opacity: 0.7,
    alignSelf: 'flex-end',
  },
  submitButton: {
    paddingBottom: 30,
    justifyContent: 'center',
    alignSelf: 'center'
  }
})

module.exports = NewResource;
  // showChoice(prop) {
  //   var self = this;
  //   ImagePicker.showImagePicker({
  //     returnIsVertical: true,
  //     chooseFromLibraryButtonTitle: utils.isSimulator() || prop._allowPicturesFromLibrary ? 'Choose from Library' : null,
  //     takePhotoButtonTitle: utils.isSimulator() ? null : 'Take Photo…',
  //     quality: utils.imageQuality
  //   }, (response) => {
  //     if (response.didCancel)
  //       return;
  //     if (response.error) {
  //       console.log('ImagePickerManager Error: ', response.error);
  //       return
  //     }
  //     var item = {
  //       // title: 'photo',
  //       url: 'data:image/jpeg;base64,' + response.data,
  //       isVertical: response.isVertical,
  //       width: response.width,
  //       height: response.height,
  //       chooseFromLibraryButtonTitle: ''
  //     };
  //     self.onAddItem('photos', item);
  //   });
  // }
