import * as imageConverter from './image-converter.es6'
import * as imageProcedure from './image-procedure.es6'

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
          var binaries = new Array(bin.width * bin.height)
          for(var i=0;i<binaries.length;i++){
            binaries[i] = binaryPixels[i * 4]
          }

          var allContours = imageProcedure.traceContours(binaries,bin.width,bin.height,50,1600)

          function indexToXY(p,width){
            var x = p % width
            var y = (p - x) / width
            return {x,y}
          }

          var allPolygons = []
          allContours.forEach(function(contour){
            var points = []
            contour.forEach(function(p){
              points.push(indexToXY(p,bin.width))
            })
            allPolygons.push(imageProcedure.getPolygonRamerDouglasPeucker(points,window.epsilon))
          })

          overlayCtx.drawImage(orig,0,0,1280,720)

          allPolygons.forEach(function(e){
            if(e.length == 4){
              for(var i=0;i<e.length;i++){
                var x = e[i].x
                var y = e[i].y
                overlayCtx.fillStyle = '#00ff00'
                overlayCtx.beginPath();
                overlayCtx.arc(x,y,4,0,Math.PI*2,true);
                overlayCtx.closePath();
                overlayCtx.fill();
              }
            }
            if(e.length == 3){
              for(var i=0;i<e.length;i++){
                var x = e[i].x
                var y = e[i].y
                overlayCtx.fillStyle = '#0000ff'
                overlayCtx.beginPath();
                overlayCtx.arc(x,y,4,0,Math.PI*2,true);
                overlayCtx.closePath();
                overlayCtx.fill();
              }
            }
          })
      }, 1000 / fps);
  }
  draw()
})
