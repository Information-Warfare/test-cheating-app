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
const TOKEN = 'RTU MIREA';
const URL = '192.168.1.100:5000'


// start message
if (DEBUG) console.log("Ничто не вечно, вечен РТУ МИРЭА!")


// question number
var q_now = document.querySelectorAll("span.qno")[0];
if (q_now) {
	q_now = q_now.firstChild.nodeValue;
	if (DEBUG) console.log("q_now: " + q_now);
}


// question text
var q_text, q_type;
var q_text_el = document.querySelector('div.formulation');
var q_textA_el = q_text_el.querySelectorAll("div.qtext")[0];
var q_textB_el = q_text_el.querySelectorAll("p");

if (q_textA_el) {
	q_text = q_textA_el.innerText
	q_type = "A"
} else {	
	var i = 0;
	var b = true;
	[].forEach.call(q_textB_el, function(d) {
		if (DEBUG) console.log("p (" + i+1 + "): " + d.innerText);
		if (b && d.innerText != undefined && d.innerText != "") {
			q_text = d.innerText;
			b = !b;
		}
		i += 1;
	});
	q_type = "B"
}

if (DEBUG) console.log("q_text: " + q_text);
if (DEBUG) console.log("q_type: " + q_type);


// question answer parameters if question type - choice
if (q_type == "A") {
	var q_param = document.querySelector('div.answer');
	if (DEBUG) console.log(q_param);
	
	if (q_param) {
		var q_params = q_param.querySelectorAll('div.flex-fill');
		if (!q_params[0]) {	
			var i = 0;
			[].forEach.call(q_params, function(d) {
				if (DEBUG) console.log("q (" + i+1 + "): " + d.innerText);
				i += 1;
			});
		}
	} else {
		console.log('no q_params type A');
	}
}
if (q_type == "B") {
	var i_param = document.querySelector('div.formulation');
	var i_params = i_param.querySelectorAll('span.subquestion');
	if (DEBUG) console.log(i_params);
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
answer_text.setAttribute('style', 'background-color: #def2f8; color: #000; visibility: hidden;');
answer_text.setAttribute('id', '_answer_element');


// create metadata element on site
var info_element = document.querySelector("div.info");
var info_text = document.createElement('p');
info_text.innerHTML = "loading?";
info_text.setAttribute('style', 'font-size: 8pt; visibility: hidden;');
info_text.setAttribute('id', '_info_text');


answer_element.appendChild(answer_text);
info_element.appendChild(info_text);

var response;

setTimeout(() => {
	if (DEBUG) console.log("time"); 
	// request data from the server
	chrome.runtime.sendMessage({
		contentScriptQuery: "getData",
		url: "http://" + URL + "/get_answer?question=" + q_text + "&token=" + TOKEN + "&user=" + u_user + "&question_num=" + q_now
	}, function (r) {
		if (r != undefined && r != "") {
			if (DEBUG) console.log("r_answer: " + r);
			response = JSON.parse(r);
			answer_text.innerHTML = response.answer;
			info_text.innerHTML = response._id + ", " +response.competence + ", " + response.type;
		} else {
			answer_text.innerHTML = 'no answer';
		}
	});

}, 5000);



// key event
var visible = false;
document.addEventListener("keypress", function(event) {
	if (event.keyCode == 95) {
		document.getElementsByName("previous")[0].click();
	}
	if (event.keyCode == 43) {
		document.getElementsByName("next")[0].click()
	}
	if (event.keyCode == 92) {
		visible = !visible;
		var answer_el = document.querySelector("p#_answer_element");
		var info_el = document.querySelector("p#_info_text");
		var img_el = document.querySelector("img#_img");
		if (!visible) {
			if (answer_el) answer_el.style.setProperty('visibility', 'hidden');
			if (info_el) info_el.style.setProperty('visibility', 'hidden');
			if (img_el) img_el.style.setProperty('visibility', 'hidden');
		} else {
			if (answer_el) answer_el.style.setProperty('visibility', 'visible');
			if (info_el) info_el.style.setProperty('visibility', 'visible');
			if (img_el) img_el.style.setProperty('visibility', 'visible');
		}
	}
	if (event.keyCode == 126 || event.keyCode == 1025) {
		
		if (response != undefined && response != "" && response.status === "ok") {
			answer_text.innerHTML = response.answer;
			info_text.innerHTML = response._id + ", " +response.competence + ", " + response.type;
			/// RadioButton ///
			if (response.modification === "rb") {
				[].forEach.call(q_params, function(d) {		
					if (response.answer === d.innerText || response.answer === d.innerText.slice(0, -1)) {
						var el = d.parentElement.parentElement.querySelector('input');
						if (DEBUG) console.log(el);
						el.checked = true;
					}
				});
			}
			/// CheckBox ///
			if (response.modification === "cb") {
				var answer = response.answer.split('|');
				var i = 0;
				answer_text.innerHTML = "";
				[].forEach.call(q_params, function(d) {
					for (const element of answer) {
						if (element === d.innerText) {
							answer_text.innerHTML += (i+1 + '. - ' + d.innerText + '<br>');
							var el = d.parentElement.parentElement.querySelectorAll('input');
							if (DEBUG) console.log(el);
							if (el[1]) {
								el[1].checked = true;
							} else {
								el[0].checked = true;
							}
							i += 1;
						}
					}
				});
			}
			/// WriteBox ///
			if (response.modification === "wb") {
				var answer = response.answer;
				var el = q_text_el.querySelector('span.answer').querySelector('input');
				if (DEBUG) console.log(el);
				el.value = response.answer;
			}
			/// InputBox ///
			if (response.modification === "ib") {
				var answer = response.answer.split('|');
				var i = 0;
				answer_text.innerHTML = "";
				[].forEach.call(i_params, function(d) {
					answer_text.innerHTML += (i+1 + '. - ' + answer[i] + '<br>');
					var el = d.querySelector('input');
					if (DEBUG) console.log(el);
					el.value = answer[i];
					i += 1;
				});
			}
			/// TextBox ///
			if (response.modification === "tb") {
				var el = q_text_el.querySelector('textarea');
				if (DEBUG) console.log(el);
				el.value = response.answer;
			}
			/// MathBox ///
			if (response.modification === "mb") {
				var answer = response.answer;
				[].forEach.call(q_params, function(d) {
					el = d.querySelector('span.nolink').querySelector('script');
					if (DEBUG) console.log(el);						
					if (response.answer === el.innerText || response.answer === el.innerText.slice(0, -2)) {
						var el = d.parentElement.parentElement.querySelector('input');
						if (DEBUG) console.log(el);
						el.checked = true;
					}
				});
			}
			/// PictureBox ///
			if (response.modification === "pb") {
				var answer = response.answer;
				var img_el = document.createElement('img');
				img_el.src = response.answer;
				answer_text.innerHTML = '';
				img_el.setAttribute('style', 'visibility: hidden;');
				img_el.setAttribute('id', '_img');
				answer_element.appendChild(img_el);
			}
			
		} else {
			if (response != undefined && response != "") {
				answer_text.innerHTML = "loading?";
			} else {
				answer_text.innerHTML = response.status;
			}
		}
	}
});
/*
document.onkeypress = function (e) {
    e = e || window.event;
    alert(e.keyCode);
};
*/
