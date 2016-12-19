# snapshot-slider

## How to run

You will need [Node.js](https://nodejs.org/en/download/) and [npm](http://npmjs.com)).

On Ubuntu 14.04, you can try the following procedure:
```bash
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get update
sudo apt-get install nodejs git libcups2-dev
git clone https://github.com/IMAGINRY/snapshot-slider
cd snapshot-slider
npm install
npm run rebuild
npm run start
```

## Settings

Configuration data is stored inside a file called `Settings` located in the user
data directory of the application. Depending on the platform, this defaults to
```
~/Library/Application Support/SNAPSHOT slider # macOS
~/.config/SNAPSHOT slider                     # Linux
```

The `Settings` file is in JSON format. It is created automatically, if it is not
there.

### PDF cache

SNAPSHOT PDF files are cached locally based on the urls supplied in the `Settings`
file and stored in the directory `pdfCache` next to the `Settings` file.

Corrupt files in the cache can cause the program to fail. Deleting the cache may
help, but an internet connection is needed to fill the cache again.

## Building the redistributable packages

We rely on [Electron builder](https://github.com/electron-userland/electron-builder)
to build the redistributable packages. Please see its documentation for prerequisites.

For Linux, also take a look at the [`Dockerfile`](Dockerfile) and its dependencies
(`FROM`) on dockerhub.

Now, you should be able to build the packages for your platform
(only macOS and Linux supported at the moment):
```bash
npm install
npm purge
npm run dist
```

## License [Apache License Version 2.0](LICENSE)
