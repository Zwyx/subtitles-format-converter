"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Converter = exports.isDest = exports.DEST = exports.isSrc = exports.SRC = void 0;
exports.SRC = ["vtt"];
const isSrc = (value) => typeof value === "string" && exports.SRC.includes(value);
exports.isSrc = isSrc;
exports.DEST = ["srt"];
const isDest = (value) => typeof value === "string" && exports.DEST.includes(value);
exports.isDest = isDest;
const fromVtt = (lines) => {
    const entries = [];
    const state = { inSub: false };
    try {
        lines.forEach((line, i) => {
            if (line === "WEBVTT" && i === 0) {
                return;
            }
            const matchTime = line.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
            if (matchTime) {
                entries.push({
                    start: {
                        h: matchTime[1],
                        m: matchTime[2],
                        s: matchTime[3],
                        ms: matchTime[4],
                    },
                    end: {
                        h: matchTime[5],
                        m: matchTime[6],
                        s: matchTime[7],
                        ms: matchTime[8],
                    },
                    content: "",
                });
                state.inSub = true;
                return;
            }
            if (state.inSub && line !== "") {
                entries.slice(-1)[0].content += line + "\n";
                return;
            }
            if (line === "") {
                state.inSub = false;
                return;
            }
            throw Error(`line ${i + 1}: unexpected line.`);
        });
    }
    catch (err) {
        return {
            to: {
                srt: () => toSrt(String(err)),
            },
        };
    }
    return {
        to: {
            srt: () => toSrt(entries),
        },
    };
};
const toSrt = (entries) => typeof entries === "string"
    ? entries
    : entries.map(({ start, end, content }, i) => `${i + 1}\n` +
        `${start.h}:${start.m}:${start.s},${start.ms} --> ${end.h}:${end.m}:${end.s},${end.ms}\n` +
        `${content || "\n"}`);
exports.Converter = {
    from: {
        vtt: fromVtt,
    },
};
