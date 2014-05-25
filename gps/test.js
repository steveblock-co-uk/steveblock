// Tools for testing

function pass(description) {
  var div = document.createElement('div');
  div.innerText = description;
  document.body.appendChild(div);
}

function fail(description) {
  var div = document.createElement('div');
  div.className = "fail";
  div.innerText = description;
  document.body.appendChild(div);
}

function check(actual, expected, description) {
  var div = document.createElement('div');
  div.innerText = description;
  if (expected !== actual) {
    div.className = "fail";
    div.innerText += ': Expected ...';
    var e = document.createElement('div');
    e.innerText = expected;
    div.appendChild(e);
    div.appendChild(document.createTextNode('but got ...'));
    var a = document.createElement('div');
    a.innerText = actual;
    div.appendChild(a);
  }
  document.body.appendChild(div);
}
