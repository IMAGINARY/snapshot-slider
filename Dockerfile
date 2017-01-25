# docker build -t snapshot-slider-builder .
# docker run --rm -v ${PWD}:/project -v ${PWD##*/}-node-modules:/project/node_modules -v ~/.electron:/root/.electron snapshot-slider-builder
FROM electronuserland/electron-builder

# libcups2-dev is a dependency of the printer nodejs module
# gcc-4.8 and g++-4.8 are needed to compile for older target platforms like e.g.
# Ubuntu 14.04
RUN apt-get update -y && \
  apt-get install --no-install-recommends -y libcups2-dev gcc-4.8 g++-4.8 && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# install yarn via npm (deprecated but easy)
RUN npm install --global yarn

# set default compiler versions to 4.8
ENV CC /usr/bin/gcc-4.8
ENV CXX /usr/bin/g++-4.8

# install nodejs dependencies and build redistributable packages
CMD yarn install && yarn run dist
