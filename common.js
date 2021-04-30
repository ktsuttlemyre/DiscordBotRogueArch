const _ = require("lodash");
const path = require("path");

exports.reactions = {
  upvote: "✅",
  downvote: "❌",
  shipwash: "802028980739768320",
  "large-red-circle": "🔴",
  "red-circle": "🔴",
  "large-green-circle": "🟢",
  "green-circle": "🟢",
  "large-yellow-circle": "🟡",
  "yellow-circle": "🟡",
};

exports.commandVars = function (filename) {
  filename = path.normalize(filename);
  let name = path.parse(filename).name;
  let category = path.basename(path.dirname(filename));
  //let parsed = path.parse(filename)).dir.split(path.sep);
  //let botname = parsed[parsed.length-3];
  //let type = parsed[parsed.length-2]
  return {
    name: name,
    category: category,
    id: `${category}/${name}`,
  };
};

exports.defaultAvatar =
  "https://discord.com/assets/322c936a8c8be1b803cd94861bdfa868.png";

exports.permalinkMessage = function (guild, channel, message) {
  return `https://discord.com/channels/${guild.id}/${channel.id}/${message.id}`;
};

exports.filterInPlace = function (a, condition) {
  let i = 0,
    j = 0;

  while (i < a.length) {
    const val = a[i];
    if (condition(val, i, a)) a[j++] = val;
    i++;
  }

  a.length = j;
  return a;
};

//https://www.fileformat.info/info/unicode/char/search.htm?q=block&preview=entity
//example
//progressString('vertical-block',40);
var bars = {
  "vertical-bar": [
    { name: "Zero", unicode: "", glyph: "▕  ▏", percent: 0 },
    {
      name: "LOWER ONE EIGHTH BLOCK",
      unicode: "U+2581",
      glyph: "▕▁▏",
      percent: 12.5,
    },
    {
      name: "LOWER ONE QUARTER BLOCK",
      unicode: "U+2582",
      glyph: "▕▂▏",
      percent: 25,
    },
    {
      name: "LOWER THREE EIGHTHS BLOCK",
      unicode: "U+2583",
      glyph: "▕▃▏",
      percent: 37.5,
    },
    { name: "LOWER HALF BLOCK", unicode: "U+2584", glyph: "▕▄▄▏", percent: 50 },
    {
      name: "LOWER FIVE EIGHTHS BLOCK",
      unicode: "U+2585",
      glyph: "▕▅▏",
      percent: 62.5,
    },
    {
      name: "LOWER THREE QUARTERS BLOCk",
      unicode: "U+2586",
      glyph: "▕▆▏",
      percent: 75,
    },
    {
      name: "LOWER SEVEN EIGHTHS BLOCK",
      unicode: "U+2587",
      glyph: "▕▇▏",
      percent: 87.5,
    },
    { name: "FULL BLOCK", unicode: "U+2588", glyph: " ██", percent: 100 },
  ],
};
exports.progressString = function progressString(type, percent) {
  for (var i = 0, l = bars[type].length; i < l; i++) {
    var entry = bars[type][i];
    if (entry.percent >= percent) {
      return entry.glyph;
    }
  }
};

exports.randomMusicEmoji = function () {
  return _.sample[("🎵", "🎶", "🎼")];
};
