import { join, extname } from 'path';
import { readdirSync, lstatSync, existsSync, readFileSync, mkdirSync } from 'fs';
import * as plist from 'plist';
import sharp from 'sharp';

interface PlistData {
    frames: Record<string, {
        frame: string;
        textureRect?: string;
        rotated: boolean;
        textureRotated?: boolean;
        sourceSize: string;
        spriteSourceSize?: string;
    }>;
    metadata: {
        format: number;
        size: string;
    };
}

interface JsonData {
    frames: {
        filename: string;
        frame: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
        rotated: boolean;
        sourceSize: {
            w: number;
            h: number;
        };
    }[];
    meta: {
        size: {
            w: number;
            h: number;
        };
    };
}

interface SpritesData {
    [key: string]: {
        region: sharp.Region;
        resizeOptions: sharp.ResizeOptions;
        rotated: boolean;
    };
}

const textureFormat = 'png';
const textureFormatRegEx = new RegExp(`.${textureFormat}$`, 'i');
const dataFormats = ['json', 'plist'];

const toNumbersArray = (str: string): number[] =>
{
    return str.replace(/{/g, '')
        .replace(/}/g, '')
        .split(',')
        .map(value => Number(value));
};

const getSpritesData = (filename: string, ext: string): SpritesData =>
{
    const rawData = readFileSync(filename + ext, 'utf8');

    if (ext === '.plist')
    {
        const data = <any>plist.parse(rawData) as PlistData;
        const size = toNumbersArray(data.metadata.size);
        const spritesData: SpritesData = {};

        for (const spriteName in data.frames)
        {
            const f = data.frames[spriteName];

            if (data.metadata.format === 3)
            {
                f.frame = f.textureRect;
                f.rotated = f.textureRotated;
                f.sourceSize = f.spriteSourceSize;
            }

            const frame = toNumbersArray(f.frame);
            const rotated = f.rotated;
            const sourceSize = toNumbersArray(f.sourceSize);
            const w = frame[2];
            const h = frame[3];
            const x = !rotated ? frame[0] : frame[1];
            const y = !rotated ? frame[1] : size[0] - h - frame[0];

            spritesData[spriteName] = {
                region: {
                    left: x,
                    top: y,
                    width: w,
                    height: h
                },
                resizeOptions: {
                    width: sourceSize[0],
                    height: sourceSize[1]
                },
                rotated
            };
        }

        return spritesData;
    }
    else if (ext === '.json')
    {
        const data = JSON.parse(rawData) as JsonData;
        const spritesData: SpritesData = {};

        data.frames.forEach((f) =>
        {
            const frame = f.frame;
            const rotated = f.rotated;
            const sourceSize = f.sourceSize;
            const w = frame.w;
            const h = frame.h;
            const x = !rotated ? frame.x : frame.y;
            const y = !rotated ? frame.y : data.meta.size.w - h - frame.x;

            spritesData[f.filename] = {
                region: {
                    left: x,
                    top: y,
                    width: w,
                    height: h
                },
                resizeOptions: {
                    width: sourceSize.w,
                    height: sourceSize.h
                },
                rotated
            };
        });

        return spritesData;
    }
    else
    {
        console.error(`Wrong data format on parsing: '${ext}'!`);
        process.exit(1);
    }
};

const generateSprites = (filename: string, ext: string): void =>
{
    const texture = sharp(`${filename}.${textureFormat}`);
    const spritesData = getSpritesData(filename, ext);

    const promises: Promise<void>[] = [];

    for (const spriteName in spritesData)
    {
        if (!existsSync(filename))
        {
            mkdirSync(filename, { recursive: true });
        }

        let outPath = join(filename, spriteName);

        if (!outPath.toLowerCase().endsWith('.png'))
        {
            outPath += '.png';
        }

        const spriteData = spritesData[spriteName];

        promises.push(texture.clone()
            // Method order is important when rotating,
            // resizing and/or extracting regions:
            // https://sharp.pixelplumbing.com/api-operation#rotate
            .rotate(spriteData.rotated ? -90 : 0)
            .extract(spriteData.region)
            .resize(spriteData.resizeOptions)
            .toFile(outPath).then((info) =>
            {
                console.info(`${outPath} generated.`);
            },
            (reason) =>
            {
                console.error(outPath, reason);
            })
        );
    }

    Promise.all(promises).then(() =>
    {
        console.info('Unpacking complete.');
    },
    (reason) =>
    {
        console.error(reason);
    });
};

// Get the all files in the specified directory (path).
const getFiles = (path: string): string[] =>
{
    const results: string[] = [];
    const files = readdirSync(path);

    files.forEach((filename) =>
    {
        const fullFilename = join(path, filename);

        if (existsSync(fullFilename) &&
            lstatSync(fullFilename).isDirectory())
        {
            results.push(...getFiles(fullFilename));
        }
        else if (fullFilename.toLowerCase().endsWith(`.${textureFormat}`))
        {
            results.push(fullFilename.replace(textureFormatRegEx, ''));
        }
    });

    return results;
};

const getDataPath = (filename: string, ext: string): string =>
{
    if (ext)
    {
        return filename + ext;
    }

    for (let i = 0; i < dataFormats.length; i++)
    {
        const dataPath = `${filename}.${dataFormats[i]}`;

        if (existsSync(dataPath))
        {
            return dataPath;
        }
    }

    return filename;
};

const unpack = (filename: string, ext: string): void =>
{
    const dataPath = getDataPath(filename, ext);
    const texturePath = `${filename}.${textureFormat}`;

    if (existsSync(dataPath) && existsSync(texturePath))
    {
        generateSprites(filename, extname(dataPath));
    }
    else
    {
        console.warn('Make sure you have both data and texture files'
            + ` in the same directory for:\n'${filename}'`);
    }
};

const getPathOrName = (argv: string[]): string =>
{
    return join(__dirname, argv.length ? argv[0] : '');
};

const getExtFromDataFormat = (argv: string[]): string =>
{
    if (argv.length < 2)
    {
        console.info('No data format passed, will check for all supported.');
        return '';
    }
    else
    {
        const ext = argv[1];

        switch (ext)
        {
            case 'json':
            case 'plist':
                console.info(`'${ext}' data format passed.`);
                return `.${ext}`;

            default:
                console.error(`Wrong data format passed: '${ext}'!`);
                process.exit(1);
        }
    }
};

// TODO update comment below
// Use like this: python unpacker.py [Image Path or Image Name(but no suffix)] [Type:plist or json]
const argv = process.argv.slice(2);
const pathOrName = getPathOrName(argv);
const ext = getExtFromDataFormat(argv);

// supports multiple file conversions
if (existsSync(pathOrName) && lstatSync(pathOrName).isDirectory())
{
    getFiles(pathOrName).forEach((filename) =>
    {
        unpack(filename, ext);
    });
}
else
{
    unpack(pathOrName.replace(textureFormatRegEx, ''), ext);
}
