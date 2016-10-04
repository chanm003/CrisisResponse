(function () {
    'use strict';

    angular.module('BlurAdmin.pages')
        .directive('tagInput', tagInput);

    /** @ngInject */
    function tagInput($parse) {
        function configureAutoComplete(textBox, bhSource, onSelectCallback) {
            textBox.typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 3
                },
                {
                    name: 'states',
                    source: bhSource
                });

            textBox.bind('typeahead:select', function (ev, suggestion) {
                suggestion = suggestion.replace("'", "\\'", 'g');
                onSelectCallback(suggestion);
            });
        }

        return {
            restrict: 'E',
            scope: {
                tagArray: '=taglist',
                typeaheadDataSource: '=typeaheadDataSource'
            },
            link: function ($scope, element, attrs) {
                $scope.defaultWidth = 200;
                $scope.tagText = '';
                $scope.placeholder = attrs.placeholder;

                var textBox = $(element).find('input');

                if($scope.typeaheadDataSource){
                    configureAutoComplete(textBox, $scope.typeaheadDataSource, function(suggestion){
                        $scope.$apply('tagText=\'' + suggestion + '\'');
                        $scope.$apply('addTag()');
                    });
                }

                $scope.addTag = function () {
                    if ($scope.tagText.length === 0) {
                        return;
                    }
                    if (!_.contains($scope.tagArray, $scope.tagText)) {
                        $scope.tagArray.push($scope.tagText);
                        $scope.tagArray = _.sortBy($scope.tagArray);
                    }
                    $scope.tagText = '';

                    textBox.typeahead('val', '');
                    textBox.typeahead('close');
                };
                $scope.deleteTag = function (key) {
                    var tagArray;
                    tagArray = $scope.tagArray;
                    if (tagArray.length > 0 && $scope.tagText.length === 0 && key === undefined) {
                        tagArray.pop();
                    } else {
                        if (key !== undefined) {
                            tagArray.splice(key, 1);
                        }
                    }
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
            template: '<div class=\'bootstrap-tagsinput\'><span class=\'tag label label-primary\' data-ng-repeat="tag in tagArray">{{tag}}<span data-role="remove" data-ng-click=\'deleteTag($index)\'></span></span><input type=\'text\' class=\'typeahead\' data-ng-style=\'{width: inputWidth}\' data-ng-model=\'tagText\' placeholder=\'{{placeholder}}\'/></div>'
        };
    }
})();