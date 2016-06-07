// list snapshots ordered by snapshot id (most recent first)
var config = [{
        author: '',
        title: '',
        websiteUrl: 'https://imaginary.org/snapshots',
        shortWebsiteUrl: 'http://bit.ly/1Pewr52',
        pdfUrl: 'resources/overview.pdf',
        isOverview: true
    }, {
        author: 'Rafael Guglielmetti, Matthieu Jacquemet ',
        title: 'Polyhedra and commensurability',
        websiteUrl: 'https://imaginary.org/snapshot/polyhedra-and-commensurability',
        shortWebsiteUrl: 'http://bit.ly/1tbCC5P',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2016-009-guglielmetti-jacquemet.pdf'
    }, {
        author: 'Manfred Deistler, Andreas Graef',
        title: 'Fokus-Erkennung bei Epilepsiepatienten mithilfe moderner Verfahren der Zeitreihenanalyse',
        websiteUrl: 'https://imaginary.org/snapshot/fokus-erkennung-bei-epilepsiepatienten-mithilfe-moderner-verfahren-der-zeitreihenanalyse',
        shortWebsiteUrl: 'http://bit.ly/1XwrNbn',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2016-008-deistler-graef.pdf'
    }, {
        author: 'Anthony T. Patera, Karsten Urban',
        title: 'High performance computing on smartphones',
        websiteUrl: 'https://imaginary.org/snapshot/high-performance-computing-on-smartphones',
        shortWebsiteUrl: 'http://bit.ly/1XwsAZP',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2016-006-urban-patera.pdf'
    }, {
        author: 'Eugenio Giannelli, Jay Taylor ',
        title: 'Symmetry and characters of finite groups',
        websiteUrl: 'https://imaginary.org/snapshot/symmetry-and-characters-of-finite-groups',
        shortWebsiteUrl: 'http://bit.ly/1XwrRrF',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2016-005-gianelli-taylor.pdf'
    }, {
        author: 'Maria Dostert, Stefan Krupp, Jan Hendrik Rolfes',
        title: 'Das Problem der Kugelpackung',
        websiteUrl: 'https://imaginary.org/snapshot/das-problem-der-kugelpackung',
        shortWebsiteUrl: 'http://bit.ly/1XwsiSA',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2016-004-dostert-rolfes-krupp.pdf'
    }, {
        author: 'Tomasz Szemberg, Justyna Szpond',
        title: 'On the containment problem',
        websiteUrl: 'https://imaginary.org/snapshot/on-the-containment-problem',
        shortWebsiteUrl: 'http://bit.ly/1XwshxW',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2016-003-szemberg-szpond.pdf'
    }, {
        author: 'Éric Fusy ',
        title: 'Random sampling of domino and lozenge tilings',
        websiteUrl: 'https://imaginary.org/snapshot/random-sampling-of-domino-and-lozenge-tilings',
        shortWebsiteUrl: 'http://bit.ly/1XwrT2A',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2016-002-fusy.pdf'
    }, {
        author: 'Magnus Egerstedt',
        title: 'Swarming robots',
        websiteUrl: 'https://imaginary.org/snapshot/swarming-robots',
        shortWebsiteUrl: 'http://bit.ly/1XwsxNB',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2016-001.pdf'
    }, {
        author: 'Ulrich Krähmer',
        title: 'From computer algorithms to quantum field theory: an introduction to operads',
        websiteUrl: 'https://imaginary.org/snapshot/from-computer-algorithms-to-quantum-field-theory-an-introduction-to-operads',
        shortWebsiteUrl: 'http://bit.ly/1XwrYDy',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-017.pdf'
    }, {
        author: 'Juanjo Rué ',
        title: 'Domino tilings of the Aztec Diamond',
        websiteUrl: 'https://imaginary.org/snapshot/domino-tilings-of-the-aztec-diamond',
        shortWebsiteUrl: 'http://bit.ly/1XwsjWE',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-016.pdf'
    }, {
        author: 'Sebastian Funk',
        title: 'The mystery of sleeping sickness – why does it keep waking up?',
        websiteUrl: 'https://imaginary.org/snapshot/the-mystery-of-sleeping-sickness-why-does-it-keep-waking-up',
        shortWebsiteUrl: 'http://bit.ly/1XwrPQp',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-015.pdf'
    }, {
        author: 'Antti Knowles',
        title: 'Quantum diffusion',
        websiteUrl: 'https://imaginary.org/snapshot/quantum-diffusion',
        shortWebsiteUrl: 'http://bit.ly/1Xws262',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2015-014-knowles.pdf'
    }, {
        author: 'Amanda Swan, Albert Murtha',
        title: 'Modelling the spread of brain tumours',
        websiteUrl: 'https://imaginary.org/snapshot/modelling-the-spread-of-brain-tumours',
        shortWebsiteUrl: 'http://bit.ly/1XwrQnz',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2015-013-swan-murtha.pdf'
    }, {
        author: 'J. S. Marron',
        title: 'Visual Analysis of Spanish Male Mortality',
        websiteUrl: 'https://imaginary.org/snapshot/visual-analysis-of-spanish-male-mortality',
        shortWebsiteUrl: 'http://bit.ly/1XwsCkp',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2015-012-marron.pdf'
    }, {
        author: 'Christopher J. Sangwin',
        title: 'Curriculum development in university mathematics: where mathematicians and education collide',
        websiteUrl: 'https://imaginary.org/snapshot/curriculum-development-in-university-mathematics-where-mathematicians-and-education-collide',
        shortWebsiteUrl: 'http://bit.ly/1XwrX2v',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2015-011-sangwin.pdf'
    }, {
        author: 'Jürg Kramer, Anna-Maria von Pippich',
        title: 'Special values of zeta functions and areas of triangles',
        websiteUrl: 'https://imaginary.org/snapshot/special-values-of-zeta-functions-and-areas-of-triangles',
        shortWebsiteUrl: 'http://bit.ly/1XwrJbn',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2015-010-pippich-kramer.pdf'
    }, {
        author: 'Victoria Powers',
        title: 'How to choose a winner: the mathematics of social choice',
        websiteUrl: 'https://imaginary.org/snapshot/how-to-choose-a-winner-the-mathematics-of-social-choice',
        shortWebsiteUrl: 'http://bit.ly/1Xwsots',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/2015-009-powers.pdf'
    }, {
        author: 'Valentina Kiritchenko, Evgeny Smirnov, Vladlen Timorin',
        title: 'Ideas of Newton-Okounkov bodies',
        websiteUrl: 'https://imaginary.org/snapshot/ideas-of-newton-okounkov-bodies',
        shortWebsiteUrl: 'http://bit.ly/1XwrWvt',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-008.pdf'
    }, {
        author: 'Ben Schweizer',
        title: 'Darcy\'s law and groundwater flow modelling ',
        websiteUrl: 'https://imaginary.org/snapshot/darcys-law-and-groundwater-flow-modelling',
        shortWebsiteUrl: 'http://bit.ly/1XwrP2N',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-007.pdf'
    }, {
        author: 'Raluca Eftimie',
        title: 'Modeling communication and movement: from cells to animals and humans',
        websiteUrl: 'https://imaginary.org/snapshot/modelling-communication-and-movement-from-cells-to-animals-and-humans',
        shortWebsiteUrl: 'http://bit.ly/1XwrPQl',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/communication_1.pdf'
    }, {
        author: 'Tom Solomon',
        title: 'Chaos and chaotic fluid mixing',
        websiteUrl: 'https://imaginary.org/snapshot/chaos-and-chaotic-fluid-mixing',
        shortWebsiteUrl: 'http://bit.ly/1XwrYmU',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-005.pdf'
    }, {
        author: 'Thorsten Holm',
        title: 'Friezes and tilings',
        websiteUrl: 'https://imaginary.org/snapshot/friezes-and-tilings',
        shortWebsiteUrl: 'http://bit.ly/1XwrSvz',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-004.pdf'
    }, {
        author: 'George Willis',
        title: 'Zero-dimensional symmetry',
        websiteUrl: 'https://imaginary.org/snapshot/zero-dimensional-symmetry',
        shortWebsiteUrl: 'http://bit.ly/1XwskKc',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-003.pdf'
    }, {
        author: 'Christine Breiner',
        title: 'Minimizing energy',
        websiteUrl: 'https://imaginary.org/snapshot/minimizing-energy',
        shortWebsiteUrl: 'http://bit.ly/1XwrYDq',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-002.pdf'
    }, {
        author: 'Diana Davis',
        title: 'Billiards and flat surfaces',
        websiteUrl: 'https://imaginary.org/snapshot/billiards-and-flat-surfaces',
        shortWebsiteUrl: 'http://bit.ly/1XwszFd',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2015-001_0.pdf'
    }, {
        author: 'Peter Benner, Hermann Mena, René Schneider',
        title: 'Drugs, herbicides, and numerical simulation',
        websiteUrl: 'https://imaginary.org/snapshot/drugs-herbicides-and-numerical-simulation',
        shortWebsiteUrl: 'http://bit.ly/1XwsD7X',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-010.pdf'
    }, {
        author: 'Greg Knese',
        title: 'Operator theory and the singular value decomposition',
        websiteUrl: 'https://imaginary.org/snapshot/operator-theory-and-the-singular-value-decomposition',
        shortWebsiteUrl: 'http://bit.ly/1XwrKMt',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-009.pdf'
    }, {
        author: 'Alain Valette',
        title: 'The Kadison-Singer problem',
        websiteUrl: 'https://imaginary.org/snapshot/the-kadison-singer-problem',
        shortWebsiteUrl: 'http://bit.ly/1XwrQnn',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-008.pdf'
    }, {
        author: 'Ragnar-Olaf Buchweitz, Eleonore Faber',
        title: 'Swallowtail on the shore',
        websiteUrl: 'https://imaginary.org/snapshot/swallowtail-on-the-shore',
        shortWebsiteUrl: 'http://bit.ly/1Xwsdyr',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-007.pdf'
    }, {
        author: 'Howell Tong',
        title: 'Statistics and dynamical phenomena',
        websiteUrl: 'https://imaginary.org/snapshot/statistics-and-dynamical-phenomena',
        shortWebsiteUrl: 'http://bit.ly/1Xws2mz',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-006.pdf'
    }, {
        author: 'Brian Harbourne, Tomasz Szemberg',
        title: 'Arrangements of lines',
        websiteUrl: 'https://imaginary.org/snapshot/arrangements-of-lines',
        shortWebsiteUrl: 'http://bit.ly/1XwrZas',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-005.pdf'
    }, {
        author: 'Bruce Reznick',
        title: 'What does > really mean?',
        websiteUrl: 'https://imaginary.org/snapshot/what-does-really-mean',
        shortWebsiteUrl: 'http://bit.ly/1XwrX2k',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-004_0.pdf'
    }, {
        author: 'Harald Helfgott',
        title: 'The ternary Goldbach problem',
        websiteUrl: 'https://imaginary.org/snapshot/the-ternary-goldbach-problem',
        shortWebsiteUrl: 'http://bit.ly/1XwrZY8',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-003.pdf'
    }, {
        author: 'Wolfgang Lerche',
        title: 'Matrixfaktorisierungen',
        websiteUrl: 'https://imaginary.org/snapshot/matrixfaktorisierungen',
        shortWebsiteUrl: 'http://bit.ly/1Xwsnpm',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-002.pdf'
    }, {
        author: 'John E. McCarthy',
        title: 'Dirichlet Series',
        websiteUrl: 'https://imaginary.org/snapshot/dirichlet-series',
        shortWebsiteUrl: 'http://bit.ly/1XwrtJA',
        pdfUrl: 'https://imaginary.org/sites/default/files/snapshots/snapshot-2014-001.pdf'
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

var miscConfig = {
    idleModeDelayMs: 3 * 60 * 1000,
    idleModeDelayBetweenActionsMs: 8 * 1000,
    idleAnimationDurationMs: 1 * 1000
};
