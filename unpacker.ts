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
        real_sizelist: number[];
        result_box: number[];
        rotated: boolean;
    };
}

const textureFormat = 'png'; // TODO use textureFormat instead of png
const dataFormats = ['json', 'plist'];

const to_list = (x: string): number[] =>
{
    return x.replace(/{/g, '')
        .replace(/}/g, '')
        .split(',')
        .map(value => Number(value));
};

// TODO const instead of function
function sprites_from_data (filename: string, ext: string): SpritesData
{
    const rawData = readFileSync(filename + ext, 'utf8');

    if (ext === '.plist')
    {
        const data = <any>plist.parse(rawData) as PlistData;
        const sprites: SpritesData = {};

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

            const frame = to_list(f.frame);
            const rotated = f.rotated;
            const sourceSize = to_list(f.sourceSize);
            const offset = to_list(f.offset);
            const x = frame[0];
            const y = frame[1];
            const w = rotated ? frame[3] : frame[2];
            const h = rotated ? frame[2] : frame[3];
            const real_w = rotated ? sourceSize[1] : sourceSize[0];
            const real_h = rotated ? sourceSize[0] : sourceSize[1];
            const offset_x = rotated ? offset[1] : offset[0];
            const offset_y = rotated ? offset[0] : -offset[1];

            sprites[spriteName] = {
                box: [x, y, x + w, y + h],
                real_sizelist: [real_w, real_h],
                result_box: [
                    (real_w - w) / 2 + offset_x,
                    (real_h - h) / 2 + offset_y,
                    (real_w + w) / 2 + offset_x,
                    (real_h + h) / 2 + offset_y
                ],
                rotated
            };
        }

        return sprites;
    }
    else if (ext === '.json')
    {
        const data = JSON.parse(rawData) as JsonData;
        const sprites: SpritesData = {};

        data.frames.forEach((f) =>
        {
            const frame = f.frame;
            const rotated = f.rotated;
            const sourceSize = f.sourceSize;
            const x = frame.x;
            const y = frame.y;
            const w = rotated ? frame.h : frame.w;
            const h = rotated ? frame.w : frame.h;
            const real_w = rotated ? sourceSize.h : sourceSize.w;
            const real_h = rotated ? sourceSize.w : sourceSize.h;

            sprites[f.filename] = {
                box: [x, y, x + w, y + h],
                real_sizelist: [real_w, real_h],
                result_box: [
                    (real_w - w) / 2,
                    (real_h - h) / 2,
                    (real_w + w) / 2,
                    (real_h + h) / 2
                ],
                rotated
            };
        });

        return sprites;
    }
    else
    {
        console.error(`Wrong data format on parsing: '${ext}'!`);
        process.exit(1);
    }
}

function gen_textures_from_data (filename: string, ext: string): void
{
    // const big_image = Image.open(filename + '.png'); // TODO use sharp
    const sprites = sprites_from_data(filename, ext);

    console.log(filename, ext, sprites);

    /*for (const spriteName in sprites)
    {
        const sprite = sprites[spriteName];
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
}

// Get the all files & directories in the specified directory (path).
function get_file_list (path: string): string[] // TODO snake case to camel case
{
    const results: string[] = [];
    const pathFiles = readdirSync(path);

    pathFiles.forEach((file_name) =>
    {
        const full_file_name = join(path, file_name);

        if (existsSync(full_file_name) &&
            lstatSync(full_file_name).isDirectory())
        {
            results.push(...get_file_list(full_file_name));
        }
        else if (full_file_name.toLowerCase().endsWith(`.${textureFormat}`))
        {
            results.push(full_file_name.replace(
                new RegExp(`.${textureFormat}$`, 'i'), '')
            );
        }
    });

    return results;
}

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

function get_sources_file (filename: string, ext: string): void
{
    const data_filename = getDataPath(filename, ext);
    const texture_filename = `${filename}.${textureFormat}`;

    if (existsSync(data_filename) && existsSync(texture_filename))
    {
        gen_textures_from_data(filename, extname(data_filename));
    }
    else
    {
        console.warn('Make sure you have both data and texture files'
            + ` in the same directory for:\n'${filename}'`);
    }
}

const getPathOrName = (argv: string[]): string =>
{
    return join(__dirname, argv.length ? argv[0] : '');
};

const getExt = (argv: string[]): string =>
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
const path_or_name = getPathOrName(argv);
const ext = getExt(argv);

// supports multiple file conversions
if (existsSync(path_or_name) && lstatSync(path_or_name).isDirectory())
{
    get_file_list(path_or_name).forEach((file) =>
    {
        get_sources_file(file, ext);
    });
}
else
{
    get_sources_file(path_or_name, ext);
}
