document.addEventListener("DOMContentLoaded", function(){
  var is = {
    defined : function(val){return typeof val !== "undefined";},
    string : function(str){return typeof str === "string";},
    object : function(obj){return typeof obj === "object";},
    funct : function(obj){return typeof obj === "function";},
    number : function(val){return typeof val === 'number' && val === val;}, 
    element : function(obj){return typeof HTMLElement === "object" ? obj instanceof HTMLElement : (obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName==="string");}, 
    plainObject : function(obj) {if (typeof obj == 'object' && obj !== null) {if (typeof Object.getPrototypeOf == 'function') {var proto = Object.getPrototypeOf(obj);return proto === Object.prototype || proto === null;}return Object.prototype.toString.call(obj) == '[object Object]';}return false;}, 
    array : function(value){return Object.prototype.toString.call(value) == '[object Array]';},
    inArray : function(needle, arr) {if ((typeof arr == 'undefined') || !arr.length || !arr.push) return false;for (var i = 0; i < arr.length; i++) if (arr[i] == needle) return true;return false;}
  },
  html = {
    decode : function(text) {var newContent, textArea = document.createElement('textarea');textArea.innerHTML = text;newContent = textArea.value;textArea = null;return newContent;},
    encode : function(text) {var newContent, textArea = document.createElement('textarea');textArea.innerText = text;newContent = textArea.innerHTML;textArea = null;return newContent;}
  },
  one = function(selector, context){return (context||document).querySelector(selector);},
  all = function(selector, context){var nodeList = (context||document).querySelectorAll(selector), list = nodeList;if(nodeList && nodeList.length > 0){list = Array.from ? Array.from(nodeList) : Array.prototype.slice.call(nodeList);}return list;},
  contains = function(el,child){return el !== child && el.contains(child);}, 
  removeClass = function(elem, className){if( elem && is.string(className) ){if(elem.length && elem.length > 0){for(var i = 0;i < elem.length;i++){var el = elem[i];if( is.object(el) && el.classList.contains(className) ) el.classList.remove(className);}} else if( is.object(elem) && elem.classList.contains(className) ) elem.classList.remove(className);}return this;},
  addClass = function(elem, className){if( elem  && is.string(className) ){if(elem.length && elem.length > 0){for(var i = 0;i < elem.length;i++){var el = elem[i];if( is.object(el) && !el.classList.contains(className) ) el.classList.add(className);}} else if( is.object(elem) && !elem.classList.contains(className) ) elem.classList.add(className);}return this;},
  elementStyle = function(strOrEle){var element = is.element(strOrEle) ? strOrEle : is.string(strOrEle) ? one(strOrEle) : null;return (!element) ? null :(element.currentStyle ? element.currentStyle : (window.getComputedStyle ? window.getComputedStyle(element,null) : document.defaultView.getComputedStyle(element, null)));}, 
  tag = function(tagName, attributes){
    var node, name;
    name = is.string(tagName) ? tagName.replace('<','').replace('/>','').replace('>','') : tagName;
    if (name.toLowerCase() === 'svg') {
      node = document.createElementNS('http://www.w3.org/2000/svg', name);
    } else {
      node = typeof(name) === "object" && is.element(name) ? name : document.createElement(name);
    }
	  
    if( attributes && is.plainObject(attributes) ) {
      for(prop in attributes) {
        if(attributes.hasOwnProperty(prop)) node.setAttribute(prop, attributes[prop]);
      }
    }
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if(child){
        if (typeof child == "string") child = document.createTextNode(child);
        node.appendChild(child);
      }
    }
    return node;
  }, 
  on = function(el, evt, fn, opts = {}){
    const elems = is.element(el) ? el : is.string(el) ? all(el) : el;
    delegatorFn = e => {
      if( is.array(opts.target) ){
        var target;
        for(var i = 0;i < opts.target.length;i++){
	  var target = e.target.closest(opts.target[i]);
	  if (!target) target = e.target; // (2)
	  if(!el.contains(target)) return; // (3)
	  if(target.matches(opts.target[i])) {
	    fn.call(target, e);
	  }
        }
      } else {
        let target = e.target.closest(opts.target); // (1)
        if (!target) target = e.target; // (2)
        if(!el.contains(target)) return; // (3)
        if(target.matches(opts.target)) {
	  fn.call(target, e);
        }
      }
    }
    if(is.array(elems)){
      for(var i = 0;i < elems.length;i++){
        var el = elems[i];
        if(is.element(el)) el.addEventListener(evt, opts.target ? delegatorFn : fn, opts.options || false);
      }
    } else {
      el.addEventListener(evt, opts.target ? delegatorFn : fn, opts.options || false);
    }
    if (opts.target) return delegatorFn;
  }, 
  forEach = function(obj, iterator, context){
    try{
      var key;
      if (obj) {
        if (is.funct(obj)){
          for (key in obj) {
	    if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
	      iterator.call(context, obj[key], key);
	    }
          }
        } else if (obj.forEach && obj.forEach !== forEach && obj.length > 0 ) {
          obj.forEach(iterator, context);
        } else if (obj && ("length" in obj) && obj.length > 0 ) {
          for (key = 0; key < obj.length; key++) if(obj[key]) iterator.call(context, obj[key], key);
        } else {
          for (key in obj) {
	    if (obj.hasOwnProperty(key)) {
	      iterator.call(context, obj[key], key);
	    }
          }
        }
      }
    } catch(e){alert(e.stack)}
    return obj;
  }, 
  qtabs = function(obj){
    var _this = this, ti=1, useAnimation, animationName, startAt,selectedTab, selectedPanel, 
    tabId, tabLinksId, tabLinksButtonId, tabPanelId, tabs, tabLinks, tabLinkButtons, tabPanels;
    if(obj && is.plainObject(obj)){
      tabId = ("tabId" in obj) ? obj.tabId : ".pbd-tabs";
      tabLinksId = ("tabLinksId" in obj) ? obj.tabLinksId : ".tab-links";
      tabLinksButtonId = ("tabLinksButtonId" in obj) ? obj.tabLinksButtonId : ".tab-button";
      tabPanelId = ("tabPanelsId" in obj) ? obj.tabPanelId : ".tab-panel";
    } else {tabId = obj;tabLinksId = ".tab-links";tabLinksButtonId = ".tab-button";tabPanelId = ".tab-panel";}
	  
    var init = function(_tab, _links, _panels, index){
      if(is.element(_tab) && is.element(_links) && _panels && contains(_tab, _links)){
        var tabLinkButtons = all(tabLinksButtonId, _links);
        if(tabLinkButtons && tabLinkButtons.length > 0){
          forEach(tabLinkButtons, function(button){
	    if(is.element(button)){
	      button.addEventListener("click", function(e){
	        var target = this || e.target, targetId = target.getAttribute("data-target-id");
	        if(is.string(targetId)){
	          selectedPanel = one(targetId, _tab);
	          if(is.element(selectedPanel)){
		    removeClass(tabLinkButtons, "active");
	            target.classList.add("active");
		    removeClass(_panels, "active");
		    selectedPanel.classList.add("active");
	          }
	        }
	      }, false);
	    }
          });
        }
      }
      return;
    }
	  
    if(is.string(tabId)){
      tabs = all(tabId) || [];
      forEach(tabs, function(tab){
        if(is.element(tab)){
          ti++;
          tabLinks = one(tabLinksId, tab), tabPanels = all(tabPanelId, tab);
          init(tab, tabLinks, tabPanels, ti);
        }
      });
    }
  },
  readAsImage = function(readerObj){
    var fr, reader, inc = 0, output = [];
    if(arguments.length === 2){
      var event = arguments[0] || window.event,pre_process = arguments[1], target_id = null, info_id = null;
    } else if(arguments.length > 2){
      var event = arguments[0] || window.event, target_id = arguments[1] || null, info_id = arguments[2] || null, pre_process = arguments[3] || null;
    } else {
      var event = readerObj.event || window.event, target_id = readerObj.target_id || null, info_id = readerObj.info_id || null, pre_process = readerObj.pre_process || null;
    }
    var targetElem = is.element(target_id) ? target_id : is.string(target_id) ? one(target_id) : null, 
    infoElem = is.element(info_id) ? info_id : is.string(info_id) ? one(info_id) : null;
	  
    function abortRead(fr) {fr.abort();}
    function errorHandler(evt) {
      switch(evt.target.error.code) {
        case evt.target.error.NOT_FOUND_ERR:alert('File Not Found!');break;
        case evt.target.error.NOT_READABLE_ERR:alert('File is not readable');break;
        case evt.target.error.ABORT_ERR:break;
        default:alert('An error occurred reading this file.');
      };
    }
	  
    function load_image(_blob, _targetElem, _infoElem, _pre_process) {
      fr = new FileReader();
      fr.onerror = errorHandler;
      fr.onabort = function(e) {abortRead(fr);alert('File read cancelled');};
      fr.onloadend = (function(theFile) {
        return function(e) {
	  try{
	    if(is.funct(_pre_process) ){
              _pre_process.call(null,e.target.result, _blob, _targetElem, _infoElem);
	    } else if(is.element(_targetElem)){
	      if(is.string(_pre_process) && _pre_process === "raw"){
	        if(("src" in _targetElem) || _targetElem.src) _targetElem.src = e.target.result;
	        else _targetElem.innerHTML += e.target.result;
	      }
	    }
          } catch(e){alert(e.stack)}
        };	  
      })(_blob);
      fr.readAsDataURL(_blob);
      return this;
    }
	  
    if(event){
      var maxFileSize = 2 * 1024 * 1024;
      if(event && event.target && event.target.files && event.target.files.length > 0){
        for(i=0;i<event.target.files.length;i++){
	  //inc++;
	  var file = event.target.files[i];
	  if (file.size >= maxFileSize) {
	    alert("File size must be at most 2MB");
	    return;
	  }
	  load_image(file, targetElem, infoElem,  pre_process)
        }
      } else {
        load_image(event, targetElem, infoElem,  pre_process);
        //targetElem.innerHTML = "<p>No files selected!</p>";
      }
      return this;
    }
  };
  // Save | Download image
  function downloadImage(data, filename = 'untitled.jpeg') {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
  }
  // ------------------------------------------------------------------------------------------------------------------------------------------
  var $mainImage = one("#main-image"), frag = document.createDocumentFragment(), 
  zoomed = 0, default_filter_image = "./default.jpg", styleText = "", 
  filters = [
    "none", "1977", "aden", "amaro", "ashby", "brannan", "brooklyn", "charmes", "clarendon", "crema", "dogpatch", "earlybird", "gingham", "ginza", "hefe", "helena", "hudson", "inkwell", "juno", "kelvin", "lark", 
    "lofi", "ludwig", "maven", "mayfair", "moon", "nashville", "perpetua", "poprocket", "reyes", "rise", "sierra", "skyline", "slumber", "stinson", "sutro", "toaster", "valencia", "vesper", "walden", "willow", "xpro-ii"
  ], 
  defaultValues = {
    filter : {
      blur : "0", brightness : "", contrast : "", dropshadow : "0 0 0 #000", grayscale : "0", huerotate : "0", invert : "0", opacity : "100", saturate : "100", sepia : "0"
    },
    transform : {
      rotate : "0", scale : "1", scaleX : "1", scaleY : "1", skew : "0", translateX : "0", translateY : "0"
    }
  };
  
  forEach(filters, function(filter){
	  if($mainImage.classList.contains(`filter-${filter}`)) $mainImage.classList.remove(`filter-${filter}`);
	  var div, img,span;
	  div = tag("div", {"class":"thumb-wrapper","data-filter-class" : `filter-${filter}`},
		  img = tag("img", {"class" : `thumb filter-${filter}`,src : default_filter_image, alt : "IMAGE", "data-filter-class" : `filter-${filter}`}), 
		  span = tag("span", {"class" : "thumb-name", "data-filter-name" : `filter-${filter}`},`filter-${filter}`)
	  );
	  img.addEventListener("click", function(e){
		  forEach(filters, function(filter){
			  if($mainImage.classList.contains(`filter-${filter}`)) $mainImage.classList.remove(`filter-${filter}`);
		  });
		  var _filter_class = this.getAttribute("data-filter-class"), _elem_style = elementStyle($mainImage);
		  $mainImage.src = this.src || img.src;
		  $mainImage.classList.add(_filter_class);
		  for(var s in $mainImage.style) if(s === "filter" || s === "-webkit-filter") styleText = `${s} : ${_elem_style[s]};\n`;
		  one("#widgets-sntx-panel").innerHTML = styleText;
	  }, false);
	  frag.appendChild(div);
  });
  
  one(".pre-filters").appendChild(frag);
  one("#filter-zoom-reset").setAttribute("data-img-width" ,$mainImage.clientWidth);
  one("#filter-zoom-reset").setAttribute("data-img-height" ,$mainImage.clientHeight);
  
  on(one("#widget-body-toggler"), "click", function(e){
	  var wBody = one(".widget-body");
	  wBody.classList.toggle("toggled");
	  if(wBody.classList.contains("toggled")) {this.classList.add("purple");this.innerHTML = "&nbsp;&laquo;&nbsp;";}
	  else {this.classList.remove("purple");this.innerHTML = "&nbsp;&raquo;&nbsp;";}
  });
  on(one("#pre-filters-toggler"), "click", function(e){
	  var prefilters = one(".pre-filters");
	  prefilters.classList.toggle("toggled");
	  if(prefilters.classList.contains("toggled")) {this.innerHTML = "&nbsp;&uarr;&nbsp;";}
	  else {this.innerHTML = "&nbsp;&darr;&nbsp;";}
  });
  on(document, "click",function(e){
	  if(is.element($mainImage) && (e.target.id === "filter-zoom-in" || e.target.id === "filter-zoom-out" || e.target.id === "filter-zoom-reset" || e.target.id === "resetAll") ){
		  var currWidth = $mainImage.clientWidth, currHeight = $mainImage.clientHeight, min, max, step = e.target.getAttribute("step"), 
		  zoom = step && step > 0 ? parseInt(step, 10): 100;
		  if(e.target.id === "filter-zoom-in"){
			  max = e.target.getAttribute("max");
			  if(zoomed < max){
				  $mainImage.style.width = (currWidth + zoom) + "px";
				  $mainImage.style.height = (currHeight + zoom) + "px";
				  zoomed++;
			  }
		  } else if(e.target.id === "filter-zoom-out"){
			  min = e.target.getAttribute("min");
			  if(zoomed >= min){
				  $mainImage.style.width = (currWidth - zoom) + "px";
				  $mainImage.style.height = (currHeight - zoom) + "px";
				  zoomed--;
			  }
		  }
		  if(e.target.id === "filter-zoom-reset"){
			  $mainImage.style.width = e.target.getAttribute("data-img-width") + "px";
			  $mainImage.style.height = e.target.getAttribute("data-img-height") + "px";
			  zoomed = 0;
		  }
		  if(e.target.id === "resetAll"){
			  zoomed = 0;
			  $mainImage.style.width = one("#filter-zoom-reset").getAttribute("data-img-width") + "px";
			  $mainImage.style.height = one("#filter-zoom-reset").getAttribute("data-img-height") + "px";
			  $mainImage.style.filter = "none";
			  $mainImage.style.transform = "none";
			  one('#transform-input-rotate').value = defaultValues.transform.rotate;one('#transform-input-scaleX').value = defaultValues.transform.scaleX;one('#transform-input-scaleY').value = defaultValues.transform.scaleY;one('#transform-input-translateX').value = defaultValues.transform.translateX;one('#transform-input-translateY').value = defaultValues.transform.translateY;one('#transform-input-skew').value = defaultValues.transform.skew;
			  one('#filter-input-blur').value = defaultValues.filter.blur;one('#filter-input-brightness').value = defaultValues.filter.brightness;one('#filter-input-contrast').value = defaultValues.filter.contrast;one('#filter-input-grayscale').value = defaultValues.filter.grayscale;one('#filter-input-hue-rotate').value = defaultValues.filter.huerotate;one('#filter-input-invert').value = defaultValues.filter.invert;one('#filter-input-opacity').value = defaultValues.filter.opacity;one('#filter-input-saturate').value = defaultValues.filter.saturate;one('#filter-input-sepia').value = defaultValues.filter.sepia;
		  }
		  if(e.target.id === "saveImage"){
			  var fileName = 'my-canvas.jpeg', canvas = document.createElement("canvas"), 
			  ctx = canvas.getContext("2d");
			  ctx.drawImage($mainImage, 0, 0, canvas.width, canvas.height);
			  // Convert canvas to image
			  //var canvas = document.querySelector('#my-canvas');
			  var dataURL = canvas.toDataURL("image/jpeg", 1.0);
			  if (window.navigator.msSaveBlob) {
				  window.navigator.msSaveBlob(canvas.msToBlob(), fileName);
				  e.preventDefault();
			  } else {
				  downloadImage(dataURL, fileName);
			  }
		  }
	  }
  }, {target: "#widgets-controls-panel button"});
  
  on(document, "change", function(e){
	  var $mainImage = one("#main-image"), cssStr = "", cssTransformStr = "",
	  filter_inputs = all("#widgets-controls-panel .css-filter input[type=range]"),
	  transform_inputs = all('#widgets-controls-panel .transformation input[type=range]')
	  
	  forEach(filter_inputs, function(input){
		  var filter = input.id.replace("filter-input-",""), unit = input.id === "filter-input-blur" ? "px" : input.id === "filter-input-hue-rotate" ? "deg" : input.id === "filter-input-drop-shadow" ? "" : "%";
		  if(input.id !== e.target.id) cssStr += `${filter}(${input.value}${unit}) `;
		  //if(input.id !== e.target.id) cssStr += ""+filter+"("+ input.value + unit +") ";
	  });
	  forEach(transform_inputs, function(input){
		  var transform = input.id.replace("transform-input-",""), unit = (input.id === "transform-input-translateY" || input.id === "transform-input-translateX") ? "px" : (input.id === "transform-input-rotate" || input.id === "transform-input-skew") ? "deg" :  "";
		  if(input.id !== e.target.id) cssTransformStr += `${transform}(${input.value}${unit}) `;
		  //if(input.id !== e.target.id) cssTransformStr += ""+transform+"("+ input.value + unit +") ";
	  });
	  if(e.target.id === "filter-input-object-fit"){
		  // $mainImage.style.objectFit = this.value;
		  Object.assign($mainImage.style, {"object-fit": this.value});
	  } else if(e.target.id === "transform-input-rotate"){
		  var val = `rotate(${this.value}deg)`;
		  one("#current-rotate").innerHTML = `${this.value}deg`;
		  Object.assign($mainImage.style, {"-webkit-transform" : cssTransformStr+val, "-moz-transform" : cssTransformStr+val, "-o-transform" : cssTransformStr+val, "transform" : cssTransformStr+val, 'transform-origin' : 'center center','vertical-align' : 'middle'});
	  } else if(e.target.id === "transform-input-skew"){
		  var val = `skew(${this.value}deg)`;
		  one("#current-skew").innerHTML = `${this.value}deg`;
		  Object.assign($mainImage.style, {"-webkit-transform" : cssTransformStr+val, "-moz-transform" : cssTransformStr+val, "-o-transform" : cssTransformStr+val, "transform" : cssTransformStr+val, 'transform-origin' : 'center center','vertical-align' : 'middle'});
	  } else if(e.target.id === "transform-input-translateX"){
		  //var val = `translate(${this.value}px, ${$('#transform-input-translate-y').val()}px)`;
		  var val = `translateX(${this.value}px)`;
		  one("#current-translateX").innerHTML = `${this.value}px`;
		  Object.assign($mainImage.style, {"-webkit-transform" : cssTransformStr+val, "-moz-transform" : cssTransformStr+val, "-o-transform" : cssTransformStr+val, "transform" : cssTransformStr+val, 'transform-origin' : 'center center','vertical-align' : 'middle'});
	  } else if(e.target.id === "transform-input-translateY"){
		  //var val = `translate(${$('#transform-input-translate-x').val()}px, ${this.value}px)`;
		  var val = `translateY(${this.value}px)`;
		  one("#current-translateY").innerHTML = `${this.value}px`;
		  Object.assign($mainImage.style, {"-webkit-transform" : cssTransformStr+val, "-moz-transform" : cssTransformStr+val, "-o-transform" : cssTransformStr+val, "transform" : cssTransformStr+val, 'transform-origin' : 'center center','vertical-align' : 'middle'});
	  } else if(e.target.id === "transform-input-scale"){
		  var val = `scale(${this.value})`;
		  one("#current-scale").innerHTML = `${this.value}`;
		  Object.assign($mainImage.style, {"-webkit-transform" : cssTransformStr+val, "-moz-transform" : cssTransformStr+val, "-o-transform" : cssTransformStr+val, "transform" : cssTransformStr+val, 'transform-origin' : 'center center','vertical-align' : 'middle'});
	  } else if(e.target.id === "transform-input-scaleX"){
		  var val = `scale(${this.value}, ${one('#transform-input-scaleY').value})`;
		  one("#current-scaleX").innerHTML = `${this.value}`;
		  Object.assign($mainImage.style, {"-webkit-transform" : cssTransformStr+val, "-moz-transform" : cssTransformStr+val, "-o-transform" : cssTransformStr+val, "transform" : cssTransformStr+val, 'transform-origin' : 'center center','vertical-align' : 'middle'});
	  } else if(e.target.id === "transform-input-scaleY"){
		  var val = `scale(${one('#transform-input-scaleX').value}, ${this.value})`;
		  one("#current-scaleY").innerHTML = `${this.value}`;
		  Object.assign($mainImage.style, {"-webkit-transform" : cssTransformStr+val, "-moz-transform" : cssTransformStr+val, "-o-transform" : cssTransformStr+val, "transform" : cssTransformStr+val, 'transform-origin' : 'center center','vertical-align' : 'middle'});
	  } else if(e.target.id === "filter-input-blur"){
		  var val = `blur(${this.value}px)`;
		  one("#current-blur").innerHTML = `${this.value}px`;
		  Object.assign($mainImage.style, {"-webkit-filter" : cssStr + val, "-moz-filter" : cssStr + val, "-o-filter" : cssStr + val, "-ms-filter" : cssStr + val, "filter" : cssStr + val});
	  } else if(e.target.id === "filter-input-hue-rotate"){
		  var val = ` hue-rotate(${this.value}deg)`;
		  one("#current-hue-rotate").innerHTML = `${this.value}deg`;
		  Object.assign($mainImage.style, {"-webkit-filter" : cssStr + val, "-moz-filter" : cssStr + val, "-o-filter" : cssStr + val, "-ms-filter" : cssStr + val, "filter" : cssStr + val});
	  } else if(e.target.id === "filter-input-drop-shadow"){
		  var val = ` drop-shadow(${this.value})`;
		  one("#current-drop-shadow").innerHTML = `${this.value}`;
		  Object.assign($mainImage.style, {"-webkit-filter" : cssStr + val, "-moz-filter" : cssStr + val, "-o-filter" : cssStr + val, "-ms-filter" : cssStr + val, "filter" : cssStr + val});
	  } else {
		  var filter = e.target.id.replace("filter-input-",""), val = ` ${filter}(${this.value}%)`;
		  one("#current-"+filter).innerHTML = `${this.value}%`;
		  Object.assign($mainImage.style, {"-webkit-filter" : cssStr + val, "-moz-filter" : cssStr + val, "-o-filter" : cssStr + val, "-ms-filter" : cssStr + val, "filter" : cssStr + val});
	  }
  }, {target : ["#widgets-controls-panel select", "#widgets-controls-panel input"]});
  
  on(one("#widgets-gallery-panel input"), "change", function(e){
	  if(e.target.id === "widgets-gallery-file-input"){
		  var content, targetElem = one("#widgets-gallery-panel-thumbnails");
		  readAsImage(e||this, function(url, blob){
			  var span = document.createElement('span');
			  span.className = "thumb";
			  span.innerHTML = ['<img src="', url, '" alt="', escape(blob.name), '" title="', escape(blob.name), '"/>'].join('');
			  targetElem.insertBefore(span, null);
		  });
	  }
	  return;
  });
  on(document, "click", function(e){
    var _this = this, $mainImage = one("#main-image"), imgs = all(".pre-filters img"), zoomReset = one("#filter-zoom-reset"), thumbs = all("#widgets-gallery-panel-thumbnails .thumb"), width = this.naturalWidth, height = this.naturalHeight;
    forEach(thumbs, function(thumb){if(is.element(thumb) && thumb.classList.contains("active")) thumb.classList.remove("active");})
    this.parentElement.classList. add("active");
    $mainImage.src = this.src;
    Object.assign($mainImage.style, {"width" : width+"px", "height" : height+"px"});
    forEach(imgs, function(img){if(is.element(img)) img.src = _this.src});
    zoomReset.setAttribute("data-img-width" ,$mainImage.clientWidth);
    zoomReset.setAttribute("data-img-height" ,$mainImage.clientHeight);
  }, {target :"#widgets-gallery-panel-thumbnails .thumb img"});
  
  on(one("#dark-mode-toggler"), "change", function(e){
    if(document.body.classList.contains("dark-mode")){
      document.body.classList.remove("dark-mode");
    } else document.body.classList.add("dark-mode");
  });
  // ----------------------------------------------------------------------------------
  qtabs("#filter-widget-tabs");
}, false);
