import { stringify } from 'querystring';
import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button, Modal, Attachment, Tooltip } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../List/stores';
import { ActiveKey } from '../utils/type';
import TenderPay from '../components/TenderPay';
// import { openEmbedPage } from '../../../utils/utils';
import type { StoreValueType } from '../List/stores';
import { tenderActionFlagger } from '../utils/utils';
import ColumnBtnGroup from '../../Components/ColumnBtnGroup';
import { statusTagRender } from '../../Components/StatusTag';
import TenderPayConfirm from '../components/TenderPayConfirm';
import SelectInvoiceType from '../components/SelectInvoiceType';
import { previewInvoicingApply, queryInvoicingApplyList } from '../utils/api';
import approvalErrorRemarkIcon from '../../../assets/approval_error_remark.svg';
import { TenderListGridCustCode, TenderListSearchCustCode } from '../utils/type';
import styles from '../index.less';
import commonStyles from '../../common.less';

interface TenderTableProps {
  privateKey: ActiveKey,
};

const { Group: AttachmentGroup } = Attachment;
const tenderFileAttachmentProps: Record<string, any> = {
  showHistory: true,
  labelLayout: 'float',
  bucketDirectory: "ssrc-rfx-rfxheader",
  bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
};
const TenderTable = (props: TenderTableProps) => {
  const { privateKey } = props;
  const {
    dsMap,
    remote,
    activeKey,
    permissionMap,
    handleReQuery,
    customizeTable,
    handleRecordInit,
    handleToDetail,
    handleViewSyncRecord,
    history,
  } = useContext<StoreValueType>(Store);
  const tableDs = useMemo(() => dsMap[privateKey], [dsMap, privateKey]);

  useEffect(() => {
    handleRecordInit(privateKey);
  }, [privateKey, handleRecordInit]);

  // 招标文件费用缴纳
  const handlePay = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-medium-modal'],
      title: intl.get('ssta.sourcingCost.view.button.pay').d('缴纳') + record?.get('tenderFeesNum'),
      children: <TenderPay tenderFeesId={record?.get('tenderFeesId')} />,
    });
  }, []);

  // 缴纳确认
  const handleConfirmPay = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认') + record?.get('tenderFeesNum'),
      children: <TenderPayConfirm tenderRecord={record} okCallback={handleReQuery} />,
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
    const baseSearch: Record<string, any> = { dataSource: 'SRM_TENDER_FEES', tenderFeesId, applyHeaderId, sourceDocNum: tenderFeesNum, sourceDocId: tenderFeesId, docSearchFlag: applyList.length > 1, type: 'edit', source: 'tenderSupList', apiType: 'normal', billingType };
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

  const diffColumns = useMemo<Record<string, ColumnProps[]>>(() => {
    const tenderAttachmentProps = remote
    ? remote.process('SSTA.SOURCING_COST_SUP_CUX.TENDER_TABLE.ATTACHMENT_PROPS', tenderFileAttachmentProps, {})
    : tenderFileAttachmentProps;
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
          payFlag,
          invoicingFlag,
          downloadFlag,
          payConfirmFlag,
        } = tenderActionFlagger(record);
        return (
          <ColumnBtnGroup
            buttons={[
              {
                name: 'pay',
                text: intl.get('ssta.sourcingCost.view.button.pay').d('缴纳'),
                onClick: () => handlePay(record),
                showFlag: payFlag,
              },
              {
                name: 'payConfirm',
                text: intl.get('ssta.sourcingCost.view.button.payConfirm').d('缴纳确认'),
                onClick: () => handleConfirmPay(record),
                showFlag: payConfirmFlag && permissionMap?.get('tenderPayConfirm'),
              },
              {
                name: 'invoicing',
                text: intl.get('ssta.sourcingCost.view.button.invoicing').d('开票'),
                onClick: () => handleSelectInvoiceType(record),
                showFlag: invoicingFlag,
                wait: 1000,
                disabled: !record?.get('supplierTenantId'),
                tooltip: !record?.get('supplierTenantId') && intl.get('ssta.sourcingCost.view.button.invoiceEntry.help').d('供应商未关联平台供应商，暂不支持开票。'),
              },
              {
                name: 'tenderFileDownload',
                showFlag: downloadFlag,
                btnComp: (
                  <AttachmentGroup
                    icon=""
                    colSpan={2}
                    viewMode='popup'
                    text={intl.get('ssta.sourcingCost.view.button.tenderFileDownload').d('招标文件下载')}
                  >
                    <Attachment
                      record={record as DSRecord}
                      name="techAttachmentUuid"
                      className={styles['tech-attachment']}
                      {...tenderAttachmentProps}
                    />
                    <Attachment
                      record={record as DSRecord}
                      name="businessAttachmentUuid"
                      className={styles['business-attachment']}
                      {...tenderAttachmentProps}
                    />
                  </AttachmentGroup>
                ),
              },
            ]}
          />
        );
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
  }, [permissionMap, handlePay, handleSelectInvoiceType, handleToDetail, handleConfirmPay]);

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
          searchCode={TenderListSearchCustCode[privateKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
};

export default TenderTable;
