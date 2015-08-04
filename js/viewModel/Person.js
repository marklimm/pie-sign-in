
define(['knockout', 'firebase', 'underscore'], function (ko) {

    var usersSavedToFireBase = [];

    return function Person(name, email, phone, firstTime, whereFrom, willingToDrive, isPodLeader) {

        var self = this;

        self.name = name;
        self.email = email;
        self.phone = phone;
        self.firstTime = firstTime;
        self.whereFrom = whereFrom;
        self.willingToDrive = willingToDrive;


        self.shouldNotBeInPod = ko.observable(false);
        self.isPodLeader = ko.observable(isPodLeader);
        //self.isStraggler = ko.observable(false);
        self.isInPod = ko.observable(true);


        self.inPodFirebaseRef = null;

        var privateVar = 'something';

        self.displayName = ko.computed(function(){

            return self.willingToDrive === 'YES' ? self.name + " (DRIVER)" : self.name;

        });


        self.toggleLeaderStatus = function(){

            self.isPodLeader(!self.isPodLeader());
            
        }


        self.toggleInPodStatus = function(){

            self.shouldNotBeInPod(!self.shouldNotBeInPod());
            
        }


        self.nameBlur = function () {
            
            //  60 seconds should be long enough for people to enter in their contact info
            setTimeout(self.timeToSave, 60000);
        }

        self.timeToSave = function () {

            if (inputIsValid()) {

                saveToFirebase();
            }

        }


        function saveToFirebase() {

            
            usersSavedToFireBase.push(self.name);


            

            peopleRef.push({
                'name': self.name,
                'email': self.email,
                'phone': self.phone,
                'firstTime': self.firstTime !== undefined ? self.firstTime : '',
                'whereFrom': self.whereFrom !== undefined ? self.whereFrom : '',
                'willingToDrive': self.willingToDrive !== undefined ? self.willingToDrive : null,
                'isInPod': false
                }, function () {
                    //  this success event handler doesn't always fire
                    //alert("success: " + success);

                
            });


            //var pushedName = newPersonRef.name();

        }

        function inputIsValid() {

            var name = $.trim(self.name);

            if (name === '') { return false; }

            
            return !userAlreadySavedToFirebase(name);
        }

        function userAlreadySavedToFirebase(name) {

            return _.find(usersSavedToFireBase, function (userName) { return userName === name; });
        }

    };

});