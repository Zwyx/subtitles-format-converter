export const SRC = ["vtt"] as const;

export type Src = typeof SRC[number];

export const isSrc = (value: unknown): value is Src =>
	typeof value === "string" && SRC.includes(value as Src);

export const DEST = ["srt"] as const;

export type Dest = typeof DEST[number];

export const isDest = (value: unknown): value is Dest =>
	typeof value === "string" && DEST.includes(value as Dest);

type To = string[] | string;

type From = {
	to: {
		srt: () => To;
	};
};

type Entry = {
	start: { h: string; m: string; s: string; ms: string };
	end: { h: string; m: string; s: string; ms: string };
	content: string;
};

const fromVtt = (lines: string[]): From => {
	const entries: Entry[] = [];

	type State = { inSub: boolean };

	const state: State = { inSub: false };

	try {
		lines.forEach((line, i) => {
			if (line === "WEBVTT" && i === 0) {
				return;
			}

			const matchTime = line.match(
				/^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/
			);

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
	} catch (err: unknown) {
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

const toSrt = (entries: Entry[] | string): To =>
	typeof entries === "string"
		? entries
		: entries.map(
				({ start, end, content }, i) =>
					`${i + 1}\n` +
					`${start.h}:${start.m}:${start.s},${start.ms} --> ${end.h}:${end.m}:${end.s},${end.ms}\n` +
					`${content || "\n"}`
		  );

export const Converter = {
	from: {
		vtt: fromVtt,
	},
};
