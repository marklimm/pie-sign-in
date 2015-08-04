
define(['authentication'], function (Authentication) {


    return function loginVM() {

        var self = this;

        var auth = new Authentication();

        self.loginClicked = function () {


            auth.login();

        };


    };

});