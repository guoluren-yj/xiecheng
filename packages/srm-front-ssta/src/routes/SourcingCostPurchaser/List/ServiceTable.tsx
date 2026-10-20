import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import ColumnBtnGroup from '../../Components/ColumnBtnGroup';
import { statusTagRender } from '../../Components/StatusTag';

import { Store } from '../List/stores';
import { ActiveKey } from '../utils/type';
import { formatNumber } from '../../../utils/utils';
import ServicePay from '../components/ServicePay';
import { serviceActionFlagger } from '../utils/utils';
import type { StoreValueType } from '../List/stores';
import InvoiceEntry from '../components/InvoiceEntry';
import ServiceAmountChange from '../components/ServiceAmountChange';
import approvalErrorRemarkIcon from '../../../assets/approval_error_remark.svg';
import { ServiceListGridCustCode, ServiceListSearchCustCode } from '../utils/type';
import styles from '../index.less';

interface TenderTableProps {
  privateKey: ActiveKey,
};

const ServiceTable = (props: TenderTableProps) => {
  const { privateKey } = props;
  const {
    dsMap,
    remote,
    activeKey,
    permissionMap,
    searchBarRefMap,
    handleReQuery,
    handleToDetail,
    handleSearchBarRef,
    customizeTable,
    handleRecordInit,
    handleViewSyncRecord,
    handleTabChange,
  } = useContext<StoreValueType>(Store);
  const tableDs = useMemo(() => dsMap[privateKey], [dsMap, privateKey]);

  useEffect(() => {
    handleRecordInit(privateKey);
    if(tableDs){
      if (remote && remote.event) {
        remote.event.fireEvent('beforeDsQuery', {key: privateKey, currentDs: tableDs, searchBarRefMap, dsMap});
      }
    }
  }, [privateKey, handleRecordInit,dsMap, searchBarRefMap?.current?.size, dsMap]);

  // 缴纳
  const handleConfirmPay = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      title: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认') + record?.get('serverFeesNum'),
      children: <ServicePay serviceRecord={record} okCallback={handleReQuery} remote={remote}/>,
    });
  }, [handleReQuery]);

  // 退回
  const handleRefundConfirm = useCallback((record) => {
    const serverFeesNum = record.get('serverFeesNum');
    Modal.confirm({
      title: intl.get('ssta.sourcingCost.view.title.serviceFeeRefundConfirm').d('服务费退款确认'),
      children: intl.get(`ssta.sourcingCost.view.title.confirmReturnServiceFeeFlagBasePayRecord`, { serverFeesNum }).d('是否确定根据缴纳记录将服务费{serverFeesNum}退回至供应商/保证金？'),
      onOk: async () => {
        record.status = 'update'; // 触发 dirty 提交
        const res = await tableDs.setState('submitType', 'return').submit();
        if (!res) return false;
        handleReQuery();
      },
    });
  }, [tableDs, handleReQuery]);

  // 发票录入
  const handleEntryInvoice = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.invoiceEntry').d('发票录入'),
      className: styles['ssta-medium-modal'],
      children: <InvoiceEntry docType='service' feeRecord={record} okCallback={handleReQuery} />,
      okText: intl.get('ssta.sourcingCost.view.button.invoiceEntryDone').d('发票录入完成'),
    });
  }, [handleReQuery]);

  // 金额变更
  const handleAmountChange = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.amountChange').d('金额变更') + record?.get('serverFeesNum'),
      children: <ServiceAmountChange serviceRecord={record} okCallback={handleReQuery} />,
    });
  }, [handleReQuery]);

  // 撤销金额变更
  const handleRevokeAmountChange = useCallback((record) => {
    const { amountPrecision, amountBeforeChange } = record.get(['amountPrecision', 'amountBeforeChange']) || {};
    const beforeChange = formatNumber(amountBeforeChange, amountPrecision);
    Modal.confirm({
      title: intl.get('ssta.sourcingCost.view.button.revokeAmountChange').d('撤销金额变更'),
      children: intl.get(`ssta.sourcingCost.view.title.confirmRevokeServiceFeeAmountChangeFlag`, { beforeChange }).d('是否确认撤销金额变更？撤销后，金额将恢复至最近一次有效状态时的金额{beforeChange}'),
      onOk: async () => {
        record.status = 'update'; // 触发 dirty 提交
        const res = await tableDs.setState('submitType', 'revokeAmountChange').submit();
        if (!res) return false;
        handleReQuery();
      },
    });
  }, [tableDs, handleReQuery]);

  const diffColumns = useMemo<Record<string, ColumnProps[]>>(() => {
    const statusProps: ColumnProps = {
      name: 'serverFeesStatus',
      width: 120,
      renderer: statusTagRender,
    };
    const paymentStatusProps: ColumnProps = {
      name: 'serverFeesPaymentStatus',
      width: 150,
      renderer: statusTagRender,
    };
    const invoiceStatusProps: ColumnProps = {
      name: 'serverFeesInvoiceStatus',
      width: 150,
      renderer: statusTagRender,
    };
    const operationProps: ColumnProps = {
      name: 'operation',
      width: 160,
      renderer: ({ record }) => {
        const {
          payConfirmFlag,
          invoiceEntryFlag,
          refundConfirmFlag,
          amountChangeFlag,
          revokeAmountChangeFlag,
        } = serviceActionFlagger(record);
        const normalBtns = [
          {
            name: 'payConfirm',
            text: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认'),
            onClick: () => handleConfirmPay(record),
            showFlag: payConfirmFlag,
          },
          {
            name: 'invoiceEntry',
            text: intl.get('ssta.sourcingCost.view.button.invoiceEntry').d('发票录入'),
            onClick: () => handleEntryInvoice(record),
            showFlag: invoiceEntryFlag,
            disabled: !record?.get('supplierTenantId'),
            tooltip: !record?.get('supplierTenantId') && intl.get('ssta.sourcingCost.view.button.invoiceEntry.help').d('供应商未关联平台供应商，暂不支持开票。'),
          },
          {
            name: 'refundConfirm',
            text: intl.get('ssta.sourcingCost.view.button.refundConfirm').d('退款确认'),
            onClick: () => handleRefundConfirm(record),
            showFlag: refundConfirmFlag,
          },
          {
            name: 'amountChange',
            text: intl.get('ssta.sourcingCost.view.button.amountChange').d('金额变更'),
            onClick: () => handleAmountChange(record),
            showFlag: activeKey === ActiveKey.ServiceAll && amountChangeFlag && permissionMap?.get('serviceAmountExchange'),
          },
          {
            name: 'revokeAmountChange',
            text: intl.get('ssta.sourcingCost.view.button.revokeAmountChange').d('撤销金额变更'),
            onClick: () => handleRevokeAmountChange(record),
            showFlag: activeKey === ActiveKey.ServiceAll && revokeAmountChangeFlag && permissionMap?.get('serviceAmountExchange'),
          },
        ];
        const otherProps = { record, tableDs, activeKey, handleReQuery, handleTabChange, };
        const processBtns = remote
          ? remote.process('SSTA.SOURCING_COST_PUR_CUX.SERVICE_OPR_BTNS', normalBtns, otherProps)
          : normalBtns;
        return <ColumnBtnGroup buttons={processBtns} />;
      },
    };
    const serviceNumProps: ColumnProps = {
      name: 'serverFeesNum',
      width: 180,
      renderer: ({ value, record }) => {
        const approveRejectComment = record?.get('approveRejectComment');
        return (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleToDetail(record?.get('serverFeesId'), 'service')}
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
    return {
      [ActiveKey.ServiceAll]: [
        statusProps,
        operationProps,
        serviceNumProps,
        paymentStatusProps,
        invoiceStatusProps,
      ],
      [ActiveKey.ServicePay]: [paymentStatusProps, operationProps, serviceNumProps],
      [ActiveKey.ServiceInv]: [invoiceStatusProps, operationProps, serviceNumProps],
    };
  }, [
    remote,
    tableDs,
    activeKey,
    permissionMap,
    handleToDetail,
    handleConfirmPay,
    handleEntryInvoice,
    handleRefundConfirm,
    handleAmountChange,
    handleRevokeAmountChange,
  ]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      ...(diffColumns[activeKey] || diffColumns[ActiveKey.ServiceAll]),
      {
        name: 'sourceDocumentTypeMeaning',
        width: 120,
      },
      {
        name: 'sourceDocumentNum',
        width: 180,
      },
      {
        name: 'sourceDocumentTitle',
        width: 180,
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
        width: 120,
      },
      {
        name: 'paidAmount',
        width: 120,
      },
      (activeKey === ActiveKey.ServiceAll && {
        name: 'syncStatus',
        width: 100,
        renderer: (rendererProps) => {
          const { record } = rendererProps;
          return statusTagRender({
            ...rendererProps,
            icon: 'wysiwyg',
            onClick: () => handleViewSyncRecord(record, 'service'),
          });
        },
      }) as any,
    ];
  }, [activeKey, diffColumns, handleViewSyncRecord]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: ServiceListGridCustCode[privateKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={ServiceListSearchCustCode[privateKey]}
          searchBarRef={(ele) => handleSearchBarRef(ele, activeKey)}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
};

export default ServiceTable;
