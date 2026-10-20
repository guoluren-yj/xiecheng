import React from 'react';
import intl from 'utils/intl';
import { Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { exportRender } from '../../globalFunction';
// 列表导出状态
const RenderExportComp = ({ value, record, summarization, isByOrder, remote }) => {
  // 按单 isByOrder
  const bool = isByOrder ? record.get('exportStatus') : record.get('lineExportStatus');
  const meaning = isByOrder
    ? record.get('exportStatusMeaning')
    : record.get('lineExportStatusMeaning');
  switch (bool) {
    case 'IMPORTING':
      return (
        <Tag color="yellow" style={{ border: 'none' }}>
          <span onClick={() => exportRender(value, record, summarization, undefined, remote)}>
            {intl.get('slod.deliveryWorkbench.model.common.tongbuzhong').d('同步中')}
            <Icon
              style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }}
              type="wysiwyg"
            />
          </span>
        </Tag>
      );
    case 'NONE':
      return (
        <Tag color="gray" style={{ border: 'none' }}>
          <span>{intl.get('slod.deliveryWorkbench.model.common.notongbu').d('无需同步')}</span>
        </Tag>
      );
    case 'SUCCESS':
      return (
        <Tag color="green" style={{ border: 'none' }}>
          <span onClick={() => exportRender(value, record, summarization, undefined, remote)}>
            {meaning}
            <Icon
              style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }}
              type="wysiwyg"
            />
          </span>
        </Tag>
      );
    case 'FAIL':
      return (
        <Tag color="red" style={{ border: 'none' }}>
          <span onClick={() => exportRender(value, record, summarization, undefined, remote)}>
            {meaning}
            <Icon
              style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }}
              type="wysiwyg"
            />
          </span>
        </Tag>
      );
    default:
      return (
        <Tag color="gray" style={{ border: 'none' }}>
          <span>{intl.get('slod.deliveryWorkbench.model.common.notongbu').d('无需同步')}</span>
        </Tag>
      );
  }
};

export default RenderExportComp;
