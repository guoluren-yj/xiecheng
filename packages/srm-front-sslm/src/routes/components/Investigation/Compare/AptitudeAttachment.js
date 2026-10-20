/*
 * AptitudeAttachment - 资质附件
 * @Date: 2022-06-17 18:34:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';

const AptitudeAttachment = ({ record: proserviceRecord, dataSet }) => {
  useEffect(() => {
    // const { attachment = [] } = proserviceRecord.toData();
    dataSet.query();
  }, [proserviceRecord]);

  const columns = [
    {
      name: 'attachmentDesc',
      width: 150,
      renderer: ({ value, record }) => {
        const { attachmentDesc, attachmentUrl } = record.get(['attachmentDesc', 'attachmentUrl']);
        return isReview(attachmentDesc) && attachmentUrl ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => reviewFile(attachmentDesc, attachmentUrl)}
          >
            {value}
          </a>
        ) : (
          value
        );
      },
    },
    {
      name: 'attachmentSize',
      width: 100,
      renderer: ({ value }) => {
        if (value) {
          const size = `${value / (1024 * 1024)}`;
          return size.substring(0, 5);
        } else {
          return 0;
        }
      },
    },
    {
      name: 'uploadUserName',
      width: 100,
    },
    {
      name: 'uploadDate',
      width: 150,
    },
    {
      name: 'attachmentType',
      width: 120,
    },
    {
      name: 'dueDate',
      width: 120,
    },
    {
      name: 'remark',
      width: 150,
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
  ];
  return <Table dataSet={dataSet} columns={columns} />;
};

export default AptitudeAttachment;
