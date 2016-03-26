import * as gaussianBlur from './fastest-gaussian-blur.es6'

function imageToCanvas(img,options = {scale:1.0}){
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  canvas.width = parseInt(img.width * options.scale)
  canvas.height = parseInt(img.height * options.scale)
  ctx.drawImage(img, 0, 0,img.width ,img.height,0,0,canvas.width,canvas.height)
  return canvas
}

function grayScale(canvas,options = {}){
  var ctx = canvas.getContext('2d')
  var grayCanvas = document.createElement('canvas')
  grayCanvas.width = canvas.width
  grayCanvas.height = canvas.height
  var grayCtx = grayCanvas.getContext('2d')
  var grayImgData = grayCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height)
  var grayPixels = grayImgData.data

  var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  var pl = canvas.width * canvas.height;
  for(var i=0;i<pl;i++){
    var p = i*4;
    var n = Math.floor(pixels[p] * 0.299 + pixels[p+1] * 0.587 + pixels[p+2] * 0.114)
    grayPixels[p]  = n
    grayPixels[p+1]  = n
    grayPixels[p+2]  = n
    grayPixels[p+3]  = pixels[p+3]
  }

  grayCtx.putImageData(grayImgData,0,0)

  return grayCanvas
}

function otsuThresholdBinary(grayCanvas,options={}){
  var grayCtx = grayCanvas.getContext('2d')
  var binCanvas = document.createElement('canvas')
  binCanvas.width = grayCanvas.width
  binCanvas.height = grayCanvas.height
  var grayPixels = grayCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height).data
  var pl = binCanvas.width * binCanvas.height;

  var histogram = new Array(256)
  for(var i=0;i<256;i++){
    histogram[i] = 0
  }
  for(var i=0;i<pl;i++){
    histogram[grayPixels[i*4]]++
  }
  var sum = 0
  histogram.forEach(function(e,i){sum += i * e})
  var bgWeight = 0
  var fgWeight = 0
  var bgSum = 0
  var varianceNow = 0
  var threshold = 0
  for(var i=0;i<256;i++){
    bgWeight += histogram[i]
    if(bgWeight == 0){
      continue
    }

    fgWeight = pl - bgWeight
    if(fgWeight == 0){
      break
    }

    bgSum += i * histogram[i]

    var bgMean = bgSum / bgWeight
    var fgMean = (sum - bgSum) / fgWeight

    var varianceBetween = bgWeight * fgWeight * (bgMean - fgMean) * (bgMean - fgMean)

    if (varianceBetween > varianceNow) {
      varianceNow = varianceBetween;
      threshold = i;
   }
  }

  var binCtx = binCanvas.getContext('2d')
  var binImgData = binCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height)
  var binPixels = binImgData.data

  console.log( threshold)

  for(i=0;i<pl;i++){
    var p = i * 4
    var n = grayPixels[p] > threshold ? 255 : 0
    binPixels[p] = n
    binPixels[p+1] = n
    binPixels[p+2] = n
    binPixels[p+3] = 255
  }

  binCtx.putImageData(binImgData,0,0)

  return binCanvas
}

function adaptiveThresholdBinary(grayCanvas,options={size:16}){
  var grayCtx = grayCanvas.getContext('2d')
  var grayPixels = grayCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height).data

  var thresholdPixels = new Array(grayCanvas.width * grayCanvas.height)
  var oneChannelGray = new Array(grayCanvas.width * grayCanvas.height)

  for(var i=0;i<oneChannelGray.length;i++){
    oneChannelGray[i] = grayPixels[i*4]
  }

  gaussianBlur.compute(oneChannelGray,thresholdPixels,grayCanvas.width,grayCanvas.height,options.size)

  var binCanvas = document.createElement('canvas')
  binCanvas.width = grayCanvas.width
  binCanvas.height = grayCanvas.height
  var binCtx = binCanvas.getContext('2d')

  var l = binCanvas.width * binCanvas.height

  var binImgData = binCtx.getImageData(0, 0, grayCanvas.width, grayCanvas.height)
  var binPixels = binImgData.data

  for(var i=0;i<l;i++){
    var p = i *4
    var n = grayPixels[p] > thresholdPixels[i] ? 255 : 0
    binPixels[p] = n
    binPixels[p+1] = n
    binPixels[p+2] = n
    binPixels[p+3] = 255
  }

  binCtx.putImageData(binImgData,0,0)

  return binCanvas
}

export {imageToCanvas,grayScale,otsuThresholdBinary,adaptiveThresholdBinary}
