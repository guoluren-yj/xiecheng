import React, { useEffect } from 'react';
import querystring from 'querystring';
import { Result, Button, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import { getIeVersion } from 'utils/browser';

export default function DownloadFile({ location: { search } }) {
  useEffect(() => {
    const { target, language, method, accessToken, requestId } = querystring.parse(search && search.substring(1)) || {};
    if (target) {
      const [targetPath, targetParamsStr] = target.split("?");
      const targetParams = querystring.parse(targetParamsStr) || {};
      let url = targetPath;
      // form表单提交方式
      const iframeName = `${target}${Math.random()}`;
      // 构建iframe
      const iframe = document.createElement('iframe');
      iframe.setAttribute('name', iframeName);
      iframe.setAttribute('id', iframeName);
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.display = 'none';
      // 构建form
      const downloadForm = document.createElement('form');
      if (getIeVersion() === -1) {
        // 如果当前浏览器不为ie
        // form 指向 iframe
        downloadForm.setAttribute('target', iframeName);
      }

      // 设置token
      const tokenInput = document.createElement('input');
      tokenInput.setAttribute('type', 'hidden');
      tokenInput.setAttribute('name', 'access_token');
      tokenInput.setAttribute('value', `${accessToken}`);

      // 设置requestId
      const idInput = document.createElement('input');
      idInput.setAttribute('type', 'hidden');
      idInput.setAttribute('name', 'H-Request-Id');
      idInput.setAttribute('value', `${requestId}`);
      // 处理post请求时token效验
      if (method === 'POST') {
        url = `${url}?access_token=${getAccessToken()}&H-Request-Id=${getRequestId()}`;
      }
      // 表单添加请求配置
      downloadForm.setAttribute('method', method);
      downloadForm.setAttribute('action', url);
      downloadForm.appendChild(tokenInput);
      downloadForm.appendChild(idInput);

      // 表单添加查询参数
      if (targetParams) {
        Object.keys(targetParams).forEach((item) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', item);
          input.setAttribute('value', targetParams[item]);
          downloadForm.appendChild(input);
        });
      }

      document.body.appendChild(iframe);
      document.body.appendChild(downloadForm);
      downloadForm.submit();
    }
  }, []);

  return (
    <div>
      <Result
        status="success"
        icon={<Icon type="get_app" />}
        title={intl.get('hzero.common.title.downloading').d('正在下载')}
        subTitle={intl.get('hzero.common.title.waitDownload').d('等待下载完毕后您可手动关闭页面')}
        extra={[
          <Button
            funcType="raised"
            type="primary"
            key="close"
            onClick={() => {
              window.close();
            }}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
      />
    </div>
  );
}
