var maxWidth  = 400;
var maxHeight = 400;

function InsertStep(filename, text, AR) {
  var AR = AR ? AR : 4/3;
  var imageSize = FitToBoundingBox(new Size(maxWidth, maxHeight), AR);
  var html = '';
  html += '<div class="stepDiv">';
  html += '  <div class="stepImageDiv" style="width: ' + maxWidth + 'px;">';
  html += '    <img class="stepImage" style="width: ' + imageSize.width + 'px; height: ' + imageSize.height + 'px;" src="' + filename + '">';
  html += '  </div>';
  html += text;
  html += '<div style="clear: both;"></div>';  // Empty DIV to achieve min-height in IE without CSS hack.
  html += '</div>';
  return html;
}
