/* eslint-disable func-names */
/* eslint-disable no-undef */
/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-08-20 10:37:18
 * @LastEditTime: 2024-10-10 12:29:05
 * @Description:utils
 * @copyright: Copyright (c) 2020, Hand
 */
import qs from 'query-string';
import { Spin } from 'choerodon-ui/pro';
// import { Result } from 'choerodon-ui';

import intl from 'utils/intl';
import { getEnvConfig } from 'utils/iocUtils';
import { Header, Content } from 'components/Page';
import React, { memo, useState, useEffect } from 'react';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import {
  getAccessToken,
  // getCurrentTenant,
  getCurrentOrganizationId,
  getRequestId,
  // getResponse,
  isTenantRoleLevel,
  getSRMAccessCode,
} from 'utils/utils';

import { queryMemberShip } from '@/services/findBusinessService';

import { ReactComponent as EmptySvg } from '@/assets/find-business-empty.svg';
// import emptyIcon from '@/assets/find-business-empty.svg';
import styles from './index.less';

export function memberShipQuery() {
  return function (Comp) {
    return memo(function (props) {
      const [isMember, setMember] = useState();
      useEffect(() => {
        queryMemberShip({})
          .then((res) => {
            if (res && res.isVip) {
              setMember(true);
            } else {
              setMember(false);
            }
          })
          .catch(() => {
            setMember(false);
          });
      }, []);
      if (isMember === true) {
        return <Comp {...props} />;
      }
      if (isMember === false) {
        return (
          <>
            <Header title={intl.get('ssrc.findBusiness.view.message.title.menu').d('发现商机')} />
            <Content>
              <div className={styles.empty}>
                <div className={styles['empty-svg']}><EmptySvg /></div>
                <span className='empty-desc'>
                  {intl
                    .get('ssrc.findBusiness.model.common.non-member')
                    .d('此功能为付费会员供应商使用功能，您的企业暂未开通')}
                </span>
              </div>
            </Content>
          </>
        );
      }
      return <Spin />;
    });
  };
}

// 截取文件类型
export function getFileExtension(url) {
  const regExp = /.*\.(.*)$/;
  const match = url.match(regExp);
  return match && match.length > 1 ? match[1] : '';
}

const newUrlPreviewList = [
  'dot',
  'dotx',
  'dotm',
  'odt',
  'fodt',
  'ott',
  'rtf',
  'txt',
  'html',
  'htm',
  'mht',
  'djvu',
  'fb2',
  'epub',
  'xps',
  'xls',
  'xlsx',
  'xlsm',
  'xlt',
  'xltx',
  'xltm',
  'ods',
  'fods',
  'ots',
  'csv',
  'pps',
  'ppsx',
  'ppsm',
  'ppt',
  'pptx',
  'pptm',
  'pot',
  'potx',
  'potm',
  'odp',
  'fodp',
  'otp',
];
const imgs = ['png', 'gif', 'jpg', 'webp', 'jpeg', 'bmp', 'svg'];

// 支持预览的文件类型
const supportPreviewList = [
  'doc',
  'docx',
  'docm',
  'dot',
  'dotx',
  'dotm',
  'odt',
  'fodt',
  'ott',
  'rtf',
  'txt',
  'html',
  'htm',
  'mht',
  'pdf',
  'djvu',
  'fb2',
  'epub',
  'xps',
  'xls',
  'xlsx',
  'xlsm',
  'xlt',
  'xltx',
  'xltm',
  'ods',
  'fods',
  'ots',
  'csv',
  'pps',
  'ppsx',
  'ppsm',
  'ppt',
  'pptx',
  'pptm',
  'pot',
  'potx',
  'potm',
  'odp',
  'fodp',
  'otp',
];

/**
 * 通过文件服务器的接口获取可访问的文件URL(带fileToken)
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 * @param {String} storageCode 存储配置编码
 */
// @ts-ignore
export function getAttachmentUrlWithToken(
  url,
  bucketName,
  tenantId,
  bucketDirectory,
  storageCode,
  _fileToken,
  enableImageWatermark,
  isAttachmentsInControl = true
) {
  const accessToken = getAccessToken();
  const requestId = getRequestId();
  const params = qs.stringify(
    filterNullValueObject({
      bucketName,
      storageCode,
      _fileToken: isAttachmentsInControl ? _fileToken : undefined,
      _downloadToken: isAttachmentsInControl ? undefined : _fileToken,
      access_token: accessToken,
      'H-Request-Id': requestId,
      directory: bucketDirectory,
      enableImageWatermark,
    })
  );
  const { HZERO_FILE } = getEnvConfig();
  const version = isAttachmentsInControl ? '/v1' : '/v2';
  const middleUrl = isAttachmentsInControl ? '/files/download-with-token' : '/files/download';
  const newUrl = !isTenantRoleLevel()
    ? `${HZERO_FILE}${version}${middleUrl}?${params}&url=${encodeURIComponent(url)}`
    : `${HZERO_FILE}${version}/${getCurrentOrganizationId()}${middleUrl}?${params}&url=${encodeURIComponent(
        url
      )}`;
  return newUrl;
}

export function getPreviewUrl({
  attachment,
  bucketName,
  bucketDirectory,
  storageCode,
  isPublic,
  // c7n-ui下，默认不传该属性，视为false
  isAttachmentsInControl = false,
}) {
  const accessToken = getAccessToken();
  if (!isPublic || accessToken) {
    const { ext, type, url: _url } = attachment;
    const tenantId = getCurrentOrganizationId();
    // tiff格式图片不支持预览
    if ((type.startsWith('image') && !type.includes('image/tif')) || imgs.includes(ext)) {
      const callback = () => {
        return getSRMAccessCode({ expires: 15 }).then((_sac) => {
          const url = getAttachmentUrlWithToken(
            _url,
            bucketName,
            tenantId,
            bucketDirectory,
            storageCode,
            isAttachmentsInControl ? attachment._fileToken : attachment._downloadToken,
            undefined,
            isAttachmentsInControl
          );
          // eslint-disable-next-line no-useless-escape
          return url.replace(/access_token=[^\&]+(&)?/, `_sac=${_sac}$1`);
        });
      };
      callback.isPicture = true;
      return callback;
    }
    if (supportPreviewList.includes(ext)) {
      return () =>
        getSRMAccessCode({ expires: 15 }).then((_sac) => {
          const { HZERO_HFLE, HZERO_FILE } = getEnvConfig();
          const PREFIX = window.location.hostname === 'localhost' ? HZERO_FILE : HZERO_HFLE;
          const version = isAttachmentsInControl ? '/v1' : '/v2';
          let postfix = newUrlPreviewList.includes(ext) ? '/preview/pro' : '/preview';
          if (isAttachmentsInControl) {
            postfix = newUrlPreviewList.includes(ext)
              ? '/file/preview-with-token'
              : '/file-preview-with-token';
          }
          // 暂不考虑未登录状态预览附件的场景，因为此前版本似从未支持过，其它附件组件同理
          const prevewUrl = isTenantRoleLevel()
            ? `${PREFIX}${version}/${tenantId}${postfix}`
            : `${PREFIX}${version}${postfix}`;
          const params = qs.stringify(
            filterNullValueObject({
              url: _url,
              bucketName,
              storageCode,
              directory: bucketDirectory,
              _sac,
              _fileToken: isAttachmentsInControl ? attachment._fileToken : undefined,
              _previewToken: isAttachmentsInControl ? undefined : attachment._previewToken,
            })
          );
          return `${prevewUrl}?${params}`;
        });
    }
  }
}
