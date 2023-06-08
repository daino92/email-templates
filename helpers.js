const path = require("path");
const fs = require("fs");

function findFiles(base, fileName, files, result) {
  files = files || fs.readdirSync(base);
  result = result || [];
  files.forEach((file) => {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = findFiles(newbase, fileName, fs.readdirSync(newbase), result);
    } else {
      if (file === fileName) {
        result.push(path.join(__dirname, newbase));
      }
    }
  });
  return result;
}

function getFileContents(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: "utf-8" }, function (error, data) {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

function fulltrim(str) {
  return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, "").replace(/\s+/g, " ");
}

function stripHTML(html = "") {
  if (!(typeof html === "string" || html instanceof String)) {
    return "";
  }
  const bodyOnlyPattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
  html = html.replace(/>/gim, "> "); // Just add a whitespace to each tag
  html = bodyOnlyPattern.exec(html)[1]; // Get on;y the <body>
  html = html.replace(/(<([^>]+)>)/gim, ""); // Remove html tags
  html = html.replace(/&.*;/gim, ""); // Remove html escape chars (such as &nbsp;)
  return fulltrim(html); // Trim all white spaces
}

exports.findFiles = findFiles;
exports.getFileContents = getFileContents;
exports.fulltrim = fulltrim;
exports.stripHTML = stripHTML;
