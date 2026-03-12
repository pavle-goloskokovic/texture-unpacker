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
unpack('assets/Sprite.png', {   // Directory or sprite sheet path/name
    format: 'json',             // Data format type ('json' or 'plist')
    data: 'assets/Sprite.json', // Custom data file path
    output: 'assets/sprites',   // Custom output directory path
    clean: true                 // Clean the output directory before unpacking
} as UnpackOptions
).then(() => {
    console.log('Texture unpacked.');
});
```

## Example

A comprehensive usage example has been moved to a dedicated repository. Visit [texture-unpacker-example](https://github.com/pavle-goloskokovic/texture-unpacker-example) for detailed instructions, sample assets, and step‑by‑step walkthroughs.

The example repo contains the same sprite sheets and data files previously included here, along with additional notes and demonstrations.

## Contributing

If you have noticed a bug or would like us to support additional data formats, feel free to [open an issue](https://github.com/pavle-goloskokovic/texture-unpacker/issues) describing said bug or requested format (and provide matching sprite sheet and data files), or even better [open a pull request](https://github.com/pavle-goloskokovic/texture-unpacker/pulls) with code changes which fixes the bug or adds support for new data format.

## Dependencies
- [sharp](https://github.com/lovell/sharp)
- [plist.js](https://github.com/TooTallNate/plist.js)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)

___
###### Originally ported from [onepill/texture_unpacker_scirpt](https://github.com/onepill/texture_unpacker_scirpt) archive written in python.
