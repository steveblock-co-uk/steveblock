function Size(width, height) {
  this.width = width;
  this.height = height;
}

Size.prototype.AspectRatio = function() {
  return this.width / this.height;
}

// Function to fit an object to a given box
function FitToBoundingBox(boxSize, objectSize) {
  if (objectSize.width <= boxSize.width && objectSize.height <= boxSize.height)
    return objectSize;
  var objectAR = objectSize.AspectRatio();
  if (objectAR > boxSize.AspectRatio()) // width limits
    return new Size(boxSize.width, boxSize.width / objectAR);
  return new Size(boxSize.height * objectAR, boxSize.height);
}
