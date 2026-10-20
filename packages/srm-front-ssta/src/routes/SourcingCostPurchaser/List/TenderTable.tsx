import { stringify } from 'querystring';
import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../List/stores';
import { ActiveKey } from '../utils/type';
// import { openEmbedPage } from '../../../utils/utils';
import { tenderActionFlagger } from '../utils/utils';
import type { StoreValueType } from '../List/stores';
import InvoiceEntry from '../components/InvoiceEntry';
import ColumnBtnGroup from '../../Components/ColumnBtnGroup';
import { statusTagRender } from '../../Components/StatusTag';
import TenderPayConfirm from '../components/TenderPayConfirm';
import SelectInvoiceType from '../components/SelectInvoiceType';
import TenderProgressCtrl from '../components/TenderProgressCtrl';
import TenderOnlineRefund from '../components/TenderOnlineRefund';
import TenderRefundConfirm from '../components/TenderRefundConfirm';
import { TenderListGridCustCode, TenderSearchCustCode } from '../utils/type';
import { previewInvoicingApply, queryInvoicingApplyList } from '../utils/api';
import approvalErrorRemarkIcon from '../../../assets/approval_error_remark.svg';
import commonStyles from '../../common.less';

interface TenderTableProps {
  privateKey: ActiveKey,
};

const TenderTable = (props: TenderTableProps) => {
  const { privateKey } = props;
  const {
    dsMap,
    remote,
    activeKey,
    permissionMap,
    searchBarRefMap,
    handleReQuery,
    handleToDetail,
    customizeTable,
    handleRecordInit,
    handleViewSyncRecord,
    history,
  } = useContext<StoreValueType>(Store);
  const tableDs = useMemo(() => dsMap[privateKey], [dsMap, privateKey]);

  const { event } = remote || {};

  useEffect(() => {
    handleRecordInit(privateKey);
    if(tableDs){
      if (remote && remote.event) {
        remote.event.fireEvent('beforeDsQuery', {key: privateKey, currentDs: tableDs, searchBarRefMap, dsMap});
      }
    }
  }, [privateKey, handleRecordInit, tableDs, searchBarRefMap?.current?.size, dsMap]);

  // 发票录入
  const handleEntryInvoice = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.invoiceEntry').d('发票录入'),
      className: commonStyles['ssta-medium-modal'],
      children: <InvoiceEntry docType='tender' feeRecord={record} okCallback={handleReQuery} />,
      okText: intl.get('ssta.sourcingCost.view.button.invoiceEntryDone').d('发票录入完成'),
    });
  }, [handleReQuery]);

  // 开票
  const handleInvoicing = useCallback(async (invoiceType, record) => {
    const tenderFeesId = record?.get('tenderFeesId');
    const tenderFeesNum = record?.get('tenderFeesNum');
    if (!tenderFeesId) return false;
    tableDs.status = DataSetStatus.loading;
    const previewRes = getResponse(await previewInvoicingApply({ tenderFeesId, invoiceType }));
    tableDs.status = DataSetStatus.ready;
    if (!previewRes) return false;
    tableDs.query();
    tableDs.status = DataSetStatus.loading;
    const applyListRes = getResponse(await queryInvoicingApplyList(tenderFeesId));
    tableDs.status = DataSetStatus.ready;
    if (!applyListRes || isEmpty(applyListRes)) return false;
    const applyList = applyListRes.map(({ applyNum, applyHeaderId }) => ({ applyNum, applyHeaderId }));
    const { applyHeaderId, billingType } = applyList[0];
    const baseSearch: Record<string, any> = { dataSource: 'SRM_TENDER_FEES', tenderFeesId, applyHeaderId, sourceDocNum: tenderFeesNum, sourceDocId: tenderFeesId, docSearchFlag: applyList.length > 1, type: 'edit', source: 'tenderPurList', apiType: 'normal', billingType };
    history.push({
      pathname: `/ssta/direct-pool-supply/apply/detail`,
      search: stringify(baseSearch),
    });
  }, [tableDs, history]);

  const handleSelectInvoiceType = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.title.selectInvoiceType').d('请选择发票类型'),
      children: <SelectInvoiceType record={record} okCallback={handleInvoicing} />,
      className: commonStyles['ssta-small-modal'],
    });
  }, [handleInvoicing]);

  // 发票取消确认
  const handleConfirmCancelInv = useCallback((record) => {
    Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl.get(`ssta.sourcingCost.view.message.confirmCancelInvFlag`).d('发票取消确认，仅将「招标文件费开票状态」置为已退票，请线下处理税务发票作废红冲'),
      onOk: async () => {
        record.status = 'update'; // 触发 dirty 提交
        const res = await tableDs.setState('submitType', 'confirmCancelInv').submit();
        if (!res) return false;
        handleReQuery();
      },
    });
  }, [tableDs, handleReQuery]);

  // 缴纳确认
  const handleConfirmPay = useCallback((record) => {
    const openConfirmModal = () => {
      Modal.open({
        drawer: true,
        closable: true,
        key: Modal.key(),
        className: commonStyles['ssta-small-modal'],
        title: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认') + record?.get('tenderFeesNum'),
        children: <TenderPayConfirm tenderRecord={record} okCallback={handleReQuery} />,
      });
    };

    const handleProps = {
      openConfirmModal,
      record,
    };

    if (event) {
      event.fireEvent('tenderConfirmPay', handleProps);
    } else {
      openConfirmModal();
    }
  }, [handleReQuery, event]);

  // 退款确认
  const handleConfirmRefund = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.refundConfirm').d('退款确认') + record?.get('tenderFeesNum'),
      children: <TenderRefundConfirm tenderRecord={record} okCallback={handleReQuery} />,
    });
  }, [handleReQuery]);

  const handleOnlineRefund = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.title.onlineRefund').d('在线退款') + record?.get('tenderFeesNum'),
      children: <TenderOnlineRefund tenderRecord={record} okCallback={handleReQuery} />,
    });
  }, [handleReQuery]);

  // 寻源过程控制
  const handleCtrlSourcingProgress = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.sourcingProgressCtrl').d('寻源过程控制') + record?.get('tenderFeesNum'),
      children: <TenderProgressCtrl tenderRecord={record} okCallback={handleReQuery} />,
    });
  }, [handleReQuery]);

  const diffColumns = useMemo<Record<string, ColumnProps[]>>(() => {
    const statusProps: ColumnProps = {
      name: 'tenderFeesStatus',
      width: 110,
      renderer: statusTagRender,
    };
    const paymentStatusProps: ColumnProps = {
      name: 'tenderFeesPaymentStatus',
      width: 100,
      renderer: statusTagRender,
    };
    const invoiceStatusProps: ColumnProps = {
      name: 'tenderFeesInvoiceStatus',
      width: 100,
      renderer: statusTagRender,
    };
    const operationProps: ColumnProps = {
      name: 'operation',
      width: 170,
      renderer: ({ record }) => {
        const {
          invoicingFlag,
          payConfirmFlag,
          invoiceEntryFlag,
          refundConfirmFlag,
          onlineRefundFlag,
          invCancelConfirmFlag,
          sourcingProgressCtrlFlag,
        } = tenderActionFlagger(record);
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
            name: 'invoicing',
            text: intl.get('ssta.sourcingCost.view.button.invoicing').d('开票'),
            onClick: () => handleSelectInvoiceType(record),
            showFlag: invoicingFlag && permissionMap?.get('tenderInvoicing'),
            disabled: !record?.get('supplierTenantId'),
            tooltip: !record?.get('supplierTenantId') && intl.get('ssta.sourcingCost.view.button.invoiceEntry.help').d('供应商未关联平台供应商，暂不支持开票。'),
          },
          {
            name: 'invCancelConfirm',
            text: intl.get('ssta.sourcingCost.view.button.invCancelConfirm').d('发票取消确认'),
            onClick: () => handleConfirmCancelInv(record),
            showFlag: invCancelConfirmFlag,
          },
          {
            name: 'refundConfirm',
            text: intl.get('ssta.sourcingCost.view.button.refundConfirm').d('退款确认'),
            onClick: () => handleConfirmRefund(record),
            showFlag: refundConfirmFlag,
          },
          {
            name: 'onlineRefund',
            text: intl.get('ssta.sourcingCost.view.button.refund').d('退款'),
            onClick: () => handleOnlineRefund(record),
            showFlag: onlineRefundFlag,
          },
          {
            name: 'sourcingProgressCtrl',
            text: intl.get('ssta.sourcingCost.view.button.sourcingProgressCtrl').d('寻源过程控制'),
            onClick: () => handleCtrlSourcingProgress(record),
            showFlag: activeKey === ActiveKey.TenderAll && sourcingProgressCtrlFlag && permissionMap?.get('tenderProgressCtrl'),
          },
        ];
        const otherProps = { record, tableDs, activeKey };
        const processBtns = remote
          ? remote.process('SSTA.SOURCING_COST_PUR_CUX.TENDER_OPR_BTNS', normalBtns, otherProps)
          : normalBtns;
        return <ColumnBtnGroup buttons={processBtns} />;
      },
    };
    const tenderNumProps: ColumnProps = {
      name: 'tenderFeesNum',
      width: 150,
      renderer: ({ value, record }) => {
        const approveRejectComment = record?.get('approveRejectComment');
        return (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleToDetail(record?.get('tenderFeesId'), 'tender')}
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
      [ActiveKey.TenderAll]: [
        statusProps,
        operationProps,
        tenderNumProps,
        paymentStatusProps,
        invoiceStatusProps,
      ],
      [ActiveKey.TenderPay]: [paymentStatusProps, operationProps, tenderNumProps],
      [ActiveKey.TenderInv]: [invoiceStatusProps, operationProps, tenderNumProps],
    };
  }, [
    remote,
    tableDs,
    activeKey,
    permissionMap,
    handleToDetail,
    handleConfirmPay,
    handleEntryInvoice,
    handleOnlineRefund,
    handleConfirmRefund,
    handleConfirmCancelInv,
    handleSelectInvoiceType,
    handleCtrlSourcingProgress,
  ]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      ...(diffColumns[activeKey] || diffColumns[ActiveKey.TenderAll]),
      {
        name: 'sourceDocumentTypeMeaning',
        width: 120,
      },
      {
        name: 'sourceDocumentNum',
        width: 150,
      },
      {
        name: 'sourceDocumentTitle',
        width: 200,
      },
      {
        name: 'companyName',
        width: 200,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'amount',
        width: 110,
      },
      (activeKey === ActiveKey.TenderAll && {
        name: 'syncStatus',
        width: 100,
        renderer: (rendererProps) => {
          const { record } = rendererProps;
          return statusTagRender({
            ...rendererProps,
            icon: 'wysiwyg',
            onClick: () => handleViewSyncRecord(record, 'tender'),
          });
        },
      }) as any,
    ];
  }, [
    activeKey,
    diffColumns,
    handleViewSyncRecord,
  ]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: TenderListGridCustCode[privateKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={TenderSearchCustCode[privateKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
};

export default TenderTable;
