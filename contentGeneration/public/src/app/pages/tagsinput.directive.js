/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages')
      .directive('tagInput', tagInput);

  /** @ngInject */
  function tagInput($parse) {
      return {
            restrict: 'E',
            scope: {
                inputTags: '=taglist',
                autocomplete: '=autocomplete'
            },
            link: function ($scope, element, attrs) {
                $scope.defaultWidth = 200;
                $scope.tagText = '';
                $scope.placeholder = attrs.placeholder;
                if ($scope.autocomplete) {
                    $scope.autocompleteFocus = function (event, ui) {
                        $(element).find('input').val(ui.item.value);
                        return false;
                    };
                    $scope.autocompleteSelect = function (event, ui) {
                        $scope.$apply('tagText=\'' + ui.item.value + '\'');
                        $scope.$apply('addTag()');
                        return false;
                    };
                    $(element).find('input').autocomplete({
                        minLength: 0,
                        source: function (request, response) {
                            var item;
                            return response(function () {
                                var i, len, ref, results;
                                ref = $scope.autocomplete;
                                results = [];
                                for (i = 0, len = ref.length; i < len; i++) {
                                    if (window.CP.shouldStopExecution(1)) {
                                        break;
                                    }
                                    item = ref[i];
                                    if (item.toLowerCase().indexOf(request.term.toLowerCase()) !== -1) {
                                        results.push(item);
                                    }
                                }
                                window.CP.exitedLoop(1);
                                return results;
                            }());
                        },
                        focus: function (_this) {
                            return function (event, ui) {
                                return $scope.autocompleteFocus(event, ui);
                            };
                        }(this),
                        select: function (_this) {
                            return function (event, ui) {
                                return $scope.autocompleteSelect(event, ui);
                            };
                        }(this)
                    });
                }
                $scope.tagArray = function () {
                    if ($scope.inputTags === undefined) {
                        return [];
                    }
                    return $scope.inputTags.split(',').filter(function (tag) {
                        return tag !== '';
                    });
                };
                $scope.addTag = function () {
                    var tagArray;
                    if ($scope.tagText.length === 0) {
                        return;
                    }
                    tagArray = $scope.tagArray();
                    tagArray.push($scope.tagText);
                    $scope.inputTags = tagArray.join(',');
                    return $scope.tagText = '';
                };
                $scope.deleteTag = function (key) {
                    var tagArray;
                    tagArray = $scope.tagArray();
                    if (tagArray.length > 0 && $scope.tagText.length === 0 && key === undefined) {
                        tagArray.pop();
                    } else {
                        if (key !== undefined) {
                            tagArray.splice(key, 1);
                        }
                    }
                    return $scope.inputTags = tagArray.join(',');
                };
                $scope.$watch('tagText', function (newVal, oldVal) {
                    var tempEl;
                    if (!(newVal === oldVal && newVal === undefined)) {
                        tempEl = $('<span>' + newVal + '</span>').appendTo('body');
                        $scope.inputWidth = tempEl.width() + 5;
                        if ($scope.inputWidth < $scope.defaultWidth) {
                            $scope.inputWidth = $scope.defaultWidth;
                        }
                        return tempEl.remove();
                    }
                });
                element.bind('keydown', function (e) {
                    var key;
                    key = e.which;
                    if (key === 9 || key === 13) {
                        e.preventDefault();
                    }
                    if (key === 8) {
                        return $scope.$apply('deleteTag()');
                    }
                });
                return element.bind('keyup', function (e) {
                    var key;
                    key = e.which;
                    if (key === 9 || key === 13 || key === 188) {
                        e.preventDefault();
                        return $scope.$apply('addTag()');
                    }
                });
            },
            template: '<div class=\'bootstrap-tagsinput\'><span class=\'tag label label-primary\' data-ng-repeat="tag in tagArray()">{{tag}}<span data-role="remove" data-ng-click=\'deleteTag($index)\'></span></span><input type=\'text\' data-ng-style=\'{width: inputWidth}\' data-ng-model=\'tagText\' placeholder=\'{{placeholder}}\'/></div>'
        };
  }
})();