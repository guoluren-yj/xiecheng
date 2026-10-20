/*
 * 主数据-附件信息
 * @Date: 2023-11-01
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useMemo, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { downLoadFile } from '@/routes/components/utils';
import { getAttachmentDs } from './stores/getAttachmentDS';

const AttachmentModal = ({ lineRecord = {}, customizeTable, customizeUnitCode }) => {
  const { abilityLineId } = lineRecord;
  const attachmentDs = useDataSet(() => getAttachmentDs(), []);

  useEffect(() => {
    attachmentDs.setQueryParameter('queryParam', {
      customizeUnitCode,
      supplyAbilityLineId: abilityLineId,
    });
    attachmentDs.query();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'attachmentDesc',
        width: 200,
      },
      {
        name: 'attachmentSize',
        width: 130,
        renderer: ({ value }) => `${value / (1024 * 1024)}`.substring(0, 5),
      },
      {
        name: 'uploadUserName',
        width: 120,
      },
      {
        name: 'uploadDate',
        width: 150,
      },
      {
        name: 'attachmentType',
        width: 150,
      },
      {
        name: 'dueDate',
        width: 160,
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'option',
        width: 80,
        lock: 'right',
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
    ],
    []
  );

  const TableDom = (
    <Table
      dataSet={attachmentDs}
      customizable
      customizedCode="supply.ability.query.line.att"
      columns={columns}
      buttons={[]}
      autoHeight={{ type: 'maxHeight', diff: 35 }}
    />
  );

  return customizeTable
    ? customizeTable(
        {
          code: customizeUnitCode,
        },
        TableDom
      )
    : TableDom;
};

export default AttachmentModal;
