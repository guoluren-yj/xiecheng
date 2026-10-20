FROM registry.cn-hangzhou.aliyuncs.com/choerodon-tools/frontbase:0.5.0

RUN echo "Asia/shanghai" > /etc/timezone;
ADD ./docker/default.conf /etc/nginx/conf.d/
ADD ./_site /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
