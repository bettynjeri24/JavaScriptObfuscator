const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require('javascript-obfuscator');
var fs_Extra = require('fs-extra');
const settings = {
    compact: true,
    // controlFlowFlattening: false,
    // deadCodeInjection: false,
    // debugProtection: false,
    // debugProtectionInterval: false,
    // disableConsoleOutput: false,
    // identifierNamesGenerator: 'hexadecimal',
    // log: true,
    // numbersToExpressions: false,
    // renameGlobals: false,
    // rotateStringArray: true,
    // selfDefending: true,
    // shuffleStringArray: true,
    // simplify: true,
    // splitStrings: false,
    // stringArray: true,
    // stringArrayEncoding: [],
    // stringArrayIndexShift: true,
    // stringArrayWrappersCount: 1,
    // stringArrayWrappersChainedCalls: true,
    // stringArrayWrappersParametersMaxCount: 2,
    // stringArrayWrappersType: 'variable',
    // stringArrayThreshold: 0.75,
    // unicodeEscapeSequence: false
}

function obfuscateDir(dirPath) {
    
    var dirents = fs.readdirSync(dirPath, { encoding: "utf8", withFileTypes: true });
  
    createFile(dirPath)
    
    for (let i = 0; i < dirents.length; i++) {
        let dirent = dirents[i];
        
        if (dirent.isDirectory()){
            obfuscateDir(path.join(dirPath, dirent.name));
            //obfuscateDir(path.join(process.cwd(), 'dist',dirent.name));
            continue;
        }

        if (path.extname(dirent.name) !== ".js") continue;

        let filePath = path.join(dirPath, dirent.name);

        let completeFilePath =path.join(process.cwd(), 'dist',dirent.name);
    
        //let content = fs.readFileSync(filePath, { encoding: "utf8" });
        let content = fs.readFileSync(completeFilePath, { encoding: "utf8" });

        let obfuscator = JavaScriptObfuscator.obfuscate(content, settings);
        let obfuscatedCode = obfuscator.getObfuscatedCode();


        console.log(`${filePath}\n`);
        console.log(completeFilePath);

        fs.writeFileSync(`${completeFilePath}`, obfuscatedCode, { encoding: "utf8", flag: "w+" });

    }
}

function createFile(sourceDir) {
    const createDistFilePath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(createDistFilePath)){
        fs.mkdirSync(createDistFilePath, { recursive: true });
      }

      fs_Extra.copy(sourceDir, createDistFilePath, function(error) {
        if (error) {
            throw error;
        } else {
          console.log("success!");
        }
    }); 
  }

obfuscateDir(path.join(__dirname, "core"));



