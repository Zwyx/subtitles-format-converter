#!/usr/bin/env ts-node

import {
	existsSync,
	lstatSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "fs";
import { basename, extname } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Converter, DEST, Dest, isSrc } from "./Converter";

type Arguments = {
	recursive?: boolean;
	force?: boolean;
	outputFormat: Dest;
	items: (string | number | boolean)[];
};

const convert = (args: Arguments) => {
	const format = args.outputFormat;
	const recursive = args.recursive;
	const force = args.force;
	const items = args.items.map(item => String(item));

	if (!items.length) {
		console.error(
			`\x1b[41m\x1b[37m[ERROR]\x1b[0m No files or directories given.`
		);
		return 1;
	}

	const files: string[] = [];
	let success: number = 0;

	const browse = (path: string, browseDirectory?: boolean) => {
		try {
			const lstat = lstatSync(path);

			if (lstat.isDirectory()) {
				if (browseDirectory) {
					readdirSync(path).forEach(item =>
						browse(`${path}/${item}`, recursive)
					);
				}
			} else if (lstat.isFile()) {
				files.push(path);
			} else {
				console.error(
					`\x1b[41m\x1b[37m[ERROR]\x1b[0m '${path}' is neither a file nor a directory`
				);
			}
		} catch (err: unknown) {
			console.error(`\x1b[41m\x1b[37m[ERROR]\x1b[0m ${err}`);
		}
	};

	items.forEach(item => browse(item, true));

	files.forEach(file => {
		const ext = extname(file).toLowerCase().replace(".", "");

		if (!isSrc(ext)) {
			console.error(
				`\x1b[41m\x1b[37m[ERROR]\x1b[0m Unsupported format '${ext}' for '${file}'`
			);
			return;
		}

		const base = basename(file, extname(file));

		const lines = readFileSync(`${file}`, { encoding: "utf-8" }).split("\n");

		const result = Converter.from[ext](lines).to[format]();

		if (typeof result === "string") {
			console.error(
				`\x1b[41m\x1b[37m[ERROR]\x1b[0m Conversion of '${file}' failed:\n${result}`
			);
		} else {
			const destFile = `${base}.${format}`;

			if (!existsSync(destFile) || force) {
				writeFileSync(destFile, result.join("\n"));
				console.info(`\x1b[44m\x1b[37m[ OK  ]\x1b[0m '${destFile}'`);
				success++;
			} else {
				console.error(
					`\x1b[41m\x1b[37m[ERROR]\x1b[0m File already exists: '${destFile}'`
				);
			}
		}
	});

	console.info(`${success} file(s) processed successfully.`);
	console.info(`${files.length - success} file(s) processed unsuccessfully.`);
};

yargs(hideBin(process.argv))
	.command<Arguments>(
		"$0 <output-format> [items..]",
		"Convert subtitles between formats",
		yargs2 =>
			yargs2.positional("output-format", {
				type: "string",
				description: "The desired subtitles output format",
				choices: DEST,
			}),
		convert
	)
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
