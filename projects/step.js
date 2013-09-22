var maxWidth  = 400;
var maxHeight = 400;

function InsertStep(filename, text, size) {
  if (typeof size === 'undefined')
    size = new Size(800, 600);
  var imageSize = FitToBoundingBox(new Size(maxWidth, maxHeight), size);
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
