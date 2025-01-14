#FROM nginx:stable-alpine

# Copy the build output to the Nginx HTML directory
#COPY /build /usr/share/nginx/html

# Copy the Nginx configuration file
#COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
#EXPOSE 80

# Run Nginx in the foreground
#CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;'"]


FROM nginx:stable-alpine

# Copia il build di React nella directory HTML di Nginx
COPY ./build /usr/share/nginx/html

# Copia la configurazione di Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80
EXPOSE 80

# Esegui Nginx in modalità foreground
CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;'"]
