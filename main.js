var areas = new Array(3);
var pages = new Array(3);

areas[0]     = 'Engineering';
areas[1]     = 'Mountains';
areas[2]     = 'Travels';
areas[3]     = 'PhotoJournal';

pages[0] = new Array(3);
pages[0][0] = 'Masters';
pages[0][1] = 'CV';
pages[0][2] = 'Projects';

pages[1] = new Array(2);
pages[1][0] = '2007';
pages[1][1] = '2006';

function WriteHeader( area, page )
{
  for( var index=0; index<areas.length; index++ ) {
    if( areas[index] == area ) {
      break;
    }
  }
  document.write( '<DIV class="header">' );
  document.write( '  <DIV CLASS="homeLink">' );
  document.write( '    <A HREF="../index.html">steveblock.co.uk</A>' );
  document.write( '  </DIV>' );
  document.write( '  <IMG CLASS="header" SRC="../' + area + '.gif"> ' + area + ' :: ' );
  for( var i=0; i<pages[index].length; i++ ) {
    if( i > 0 ) {
      document.write( '|' );
    }
    if( pages[index][i] == page ) {
      document.write( '<SPAN CLASS="activeLink"> ' + pages[index][i] + ' </SPAN>' );
    } else {
      document.write( '<SPAN> <A HREF="' + pages[index][i] + '.html">' + pages[index][i] + '</A> </SPAN>' );
    }
  }
  document.write( '</DIV>' );
}
