import { join, extname } from 'path';
import { readdirSync, lstatSync, existsSync, readFileSync /*, mkdirSync*/ } from 'fs';
import * as plist from 'plist';

interface PlistData {
    frames: Record<string, {
        frame: string;
        textureRect?: string;
        rotated: boolean;
        textureRotated?: boolean;
        sourceSize: string;
        spriteSourceSize?: string;
        offset: string;
        spriteOffset?: string;
    }>;
    metadata: {
        format: number;
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
}

interface SpritesData {
    [key: string]: { // TODO adjust for sharp
        box: number[];
        real_sizelist: number[]; // TODO snake case to camel case
        result_box: number[];
        rotated: boolean;
    };
}

const textureFormat = 'png'; // TODO use textureFormat instead of png
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
        const spritesData: SpritesData = {};

        for (const spriteName in data.frames)
        {
            const f = data.frames[spriteName];

            if (data.metadata.format === 3)
            {
                f.frame = f.textureRect;
                f.rotated = f.textureRotated;
                f.sourceSize = f.spriteSourceSize;
                f.offset = f.spriteOffset;
            }

            const frame = toNumbersArray(f.frame);
            const rotated = f.rotated;
            const sourceSize = toNumbersArray(f.sourceSize);
            const offset = toNumbersArray(f.offset);
            const x = frame[0];
            const y = frame[1];
            const w = rotated ? frame[3] : frame[2];
            const h = rotated ? frame[2] : frame[3];
            const realW = rotated ? sourceSize[1] : sourceSize[0];
            const realH = rotated ? sourceSize[0] : sourceSize[1];
            const offsetX = rotated ? offset[1] : offset[0];
            const offsetY = rotated ? offset[0] : -offset[1];

            spritesData[spriteName] = {
                box: [x, y, x + w, y + h],
                real_sizelist: [realW, realH],
                result_box: [
                    (realW - w) / 2 + offsetX,
                    (realH - h) / 2 + offsetY,
                    (realW + w) / 2 + offsetX,
                    (realH + h) / 2 + offsetY
                ],
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
            const x = frame.x;
            const y = frame.y;
            const w = rotated ? frame.h : frame.w;
            const h = rotated ? frame.w : frame.h;
            const realW = rotated ? sourceSize.h : sourceSize.w;
            const realH = rotated ? sourceSize.w : sourceSize.h;

            spritesData[f.filename] = {
                box: [x, y, x + w, y + h],
                real_sizelist: [realW, realH],
                result_box: [
                    (realW - w) / 2,
                    (realH - h) / 2,
                    (realW + w) / 2,
                    (realH + h) / 2
                ],
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
    // const big_image = Image.open(filename + '.png'); // TODO use sharp
    const spritesData = getSpritesData(filename, ext);

    console.log(filename, ext, spritesData);

    /*for (const spriteName in spritesData)
    {
        const sprite = spritesData[spriteName];
        const rect_on_big = big_image.crop(sprite.box);
        let result_image = Image.newX('RGBA', sprite.real_sizelist, [0, 0, 0, 0]); // TODO use sharp
        result_image.paste(rect_on_big, sprite.result_box, {
            mask: 0
        });

        if (sprite.rotated)
        {
            result_image = result_image.transpose(Image.ROTATE_90);
        }

        if (!existsSync(filename))
        {
            mkdirSync(filename, { recursive: true });
        }

        let outfile = join(filename, spriteName);

        if (!outfile.toLowerCase().endsWith('.png'))
        {
            outfile += '.png';
        }

        console.info(`${outfile} generated.`);
        result_image.save(outfile);
    }*/
};

// Get the all files in the specified directory (path).
const getFiles = (path: string): string[] => // TODO snake case to camel case
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
            results.push(fullFilename.replace(
                new RegExp(`.${textureFormat}$`, 'i'), '')
            );
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
    unpack(pathOrName, ext);
}
