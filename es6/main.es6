import * as imageConverter from './image-converter.es6'
import * as imageProcedure from './image-procedure.es6'
import * as highLevelUtils from './high-utils.es6'

window.addEventListener('load',function(){
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

  var overlayCanvas = document.createElement('canvas')
  var overlayCtx = overlayCanvas.getContext('2d')
  overlayCanvas.width = 1280
  overlayCanvas.height = 720
  document.body.appendChild(overlayCanvas)

  window.epsilon = 4.4

  var fps = 15;
  function draw() {
      setTimeout(function() {
          requestAnimationFrame(draw);
          var orig = imageConverter.imageToCanvas(document.querySelector('video'),{scale:1,overloadingX:1280,overloadingY:720})
          var gray = imageConverter.grayScale(orig)
          var bin = imageConverter.adaptiveThresholdBinary(gray,{size:64})
          var binaryImageData = bin.getContext('2d').getImageData(0,0,bin.width,bin.height)
          var binaryPixels = binaryImageData.data;
          var binariesTri = new Array(bin.width * bin.height)
          var binariesSqr = new Array(bin.width * bin.height)
          for(var i=0;i<binariesTri.length;i++){
            binariesTri[i] = binaryPixels[i * 4]
            binariesSqr[i] = binaryPixels[i * 4]
          }

          var triContours = imageProcedure.traceContours(binariesTri,bin.width,bin.height,300,900)
          var sqrContours = imageProcedure.traceContours(binariesSqr,bin.width,bin.height,1400,3000)

          function indexToXY(p,width){
            var x = p % width
            var y = (p - x) / width
            return {x,y}
          }

          var triangle = []
          triContours.forEach(function(contour){
            var points = []
            contour.forEach(function(p){
              points.push(indexToXY(p,bin.width))
            })
            var poly = imageProcedure.getPolygonRamerDouglasPeucker(points,window.epsilon)
            if(poly.length == 3){
              triangle.push(poly)
            }
          })

          var square = []
          sqrContours.forEach(function(contour){
            var points = []
            contour.forEach(function(p){
              points.push(indexToXY(p,bin.width))
            })
            var poly = imageProcedure.getPolygonRamerDouglasPeucker(points,window.epsilon)
            if(poly.length == 4){
              square.push(poly)
            }
          })

          overlayCtx.drawImage(orig,0,0,1280,720)

          var marker = []
          square.forEach(function(s){
            triangle.forEach(function(t){
              if(highLevelUtils.isPointsInnerPoints(s,t)){
                marker.push(s)
              }
            })
          })

          marker.forEach(function(e){
            for(var i=0;i<e.length;i++){
              var x = e[i].x
              var y = e[i].y
              overlayCtx.fillStyle = '#ff0000'
              overlayCtx.beginPath();
              overlayCtx.arc(x,y,7,0,Math.PI*2,true);
              overlayCtx.closePath();
              overlayCtx.fill();
            }
          })

          square.forEach(function(e){
            for(var i=0;i<e.length;i++){
              var x = e[i].x
              var y = e[i].y
              overlayCtx.fillStyle = '#00ff00'
              overlayCtx.beginPath();
              overlayCtx.arc(x,y,5,0,Math.PI*2,true);
              overlayCtx.closePath();
              overlayCtx.fill();
            }
          })

          triangle.forEach(function(e){
            for(var i=0;i<e.length;i++){
              var x = e[i].x
              var y = e[i].y
              overlayCtx.fillStyle = '#0000ff'
              overlayCtx.beginPath();
              overlayCtx.arc(x,y,3,0,Math.PI*2,true);
              overlayCtx.closePath();
              overlayCtx.fill();
            }
          })

      }, 1000 / fps);
  }
  draw()
})
