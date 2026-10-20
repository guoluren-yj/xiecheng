/**
 * Attachment - 附件
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';

const Attachment = ({ dataSet, customizeTable, custLoading, code }) => {
  const columns = [
    {
      name: 'description',
      width: 200,
      tooltip: 'overflow',
      renderer: ({ value, record }) => {
        const { description, attachmentUrl } = record.get(['description', 'attachmentUrl']);
        return isReview(description) && attachmentUrl ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => reviewFile(description, attachmentUrl)}
          >
            {value}
          </a>
        ) : (
          value
        );
      },
    },
    {
      name: 'fileSize',
      width: 130,
      renderer: ({ value, record }) => {
        const data = record.toData();
        const size = value ? `${value / (1024 * 1024)}` : 0;
        if (data.fileSizeFlag === 'UPDATE' || data.objectFlag === 'CREATE') {
          return <div style={{ color: 'red' }}>{size ? size.substring(0, 5) : 0}</div>;
        } else {
          return size ? size.substring(0, 5) : 0;
        }
      },
    },
    {
      name: 'uploader',
      tooltip: 'overflow',
    },
    {
      name: 'uploadDate',
      width: 160,
    },
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'operation',
      width: 80,
      renderer: ({ record }) => {
        const { tenantId, attachmentUrl } = record.get(['tenantId', 'attachmentUrl']);
        return (
          attachmentUrl && (
            <a
              href={downLoadFile({ tenantId, attachmentUrl })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.get('hzero.common.button.download').d('下载')}
            </a>
          )
        );
      },
    },
  ].map(n => ({
    renderer: ({ record }) => {
      const data = record.toData();
      return (
        <div
          style={{
            color: (data[`${n.name}Flag`] === 'UPDATE' || data.objectFlag === 'CREATE') && 'red',
          }}
        >
          {data[`${n.name}Meaning`] || data[`${n.name}`]}
        </div>
      );
    },
    ...n,
  }));

  return customizeTable(
    {
      code, // 单元编码，必传
      readOnly: true,
    },
    <Table dataSet={dataSet} columns={columns} custLoading={custLoading} />
  );
};

export default Attachment;
