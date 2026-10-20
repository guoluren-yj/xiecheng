/*
 * @Description: 使用modal方式打开
 * @Date: 2022-04-14 16:28:01
 * @Author: yitian.mao@going-link.com
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PUBLIC_BUCKET } from '_utils/config';
import { downloadFileByAxios } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import Container from './Container';
import { exportOperationRecord } from './service';

const tenantId = getCurrentOrganizationId();

// 需展示查询条件和导出的单据
const documentTypeList = [
  'PURCHASE_CONTRACT', // 协议工作台
];

// 导出操作记录
const handleExport = (documentId, documentType, filterBarRef) => {
  const filterBarValues = filterBarRef?.getQueryParameter() || {};
  const { operateTime, ...rest } = filterBarValues;
  const newOperateTime = operateTime?.split(',') || [];
  return exportOperationRecord({
    ...rest,
    documentId,
    documentType,
    operateTimeFrom: newOperateTime[0],
    operateTimeTo: newOperateTime[1],
  }).then((response) => {
    const res = getResponse(response);
    if (res) {
      const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
      const queryParams = [
        { name: 'url', value: res },
        { name: 'bucketName', value: `${PUBLIC_BUCKET}` },
      ];
      downloadFileByAxios({ requestUrl: api, queryParams });
    }
  });
};

const useModal = () => {
  const openModal = (props, modalProps) => {
    const { documentType, documentId } = props;
    // 需要展示查询条件和导出的标识
    const showFlag = documentTypeList.includes(documentType);
    let filterBarRef = null;
    const modal = Modal.open({
      key: Modal.key(),
      drawer: true,
      okCancel: false,
      style: { width: '742px' },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get(`hzero.common.view.button.operationRecord`).d('操作记录'),
      children: (
        <Container
          {...props}
          showFlag={showFlag}
          onRef={(ref) => {
            filterBarRef = ref;
          }}
        />
      ),
      footer: (okBtn) => (
        <div>
          {okBtn}
          <Button
            hidden={!showFlag}
            onClick={() => handleExport(documentId, documentType, filterBarRef)}
          >
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
        </div>
      ),
      ...modalProps,
    });
    return modal;
  };
  return {
    openModal,
  };
};

export default useModal;
