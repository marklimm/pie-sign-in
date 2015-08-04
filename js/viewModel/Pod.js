
define(['knockout'], function (ko) {


    return function Pod(podLeader) {

        var self = this;

        self.podLeader = ko.observable(podLeader);
        self.podMembers = ko.observableArray();

        
        self.firebaseRef = null;


    };
    
});