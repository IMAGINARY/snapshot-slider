'use strict';

const { WritableStreamBuffer } = require('stream-buffers');
const hummus = require('hummus');
const printer = require('printer');

module.exports = class SnapshotPrinter {

    static async print(pdfFilename) {
        await new Promise((resolve, reject) => {
            const docName = path.basename(pdfFilename);
            console.log('printing ' + path.basename(pdfFilename));
            const streamBuffer = new WritableStreamBuffer({
                initialSize: (1000 * 1024), // start at 100 kilobytes.
                incrementAmount: (100 * 1024) // grow by 10 kilobytes each time buffer overflows.
            });
            createPDFBooklet(pdfFilename, streamBuffer);
            printer.printDirect({
                data: streamBuffer.getContents(),
                docname: docName,
                type: 'PDF',
                options: {
                    landscape: true,
                    PageSize: 'A4',
                    Duplex: 'DuplexTumble'
                },
                success: resolve,
                error: reject
            });
        });
    }
};


function createPDF2On1(infile, outfileOrStream, pagesNumbers) {
    console.log(`Creating 2-on-1 version of ${infile} at ${outfileOrStream}`);
    if (typeof outfileOrStream !== 'string')
        outfileOrStream = new hummus.PDFStreamForResponse(outfileOrStream);
    const pdfWriter = hummus.createWriter(outfileOrStream, {
        version: eval("hummus.ePDFVersion" + hummus.createReader(infile).getPDFLevel() * 10)
    });
    const copyingContext = pdfWriter.createPDFCopyingContext(infile);
    const numPages = copyingContext.getSourceDocumentParser().getPagesCount();
    pagesNumbers = (typeof pagesNumbers !== 'undefined') ? pagesNumbers : Array.from(Array(numPages), (_, i) => i);

    for(let i = 0; i < pagesNumbers.length;) {
        const page = pdfWriter.createPage(0, 0, 842, 595);
        const pageContent = pdfWriter.startPageContentContext(page);

        if (pagesNumbers[i] >= 0) {
            pageContent.q().cm(1, 0, 0, 1, 0, 0);
            copyingContext.mergePDFPageToPage(page, pagesNumbers[i]);
            pageContent.Q();
        }
        ++i;
        if (i < pagesNumbers.length && pagesNumbers[i] >= 0) {
            pageContent.q().cm(1, 0, 0, 1, 421, 0);
            copyingContext.mergePDFPageToPage(page, pagesNumbers[i]);
            pageContent.Q();
        }
        ++i;

        pdfWriter.writePage(page);
    }

    pdfWriter.end();
}

function createPDFBooklet(infile, outfileOrStream, shiftLastPageToBackCover = true) {
    console.log(`Creating booklet version of ${infile} at ${outfileOrStream}`);
    const numPages = hummus.createReader(infile).getPagesCount();
    const numBookletPages = Math.ceil(numPages / 4) * 4;

    // compute bookelt page numbers
    let pageNumbers = Array(0);
    let segment = [numBookletPages - 1, 0, 1, numBookletPages - 2];
    for (let i = 0; i < numBookletPages / 4; ++i) {
        pageNumbers = pageNumbers.concat(segment);
        segment = [segment[0] - 2, segment[1] + 2, segment[2] + 2, segment[3] - 2];
    }

    // move last page of input to last page of booklet if required
    if (shiftLastPageToBackCover) {
        pageNumbers = pageNumbers.map(i => i >= numPages - 1 ? -1 : i);
        pageNumbers[0] = numPages - 1;
    } else {
        pageNumbers = pageNumbers.map(i => i > numPages - 1 ? -1 : i);
    }
    createPDF2On1(infile, outfileOrStream, pageNumbers);
}