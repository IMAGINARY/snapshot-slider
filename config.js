var config = [{
        "websiteUrl": "http://imaginary.org/snapshot/polyhedra-and-commensurability",
        "shortWebsiteUrl": "http://bit.ly/20R3gLI",
        "pdfUrl": "http://imaginary.org/sites/default/files/snapshots/2016-009-guglielmetti-jacquemet.pdf",
    }, {
        "websiteUrl": "http://imaginary.org/snapshot/the-mystery-of-sleeping-sickness-why-does-it-keep-waking-up",
        "shortWebsiteUrl": "http://bit.ly/1Z9M5Ey",
        "pdfUrl": "http://imaginary.org/sites/default/files/snapshots/snapshot-2015-015.pdf",
    }, {
        "websiteUrl": "http://imaginary.org/snapshot/on-the-containment-problem",
        "shortWebsiteUrl": "http://bit.ly/22vcTBa",
        "pdfUrl": "http://imaginary.org/sites/default/files/snapshots/2016-003-szemberg-szpond.pdf",
    }, {
        "websiteUrl": "http://imaginary.org/snapshot/random-sampling-of-domino-and-lozenge-tilings",
        "shortWebsiteUrl": "http://bit.ly/27ZY6SZ",
        "pdfUrl": "http://imaginary.org/sites/default/files/snapshots/2016-002-fusy.pdf",
    },
    /* template
    {
        "websiteUrl": "",
        "shortWebsiteUrl": "",
        "pdfUrl": "",
    },
    */
];

var mailConfig = {
    senderName: 'Snapshot station',
    senderAddress: 'snapshot-station@imaginary.org',
    defaultRecipientName: "IMAGINARY user",
    subject: "Snapshots of modern mathematics from Oberwolfach",
    //    text: "", // if not set, a simple plain text version will be extracted from the HTML version
    html: `<html>

    <body lang="EN-US" xml:lang="EN-US">
        <p>Dear {defaultRecipientName},</p>

        <p>
            thank you for visiting our snapshots station, which is part of the
            <a href="https://imaginary.org/" target="_blank">IMAGINARY exhibition</a>.
        </p>

        <p>
            The <u>snapshots of modern mathematics from Oberwolfach</u> are short texts on aspects of modern mathematics written by researchers visiting the <u>Mathematisches Forschungsinstitut Oberwolfach (MFO)</u> and edited for accessibility and understandability.
        </p>

        <p>
            You are/were looking at the following snapshot:
            <br />
            <a href="{websiteUrl}" target="_blank">{websiteUrl}</a>
            <br /> which can be downloaded as pdf here:
            <br />
            <a href="{pdfUrl}" target="_blank">{pdfUrl}</a>
        </p>

        <p>
            If you are interested in translating this snapshot, please contact us at
            <a href="mailto:snapshots-translation@imaginary.org" target="_blank">snapshots-translation@imaginary.org</a>. For more snapshots, visit our
            <a href="https://imaginary.org/snapshots" target="_blank">snapshots section</a> on the
            <a href="https://imaginary.org/" target="_blank">IMAGINARY platform</a>. You can also
            <a href="https://www.mfo.de/math-in-public/snapshots/files/RSS" target="_blank">subscribe</a> to the RSS feed and stay up-to-date with the latest snapshots.
        </p>

        <p>
            Thank you,
            <br /> your IMAGINARY team
        </p>
    </body>

    </html>`
};
