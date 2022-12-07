String.prototype.hashCode = function() {
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

console.log("Ничто не вечно, вечен РТУ МИРЭА!")

var q_now = document.querySelectorAll("span.qno")[0].firstChild.nodeValue;
console.log("q_now: " + q_now);

var q_text = document.querySelectorAll("div.qtext")[0].firstChild.nodeValue;
console.log("q_text: " + q_text);

/*
var q_param = document.querySelector('div.answer');
console.log(q_param);

var q_params = q_param.querySelectorAll('div.flex-fill');

var i = 1;
[].forEach.call(q_params, function(d) {
  console.log("q (" + i + "): " + d.innerText);
  i += 1;
});
*/



var u_user = document.querySelectorAll("span.usertext")[0].firstChild.nodeValue;
console.log("u_user: " + u_user);
console.log("u_user_hash: " + u_user.hashCode());



var answer_element = document.querySelector('div.answer'); // div.submitbtns | div.formulation | div.answer | div.ablock
var answer_text = document.createElement('p');
answer_text.innerHTML = "loading?";
answer_text.setAttribute(
  'style',
  'background-color: #def2f8; color: #000; width: 30px;',
);



chrome.runtime.sendMessage({
	contentScriptQuery: "getData", url: "http://192.168.1.100:5050/get_answer?q=" + q_text
}, function (response) {
	// debugger;
	if (response != undefined && response != "") {
		console.log("r_answer: " + response);
		answer_text.innerHTML = response;
		answer_element.appendChild(answer_text);
	}
	else {
		// debugger;
	}
});