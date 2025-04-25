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
	const goldGoal = Number(document.getElementById('goldGoal').value);
	const goalDiff = goldGoal - silverGoal;

	//in decimal, so 0.5 instead of 50%
	const progress = (score + goalDiff) / ((goldGoal - silverGoal)*2);

	const minMaxProgress = (progress < 0) ? 0 : (progress > 1) ? 1 : progress

	//if gold is gotten, fill it all up - otherwise use a 10px gap on the right so it's clearly visible gold was *NOT* gotten
		//also uses a 10px gap on the left even when it's 0% as there's no true 0% in this calculation

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

	validateInput(elem);
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

	validateInput(elem);
}

/** Validates the input.
 *
 * 	Removes non-numbers.
 * 	Keeps cursor intact.
 * 	Checks to "min" & "max" & "pad" attributes (ignored with 'oninput').
 *
 * 	Args:
 * 		elem [HTMLElement]
 * 			The <input> element to be validated.
 *
 * 		oninput [Boolean] <true>
 * 			If false it handles extra stuff (mainly padding) that isn't done with every input.
 */
function validateInput (elem, oninput) {
	if (!elem instanceof HTMLElement) {
		console.warn(`Could not find input element.`);
		return;
	}
	const min = elem.getAttribute('min') === null ? null : Number(elem.getAttribute('min'));
	const max = elem.getAttribute('max') === null ? null : Number(elem.getAttribute('max'));
	const pad = elem.getAttribute('pad') === null ? 1    : Number(elem.getAttribute('pad')); //for leading zeroes, indicates expected length; 5 = number needs to be 5 digits long, pad with 0
	let cursorPosition = Number(elem.selectionStart);

	let value = elem.value;
	if (typeof value !== 'string') {
		console.warn('Not String found.');
		return;
	}

	if (oninput !== true) {
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

	if (oninput !== true) {

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

	if (isNaN(value) && !(oninput === true && value === '-')) {
		debugger;console.warn(`Got a NaN here.`);
		value = 0;
	}

	elem.value = value;
	elem.selectionStart = cursorPosition;
	elem.selectionEnd = cursorPosition;
}

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
		cssLink.href = "./style.css";
		shadow.appendChild(cssLink);

		const container = document.createElement('div');
		shadow.appendChild(container);


		const textInput = document.createElement('input');
		textInput.id = 'liInput';
		//textInput.value = this.getAttribute('value'); //Isn't loaded yet because everything is stupid I guess.....
		textInput.setAttribute('oninput', 'validateInput(this, true)');
		textInput.setAttribute('onchange', 'validateInput(this)');
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
		validateInput(elem);
	}

	connectedCallback() {
		//console.log('connecto');

		const newValue = this.getAttribute('value');
		if (!isNaN(newValue)) {
			this.shadowRoot.getElementById('liInput').value = newValue;
		}

		validateInput(this.shadowRoot.getElementById('liInput'));

		return;
	}

	disconnectedCallback() {
		console.log('disconnecto');return;
	}

	connectedMoveCallback() {
		console.log('Icky paint like goop, it"s *moooovin*!');return;
	}

	static observedAttributes = ['min', 'max', 'pad', 'disabled'];

	attributeChangedCallback(name, oldValue, newValue) {
		const elem = this.shadowRoot.getElementById('liInput');
		if (!elem instanceof HTMLElement) {
			console.error(`No element found.`);
			return;
		}
		elem.setAttribute(name, newValue);
		validateInput(elem);
	}
}
customElements.define("luigi-input", LuigiInput);

