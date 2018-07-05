# docker build -t snapshot-slider-builder .
# docker run --rm -v ${PWD}:/project -v ${PWD##*/}-node-modules:/project/node_modules -v ~/.electron:/root/.electron snapshot-slider-builder
FROM electronuserland/electron-builder:8

# the base for electron-builder:8 is Ubuntu Zesty which already reached end-of-life
# -> point apt to old-releases repository
RUN sed -i -re 's/([a-z]{2}\.)?archive.ubuntu.com|security.ubuntu.com/old-releases.ubuntu.com/g' /etc/apt/sources.list

# libcups2-dev is a dependency of the printer nodejs module
# gcc-4.8 and g++-4.8 are needed to compile for older target platforms like e.g.
# Ubuntu 14.04
RUN apt-get update -y && \
  apt-get install --no-install-recommends -y libcups2-dev gcc-4.8 g++-4.8 && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# set default compiler versions to 4.8
ENV CC /usr/bin/gcc-4.8
ENV CXX /usr/bin/g++-4.8

# install yarn via npm (deprecated but easy)
RUN npm install --global yarn@

# proceed with yarn
# install nodejs dependencies and build redistributable packages
CMD npm install yarn && npx yarn install && npx yarn run dist
