function CartesianPosition(x, y, z) {
  this.x_ = x;
  this.y_ = y;
  this.z_ = z;
}

CartesianPosition.prototype.toString = function() {
  return '(' + this.x_ + ', ' + this.y_ + ', ' + this.z_ + ')';
};

CartesianPosition.prototype.x = function() {
  return this.x_;
};

CartesianPosition.prototype.y = function() {
  return this.y_;
};

CartesianPosition.prototype.z = function() {
  return this.z_;
};

////

function LatLngPosition() {
  this.a_ = null;
  this.b_ = null;
  this.latitude_ = null;
  this.longitude_ = null;
  this.altitude_ = null;
  this.cartesian_ = null;

  if (arguments.length == 3) {
    this.initFromCartesian(arguments[0], arguments[1], arguments[2]);
  } else if (arguments.length == 5) {
    this.initFromLatLng(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
  } else {
    throw new Error('oops!');
  }
}

LatLngPosition.prototype.initFromCartesian = function(cartesian, a, b) {
  this.a_ = a;
  this.b_ = b;
  this.cartesian_ = cartesian;
}

LatLngPosition.prototype.initFromLatLng = function(latitude, longitude, altitude, a, b) {
  this.latitude_ = latitude;
  this.longitude_ = longitude;
  this.altitude_ = altitude;
  this.a_ = a;
  this.b_ = b;
}

LatLngPosition.prototype.toString = function() {
  this.maybeCalculateLatLngAlt_();
  return '(' + decimalToDegMinSec(this.latitude_) + ', ' + decimalToDegMinSec(this.longitude_) + ', ' + this.altitude_ + ', ' + this.a_ + ', ' + this.b_ + ')';
};

LatLngPosition.prototype.a = function() {
  return this.a_;
};

LatLngPosition.prototype.b = function() {
  return this.b_;
};

LatLngPosition.prototype.latitude = function() {
  this.maybeCalculateLatLngAlt_();
  return this.latitude_;
};

LatLngPosition.prototype.longitude = function() {
  this.maybeCalculateLatLngAlt_();
  return this.longitude_;
};

LatLngPosition.prototype.altitude = function() {
  this.maybeCalculateLatLngAlt_();
  return this.altitude_;
};

LatLngPosition.prototype.cartesian = function() {
  this.maybeCalculateCartesian_();
  return this.cartesian_;
};

LatLngPosition.prototype.maybeCalculateLatLngAlt_ = function() {
  if (this.latitude_ && this.longitude_ && this.altitude) {
    return;
  }

  var longitude = Math.atan2(this.cartesian_.y_, this.cartesian_.x_);
  this.longitude_ = radToDeg(longitude);

  var eSquared = 1 - Math.pow(this.b_ / this.a_, 2);
//console.log('e2 = ' + eSquared);
  var p = Math.sqrt(Math.pow(this.cartesian_.x_, 2) + Math.pow(this.cartesian_.y_, 2));

  var oldLatitude = 1000;
  var latitude = Math.atan(this.cartesian_.z_ / (p * (1 - eSquared)));
//console.log('lat = ' + this.latitude_);
  var precision = 0.000000001;
  while (Math.abs(latitude - oldLatitude) > precision) {
    var sinLatitude = Math.sin(latitude);
    var v = this.a_ / Math.sqrt(1 - eSquared * Math.pow(sinLatitude, 2));
//console.log('v = ' + v);
    oldLatitude = latitude;
    latitude = Math.atan2(this.cartesian_.z_ + eSquared * v * sinLatitude, p);
//console.log('lat = ' + latitude);
  }
  this.latitude_ = radToDeg(latitude);

  var cosLatitude = Math.cos(latitude);
  this.altitude_ = p / cosLatitude - v;
};

function secToRad(seconds) {
  return degToRad(seconds / 60.0 / 60.0);
}

function degToRad(degrees) {
  return degrees / 180.0 * Math.PI;
}

function radToDeg(radians) {
  return radians / Math.PI * 180.0;
}

function degMinSecToDecimal(degrees, minutes, seconds) {
  return degrees + (minutes + seconds / 60.0) / 60.0;
}

function secondsToHoursMinSec(seconds) {
  seconds = Math.floor(seconds);
  var hours = Math.floor(seconds / 60.0 / 60.0);
  if (hours > 0) {
    return hours + ' hours';
  }
  var minutes = Math.floor(seconds / 60.0);
  if (minutes > 0) {
    return minutes + ' minutes';
  }
  return seconds + ' seconds';
}

function decimalToDegMinSec(decimal, decimalPlaces) {
  // TODO: Fix problem where seconds can end up being rounded up to 60!
  var degrees = Math.floor(Math.abs(decimal));
  var fraction = Math.abs(decimal) % 1;
  var minutes = Math.floor(fraction * 60.0);
  fraction = (fraction * 60.0) % 1;
  var seconds = fraction * 60.0;
  if (typeof decimalPlaces == 'number') {
    seconds = Math.round(seconds * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    if (decimalPlaces > 0) {
      seconds = new String(seconds);
      if (seconds.indexOf('.') == -1) {
        seconds += '.0';
      }
      var dp = seconds.length - seconds.indexOf('.') - 1;
      for (var i = dp; i < decimalPlaces; i++) {
        seconds += '0';
      }
    }
  }
  return (decimal < 0 ? '-' : '') + degrees + '&deg;' + minutes + '\'' + seconds + '"';
}

function addSignSuffix(valueString, positiveSuffix, negativeSuffix) {
  if (valueString[0] == '-') {
    return valueString.substr(1) + negativeSuffix;
  }
  return valueString[0] == '+' ? valueString.substr(1) + positiveSuffix : valueString + positiveSuffix;
}

LatLngPosition.prototype.maybeCalculateCartesian_ = function() {
  if (this.cartesian_) {
    return;
  }

  var eSquared = 1 - Math.pow(this.b_ / this.a_, 2);
  var sinLatitude = Math.sin(degToRad(this.latitude_));
  var cosLatitude = Math.cos(degToRad(this.latitude_));
  var sinLongitude = Math.sin(degToRad(this.longitude_));
  var cosLongitude = Math.cos(degToRad(this.longitude_));

  var v = this.a_ / Math.sqrt(1 - eSquared * Math.pow(sinLatitude, 2));

  var x = (v + this.altitude_) * cosLatitude * cosLongitude;
  var y = (v + this.altitude_) * cosLatitude * sinLongitude;
  var z = ((1 - eSquared) * v + this.altitude_) * sinLatitude;

  this.cartesian_ = new CartesianPosition(x, y, z);
};

////

function GridCoordinate(easting, northing) {
  this.initFromEastingNorthing(easting, northing);
}

GridCoordinate.prototype.initFromEastingNorthing = function(easting, northing) {
  this.easting_ = easting;
  this.northing_ = northing;
}

GridCoordinate.prototype.easting = function() {
  return this.easting_;
};

GridCoordinate.prototype.northing = function() {
  return this.northing_;
};

GridCoordinate.prototype.toString = function() {
  return '(' + this.easting_ + ', ' + this.northing_ + ')';
};

////

function OSGridCoordinate() {
  if (arguments.length == 1) {
    var gridCoordinate = arguments[0];
    this.initFromEastingNorthing(gridCoordinate.easting(), gridCoordinate.northing());
  } else if (arguments.length == 2) {
    this.initFromEastingNorthing(arguments[0], arguments[1]);
  } else {
    throw new Error('oops!');
  }
}

OSGridCoordinate.prototype = new GridCoordinate;

function getCharacterByIndex(offset) {
  return String.fromCharCode('A'.charCodeAt(0) + offset);
}

OSGridCoordinate.prototype.toGridRefString = function(digits, useSquareCode) {
  var squareCode = '';
  
  if (useSquareCode) {
    // Get indices into 100km grid squares.
    // Numerical origin is at square (10, 19), with y axis flipped.
    var xSquare = 10 + Math.floor(this.easting_ / 1e5);
    var ySquare = 19 - Math.floor(this.northing_ / 1e5);

    // Apply pattern of square lettering.
    var letterOffset1 = Math.floor(ySquare / 5) * 5 + Math.floor(xSquare / 5);
    var letterOffset2 = (ySquare % 5) * 5 + xSquare%5;

    // Account for the fact that 'I' is skipped.
    if (letterOffset1 > 7) letterOffset1++;
    if (letterOffset2 > 7) letterOffset2++;

    // Convert to a letter.
    squareCode = getCharacterByIndex(letterOffset1)
        + getCharacterByIndex(letterOffset2);
  }

  // Get coordinate into 100km grid square.
  var x = this.easting_ % 1e5;
  var y = this.northing_ % 1e5;

  // Trim to required number of digits
  return squareCode
      + ' ' + (x / Math.pow(10, 5 - digits / 2)).printInt(digits / 2) 
      + ' ' + (y / Math.pow(10, 5 - digits / 2)).printInt(digits / 2);
};

Number.prototype.printInt = function(width) {
  var str = Math.floor(this).toString();
  var res = '';
  for (var i = 0; i < width - str.length; i++)
    res += '0';
  res += str;
  return res;
};

////


var DATUMS = {
  AIRY1830: {a:	6377563.396, b:	6356256.910},
  GRS80: {a: 6378137.000, b: 6356752.3141}
};
DATUMS.WGS84 = DATUMS.GRS80;

var TRANSFORMATIONS = {
  WGS84_TO_OSGB36: {
    t: {x: -446.448, y: 125.157, z: -542.060},
    r: {x: secToRad(-0.1502), y: secToRad(-0.2470), z: secToRad(-0.8421)},
    s: 20.4894 / 1e6
  }
};

var UTM_PARAMETERS = {
  OS: {
    N_0: -100000,       // northing of true origin, m
    E_0: 400000,        // easting of true origin, m
    F_0: 0.9996012717,  // scale factor on central meridian
    phi_0: 49.0,        // latitude of true origin, degrees
    lambda_0: -2.0      // longitude of true origin and central meridian, degrees
  }
};

// Transforms from one datum to another, in cartesian coordinates
function helmetTransform(cartesianPosition, t, r, s) {
  var x = t.x + (1 + s) * cartesianPosition.x() -     r.z * cartesianPosition.y() +     r.y * cartesianPosition.z();
  var y = t.y +     r.z * cartesianPosition.x() + (1 + s) * cartesianPosition.y() -     r.x * cartesianPosition.z();
  var z = t.z -     r.y * cartesianPosition.x() +     r.x * cartesianPosition.y() + (1 + s) * cartesianPosition.z();
  return new CartesianPosition(x, y, z);
}

// Converts from LatLng to UTM grid eastings and northings
function convertLatLngToUTMGrid(latLngPosition, N_0, E_0, F_0, phi_0, lambda_0) {
  var sinPhi = Math.sin(degToRad(latLngPosition.latitude()));
  var cosPhi = Math.cos(degToRad(latLngPosition.latitude()));
  var tanPhi = sinPhi / cosPhi;

  var sinSquaredPhi = Math.pow(sinPhi, 2);
  var cosCubedPhi = Math.pow(cosPhi, 3);
  var cosFifthPhi = Math.pow(cosPhi, 5);
  var tanSquaredPhi = Math.pow(tanPhi, 2);
  var tanFourthPhi = Math.pow(tanPhi, 4);

  var eSquared = 1 - Math.pow(latLngPosition.b() / latLngPosition.a(), 2);
  var x = 1 - eSquared * sinSquaredPhi;

  var n = (latLngPosition.a() - latLngPosition.b()) / (latLngPosition.a() + latLngPosition.b());
  var nu = latLngPosition.a() * F_0 / Math.sqrt(x);
//console.log('nu = ' + nu);
  var rho = latLngPosition.a() * F_0 * (1 - eSquared) / Math.pow(x, 1.5);
//console.log('rho = ' + rho);
  var etaSquared = nu / rho - 1;
//console.log('etaSquared = ' + etaSquared);

  var nSquared = Math.pow(n, 2);
  var nCubed = Math.pow(n, 3);

  var phiDiff = degToRad(latLngPosition.latitude() - phi_0);
  var phiSum = degToRad(latLngPosition.latitude() + phi_0);

  var M = latLngPosition.b() * F_0 *
      ((1 + n + 5/4 * nSquared + 5/4 * nCubed) * phiDiff -
       (3 * n + 3 * nSquared + 21/8 * nCubed) * Math.sin(phiDiff) * Math.cos(phiSum) +
       15/8 * (nSquared + nCubed) * Math.sin(2 * phiDiff) * Math.cos(2 * phiSum) -
       35/24 * nCubed * Math.sin(3 * phiDiff) * Math.cos(3 * phiDiff));
//console.log('M = ' + M);

  var I = M + N_0;
//console.log('I = ' + I);
  var II = nu / 2 * sinPhi * cosPhi;
//console.log('II = ' + II);
  var III = nu / 24 * sinPhi * cosCubedPhi * (5 - tanSquaredPhi + 9 * etaSquared);
//console.log('III = ' + III);
  var IIIA = nu / 720 * sinPhi * cosFifthPhi * (61 - 58 * tanSquaredPhi + tanFourthPhi);
//console.log('IIIA = ' + IIIA);
  var IV = nu * cosPhi;
//console.log('IV = ' + IV);
  var V = nu / 6 * cosCubedPhi * (nu / rho - tanSquaredPhi);
//console.log('V = ' + V);
  var VI = nu / 120 * cosFifthPhi * (5 - 18 * tanSquaredPhi + tanFourthPhi + 14 * etaSquared - 58 * tanSquaredPhi * etaSquared);
//console.log('VI = ' + VI);

  var lambdaDiff = degToRad(latLngPosition.longitude() - lambda_0);

  var N = I + II * Math.pow(lambdaDiff, 2) + III * Math.pow(lambdaDiff, 4) + IIIA * Math.pow(lambdaDiff, 6);
  var E = E_0 + IV * lambdaDiff + V * Math.pow(lambdaDiff, 3) + VI * Math.pow(lambdaDiff, 5);

  return new GridCoordinate(E, N);
}

function gpsLatLngToOSGrid(gpsLatitude, gpsLongitude, gpsAltitude) {
  var wgs84LatLngPosition = new LatLngPosition(gpsLatitude, gpsLongitude, gpsAltitude, DATUMS.WGS84.a, DATUMS.WGS84.b);
  var airy1830CartesianPosition = helmetTransform(wgs84LatLngPosition.cartesian(),
                                                  TRANSFORMATIONS.WGS84_TO_OSGB36.t,
                                                  TRANSFORMATIONS.WGS84_TO_OSGB36.r,
                                                  TRANSFORMATIONS.WGS84_TO_OSGB36.s);
  var airy1830LatLngPosition = new LatLngPosition(airy1830CartesianPosition, DATUMS.AIRY1830.a, DATUMS.AIRY1830.b);
  var grid = convertLatLngToUTMGrid(airy1830LatLngPosition,
                                    UTM_PARAMETERS.OS.N_0,
                                    UTM_PARAMETERS.OS.E_0,
                                    UTM_PARAMETERS.OS.F_0,
                                    UTM_PARAMETERS.OS.phi_0,
                                    UTM_PARAMETERS.OS.lambda_0);
  return new OSGridCoordinate(grid);
}
