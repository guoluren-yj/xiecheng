/* eslint-disable react/jsx-filename-extension */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { isString, isArray } from 'lodash';
import { Button, Form, Select, Spin } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Alert } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import { WaitType } from 'choerodon-ui/pro/lib/core/enum';
import formatterCollections from "hzero-front/lib/utils/intl/formatterCollections";
import styles from './index.less';
import { handlePreviewData } from './util';
import { getPdfPreviewUrl } from '../../utils/utils';
import PDFViewer from '../PDFViewer';

export default formatterCollections({ code: ["hzero.common"]})(function PreviewDrawer(props) {
  const { outType, flag, token, lang, timeZone, selectableReports, isFireFox } = props;
  const tenantId = useMemo(() => getCurrentOrganizationId(), []);
  const [tpl, setTpl] = useState('');
  const [loading, setLoading] = useState(true);
  const cacheTimestamp = useMemo(() => ({ current: new Date().valueOf() }), []);
  const tplCache: { [x: string]: { url?: string, blob?: Blob | null, print?: boolean, preview?: boolean, error?: boolean, disabledPrivew?: boolean } } = useMemo(() => ({}), []);
  const [tplInfo, setTplInfo] = useState<any>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const asyncFlag = tplInfo && tplInfo.asyncFlag === true;
  const tplChange = useCallback((newTpl, oldTpl) => {
    setLoading(true);
    setTpl(newTpl);
    setLoading(true);
    const promise = handlePreviewData({ outType, flag, tenantId, token, tzParams: filterNullValueObject({ reportCode: newTpl, lang, timeZone }), isFireFox })
    .then(resp => handleResp(resp, { outType, flag, tenantId }));
    promise.then(res => {
      if (!res || res.error) {
        setLoading(false);
        setTpl(oldTpl);
        return;
      }
      setTplInfo(res);
      tplCache[newTpl] = res;
      if (res.blob) {
        const URL = window.URL || window.webkitURL;
        const blobURL = URL.createObjectURL(res.blob);
        setBlobUrl(blobURL);
      }
      setLoading(false);
    });
  }, [token, isFireFox]);
  useEffect(() => {
    if (selectableReports && selectableReports.length) {
      const list = selectableReports.filter(Boolean);
      const info: any = list && list.length ? list[0] : {};
      setTpl(info.reportCode);
      tplChange(info.reportCode, info.reportCode);
    }
  }, [selectableReports, token, tplChange]);

  useEffect(() => {
    hideGlobalWatermarkOpactiy();
    window.addEventListener('resize', hideGlobalWatermarkOpactiy);
    return () => {
      window.removeEventListener('resize', hideGlobalWatermarkOpactiy);
      resetGlobalWatermarkOpactiy();
    };
  }, []);

  const globalWatermarkOpactiy = useMemo(() => {
    const elements: any = document.querySelectorAll('.mask_mark');
    return elements && elements[0] && elements[0].style.opacity;
  }, []);

  const resetGlobalWatermarkOpactiy = () => {
    const elements: any = document.querySelectorAll('.mask_mark');
    if (elements && elements.length && globalWatermarkOpactiy) {
      const timer = setInterval(() => {
        let flag = true;
        elements.forEach(el => {
          if (el.style.opacity !== globalWatermarkOpactiy) {
            flag = false;
          }
          el.style.opacity = globalWatermarkOpactiy;
        });
        if (flag) {
          clearInterval(timer);
        }
      }, 200);
    }
  };

  const hideGlobalWatermarkOpactiy = () => {
    const elements: any = document.querySelectorAll('.mask_mark');
    if (elements && elements.length) {
      elements.forEach(el => {
        el.style.opacity = '0';
      });
    }
  };

  const handleAsyncPrint = async() => {
    const res = await handlePreviewData(
      { outType, flag, tenantId, token, tzParams: filterNullValueObject({ reportCode: tpl, lang, timeZone }), isFireFox },
      { asyncFlag: true }
    );
    if (res && res.indexOf('failed') !== -1) {
      try {
        const result = JSON.parse(res);
        getResponse(result);
      } catch (e) {
        notification.error({});
      }
    }
    notification.success({
      message: intl.get('hzero.common.print.asyncPrintSuccess').d('单据数量大，自动转为异步打印，异步打印任务提交成功!'),
    });
  };

  return (
    <div className={styles['print-preivew']}>
      <Spin spinning={loading}>
        <div className="print-content">
          <Form labelLayout={LabelLayout.float} columns={3}>
            <Select
              onChange={tplChange}
              clearButton={false}
              value={tpl}
              label={intl.get('hzero.common.view.title.template').d('模板')}
            >
              {selectableReports.map(item => (
                <Select.Option key={item.reportCode} value={item.reportCode}>
                  {item.reportName}
                </Select.Option>
              ))}
            </Select>
            {asyncFlag && (
              <Form.Item>
                <Button
                  color={ButtonColor.primary}
                  style={{ width: 'auto' }}
                  onClick={handleAsyncPrint}
                  waitType={WaitType.debounce}
                  wait={300}
                >
                  {intl.get('hzero.common.print.printAll').d('全部打印')}
                </Button>
              </Form.Item>
            )}
          </Form>
          {asyncFlag && (
            <Alert
              className={styles['print-async-alert']}
              showIcon
              closable
              type='warning'
              message={intl.get('hzero.common.print.asyncPrintHelp')
                .d('打印已转异步，当前页面预览10条数据打印样式，请点击“全部打印”按钮，完整打印生产PDF文件会通过站内信通知后下载')}
            />
          )}
          {tplInfo && tplInfo.url ? (
            <PDFViewer key={tplInfo.url} url={tplInfo.url} style={{ marginTop: '16px', flex: 1, overflow: 'hidden' }} />
          ) : (
            <div style={{ height: '300px', lineHeight: '200px', textAlign: 'center' }}>
              {
               (tplInfo && tplInfo.disabledPrivew) || outType !== 'PDF'
                 ? intl.get('hzero.common.print.noPreviewScene').d('该场景不支持的预览')
                  : intl.get('hzero.common.print.selectTplLoading').d('模板加载中')
              }
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
});

function handleResp(resp, { outType, flag, tenantId }): Promise<{ url?: string, blob?: Blob | null, print?: boolean, preview?: boolean, error?: boolean, disabledPrivew?: boolean, asyncFlag?: boolean }> {
  const returnObj: any = {};
  if (isString(resp)) {
    if (resp.indexOf('failed') !== -1) {
      returnObj.error = true;
      try {
        const result = JSON.parse(resp);
        getResponse(result);
      } catch (e) {
        notification.error({});
      }
      return Promise.resolve(returnObj);
    }
    if (resp.indexOf('overviewFile') !== -1) {
      try {
        const { fileUrl, overviewFile } = JSON.parse(resp);
        return handleFileUrlResp(fileUrl, { asyncFlag: overviewFile });
      } catch (e) {
        notification.error({});
      }
    }
    if (outType === 'EXCEL') {
      return Promise.resolve({ url: resp, print: true, preview: false });
    }
    if (flag && outType !== 'EXCEL') {
      // eslint-disable-next-line no-new
      return handleFileUrlResp(resp);
    }
  } else if (!flag && resp && getResponse(resp)) {
    const { bucketName, fileToken, fileUrl } = resp;
    return getPdfPreviewUrl({ fileUrl, bucketName, fileToken, tenantId }).then(url => {
      return { url, print: false, preview: true };
    }, () => ({ error: true }));
  }
  return Promise.resolve(returnObj);
}

function handleFileUrlResp(resp, options?: any) {
  const { asyncFlag } = options || {};
  return new Promise<{ blob: Blob | null, url?: string, print?: boolean, preview?: boolean, error?: boolean, disabledPrivew?: boolean, asyncFlag?: boolean }>((res) => {
    const fileUrl = resp && resp.split('?')[0];
    const temp = fileUrl ? fileUrl.split('/') : [];
    const filename = temp ? temp[temp.length - 1] : '';
    const fileType = (/\.[^./\\]*$/.exec(filename) || [''])[0];
    if (!fileType || fileType.toLowerCase() !== '.pdf') {
      const link = document.createElement('a');
      link.href = resp;
      link.click();
      res({ blob: null, print: false, preview: false, disabledPrivew: true, asyncFlag });
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('get', resp, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status === 200) {
          const type = 'application/pdf';
          const blob = new Blob([xhr.response], { type });
          res({ blob, url: resp, print: true, preview: true, asyncFlag });
        }
      };
      xhr.onabort = () => res({ blob: null, print: false, preview: false, error: true });
      xhr.onerror = () => res({ blob: null, print: false, preview: false, error: true });
      xhr.send();
    }
  });
}