/**
 * Attachment - 附件
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import { renderStatus } from '../utils';

const CompareAttachment = ({ dataSet, customizeTable, custLoading, code, onlyShowChange }) => {
  const columns = [
    {
      name: 'objectFlag',
      renderer: ({ value }) => renderStatus(value),
    },
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
            style={{ color: record.get('objectFlag') === 'CREATE' && 'red' }}
            onClick={() => reviewFile(description, attachmentUrl)}
          >
            {value}
          </a>
        ) : (
          <div
            style={{
              color: record.get('objectFlag') === 'CREATE' && 'red',
              textDecoration: record.get('objectFlag') === 'DELETE' && 'line-through',
            }}
          >
            {value}
          </div>
        );
      },
    },
    {
      name: 'fileSize',
      width: 130,
      renderer: ({ value, record }) => {
        const data = record.toData();
        const size = value ? `${value / (1024 * 1024)}` : 0;
        const sizeOld = record.get('fileSizeOld')
          ? `${record.get('fileSizeOld') / (1024 * 1024)}`
          : 0;
        if (data.fileSizeFlag === 'UPDATE' && data.objectFlag !== 'CREATE') {
          return (
            <div style={{ color: 'red' }}>
              <Tooltip
                title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}: ${
                  sizeOld ? sizeOld.substring(0, 5) : 0
                }`}
              >
                {size ? size.substring(0, 5) : 0}
              </Tooltip>
            </div>
          );
        } else {
          return size ? size.substring(0, 5) : 0;
        }
      },
    },
    {
      name: 'uploader',
    },
    {
      name: 'uploadDate',
      width: 160,
    },
    {
      name: 'remark',
      width: 200,
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
            color: data[`${n.name}Flag`] === 'UPDATE' && data.objectFlag !== 'CREATE' && 'red',
          }}
        >
          {data[`${n.name}Flag`] === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
            <Tooltip
              title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${data[
                `${n.name}MeaningOld`
              ] ||
                data[`${n.name}Old`] ||
                '-'}`}
            >
              {data[`${n.name}Meaning`] || data[`${n.name}` || '-']}
            </Tooltip>
          ) : (
            data[`${n.name}Meaning`] || data[`${n.name}`] || '-'
          )}
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
    <Table
      dataSet={dataSet}
      columns={columns}
      pagination={!onlyShowChange}
      custLoading={custLoading}
      onRow={({ record }) => ({
        style: {
          color:
            record.get('objectFlag') === 'CREATE' ||
            (record.get('objectFlag') === 'DELETE' && 'red'),
          textDecoration: record.get('objectFlag') === 'DELETE' && 'line-through',
          textDecorationThickness: '2px',
        },
      })}
    />
  );
};

export default CompareAttachment;
