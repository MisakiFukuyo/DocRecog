//reference
// 画像処理におけるアルゴリズム - http://homepage2.nifty.com/tsugu/sotuken/ronbun/sec3-2.html#0014

function get8(i,width,height){
  var u = i - width
  var d = i + width
  var r = i + 1
  var left = i % width === 0
  var right = r % width === 0
  var top = u < 0
  var bottom = d >= (width * height)
  var arr8 = []
  arr8[0] = (left || top) ? -1 : (u - 1)
  arr8[1] = (top) ? -1 : (u)
  arr8[2] = (right || top) ? -1 : (u + 1)

  arr8[3] = (left) ? -1 : (i - 1)
  arr8[4] = (right) ? -1 : (i + 1)

  arr8[5] = (left || bottom) ? -1 : (d - 1)
  arr8[6] = (bottom) ? -1 : (d)
  arr8[7] = (right || bottom) ? -1 : (d + 1)

  return arr8
}

function getCandidatesIdxToPrevious(px,py,idx){
  var ils1 = function(i){
    if(i==0){
      return [+1,-1]
    }
    if(i==1){
      return [0,-1]
    }
    if(i==2){
      return [-1,-1]
    }
    if(i==3){
      return [-1,0]
    }
    if(i==4){
      return [-1,+1]
    }
    if(i==5){
      return [0,+1]
    }
    if(i==6){
      return [+1,+1]
    }
    if(i==7){
      return [-1,0]
    }
  }

  var ils2 = function(i){
    if(i==0){
      return [-1,-1]
    }
    if(i==1){
      return [-1,0]
    }
    if(i==2){
      return [-1,+1]
    }
    if(i==3){
      return [0,+1]
    }
    if(i==4){
      return [+1,+1]
    }
    if(i==5){
      return [+1,0]
    }
    if(i==6){
      return [+1,-1]
    }
    if(i==7){
      return [0,-1]
    }
  }

  var ils3 = function(i){
    if(i==0){
      return [-1,+1]
    }
    if(i==1){
      return [0,+1]
    }
    if(i==2){
      return [+1,+1]
    }
    if(i==3){
      return [+1,0]
    }
    if(i==4){
      return [+1,-1]
    }
    if(i==5){
      return [0,-1]
    }
    if(i==6){
      return [-1,-1]
    }
    if(i==7){
      return [-1,0]
    }
  }

  var ils4 = function(i){
    if(i==0){
      return [+1,+1]
    }
    if(i==1){
      return [+1,0]
    }
    if(i==2){
      return [+1,-1]
    }
    if(i==3){
      return [0,-1]
    }
    if(i==4){
      return [-1,-1]
    }
    if(i==5){
      return [-1,0]
    }
    if(i==6){
      return [-1,+1]
    }
    if(i==7){
      return [0,+1]
    }
  }

  if(px == 0){
    if(py > 0){
      return ils3(idx)
    }else{
      return ils1(idx)
    }
  }else if(px > 0){
    if(py > 0){
      return ils3(idx)
    }else{
      return ils4(idx)
    }
  }else{
    if(py < 0){
      return ils1(idx)
    }else{
      return ils2(idx)
    }
  }
}

function getNextContoursCandidates(binaries,px,py,i,width,height){
  var a8 = get8(i,width,height)

  function gf(ai){
     return ai < 0 ? 255 : binaries[ai]
  }

  var f1 = function(){
    return [gf(a8[2]),gf(a8[1]),gf(a8[0]),gf(a8[3]),gf(a8[5]),gf(a8[6]),gf(a8[7]),gf(a8[4])]
  }

  var f2 = function(){
    return [gf(a8[0]),gf(a8[3]),gf(a8[5]),gf(a8[6]),gf(a8[7]),gf(a8[4]),gf(a8[2]),gf(a8[1])]
  }

  var f3 = function(){
    return [gf(a8[5]),gf(a8[6]),gf(a8[7]),gf(a8[4]),gf(a8[2]),gf(a8[1]),gf(a8[0]),gf(a8[3])]
  }

  var f4 = function(){
    return [gf(a8[7]),gf(a8[4]),gf(a8[2]),gf(a8[1]),gf(a8[0]),gf(a8[3]),gf(a8[5]),gf(a8[6])]
  }

  if(px == 0){
    if(py > 0){
      return f3()
    }else{
      return f1()
    }
  }else if(px > 0){
    if(py > 0){
      return f3()
    }else{
      return f4()
    }
  }else{
    if(py < 0){
      return f1()
    }else{
      return f2()
    }
  }
}

function getNextIdxFromNextPrevious(i,width,nextPreviousXY){
  return i + nextPreviousXY[1] * width + nextPreviousXY[0]
}

function traceContours(binaries,width,height,sizeMin,sizeMax){
  var l = width*height
  var allContours = []
  for(var i=0;i<l;i++){
    var npxy = [1,1]
    if(binaries[i] < 128){
      var contoursN = []
      var ncc = getNextContoursCandidates(binaries,1,1,i,width,height)
      var q = 0
      var pi = i
      while(q <= 8){
        if(ncc[q] < 128){
          npxy = getCandidatesIdxToPrevious(npxy[0],npxy[1],q)
          pi = getNextIdxFromNextPrevious(pi,width,npxy)
          contoursN.push(pi)
          ncc = getNextContoursCandidates(binaries,npxy[0],npxy[1],pi,width,height)
          q = 0
          if(pi == i){
            break
          }
        }else{
          q++
        }
      }
      var contoursNSize = 0
      contoursN.forEach(function(ei){
        while(binaries[ei] < 128){
          binaries[ei] = 255
          ei++
          contoursNSize++
        }
      })
      if(contoursNSize > sizeMin && contoursNSize < sizeMax){
        allContours.push(contoursN)
      }
    }
  }
  return allContours
}

function getPolygonRamerDouglasPeucker(points,epsilon){
  return simplify(points, epsilon, true).slice(1)
}

export {traceContours,getPolygonRamerDouglasPeucker}
