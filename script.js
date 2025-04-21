
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