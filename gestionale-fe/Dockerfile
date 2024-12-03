FROM nginx:stable-alpine

# Copy the build output to the Nginx HTML directory
COPY /build /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground
CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;'"]
