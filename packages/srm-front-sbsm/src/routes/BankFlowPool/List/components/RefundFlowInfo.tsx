import React, { useMemo, useContext, useCallback } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import { observer } from 'mobx-react';

import { Store } from '../stores';
import { statusTagRender } from '../../../../components/StatusTag';
import { previewPdf } from '../../../../utils/utils';

import { RefundFlowListCode } from '../../utils/type';
import { refundFlowInfoDS } from '../stores/listDS';

const MatchExpendFlowInfo = (props) => {
    const { customizeTable } = useContext(Store);
    const { abnormalRecord, readOnly } = props;
    const refundFlowInfoDs = useMemo(() => new DataSet(refundFlowInfoDS(abnormalRecord, readOnly)), [abnormalRecord, readOnly]);

    const handleDownLoad = useCallback((value) => {
        window.open(value);
    }, []);

    const columns: ColumnProps[] = useMemo(() => {
        return [
          { name: 'type', width: 150, renderer: statusTagRender },
          { name: 'urid', width: 150 },
          { name: 'noteCode', width: 150 },
          { name: 'applyNoteCode', width: 150 },
          { name: 'orgCode', width: 150 },
          { name: 'ourBankAccountNum', width: 160 },
          { name: 'ourBankAccountName', width: 160 },
          { name: 'oppositeAccountNum', width: 160 },
          { name: 'oppositeAccountName', width: 160 },
          { name: 'oppositeBank', width: 160 },
          { name: 'tradeDate', width: 140 },
          { name: 'tradeDateTime', width: 140 },
          { name: 'valueDate', width: 140 },
          { name: 'moneyWay', width: 140 },
          { name: 'amount', width: 140 },
          { name: 'currentBalance', width: 140 },
          { name: 'curCode', width: 140 },
          { name: 'purpose', width: 140 },
          { name: 'comments', width: 140 },
          { name: 'bankSerialNum', width: 140 },
          {
            name: 'fileUrl',
            width: 180,
            renderer: ({ value }) => value && (
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                style={{ userSelect: 'text' }}
                onClick={() => previewPdf(value)}
              >
                {intl.get('sbsm.bankFlow.model.bankFlow.view').d('查看')}
              </Button>
            ),
          },
          {
            name: 'fileDownloadUrl',
            width: 180,
            renderer: ({ value }) => value && (
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                style={{ userSelect: 'text' }}
                onClick={() => handleDownLoad(value)}
              >
                {intl.get('sbsm.bankFlow.model.bankFlow.download').d('下载')}
              </Button>
            ),
          },
          { name: 'receiptCode', width: 140 },
        ];
    }, [handleDownLoad]);

  return (
    <div>
      {
        customizeTable({
          code: RefundFlowListCode,
          readOnly: true,
        }, (
          <Table
            dataSet={refundFlowInfoDs}
            columns={columns}
          />
        ))
      }
    </div>
  );
};


export default observer(MatchExpendFlowInfo);
