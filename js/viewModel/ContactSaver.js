
define(['person', 'parseAccess', 'underscore'], function (Person, ParseAccess) {

    return function ContactSaver() {

        var self = this;

        var parseAccess = new ParseAccess();

        //  when querying the Parse DB for regular people, this determines how many records to pull.  If at some point in the future the Parse DB holds more than 1000 user records, I'll need to up this number correspondingly ... or clean up the Parse DB ...
        var numRegularPeopleToPullFromParse = 1000;


        self.numDBRecordsSaved = null;


 


        self.saveRegularPeopleToParse = function (regularPeople, numDBRecordsSaved) {

            var allParseDBContacts = [];

            this.numDBRecordsSaved = numDBRecordsSaved;

            //  pull all user records from Parse
            var ParsePerson = parseAccess.getParsePerson();
            var query = new Parse.Query(ParsePerson);
            query.ascending("name");

            //  Parse sets a default limit of 100, which is why I have to explicitly set a higher limit to say that I want to pull everyone
            query.limit(numRegularPeopleToPullFromParse);
            
            query.find({
                success: function (results) {

                    _.each(results, function (result) {

                        var person = result._serverData;

                        //  whether a person can drive or not will change from PIE night to PIE night, at least moreso than the other fields, so it's not as necessary to store that value in the DB
                        var p = new Person(person.name, person.email, person.phone, person.firstTime, person.whereFrom, 'NO', person.isPodLeader);
                        allParseDBContacts.push(p);
                    });

                    saveContactsToParseDB(allParseDBContacts, regularPeople);
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });

        }



        function saveContactsToParseDB(allParseDBContacts, regularPeople){

            var ParsePerson = parseAccess.getParsePerson();

            _.each(regularPeople, function (signedInPerson) {

                var signedInEmail = $.trim(signedInPerson.email);

                if (signedInEmail !== '') {

                    var personAlreadyInDB = _.find(allParseDBContacts, function (dbPerson) { return dbPerson.email === signedInEmail; });

                    if (personAlreadyInDB) {

                        updateDBPersonRecord(ParsePerson, personAlreadyInDB, signedInPerson);
                    }
                    else {

                        insertNewDBPersonRecord(ParsePerson, signedInPerson);
                    }
                }

            });
        }


        function updateDBPersonRecord(ParsePerson, personAlreadyInDB, signedInPerson) {

            //  update the whole Parse Person record, using the email address as the key
            var query = new Parse.Query(ParsePerson);
            query.equalTo("email", personAlreadyInDB.email);
            query.find({
                success: function (results) {

                    var personFromDB = results[0];

                    saveParsePerson(personFromDB, signedInPerson);
                }
            });


        }

        function insertNewDBPersonRecord(ParsePerson, signedInPerson) {

            var newPerson = new ParsePerson();
            saveParsePerson(newPerson, signedInPerson);   
        }


        function saveParsePerson(parsePerson, signedInPerson) {

            parsePerson.set('name', signedInPerson.name);
            parsePerson.set('email', signedInPerson.email);
            parsePerson.set('phone', signedInPerson.phone);

            var firstTimeBool = (signedInPerson.firstTime === 'YES' || signedInPerson.firstTime === '') ? true : false;
            parsePerson.set('firstTime', firstTimeBool);

            parsePerson.set('whereFrom', signedInPerson.whereFrom);
            parsePerson.set('isPodLeader', false);

            parsePerson.setACL(new Parse.ACL(Parse.User.current()));

            parsePerson.save(null, {
                success: function (savedPerson) {
                    // The object was saved successfully.


                    self.numDBRecordsSaved(self.numDBRecordsSaved() + 1);

                },
                error: function (person, error) {
                    // The save failed.
                    // error is a Parse.Error with an error code and description.
                }
            });

        }

    };

});