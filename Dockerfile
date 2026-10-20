#FROM registry.cn-hangzhou.aliyuncs.com/choerodon-tools/frontbase:0.7.0
FROM swr.cn-east-2.myhuaweicloud.com/zhenyun-open/frontend-docker-base:v0.1.3
RUN echo "Asia/shanghai" > /etc/timezone;
RUN sed -i 's/\#gzip/gzip/g' /etc/nginx/nginx.conf;
ADD ./dist /usr/share/nginx/html
ADD ./docker/default.conf /etc/nginx/conf.d/
COPY ./docker/enterpoint.sh /usr/share/nginx/html
RUN chmod +x /usr/share/nginx/html/enterpoint.sh && chown -R nginx:nginx /usr/share/nginx/html/
ENTRYPOINT ["/usr/share/nginx/html/enterpoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
