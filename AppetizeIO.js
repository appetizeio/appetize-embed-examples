/* AppetizeIO.js library v0.0.2 */
var baseUrl = 'https://appetize.io';
var getIsLoadedInterval;

class AppetizeIO {
    constructor() {
        this.baseUrl = baseUrl;
        this.libraryFrame = document.getElementById('libraryFrame');
    }

    setBaseUrl = (baseUrl) => {
        this.baseUrl = baseUrl;
        setIframeUrl(this.baseUrl);
    }

    getBaseUrl = () => {
        return this.baseUrl;
    }

    client = async () => {
        return this;
    }

    load = async (newBaseUrl) => {
        if (newBaseUrl) {
            console.log('Setting instance to ' + newBaseUrl);
            setIframeUrl(newBaseUrl);
        }
        getIsLoadedInterval = setInterval(function () {
            this.libraryFrame.contentWindow.postMessage('getIsLoaded', '*');
        }, 500);
        return new Promise((resolve, reject) => {
            resolveWhenReady('isLoaded', resolve);
        });
    }
    
    getUser = async () => {
        this.libraryFrame.contentWindow.postMessage('getUser', '*');
        return new Promise((resolve, reject) => {
            resolveWhenReady('user', resolve);
        });
    };
    
    getDevices = async () => {
        return axios.get(baseUrl + '/available-devices').then(function (data) {
            if (data && data.data) return data.data;
            else throw Error('Failed to get devices');
        });
    };
    
    getApps = async () => {
        this.libraryFrame.contentWindow.postMessage('getApps', '*');
        return new Promise((resolve, reject) => {
            resolveWhenReady('apps', resolve);
        });
    };
    
    getLoginUrl = async () => {
        this.libraryFrame.contentWindow.postMessage('getLoginUrl', '*');
        return new Promise((resolve, reject) => {
            resolveWhenReady('loginUrl', resolve);
        }).then(function (loginUrl) {
            return loginUrl + '?redirectTo=' + window.location.href;
        });
    };
}

// var user = await AppetizeIO.getUser();
// var devices = await AppetizeIO.getDevices();
// var apps = await AppetizeIO.getApps();
// var loginUrl = await AppetizeIO.getLoginUrl();

function setup() {
    setupIframe();
    AppetizeIO = new AppetizeIO();
}

function setIframeUrl(baseUrl) {
    var ifrm = document.getElementById('libraryFrame');
    ifrm.setAttribute('src', baseUrl + '/library');
}

function setupIframe() {
    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', 'libraryFrame'); // assign an id
    ifrm.setAttribute('src', baseUrl + '/library');
    ifrm.style.display = 'none';
    document.body.appendChild(ifrm); // to place at end of document
}

function resolveWhenReady(type, resolve) {
    var messageEventHandler = function (event) {
        if (!event.data || !event.data.type) {
            console.log('Invalid postMessage received');
            return;
        }
        if (event.data.type == type) {
            if (type === 'isLoaded') clearInterval(getIsLoadedInterval);
            resolve(event.data.data);
        }
    };
    window.addEventListener('message', messageEventHandler, false);
}

if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
    setup();
} else {
    document.addEventListener('DOMContentLoaded', setup);
}
