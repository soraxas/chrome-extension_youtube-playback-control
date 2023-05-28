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
    name = channelLink.text;
    idSegments = new URL(channelLink.href).pathname.split('/');
    id = idSegments.pop() || idSegments.pop()

    return [name, id];
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
                browser.runtime.sendMessage({type: 'updateIcon', speed});
                document.getElementsByTagName('video')[0].playbackRate = speed;
            })
        });
    }

    // Try it a few times to account for load times
    if (!has_channel_info && retry_count < MAX_RETRY)
        setTimeout(applyDefaultSpeed, 500, retry_count + 1);
}


applyDefaultSpeed();
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'applyDefaultSpeed') {
        setTimeout(applyDefaultSpeed, 1500);
    }

    if (message.type === 'getChannelID') {
        console.log('Channel ID Request', channelID);
        sendResponse(channelID);
    }
    console.log('message', message);
});
