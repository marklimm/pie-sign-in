
define(['person', 'parseAccess', 'pod', 'underscore'], function (Person, ParseAccess, Pod) {

    return function DataRetriever() {

        var self = this;


        var parseAccess = new ParseAccess();




        self.retrievePodLeadersFromDB = function(everyoneArray) {


            //  I'm referring to the Parse Person instance as "ParsePerson", not to confuse the browser with "Person" which is the KO viewmodel instance
            var ParsePerson = parseAccess.getParsePerson();



            var query = new Parse.Query(ParsePerson);
            query.equalTo("isPodLeader", true)
            query.ascending("name");
            query.find({
                success: function (results) {

                    _.each(results, function (result) {

                        var person = result._serverData;

                        var p = new Person(person.name, person.email, person.phone, person.firstTime, person.whereFrom, 'NO', person.isPodLeader);
                        
                        everyoneArray.push(p);


                    });


                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });

            return query;
        }


        self.retrieveRegularPeopleFromFirebase = function(everyoneArray) {

            

            peopleRef.on('child_added', function (msgSnapshot) {

                var personToAdd = convertToPerson(msgSnapshot);

                everyoneArray.push(personToAdd);

            });

            peopleRef.on('child_changed', function(msgSnapshot){

                var msgData = msgSnapshot.val();

                if(msgData.isInPod){

                    var person = _.find(everyoneArray(), function(person){ return person.name === msgData.name; });

                    //  specify that the person is now in a pod
                    person.isInPod(true);
                }
            });

            peopleRef.on('child_removed', function (msgSnapshot) {

                var emailToRemove = msgSnapshot.val().email;
                everyoneArray.remove(function (person) { return person.email === emailToRemove });

            });

        }

        self.retrievePodsFromFirebase = function(everyoneArray, podsArray, draggingHasStarted){


            

            //  event handler for when pods are read from firebase
            podsRef.on('child_added', function(msgSnapshot){

                var msgData = msgSnapshot.val();

                var podLeaderToAdd = _.find(everyoneArray(), function(podLeader){
                    return podLeader.name === msgData.podLeader;
                })


                var podToAdd = new Pod(podLeaderToAdd);
                podToAdd.firebaseRef = msgSnapshot.ref();
                podsArray.push(podToAdd);



                //  event handler for when pod members are read in for this pod
                podToAdd.firebaseRef.child('podMembers').ref()
                    .on('child_added', function(msgSnapshot){

                        var msgData = msgSnapshot.val();

                        var podMemberBeingAdded = _.find(everyoneArray(), function(person){
                            return person.name === msgData.name;
                        })

                        podMemberBeingAdded.inPodFirebaseRef = msgSnapshot.ref();

                        if(!draggingHasStarted()){
                            //  this real-time "add" is the result of reading from firebase, then add the pod member to the array

                            podToAdd.podMembers.push(podMemberBeingAdded);
                        }
                        else{
                            //  whereas if the add is the result of a move, we don't add to the array, since the drag and drop element takes care of the UI

                        }

                        
                    });

/*  not necessary to implement this, since the drag and drop action "removes" a person from a pod
                    .on('child_removed', function(msgSnapshot){

                        podToAdd.
                    });
*/

            });



        }




        function convertToPerson(msgSnapshot) {

            var msgData = msgSnapshot.val();
            var person = new Person(msgData.name, msgData.email, msgData.phone, msgData.firstTime, msgData.whereFrom, msgData.willingToDrive, false);
            person.firebaseRef = msgSnapshot.ref();

            person.isInPod(msgData.isInPod);

            return person;
        }


    };

});