import React, { useMemo, useContext, useCallback, useEffect } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { Button, DataSet } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import { previewPdf } from '../../../../utils/utils';
import { Store } from '../stores';
import { statusTagRender } from '../../../../components/StatusTag';
import { matchExpendFlowInfoDS } from '../stores/listDS';
import { MatchFlowListCode, MatchFlowSearchCode } from '../../utils/type';

const MatchExpendFlowInfo = (props) => {
  const { customizeTable } = useContext(Store);
  const { abnormalRecord, modal, handleOk, excludeSerialIdList = [] } = props;
  const serialId = abnormalRecord?.get('serialId');

  const matchExpendFlowDs = useMemo(() => new DataSet(matchExpendFlowInfoDS({ serialId, excludeSerialIdList, customizeUnitCode: `${MatchFlowListCode},${MatchFlowSearchCode}` }, 'matchFlow')), [serialId, excludeSerialIdList]);

  const { selected } = matchExpendFlowDs;

  const handleDownLoad = useCallback((value) => {
    window.open(value);
  }, []);

  const handleSave = useCallback(() => {
    const list = selected?.map((item) => item?.toData());
    handleOk(list);
    modal.close();
  }, [selected, modal, handleOk]);

  useEffect(() => {
    modal.handleOk(handleSave);
    modal.update({ okProps: { disabled: isEmpty(selected) } });
  }, [selected, modal, handleSave]);

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
      { name: 'payCommandNum', width: 160 },
      { name: 'pmtbizNum', width: 120 },
      { name: 'pmtbizLineNum', width: 160 },
    ];
  }, [handleDownLoad]);

  return (
    <div>
      {
        customizeTable({
          code: MatchFlowListCode,
          readOnly: true,
        }, (
          <SearchBarTable
            cacheState
            customizable
            dataSet={matchExpendFlowDs}
            columns={columns}
            searchCode={MatchFlowSearchCode}
            style={{ maxHeight: 'calc(100vh - 260px)' }}
          />
        ))
      }
    </div>
  );
};


export default observer(MatchExpendFlowInfo);
