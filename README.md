# snapshot-slider

## Prerequisites and usage

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

The program calls out to the command line for caching PDFs locally and for printing. Printing requires `lp`, whereas caching relies on all tools used in [`cache.sh`](cache.sh). These tools have to be installed separately before running the progrm.

On Ubuntu 14.04, you can try the following installation procedure:
```bash
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get update
sudo apt-get install nodejs git cups-client
cd /opt
sudo git clone https://github.com/IMAGINRY/snapshot-slider
cd snapshot-slider
sudo chmod 777 content
sudo npm install
sudo ./node_modules/.bin/electron-rebuild
```

Now you can run the program as a regular user:
```bash
npm start
```

## License [Apache License Version 2.0](LICENSE)
