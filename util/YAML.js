
const YAML = require("js-yaml");
const UTIL = require('util');
const _ = require("lodash");

YAML.stringify = function(obj,opts){
	opts = _.defaults(opts||{},{
		noArrayIndent:true,
		flowLevel:1,
		sortKeys:true,
		forceQuotes:true,
		quotingType:'"',
		skipInvalid:true,
	})
	//let json = JSON.parse(UTIL.inspect(obj, {showHidden: false}))
	return YAML.dump(obj,opts) //https://www.npmjs.com/package/js-yaml
}

module.exports = YAML
