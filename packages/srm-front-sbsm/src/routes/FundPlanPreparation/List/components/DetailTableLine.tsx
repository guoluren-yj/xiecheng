import React, { useMemo, useContext } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailListLineCode } from '../../utils/type';

import { prepLineDS } from '../stores/indexDS';

interface LineProps {
    reocrdInfo: any,
}

const Line = (props: LineProps) => {
  const { reocrdInfo } = props;
  const {
    customizeTable,
  } = useContext<StoreValueType>(Store);
  const { prepViewType, poolHeaderId, poolStageId, prepHeaderId } = reocrdInfo?.get(['prepViewType', 'poolHeaderId', 'poolStageId', 'prepHeaderId']) || {};
  const tableDs = useMemo(() => new DataSet(prepLineDS({prepViewType, poolHeaderId, poolStageId, prepHeaderId})), [prepViewType, poolHeaderId, poolStageId, prepHeaderId]);

  const columns: any = useMemo(() => {
    return [
      prepViewType === 'STAGE' && {
        name: 'prepSource',
        width: 80,
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
        name: 'prepSourceAmount',
        width: 120,
      },
      ...(
        prepViewType === 'SOURCE_DOCUMENT' ? [
          {
            name: 'termSourceDocumentNum',
            width: 160,
            renderer: ({ value, record }) => {
              const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
              if (displaySourceDocNum) return `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}`;
              const termSourceDocumentLineNum = record?.get('termSourceDocumentLineNum');
              if (!termSourceDocumentLineNum) return value;
              return `${value}-${termSourceDocumentLineNum}`;
            },
          },
          {
            name: 'stageNum',
            width: 140,
          },
          {
            name: 'stageDesc',
            width: 140,
          },
        ] : []
      ),
      {
        name: 'prepPayAmount',
        width: 160,
      },
      {
        name: 'prepApplyAmount',
        width: 130,
      },
      {
        name: 'prepPaymentDate',
        width: 120,
      },
      {
        name: 'remark',
        width: 120,
      },
      {
        name: 'prefabPayAmount',
        width: 140,
      },
      {
        name: 'displayPrepOccupyPayAmount',
        width: 140,
      },
      {
        name: 'displayPrepEnablePayAmount',
        width: 140,
      },
      {
        name: 'prefabApplyAmount',
        width: 140,
      },
      {
        name: 'displayPrepOccupyApplyAmount',
        width: 140,
      },
      {
        name: 'displayPrepEnableApplyAmount',
        width: 140,
      },
      {
        name: 'prefabPaymentDate',
        width: 140,
      },
    ];
  }, [prepViewType]);


  return (
    <div>
      {customizeTable(
        { code: DetailListLineCode },
        <Table
          customizable
          dataSet={tableDs}
          columns={columns}
        />
      )}
    </div>
  );
};


export default observer(Line);
