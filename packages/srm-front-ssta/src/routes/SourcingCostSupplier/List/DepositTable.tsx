import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../List/stores';
import DepositPay from '../components/DepositPay';
import type { StoreValueType } from '../List/stores';
import { depositActionFlagger } from '../utils/utils';
import DepositReturn from '../components/DepositReturn';
import ColumnBtnGroup from '../../Components/ColumnBtnGroup';
import { statusTagRender } from '../../Components/StatusTag';
import approvalErrorRemarkIcon from '../../../assets/approval_error_remark.svg';
import { depositRefundProgressRender } from '../components/DepositRefundProgress';
import { ActiveKey, DepositListGridCustCode, DepositListSearchCustCode } from '../utils/type';
import commonStyles from '../../common.less';

interface TenderTableProps {
  privateKey: ActiveKey,
};

const DepositTable = (props: TenderTableProps) => {
  const { privateKey } = props;
  const {
    dsMap,
    activeKey,
    permissionMap,
    handleReQuery,
    handleToDetail,
    customizeTable,
    handleRecordInit,
    handleViewSyncRecord,
    remote,
  } = useContext<StoreValueType>(Store);
  const tableDs = useMemo(() => dsMap[privateKey], [dsMap, privateKey]);

  useEffect(() => {
    handleRecordInit(privateKey);
  }, [privateKey, handleRecordInit]);

  // 保证金缴纳
  const handleConfirmPay = useCallback(async (record) => {
    // 保证金-缴纳确认-卡片打开埋点
    if (remote?.event) {
      const flag =  await remote.event.fireEvent('depositPayModalOpen', {
        depositRecord: record,
        okCallback: handleReQuery,
      });
      if(!flag) return false;
    };
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-medium-modal'],
      title: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认') + record?.get('depositNum'),
      children: <DepositPay depositRecord={record} okCallback={handleReQuery} remote={remote} />,
    });
  }, [handleReQuery]);

  // 保证金退回
  const handleReturnSupplier = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.returnSupplier').d('退回供应商') + record?.get('depositNum'),
      children: <DepositReturn depositRecord={record} okCallback={handleReQuery} remote={remote}/>,
    });
  }, [handleReQuery]);

  const diffColumns = useMemo<Record<string, ColumnProps[]>>(() => {
    const statusProps: ColumnProps = {
      name: 'depositStatus',
      width: 100,
      renderer: statusTagRender,
    };
    const operationProps: ColumnProps = {
      name: 'operation',
      width: 160,
      renderer: ({ record }) => {
        const { payConfirmFlag, returnSupplierFlag } = depositActionFlagger(record);
        const _buttons = [
          {
            name: 'payConfirm',
            text: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认'),
            onClick: () => handleConfirmPay(record),
            showFlag: payConfirmFlag && permissionMap?.get('depositPayConfirm'),
          },
          {
            name: 'returnSupplier',
            text: intl.get('ssta.sourcingCost.view.button.returnSupplier').d('退回供应商'),
            onClick: () => handleReturnSupplier(record),
            showFlag: returnSupplierFlag && permissionMap?.get('depositReturnSupplier'),
          },
        ];
        const buttons = remote? remote.process('SSTA.SOURCING_COST_SUP_CUX.DEPOSIT_OPERATION_BTNS', _buttons, {
          record,
          returnSupplierFlag,
          showFlagMap: depositActionFlagger(record),
          activeKey,
        }): _buttons;
        return (
          <ColumnBtnGroup
            buttons={buttons}
          />
        );
      },
    };
    const depositNumProps: ColumnProps = {
      name: 'depositNum',
      width: 160,
      renderer: ({ value, record }) => {
        const approveRejectComment = record?.get('approveRejectComment');
        return (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleToDetail(record?.get('depositId'), 'deposit')}
          >
            {value}
            {approveRejectComment && (
              <Tooltip title={approveRejectComment}>
                <img alt="" src={approvalErrorRemarkIcon} style={{ marginLeft: 2 }} />
              </Tooltip>
            )}
          </Button>
        );
      },
    };
    const payStatusProps: ColumnProps = {
      name: 'depositPaymentStatus',
      width: 110,
      renderer: statusTagRender,
    };
    const returnStatusProps: ColumnProps = {
      name: 'depositRefundStatus',
      width: 200,
      renderer: ({ record }) => depositRefundProgressRender(record),
    };
    return {
      [ActiveKey.DepositAll]: [
        statusProps,
        operationProps,
        depositNumProps,
        payStatusProps,
        returnStatusProps,
      ],
      [ActiveKey.DepositPay]: [payStatusProps, operationProps, depositNumProps],
      [ActiveKey.DepositReturn]: [returnStatusProps, operationProps, depositNumProps],
    };
  }, [permissionMap, handleToDetail, handleConfirmPay, handleReturnSupplier]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      ...(diffColumns[activeKey] || diffColumns[ActiveKey.DepositAll]),
      {
        name: 'sourceDocumentTypeMeaning',
        width: 120,
      },
      {
        name: 'sourceDocumentNum',
        width: 140,
      },
      {
        name: 'sourceDocumentTitle',
        width: 150,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'amount',
        width: 100,
      },
      {
        name: 'paidAmount',
        width: 100,
      },
      ...(activeKey !== ActiveKey.DepositPay ? [
        {
          name: 'payForServerAmount',
          width: 100,
        },
        {
          name: 'returnAmount',
          width: 120,
        },
        {
          name: 'payOutAmount',
          width: 100,
        },
      ] : []),
      (activeKey === ActiveKey.DepositAll && {
        name: 'syncStatus',
        width: 100,
        renderer: (rendererProps) => {
          const { record } = rendererProps;
          return statusTagRender({
            ...rendererProps,
            icon: 'wysiwyg',
            onClick: () => handleViewSyncRecord(record, 'deposit'),
          });
        },
      }) as any,
    ];
  }, [activeKey, diffColumns, handleViewSyncRecord]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: DepositListGridCustCode[privateKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={DepositListSearchCustCode[privateKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
};

export default DepositTable;
