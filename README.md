![Node.js, split TexturePacker, and TypeScript logos](https://user-images.githubusercontent.com/7340300/207878018-21d96c16-980a-4d96-8c5b-b3c913024dfb.png)

# 🗃️ TextureUnpacker

## Overview

TextureUnpacker is a Node.js tool written in TypeScript which can be used to unpack `.png` sprite sheets packed with [TexturePacker](https://www.codeandweb.com/texturepacker/) into separate sprites if provided with corresponding `.json` or `.plist` data file.

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

## Contributing

If you have noticed a bug or would like us to support additional data formats, feel free to [open an issue](https://github.com/pavle-goloskokovic/texture-unpacker/issues) describing said bug or requested format (and provide matching sprite sheet and data files), or even better [open a pull request](https://github.com/pavle-goloskokovic/texture-unpacker/pulls) with code changes which fixes the bug or adds support for new data format.

## Dependencies
- [sharp](https://github.com/lovell/sharp)
- [plist.js](https://github.com/TooTallNate/plist.js)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)

## Usage

```bash
# Clone the repository
$ git clone https://github.com/pavle-goloskokovic/texture-unpacker.git
$ cd texture-unpacker

# Install dependencies
$ npm install

# Run TextureUnpacker tool usage command
$ npm run unpack -- -h
# Usage: npm run unpack [-- <options>]
#
# Options:
#   -i, --inputPath   Directory or sprite sheet path/name
#                                                [string] [required] [default: ""]
#   -f, --dataFormat  Data format type ('json' or 'plist')
#                                                [string] [required] [default: ""]
#   -o, --outputPath  Output directory path                 [string] [default: ""]
#   -v, --version     Show version number                                [boolean]
#   -h, --help        Show help                                          [boolean]
```

## Example

We have sprite sheet and data files `Sprite.png`, `Sprite.json`, and `Sprite.plist` available in the `example` directory. The tool assumes that sprite sheet and data files have the same name with different extensions.

Running the command below will read `json` data file, create `Sprite` directory at the same level as the sprite sheet file, and populate it with individual sprites:

```bash
$ npm run unpack -- -i example/Sprite.png -f json
```

In case we have multiple data formats available, like in this example, you can explicitly provide `plist` as the second argument to give it precedence:

```bash
$ npm run unpack -- -i example/Sprite.png -f plist
```

Omitting the format argument in the command above will use `json` data since it is the default expected format:

```bash
$ npm run unpack -- -i example/Sprite.png
```

In case you have only `plist` data file available, the above command would work the same since the tool can automatically detect available data file.

You can also omit the sprite sheet extension `.png` when running the tool for the same effect:

```bash
$ npm run unpack -- -i example/Sprite
```

Providing directory path as the first argument will scan provided directory for `.png` sprite sheets with accompanying data files to unpack:

```bash
$ npm run unpack -- -i example
```

Note that providing `example/Sprite` as the first argument will give priority to `example/Sprite.png` sprite sheet file, rather than to the generated `example/Sprite` directory, to avoid undesired behavior if you run the tool repeatedly.

And finally, omitting the path argument completely will scan the entire project structure to find all available `.png` sprite sheets with accompanying data files to unpack:

```bash
$ npm run unpack
```

If you want to override the default output path, you can pass a custom one as an argument:

```bash
$ npm run unpack -- -i example/Sprite -o example/Sprite_unpacked
```
___
###### Originally ported from [onepill/texture_unpacker_scirpt](https://github.com/onepill/texture_unpacker_scirpt) archive written in python.
