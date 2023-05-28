channelID = '';
channelApplyDefaultSpeedRetry = 0;
if (typeof browser === "undefined") {
    var browser = chrome;
}
const MAX_RETRY = 20;

// Get channel ID
function getChannelInfo() {
    links = document.querySelectorAll('.ytd-channel-name a');
    if (links.length === 0) {return ['', ''];}

    channelLink = links[0];
    idSegments = new URL(channelLink.href).pathname.split('/');
    id = idSegments.pop() || idSegments.pop()

    return [channelLink.text, id];
}

function applySpeed(speed, show_icon) {
    if (show_icon)
        browser.runtime.sendMessage({type: 'updateIcon', speed: speed});
    document.getElementsByTagName('video')[0].playbackRate = speed;
}

// Applies the default speed to the main video element
function applyDefaultSpeed(retry_count) {
    retry_count = retry_count || 0;

    channelID = getChannelInfo()[1];
    const has_channel_info = (channelID.length > 0);

    if (retry_count == 0 || has_channel_info) {
        // Load appropriate default speed setting.
        browser.storage.local.get(channelID, function(channelResult) {
            browser.storage.local.get('defaultSpeed', function(result) {
                speed = (has_channel_info && channelResult[channelID]) || result.defaultSpeed || 1.0;
                console.log('Channel ID: ' + channelID + ' ; Applying default speed: ' + speed);
                applySpeed(speed, has_channel_info);
            })
        });
    }

    // Try it a few times to account for load times
    if (!has_channel_info && retry_count < MAX_RETRY)
        setTimeout(applyDefaultSpeed, 500, retry_count + 1);
}


applyDefaultSpeed();
browser.runtime.sendMessage({type: 'updateIcon', initialised: true});
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'applyDefaultSpeed') {
        setTimeout(applyDefaultSpeed, 1500);
    }

    else if (message.type === 'getChannelID') {
        console.log('Channel ID Request', channelID);
        sendResponse(channelID);
    }

    else if (message.type === 'applySpecificSpeed') {
        console.log('applySpecificSpeed Request');
        sendResponse(channelID);
        applySpeed(message.speed, true);
    }
    console.log('message', message);
});


(function inject(document) {
	'use strict'

	const s = document.createElement('script')
	s.src = chrome.extension.getURL('stop_auto_play.js')
	// s.async = true // it's async by default
	//s.onload = function onload() {
	//this.parentNode.removeChild(this)
	//	s = null // GC
	//}
	document.documentElement.appendChild(s)
})(window.document);
