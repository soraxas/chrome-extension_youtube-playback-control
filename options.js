if (typeof browser === "undefined") {
    var browser = chrome;
}
const options = {
    'step-size': ['stepSize', 0.1, parseFloat],
    'default-speed': ['defaultSpeed', 1.0, parseFloat],
};

// Initialize fields with database entries
for (let id in options) {
    let [name, defaultValue, _] = options[id];
    browser.storage.local.get(name, function(result) {
        document.getElementById(id).value = result[name] || defaultValue;
    });
}

function processForm(e) {
    if (e.preventDefault) {e.preventDefault();}

    // Save user selections
    let selections = {};
    for (let id in options) {
        let [name, defaultValue, parser] = options[id];
        let value = parser(document.getElementById(id).value) || defaultValue;
        selections[name] = value;
    }
    browser.storage.local.set(selections, function() {
        console.log('User preferences updated.');
    });
    return false;
}

let form = document.getElementById('options-form');
if (form.attachEvent) {
    form.attachEvent('submit', processForm);
} else {
    form.addEventListener('submit', processForm);
}
