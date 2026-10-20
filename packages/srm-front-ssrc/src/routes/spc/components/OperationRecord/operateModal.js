/*
 * @Date: 2025-05-16 15:59:54
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import Container from './index';
import ExportBtn from './ExportBtn';

// 需展示查询条件和导出的单据
const documentTypeList = [
  'SERVICE', // 价格服务定义
];

export const operateModal = (props) => {
  const { docId, docType } = props;
  let filterBarRef = null;
  const showFlag = documentTypeList.includes(docType);
  Modal.open({
    key: Modal.key(),
    title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
    children: (
      <Container
        {...props}
        showFlag={showFlag}
        operateParams={{
          docId,
          docType,
        }}
        onRef={(ref) => {
          filterBarRef = ref;
        }}
      />
    ),
    style: { width: '742px' },
    drawer: true,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    footer: (okButton) => {
      return (
        <>
          {okButton}
          <ExportBtn
            documentId={docId}
            documentType={docType}
            getRef={() => filterBarRef}
            btnProps={{ hidden: !showFlag }}
          />
        </>
      );
    },
  });
};
