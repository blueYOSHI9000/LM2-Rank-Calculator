/* Calculates the rank & updates the display */
function rankCalc () {
	const timeH = Number(document.getElementById('timeH').value);
	const timeMin = Number(document.getElementById('timeMin').value);
	const timeS = Number(document.getElementById('timeS').value);

	const ghostsCaptured = Number(document.getElementById('ghostsCaptured').value);
	const healthLost = Number(document.getElementById('healthLost').value);
	const collectedTreasure = Number(document.getElementById('collectedTreasure').value);

	const score = ghostsCaptured*120 + collectedTreasure - ((timeH*60 + timeMin)*60 + timeS) - healthLost*6;

	const silverGoal = Number(document.getElementById('silverGoal').value);
	const   goldGoal = Number(document.getElementById(  'goldGoal').value);
	const bronzeToGold = (goldGoal - silverGoal)*2; //Bronze has no lower limit but this puts the same distance between bronze to silver as silver to gold has

	//Save to localStorage
	localStorage.setItem('values', JSON.stringify({
		timeH         : timeH, 			timeMin   : timeMin, 	timeS            : timeS,
		ghostsCaptured: ghostsCaptured, healthLost: healthLost, collectedTreasure: collectedTreasure,
		silverGoal    : silverGoal, 	goldGoal  : goldGoal
	}));

	//Pull the score into the bronze to gold range, then gets its percentage in decimal (so 0.5 instead of 50%)
		//The issue here is that the comparison can be made over 0 (silver score of -500, gold score of 200 for example).
		//The solution is to pull the score up inside the bronze to gold range (which is always positive as it's a range).
		//First we calculate how far in the negative the bronze goal is by doing (bronzeToGold - goldGoal). Then we add it to the score to bring it into the bronze to gold range.
		//Finally, calculate the percentage with a division.
	const progress = (score + (bronzeToGold - goldGoal)) / bronzeToGold;

	//cap at 0 & 1
	const minMaxProgress = (progress < 0) ? 0 : (progress > 1) ? 1 : progress

	//this makes it so the bar snaps on both ends - the progress is all between bronze & gold, below bronze it snaps to 0, above gold it snaps to 100%
		//gold - 1 point leaves a 10px gap on the right that gets filled completely with just 2 extra points
	document.getElementById('progressBar'      ).style.width = (progress < 0) ? '10px' : ((progress > 1) ? '100%' : `calc((100% - 20px) * ${minMaxProgress} + 10px)`);
	document.getElementById('finalScoreDisplay').style.left  = (progress < 0) ? 'calc(10px - 50px)' : ((progress > 1) ? 'calc(100% - 50px)' : `calc((100% - 20px) * ${minMaxProgress} + 10px - 50px)`);

	document.getElementById('progressBar'      ).style.visibility = 'visible';

	document.getElementById('finalScoreDisplay').style.visibility = 'visible';
	document.getElementById('finalScore').value = score;

	if (score >= goldGoal) {
		document.getElementById('progressBar').classList.add('goldReached');

		document.getElementById('finalScoreArrow').style.backgroundColor = 'var(--gold)';
	} else if (score >= silverGoal) {
		document.getElementById('progressBar').classList.add('silverReached');
		document.getElementById('progressBar').classList.remove('goldReached');

		document.getElementById('finalScoreArrow').style.backgroundColor = 'var(--silver)';
	} else {
		document.getElementById('progressBar').classList.remove('silverReached');
		document.getElementById('progressBar').classList.remove('goldReached');

		document.getElementById('finalScoreArrow').style.backgroundColor = 'var(--bronze)';
	}
}

/**	Selects a navbar entry, updates it's CSS style & displays the according section of the website.
 *
 * 	Args:
 * 		entry [String]
 * 			The navbar-entry name, can be: 'levelSelect', 'explanation', 'credits'
 */
function selectNavbarEntry (entry) {
	if (['levelSelect', 'explanation', 'credits'].indexOf(entry) === -1) {
		console.warn('Got invalid navbar-entry: ', entry)
		return;
	}

	//.querySelectorAll instead of .getElementsByClassName so it returns a static list with a .forEach function
	document.querySelectorAll('.navbar_selected').forEach(
		(elem) => {elem.classList.remove('navbar_selected');}
	);

	//dumb solution, but it works
	document.querySelector(`#navbar > span[data-navbarentry="${entry}"]`).classList.add('navbar_selected');

	switch (entry) {
		case 'levelSelect':
			document.getElementById('levelSelectContainer').style.display = 'initial';
			document.getElementById('explanationContainer').style.display = 'none';
			document.getElementById('creditsContainer'    ).style.display = 'none';
			break;

		case 'explanation':
			document.getElementById('levelSelectContainer').style.display = 'none';
			document.getElementById('explanationContainer').style.display = 'initial';
			document.getElementById('creditsContainer'    ).style.display = 'none';
			break;

		case 'credits':
			document.getElementById('levelSelectContainer').style.display = 'none';
			document.getElementById('explanationContainer').style.display = 'none';
			document.getElementById('creditsContainer'    ).style.display = 'initial';
			break;
	}

	localStorage.setItem('navbarEntry', entry)
}

/**	Selects a level by changing the Silver & Gold goal values. The values are taken from the respective HTML elements.
 *
 * 	Args:
 * 		elem [HTMLElement]
 * 			The <div> element with the .levelSelect_level class.
 */
function selectLevel (elem) {
	const scoreContainer = elem.getElementsByClassName('levelSelect_scoreContainer')[0].children;
	const silverGoal = Number(scoreContainer[0].innerText);
	const   goldGoal = Number(scoreContainer[1].innerText);

	document.getElementById('silverGoal').value = silverGoal;
	document.getElementById(  'goldGoal').value =   goldGoal;

	unselectLevel();

	elem.classList.add('levelSelect_selected');

	rankCalc();

	localStorage.setItem('selectedLevel', elem.getAttribute('data-level'));
}

/**	Unselects a level. Only has an effect on the visuals.
 */
function unselectLevel () {
	//.querySelectorAll instead of .getElementsByClassName so it returns a static list with a .forEach function
	document.querySelectorAll('.levelSelect_selected').forEach(
		(elem) => {elem.classList.remove('levelSelect_selected');}
	);

	localStorage.setItem('selectedLevel', '');
}

/**	Adds 1 to an <input> element.
 *
 * 	Args:
 * 		elem [HTMLElement]
 * 			The <input> element.
 */
function valuePlus (elem) {
	if (!(elem instanceof HTMLElement)) {
		console.warn(`No valid element found.`);
		return;
	}

	elem = elem.getRootNode().getElementById('liInput');
	if (elem === null) {
		console.warn(`Could not find input element.`);
		return;
	}

	if (elem.getAttribute('disabled') !== null)
		return;

	elem.value = Number(elem.value) + 1;

	validateInput(elem, true);

	const hostId = elem.getRootNode().host.id;
	if (hostId === 'silverGoal' || hostId === 'goldGoal')
		unselectLevel();
}

/**	Removes 1 from an <input> element.
 *
 * 	Args:
 * 		elem [HTMLElement]
 * 			The <input> element.
 */
function valueMinus (elem) {
	if (!elem instanceof HTMLElement) {
		console.warn(`No valid element found.`);
		return;
	}

	elem = elem.getRootNode().getElementById('liInput');
	if (elem === null) {
		console.warn(`Could not find input element.`);
		return;
	}

	if (elem.getAttribute('disabled') !== null)
		return;

	elem.value = Number(elem.value) - 1;

	validateInput(elem, true);

	const hostId = elem.getRootNode().host.id;
	if (hostId === 'silverGoal' || hostId === 'goldGoal')
		unselectLevel();
}

/** Validates the input.
 *
 * 	Removes non-numbers.
 * 	Keeps cursor intact.
 * 	Checks to "min" & "max" & "pad" attributes (only with 'onchange').
 * 	Calls rankCalc() (only with 'onchange').
 *
 * 	Args:
 * 		elem [HTMLElement]
 * 			The <input> element to be validated.
 *
 * 		callType [String] <'oninput'>
 * 			Type of call, can be either 'onchange' or 'oninput'. 'onchange' will do extra stuff, listed above.
 *
 * 		calculateRank [Boolean] <true>
 * 			Whether the rank should be calculated.
 */
function validateInput (elem, validateFormatting=true, calculateRank=true) {
	if (!elem instanceof HTMLElement) {
		console.warn(`Could not find input element.`);
		return;
	}

	if (typeof validateFormatting !== 'boolean') {
		console.warn('validateFormatting was invalid: ', validateFormatting);
		validateFormatting = true;
	}
	if (typeof calculateRank !== 'boolean') {
		console.warn('calculateRank was invalid: ', calculateRank);
		calculateRank = true;
	}

	const min = elem.getAttribute('min') === null ? null : Number(elem.getAttribute('min'));
	const max = elem.getAttribute('max') === null ? null : Number(elem.getAttribute('max'));
	const pad = elem.getAttribute('pad') === null ? 1    : Number(elem.getAttribute('pad')); //for leading zeroes, indicates expected length; 5 = number needs to be 5 digits long, pad with zeroes
	let cursorPosition = Number(elem.selectionStart);

	let value = elem.value;
	if (typeof value !== 'string') {
		console.warn('Not String found.');
		return;
	}

	if (validateFormatting === true) {
		value = Number(value);

		if (typeof min === 'number' && Number(value) < min) {
			value = min;
		}
		if (typeof max === 'number' && Number(value) > max) {
			value = max;
		}
	}

	value = value.toString().split('');

	//remove non-numbers but allow a single leading -
	for (let index = value.length - 1; index >= 0; index--) {
		if (isNaN(value[index]) && !(value[index] === '-' && index === 0)) {
			value.splice(index, 1);
			cursorPosition--; //counteract the removal
		}
	}

	if (validateFormatting === true) {

		//count leading zeroes
		let digits = 0;
		let leadingZeroes = 0;
		let nonZeroSpotted = false;
		for (let i of value) {
			if (+i === 0 && nonZeroSpotted === false) {
				leadingZeroes++;
			} else if (i !== '-') {
				nonZeroSpotted = true;
			}

			if (i !== '-') {
				digits++;
			}
		}

		//add leading zeroes
		if (digits < pad) {
			const padDiff = pad - digits;
			let padArr = [];
			for (let i = 0; i < padDiff; i++) {
				padArr.push(0);
			}

			if (value[0] === '-') {
				value.splice(1, 0, ...padArr)
			} else {
				value.splice(0, 0, ...padArr)
			}

			//keep the cursor position intact despite the additions
			cursorPosition = cursorPosition + padDiff;

		//remove leading zeroes above the pad
		} else if (digits > pad && leadingZeroes > 0) {
			let toSplice = digits - pad;
			if (toSplice < 0 || toSplice > leadingZeroes) {
				toSplice = leadingZeroes;
			}

			if (value[0] === '-') {
				value.splice(1, toSplice);
			} else {
				value.splice(0, toSplice);
			}

			//keep the cursor position intact despite the removed entries
			cursorPosition = cursorPosition - toSplice;
		}
	}

	value = value.join('');

	if (isNaN(value) && value !== '-') {
		console.warn(`Got a NaN here.`);
		value = 0;
	}

	elem.value = value;
	elem.selectionStart = cursorPosition;
	elem.selectionEnd = cursorPosition;

	if (calculateRank === true) {
		rankCalc();
	}
}

/**	Loads the saved values.
 */
function loadValuesFromStorage () {
	const lsValue = localStorage.getItem('values');

	if (typeof lsValue === 'string') {
		const values = JSON.parse(lsValue);

		if (typeof values.timeH === 'number')
			document.getElementById('timeH').value = values.timeH;

		if (typeof values.timeMin === 'number')
			document.getElementById('timeMin').value = values.timeMin;

		if (typeof values.timeS === 'number')
			document.getElementById('timeS').value = values.timeS;

		if (typeof values.ghostsCaptured === 'number')
			document.getElementById('ghostsCaptured').value = values.ghostsCaptured;

		if (typeof values.healthLost === 'number')
			document.getElementById('healthLost').value = values.healthLost;

		if (typeof values.collectedTreasure === 'number')
			document.getElementById('collectedTreasure').value = values.collectedTreasure;

		if (typeof values.silverGoal === 'number')
			document.getElementById('silverGoal').value = values.silverGoal;

		if (typeof values.goldGoal === 'number')
			document.getElementById('goldGoal').value = values.goldGoal;

		rankCalc();
	}

	const navbarEntry = localStorage.getItem('navbarEntry');
	if (typeof navbarEntry === 'string')
		selectNavbarEntry(navbarEntry);

	const selectedLevel = localStorage.getItem('selectedLevel');
	if (typeof selectedLevel === 'string' && selectedLevel.length > 0) {
		document.querySelector(`.levelSelect_level[data-level="${selectedLevel}"]`).classList.add('levelSelect_selected');
	}
}

addEventListener("DOMContentLoaded", loadValuesFromStorage);

/**	Detects when the user presses enter and manually calls the focused element's onclick function via .click().
 *
 * 	Args:
 * 		e [KeyboardEvent]
 * 			The event fired by keydown.
 */
function manualEnterKey (e) {
	if (e.key !== "Enter")
		return;

	const focusedElement = document.activeElement;

	if (focusedElement.parentNode.id === 'navbar' || focusedElement.classList.contains('levelSelect_level')) {
		focusedElement.click();
	}
}

addEventListener("keydown", manualEnterKey);

/**	<luigi-input>
 *
 * 	Use "mix" & "max" attributes to specifiy a number range.
 * 	Use "pad" attribute to pad the number with leading zeroes to that length. A "pad" value of 5 will the number "10" into "00010". Defaults to 1.
 */
class LuigiInput extends HTMLElement {
	constructor() {
		super();
		//console.log('constructo');

		const shadow = this.attachShadow({ mode: "open" });

		const cssLink = document.createElement('link');
		cssLink.rel = "stylesheet";
		cssLink.href = "./css/luigiInput.css";
		shadow.appendChild(cssLink);

		const container = document.createElement('div');
		shadow.appendChild(container);


		const textInput = document.createElement('input');
		textInput.id = 'liInput';
		//textInput.value = this.getAttribute('value'); //Isn't loaded yet because everything is stupid I guess.....
		textInput.setAttribute('oninput', 'validateInput(this, false);');
		textInput.setAttribute('onchange', 'validateInput(this, true);');
		if (this.id === 'silverGoal' || this.id === 'goldGoal')
			textInput.setAttribute('oninput', 'validateInput(this, false);unselectLevel();');
		container.appendChild(textInput);

		const arrows = document.createElement('span');
		arrows.classList.add('liArrows');
		container.appendChild(arrows);

		const   upArrowContainer = document.createElement('span');
		const downArrowContainer = document.createElement('span');
		  upArrowContainer.classList.add(  'liUpArrowContainer');
		downArrowContainer.classList.add('liDownArrowContainer');
		  upArrowContainer.setAttribute('onclick', 'valuePlus(this);');
		downArrowContainer.setAttribute('onclick', 'valueMinus(this);');
		arrows.appendChild(  upArrowContainer);
		arrows.appendChild(downArrowContainer);

		const   upArrow = document.createElement('span');
		const downArrow = document.createElement('span');
		  upArrow.classList.add(  'liUpArrow');
		downArrow.classList.add('liDownArrow');
		  upArrowContainer.appendChild(  upArrow);
		downArrowContainer.appendChild(downArrow);
	}

	get value () {
		const elem = this.shadowRoot.getElementById('liInput');
		if (!elem instanceof HTMLElement) {
			console.error(`No element found.`);
			return;
		}
		return elem.value;
	}

	set value (val) {
		const elem = this.shadowRoot.getElementById('liInput');
		if (!elem instanceof HTMLElement) {
			console.error(`No element found.`);
			return;
		}
		elem.value = val;
		validateInput(elem, true, false);
	}

	connectedCallback() {
		//console.log('connecto');

		const newValue = this.getAttribute('value');
		if (!isNaN(newValue)) {
			this.shadowRoot.getElementById('liInput').value = newValue;
		}

		validateInput(this.shadowRoot.getElementById('liInput'), true, false);

		return;
	}

	disconnectedCallback() {
		console.log('disconnecto');return;
	}

	connectedMoveCallback() {
		console.log('Icky paint like goop, it"s *moooovin*!');return;
	}

	static observedAttributes = ['min', 'max', 'pad', 'disabled', 'aria-label'];

	attributeChangedCallback(name, oldValue, newValue) {
		const elem = this.shadowRoot.getElementById('liInput');
		if (!elem instanceof HTMLElement) {
			console.error(`No element found.`);
			return;
		}
		elem.setAttribute(name, newValue);
		validateInput(elem, true, false);
	}
}
customElements.define("luigi-input", LuigiInput);

//has to be after LuigiInput so they're actually constructed before being accessed
	//no, I did not waste half an hour because I forgot about that, why would you think that
loadValuesFromStorage();

//done with JS instead of CSS so people without JavaScript can still see the info in here
document.getElementById('explanationContainer').style.display = 'none';
document.getElementById('creditsContainer').style.display = 'none';

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("./sw.js");
}
