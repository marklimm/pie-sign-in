
define(['knockout'], function (ko) {


    return function indexVM() {

        var self = this;

        //  person objects used on the sign in page
        self.signinSheetPeople = ko.observableArray();


        self.yesNoOptions = ko.observableArray(['YES', 'NO']);
        self.whereFromOptions = ko.observableArray(['Arlington', 'Bethesda', 'Prince William', 'Silver Spring', 'Tysons', 'different church']);




    };

});