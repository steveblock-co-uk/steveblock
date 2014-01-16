// No longer used !!!!


// add 'hidden' flag to each node
// if hidden, don't link to it from header
// also, if the selected page (ie last index) is hidden, then error
// make all but top-level methods return a string, so it can be manipulated if need be

// Constructor defines class for node object
function Node( name, hidden, filename ) {
  this.name = name;
  this.hidden = hidden ? true : false;
  this.children = new Array(0);
  this.filename = filename ? filename : 'index.html';
}

// Default value for children - zero length array
// No! This does a static member!
//Node.prototype.children = new Array(0);

// Node method to get filename for this object
// If this node is hidden, return the filename for the first child
Node.prototype.Filename = function() {
  if( this.hidden ) {
    if( this.children.length == 0 ) {
      return 'Node::Filename() : Hidden node has no children';
    }
    return this.children[0].name + '/' + this.children[0].Filename();
  }
  return this.filename;
}

// Node method to print all children
Node.prototype.PrintChildren = function( index ) {
  var str = '';
  // alert( 'PrintAllChildren : ' + this.name + ' : ' + this.children.length + ' children' );
  for( var i=0; i<this.children.length; i++ ) {
    str += this.children[i].Print( i==index );
    if( i < this.children.length-1 ) { str += ' | '; }
  }
  return str;
}

// Node method to print name as selected object or link
Node.prototype.Print = function( selected ) {
  var str = '';
  if( selected ) { str += '<span class="activeLink">' }
  str += '<a href="' + this.path + this.Filename() + '">' + this.name + '</a>';
  if( selected ) { str += '</span>' }
  return str;
}

// Node method to add child
Node.prototype.AddChild = function( child ) {
  this.children.push( child );
}

// Node method to entire tree
Node.prototype.PrintTree = function() {
  // alert( 'PrintTree : ' + this.name + ' : ' + this.children.length + ' children' );
  var str = this.name + ' ';
  for( var i=0; i<this.children.length; i++ ) {
    // alert( 'PrintTree: printing ' + i + ' of ' + this.children.length );
    str += this.children[i].PrintTree();
  }
  return str;
}

// Node method to print selected path
Node.prototype.PrintPath = function( indices ) {
  if( indices.length == 0 ) { return ''; }
  var index = indices.shift();
  if( index >= this.children.length ) { return '<p>Error'; }
  return '<p>' + this.PrintChildren( index ) + this.children[index].PrintPath( indices );
}

// Node method to set path to itself and to its children
Node.prototype.SetPath = function( path ) {
  // alert( 'SetPath : ' + this.name + ' setting path ' + path );
  this.path = path;
  for( var i=0; i<this.children.length; i++ ) {
    this.children[i].SetPath( path + this.children[i].name + '/' );
  }
}

var projects = new Node( 'Projects' );
projects.AddChild( new Node( 'Cruftable' ) );
projects.AddChild( new Node( 'BelAir' ) );
projects.AddChild( new Node( 'BikeBox' ) );
projects.AddChild( new Node( 'NaturalDisastersParty' ) );
projects.AddChild( new Node( 'Cruftamaran' ) );
projects.AddChild( new Node( 'BelAirReturn' ) );

var engineering = new Node( 'Engineering', true );
engineering.AddChild( projects );
engineering.AddChild( new Node( 'Masters' ) );
engineering.AddChild( new Node( 'CV' ) );

var travels = new Node( 'Travels' );

var photoJournal = new Node( 'PhotoJournal' );

var root = new Node( 'steveblock.co.uk' );
root.AddChild( engineering );
root.AddChild( travels );
root.AddChild( photoJournal );

function WriteHeader( indices )
{
  var pathToRoot = GetPath( indices );
  root.SetPath( pathToRoot );
  var baseName = root.children[indices[0]].name;
  //alert( pathToRoot + ' ' + baseName );
  var str = '<div class="header">';
  str += '<div class="floatRight"><div class="centreVertically"><p class="steveblock">' + root.Print() + '</div></div>';
  str += '<div class="floatLeft"><div class="centreVertically"><img class="header" src="' + pathToRoot + baseName + '.gif" alt="' + baseName + '"></div></div>';
  str += root.PrintPath( indices );
  str += '</div>';
  document.write( str );
}

function WriteHeaderOld( indices )
{
  TraverseTree( tree );

  var pathToRoot = PathToRoute( indices );
  document.write( '<div class="header">' );
  document.write( '  <div class="homeLink">' );
  document.write( '    <a href="' + pathToRoot + 'index.html">steveblock.co.uk</a>' );
  document.write( '  </div>' );
  var name = tree.children[indices[0]].name;
  document.write( '  <img class="header" src="' + pathToRoot + name + '.gif" alt="' + name + '">' );
  WritePath( tree, indices, pathToRoot );
  document.write( '</div>' );
}

// Gets the path to a node using the indices
function GetPath( indices ) {
  var path = '';
  for( var i=0; i<indices.length; i++ ) {
    path += '../';
  }
  return path;
}
