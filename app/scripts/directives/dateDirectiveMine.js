angular.module('tink.datepicker', []);
angular.module('tink.datepicker')
	.directive('thinkdatepicker', function ($datepicker) {
		return {
			restrict: 'EAC',
			require: 'ngModel',
			templateUrl:'templates/datepicker2.tpl.html',
			transclude: true,
			link: function postLink(scope, element, attr, controller) {
        var config = {scope:scope,controller:controller};
       var datepicker = $datepicker(element,controller,config);
				element.on("click",function(){
          _show();
				})


        function _show(){
          datepicker.show();
          datepicker.$element.on('click',function(evt){
            console.log("jjeee")
            evt.preventDefault();
            evt.stopPropagation();
          });
          element.on("blur",function(){})
          var datepickerScope = datepicker.$scope;
          datepickerScope.title="jeej"
        }

			}}
	})
	.provider('$datepicker', function () {
		var defaults = this.defaults = {
      template:'templates/datepicker.tpl.html'
		};
		this.$get = function ($templateCache,$q,$http,$compile,$rootScope,$animate) {

      // --- init variables. //
      var fetchPromises = {},$datepicker={},templateHtml,templateElem,elemScope;
      // --- function to retrieve the templates. //
      function haalTemplateOp(template) {
        // --- if the template already is in our app cache return it. //
        if (fetchPromises[template]) return fetchPromises[template];
        // --- If not get the template from templatecache or http. //
        return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
          .then(function (res) {
            // --- When the template is retrieved return it. //
            if (angular.isObject(res)) {
              $templateCache.put(template, res.data);
              return res.data;
            }
            return res;
          }));
      };

      // --- init function for startup //
      function init(template){
        // --- retrieve template //
        $datepicker.$promise = haalTemplateOp(template);
        // --- when the data is loaded //
        $datepicker.$promise.then(function (template) {
          if (angular.isObject(template)) template = template.data;
          // --- store the html we retrieved //
          templateHtml = String.prototype.trim.apply(template);
          // --- compile the html into a real angular object //
          // --- this is needed to make ng annotations to work //
          templateElem = $compile(template);
        });
      };


			function DatepickerFactory(element, controller, config) {
        // --- Load the template and compile it //
        init(defaults.template);
        // --- function for when we need to show the template //
        $datepicker.show = function (){
          // --- check if the template is loaded //
          if(angular.isDefined(templateElem)){
            // --- create a new scope for the template //
            $datepicker.$scope = config.scope && config.scope.$new() || $rootScope.$new();
            console.log($datepicker.$scope)
            // --- add the new scope//
            $datepicker.$element = templateElem($datepicker.$scope, function (clonedElement, clone) {});
            // --- add the css to show the element //
            $datepicker.$element.css({top: '-9999px', left: '-9999px', display: 'block',position:'aboslute',visibility: 'visible'});
            // --- add the element after the main element //
            $animate.enter($datepicker.$element, null, element);


          }



        }

        $datepicker.destroy = function(){
          if($datepicker.$scope){
            $datepicker.$scope.$destroy();
            $datepicker.$scope = null;
          }

          if (templateElem) {
            $datepicker.$element.remove();
            $datepicker.$element = null;
          }
        }






      return $datepicker;

			}

			DatepickerFactory.defaults = defaults;
			return DatepickerFactory;

		};

	})
