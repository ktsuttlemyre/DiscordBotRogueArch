
const YAML = require("js-yaml");
YAML.stringify = function(yaml){
	return YAML.dump(yaml,{noArrayIndent :true,flowLevel:1,sortKeys:true,forceQuotes:true,quotingType:'"'}) //https://www.npmjs.com/package/js-yaml
}

module.exports = YAML
