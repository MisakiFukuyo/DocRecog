import * as imageConverter from './image-converter.es6'
import * as imageProcedure from './image-procedure.es6'

window.addEventListener('load',function(){
  var orig = imageConverter.imageToCanvas(document.querySelector('img.sample1'),{scale:0.25})
  //var gray = imageConverter.grayScale(orig)
  //var bin = imageConverter.adaptiveThresholdBinary(gray)
  var bin = orig
  document.body.appendChild(bin)
  var binaryImageData = bin.getContext('2d').getImageData(0,0,bin.width,bin.height)
  var binaryPixels = binaryImageData.data;
  var binaries = new Array(bin.width * bin.height)
  for(var i=0;i<binaries.length;i++){
    binaries[i] = binaryPixels[i * 4]
  }
  var allContours = imageProcedure.traceContours(binaries,bin.width,bin.height,10000)
  console.log(allContours.length)
  allContours.forEach(function(e){e.forEach(function(ei){
    binaryPixels[ei*4] = 255
    binaryPixels[ei*4+1] = 0
    binaryPixels[ei*4+2] = 0
  })})
  bin.getContext('2d').putImageData(binaryImageData,0,0)
})
