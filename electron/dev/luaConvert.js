const parseLua = require('luaparse').parse;
const fs  = require("fs");
const path  = require("path");
const file = fs.readFileSync(path.join(__dirname,"DB.lua"), "utf8")
const chunks = parseLua(file, { comments: false });
fs.writeFileSync(path.join(__dirname,"DB.json"), JSON.stringify(chunks, null, 2), "utf8");
