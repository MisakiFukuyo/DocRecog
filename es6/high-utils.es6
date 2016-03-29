// ref : http://www.hiramine.com/programming/graphics/2d_ispointinpolygon.html

function isPointInnerPoints(points,point){
  var crossingCount = 0
  var initialPoint = points[0]
  var xFlag = point.x <= initialPoint.x
  var yFlag = point.y <= initialPoint.y
  for(var i=1;i<=points.length;i++){
    var pointB = points[i % points.length]
    var xFlagB = point.x <= pointB.x
    var yFlagB = point.y <= pointB.y
    if(yFlag != yFlagB){
      if(xFlag == xFlagB && xFlag){
        crossingCount+= yFlag ? -1 : 1
      }else if(point.x <= (initialPoint.x + (pointB.x - initialPoint.x) * (point.y - initialPoint.y) / (pointB.y - initialPoint.y))){
        crossingCount+= yFlag ? -1 : 1
      }
    }
    initialPoint = pointB
    xFlagB = xFlag
    yFlagB = yFlag
  }
  return crossingCount != 0
}

function isPointsInnerPoints(pointsOuter,pointsInner){
  for(var i=0;i<pointsInner.length;i++){
    if(!isPointInnerPoints(pointsOuter,pointsInner[i])){
      return false
    }
  }
  return true
}

export {isPointsInnerPoints}
