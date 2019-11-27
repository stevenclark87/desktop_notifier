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
          if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            location.reload();
          } else if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
          } else {
            console.log(this.responseText);
          }
        }
        xhttp.open("POST", "https://89e70098-6a0f-476a-adf7-dbf145c4b0b8.trayapp.io", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(reqBody));