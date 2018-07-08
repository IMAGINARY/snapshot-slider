# snapshot-slider

## Controling the slider
You can either control the slider via mouse or touch screen or by using the
hotkeys <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd> and <kbd>↓</kbd>.

Additional hotkeys are:
- <kbd>Mod</kbd>+<kbd>u</kbd>: update the list of available SNAPSHOTs and reload
- <kbd>Mod</kbd>+<kbd>i</kbd>: show simple About page
- <kbd>Mod</kbd>+<kbd>r</kbd>: reload the slider without restarting the program (especially useful
  during development)
- <kbd>Mod</kbd>+<kbd>c</kbd>: clear cache directories

Where <kbd>Mod</kbd> is <kbd>Ctrl</kbd> on Linux and <kbd>Cmd</kbd> on macOS.

## How to build and run

You will need [Node.js](https://nodejs.org/en/download/) and [npm](http://npmjs.com).

On Ubuntu 14.04 and above, you can try the following procedure:
```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get update
sudo apt-get install nodejs git libcups2-dev
sudo npm install --global yarn@1.7.0
git clone https://github.com/IMAGINRY/snapshot-slider
cd snapshot-slider
yarn install
yarn run start
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

### Cache

SNAPSHOT PDF files are cached locally based on the urls supplied in the `Settings`
file and stored in the application's cache directory.

The SNAPSHOT slider is able to detect corrupted files in the cache via sha256 hash
sums and will attempt to download such files again. This will fail if there is
no internet connection or the SNAPSHOT URLs supplied in the `Settings` file are
invalid.

It is possible to clear the cache using the hotkey <kbd>c</kbd>.

### Auto update

The SNAPSHOT slider can automatically update the list of available SNAPSHOT PDFs
and download them to te cache. The default hotkey is <kbd>u</kbd>, but updates can
also be performed on program startup. However, this is discouraged if the program is
presented in a public, unsupervised venue since server errors can easily break the
installation.

## Building the redistributable packages

We rely on [Electron builder](https://github.com/electron-userland/electron-builder)
to build the redistributable packages. Please see its documentation for prerequisites.

For Linux, also take a look at the [`Dockerfile`](Dockerfile) and its dependencies
(`FROM`) on dockerhub.

Now, you should be able to build the packages for your platform
(only macOS and Linux supported at the moment):
```bash
yarn install
yarn run dist
```

## License [Apache License Version 2.0](LICENSE)
