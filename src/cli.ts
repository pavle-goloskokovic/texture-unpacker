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

const trimTextureExt = (path: string): string =>
{
    return path.replace(new RegExp(`${textureExt}$`, 'i'), '');
};

// Get the all files in the specified directory (path).
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
            results.push(trimTextureExt(fullPath));
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
        return join(__dirname, path);
    }
};

const argv = yargs(hideBin(process.argv))
    .version()
    .alias('v', 'version')
    .usage('Usage: npm run unpack [-- <options>]')
    .options({
        inputPath: {
            alias: 'i',
            demandOption: false,
            default: '',
            describe: 'Directory or sprite sheet path/name',
            type: 'string'
        },
        dataFormat: {
            alias: 'f',
            demandOption: false,
            default: '',
            describe: 'Data format type (\'json\' or \'plist\')',
            type: 'string'
        },
        dataPath: {
            alias: 'd',
            demandOption: false,
            default: '',
            describe: 'Custom data file path',
            type: 'string'
        },
        outputPath: {
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

const inputPath = getAbsolutePath(argv.inputPath);
const options = {
    dataPath: argv.dataPath && getAbsolutePath(argv.dataPath),
    dataFormat: argv.dataFormat,
    outputPath: argv.outputPath && getAbsolutePath(argv.outputPath),
    clean: argv.clean
};
const texturePath = appendTextureExt(inputPath);

if (existsSync(texturePath))
{
    unpack(trimTextureExt(texturePath), options);
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
