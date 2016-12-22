(function () {
    'use strict';

    angular.module('BlurAdmin.pages')
        .directive('tagInput', tagInput);

    /**                                         
     * <tag-input placeholder='add another...' selected-tags="vm.selectedTagsAsObjects" typeahead-data-source="vm.typeaheadDataSource" display-text="'Title'"></tag-input>
     * <tag-input placeholder='add another...' selected-tags="['Alpha', 'Bravo']" ></tag-input>
    */
    function tagInput($parse) {
        function configureAutoComplete(textBox, dataSourceConfig, onSelectCallback) {
            textBox.typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 3
                },
                dataSourceConfig);

            textBox.bind('typeahead:select', function (ev, suggestion) {
                onSelectCallback(suggestion);
            });
        }

        return {
            restrict: 'E',
            scope: {
                displayText: '=displayText',
                selectedTags: '=selectedTags',
                typeaheadDataSource: '=typeaheadDataSource'
            },
            link: function ($scope, element, attrs) {
                $scope.defaultWidth = 200;
                $scope.tagText = '';
                $scope.placeholder = attrs.placeholder;

                var textBox = $(element).find('input');

                if($scope.typeaheadDataSource){
                    configureAutoComplete(textBox, $scope.typeaheadDataSource, function(suggestion){
                        $scope.$apply(function(){
                            $scope.tagText = suggestion[$scope.displayText];
                            $scope.addTag(suggestion);
                        });
                    });
                }

                function isValidTag(tag){
                    if(angular.isString(tag) && tag.length === 0){
                        return false;
                    }

                    if($scope.displayText && angular.isString(tag)){
                        console.log("User attempted to free text, when they should have selected from suggestions dropdown...");
                        return false;
                    }

                    return !_.find($scope.selectedTags, function(item){
                        if(angular.isObject(item) && $scope.displayText){
                            return item[$scope.displayText].toLowerCase() === tag[$scope.displayText].toLowerCase();
                        } else{
                            return item.toLowerCase() === tag.toLowerCase();
                        }
                    });
                }

                function sortSelectedTags(){
                   if($scope.displayText){
                       $scope.selectedTags = _.sortBy($scope.selectedTags, function(item){ return item[$scope.displayText]; });
                    } else {
                       $scope.selectedTags = _.sortBy($scope.selectedTags);
                    } 
                }

                $scope.renderDisplayText = function(tag){
                    return angular.isObject(tag) ? tag[$scope.displayText] : tag.replace("'", "\\'", 'g');
                }

                $scope.addTag = function (typeaheadSuggestion) {  
                    if (isValidTag(typeaheadSuggestion || $scope.tagText)) {
                        $scope.selectedTags.push(typeaheadSuggestion || $scope.tagText);
                        sortSelectedTags();
                    }
                    $scope.tagText = '';
                    textBox.typeahead('val', '');
                    textBox.typeahead('close');
                };
                $scope.deleteTag = function (index) {
                    var selectedTags;
                    selectedTags = $scope.selectedTags;
                    if (selectedTags.length > 0 && $scope.tagText.length === 0 && index === undefined) {
                        //remove last item (should happen when user hits Backspace key i.e. Javascript key code 8)
                        selectedTags.pop();
                    } else {
                        if (index !== undefined) {
                            //remove tag by it's index position
                            selectedTags.splice(index, 1);
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
                        //tab or enter
                        e.preventDefault();
                    }
                    if (key === 8) {
                        //backspace
                        return $scope.$apply('deleteTag()');
                    }
                });
                return element.bind('keyup', function (e) {
                    var key;
                    key = e.which;
                    if (key === 9 || key === 13 ) {
                        //tab or enter  (comma would be 188)
                        e.preventDefault();
                        return $scope.$apply('addTag()');
                    }
                });
            },
            template: '<div class=\'bootstrap-tagsinput\'><span class=\'tag label label-primary\' data-ng-repeat="tag in selectedTags">{{ renderDisplayText(tag) }}<span data-role="remove" data-ng-click=\'deleteTag($index)\'></span></span><input type=\'text\' class=\'typeahead\' data-ng-style=\'{width: inputWidth}\' data-ng-model=\'tagText\' placeholder=\'{{placeholder}}\'/></div>'
        };
    }
})();