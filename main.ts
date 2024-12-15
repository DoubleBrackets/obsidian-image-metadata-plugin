import { FileView, Plugin, TFile } from 'obsidian';

import { ReaderWriter } from './files/readerWriter';

export default class ImageMetadataPlugin extends Plugin {

    private readerWriter: ReaderWriter;

    async onload() {
        this.readerWriter = new ReaderWriter(this.app);

        if (!this.readerWriter.canWrite) {
            return;
        }

        this.registerEvent(
            this.app.workspace.on('file-open', this.onFileOpen.bind(this))
        );
    }

    onunload() {

    }

    async onFileOpen() {
        const file = this.app.workspace.getActiveFile();

        if (!file) {
            return;
        }

        if (this.readerWriter.supportedExtensions.contains(file.extension)) {
            await this.addControls(file);
        }
    }

    private async addControls(file: TFile) {
        const view = this.app.workspace.getActiveViewOfType(FileView);

        if (!view) {
            return;
        }

        const viewContent = view.containerEl.querySelector('.view-content');

        if (!viewContent) {
            return;
        }

        const image = await this.readerWriter.readFile(file);
        
        if(image.imageOriginDateTime.getTime() !== new Date(0).getTime())
        {
            const dateTime = this.AddDateTime(image.imageOriginDateTime, viewContent);
        }

        const descriptionInput = viewContent.createEl('textarea', {
            cls: 'image-metadata__tag-value',
            text: image.imageDescription,
            attr: {
                placeholder: 'Description'
            }
        });

        descriptionInput.addEventListener('change', () => {
            image.imageDescription = descriptionInput.value;
            this.readerWriter.writeFile(file, image);
        });
    }

    private AddDateTime(dateTime: Date, parent : Element) : Element {
        var dayOfWeek = dateTime.toLocaleString('default', { weekday: 'long' });
        var displayDate = dateTime.toLocaleString('default', { day: 'numeric', year: 'numeric', month: 'long' });
        var displayTime = dateTime.toLocaleString('default', { hour: 'numeric', minute: 'numeric', hour12: true });

        const div = parent.createDiv({
            cls: 'image-metadata__date-time-div'
        });

        const timeDiv = div.createDiv({
            text: `🕓 ${displayTime}`
        });

        const dateDiv = div.createDiv({
            text: `📅 ${displayDate} (${dayOfWeek})`
        });


        return div;
    }
}
