
define(['person', 'pod', 'dataRetriever', 'contactSaver', 'authentication', 'knockout', 'underscore'], function (Person, Pod, DataRetriever, ContactSaver, Authentication, ko) {

    return function adminVM() {

		var self = this;

        
        var auth = new Authentication();
        var dataRetriever = new DataRetriever();
        var contactSaver = new ContactSaver();

        
        self.everyoneArray = ko.observableArray();
        self.pods = ko.observableArray();

        //  used when initially creating new pods.  Unlike self.pods(), this is NOT bound to the UI
        self.podsDuringSetup = [];



        //  is set to true when Aviel has started dragging people between pods.  Used to track whether the real-time onAddPodMember event handler should actually add to the pod array or not (because drag and drop handles moving a person between pods)
        self.draggingHasStarted = ko.observable(false);
        
        self.podToLeaveName = '';



        //  displays # of regular people that were saved to Parse after clicking the Save to Parse button
        self.numDBRecordsSaved = ko.observable(0);


        self.podLeaders = ko.computed(function () {
            var lst = _.filter(self.everyoneArray(), function (person) { return person.isPodLeader() && !person.shouldNotBeInPod(); });

            return _.sortBy(lst, function (person) { return person.name; });
        });

        
        self.regularPeople = ko.computed(function () {
            var lst = _.filter(self.everyoneArray(), function (person) { return !person.isPodLeader() && !person.shouldNotBeInPod(); });

            return _.sortBy(lst, function (person) { return person.name; });
        });

        self.peopleWhoShouldNotBeInAPod = ko.computed(function () {
            var lst = _.filter(self.everyoneArray(), function (person) { return person.shouldNotBeInPod(); });

            return _.sortBy(lst, function (person) { return person.name; });
        });

        self.stragglers = ko.computed(function () {
            var lst = _.filter(self.everyoneArray(), function (person) { return !person.isInPod() && !person.shouldNotBeInPod(); });

            return _.sortBy(lst, function (person) { return person.name; });
        });



        self.retrieveDataFromBackends = function() {

            dataRetriever.retrievePodLeadersFromDB(self.everyoneArray);


            dataRetriever.retrieveRegularPeopleFromFirebase(self.everyoneArray);


            //  need the timeout for waiting for everyoneArray to be populated 
            setTimeout(function(){

                dataRetriever.retrievePodsFromFirebase(self.everyoneArray, self.pods, self.draggingHasStarted);

                //  I need to set this timeout, otherwise the drag-and-drop won't work, I guess it has to wait for the data to be populated by firebase first before the jquery UI plugin will work
                setTimeout(function(){

                    //  set the pod lists to be sortable
                    makePodListsEditable();


                }, 1500)



            }, 2000)

        }






        self.assignPodsClicked = function () {

            //  clear out both the UI-bound list of pods and the array of pods used during setup
            self.pods([]);
            self.podsDuringSetup = [];
            
            //  reset (if this isn't reset then the pod members won't appear)
            self.draggingHasStarted(false);

            assignPodLeadersToPods();

            assignRegularPeopleToPods();

            //  delete previous list of pods from Firebase
            
            podsRef.remove();

            savePodsToFirebase();

            scrollToResults();


            //  I need to set this timeout, otherwise the drag-and-drop won't work, I guess it has to wait for the data to be populated by firebase first before the jquery UI plugin will work
            setTimeout(function(){

                //  set the pod lists to be sortable
                makePodListsEditable();


            }, 1000)
        }

        self.saveToDBClicked = function () {

            var confirmResult = confirm('Are you sure that you want to save the above contacts to the database?');
            if (!confirmResult) { return; }

            contactSaver.saveRegularPeopleToParse(self.regularPeople(), self.numDBRecordsSaved);

            //  pass the # of DB records saved to the UI
            self.numDBRecordsSaved = contactSaver.numDBRecordsSaved;

            $('#divNumDBRecordsSaved').fadeIn(1500, function () { });

        }



        self.logoutClicked = function () {

            var confirmResult = confirm('Are you sure that you want to log out?');
            if (!confirmResult) { return; }

            auth.logout();
        }



        function assignPodLeadersToPods() {

            //  shuffle the list of pod leaders so Aaron (alphabetically first) doesn't always have the most people
            var shuffledPodLeaders = _.shuffle(self.podLeaders());

            _.each(shuffledPodLeaders, function (podLeader) {

                var pod = new Pod(podLeader);
                

                self.podsDuringSetup.push(pod);
            });
        }

        function assignRegularPeopleToPods() {


            var currIndex = 0;
            var numberOfPods = self.podsDuringSetup.length;

            //  shuffle the list of people to get a different set of pod suggestions
            var shuffledRegularPeople = _.shuffle(self.regularPeople());

            _.each(shuffledRegularPeople, function (regularPerson) {

                self.podsDuringSetup[currIndex % numberOfPods].podMembers.push(regularPerson);

                currIndex++;
            });


        }

        function savePodsToFirebase(){


            //  where the pods are saved in firebase
            

            _.each(self.podsDuringSetup, function(pod){


                var result = podsRef.push({

                    'podLeader': pod.podLeader().name
                });


                //  save the firebase location of this pod
                pod.firebaseRef = result;

                

                _.each(pod.podMembers(), function(podMember){

                    var result = thisPodsMembersRef.push({
                        name: podMember.name
                    })

                    podMember.inPodFirebaseRef = result;

                    if(podMember.firebaseRef){
                        //  the only time the podMember would NOT have firebaseRef defined is if they are a pod leader who has been changed to be a pod member
                        
                        //  flag that this person is now in a pod
                        podMember.firebaseRef.child('isInPod').set(true);
                    }
                    else{
                        //  the person is a former pod member within a pod
                        
                        //  specify that they are in a pod, so that they don't show up in the stragglers list.  For regular people, this is set on firebase's "child_changed" event handler
                        podMember.isInPod(true);
                    }
                });
                

            });

        }

        function makePodListsEditable(){


            $("ul#ulLatePeople, #divPods ul").sortable({
                connectWith: ".connectedSortable",
                items: "li:not(.ui-state-disabled)",
                stop: function(event, ui){

                    
                    var personJoiningName = ui.item.text().replace(' (DRIVER)', '');

                    //  notice that I'm removing and adding to the podsArr that isn't bound to the UI (to keep it up to date with the UI ) ... the drag-and-drop moves updates the UI's view by itself

                    
                    var podToJoinName = $(this).data().uiSortable.currentItem.parent().attr('podLeader');
                    var newPod = _.find(self.pods(), function(pod){ return pod.podLeader().name === podToJoinName; });

                    //  exit this method if the user wasn't actually dragged to a new pod
                    if(!newPod || (newPod.podLeader().name === self.podToLeaveName)){ return ;}

                    var personBeingMoved = _.find(self.everyoneArray(), function(person){

                        return person.name === personJoiningName;
                    });




                    //  if regular person ... 
                    if(!personBeingMoved.isPodLeader()){


                        //  remove the person from their old pod
                        if(personBeingMoved.inPodFirebaseRef){
                            //  if a person is being moved off of the straggler list, then they won't have an "inPodFirebaseRef" object
                            personBeingMoved.inPodFirebaseRef.remove();
                        }
                    }
                    else{

                    //  else if the person is a pod leader
                        //  set properties of all the people in this pod to be "notInPod" = true
                        //  and then delete their pod


                        var podToDelete = _.find(self.pods(), function(pod){ 
                            return pod.podLeader().name === personBeingMoved.name; 
                        });


                        
                        podToDeleteMembersRef.on('child_added', function(msgSnapshot){

                            var podMemberInPodToBeDeleted = msgSnapshot.val();
                            
                            var personBeingRemovedFromPod = _.find(self.everyoneArray(), function(person){

                                return person.name === podMemberInPodToBeDeleted.name;
                            });

                            //if(personBeingRemovedFromPod.isPodLeader()){

                                //  don't set isInPod to false for a pod leader, because then they won't appear in the straggler list (disappear) on page reload



                                //  UI - add the pod leader (who was within this pod) to their new pod
                                newPod.podMembers.push(personBeingRemovedFromPod);

                                //  firebase - add the pod leader (who was within this pod) to their new pod
                                var newPodsMembersRef = newPod.firebaseRef.child('podMembers');
                                newPodsMembersRef.push({
                                    name: personBeingRemovedFromPod.name
                                });
/*
                            }
                            else{

                                //  UI - specify that person is no longer in a pod
                                personBeingRemovedFromPod.isInPod(false);

                                //  firebase - specify that person is no longer in a pod
                                personBeingRemovedFromPod.firebaseRef.child('isInPod').set(false);

                            }*/

                        });
/*  2/8/15 - this was my attempt to see if I could keep a pod around that has no one in it ... it looks like I was able to remove people from the pod in the UI and in firebase ... but I ran into a roadblock because there's no dropzone to drop people into in the "empty pod"

                        //  delete from UI
                        podToDelete.podMembers.removeAll();

                        //  delete from firebase
                        //podToDelete.child('podLeader').set('');  //  pod leader of this pod is now "blank"
                        podToDelete.firebaseRef.child('podLeader').set('');

                        podToDeleteMembersRef.remove();  //  remove members from the pod

                        */

                        //  UI - delete the pod
                        self.pods.remove(function(pod){
                            return pod.podLeader() === podToDelete.podLeader();
                        })

                        //  firebase - delete the pod
                        podToDelete.firebaseRef.remove();

                    }


                    //  add the person to their new pod
                    var newPodsMembersRef = newPod.firebaseRef.child('podMembers');
                    newPodsMembersRef.push({
                        name: personBeingMoved.name
                    });

                    if(personBeingMoved.firebaseRef){
                        //  if a person is a former pod leader, then they won't have a firebaseRef instance
    
                        personBeingMoved.firebaseRef.child('isInPod').set(true);                    

                        /*
                        //  specify that this person is in a pod (they may have been a straggler)
                        personBeingMoved.firebaseRef.child('isInPod').on('value', function(snapshot){
    
                            if(!snapshot.val()){
    
                                personBeingMoved.firebaseRef.child('isInPod').set(true);
                            }
                        })
                        */
                    }
                    
                    //  no need to remove the element from the DOM because podMembers' child_added action intelligently determines whether to add the element to the list of pod members or not
                    //ui.item.remove();

                },
                start: function(event, ui){

                    self.draggingHasStarted(true);

                    self.podToLeaveName = ui.item.parent().attr('podLeader');
                }
            }).disableSelection();
        }

        function scrollToResults() {
            $('html, body').animate({
                scrollTop: $("#divPods").offset().top
            }, 1000);
        }

    }

});