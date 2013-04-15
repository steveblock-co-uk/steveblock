function Size( width, height ) {
  this.width=width;
  this.height=height;
}

Size.prototype.AspectRatio = function() {
  return this.width / this.height;
}

// Function to fit an object to a given box
function FitToBoundingBox(box, objectAR) {
  var boxAR    = box.AspectRatio();
  var resized = null;
  if( objectAR > boxAR ) { // width limits
    resized = new Size( box.width, box.width / objectAR );
  } else { // height limits
    resized = new Size( box.height * objectAR, box.height );
  }
  return resized;
}
