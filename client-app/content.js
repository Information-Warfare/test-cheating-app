// hash function
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // convert to 32bit integer
  }
  return hash;
}


const DEBUG = true;


// start message
if (DEBUG) console.log("Ничто не вечно, вечен РТУ МИРЭА!")


// question number
var q_now = document.querySelectorAll("span.qno")[0];
if (q_now) {
	q_now = q_now.firstChild.nodeValue;
	if (DEBUG) console.log("q_now: " + q_now);
}


// question text
var q_text = document.querySelectorAll("div.qtext")[0];
var q_type = "";
if (q_text) {
	q_text = q_text.firstChild.nodeValue;
	q_type = "choice";
} else {
	console.log("second_var")
	
	q_text = document.querySelector('div.formulation')
	q_text = q_text.querySelectorAll("p");
	
	var i = 1;
	[].forEach.call(q_text, function(d) {
		if (DEBUG) console.log("w (" + i + "): " + d.innerText);
		i += 1;
	});
	
	console.log(q_text);
	
	q_type = "detailed";
}
if (DEBUG) console.log("q_text: " + q_text);
if (DEBUG) console.log("q_type: " + q_type)


// question answer parameters if question type - choice
if (q_type == "choice") {
	var q_param = document.querySelector('div.answer');
	if (DEBUG) console.log(q_param);

	var q_params = q_param.querySelectorAll('div.flex-fill');

	var i = 1;
	[].forEach.call(q_params, function(d) {
		if (DEBUG) console.log("q (" + i + "): " + d.innerText);
		i += 1;
	});
}


// user information, username and user hash
var u_user = document.querySelectorAll("span.usertext")[0].firstChild.nodeValue;
var u_user_hash = u_user.hashCode()
if (DEBUG) console.log("u_user: " + u_user);
if (DEBUG) console.log("u_user_hash: " + u_user_hash);


// create answer element on site
var answer_element = document.querySelector('div.formulation'); // div.submitbtns | div.formulation | div.answer | div.ablock | (answer)
var answer_text = document.createElement('p');
answer_text.innerHTML = "loading?";
answer_text.setAttribute(
  'style',
  'background-color: #def2f8; color: #000;',
);


// request data from the server
chrome.runtime.sendMessage({
	contentScriptQuery: "getData", url: "http://192.168.1.100:5050/get_answer?question=" + q_text
}, function (response) {
	// debugger;
	if (response != undefined && response != "") {
		if (DEBUG) console.log("r_answer: " + response);
		var response = JSON.parse(response);
		if (response.status === "ok") {
			answer_text.innerHTML = response.answer;
			/// RadioButton ///
			if (response.modification === "rb") {
				[].forEach.call(q_params, function(d) {
					if (response.answer === d.innerText) {
						var el = d.parentElement.parentElement.querySelector('input');
						el.checked = true;
					}
				});
			}
			/// CheckBox ///
			if (response.modification === "cb") {
				var answer = response.answer.split('|');
				[].forEach.call(q_params, function(d) {
					for (const element of answer) {
						if (element === d.innerText) {
							var el = d.parentElement.parentElement.querySelectorAll('input')[1];
							if (DEBUG) console.log(el);
							el.checked = true;
						}
					}
				});
			}
		} else {
			answer_text.innerHTML = response.status;
		}
	} else {
		answer_text.innerHTML = 'no answer';
		// debugger;
	}
});
answer_element.appendChild(answer_text);


// key event
document.addEventListener("keypress", function(event) {
	if (event.keyCode == 95) {
		document.getElementsByName("previous")[0].click();
	}
	if (event.keyCode == 43) {
		document.getElementsByName("next")[0].click()
	}
});
/*
document.onkeypress = function (e) {
    e = e || window.event;
    alert(e.keyCode);
};
*/