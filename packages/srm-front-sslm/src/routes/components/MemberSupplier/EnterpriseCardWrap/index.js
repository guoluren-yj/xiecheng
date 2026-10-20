/*
 * EnterpriseCardWrap - 企业卡片通用组件
 * @Date: 2024-08-22 17:20:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import { isFunction, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { Tag, Upload } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';

import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  getAccessToken,
  getAttachmentUrl,
  getCurrentOrganizationId,
  getCurrentLanguage,
} from 'utils/utils';

import defaultLogo from '@/assets/memberExpansion/no-img.svg';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import styles from './index.less';
import { renderFormField, enterpriseStatusColor } from '../utils';

const bucketDirectory = 'sslm-member';
const tenantId = getCurrentOrganizationId();
const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

const EnterpriseCardWrap = observer(
  ({
    imgSrc,
    isEdit,
    dataSet,
    tagList,
    extraRender,
    formFields,
    onImgChange,
    sourceKey = '', // 需唯一
    statusList = [],
    loading = false,
    imgWidth = 52,
    imgHeight = 52,
    displayNameRender,
    labelObtainMethod = '',
  }) => {
    const newImgSrc = imgSrc ? getAttachmentUrl(imgSrc, PRIVATE_BUCKET, tenantId) : defaultLogo;

    // 标签父级id，用于计算父级容器宽度
    const parentId = useMemo(() => `calculateTag${sourceKey}`, [sourceKey]);
    // 标签className，用于计算标签宽度
    const tagClassName = useMemo(() => `sslm-calculate-${sourceKey}`, [sourceKey]);

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    const uploadData = file => {
      return {
        bucketName: PRIVATE_BUCKET,
        directory: bucketDirectory,
        fileName: file.name,
      };
    };

    return (
      <div className={styles['card-container']}>
        <div className="card-top">
          <div className="card-top-left-wrap" style={{ width: imgWidth, height: imgHeight }}>
            {isEdit ? (
              <Upload
                name="file"
                accept="image/*"
                listType="picture"
                data={uploadData}
                headers={headers}
                showUploadList={false}
                onChange={onImgChange}
                action={`${HZERO_FILE}/v1/${tenantId}/files/multipart`}
              >
                <Spin spinning={loading}>
                  <img
                    alt=""
                    width={imgWidth - 2} // 减去边框宽度
                    height={imgHeight - 2} // 减去边框宽度
                    src={newImgSrc}
                    style={{ cursor: 'pointer' }}
                  />
                </Spin>
              </Upload>
            ) : (
              <img alt="" width={imgWidth - 2} height={imgHeight - 2} src={newImgSrc} />
            )}
          </div>
          <div className="card-top-right-wrap">
            <div className="card-top-right-top">
              <div className="card-top-right-top-name">
                {isFunction(displayNameRender) && displayNameRender()}
              </div>
              <div className="card-top-right-top-tags">
                {statusList.map(status => (
                  <Tag color={enterpriseStatusColor[status.value]}>{status.meaning}</Tag>
                ))}
              </div>
              <div className="card-top-right-top-operat">
                {isFunction(extraRender) && extraRender()}
              </div>
            </div>
            {!isEmpty(tagList) && isChinese && (
              <div className="card-top-right-bottom">
                <EnterpriseTags
                  key={sourceKey}
                  tagList={tagList}
                  parentId={parentId}
                  tagClassName={tagClassName}
                  labelObtainMethod={labelObtainMethod}
                />
              </div>
            )}
          </div>
        </div>
        {formFields && (
          <div className="card-bottom">
            {formFields.map(field => renderFormField({ dataSet, ...field }))}
          </div>
        )}
      </div>
    );
  }
);

export default EnterpriseCardWrap;
