import * as piexifjs from 'piexifjs';

import { FileFormat } from "./file";

export class JpgFile implements FileFormat {
    private readonly metadata: piexifjs.ExifDict;
    private readonly dataUrl: string;

    constructor(data: Buffer) {
        this.dataUrl = `data:image/jpeg;base64,${data.toString('base64')}`
        this.metadata = piexifjs.load(this.dataUrl);
    }

    public get imageDescription(): string {
        return Buffer.from(this.metadata["0th"][piexifjs.ImageIFD.ImageDescription] || "", 'latin1').toString("utf-8");
    }

    public set imageDescription(s: string) {
        if (s !== "") {
            this.metadata["0th"][piexifjs.ImageIFD.ImageDescription] = Buffer.from(s).toString('latin1');
        } else {
            delete this.metadata["0th"][piexifjs.ImageIFD.ImageDescription];
        }
    }

    public get imageOriginDateTime(): Date {
        try
        {
            var dateTimeOriginal = Buffer.from(this.metadata.Exif[piexifjs.ExifIFD.DateTimeOriginal] || "", 'latin1').toString("utf-8");
            var dateTimeOriginalSplit = dateTimeOriginal.split(' ');

            var dateTimeFormatted = dateTimeOriginalSplit[0].replace(/:/g, '-') + 'T' + dateTimeOriginalSplit[1];
            
            return new Date(dateTimeFormatted);
        }
        catch
        {
            return new Date();
        }
    }

    public toBuffer(): Buffer {
        const updatedImageDataUrl = piexifjs.insert(piexifjs.dump(this.metadata), this.dataUrl);
        return Buffer.from(updatedImageDataUrl.split(",")[1], 'base64');
    }
}
