
require.config({
    baseUrl: 'js/',
    paths: {

        //  third-party libraries
        'jquery': 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min',
        'knockout': 'lib/knockout/knockout-2.1.0',
        'underscore': 'lib/underscore/underscore-min',
        'parse': 'http://www.parsecdn.com/js/parse-1.1.15.min',
        'firebase': 'https://cdn.firebase.com/v0/firebase',


        //  viewmodel objects
        'loginVM': 'pages/login/viewModel',
        'authentication': 'viewModel/Authentication',
        'parseAccess': 'viewModel/ParseAccess',
        'person': 'viewModel/person',

        
        

    },

    urlArgs: "r1"
});

require(['loginVM', 'knockout', 'jquery'], function (LoginVM, ko) {

    var vm = new LoginVM();

    $(document).ready(function () {


        submitOnEnterKeyPress();

        ko.applyBindings(vm);

    });

    function submitOnEnterKeyPress() {

        $("#txtPassword").keyup(function (event) {
            if (event.keyCode == 13) {
                $("#btnLogin").click();
            }
        });
    }

});