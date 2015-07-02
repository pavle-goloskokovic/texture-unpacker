TextureUnpacker
========================

# Overview
Use this script to unpack **.png** sprites from the sprite atlas (providing a **.plist** or **.json** data file and a **.png** file) packed by [TexturePacker](http://www.codeandweb.com/texturepacker/).

Also suport packed by [Coco Studio](http://www.cocos2d-x.org/wiki/Cocos_Studio)

# Dependencies
  - [Python](http://www.python.org)
  - [plistlib](https://docs.python.org/2/library/plistlib.html)
  - [Pillow (PIL fork)](https://github.com/python-pillow/Pillow) 

# Usage
	
	$ python unpacker.py <filename> [<format>]
	
## filename

- Filename of the sprite atlas image and data file without extensions.

## format 

*optional* Data file format.If omitted **plist** format is assumed.

-  **plist** : Plist file packed by TexturePacker, **default**
-  **json**	: Json file packed byTexturePacker
-  **cocos** : Plist file packed by Coco Studio


# Examples

### Default (plist) example

We have a pair of sprite atlas files named **Sprite.plist** and **Sprite.png** packed by [TexturePacker](http://www.codeandweb.com/texturepacker/).
Put them in the same folder as the **unpacker.py** script and run one of the following commands:

    python unpacker.py Sprite
    
or

    python unpacker.py Sprite plist
    
    
Script will generate a folder named **Sprite** containing all the sprites from the sprite atlas.

### JSON example

If you have **Sprite.json** data file instead of the **Sprite.plist** one run the following command:

    python unpacker.py Sprite json
    
Result will be the same.

### CocoStudio Plist example

If you have **Sprite.plist** data file, it is defferent from the plist which packed by Coco Studio and run the following command:

    python unpacker.py Sprite cocos
    
Result will be the same.
