interface UnpackOptions {
    dataPath?: string;
    dataFormat?: string;
    outputPath?: string;
    clean?: boolean;
}
declare const unpack: (inputPath: string, options?: UnpackOptions) => void;

export { type UnpackOptions, unpack };
