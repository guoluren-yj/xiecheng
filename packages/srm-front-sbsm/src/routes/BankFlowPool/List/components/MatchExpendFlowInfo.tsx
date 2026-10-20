import React, { useMemo, useContext, useCallback } from 'react';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { Table, Button, useModal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';

import { Store } from '../stores';
import { statusTagRender } from '../../../../components/StatusTag';
import { previewPdf } from '../../../../utils/utils';

import { MatchExpendFlowListCode } from '../../utils/type';
import { useModalOpen } from '../../../../hooks';
import MatchExpendFlowModal from './MatchExpendFlowModal';

const MatchExpendFlowInfo = (props) => {
    const { customizeTable } = useContext(Store);
    const { matchExpendFlowInfoDs, abnormalRecord, readOnly } = props;
    const c7nModal = useModal();
    const modalOpen = useModalOpen(c7nModal);
    const { selected } = matchExpendFlowInfoDs;

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
          { name: 'payCommandNum', width: 160 },
          { name: 'pmtbizNum', width: 120 },
          { name: 'pmtbizLineNum', width: 160 },
        ];
    }, [handleDownLoad]);

    const handleOk = useCallback((list) => {
      list.forEach((item) => {
        matchExpendFlowInfoDs.create({
          '_status': 'create',
          ...item,
        });
      });
    }, [matchExpendFlowInfoDs]);

    const handleMatchFlow = useCallback(() => {
      const excludeSerialIdList = matchExpendFlowInfoDs?.filter((v) => v?.get('_status') === 'create')?.map((item) => item?.get('serialId')) || [];
      modalOpen({
        size: 'large',
        editFlag: true,
        title: intl.get('sbsm.bankFlow.model.button.matchFlow').d('匹配支出流水'),
        children: <MatchExpendFlowModal excludeSerialIdList={excludeSerialIdList} handleOk={handleOk} abnormalRecord={abnormalRecord} />,
      });
    }, [abnormalRecord, modalOpen, handleOk, matchExpendFlowInfoDs]);

    const handleDeleteLine = useCallback(() => {
      matchExpendFlowInfoDs.delete(selected);
    }, [selected, matchExpendFlowInfoDs]);

    const buttons = useMemo(() => {
      if (readOnly) return [];
      return [
          [TableButtonType.add, { onClick: handleMatchFlow, children: intl.get('sbsm.bankFlow.model.button.matchFlow').d('匹配支出流水') }] as [TableButtonType, TableButtonProps],
          [TableButtonType.delete, { onClick: handleDeleteLine, children: intl.get('sbsm.bankFlow.model.button.deleteMatch').d('删除匹配'), icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
      ];
    }, [handleMatchFlow, handleDeleteLine, readOnly]);

    return (
      <div>
        {
            customizeTable({
            code: MatchExpendFlowListCode,
            readOnly: true,
            }, (
              <Table
                dataSet={matchExpendFlowInfoDs}
                columns={columns}
                buttons={buttons}
                selectionMode={readOnly ? SelectionMode.none : SelectionMode.rowbox}
              />
            ))
        }
      </div>
    );
};


export default observer(MatchExpendFlowInfo);
