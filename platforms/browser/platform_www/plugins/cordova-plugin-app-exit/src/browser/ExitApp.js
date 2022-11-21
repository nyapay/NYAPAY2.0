cordova.define("cordova-plugin-app-exit.ExitApp", function(require, exports, module) { 
module.exports = {
  exitApp: function () {
    alert('App will be reload');
    window.location.reload();
  }
};

require('cordova/exec/proxy').add('ExitApp', module.exports);

});
