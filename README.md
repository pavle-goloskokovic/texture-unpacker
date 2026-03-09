![Node.js, split TexturePacker, and TypeScript logos](https://user-images.githubusercontent.com/7340300/207878018-21d96c16-980a-4d96-8c5b-b3c913024dfb.png)

# 🗃️ TextureUnpacker

## Overview

[TextureUnpacker](https://github.com/pavle-goloskokovic/texture-unpacker) is a Node.js tool written in TypeScript which can be used to unpack `.png` sprite sheets packed with [TexturePacker](https://www.codeandweb.com/texturepacker/) into separate sprites if provided with corresponding `.json` or `.plist` data file.

### Supported data formats:

- JSON (Array)
- JSON (Hash)
- Phaser (JSONArray)
- Phaser (JSONHash)
- Phaser 3
- PixiJS
- Cocos2d-x
- Cocos2d
- Cocos2d v2 (old, CocoStudio)

## Installation

```bash
# install globally (optional, requires npm permissions)
npm install -g texture-unpacker

# or add to a project and run the tool locally
npm install texture-unpacker
```

## Usage

### Command-line

```bash
# Display the built‑in help

texture-unpacker --help

# Usage: texture-unpacker [options]
#
# Options:
#   -s, --sheet    Directory or sprite sheet path/name      [string] [default: ""]
#   -f, --format   Data format type ('json' or 'plist')     [string] [default: ""]
#   -d, --data     Custom data file path                    [string] [default: ""]
#   -o, --output   Custom output directory path             [string] [default: ""]
#   -c, --clean    Clean the output directory before unpacking
#                                                       [boolean] [default: false]
#   -v, --version  Show version number                                   [boolean]
#   -h, --help     Show help                                             [boolean]
```

### Programmatic API

Use the package from JavaScript or TypeScript:

```ts
// CommonJS
const { unpack } = require('texture-unpacker');

// ES module
import { unpack } from 'texture-unpacker';

// TypeScript will pick up the included declarations automatically
// and exposes the `UnpackOptions` interface:
import type { UnpackOptions } from 'texture-unpacker';

// example call showing all options
unpack({
    inputPath: 'assets/Sprite.png', // Directory or sprite sheet path/name
    dataPath: 'assets/Sprite.json', // Custom data file path
    dataFormat: 'json',             // Data format type ('json' or 'plist')
    outputPath: 'assets/sprites',   // Custom output directory path
    clean: true                     // Clean the output directory before unpacking
} as UnpackOptions);
```

## Example

We have sprite sheet and data files `Sprite.png`, `Sprite.json`, and `Sprite.plist` available in the `example` directory. The tool assumes that sprite sheet and data files have the same name with different extensions.

Running the command below will read `json` data file, create `Sprite` directory at the same level as the sprite sheet file, and populate it with individual sprites:

```bash
texture-unpacker -s example/Sprite.png -f json
```

In case we have multiple data files available, like in this example, you can explicitly provide `plist` as the format argument to give it precedence:

```bash
texture-unpacker -s example/Sprite.png -f plist
```

Omitting the format argument in the command above will use `json` data since it is the default expected format:

```bash
texture-unpacker -s example/Sprite.png
```

In case you have only `plist` data file available, the above command would work the same since the tool can automatically detect available data file.

You can also omit the sprite sheet extension `.png` when running the tool for the same effect:

```bash
texture-unpacker -s example/Sprite
```

Providing directory path as the input path will scan provided directory for `.png` sprite sheets with accompanying data files to unpack:

```bash
texture-unpacker -s example
```
Note that providing `example/Sprite` as the input path will give priority to `example/Sprite.png` sprite sheet file, rather than to the generated `example/Sprite` directory, to avoid undesired behavior if you run the tool repeatedly.

And finally, omitting the input path argument completely will scan the entire project structure to find all available `.png` sprite sheets with accompanying data files to unpack:

```bash
texture-unpacker
```

If you want to override the default data path, you can pass a custom one as an argument:

```bash
texture-unpacker -s example/Sprite -d example/Sprite_custom.json
```
Note that custom data file path must include file extension, and if data format is also passed it will be ignored.

If you want to override the default output path, you can pass a custom one as an argument:

```bash
texture-unpacker -s example/Sprite -o example/Sprite_unpacked
```

If you want to clean the output directory before unpacking you can indicate that by passing another argument:

```bash
texture-unpacker -s example/Sprite -c
```

## Contributing

If you have noticed a bug or would like us to support additional data formats, feel free to [open an issue](https://github.com/pavle-goloskokovic/texture-unpacker/issues) describing said bug or requested format (and provide matching sprite sheet and data files), or even better [open a pull request](https://github.com/pavle-goloskokovic/texture-unpacker/pulls) with code changes which fixes the bug or adds support for new data format.

## Dependencies
- [sharp](https://github.com/lovell/sharp)
- [plist.js](https://github.com/TooTallNate/plist.js)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)

___
###### Originally ported from [onepill/texture_unpacker_scirpt](https://github.com/onepill/texture_unpacker_scirpt) archive written in python.
