
define(['person', 'parse', 'underscore'], function (Person) {

    return function ParseAccess() {

        var self = this;




        self.getParse = function(){

            Parse = initializeParse();
            return Parse;
        }

        self.getParsePerson = function(){


            Parse = initializeParse();
            var ParsePerson = Parse.Object.extend("Person");

            return ParsePerson;
        }

        function initializeParse() {

            //  set my JS and application Parse keys
            

            return Parse;
        }



    };

});