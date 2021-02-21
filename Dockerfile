FROM node:12.19-slim

ENV USER=shiptunes

# install python and make
RUN apt-get update && \
	apt-get install -y python3 build-essential && \
	apt-get purge -y --auto-remove
	
# create shiptunes user
RUN groupadd -r ${USER} && \
	useradd --create-home --home /home/shiptunes -r -g ${USER} ${USER}
	
# set up volume and user
USER ${USER}
WORKDIR /home/shiptunes

COPY package*.json ./
RUN npm install
VOLUME [ "/home/shiptunes" ]

COPY . .

ENTRYPOINT [ "node", "index.js" ]
