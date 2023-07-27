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
        let app = qlik.currApp(this);
        let variableName = "myPersistentVariablebooktest";

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

        $scope.objIdList = [];
        $scope.selectedList = [];
        $scope.mcdID;
        $scope.rep;
        $scope.height;
        app.getAppObjectList("sheet", async function (reply) {
          try {
            await app.variable.getByName(variableName).then(function (reply) {
              if (reply) {
                console.log("already variable created");
              } else {
              }
            });
          } catch (error) {
            console.log("line69" + JSON.stringify(error));
            console.log("created");
            app.variable.create({
              qName: variableName,
              qDefinition: 0,
              qIncludeInBookmark: true,
            });
          }

          try {
            await app.variable.getContent(variableName, function (reply) {
              $scope.rep = reply;
              $scope.selectedList = JSON.parse(reply.qContent.qString);
              console.log(
                "setting selections" + JSON.stringify($scope.selectedList)
              );
            });
          } catch (error) {
            console.log("line81" + JSON.stringify(error));
          }

          $scope.objIdList.length = 0;
          console.log(reply.qAppObjectList);
          reply.qAppObjectList.qItems.forEach((Items) => {
            Items.qData.cells.forEach((element) => {
              console.log(element);
              if (element.type != "MCD") {
                $scope.objIdList.push(element);
              } else {
                $scope.mcdID = element.name;
              }
            });
            console.log(objIdList);
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
            console.log($scope.objIdList);
            console.log($scope.selectedList);

            for (let i = 0; i < $scope.objIdList.length; i++) {
              const idToCheck = $scope.objIdList[i].name;
              for (let j = 0; j < $scope.selectedList.length; j++) {
                if ($scope.selectedList[j].name == idToCheck) {
                  console.log(
                    "same at" + $scope.selectedList[j].name + " id " + idToCheck
                  );
                  $scope.objIdList[i].selected =
                    $scope.selectedList[j].selected;
                  console.log($scope.objIdList[i].selected);
                  console.log($scope.selectedList[j].selected);
                  break;
                } else {
                  $scope.objIdList[i].selected = false;
                }
              }
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
                .exportData(
                  "OOXML",
                  "/qHyperCubeDef",
                  object.title + " " + object.name
                )
                .then(function (retVal) {
                  var qUrl = retVal.result ? retVal.result.qUrl : retVal.qUrl;
                  var link = $scope.getBasePath() + qUrl;
                  console.log(link);
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
        $scope.selectAll = function () {
          $scope.objIdList.forEach(function (result) {
            result.selected = true;
          });
          console.log(JSON.stringify($scope.objIdList));
          $scope.store();
        };
        $scope.unselectAll = function () {
          $scope.objIdList.forEach(function (result) {
            result.selected = false;
          });
          console.log(JSON.stringify($scope.objIdList));
          $scope.store();
        };
        $scope.store = function () {
          $scope.selectedList = $scope.objIdList;
          var selectedListString = JSON.stringify($scope.selectedList);
          app.variable.setStringValue(variableName, selectedListString);
          console.log("stored" + selectedListString);
        };

        $scope.fetch = async function () {
          await app.variable.getContent(variableName, function (reply) {
            console.log(reply);
            $scope.selectedList = JSON.parse(reply.qContent.qString);
            console.log(
              "setting selections" + JSON.stringify($scope.selectedList)
            );
          });
          for (let j = 0; j < $scope.selectedList.length; j++) {
            if ($scope.selectedList[j].name == idToCheck) {
              console.log(
                "same at" + $scope.selectedList[j].name + " id " + idToCheck
              );
              $scope.objIdList[i].selected = $scope.selectedList[j].selected;
              console.log($scope.objIdList[i].selected);
              console.log($scope.selectedList[j].selected);
              break;
            } else {
              $scope.objIdList[i].selected = false;
            }
          }
        };

        $scope.show = async function () {
          // console.log($scope.rep.qContent.qString);
          // console.log($scope.objIdList.length);
          // if ($scope.objIdList.length < 10) {
          //   $scope.height = 100 + "px";
          // } else {
          //   $scope.height = 200 + "px";
          // }
          // await app.variable.getContent(variableName, function (reply) {
          //   console.log(reply.qContent.qString);
          //   $scope.selectedList = JSON.parse(reply.qContent.qString);
          //   console.log($scope.selectedList);
          // });
        };
      },
    ],
  };
});
