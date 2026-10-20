import React, { useContext, useMemo } from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { previewFile } from '../../../../utils/utils';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { AiRecognizeStatus, getAiRecognizeSearchCode } from '../utils/type';
import { statusTagRender } from '../../StatusTag';

interface RecordTableProps {
  activeKey: AiRecognizeStatus;
}

const RecordTable = (props: RecordTableProps) => {
  const { activeKey } = props;
  const { dsMap, handleToDetail, handleToSettleDetail, isSupplier } = useContext<StoreValueType>(Store);
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const searchCodeMap = useMemo(() => getAiRecognizeSearchCode(isSupplier), [isSupplier]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'aiAttachmentUrl',
        width: 240,
        renderer: ({ value, record }) => {
          const aiAttachmentName = record?.get('aiAttachmentName');
          return value && aiAttachmentName ? (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => previewFile(value)}>
              {aiAttachmentName}
            </Button>
          ) : aiAttachmentName;
        },
      },
      activeKey === AiRecognizeStatus.Success && {
        name: 'action',
        width: 120,
        align: ColumnAlign.left,
        command: ({ record }) => [
          record?.get('syncStatus') === 'fail' && (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleToDetail(record, 'edit')}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
          ),
          <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleToDetail(record, 'view')}>
            {intl.get('hzero.common.button.view').d('查看')}
          </Button>,
        ],
      } as any,
      { name: 'batchNum', width: 180 },
      { name: 'sourceDoc', width: 130 },
      ...(activeKey === AiRecognizeStatus.Success ? [
        { name: 'invoiceNum', width: 180 },
        { name: 'invoicingDate', width: 180 },
        { name: 'syncStatus', width: 180, renderer: statusTagRender },
        { name: 'syncMessage', width: 250 },
      ] : []),
      {
        name: 'settleNum',
        width: 180,
        renderer: ({ value, record }) => {
          return value ? (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleToSettleDetail(record)}>
              {value}
            </Button>
          ) : null;
        },
      },
      activeKey === AiRecognizeStatus.Fail && {
        name: 'returnMessage',
        width: 250,
      } as any,
      { name: 'creationDate', width: 180 },
    ];
  }, [activeKey, handleToDetail, handleToSettleDetail]);

  return (
    <SearchBarTable
      cacheState
      dataSet={tableDs}
      columns={columns}
      searchCode={searchCodeMap[activeKey]}
      style={{ maxHeight: 'calc(100vh - 210px)' }}
      searchBarConfig={{
        expandable: false,
        closeFilterSelector: true,
      }}
    />
  );
};

export default RecordTable;