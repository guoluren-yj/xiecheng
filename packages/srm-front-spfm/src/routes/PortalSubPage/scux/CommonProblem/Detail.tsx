/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Divider } from 'hzero-ui';
import { Spin } from 'choerodon-ui/pro';
import { Nav, Footer } from 'srm-front-boot/lib/components/PortalCard';
import request from 'hzero-front/lib/utils/request';
import notification from 'utils/notification';
import { isNil } from 'lodash';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import Cookies from 'universal-cookie';
import { getResponse, setSession } from 'hzero-front/lib/utils/utils';
import styles from './index.less';

const cookie = new Cookies();
export default function ResourceCenter({ match }) {
  const { id } = match ? match.params : { id: '' };
  const langInfoRef = useMemo(() => ({ current: {}, valueListMeaningMap: {} }), []);
  const [init, setInit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState({
    title: '',
    contentText: '',
    publishDate: '',
    fileList: [],
  });
  const langInfo = langInfoRef.current || {};

  useEffect(() => {
    Promise.all([
      queryIntl().then(() => {
        setInit(true);
        return searchCallback();
      }),
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  const queryIntl = useCallback(() => {
    const { HZERO_PLATFORM } = getEnvConfig() as any;
    const lang = cookie.get('language') || 'zh_CN';
    return request(`${HZERO_PLATFORM}/v1/prompt/${lang}`, {
      method: 'GET',
      query: {
        promptKey: 'spfm.commonProblem,hzero.common,srm.common,srm.oauth',
      },
    }).then((res) => {
      if (getResponse(res)) {
        langInfoRef.current = res;
        setSession(`${lang}-srm.portal`, res);
      }
    });
  }, []);

  const searchCallback = useCallback(() => {
    processLoading(true);
    return queryDetail({ id })
      .then((res) => {
        if (res) {
          setDetail({ ...detail, ...res });
        }
      })
      .finally(() => {
        processLoading(false);
      });
  }, [detail]);

  const processLoading = useCallback((status) => {
    setLoading(status);
  }, []);

  return (
    <Spin spinning={!init}>
      <div className={styles['resource-center']}>
        {init && <Nav auto />}
        <section className="content">
          <Spin spinning={init && loading}>
            <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 600 }}>
              {detail.title}
            </div>
            <div style={{ textAlign: 'center', fontSize: '18px' }}>
              {langInfo['spfm.commonProblem.publish.date'] || '发布日期'}:&nbsp;&nbsp;
              {detail.publishDate}
            </div>
            <div dangerouslySetInnerHTML={{ __html: detail.contentText }} className="content-richText" />
            <div className={styles['file-list']}>
              <div className="file-list-title">
                {langInfoRef.current['hzero.common.upload.modal.attachment'] || '附件'}
              </div>
              <Divider style={{ margin: '10px 0 20px 0' }} />
              {detail.fileList.map((item: { fileName: string; fileUrl: string }) => (
                <div className="file-list-item">
                  <div className="file-list-item-name">
                    {langInfoRef.current['hzero.common.upload.modal.attachment'] || '附件'}
                    :&nbsp;&nbsp;{item.fileName}
                  </div>
                  <div className="file-list-item-action" onClick={() => downloadFile(item.fileUrl)}>
                    {langInfoRef.current['srm.oauth.platformNoticeDetail.downloadAttachment'] ||
                      '附件下载'}
                  </div>
                </div>
              ))}
            </div>
          </Spin>
        </section>
        {init && <Footer auto />}
      </div>
    </Spin>
  );
}

function queryDetail(query): Promise<any> {
  const orgid = cookie.get('tenantId') || cookie.get('hostTenantId');
  const noticeUrl = `/marmot/v1/${orgid}/marmot-api-public/ulicjpM27rNibQicOsOmlN8pqcFGKQnJQgptBJUr25efsU`;
  return request(noticeUrl, { method: 'GET', query }).then(res => {
    if (getResponse(res)) {
      return res;
    }
  });
}

function downloadFile(fileUrl) {
  let downloadUrl;
  const url = encodeURIComponent(fileUrl);
  const { API_HOST } = getEnvConfig() as any;
  const tenantId = cookie.get('tenantId') || cookie.get('hostTenantId');
  const accessToken = cookie.get('access_token');
  if (!isNil(tenantId) && !isNil(accessToken)) {
    downloadUrl = `${API_HOST}/hfle/v1/${tenantId}/files/signedUrl?bucketName=private-bucket&url=${url}`;
    request(downloadUrl, { method: 'GET', responseType: 'text' }).then((res) => {
      if (res) {
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = res;
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    });
  } else {
    notification.warning({
      message: '请先登录',
    });
  }
}
