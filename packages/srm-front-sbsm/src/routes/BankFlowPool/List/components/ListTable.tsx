import React, { useContext, useMemo, memo, useCallback } from 'react';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/interface';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { Button, useModal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { Store } from '../stores';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { GridCustCodeMap, SearchCustCodeMap, ActiveKey } from '../../utils/type';
import { formatColumnCommand } from '../../../../components/Renderer';
import { useModalOpen } from '../../../../hooks';
import MatchAbnormal from './MatchAbnormal';

interface ListTableProps {
  activeKey: ActiveKey,
};

const ListTable = memo((props: ListTableProps) => {
  const { activeKey } = props;

  const { dsMap, remote, history, customizeTable, permissionMap } = useContext(Store);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const handleMatchAbnormal = useCallback((record, readOnly?: boolean) => {
    modalOpen({
      size: 'large',
      editFlag: !readOnly,
      title: intl.get('sbsm.bankFlow.model.bankFlow..refundReceiveFlowInfo').d('退票收款流水信息'),
      children: <MatchAbnormal readOnly={readOnly} currentListDs={currentListDs} abnormalRecord={record} />,
    });
  }, [modalOpen, currentListDs]);

  const operationCommand = useCallback(({ record }) => {
    const { type } = record?.get(['type']) || {};
    const normalBtns = [
      {
        name: 'return',
        text: intl.get('sbsm.bankFlow.model.bankFlow.refundMatchAbnormal').d('退票匹配'),
        onClick: () => handleMatchAbnormal(record),
        showFlag: ['REFUNDABLE_RECEIPT'].includes(type) && permissionMap?.get('refundMatch') && (activeKey === ActiveKey.All || activeKey === ActiveKey.Refundable),
        wait: 1000,
      },
      {
        name: 'returnRecord',
        text: intl.get('sbsm.bankFlow.model.bankFlow.refundMatchAbnormalRecord').d('退票匹配记录'),
        onClick: () => handleMatchAbnormal(record, true),
        showFlag: ['REFUNDED_RECEIPT', 'PAYMENT_REFUND'].includes(type) && permissionMap?.get('refundMatchRecord') && (activeKey === ActiveKey.All || activeKey === ActiveKey.Refund),
        wait: 1000,
      },
    ];
    const processBtns = remote
      ? remote.process('SBSM.BANK_FLOW_POOL_LIST_CUX.OPR_COMMAND', normalBtns, { dsMap, record, history, activeKey })
      : normalBtns;
    return formatColumnCommand({ buttons: processBtns });
  }, [
    dsMap,
    remote,
    history,
    activeKey,
    permissionMap,
    handleMatchAbnormal,
  ]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      { name: 'type', width: 150, renderer: statusTagRender },
      { name: 'urid', width: 150 },
      { name: 'noteCode', width: 150 },
      { name: 'applyNoteCode', width: 150 },
      { name: 'orgCode', width: 150 },
      { name: 'ourBankAccountNum', width: 160 },
      { name: 'ourBankAccountName', width: 160 },
      { name: 'ourBank', width: 160 },
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
        width: 120,
        renderer: ({ value }) => value && (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => window.open(value, '_blank')}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </Button>
        ),
      },
      { name: 'payCommandNum', width: 160 },
      { name: 'pmtbizNum', width: 120 },
      { name: 'pmtbizLineNum', width: 160 },
      {
        name: 'operate',
        width: 160,
        align: ColumnAlign.left,
        command: operationCommand,
      },
    ];
  }, [operationCommand]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: GridCustCodeMap[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={currentListDs}
          columns={columns}
          searchCode={SearchCustCodeMap[activeKey]}
          style={{ maxHeight: 'calc(100% - 20px)' }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name='bankSerialNums'
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.paymentPool.view.placeholder.enterBankSerialNumToQuery')
                    .d('请输入银行流水号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
});

export default ListTable;
