#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const Converter_1 = require("./Converter");
const convert = (args) => {
    const format = args.outputFormat;
    const recursive = args.recursive;
    const force = args.force;
    const items = args.items.map(item => String(item));
    if (!items.length) {
        console.error(`\x1b[41m\x1b[37m[ERROR]\x1b[0m No files or directories given.`);
        return 1;
    }
    const files = [];
    let success = 0;
    const browse = (path, browseDirectory) => {
        try {
            const lstat = fs_1.lstatSync(path);
            if (lstat.isDirectory()) {
                if (browseDirectory) {
                    fs_1.readdirSync(path).forEach(item => browse(`${path}/${item}`, recursive));
                }
            }
            else if (lstat.isFile()) {
                files.push(path);
            }
            else {
                console.error(`\x1b[41m\x1b[37m[ERROR]\x1b[0m '${path}' is neither a file nor a directory`);
            }
        }
        catch (err) {
            console.error(`\x1b[41m\x1b[37m[ERROR]\x1b[0m ${err}`);
        }
    };
    items.forEach(item => browse(item, true));
    files.forEach(file => {
        const ext = path_1.extname(file).toLowerCase().replace(".", "");
        if (!Converter_1.isSrc(ext)) {
            console.error(`\x1b[41m\x1b[37m[ERROR]\x1b[0m Unsupported format '${ext}' for '${file}'`);
            return;
        }
        const base = path_1.basename(file, path_1.extname(file));
        const lines = fs_1.readFileSync(`${file}`, { encoding: "utf-8" }).split("\n");
        const result = Converter_1.Converter.from[ext](lines).to[format]();
        if (typeof result === "string") {
            console.error(`\x1b[41m\x1b[37m[ERROR]\x1b[0m Conversion of '${file}' failed:\n${result}`);
        }
        else {
            const destFile = `${base}.${format}`;
            if (!fs_1.existsSync(destFile) || force) {
                fs_1.writeFileSync(destFile, result.join("\n"));
                console.info(`\x1b[44m\x1b[37m[ OK  ]\x1b[0m '${destFile}'`);
                success++;
            }
            else {
                console.error(`\x1b[41m\x1b[37m[ERROR]\x1b[0m File already exists: '${destFile}'`);
            }
        }
    });
    console.info(`${success} file(s) processed successfully.`);
    console.info(`${files.length - success} file(s) processed unsuccessfully.`);
};
yargs_1.default(helpers_1.hideBin(process.argv))
    .command("$0 <output-format> [items..]", "Convert subtitles between formats", yargs2 => yargs2.positional("output-format", {
    type: "string",
    description: "The desired subtitles output format",
    choices: Converter_1.DEST,
}), convert)
    .option("recursive", {
    alias: "r",
    type: "boolean",
    description: "Browse directories recursively",
})
    .option("force", {
    alias: "f",
    type: "boolean",
    description: "Force overwriting of existing files",
})
    .usage("Usage: $0 <output-format> [options] [files|directories..]")
    .strict().argv;
