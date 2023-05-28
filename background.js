if (typeof browser === "undefined") {
    var browser = chrome;
}

chrome.runtime.onInstalled.addListener(function(){
    chrome.action.disable(); // disable by default!

    const pageUrl = {hostSuffix: '.youtube.com'};
    const {
        onPageChanged,
        PageStateMatcher,
        ShowAction,
    } = chrome.declarativeContent;

    onPageChanged.removeRules(undefined, function(){
        onPageChanged.addRules([{
            conditions: [new PageStateMatcher({pageUrl})],
            actions: [new ShowAction()]
        }]);
    });
});


// chrome.runtime.onInstalled.addListener(() => {
//   // Page actions are disabled by default and enabled on select tabs
//   chrome.action.disable();

//   // Clear all rules to ensure only our expected rules are set
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
//     // Declare a rule to enable the action on example.com pages
//     let exampleRule = {
//       conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//           pageUrl: {hostSuffix: '.youtube.com'},
//         })
//       ],
//       actions: [new chrome.declarativeContent.ShowAction()],
//     };

//     // Finally, apply our new array of rules
//     let rules = [exampleRule];
//     chrome.declarativeContent.onPageChanged.addRules(rules);
//   });
// });


// Apply default speed when new video loaded
browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (!tab.url)
        return;

    // const match = tab.url.match(/^https?:\/\/(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/);
    if (!tab.url.match(/^https?:\/\/(?:[^@\/\n]+@)?(?:.*[.])?youtube.com/))
        return;

    if (changeInfo.status == 'loading')
        updateIcon(tab.id, {});

    // if (changeInfo.url && (changeInfo.status == 'complete')) {
    if (changeInfo.status == 'complete') {
        console.log(">>complete");
        browser.tabs.sendMessage(tabId, {type: 'applyDefaultSpeed'});
    }
}
// chrome doesn't support filter??
// , {urls: ['*://*.youtube.com/*']}
);




function updateIcon(tabId, message) {
    if (!message.speed)
        browser.action.setBadgeText({ text: `...`, tabId: tabId });
    else {

        browser.action.setBadgeText({ text: `x${message.speed}`, tabId: tabId });
    }
    return;
    iconPath = (size) => ('icons/page-action/' + index + '-' + size + '.png');
    browser.pageAction.setTitle({
        title: 'Playback Speed: ' + (index/10).toFixed(1) + '×',
        tabId
    });
    browser.pageAction.setIcon({
        path: {
            "19": iconPath(19),
            "38": iconPath(38)
        },
        tabId
    });
}

browser.runtime.onMessage.addListener(function(message, sender) {
    if (message.type === 'updateIcon') {
        // update to specific speed
        if (sender.tab) {
            updateIcon(sender.tab.id, message);
        } else {
            browser.tabs.query({active:true, currentWindow:true}, function(tabs) {
                updateIcon(tabs[0].id, message);
            });
        }
    }
});
