define([
  "./properties",
  "./initialproperties",
  "text!./template.ng.html",
  "qlik",
], function (props, initProps, ngTemplate, qlik) {
  "use strict";

  return {
    definition: props,
    initialProperties: initProps,
    support: { snapshot: true },
    template: ngTemplate,

    controller: [
      "$scope",
      function ($scope) {
        var app = qlik.currApp(this);
        var objIdList = [];
        app.getAppObjectList("sheet", function (reply) {
          reply.qAppObjectList.qItems[0].qData.cells.forEach((element) => {
            objIdList.push(element);
          });

          for (let i = 0; i < objIdList.length; i++) {
            app.getObjectProperties(objIdList[i].name).then(function (model) {
              if (model.properties.title.length < 1) {
                objIdList[i].title = "No Title -" + objIdList[i].name;
              } else {
                objIdList[i].title = model.properties.title;
              }
            });
          }
          console.log("reply-" + JSON.stringify(objIdList));
          console.log("reply2-" + JSON.stringify(reply));
        });
        console.log("layout", $scope);
      },
    ],
  };
});
