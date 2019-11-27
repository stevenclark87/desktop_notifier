  // [START get_messaging_object]
  // Retrieve Firebase Messaging object.
  const messaging = firebase.messaging();
  // [END get_messaging_object]
  // [START set_public_vapid_key]
  // Add the public key generated from the console here.
  messaging.usePublicVapidKey('BH1uhkr2WM8h1GBqSgw2atW-vnbcmh6IyctnfVIlBb0kmSzwsUJ3er2pbuVVDp5qR7zFG3h5OLNZluRi1R3ZFRo');
  // [END set_public_vapid_key]

  // IDs of divs that display Instance ID token UI or request permission UI.
  const tokenDivId = 'token_div';
  const coverDivId = 'cover_div';
  const permissionDivId = 'permission_div';
  const preferencesDivId = 'preferences_div';
  const headerNotifyBtn = 'header_notify_btn';
  const signupContainerDivId = document.getElementById("signupContainer");
  const footerDivId = document.getElementById("footerDiv");
  const thryvEmailElement = document.getElementById("thryvEmailField");

  thryvEmailElement.addEventListener("click", emailValidator());

  // [START refresh_token]
  // Callback fired if Instance ID token is updated.
  messaging.onTokenRefresh(() => {
    messaging.getToken().then((refreshedToken) => {
      console.log('Token refreshed.');
      // Indicate that the new Instance ID token has not yet been sent to the
      // app server.
      setTokenSentToServer(false);
      // Send Instance ID token to app server.
      sendTokenToServer(refreshedToken);
      // [START_EXCLUDE]
      // Display new Instance ID token and clear UI of all previous messages.
      resetUI();
      // [END_EXCLUDE]
    }).catch((err) => {
      console.log('Unable to retrieve refreshed token ', err);
      showToken('Unable to retrieve refreshed token ', err);
    });
  });
  // [END refresh_token]

  // [START receive_message]
  // Handle incoming messages. Called when:
  // - a message is received while the app has focus
  // - the user clicks on an app notification created by a service worker
  //   `messaging.setBackgroundMessageHandler` handler.
  messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    // [START_EXCLUDE]
    // Update the UI to include the received message.
    appendMessage(payload);
    // [END_EXCLUDE]
  });
  // [END receive_message]

  function resetUI() {
    clearMessages();
    showToken('loading...');
    // [START get_token]
    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messaging.getToken().then((currentToken) => {
      if (currentToken) {
        sendTokenToServer(currentToken);
        updateUIForPushEnabled(currentToken);
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
        // Show permission UI.
        updateUIForPushPermissionRequired();
        setTokenSentToServer(false);
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
      showToken('Error retrieving Instance ID token. ', err);
      setTokenSentToServer(false);
    });
    // [END get_token]
  }


  function showToken(currentToken) {
    // Show token in console and UI.
    var tokenElement = document.querySelector('#token');
    tokenElement.textContent = currentToken;
  }

  // Send the Instance ID token your application server, so that it can:
  // - send messages back to this app
  // - subscribe/unsubscribe the token from topics
  function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
      console.log('Sending token to server...');
      // TODO(developer): Send the current token to your server.
      setTokenSentToServer(true);
      const thryvEmailField = document.getElementById("thryvEmailField").value
      const endUserToken = document.getElementById("endUserToken").value
      const notificationsClientsField = document.getElementById("notificationsClientsField").checked
      const notificationsAppointmentsField = document.getElementById("notificationsAppointmentsField").checked
      const notificationsPaymentsField = document.getElementById("notificationsPaymentsField").checked
      const reqBody = {
          "thryv_email": thryvEmailField,
          "thryv_token": endUserToken,
          "instance_id": currentToken,
          "notifications": {
            "clients": notificationsClientsField,
            "payments": notificationsAppointmentsField,
            "appointments": notificationsPaymentsField
            }
        };
      console.log(reqBody);
      const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if(this.status == 200) {
          console.log(this.responseText);
          alert("You have succesfully subscribed")
          location.reload();
        } else {
            alert(`An Error Occurred: ${this.responseText}`);
          }
        }
      }
    xhttp.open("POST", "https://89e70098-6a0f-476a-adf7-dbf145c4b0b8.trayapp.io", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(reqBody));

    } else {

    const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
        const fmLookupResponse = JSON.parse(this.responseText);
        console.log(fmLookupResponse);
        document.getElementById("thryvIdField2").value = fmLookupResponse.thryv_id;
        document.getElementById("end_user_token2").value = fmLookupResponse.end_user_token;
        document.getElementById("notificationsClientsField2").checked = fmLookupResponse.clients;
        document.getElementById("notificationsAppointmentsField2").checked = fmLookupResponse.appointments;
        document.getElementById("notificationsPaymentsField2").checked = fmLookupResponse.payments;
      }
    }

    xhttp.open("GET", "https://7ee890b4-8e73-4522-8391-09c8aa6ae1f1.trayapp.io?iid=" + currentToken, true);
    xhttp.send();

    console.log('Token already sent to server so won\'t send it again ' +
          'unless it changes');

    }

  }

  function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
  }

  function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
  }

  function showHideDiv(divId, show) {
    const div = document.querySelector('#' + divId);
    if (show) {
      div.style = 'display: visible';
    } else {
      div.style = 'display: none';
    }
  }

  function validatesubscribeForm() {
  const thryvEmailFieldIsValidEmail = thryvEmailElement.classList.contains("invalidEmail");
  const thryvEmailField = thryvEmailElement.value;
  const endUserToken = document.getElementById("endUserToken").value
  const websiteField = document.getElementById("websiteField").value
  const notificationsClientsField = document.getElementById("notificationsClientsField").checked
  const notificationsAppointmentsField = document.getElementById("notificationsAppointmentsField").checked
  const notificationsPaymentsField = document.getElementById("notificationsPaymentsField").checked
  if (websiteField.length > 0) {
    alert("Bad Request");
    console.log("Bad Request")
    return false;
  } else if (thryvEmailField === "") {
    console.log(thryvEmailField);
    console.log("Valid email not entered for Thryv Email")
    alert("Valid email not entered for Thryv Email");
    return false;
  } else if (thryvEmailFieldIsValidEmail === true) {
      console.log("Valid email not entered for Thryv Email")
      alert("Valid email not entered for Thryv Email");
      return false;
  } else if (endUserToken === "") {
    console.log("Nothing entered for Token")
    alert("Nothing entered for Token");
    return false;
  } else if (notificationsClientsField == false && notificationsAppointmentsField == false && notificationsPaymentsField == false) {
    alert("You must subscribe to at least one notification");
    console.log("No checkboxes checked")
    return false;
  } else {
    console.log("Time to validate thryv info")
    validateThryvInfo();
  }
}

  function validateThryvInfo () {
        const thryvEmailField = document.getElementById("thryvEmailField").value
        const endUserToken = document.getElementById("endUserToken").value
        const reqBody = {
          "thryv_email": thryvEmailField,
          "thryv_token": endUserToken
        };
        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
              console.log(this.responseText);
              requestPermission();
            } else {
              alert("Thryv email or token are invalid");
            }
            }
          
        }
        xhttp.open("POST", "https://2ee306ab-aad5-469b-9b2c-ac73a10c44e4.trayapp.io", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(reqBody));
  }

function emailValidator() {
  const thryvEmailField = document.getElementById("thryvEmailField");
  const mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmailContent = document.getElementById("invalidEmailContent");
  thryvEmailField.oninput = function() {
     if (thryvEmailField.value.match(mailformat)) {
      console.log(thryvEmailField.value);
    thryvEmailField.classList.toggle("validEmail", true);
    thryvEmailField.classList.toggle("invalidEmail", false);
    invalidEmailContent.classList.toggle("hideItem", true);
    console.log("valid email format");
  } else {
    console.log(thryvEmailField.value);
    thryvEmailField.classList.toggle("invalidEmail", true);
    thryvEmailField.classList.toggle("validEmail"), false;
    invalidEmailContent.classList.toggle("hideItem", false);
    console.log("invalid email format")
  }
}
}

  function sendPreferencesForm() {
    messaging.getToken().then((currentToken) => {
      if (currentToken) {
        const thryvIdField2 = document.getElementById("thryvIdField2").value
        const endUserToken2 = document.getElementById("end_user_token2").value
        const notificationsClientsField2 = document.getElementById("notificationsClientsField2").checked
        const notificationsAppointmentsField2 = document.getElementById("notificationsAppointmentsField2").checked
        const notificationsPaymentsField2 = document.getElementById("notificationsPaymentsField2").checked
        const reqBody = {
          "thryv_id": thryvIdField2,
          "thryv_token": endUserToken2,
          "instance_id": currentToken,
          "notifications": {
            "clients": notificationsClientsField2,
            "payments": notificationsAppointmentsField2,
            "appointments": notificationsPaymentsField2
            }
        };
        console.log(reqBody);
        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 ) {
              if (this.status == 200) {
                console.log(this.responseText);
                alert("Your preferences have been updated succesfully")
              } else {
                  alert(`An Error Occurred: ${this.responseText}`);
              }
          }
        }
        xhttp.open("POST", "https://89e70098-6a0f-476a-adf7-dbf145c4b0b8.trayapp.io", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(reqBody));
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
      }
    });
  
}

  function requestPermission() {
    console.log('Requesting permission...');
    // [START request_permission]
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        //TODO(developer): Retrieve an Instance ID token for use with FCM.
        //[START_EXCLUDE]
        //In many cases once an app has been granted notification permission,
        //it should update its UI reflecting this.
        resetUI();
        // [END_EXCLUDE]
      } else {
        alert('Unable to get permission to notify.');
        console.log('Unable to get permission to notify.');
      }
    });
    // [END request_permission]
  }

  function deleteToken() {
    // Delete Instance ID token.
    // [START delete_token]
    messaging.getToken().then((currentToken) => {
      messaging.deleteToken(currentToken).then(() => {
        console.log('Token deleted.');
        setTokenSentToServer(false);
        // [START_EXCLUDE]
        // Once token is deleted update UI.
        resetUI();
        // [END_EXCLUDE]
      }).catch((err) => {
        console.log('Unable to delete token. ', err);
      });
      // [END delete_token]
    }).catch((err) => {
      console.log('Error retrieving Instance ID token. ', err);
      showToken('Error retrieving Instance ID token. ', err);
    });

  }

  // Add a message to the messages element.
  function appendMessage(payload) {
    const messagesElement = document.querySelector('#messages');
    const dataHeaderELement = document.createElement('h5');
    const dataElement = document.createElement('pre');
    dataElement.style = 'overflow-x:hidden;';
    dataHeaderELement.textContent = 'Received message:';
    dataElement.textContent = JSON.stringify(payload, null, 2);
    messagesElement.appendChild(dataHeaderELement);
    messagesElement.appendChild(dataElement);
  }

  // Clear the messages element of all children.
  function clearMessages() {
    const messagesElement = document.querySelector('#messages');
    while (messagesElement.hasChildNodes()) {
      messagesElement.removeChild(messagesElement.lastChild);
    }
  }

  function removeCSSClass (x, y) {
    x.classList.remove(y);
  }

  function addCSSClass (x, y) {
    x.classList.add(y);
  }

  function updateUIForPushEnabled(currentToken) {
    showHideDiv(tokenDivId, true);
    showHideDiv(permissionDivId, false);
    showHideDiv(preferencesDivId, true);
    showHideDiv(coverDivId, false);
    showHideDiv(headerNotifyBtn, false);
    showToken(currentToken);
    removeCSSClass(signupContainerDivId, "pushfooter");
    removeCSSClass(footerDivId, "footer_position");
  }

  function updateUIForPushPermissionRequired() {
    showHideDiv(tokenDivId, false);
    showHideDiv(permissionDivId, true);
    showHideDiv(preferencesDivId, false);
    showHideDiv(coverDivId, true);
    showHideDiv(headerNotifyBtn, true);
    addCSSClass(signupContainerDivId, "pushfooter");
    addCSSClass(footerDivId, "footer_position");
  }

  resetUI();