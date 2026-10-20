import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';

import ExportBtn from '@/routes/spc/components/OperationRecord/ExportBtn';

import QuotationOperation from './QuotationOperation';

// 渲染状态列
const StatusRender = (status, statusMeaning) => {
  let color = 'green';
  let meaning = '';
  switch (status) {
    case 'HANDLING':
    case 'PENDING':
      color = 'yellow';
      break;
    case 'ERROR':
    case 'DISABLE':
    case 0:
      color = 'red';
      meaning = intl.get('hzero.common.status.disable').d('禁用');
      break;
    case 1:
      meaning = intl.get('hzero.common.status.enable').d('启用');
      break;
    default:
      break;
  }
  return (
    (statusMeaning || meaning) && (
      <Tag color={color} style={{ border: 'none' }}>
        {statusMeaning || meaning}
      </Tag>
    )
  );
};

// 格式化数状结构数据
const formatTreeData = (data, primaryKey, statusKey) => {
  let returnData = '';
  try {
    const jsonData = JSON.parse(data);
    const content = jsonData?.content || [];
    const data2 = content.map((item) => {
      return {
        ...item,
        expand: true,
      };
    });
    const newContent = data2;
    content.forEach((item) => {
      const { childrenDTO } = item;
      if (childrenDTO) {
        const obj = {
          ...childrenDTO[0],
          parentId: item[primaryKey],
          parentStatus: item[statusKey],
          expand: true,
        };
        newContent.push(obj);
      }
    });
    jsonData.content = newContent;
    returnData = jsonData;
  } catch (error) {
    returnData = data;
  }
  return returnData;
};

/**
 * 操作记录
 */
const showOperation = (record) => {
  if (!record) return;
  const docId = record.get('expandId');
  const docType = 'EXPAND';
  const queryParams = {
    docType,
    docId,
  };
  let filterBarRef = null;
  Modal.open({
    drawer: true,
    key: Modal.key(),
    title: intl.get('ssrc.priceLibDimension.view.message.operateHistory').d('操作记录'),
    style: {
      width: 742,
    },
    children: (
      <QuotationOperation
        queryParams={queryParams}
        showFlag
        documentId={docId}
        documentType={docType}
        onRef={(ref) => {
          filterBarRef = ref;
        }}
      />
    ),
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    footer: (okBtn) => (
      <div>
        {okBtn}
        <ExportBtn documentId={docId} documentType={docType} getRef={() => filterBarRef} />
      </div>
    ),
  });
};
export { StatusRender, formatTreeData, showOperation };
