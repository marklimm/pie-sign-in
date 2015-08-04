

require.config({
    baseUrl: 'js/',
    paths: {

        //  third-party libraries
        'jquery': 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min',
        'knockout': 'lib/knockout/knockout-2.1.0',
        'underscore': 'lib/underscore/underscore-min',
        'firebase': 'https://cdn.firebase.com/v0/firebase',

        //  viewmodel objects
        'indexVM': 'pages/index/viewModel',
        'person': 'viewModel/person'    
        

    },

    urlArgs: "r1"
});


require(['indexVM', 'person', 'knockout', 'jquery'], function (IndexVM, Person, ko) {

    var vm = new IndexVM();

    $(document).ready(function () {

        fillOutFormWithBlanks();

        ko.applyBindings(vm);
    });

    function fillOutFormWithBlanks() {

        var numRowsToAddOn = 100;

        for (var i = 0; i < numRowsToAddOn; i++) {

            vm.signinSheetPeople.push(new Person('', '', '', '', '', '', false));
        }

    }

});