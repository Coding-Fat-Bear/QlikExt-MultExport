define([
  "./properties",
  "./initialproperties",
  "text!./template.ng.html",
  "qlik",
  "./lib/components/eui-button/eui-button",
  "./lib/components/eui-overlay/eui-overlay",
  "./lib/components/eui-simple-table/eui-simple-table",
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
        $scope.getBasePath = function () {
          var prefix = window.location.pathname.substr(
              0,
              window.location.pathname.toLowerCase().lastIndexOf("/sense") + 1
            ),
            url = window.location.href;
          return (
            (url = url.split("/")),
            url[0] +
              "//" +
              url[2] +
              ("/" === prefix[prefix.length - 1]
                ? prefix.substr(0, prefix.length - 1)
                : prefix)
          );
        };
        // console.log($scope.getBasePath());
        var app = qlik.currApp(this);
        $scope.objIdList = [];
        app.getAppObjectList("sheet", function (reply) {
          $scope.objIdList.length = 0;
          reply.qAppObjectList.qItems[0].qData.cells.forEach((element) => {
            $scope.objIdList.push(element);
          });
          $scope.getObjlist = async function () {
            for (let i = 0; i < $scope.objIdList.length; i++) {
              await app
                .getObjectProperties($scope.objIdList[i].name)
                .then(function (model) {
                  if (model.properties.title.length < 1) {
                    $scope.objIdList[i].title =
                      "No Title -" + $scope.objIdList[i].name;
                    $scope.objIdList[i].selected = false;
                  } else {
                    $scope.objIdList[i].title = model.properties.title;
                    $scope.objIdList[i].selected = false;
                  }
                });
            }
            // console.log("reply-" + JSON.stringify($scope.objIdList));
          };
          $scope.getObjlist();
        });
        $scope.export = function () {
          var selectedObjects = $scope.objIdList.filter(function (item) {
            return item.selected;
          });
          selectedObjects.forEach(function (object) {
            console.log("Selected object:", object.name);
            app.getObject(object.name).then((model) => {
              model
                .exportData("OOXML", "/qHyperCubeDef", "test")
                .then(function (retVal) {
                  var qUrl = retVal.result ? retVal.result.qUrl : retVal.qUrl;
                  console.log(qUrl);
                  var link = $scope.getBasePath() + qUrl;
                  window.open(link);
                })
                .catch(function (err) {
                  console.log(err);
                })
                .finally(function () {
                  console.log("exported");
                });
            });
          });
        };

        $scope.show = function () {
          console.log(JSON.stringify($scope.objIdList));
        };
      },
    ],
  };
});
