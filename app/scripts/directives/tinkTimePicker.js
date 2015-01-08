angular.module('tink.timepicker', []);
angular.module('tink.timepicker')
.directive('tinkTimepicker',[function(){
  return{
    restrict:'AE',
    //template:'<div style="background:white;"><span style="float:left;">--</span><div style="float:left;">:</div><span>--</span></div>',
    template:'<input value="--:--"/>',
    replace:true,
    link:function(scope,elem,attr){
      var current ={hour:{num:00,reset:true,prev:-1},min:{num:00,reset:true,prev:-1}};

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
        if(current.hour.reset){
          current.hour.num = 0;
          current.hour.prev = -1;
          current.hour.reset = !current.hour.reset;
        }
        setHour(num);
      }

      var selectHour = function(reset){
        elem[0].setSelectionRange(0, 2);
        selected = 1;
        current.hour.reset = reset;
        current.min.reset = false;
      }

      var selectMinute = function(reset){
        elem[0].setSelectionRange(3, 5);
        selected = 2;
        current.min.reset = reset;
        current.hour.reset = false;
      }

      var setHour = function(num){
        var select;
        var firstNumber = parseInt(hourString()[1]);
        var lastNumber = parseInt(hourString()[1]);
        if(lastNumber<2){
          current.hour.num = (lastNumber*10)+num;
          if(current.hour.prev === 0){
            select = 2;
          }else if(firstNumber !== 0){
            select = 2;
          }else{
            select = 1;
          }
        }else if(lastNumber === 2){
          if(num < 4){
            current.hour.num = (lastNumber*10)+num;
          }else{
            current.hour.num = num;
          }
          select = 2;
        }
        current.hour.prev = num;
        setValue(select);
      }

      var hourString = function(){
        return ("0"+current.hour.num).slice(-2);
      }

      var minString = function(){
        return ("0"+current.min.num).slice(-2);
      }

      var setMinute = function(num){
        var lastNumber = parseInt(minString()[1]);
         if(isNaN(lastNumber) || lastNumber === 0 || lastNumber > 5){
            current.min.num = num;
         }else if(lastNumber<6){
            current.min.num = (lastNumber*10)+num;
         }

        setValue(2);
      }

      var setValue =  function(select){
        elem.val(hourString()+':'+minString());
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


