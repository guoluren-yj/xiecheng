import React, { useMemo } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

export default function Attachment({ dataSet }: { dataSet: DataSet }) {
  // 供货能力
  const columns: ColumnProps[] = useMemo(
    () => [
      {
        name: 'attachmentTypeMeaning',
        renderer: ({ record }) => {
          if (!record) {
            return '-';
          }
          const { attachmentTypeMeaning, subAttachmentMeaning } = record.get(['attachmentTypeMeaning', 'subAttachmentMeaning']);
          if (attachmentTypeMeaning && subAttachmentMeaning) {
            return <>{attachmentTypeMeaning}\{subAttachmentMeaning}</>;
          } else {
            return attachmentTypeMeaning || subAttachmentMeaning || '-';
          }
        },
      },
      {
        name: 'description',
      },
      {
        name: 'attachmentUuid',
      },
      {
        name: 'uploadDate',
        width: 150,
      },
      {
        name: 'endDate',
        width: 150,
      },
      {
        name: 'remark',
      },
    ],
    []
  );
  return <Table dataSet={dataSet} columns={columns} rowHeight={32} />;
}
