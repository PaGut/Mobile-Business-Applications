/* wesentlicher JavaScript handler */

var app = {

    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener('pause', this.onPause.bind(this), false);
        document.addEventListener('resume', this.onResume.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
        screen.orientation.lock('portrait');
    },
    onResume: function () {
        console.log("do handling after app is activated again");
    },
    onPause: function () {
        console.log("do handling after app is paused");
    },


    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);


        // 1.  Listen to events
        var bgGeo = window.BackgroundGeolocation;

        bgGeo.onLocation(function (location) {
            console.log('[location] -', location);
        });

        bgGeo.onMotionChange(function (event) {
            console.log('[motionchange] -', event.isMoving, event.location);
        });

        bgGeo.onHttp(function (response) {
            console.log('[http] - ', response.success, response.status, response.responseText);
        });

        bgGeo.onProviderChange(function (event) {
            console.log('[providerchange] -', event.status, event.enabled, event.gps, event.network);
        });

        // 2. Execute #ready method:
        bgGeo.ready({
            reset: true,
            debug: true,
            logLevel: bgGeo.LOG_LEVEL_VERBOSE,
            desiredAccuracy: bgGeo.DESIRED_ACCURACY_HIGH,
            distanceFilter: 10,
            url: 'http://my.server.com/locations',
            autoSync: true,
            stopOnTerminate: false,
            startOnBoot: true
        }, function (state) {    // <-- Current state provided to #configure callback
            // 3.  Start tracking
            console.log('BackgroundGeolocation is configured and ready to use');
            if (!state.enabled) {
                bgGeo.start().then(function () {
                    console.log('- BackgroundGeolocation tracking started');
                });
            }
        });


    }
};

function speechRecognition() {

    // Verify if recognition is available
    window.plugins.speechRecognition.isRecognitionAvailable(function (available) {
        if (!available) {
            console.log("Sorry, not available");
        }

        // Check if has permission to use the microphone
        window.plugins.speechRecognition.hasPermission(function (isGranted) {
            if (isGranted) {
                alert("Granted");
                startRecognition();
            } else {
                // Request the permission
                window.plugins.speechRecognition.requestPermission(function () {
                    // Request accepted, start recognition
                    startRecognition();
                }, function (err) {
                    console.log(err);
                });
            }
        }, function (err) {
            console.log(err);
        });
    }, function (err) {
        console.log(err);
    });
}

function callNumber() {

    function onSuccess(result) {
        alert("Success:" + result);
    }

    function onError(result) {
        alert("Error:" + result);
    }

    var number = "016092351609";
    window.plugins.CallNumber.callNumber(onSuccess, onError, number, false);

}

function stopRecognition() {
    alert("Stopped");
    window.plugins.speechRecognition.stopListening(function () {
        // No more recognition
    }, function (err) {
        console.log(err);
    });
}

// Handle results
function startRecognition() {
    alert("Started");
    window.plugins.speechRecognition.startListening(function (result) {
        // Show results in the console
        alert(result);
    }, function (err) {
        console.error(err);
    }, {
            language: "en-US",
            showPopup: true,
            matches: 1
        });
}

function openCamera() {

    function onSuccess(imageURI) {
        var image = document.getElementById('myImage');
        image.src = imageURI;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI
    });
}

function getCurrentPosition() {

    // onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    function onSuccess(position) {
        alert("Success");
        alert('Latitude: ' + position.coords.latitude + '\n' +
            'Longitude: ' + position.coords.longitude + '\n' +
            'Altitude: ' + position.coords.altitude + '\n' +
            'Accuracy: ' + position.coords.accuracy + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
            'Heading: ' + position.coords.heading + '\n' +
            'Speed: ' + position.coords.speed + '\n' +
            'Timestamp: ' + position.timestamp + '\n');
    }

    // onError Callback receives a PositionError object
    function onError(error) {
        alert("Error");
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

}

function scanBarcode() {

    cordova.plugins.barcodeScanner.scan(
        function (result) {
            alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
        },
        function (error) {
            alert("Scanning failed: " + error);
        },
        {
            preferFrontCamera: false, // iOS and Android
            showFlipCameraButton: true, // iOS and Android
            showTorchButton: true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            // saveHistory: true, // Android, save scan history (default false)
            // prompt : "Place a barcode inside the scan area", // Android
            // resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            // formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
            orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
            // disableAnimations : true, // iOS
            disableSuccessBeep: true // iOS and Android
        }
    );
}



var callback = function (buttonIndex) {
    setTimeout(function () {
        // like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1)
        alert('button index clicked: ' + buttonIndex);

        // share directly with facebook
        if (buttonIndex === 1) {
            window.plugins.socialsharing.shareViaFacebook('Message via Facebook', null /* img */, null /* url */,
                function () {
                    console.log('share ok')
                }, function (errormsg) {
                    alert(errormsg)
                })
        }

        // else offer ever platform for sharing

        // this is the complete list of currently supported params you can pass to the plugin (all optional)
        var options = {
            message: 'share this', // not supported on some apps (Facebook, Instagram)
            subject: 'the subject', // fi. for email
            files: ['', ''], // an array of filenames either locally or remotely
            url: 'https://www.website.com/foo/#bar?a=b',
            chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title,
            appPackageName: 'com.apple.social.facebook' // Android only, you can provide id of the App you want to share with
        };

        var onSuccess = function (result) {
            console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
            console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        };

        var onError = function (msg) {
            console.log("Sharing failed with message: " + msg);
        };

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    });
};

function executeFingerPrint() {

    window.plugins.touchid.isAvailable(
        function (type) {
            alert(type)
            window.plugins.touchid.verifyFingerprintWithCustomPasswordFallback(
                'Scan your fingerprint please', // this will be shown in the native scanner popup
                function (msg) { alert('ok: ' + msg) }, // success handler: fingerprint accepted
                function (msg) { alert('not ok: ' + JSON.stringify(msg)) } // error handler with errorcode and localised reason
            );
        }, // type returned to success callback: 'face' on iPhone X, 'touch' on other devices
        function (msg) { alert('not available, message: ' + msg) } // error handler: no TouchID available
    );
}

// test share sheet for facebook etc.
function testShareSheet() {
    var options = {
        androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // default is THEME_TRADITIONAL
        title: 'What do you want with this image?',
        subtitle: 'Choose wisely, my friend', // supported on iOS only
        buttonLabels: ['Share via Facebook', 'Share via Twitter'],
        androidEnableCancelButton: true, // default false
        winphoneEnableCancelButton: true, // default false
        addCancelButtonWithLabel: 'Cancel',
        addDestructiveButtonWithLabel: 'Delete it',
        position: [20, 40], // for iPad pass in the [x, y] position of the popover
        destructiveButtonLast: true // you can choose where the destructive button is shown
    };
    // Depending on the buttonIndex, you can now call shareViaFacebook or shareViaTwitter
    // of the SocialSharing plugin (https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin)
    window.plugins.actionsheet.show(options, callback);
};


// Function for Calendar testing
var title = 'My Event Title';
var loc = 'My Event Location';
var notes = 'My interesting Event notes.';
var startDate = new Date();
var endDate = new Date();
var calendarName = 'MyCal';
var options = {
    url: 'https://github.com/EddyVerbruggen/Calendar-PhoneGap-Plugin',
    calendarName: calendarName, // iOS specific
    calendarId: 1 // Android specific
};

// clean up the dates a bit
startDate.setMinutes(0);
endDate.setMinutes(0);
startDate.setSeconds(0);
endDate.setSeconds(0);

// add a few hours to the dates, JS will automatically update the date (+1 day) if necessary
startDate.setHours(startDate.getHours() + 2);
endDate.setHours(endDate.getHours() + 3);

function onSuccess(msg) {
    alert('Calendar success: ' + JSON.stringify(msg));
}

function onError(msg) {
    alert('Calendar error: ' + JSON.stringify(msg));
}

function hasReadPermission() {
    window.plugins.calendar.hasReadPermission(onSuccess);
}

function requestReadPermission() {
    window.plugins.calendar.requestReadPermission(onSuccess);
}

function hasWritePermission() {
    window.plugins.calendar.hasWritePermission(onSuccess);
}

function requestWritePermission() {
    window.plugins.calendar.requestWritePermission(onSuccess);
}

function hasReadWritePermission() {
    window.plugins.calendar.hasReadWritePermission(onSuccess);
}

function requestReadWritePermission() {
    window.plugins.calendar.requestReadWritePermission(onSuccess);
}

function openCalendar() {
    // today + 3 days
    var d = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    window.plugins.calendar.openCalendar(d, onSuccess, onError);
}

function listCalendars() {
    window.plugins.calendar.listCalendars(onSuccess, onError);
}

function createCalendar() {
    var options = window.plugins.calendar.getCreateCalendarOptions();
    options.calendarName = "MyCordovaCalendar";
    options.calendarColor = "#FF0000"; // red
    window.plugins.calendar.createCalendar(options, onSuccess, onError);
}

function deleteCalendar() {
    window.plugins.calendar.deleteCalendar("MyCordovaCalendar", onSuccess, onError);
}

function deleteEvent() {
    window.plugins.calendar.deleteEvent(title, loc, notes, startDate, endDate, onSuccess, onError);
}

function createCalendarEvent() {
    window.plugins.calendar.createEvent(title, loc, notes, startDate, endDate, onSuccess, onError);
}

function createCalendarEventInteractively() {
    window.plugins.calendar.createEventInteractively(title, loc, notes, startDate, endDate, onSuccess, onError);
}

function createCalendarEventInteractivelyWithOptions() {
    window.plugins.calendar.createEventInteractivelyWithOptions(title, loc, notes, startDate, endDate, options, onSuccess, onError);
}

function createCalendarEventWithOptions() {
    window.plugins.calendar.createEventWithOptions(title, loc, notes, startDate, endDate, options, onSuccess, onError);
}

function findEventWithFilter() {
    window.plugins.calendar.findEvent(title, loc, notes, startDate, endDate, onSuccess, onError);
}

function findEventNoFilter() {
    window.plugins.calendar.findEvent(null, null, null, startDate, endDate, onSuccess, onError);
}

function listEventsInRange() {
    startDate.setHours(startDate.getHours() - 12);
    window.plugins.calendar.listEventsInRange(startDate, endDate, onSuccess, onError);
}

window.onerror = function (msg, file, line) {
    alert(msg + '; ' + file + '; ' + line);
};

app.initialize();