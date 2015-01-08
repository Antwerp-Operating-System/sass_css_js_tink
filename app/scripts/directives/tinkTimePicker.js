angular.module('tink.timepicker', []);
angular.module('tink.timepicker')
.directive('tinkTimepicker',[function(){
  return{
    restrict:'AE',
    //template:'<div style="background:white;"><span style="float:left;">--</span><div style="float:left;">:</div><span>--</span></div>',
    template:'<input value="--:--"/>',
    replace:true,
    link:function(scope,elem,attr){
      var current ={hour:'--',min:'--'};

      function SelectText(element) {
        var doc = document,
          text = element,
          range, selection;

        if (doc.body.createTextRange) {
          range = document.body.createTextRange();
          range.moveToElementText(text);
          range.select();
        } else if (window.getSelection) {
          selection = window.getSelection();
          range = document.createRange();
          range.selectNodeContents(text);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      elem.keydown(function(e){
        var keycode = e.keyCode;console.log(keycode)
        var shift = e.shiftKey;
        if((shift && keycode > 47 && keycode <58) || (keycode >95 && keycode <106)){
          if(selected === 1){
            handleHour(keycode);
          }else{
            handleMinute(keycode);
          }
          return false;
        }else{
          return false;
        }
      });

      keycodeMapper = {}

      var mapKeycodes = function(){
        var hulp = 0;
        for(var i = 48; i<=57;i++){
          keycodeMapper[i] = hulp;
          hulp++;
        }

        hulp = 0;

        for(var i = 96; i<= 105;i++){
          keycodeMapper[i] = hulp;
          hulp++;
        }
      }
      mapKeycodes();

      var handleHour = function(key){
        var num = keycodeMapper[key];
        setHour(num);
      }

      var selectHour = function(reset){
        elem[0].setSelectionRange(0, 2);
        selected = 1;
        if(reset){
          current.hour = '--'
        }
      }

      var selectMinute = function(reset){
        elem[0].setSelectionRange(3, 5);
        selected = 2;
        if(reset){
          current.min = '--'
        }
      }

      var getMin = function(){
        if(current.min.length === 0){
          return '--';
        }else{
          return current.min;
        }
      }

      var getHour = function(){
      if(current.hour.length === 0){
          return '--';
        }else{
          return current.hour;
        }
      }

      var setHour = function(num){
        var select;
        if(current.hour[0] === undefined || current.hour[0] === '-'){
          current.hour = '0'+num;
          if(num < 3){
            select = 1;
          }else{
            select = 2;
          }
        }else if(parseInt(current.hour[1])<2){
          current.hour = current.hour[1]+num;
          select = 2;
        }else if(current.hour[1] === '2'){
          if(num < 4){
            current.hour = '2'+num;
          }else{
            current.hour = '0'+num;
          }
          select = 2;
        }
        setValue(select);
      }

      var setMinute = function(num){
         if(current.min[0] === undefined || current.min[0] === '-'){
            current.min = '0'+num;
         }else if(parseInt(current.min[1])<6){
            current.min = current.min[1]+num;
         }

        setValue(2);
      }

      var setValue =  function(select){
        elem.val(current.hour+':'+current.min);
        console.log(current.hour+':'+current.min)
        if(select === 1){
          selectHour();
        }else if(select === 2){
          selectMinute();
        }
      }

      var handleMinute = function(key){
        var num = keycodeMapper[key];
        setMinute(num);
      }

      var selected = -1;

      elem.bind('mousedown',function(evt){
        var offset = evt.offsetX;
        if(offset < 14 || offset > 24){
          selectHour(true);
          selected = 1;
        }else{
          selectMinute(true);
          selected = 2;
        }
        elem.focus();

         return false;
      })

     /* var hour = $(elem.children()[0]);
      var seperator = $(elem.children()[1]);
      var minutes = $(elem.children()[2]);

      function SelectText(element) {
        var doc = document,
          text = element,
          range, selection;

        if (doc.body.createTextRange) {
          range = document.body.createTextRange();
          range.moveToElementText(text);
          range.select();
        } else if (window.getSelection) {
          selection = window.getSelection();
          range = document.createRange();
          range.selectNodeContents(text);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      var bindLisener = function(){

      };

      var stopLisener = function(){

      };

      hour.bind('mousedown',function(evt,elm){
       SelectText(hour[0]);
       bindLisener();
       return false;
      })

      hour.bind('select',function(){console.log("select")})

      hour.bind('blur',function(){
        console.log('blur')
      })

      minutes.bind('mousedown',function(evt,elm){
       SelectText(minutes[0]);
       return false;
      })*/
    }
  }
}]);


