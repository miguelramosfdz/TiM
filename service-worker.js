'use strict';

// adapted from https://github.com/realtime-framework/ChromePushNotifications/blob/master/service-worker.js

// The service worker running in background to receive the incoming
// push notifications and user clicks

// A push has arrived ...
self.addEventListener('push', function (event) {
  // Since there is no payload data with the first version
  // of push messages, we'll use some static content.
  // However you could grab some data from
  // an API and use it to populate a notification

  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function (clientList) {
    if (clientList.length) {
      // rely on local Notification in no-push.js
      return;
    }

    var title = 'You have a message waiting!';
    var body = 'Click to open your Tradle tab';
    var icon = '/img/logo.png';
    var tag = 'tradle-app-notification-tag';
    return self.registration.showNotification(title, {
      body: body,
      icon: icon,
      tag: tag
    });
  }));
});

// The user has clicked on the notification ...
self.addEventListener('notificationclick', function (event) {
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function (clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if ( /*client.url == '/' && */'focus' in client) return client.focus();
    }

    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
});

// self.addEventListener('message', function(event) {
//   console.log("SW Received Message: " + event.data);
// })