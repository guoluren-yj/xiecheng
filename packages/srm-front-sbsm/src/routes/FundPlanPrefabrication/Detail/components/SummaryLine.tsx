import React, { useMemo, useContext } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

// import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { summaryListDetailDS } from '../stores/indexDS';
import { summaryLineDetailCode } from '../../utils/type';

const PrepInfo = (props) => {
  const { balHeaderId, prepViewType } = props;
  const { customizeTable, poolHeaderId, poolStageId } = useContext<StoreValueType>(Store);

  const summaryListDetailDs = useMemo(() => new DataSet(summaryListDetailDS({balHeaderId, poolHeaderId, poolStageId, prepViewType})), [balHeaderId, poolHeaderId, poolStageId, prepViewType]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'balNum',
        width: 160,
      },
      {
        name: 'prepSource',
        width: 160,
      },
      {
        name: 'documentNumAndLineNum',
        width: 160,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
        },
      },
      {
        name: 'termSourceNumAndLine',
        width: 160,
      },
      {
        name: 'stageNum',
        width: 120,
      },
      {
        name: 'stageDesc',
        width: 130,
      },
      {
        name: 'balPayAmount',
        width: 120,
      },
      {
        name: 'balApplyAmount',
        width: 120,
      },
      {
        name: 'balPaymentDate',
        width: 140,
      },
    ];
  }, []);

  return (
    <div>
      {
        customizeTable({
          code: summaryLineDetailCode,
          readOnly: true,
        }, (
          <Table
            dataSet={summaryListDetailDs}
            columns={columns}
            style={{ maxHeight: 'calc(100vh - 210px)' }}
          />
        ))
      }
    </div>
  );
};


export default PrepInfo;
