FROM 192.168.24.5:5000/ein-ent/web-ui:base




COPY . /lain/app/


WORKDIR /lain/app/


#RUN ( yarn --prefer-offline ) && ( yarn build ) && ( rm -rf node_modules )
RUN ( yarn run build ) && ( rm -rf /tmp/* ) && ( rm -rf $HOME/.ssh )

