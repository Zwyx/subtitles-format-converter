# Subtitles Format Converter

Command line utility to convert subtitles between formats.

# Currently supported input formats

- VTT (partially)

# Currently supported outpout formats

- SRT

# Installation

```sh
npm i -g subtitles-format-converter
```

# Usage

```sh
Usage: sfc <output-format> [options] [files|directories..]

Positionals:
  output-format                                        [string] [choices: "srt"]

Options:
      --help       Show help                                           [boolean]
      --version    Show version number                                 [boolean]
  -r, --recursive  Browse directories recursively                      [boolean]
  -f, --force      Force overwriting of existing files                 [boolean]
```
