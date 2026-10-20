import React, { useMemo, useContext } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

// import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { prepListDetailDS } from '../stores/indexDS';
import { PrepLineDetailCode } from '../../utils/type';

const PrepInfo = (props) => {
  const { prepHeaderId, prepViewType } = props;
  const { customizeTable, poolHeaderId, poolStageId } = useContext<StoreValueType>(Store);

  const prepListDetailDs = useMemo(() => new DataSet(prepListDetailDS({poolHeaderId, poolStageId, prepHeaderId, prepViewType})), [poolHeaderId, poolStageId, prepHeaderId, prepViewType]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'prepNum',
        width: 160,
        renderer: ({ value, record }) => {
          const lineNum = record?.get('lineNum');
          if (!value) return '-';
          if (!lineNum) return value;
          return `${value}-${lineNum}`;
        },
      },
      {
        name: 'prepSource',
        width: 180,
      },
      {
        name: 'documentNum',
        width: 160,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '', documentLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum', 'documentLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : `${value}${documentLineNum && '-'}${documentLineNum}`;
        },
      },
      {
        name: 'termSourceDocumentNum',
        width: 160,
        renderer: ({ value, record }) => {
          const termSourceDocumentLineNum = record?.get('termSourceDocumentLineNum');
          if (!termSourceDocumentLineNum) return value;
          return `${value}-${termSourceDocumentLineNum}`;
        },
      },
      {
        name: 'stageNum',
        width: 120,
      },
      {
        name: 'stageDesc',
        width: 160,
      },
      {
        name: 'prepPayAmount',
        width: 120,
      },
      {
        name: 'prepApplyAmount',
        width: 120,
      },
      {
        name: 'prepPaymentDate',
        width: 140,
      },
    ];
  }, []);

  return (
    <div>
      {
        customizeTable({
          code: PrepLineDetailCode,
          readOnly: true,
        }, (
          <Table
            dataSet={prepListDetailDs}
            columns={columns}
            style={{ maxHeight: 'calc(100vh - 210px)' }}
          />
        ))
      }
    </div>
  );
};


export default PrepInfo;
