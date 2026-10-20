import React from 'react';
import { isString, isArray } from 'lodash';
import { Modal } from 'choerodon-ui/pro'; 
import request from 'hzero-front/lib/utils/request';
import notification from 'hzero-front/lib/utils/notification';
import { HZERO_RPT } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import {
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentLanguage,
} from 'hzero-front/lib/utils/utils';
import { querySignedUrl } from 'hzero-front/lib/services/api';

import { getPdfPreviewUrl } from '../../utils/utils';
import PDFViewer from '../PDFViewer';

const { BASE_PATH } = getEnvConfig<any>();

export const downloadFile = (url, flag) => {
  if (flag) {
    // form表单提交方式
    const iframeName = `${url}${Math.random()}`;
    // 构建iframe
    const iframe = document.createElement('iframe');
    iframe.setAttribute('name', iframeName);
    iframe.setAttribute('id', iframeName);
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const link = document.createElement('a');
    link.href = url;
    link.target = iframeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // 飞书会拦截不同源url,此处跳转到中转页面下载
    window.open(
      `${BASE_PATH ||
        '/'}public/download-file?language=${getCurrentLanguage()}&target=${encodeURIComponent(url)}`
    );
  }
};

export function handlePreviewData({ outType, token, flag, loadingCallback, tzParams, isFireFox }: any, options?: any) {
  const { asyncFlag } = options || {};
  if (loadingCallback) loadingCallback(true);
  const header = {
    's-print-from': 'FC',
  };
  if (!flag && outType !== 'EXCEL') {
    header['s-print-using-preview'] = '1';
  }
  const param = {
    signedUrl: !isFireFox,
    outType,
    ...tzParams,
  };
  if (isFireFox) {
    param.skipPdfWatermark = true;
  }
  if (asyncFlag) {
    param.asyncFlag = true;
  }
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print/file`
      : `${HZERO_RPT}/v1/print/file`,
    {
      method: 'POST',
      body: isArray(token) ? token : [token],
      headers: header,
      responseType: flag || outType === 'EXCEL' ? 'text' : 'json',
      query: param,
    },
  ).finally(() => {
    if (loadingCallback) loadingCallback(false);
  }).then(async(res) => {
    if (asyncFlag) {
      return res;
    }
    if (isFireFox && res && isString(res)) {
      if (res.indexOf('overviewFile') !== -1) {
        try {
          const { fileUrl, overviewFile } = JSON.parse(res);
          if (overviewFile && fileUrl) {
            const signedUrl = await querySignedUrl({ url: encodeURIComponent(fileUrl), bucketName: 'private-bucket', skipPdfWatermark: true }, undefined);
            if (getResponse(signedUrl) && signedUrl) {
              return JSON.stringify({ fileUrl: signedUrl, overviewFile });
            }
          }
        } catch (e) {
          notification.error({});
        }
      }
      if (res.indexOf('failed') === -1) {
        return querySignedUrl({ url: encodeURIComponent(res), bucketName: 'private-bucket', skipPdfWatermark: true }, undefined);
      }
    }
    return res;
  });
}
export const handlePreview = (param, options?: any ) => {
  const { outType, flag, successCallback, errorCallback, beforeDownloadExcel } = param;
  const { asyncFlag, ovewrviewFile } = options || {};
  handlePreviewData(param, options).then(resp => {
    if (asyncFlag) {
      notification.success({
        message: intl.get('hzero.common.print.asyncPrintSuccess').d('单据数量大，自动转为异步打印，异步打印任务提交成功!'),
      });
      return;
    }
    if (isString(resp)) {
      if (resp.indexOf('failed') !== -1) {
        try {
          const result = JSON.parse(resp);
          getResponse(result, errorCallback);
        } catch (e) {
          notification.error({});
        }
        return;
      }
      if (resp.indexOf('overviewFile') !== -1) {
        try {
          const { fileUrl, overviewFile } = JSON.parse(resp);
          if (overviewFile) {
            asyncPrintFile(param, { ovewrviewFile: true });
            return;
          } else {
            downloadFile(fileUrl, flag);
            return;
          }
        } catch (e) {
          notification.error({});
        }
      }
      if (successCallback) successCallback();
      if (outType === 'EXCEL') {
        Promise.resolve(beforeDownloadExcel ? beforeDownloadExcel(resp) : true).then(res => {
          if (res) {
            downloadFile(resp, flag);
          }
        });
        return;
      }
      if (ovewrviewFile === false) {
        notification.success({
          message: intl.get('hzero.common.print.asyncPrintSuccess').d('单据数量大，自动转为异步打印，异步打印任务提交成功!'),
        });
        return;
      }
      if (flag) {
        const fileUrl = resp && resp.split('?')[0];
        const temp = fileUrl ? fileUrl.split('/') : [];
        const filename = temp ? temp[temp.length - 1] : '';
        const fileType = (/\.[^./\\]*$/.exec(filename) || [''])[0];
        if (!fileType || fileType.toLowerCase() !== '.pdf') {
          const link = document.createElement('a');
          link.href = resp;
          link.click();
        } else {
          Modal.open({
            title: intl.get('hzero.common.button.print').d('打印'),
            drawer: true,
            resizable: true,
            closable: true,
            footer: null,
            style: {
              width: "calc(100vw - 220px)",
              minWidth: "calc((100vw - 220px)/2)",
            },
            children: (
              <PDFViewer
                url={resp}
                customeDownload={asyncFlag ? () => asyncPrintFile(param, { ovewrviewFile: false }) : undefined}
              />
            ),
          });
        }
      }
    } else if (!flag && resp && getResponse(resp)) {
      if (successCallback) {
        successCallback();
      }
      const { bucketName, fileToken, fileUrl } = resp;
      getPdfPreviewUrl({ fileUrl, bucketName, fileToken }).then(url => {
        window.open(url);
      });
    }
  });
};


export async function asyncPrintFile(param, options = {}) {
  await handlePreview(param, { ...options, asyncFlag: true });
}