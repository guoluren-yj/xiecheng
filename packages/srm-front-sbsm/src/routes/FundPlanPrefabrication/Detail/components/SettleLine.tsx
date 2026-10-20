import React, { useMemo, useContext } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

// import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { settleListDetailDS } from '../stores/indexDS';
import { prePaymentLineDetailCode, paymentLineDetailCode } from '../../utils/type';

const PrepInfo = (props) => {
  const { settleHeaderId, documentType } = props;
  const { customizeTable, headerDs } = useContext<StoreValueType>(Store);

  const { stageNum } = headerDs.current?.get(['stageNum']) || {};

  const settleListDetailDs = useMemo(() => new DataSet(settleListDetailDS(settleHeaderId, stageNum)), [settleHeaderId, stageNum]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'settleHeaderNum',
        width: 180,
        renderer: ({ value, record }) => {
          const lineNum = record?.get('lineNum');
          if (!value) return '-';
          if (!lineNum) return value;
          return `${value}-${lineNum}`;
        },
      },
      {
        name: 'prepSource',
        width: 160,
      },
      {
        name: 'documentNum',
        width: 160,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
        },
      },
      {
        name: 'stageDocumentAndLineNum',
        width: 160,
      },
      {
        name: 'stageNum',
        width: 120,
      },
      {
        name: 'stageDesc',
        width: 200,
      },
      {
        name: 'paymentAmount',
        width: 160,
      },
      {
        name: 'applyAmount',
        width: 160,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 140,
      },
    ];
  }, []);

  return (
    <div>
      {
        customizeTable({
          code: documentType === 'PAYMENT' ? paymentLineDetailCode : prePaymentLineDetailCode,
          readOnly: true,
        }, (
          <Table
            dataSet={settleListDetailDs}
            columns={columns}
            style={{ maxHeight: 'calc(100vh - 210px)' }}
          />
        ))
      }
    </div>
  );
};


export default PrepInfo;
