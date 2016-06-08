# snapshot-slider

## Prerequisites

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

The program calls out to the command line for caching PDFs locally and for printing. Printing requires `lp`, whereas caching relies on all tools used in [`cache.sh`](cache.sh). These tools have to be installed separately before running the progrm.

## To Use

From your command line:

```bash
# Clone this repository
git clone https://github.com/IMAGINRY/snapshot-slider
# Go into the repository
cd snapshot-slider
# Install dependencies and run the app
npm install && npm start
```

## License [Apache License Version 2.0](LICENSE)
