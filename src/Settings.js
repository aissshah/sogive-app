/**
 * User settings, sometimes inferred from the browser
 */

const Settings = {};
export default Settings;

if (navigator) {
	if (navigator.languages && navigator.languages.length) Settings.locale = navigator.languages[0];
	else Settings.locale = navigator.language;
}
