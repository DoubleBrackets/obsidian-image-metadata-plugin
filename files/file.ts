export interface FileFormat {
    get imageDescription(): string;
    set imageDescription(s: string);

    get imageOriginDateTime(): Date;
    
    toBuffer(): Buffer;
}
