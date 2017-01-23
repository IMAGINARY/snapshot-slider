# docker build -t snapshot-slider-builder .
# docker run --rm -v ${PWD}:/project -v ${PWD##*/}-node-modules:/project/node_modules -v ~/.electron:/root/.electron snapshot-slider-builder
FROM electronuserland/electron-builder
RUN apt-get update -y && \
  apt-get install --no-install-recommends -y libcups2-dev && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*
RUN npm install --global yarn
CMD yarn install && yarn run dist
