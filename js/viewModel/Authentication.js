
define(['parseAccess'], function (ParseAccess) {


    return function Authentication() {

        var self = this;

        var parseAccess = new ParseAccess();

        self.login = function () {

            var username = $('#txtUsername').val();
            var password = $('#txtPassword').val();


            Parse = parseAccess.getParse();
            Parse.User.logIn(username, password, {
                success: function (user) {
                    // Do stuff after successful login.

                    var currentUser = Parse.User.current();
                    if (currentUser) {

                        window.location = 'admin.html';
                    } else {

                    }

                },
                error: function (user, error) {
                    // The login failed. Check error to see why.

                    $('label#lblInvalidLogin').fadeIn(1000, function () { });
                }
            });
        };

        self.logout = function () {

            Parse = parseAccess.getParse();
            Parse.User.logOut();

            window.location = 'index.html';
        }

        self.userHasAccessToPage = function () {

            //  authentication
            if (!self.userIsLoggedIn()) {
                window.location = 'login.html';
                return false;
            }

            return true;
        }

        self.userIsLoggedIn = function () {

            Parse = parseAccess.getParse();

            var currentUser = Parse.User.current();
            if (currentUser) {
                // do stuff with the user

                return true;
            } else {

                return false;
            }
        };

    };

});