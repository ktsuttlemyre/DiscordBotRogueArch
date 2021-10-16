
const YAML = require("js-yaml");
const UTIL = require('util');

YAML.stringify = function(obj){
	//let json = JSON.parse(UTIL.inspect(obj, {showHidden: false}))
	return YAML.dump(obj,{
		noArrayIndent:true,
		flowLevel:1,
		sortKeys:true,
		forceQuotes:true,
		quotingType:'"',
		skipInvalid:true,
	}) //https://www.npmjs.com/package/js-yaml
}

module.exports = YAML
