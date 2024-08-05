FROM node:20
RUN git clone https://github.com/nexusCreativeSolution/Whatsapp /root/nexusCreativeSolution
WORKDIR /root/nexusCreativeSolution
RUN npm install
EXPOSE 8080
CMD ["npm", "start"]