  angular.module('tink.header', []);
  angular.module('tink.header').directive("navHeader",["$document","$window",function($document,$window){

  	return {
  		restrict:'AE',
  		priority:99,
  		link:function(scope,elem,attr){
			var changeHeight = function(){
				var height = elem[0].clientHeight;
				angular.element($document[0].body).css({ "padding-top": height+"px" });
			};
			changeHeight();
			angular.element($window).bind("resize",changeHeight)

  		}
  	}

  }])