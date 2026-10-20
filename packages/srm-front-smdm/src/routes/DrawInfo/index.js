/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-11-02 21:04:17
 * @LastEditors: yanglin
 * @LastEditTime: 2023-08-08 20:46:03
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
import { List } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryDrawInfo, rederctUrl } from '@/services/drawInfoService';
import { getResponse } from 'utils/utils';

import styles from './index.less';

const Index = (props) => {
  const { modal, href } = props;

  const params = querystring.parse((href || '').replace('/smdm/draw-info', '').substr(1)) || {};
  const { preview } = params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 根据文件后缀名来映射Blob Type
  const typeDic = {
    docx: 'application/msword',
    doc: 'application/msword',
    bin: 'application/octet-stream',
    exe: 'application/octet-stream',
    so: 'application/octet-stream',
    dll: 'application/octet-stream',
    pdf: 'application/pdf',
    ai: 'application/postscript',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    dir: 'application/x-director',
    js: 'application/x-javascript',
    swf: 'application/x-shockwave-flash',
    xhtml: 'application/xhtml+xml',
    xht: 'application/xhtml+xml',
    zip: 'application/zip',
    mid: 'audio/midi',
    midi: 'audio/midi',
    mp3: 'audio/mpeg',
    rm: 'audio/x-pn-realaudio',
    rpm: 'audio/x-pn-realaudio-plugin',
    wav: 'audio/x-wav',
    bmp: 'image/bmp',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    css: 'text/css',
    html: 'text/html',
    htm: 'text/html',
    txt: 'text/plain',
    xsl: 'text/xml',
    xml: 'text/xml',
    mpeg: 'video/mpeg',
    mpg: 'video/mpeg',
    avi: 'video/x-msvideo',
    movie: 'video/x-sgi-movie',
  };

  useEffect(() => {
    if (modal) {
      modal.update({
        title: intl.get('hzero.common.model.materialApplication.drawInfo').d('图纸信息'),
      });
    }

    setLoading(true);
    queryDrawInfo({ ...params })
      .then((res) => {
        if (getResponse(res)) {
          setData(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLinkClick = (url) => {
    // const name = getCurrentUser().realName;
    if (String(preview) === '1') {
      // const newUrl = url.includes('?') ? `${url}&name=${name}` : `${url}?name=${name}`;
      // window.open(newUrl, '_blank', 'noopener');
      window.open(url, '_blank', 'noopener');
    } else {
      const urlParams = querystring.parse(url) || {};
      const { fileName } = urlParams;
      if (fileName) {
        rederctUrl({ url }).then((res) => {
          if (res) {
            const index = fileName.lastIndexOf('.');
            // 获取从0到最后一个 - 之间的字符
            const type = fileName.substring(index, fileName.length);
            const blob = new Blob([res], { type: typeDic[type] });
            const link = document.createElement('a');
            link.download = fileName;
            link.href = window.URL.createObjectURL(blob);
            link.click();
          }
        });
      } else {
        // const newUrl = url.includes('?') ? `${url}&name=${name}` : `${url}?name=${name}`;
        // window.open(newUrl, '_blank', 'noopener');
        window.open(url, '_blank', 'noopener');
      }
    }
  };

  return (
    <div>
      <List
        className={styles['draw-info-list']}
        header={
          <div style={{ color: 'red' }}>
            {intl
              .get('smdm.materialApplication.model.materialApplication.drawInfoTip')
              .d('若未顺利下载，请切换浏览器或复制链接直接访问')}
          </div>
        }
        footer={null}
        bordered
        loading={loading}
        dataSource={data}
        renderItem={(item) => (
          <List.Item style={{ wordBreak: 'break-all' }}>
            <a
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.drawingLink);
              }}
            >
              {item.drawingLink}
            </a>
          </List.Item>
        )}
      />
    </div>
  );
};

export default formatterCollections({
  code: ['smdm.common'],
})(Index);
