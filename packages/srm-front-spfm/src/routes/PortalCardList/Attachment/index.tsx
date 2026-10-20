import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { List } from 'choerodon-ui';
import Cookies from 'universal-cookie';
import { getAccessToken, getResponse } from 'hzero-front/lib/utils/utils';
import request from 'hzero-front/lib/utils/request';
import queryString from 'query-string';

import { getOrigin } from '@/utils/utils';
import styles from './index.less';

const cookies = new Cookies();

interface IAttachmentProps {
  location: {
    search?: string;
  };
}

const Attachment: React.FC<IAttachmentProps> = ({ location: { search = '' } }) => {
  const [accessToken] = useState(getAccessToken());
  const [language] = useState(cookies.get('language') || 'zh_CN');
  const [tenantId] = useState(cookies.get('tenantId') || 0);
  const [listData, setListData] = useState<any[]>([]);
  const cardCode = useMemo(() => {
    return (queryString.parse(search) || {}).cardCode;
  }, []);
  const fetchData = useCallback(() => {
    request(
      accessToken
        ? `${getOrigin()}/spfm/v1/${tenantId}/portal-attachments-login?classCode=${cardCode}`
        : `${getOrigin()}/spfm/v1/public-portal-attachments?classCode=${cardCode}`,
      {
        headers: {
          'portal-card-host': window.location.host,
        },
      }
    ).then((resp) => {
      if (getResponse(resp) && resp && resp.content) {
        const { fileList } = resp.content[0] || {};
        if (fileList && fileList.length > 0) {
          setListData(fileList);
        }
      }
    });
  }, []);

  const oauthIntl = useMemo(() => {
    const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);
    if (srmOauth) {
      return JSON.parse(srmOauth);
    }
    return {};
  }, [language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderListItem = useCallback((item) => {
    return (
      <List.Item>
        <a onClick={() => downloadFile(item)}>{item.fileName}</a>
      </List.Item>
    );
  }, []);

  const downloadFile = useCallback(({ fileUrl, bucketName, fileName }) => {
    request(
      `${getOrigin()}/spfm/v1/portal-attachment/download?bucketName=${bucketName}&url=${encodeURIComponent(
        fileUrl
      )}`,
      {
        responseType: 'blob',
        headers: {
          'portal-card-host': window.location.host,
        },
      }
    ).then((res) => {
      const blob = new Blob([res]);
      if (typeof (window.navigator as any).msSaveBlob !== 'undefined') {
        // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
        (window.navigator as any).msSaveBlob(blob, decodeURI(fileName));
      } else {
        const URL = window.URL || window.webkitURL;
        const blobURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = fileName;
        a.click();
      }
    });
  }, []);

  return (
    <div className={styles['attachment-container']}>
      {listData.length === 0 ? (
        <div className="attachment-wrapper attachment-empty">
          <img
            src={`${getOrigin()}/oauth/static/default/img/no_notice_new.svg`}
            alt="no_notice_new"
          />
          <div className="source-empty-text">
            {oauthIntl['srm.oauth.portalInfo.noData'] || '暂无数据'}
          </div>
        </div>
      ) : (
        <List dataSource={listData} renderItem={renderListItem} />
      )}
    </div>
  );
};

export default memo(Attachment);
