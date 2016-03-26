import * as imageConverter from './image-converter.es6'
import * as imageProcedure from './image-procedure.es6'

window.addEventListener('load',function(){
  var orig = imageConverter.imageToCanvas(document.querySelector('img.sample1'),{scale:0.25})
  var gray = imageConverter.grayScale(orig)
  var bin = imageConverter.adaptiveThresholdBinary(gray,{size:128})
  document.body.appendChild(orig)
  document.body.appendChild(bin)
  var binaryImageData = bin.getContext('2d').getImageData(0,0,bin.width,bin.height)
  var binaryPixels = binaryImageData.data;
  var binaries = new Array(bin.width * bin.height)
  for(var i=0;i<binaries.length;i++){
    binaries[i] = binaryPixels[i * 4]
  }
  var origImageData = orig.getContext('2d').getImageData(0,0,orig.width,orig.height)
  var origPixels = origImageData.data

  var allContours = imageProcedure.traceContours(binaries,bin.width,bin.height,1000)
  console.log(allContours.length)
  allContours.forEach(function(e){e.forEach(function(ei){
    origPixels[ei*4] = 255
    origPixels[ei*4+1] = 0
    origPixels[ei*4+2] = 0
  })})
  orig.getContext('2d').putImageData(origImageData,0,0)
})
