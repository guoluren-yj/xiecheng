#!/bin/bash
# set -e

# CI_COMMIT_SHA=$(git rev-parse HEAD | awk '{print $1}')
# BUILD_LOGIN_URL="/"
# OBS_PUBLIC_URL="https://static.going-link.com"
# BUILD_BASE_PATH="/app/"
# BUILD_LOGOUT_URL="/oauth/logout"
# BUILD_CLIENT_ID="srm-front"
# BUILD_PUBLIC_URL_PATH="805ce4b-${CI_COMMIT_SHA}"
# BUILD_API_HOST="https://dev.isrm.going-link.com"
# BUILD_SRC_WEBSOCKET_HOST="https://source.dev.isrm.going-link.com"
# BUILD_WEBSOCKET_HOST="https://dev.isrm.going-link.com/hpfm/sock-js"
# BUILD_SRM_MALL_HOST="https://new.dev.going-buy.com/"
# BUILD_SRM_AMKT_HOST="https://dev.market.going-link.com"
# BUILD_PUBLIC_URL="${OBS_PUBLIC_URL}/${BUILD_PUBLIC_URL_PATH}/"

# sed -i "s BUILD_LOGIN_URL $BUILD_LOGIN_URL g" src/config/.env.yml
# sed -i "s BUILD_PUBLIC_URL $BUILD_PUBLIC_URL g" src/config/.env.yml
# sed -i "s BUILD_BASE_PATH $BUILD_BASE_PATH g" src/config/.env.yml
# sed -i "s BUILD_LOGOUT_URL $BUILD_LOGOUT_URL g" src/config/.env.yml
# sed -i "s BUILD_CLIENT_ID $BUILD_CLIENT_ID g" src/config/.env.yml
# sed -i "s BUILD_PLATFORM_VERSION $BUILD_PLATFORM_VERSION g" src/config/.env.yml
# sed -i "s BUILD_API_HOST $BUILD_API_HOST g" src/config/.env.yml
# sed -i "s BUILD_SRC_WEBSOCKET_HOST $BUILD_SRC_WEBSOCKET_HOST g" src/config/.env.yml
# sed -i "s BUILD_WEBSOCKET_HOST $BUILD_WEBSOCKET_HOST g" src/config/.env.yml
# sed -i "s BUILD_SRM_MALL_HOST $BUILD_SRM_MALL_HOST g" src/config/.env.yml
# sed -i "s BUILD_SRM_AMKT_HOST $BUILD_SRM_AMKT_HOST g" src/config/.env.yml

# subCount=0
# for dir in `ls -l packages | awk '/^d/ {print $NF}'`; do
#   subCount=$(($subCount+1))
#   cd "packages/$dir"
#   if [[ $(($subCount%3)) != 0 ]];then
#     yarn build 1 > /dev/null &
#   else
#     yarn build
#   fi;
#   cd ../../
# done;
# for i in {1..300}; do
#   if [[ $i == 300 ]];then
#     break;
#   fi;
#   sleep 1
# done;

# for dir in `ls -l srm-dist/packages| awk '/^d/ {print $NF}'`; do
#       cp -r srm-dist/packages/${dir} dist/packages/
# done;

# mkdir temp
# cp dist/packages/microConfig.json temp/microConfig.json
# curl https://static.going-link.com/805ce4b-08805deea19700f13c661fa565f3c692569abde2/packages/microConfig.json -o ./temp/microConfig.json
# for dir in `ls -l dist/packages| awk '/^d/ {print $NF}'`; do
#   cp dist/packages/${dir}/package.json ./temp/${dir}-package.json
# done;

# node ./updateMicroConfig.js ./temp dist/packages
# # 子模块便利处理脚本，可根据需要随意修改
dirs=`ls -l packages | awk '/^d/ {print $NF}'`
for dir in $dirs; do
  # if [[ $dir != *cux* ]];then
    # mv "packages/$dir/gitlab-ci.yml" "packages/$dir/.gitlab-ci.yml"
    cd "packages/$dir"
    # git push
    
    # git reset --hard HEAD
    git add .
    git commit -m "feat($dir): 批量修改版本号"
    git pull
    git push
    git checkout -b release-1.28.0
    git push --set-upstream origin release-1.28.0
    git push
    git checkout test
    cd ../../
    echo $dir
  # fi;
done
# # subCount=0
# # for dir in `ls -l packages | awk '/^d/ {print $NF}'`; do
# #     subCount=$(($subCount+1))
# #     cd "packages/$dir"
# #     if [[ $(($subCount%3)) != 0 ]];then
# # yarn build 1 > /dev/null &
# #     else
# # yarn build
# #     fi;
# #     cd ../../
# # done;

# # for i in {1..300}; do
# #     if [[ $i == 300 ]];then
# # break;
# #     fi;
# #     sleep 1
# # done;