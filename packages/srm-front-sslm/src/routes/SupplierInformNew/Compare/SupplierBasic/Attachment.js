/*
 * Attachment - 附件信息
 * @Date: 2023-04-11 11:16:57
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { renderStatus, handleExtTextRenderIntercept } from '@/routes/components/utils';
import {
  getToolTipPrefix,
  getInsertTip,
} from '@/routes/SupplierInformNew/Compare/SupplierBasic/utils';

const Attachment = ({
  dataSet,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleCompareRender,
  customizeUnitCode,
  showUpdateFlag,
}) => {
  const columns = [
    showUpdateFlag && {
      type: 'select',
      name: 'objectFlag',
      renderer: renderStatus,
    },
    {
      name: 'attachmentFileType',
      width: 180,
      renderer: ({ record }) => {
        if (record) {
          const {
            attachmentMeaning,
            attachmentMeaningFlag,
            attachmentMeaningOld,
            objectFlag,
          } = record.get([
            'attachmentMeaning',
            'attachmentMeaningFlag',
            'attachmentMeaningOld',
            'objectFlag',
          ]);
          const showTips = attachmentMeaningFlag === 'UPDATE' || objectFlag === 'CREATE';
          const toolTips =
            objectFlag === 'CREATE'
              ? `${getInsertTip()}`
              : `${getToolTipPrefix()}${attachmentMeaningOld}`;
          const toolTipText = showUpdateFlag && showTips ? toolTips : '';
          return (
            <Tooltip placement="top" title={toolTipText}>
              <span style={{ color: showTips && 'red' }}>{attachmentMeaning || '-'}</span>
            </Tooltip>
          );
        }
      },
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'endDate',
      width: 100,
      type: 'date',
    },
    {
      name: 'longEffectiveFlag',
      width: 100,
      type: 'boolean',
    },
    {
      name: 'uploadDate',
      width: 100,
      type: 'date',
    },
    {
      name: 'attachmentUuid',
      width: 120,
      ignore: true, // 不覆盖renderer函数
      editor: (record, name) => handleCompareRender({ record, name, type: 'Upload' }),
    },
    {
      name: 'remark',
    },
  ]
    .filter(Boolean)
    .map(column => {
      const { type, displayField, ignore, ...others } = column;
      return ignore
        ? column
        : {
            renderer: ({ value, record, name }) =>
              handleCompareRender({ value, record, name, type, displayField }),
            ...others,
          };
    });

  return customizeTable(
    {
      code: customizeUnitCode,
      readOnly: true,
      extTextRenderIntercept: handleExtTextRenderIntercept,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      virtualCell={false}
      style={tableMaxHeight}
      custLoading={custLoading}
      selectionMode="none"
    />
  );
};

export default Attachment;
