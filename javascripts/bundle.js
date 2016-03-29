/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _imageConverter = __webpack_require__(1);

	var imageConverter = _interopRequireWildcard(_imageConverter);

	var _imageProcedure = __webpack_require__(3);

	var imageProcedure = _interopRequireWildcard(_imageProcedure);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	window.addEventListener('load', function () {
	  var video = document.querySelector("video");

	  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

	  if (navigator.getUserMedia) {
	    navigator.getUserMedia({
	      video: {
	        mandatory: {
	          minWidth: 1280,
	          minHeight: 720
	        }
	      }
	    }, handleVideo, videoError);
	  }

	  function handleVideo(stream) {
	    video.src = window.URL.createObjectURL(stream);
	  }

	  function videoError(e) {
	    // no webcam found
	  }

	  var overlayCanvas = document.createElement('canvas');
	  var overlayCtx = overlayCanvas.getContext('2d');
	  overlayCanvas.width = 1280;
	  overlayCanvas.height = 720;
	  document.body.appendChild(overlayCanvas);

	  window.epsilon = 4.4;

	  var fps = 15;
	  function draw() {
	    setTimeout(function () {
	      requestAnimationFrame(draw);
	      var orig = imageConverter.imageToCanvas(document.querySelector('video'), { scale: 1, overloadingX: 1280, overloadingY: 720 });
	      var gray = imageConverter.grayScale(orig);
	      var bin = imageConverter.adaptiveThresholdBinary(gray, { size: 64 });
	      var binaryImageData = bin.getContext('2d').getImageData(0, 0, bin.width, bin.height);
	      var binaryPixels = binaryImageData.data;
	      var binaries = new Array(bin.width * bin.height);
	      for (var i = 0; i < binaries.length; i++) {
	        binaries[i] = binaryPixels[i * 4];
	      }

	      var allContours = imageProcedure.traceContours(binaries, bin.width, bin.height, 50, 1600);

	      function indexToXY(p, width) {
	        var x = p % width;
	        var y = (p - x) / width;
	        return { x: x, y: y };
	      }

	      var allPolygons = [];
	      allContours.forEach(function (contour) {
	        var points = [];
	        contour.forEach(function (p) {
	          points.push(indexToXY(p, bin.width));
	        });
	        allPolygons.push(imageProcedure.getPolygonRamerDouglasPeucker(points, window.epsilon));
	      });

	      overlayCtx.drawImage(orig, 0, 0, 1280, 720);

	      allPolygons.forEach(function (e) {
	        if (e.length == 4) {
	          for (var i = 0; i < e.length; i++) {
	            var x = e[i].x;
	            var y = e[i].y;
	            overlayCtx.fillStyle = '#00ff00';
	            overlayCtx.beginPath();
	            overlayCtx.arc(x, y, 4, 0, Math.PI * 2, true);
	            overlayCtx.closePath();
	            overlayCtx.fill();
	          }
	        }
	        if (e.length == 3) {
	          for (var i = 0; i < e.length; i++) {
	            var x = e[i].x;
	            var y = e[i].y;
	            overlayCtx.fillStyle = '#0000ff';
	            overlayCtx.beginPath();
	            overlayCtx.arc(x, y, 4, 0, Math.PI * 2, true);
	            overlayCtx.closePath();
	            overlayCtx.fill();
	          }
	        }
	      });
	    }, 1000 / fps);
	  }
	  draw();
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.adaptiveThresholdBinary = exports.otsuThresholdBinary = exports.grayScale = exports.imageToCanvas = undefined;

	var _fastestGaussianBlur = __webpack_require__(2);

	var gaussianBlur = _interopRequireWildcard(_fastestGaussianBlur);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function imageToCanvas(img) {
	  var options = arguments.length <= 1 || arguments[1] === undefined ? { scale: 1.0 } : arguments[1];

	  var canvas = document.createElement('canvas');
	  var ctx = canvas.getContext('2d');
	  canvas.width = parseInt(options.overloadingX ? options.overloadingX : img.width * options.scale);
	  canvas.height = parseInt(options.overloadingY ? options.overloadingY : img.height * options.scale);
	  ctx.drawImage(img, 0, 0, options.overloadingX ? options.overloadingX : img.width, options.overloadingY ? options.overloadingY : img.height, 0, 0, canvas.width, canvas.height);
	  return canvas;
	}

	function grayScale(canvas) {
	  var options = arguments.length <= 1 || arguments[1] === undefined ? { alpha: true } : arguments[1];

	  var ctx = canvas.getContext('2d');
	  var grayCanvas = document.createElement('canvas');
	  grayCanvas.width = canvas.width;
	  grayCanvas.height = canvas.height;
	  var grayCtx = grayCanvas.getContext('2d');
	  var grayImgData = grayCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height);
	  var grayPixels = grayImgData.data;

	  var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	  var pl = canvas.width * canvas.height;
	  for (var i = 0; i < pl; i++) {
	    var p = i * 4;
	    var n = Math.floor(pixels[p] * 0.299 + pixels[p + 1] * 0.587 + pixels[p + 2] * 0.114);
	    grayPixels[p] = n;
	    grayPixels[p + 1] = n;
	    grayPixels[p + 2] = n;
	    grayPixels[p + 3] = pixels[p + 3];
	  }

	  grayCtx.putImageData(grayImgData, 0, 0);

	  return grayCanvas;
	}

	function otsuThresholdBinary(grayCanvas) {
	  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	  var grayCtx = grayCanvas.getContext('2d');
	  var binCanvas = document.createElement('canvas');
	  binCanvas.width = grayCanvas.width;
	  binCanvas.height = grayCanvas.height;
	  var grayPixels = grayCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height).data;
	  var pl = binCanvas.width * binCanvas.height;

	  var histogram = new Array(256);
	  for (var i = 0; i < 256; i++) {
	    histogram[i] = 0;
	  }
	  for (var i = 0; i < pl; i++) {
	    histogram[grayPixels[i * 4]]++;
	  }
	  var sum = 0;
	  histogram.forEach(function (e, i) {
	    sum += i * e;
	  });
	  var bgWeight = 0;
	  var fgWeight = 0;
	  var bgSum = 0;
	  var varianceNow = 0;
	  var threshold = 0;
	  for (var i = 0; i < 256; i++) {
	    bgWeight += histogram[i];
	    if (bgWeight == 0) {
	      continue;
	    }

	    fgWeight = pl - bgWeight;
	    if (fgWeight == 0) {
	      break;
	    }

	    bgSum += i * histogram[i];

	    var bgMean = bgSum / bgWeight;
	    var fgMean = (sum - bgSum) / fgWeight;

	    var varianceBetween = bgWeight * fgWeight * (bgMean - fgMean) * (bgMean - fgMean);

	    if (varianceBetween > varianceNow) {
	      varianceNow = varianceBetween;
	      threshold = i;
	    }
	  }

	  var binCtx = binCanvas.getContext('2d');
	  var binImgData = binCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height);
	  var binPixels = binImgData.data;

	  console.log(threshold);

	  for (i = 0; i < pl; i++) {
	    var p = i * 4;
	    var n = grayPixels[p] > threshold ? 255 : 0;
	    binPixels[p] = n;
	    binPixels[p + 1] = n;
	    binPixels[p + 2] = n;
	    binPixels[p + 3] = 255;
	  }

	  binCtx.putImageData(binImgData, 0, 0);

	  return binCanvas;
	}

	function adaptiveThresholdBinary(grayCanvas) {
	  var options = arguments.length <= 1 || arguments[1] === undefined ? { size: 16 } : arguments[1];

	  var grayCtx = grayCanvas.getContext('2d');
	  var grayPixels = grayCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height).data;

	  var thresholdPixels = new Array(grayCanvas.width * grayCanvas.height);
	  var oneChannelGray = new Array(grayCanvas.width * grayCanvas.height);

	  for (var i = 0; i < oneChannelGray.length; i++) {
	    oneChannelGray[i] = grayPixels[i * 4];
	  }

	  gaussianBlur.compute(oneChannelGray, thresholdPixels, grayCanvas.width, grayCanvas.height, options.size);

	  var binCanvas = document.createElement('canvas');
	  binCanvas.width = grayCanvas.width;
	  binCanvas.height = grayCanvas.height;
	  var binCtx = binCanvas.getContext('2d');

	  var l = binCanvas.width * binCanvas.height;

	  var binImgData = binCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height);
	  var binPixels = binImgData.data;

	  for (var i = 0; i < l; i++) {
	    var p = i * 4;
	    var n = grayPixels[p] > thresholdPixels[i] ? 255 : 0;
	    binPixels[p] = n;
	    binPixels[p + 1] = n;
	    binPixels[p + 2] = n;
	    binPixels[p + 3] = 255;
	  }

	  binCtx.putImageData(binImgData, 0, 0);

	  return binCanvas;
	}

	exports.imageToCanvas = imageToCanvas;
	exports.grayScale = grayScale;
	exports.otsuThresholdBinary = otsuThresholdBinary;
	exports.adaptiveThresholdBinary = adaptiveThresholdBinary;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/*
	http://blog.ivank.net/fastest-gaussian-blur.html

	The MIT License (MIT)
	Copyright (c) 2010 - 2014 Ivan Kuckir

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/

	function boxesForGauss(sigma, n) // standard deviation, number of boxes
	{
	    var wIdeal = Math.sqrt(12 * sigma * sigma / n + 1); // Ideal averaging filter width
	    var wl = Math.floor(wIdeal);if (wl % 2 == 0) wl--;
	    var wu = wl + 2;

	    var mIdeal = (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4);
	    var m = Math.round(mIdeal);
	    // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );

	    var sizes = [];for (var i = 0; i < n; i++) {
	        sizes.push(i < m ? wl : wu);
	    }return sizes;
	}
	function gaussBlur_4(scl, tcl, w, h, r) {
	    var bxs = boxesForGauss(r, 3);
	    boxBlur_4(scl, tcl, w, h, (bxs[0] - 1) / 2);
	    boxBlur_4(tcl, scl, w, h, (bxs[1] - 1) / 2);
	    boxBlur_4(scl, tcl, w, h, (bxs[2] - 1) / 2);
	}
	function boxBlur_4(scl, tcl, w, h, r) {
	    for (var i = 0; i < scl.length; i++) {
	        tcl[i] = scl[i];
	    }boxBlurH_4(tcl, scl, w, h, r);
	    boxBlurT_4(scl, tcl, w, h, r);
	}
	function boxBlurH_4(scl, tcl, w, h, r) {
	    var iarr = 1 / (r + r + 1);
	    for (var i = 0; i < h; i++) {
	        var ti = i * w,
	            li = ti,
	            ri = ti + r;
	        var fv = scl[ti],
	            lv = scl[ti + w - 1],
	            val = (r + 1) * fv;
	        for (var j = 0; j < r; j++) {
	            val += scl[ti + j];
	        }for (var j = 0; j <= r; j++) {
	            val += scl[ri++] - fv;tcl[ti++] = Math.round(val * iarr);
	        }
	        for (var j = r + 1; j < w - r; j++) {
	            val += scl[ri++] - scl[li++];tcl[ti++] = Math.round(val * iarr);
	        }
	        for (var j = w - r; j < w; j++) {
	            val += lv - scl[li++];tcl[ti++] = Math.round(val * iarr);
	        }
	    }
	}
	function boxBlurT_4(scl, tcl, w, h, r) {
	    var iarr = 1 / (r + r + 1);
	    for (var i = 0; i < w; i++) {
	        var ti = i,
	            li = ti,
	            ri = ti + r * w;
	        var fv = scl[ti],
	            lv = scl[ti + w * (h - 1)],
	            val = (r + 1) * fv;
	        for (var j = 0; j < r; j++) {
	            val += scl[ti + j * w];
	        }for (var j = 0; j <= r; j++) {
	            val += scl[ri] - fv;tcl[ti] = Math.round(val * iarr);ri += w;ti += w;
	        }
	        for (var j = r + 1; j < h - r; j++) {
	            val += scl[ri] - scl[li];tcl[ti] = Math.round(val * iarr);li += w;ri += w;ti += w;
	        }
	        for (var j = h - r; j < h; j++) {
	            val += lv - scl[li];tcl[ti] = Math.round(val * iarr);li += w;ti += w;
	        }
	    }
	}

	exports.compute = gaussBlur_4;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	//reference
	// 画像処理におけるアルゴリズム - http://homepage2.nifty.com/tsugu/sotuken/ronbun/sec3-2.html#0014

	function get8(i, width, height) {
	  var u = i - width;
	  var d = i + width;
	  var r = i + 1;
	  var left = i % width === 0;
	  var right = r % width === 0;
	  var top = u < 0;
	  var bottom = d >= width * height;
	  var arr8 = [];
	  arr8[0] = left || top ? -1 : u - 1;
	  arr8[1] = top ? -1 : u;
	  arr8[2] = right || top ? -1 : u + 1;

	  arr8[3] = left ? -1 : i - 1;
	  arr8[4] = right ? -1 : i + 1;

	  arr8[5] = left || bottom ? -1 : d - 1;
	  arr8[6] = bottom ? -1 : d;
	  arr8[7] = right || bottom ? -1 : d + 1;

	  return arr8;
	}

	function getCandidatesIdxToPrevious(px, py, idx) {
	  var ils1 = function ils1(i) {
	    if (i == 0) {
	      return [+1, -1];
	    }
	    if (i == 1) {
	      return [0, -1];
	    }
	    if (i == 2) {
	      return [-1, -1];
	    }
	    if (i == 3) {
	      return [-1, 0];
	    }
	    if (i == 4) {
	      return [-1, +1];
	    }
	    if (i == 5) {
	      return [0, +1];
	    }
	    if (i == 6) {
	      return [+1, +1];
	    }
	    if (i == 7) {
	      return [-1, 0];
	    }
	  };

	  var ils2 = function ils2(i) {
	    if (i == 0) {
	      return [-1, -1];
	    }
	    if (i == 1) {
	      return [-1, 0];
	    }
	    if (i == 2) {
	      return [-1, +1];
	    }
	    if (i == 3) {
	      return [0, +1];
	    }
	    if (i == 4) {
	      return [+1, +1];
	    }
	    if (i == 5) {
	      return [+1, 0];
	    }
	    if (i == 6) {
	      return [+1, -1];
	    }
	    if (i == 7) {
	      return [0, -1];
	    }
	  };

	  var ils3 = function ils3(i) {
	    if (i == 0) {
	      return [-1, +1];
	    }
	    if (i == 1) {
	      return [0, +1];
	    }
	    if (i == 2) {
	      return [+1, +1];
	    }
	    if (i == 3) {
	      return [+1, 0];
	    }
	    if (i == 4) {
	      return [+1, -1];
	    }
	    if (i == 5) {
	      return [0, -1];
	    }
	    if (i == 6) {
	      return [-1, -1];
	    }
	    if (i == 7) {
	      return [-1, 0];
	    }
	  };

	  var ils4 = function ils4(i) {
	    if (i == 0) {
	      return [+1, +1];
	    }
	    if (i == 1) {
	      return [+1, 0];
	    }
	    if (i == 2) {
	      return [+1, -1];
	    }
	    if (i == 3) {
	      return [0, -1];
	    }
	    if (i == 4) {
	      return [-1, -1];
	    }
	    if (i == 5) {
	      return [-1, 0];
	    }
	    if (i == 6) {
	      return [-1, +1];
	    }
	    if (i == 7) {
	      return [0, +1];
	    }
	  };

	  if (px == 0) {
	    if (py > 0) {
	      return ils3(idx);
	    } else {
	      return ils1(idx);
	    }
	  } else if (px > 0) {
	    if (py > 0) {
	      return ils3(idx);
	    } else {
	      return ils4(idx);
	    }
	  } else {
	    if (py < 0) {
	      return ils1(idx);
	    } else {
	      return ils2(idx);
	    }
	  }
	}

	function getNextContoursCandidates(binaries, px, py, i, width, height) {
	  var a8 = get8(i, width, height);

	  function gf(ai) {
	    return ai < 0 ? 255 : binaries[ai];
	  }

	  var f1 = function f1() {
	    return [gf(a8[2]), gf(a8[1]), gf(a8[0]), gf(a8[3]), gf(a8[5]), gf(a8[6]), gf(a8[7]), gf(a8[4])];
	  };

	  var f2 = function f2() {
	    return [gf(a8[0]), gf(a8[3]), gf(a8[5]), gf(a8[6]), gf(a8[7]), gf(a8[4]), gf(a8[2]), gf(a8[1])];
	  };

	  var f3 = function f3() {
	    return [gf(a8[5]), gf(a8[6]), gf(a8[7]), gf(a8[4]), gf(a8[2]), gf(a8[1]), gf(a8[0]), gf(a8[3])];
	  };

	  var f4 = function f4() {
	    return [gf(a8[7]), gf(a8[4]), gf(a8[2]), gf(a8[1]), gf(a8[0]), gf(a8[3]), gf(a8[5]), gf(a8[6])];
	  };

	  if (px == 0) {
	    if (py > 0) {
	      return f3();
	    } else {
	      return f1();
	    }
	  } else if (px > 0) {
	    if (py > 0) {
	      return f3();
	    } else {
	      return f4();
	    }
	  } else {
	    if (py < 0) {
	      return f1();
	    } else {
	      return f2();
	    }
	  }
	}

	function getNextIdxFromNextPrevious(i, width, nextPreviousXY) {
	  return i + nextPreviousXY[1] * width + nextPreviousXY[0];
	}

	function traceContours(binaries, width, height, sizeMin, sizeMax) {
	  var l = width * height;
	  var allContours = [];
	  for (var i = 0; i < l; i++) {
	    var npxy = [1, 1];
	    if (binaries[i] < 128) {
	      var contoursN = [];
	      var ncc = getNextContoursCandidates(binaries, 1, 1, i, width, height);
	      var q = 0;
	      var pi = i;
	      while (q <= 8) {
	        if (ncc[q] < 128) {
	          npxy = getCandidatesIdxToPrevious(npxy[0], npxy[1], q);
	          pi = getNextIdxFromNextPrevious(pi, width, npxy);
	          contoursN.push(pi);
	          ncc = getNextContoursCandidates(binaries, npxy[0], npxy[1], pi, width, height);
	          q = 0;
	          if (pi == i) {
	            break;
	          }
	        } else {
	          q++;
	        }
	      }
	      var contoursNSize = 0;
	      contoursN.forEach(function (ei) {
	        while (binaries[ei] < 128) {
	          binaries[ei] = 255;
	          ei++;
	          contoursNSize++;
	        }
	      });
	      if (contoursNSize > sizeMin && contoursNSize < sizeMax) {
	        allContours.push(contoursN);
	      }
	    }
	  }
	  return allContours;
	}

	function getConvexHull(allContours, width) {
	  var allConvexHullPoints = [];
	  allContours.forEach(function (contours) {
	    var convexHull = new ConvexHullGrahamScan();
	    contours.forEach(function (p) {
	      var x = p % width;
	      var y = (p - x) / width;
	      convexHull.addPoint(x, y);
	    });
	    allConvexHullPoints.push(convexHull.getHull());
	  });
	  return allConvexHullPoints;
	}

	function getPolygonRamerDouglasPeucker(points, epsilon) {
	  return simplify(points, epsilon, true).slice(1);
	}

	exports.traceContours = traceContours;
	exports.getConvexHull = getConvexHull;
	exports.getPolygonRamerDouglasPeucker = getPolygonRamerDouglasPeucker;

/***/ }
/******/ ]);