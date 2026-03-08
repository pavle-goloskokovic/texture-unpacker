#!/usr/bin/env node

import { existsSync, lstatSync, readdirSync } from 'fs';
import { isAbsolute, join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
    appendTextureExt,
    textureExt,
    unpack
} from './index';

// Get all files with texture ext in the specified path (recursively).
const getFiles = (path: string): string[] =>
{
    const results: string[] = [];
    const files = readdirSync(path);

    files.forEach((filename) =>
    {
        const fullPath = join(path, filename);

        if (existsSync(fullPath) && lstatSync(fullPath).isDirectory())
        {
            results.push(...getFiles(fullPath));
        }
        else if (fullPath.toLowerCase().endsWith(textureExt))
        {
            results.push(fullPath);
        }
    });

    return results;
};

const getAbsolutePath = (path: string): string =>
{
    if (isAbsolute(path))
    {
        return path;
    }
    else
    {
        return join(process.cwd(), path);
    }
};

const argv = yargs(hideBin(process.argv))
    .version()
    .alias('v', 'version')
    .usage('Usage: texture-unpacker [options]')
    .options({
        sheet: {
            alias: 's',
            demandOption: false,
            default: '',
            describe: 'Directory or sprite sheet path/name',
            type: 'string'
        },
        format: {
            alias: 'f',
            demandOption: false,
            default: '',
            describe: 'Data format type (\'json\' or \'plist\')',
            type: 'string'
        },
        data: {
            alias: 'd',
            demandOption: false,
            default: '',
            describe: 'Custom data file path',
            type: 'string'
        },
        output: {
            alias: 'o',
            demandOption: false,
            default: '',
            describe: 'Custom output directory path',
            type: 'string'
        },
        clean: {
            alias: 'c',
            demandOption: false,
            default: false,
            describe: 'Clean the output directory before unpacking',
            type: 'boolean'
        }
    })
    .help()
    .alias('h', 'help')
    .parseSync();

const inputPath = getAbsolutePath(argv.sheet);
const options = {
    dataPath: argv.data && getAbsolutePath(argv.data),
    dataFormat: argv.format,
    outputPath: argv.output && getAbsolutePath(argv.output),
    clean: argv.clean
};
const texturePath = appendTextureExt(inputPath);

if (existsSync(texturePath))
{
    unpack(inputPath, options);
}
// supports multiple file conversions
else if (existsSync(inputPath) && lstatSync(inputPath).isDirectory())
{
    getFiles(inputPath).forEach((filePath) =>
    {
        unpack(filePath, options);
    });
}
else
{
    console.error(`'${inputPath}' not found.`);
}
