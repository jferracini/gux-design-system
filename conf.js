exports.config = {
    framework: 'jasmine',
    plugins: [{
        package: 'protractor-screenshoter-plugin',
        screenshotPath: './REPORTS/e2e',
        screenshotOnExpect: 'failure+success',
        screenshotOnSpec: 'none',
        withLogs: 'true',
        writeReportFreq: 'asap',
        clearFoldersBeforeTest: true
    }],

    onPrepare: function() {
        // returning the promise makes protractor wait for the reporter config before executing tests 
        return global.browser.getProcessedConfig().then(function(config) {
            //it is ok to be empty 
        });
    },
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['todo-spec.js'],
    multiCapabilities: [{
            browserName: 'firefox'
        },
        {
            browserName: 'chrome',
            'chromeOptions': {
                'args': ['show-fps-counter=true']
            }
        },
        {
            browserName: 'safari'
        }
    ]
}