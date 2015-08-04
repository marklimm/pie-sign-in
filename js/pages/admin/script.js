
require.config({
    baseUrl: 'js/',
    paths: {

        //  third-party libraries
        'jquery': 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min',
        'knockout': 'lib/knockout/knockout-2.1.0',
        'underscore': 'lib/underscore/underscore-min',
        'parse': 'http://www.parsecdn.com/js/parse-1.1.15.min',
        'firebase': 'https://cdn.firebase.com/v0/firebase',
        'jqueryui': 'http://code.jquery.com/ui/1.10.0/jquery-ui',
        'touchpunch': 'lib/touchpunch/jquery.ui.touch-punch.min',

        'bootstrapTooltip': 'lib/bootstrap/bootstrap-tooltip.min',

        //  viewmodel objects
        'adminVM': 'pages/admin/viewModel',
        'authentication': 'viewModel/Authentication',
        'parseAccess': 'viewModel/ParseAccess',
        //'firebaseAccess': 'viewModel/FirebaseAccess',
        'contactSaver': 'viewModel/ContactSaver',
        'dataRetriever': 'viewModel/DataRetriever',
        'person': 'viewModel/person',
        'pod': 'viewModel/pod'

    },

    shim: {

        'jqueryui': ['jquery'],
        'touchpunch': ['jqueryui'],
        'bootstrapTooltip': ['jqueryui']
    },

    urlArgs: "r_01-19-14"
});


require(['adminVM', 'authentication', 'person', 'knockout', 'jquery', 'bootstrapTooltip', 'jqueryui', 'touchpunch'], function (AdminVM, Authentication, Person, ko) {

    var auth = new Authentication();
    var vm = new AdminVM();


    $(document).ready(function () {

        if (!auth.userHasAccessToPage()) { return false; }

        
        vm.retrieveDataFromBackends();
        


        //setTooltips();

        ko.applyBindings(vm);


    });


/*  removing tooltips because I don't think we need them
    function setTooltips() {


        $('#btnDeleteMemory').tooltip({
            title: 'Delete pod data from memory',
            placement: 'bottom'
        });

        $('#btnLogout').tooltip({
            title: 'Logout in order to prevent access to this page',
            placement: 'left'
        });

        $('#btnSaveToDB').tooltip({
            title: 'Clicking this will update the contacts database given the above information.  This button should be pressed only once after everyone has signed in.',
            placement: 'right'
        });

    }
*/

});