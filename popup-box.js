const RATE_CODE = "document.getElementsByTagName('video')[0].playbackRate";
if (typeof browser === "undefined") {
    var browser = chrome;
}
function updateDefaultText(speed) {
    document.getElementById('current-default').textContent = '(Currently ' + speed + '×)';
}

function setSpeed() {
    speed = parseFloat(document.getElementById('speed-input').value);
    saveDefault = document.getElementById('save-default').checked;
    saveDefaultChannel = document.getElementById('save-default-channel').checked;

    // Get current channel ID
    browser.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    // browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0]) {
            alert("Can't get the current tab. Try to focus it by clicking");
            return;
        }
        const tab_id = tabs[0].id;

        // Save speed
        // browser.scripting.executeScript({
        //     target: {tabId: tab_id},
        //     func : (_speed) => {
        //         document.getElementsByTagName('video')[0].playbackRate = _speed;
        //     },
        //     args : [ speed ],
        // });
        browser.tabs.sendMessage(tab_id, {type: 'applySpecificSpeed', speed: speed});
        // browser.runtime.sendMessage({type: 'updateIcon', speed});

        // Store speed persistently if desired
        if (saveDefault) {
            browser.storage.local.set({defaultSpeed: speed}, function() {
                console.log('Default speed updated to ' + speed);
                updateDefaultText(speed);
            });
        }

        if (saveDefaultChannel) {
            chrome.tabs.sendMessage(tab_id, {type: 'getChannelID'}, function(channelID) {
                console.log('popup channel id', channelID);
                browser.storage.local.set({[channelID]: speed}, function() {
                    console.log('Default speed for channel ' + channelID + ' updated to ' + speed);
                });
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function(event) {
    let mainInput = document.getElementById('speed-input');

    console.log("heyheyyyyyyyyyyyy2222yy");

    // Register listener for "Set Speed" button click
    document.getElementById('speed-submit').onclick = setSpeed;
    if (typeof browser === "undefined") {
        var browser = chrome;
    }
    mainInput.addEventListener("keyup", function(e) {
        if (e.key === "Enter") {setSpeed();}
    });

    // console.log(tab);

// chrome.scripting.executeScript({
//   target: { tabId: tab.id },
//   func: () => {
//     // write your code here
//     console.log("heyheyyyyyyyyyyyyyy");
//   },
// });


//     (async () => {
//     const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
//     const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
//     // do something with response here, not outside the function
//     console.log(response);
//     })();


////////////////////////
    // Retrieve current speed and set popup's initial value
    browser.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
        if (!tabs[0])
            return;

        const tab_id = tabs[0].id;
        browser.scripting.executeScript({
            target: {tabId: tab_id},
            func : () => {
                return document.getElementsByTagName('video')[0].playbackRate;
            }
        }).then(injectionResults => {
            for (const {frameId, result} of injectionResults) {
                // console.log(`Frame ${frameId} result(rate):`, result);
                if (result)
                    mainInput.value = result;
            }
        });

        // browser.runtime.sendMessage({type: 'updateIcon', speed});
    });

    // Retrieve and display current default speed
    browser.storage.local.get('defaultSpeed', function(result) {
        updateDefaultText(result.defaultSpeed || 1.0);
    });

    // Retrieve and apply desired step size
    browser.storage.local.get('stepSize', function(result) {
        let stepSize = Math.max(result.stepSize || 0.1, 0.01);
        let min = 1 + (99 % Math.round(stepSize * 100)); // Necessary to avoid floating point errors
        mainInput.setAttribute('step', stepSize);
        mainInput.setAttribute('min', min / 100);
    });
});
