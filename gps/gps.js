Number.prototype.printInt = function(width) {
  var str = Math.floor(this).toString();
  var res = '';
  for (var i = 0; i < width - str.length; i++)
    res += '0';
  res += str;
  return res;
};

function getCharacterByIndex(offset) {
  return String.fromCharCode('A'.charCodeAt(0) + offset);
}

function addSignSuffix(valueString, positiveSuffix, negativeSuffix) {
  if (valueString[0] == '-') {
    return valueString.substr(1) + negativeSuffix;
  }
  return valueString[0] == '+' ? valueString.substr(1) + positiveSuffix : valueString + positiveSuffix;
}

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

////

function CartesianPositionRepresentation(x, y, z) {
  this.x_ = x;
  this.y_ = y;
  this.z_ = z;
}

CartesianPositionRepresentation.prototype.toString = function() {
  return '(' + this.x_ + ', ' + this.y_ + ', ' + this.z_ + ')';
};

CartesianPositionRepresentation.prototype.x = function() {
  return this.x_;
};

CartesianPositionRepresentation.prototype.y = function() {
  return this.y_;
};

CartesianPositionRepresentation.prototype.z = function() {
  return this.z_;
};

////

function LatLngPositionRepresentation(latitude, longitude, altitude, a, b) {
  this.latitude_ = latitude;
  this.longitude_ = longitude;
  this.altitude_ = altitude;
  this.a_ = a;
  this.b_ = b;
}

LatLngPositionRepresentation.prototype.toString = function() {
  return '(' + decimalToDegMinSec(this.latitude_) + ', ' + decimalToDegMinSec(this.longitude_) + ', ' + this.altitude_ + ', ' + this.a_ + ', ' + this.b_ + ')';
};

LatLngPositionRepresentation.prototype.latitude = function() {
  return this.latitude_;
};

LatLngPositionRepresentation.prototype.longitude = function() {
  return this.longitude_;
};

LatLngPositionRepresentation.prototype.altitude = function() {
  return this.altitude_;
};

LatLngPositionRepresentation.prototype.a = function() {
  return this.a_;
};

LatLngPositionRepresentation.prototype.b = function() {
  return this.b_;
};

////

function Position(positionRepresentation) {
  if (positionRepresentation instanceof CartesianPositionRepresentation)
    this.cartesianRepresentation_ = positionRepresentation;
  else if (positionRepresentation instanceof LatLngPositionRepresentation)
    this.latLngRepresentation_ = positionRepresentation;
  else
    throw new Error('oops!');
}

Position.prototype.latLngRepresentation = function(a, b) {
  this.maybeCalculateLatLngRepresentation_(a, b);
  return this.latLngRepresentation_;
};

Position.prototype.maybeCalculateLatLngRepresentation_ = function(a, b) {
  if (this.latLngRepresentation_ && this.latLngRepresentation_.a() === a && this.latLngRepresentation_.b() === b)
    return;

  var longitude = Math.atan2(this.cartesianRepresentation_.y(), this.cartesianRepresentation_.x());

  var eSquared = 1 - Math.pow(b / a, 2);
  var p = Math.sqrt(Math.pow(this.cartesianRepresentation_.x(), 2) + Math.pow(this.cartesianRepresentation_.y(), 2));

  var oldLatitude = 1000;
  var latitude = Math.atan(this.cartesianRepresentation_.z() / (p * (1 - eSquared)));
  var precision = 0.000000001;
  while (Math.abs(latitude - oldLatitude) > precision) {
    var sinLatitude = Math.sin(latitude);
    var v = a / Math.sqrt(1 - eSquared * Math.pow(sinLatitude, 2));
    oldLatitude = latitude;
    latitude = Math.atan2(this.cartesianRepresentation_.z() + eSquared * v * sinLatitude, p);
  }

  var cosLatitude = Math.cos(latitude);
  var altitude = p / cosLatitude - v;

  this.latLngRepresentation_ = new LatLngPositionRepresentation(radToDeg(latitude), radToDeg(longitude), altitude, a, b);
};

Position.prototype.cartesianRepresentation = function() {
  this.maybeCalculateCartesianRepresentation_();
  return this.cartesianRepresentation_;
};

Position.prototype.maybeCalculateCartesianRepresentation_ = function() {
  if (this.cartesianRepresentation_)
    return;

  var eSquared = 1 - Math.pow(this.latLngRepresentation_.b() / this.latLngRepresentation_.a(), 2);
  var sinLatitude = Math.sin(degToRad(this.latLngRepresentation_.latitude()));
  var cosLatitude = Math.cos(degToRad(this.latLngRepresentation_.latitude()));
  var sinLongitude = Math.sin(degToRad(this.latLngRepresentation_.longitude()));
  var cosLongitude = Math.cos(degToRad(this.latLngRepresentation_.longitude()));

  var v = this.latLngRepresentation_.a() / Math.sqrt(1 - eSquared * Math.pow(sinLatitude, 2));

  var x = (v + this.latLngRepresentation_.altitude()) * cosLatitude * cosLongitude;
  var y = (v + this.latLngRepresentation_.altitude()) * cosLatitude * sinLongitude;
  var z = ((1 - eSquared) * v + this.latLngRepresentation_.altitude()) * sinLatitude;

  this.cartesianRepresentation_ = new CartesianPositionRepresentation(x, y, z);
};

////

function GridCoordinates(easting, northing) {
  this.easting_ = easting;
  this.northing_ = northing;
}

GridCoordinates.prototype.easting = function() {
  return this.easting_;
};

GridCoordinates.prototype.northing = function() {
  return this.northing_;
};

GridCoordinates.prototype.toString = function() {
  return '(' + this.easting_ + ', ' + this.northing_ + ')';
};

////

function OsGridReference(gridCoordinates, digits, useSquareCode) {
  if (false /* gridCoordinates.easting() < TODO */) {
    this.string_ = 'Invalid grid coordinates ' + gridCoordinates;
    return;
  }

  var squareCode = '';
  
  if (useSquareCode) {
    // Get indices into 100km grid squares.
    // Numerical origin is at square (10, 19), with y axis flipped.
    var xSquare = 10 + Math.floor(gridCoordinates.easting() / 1e5);
    var ySquare = 19 - Math.floor(gridCoordinates.northing() / 1e5);

    // Apply pattern of square lettering.
    var letterOffset1 = Math.floor(ySquare / 5) * 5 + Math.floor(xSquare / 5);
    var letterOffset2 = (ySquare % 5) * 5 + xSquare % 5;

    // Account for the fact that 'I' is skipped.
    if (letterOffset1 > 7) letterOffset1++;
    if (letterOffset2 > 7) letterOffset2++;

    // Convert to a letter.
    squareCode = getCharacterByIndex(letterOffset1)
        + getCharacterByIndex(letterOffset2);
  }

  // Get coordinate into 100km grid square.
  var x = gridCoordinates.easting() % 1e5;
  var y = gridCoordinates.northing() % 1e5;

  // Trim to required number of digits
  this.string_ = squareCode
      + ' ' + (x / Math.pow(10, 5 - digits / 2)).printInt(digits / 2) 
      + ' ' + (y / Math.pow(10, 5 - digits / 2)).printInt(digits / 2);
};

OsGridReference.prototype.toString = function() {
  return this.string_;
}

////

var DATUMS = {
  OSGB36: {a:	6377563.396, b:	6356256.910},
  WGS84: {a: 6378137.000, b: 6356752.3142}
};

// From http://en.wikipedia.org/wiki/Helmert_transformation#Standard_parameters
var TRANSFORMATIONS = {
  WGS84_TO_OSGB36: {
    t: {x: -446.448, y: 125.157, z: -542.060},
    r: {x: secToRad(-0.1502), y: secToRad(-0.2470), z: secToRad(-0.8421)},
    s: 20.4894 / 1e6
  }
};

var GRID_PARAMETERS = {
  OS: {
    N_0: -100000,       // northing of true origin, m
    E_0: 400000,        // easting of true origin, m
    F_0: 0.9996012717,  // scale factor on central meridian
    phi_0: 49.0,        // latitude of true origin, degrees
    lambda_0: -2.0      // longitude of true origin and central meridian, degrees
  }
};

// Transforms from one datum to another, in cartesian coordinates
function helmetTransform(cartesianPositionRepresentation, t, r, s) {
  var x = t.x + (1 + s) * cartesianPositionRepresentation.x() -     r.z * cartesianPositionRepresentation.y() +     r.y * cartesianPositionRepresentation.z();
  var y = t.y +     r.z * cartesianPositionRepresentation.x() + (1 + s) * cartesianPositionRepresentation.y() -     r.x * cartesianPositionRepresentation.z();
  var z = t.z -     r.y * cartesianPositionRepresentation.x() +     r.x * cartesianPositionRepresentation.y() + (1 + s) * cartesianPositionRepresentation.z();
  return new CartesianPositionRepresentation(x, y, z);
}

// Converts from LatLng to Transverse Mercator grid eastings and northings
// See http://www.movable-type.co.uk/scripts/latlong-gridref.html
function convertLatLngToTransverseMercatorGrid(latLngPositionRepresentation, N_0, E_0, F_0, phi_0, lambda_0) {
  var sinPhi = Math.sin(degToRad(latLngPositionRepresentation.latitude()));
  var cosPhi = Math.cos(degToRad(latLngPositionRepresentation.latitude()));
  var tanPhi = sinPhi / cosPhi;

  var sinSquaredPhi = Math.pow(sinPhi, 2);
  var cosCubedPhi = Math.pow(cosPhi, 3);
  var cosFifthPhi = Math.pow(cosPhi, 5);
  var tanSquaredPhi = Math.pow(tanPhi, 2);
  var tanFourthPhi = Math.pow(tanPhi, 4);

  var eSquared = 1 - Math.pow(latLngPositionRepresentation.b() / latLngPositionRepresentation.a(), 2);
  var x = 1 - eSquared * sinSquaredPhi;

  var n = (latLngPositionRepresentation.a() - latLngPositionRepresentation.b()) /
          (latLngPositionRepresentation.a() + latLngPositionRepresentation.b());
  var nu = latLngPositionRepresentation.a() * F_0 / Math.sqrt(x);
  var rho = latLngPositionRepresentation.a() * F_0 * (1 - eSquared) / Math.pow(x, 1.5);
  var etaSquared = nu / rho - 1;

  var nSquared = Math.pow(n, 2);
  var nCubed = Math.pow(n, 3);

  var phiDiff = degToRad(latLngPositionRepresentation.latitude() - phi_0);
  var phiSum = degToRad(latLngPositionRepresentation.latitude() + phi_0);

  var M = latLngPositionRepresentation.b() * F_0 *
      ((1 + n + 5/4 * nSquared + 5/4 * nCubed) * phiDiff -
       (3 * n + 3 * nSquared + 21/8 * nCubed) * Math.sin(phiDiff) * Math.cos(phiSum) +
       15/8 * (nSquared + nCubed) * Math.sin(2 * phiDiff) * Math.cos(2 * phiSum) -
       35/24 * nCubed * Math.sin(3 * phiDiff) * Math.cos(3 * phiDiff));

  var I = M + N_0;
  var II = nu / 2 * sinPhi * cosPhi;
  var III = nu / 24 * sinPhi * cosCubedPhi * (5 - tanSquaredPhi + 9 * etaSquared);
  var IIIA = nu / 720 * sinPhi * cosFifthPhi * (61 - 58 * tanSquaredPhi + tanFourthPhi);
  var IV = nu * cosPhi;
  var V = nu / 6 * cosCubedPhi * (nu / rho - tanSquaredPhi);
  var VI = nu / 120 * cosFifthPhi * (5 - 18 * tanSquaredPhi + tanFourthPhi + 14 * etaSquared - 58 * tanSquaredPhi * etaSquared);

  var lambdaDiff = degToRad(latLngPositionRepresentation.longitude() - lambda_0);

  var N = I + II * Math.pow(lambdaDiff, 2) + III * Math.pow(lambdaDiff, 4) + IIIA * Math.pow(lambdaDiff, 6);
  var E = E_0 + IV * lambdaDiff + V * Math.pow(lambdaDiff, 3) + VI * Math.pow(lambdaDiff, 5);

  return new GridCoordinates(E, N);
}

function gpsLatLngToUtmGrid(gpsLatitude, gpsLongitude, gpsAltitude) {
  return convertLatLngToTransverseMercatorGrid(new LatLngPositionRepresentation(gpsLatitude, gpsLongitude, gpsAltitude, DATUMS.WGS84.a, DATUMS.WGS84.b),
                                               GRID_PARAMETERS.UTM.N_0,
                                               GRID_PARAMETERS.UTM.E_0,
                                               GRID_PARAMETERS.UTM.F_0,
                                               GRID_PARAMETERS.UTM.phi_0,
                                               GRID_PARAMETERS.UTM.lambda_0);
}

function gpsLatLngToOsGrid(gpsLatitude, gpsLongitude, gpsAltitude) {
  var wgs84Position = new Position(new LatLngPositionRepresentation(gpsLatitude, gpsLongitude, gpsAltitude, DATUMS.WGS84.a, DATUMS.WGS84.b));
  var osgb36Position = new Position(helmetTransform(wgs84Position.cartesianRepresentation(),
                                                    TRANSFORMATIONS.WGS84_TO_OSGB36.t,
                                                    TRANSFORMATIONS.WGS84_TO_OSGB36.r,
                                                    TRANSFORMATIONS.WGS84_TO_OSGB36.s));
  return convertLatLngToTransverseMercatorGrid(osgb36Position.latLngRepresentation(DATUMS.OSGB36.a, DATUMS.OSGB36.b),
                                               GRID_PARAMETERS.OS.N_0,
                                               GRID_PARAMETERS.OS.E_0,
                                               GRID_PARAMETERS.OS.F_0,
                                               GRID_PARAMETERS.OS.phi_0,
                                               GRID_PARAMETERS.OS.lambda_0);
}
