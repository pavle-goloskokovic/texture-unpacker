interface UnpackOptions {
    format?: string;
    data?: string;
    output?: string;
    clean?: boolean;
}
declare const unpack: (sheet: string, options?: UnpackOptions) => Promise<void>;

export { type UnpackOptions, unpack };
