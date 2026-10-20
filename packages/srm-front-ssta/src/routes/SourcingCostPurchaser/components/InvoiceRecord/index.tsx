import type { ReactElement } from 'react';
import React, { useMemo, useCallback, useState, Fragment, useEffect } from 'react';
import { DataSetSelection, DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { DataSet, Table, Modal, Button, Attachment, Icon } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { Buttons, ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/interface';
import { flow, isNil, isEmpty } from 'lodash';
import Viewer from 'react-viewer';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';

import type { DocType } from './storeDS';
import InvoiceEntry from '../InvoiceEntry';
import InvoiceDetail from '../InvoiceDetail';
import { invoiceRecordDS, primaryKeyMap } from './storeDS';
import ColumnBtnGroup from '../../../Components/ColumnBtnGroup';
import { statusTagRender } from '../../../Components/StatusTag';
import { previewPdf, getAttachmentUrlWithToken } from '../../../../utils/utils';
import { ServiceDetailGridUnitCode, TenderDetailGridUnitCode } from '../../utils/type';
import commonStyles from '../../../common.less';

const tenantId = getCurrentOrganizationId();
const bucketDirectory = 'finance-invoice';
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';

interface InvoiceRecordProps {
  feeDs: DataSet;
  docType: DocType,
  allFlag: boolean,
  customizeTable: Function,
  invoiceEntryFlag: boolean,
  invCancelConfirmFlag?: boolean,
}

export const gridCodeMap: Record<DocType, string> = {
  tender: TenderDetailGridUnitCode.INV,
  service: ServiceDetailGridUnitCode.INV,
};

// 供应商不在列表页看开票记录
const InvoiceRecord = flow(
  observer,
  formatterCollections({ code: ['ssta.invoice', 'ssta.common'] }),
)((props: InvoiceRecordProps) => {

  const { feeDs, docType, allFlag, customizeTable, invoiceEntryFlag, invCancelConfirmFlag } = props;
  const primaryKey = primaryKeyMap[docType]; // 发票表主键名

  const [viewFileUrl, setViewFileUrl] = useState<string>('');
  const invoiceRecordDs = useMemo<DataSet>(() => new DataSet(invoiceRecordDS(docType)), [docType]);
  const { selected } = invoiceRecordDs;
  const loading = invoiceRecordDs.status !== DataSetStatus.ready;
  const invoiceRule = feeDs?.current?.get('invoiceRule');
  const invoiceVoidFlag = invCancelConfirmFlag && invoiceRule === 'DIRECT';

  useEffect(() => {
    if (feeDs) invoiceRecordDs.bind(feeDs, 'invoiceRecordList');
    if (allFlag && invoiceVoidFlag) invoiceRecordDs.selection = DataSetSelection.multiple;
  }, [feeDs, allFlag, invoiceRecordDs, invoiceVoidFlag]);

  const handleViewInvoiceDetail = useCallback((invoiceHeaderId: string | number) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      bodyStyle: { padding: 0, backgroundColor: '#f4f4f4' },
      className: commonStyles['ssta-medium-modal'],
      title: intl.get('ssta.common.view.title.invoiceDetail').d('发票详情'),
      children: <InvoiceDetail docType={docType} invoiceHeaderId={invoiceHeaderId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [docType]);

  const handleViewFile = useCallback((fileUrl) => {
    const fA = fileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(fileUrl);
    else window.open(fileUrl);
  }, []);

  const handleViewInvoiceFile = useCallback((fileUrl) => {
    const fA = fileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(fileUrl);
    else if (fileExt.toLowerCase() === 'ofd') return getAttachmentUrlWithToken(fileUrl);
    setViewFileUrl(fileUrl);
  }, []);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        name: 'operation',
        width: 120,
        renderer: ({ record }) => {
          const invoiceHeaderId = record?.get(primaryKey);
          return (
            <ColumnBtnGroup
              buttons={[
                {
                  name: 'view',
                  text: intl.get('hzero.common.button.view').d('查看'),
                  onClick: () => handleViewInvoiceDetail(invoiceHeaderId),
                },
              ]}
            />
          );
        },
      },
      (docType === 'tender' && {
        name: 'invoiceStatus',
        width: 120,
        renderer: statusTagRender,
      }) as ColumnProps,
      {
        width: 150,
        name: 'invoiceCode',
      },
      {
        width: 150,
        name: 'invoiceNum',
      },
      {
        width: 120,
        name: 'invoicingDate',
      },
      {
        width: 120,
        name: 'netAmount',
      },
      {
        width: 120,
        name: 'taxAmount',
      },
      {
        width: 120,
        name: 'taxIncludedAmount',
      },
      {
        width: 150,
        name: 'invoiceTypeMeaning',
      },
      // {
      //   width: 120,
      //   name: 'deductFlag',
      //   renderer: ({ value }) => isNil(value) ? value : yesOrNoRender(Number(value)),
      // },
      {
        width: 120,
        name: 'checkCode',
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supUnifiedSocialCode',
        width: 180,
      },
      {
        name: 'purUnifiedSocialCode',
        width: 190,
      },
      // {
      //   width: 120,
      //   name: 'invoiceUrl',
      // },
      {
        name: 'attachmentUuid',
        width: 120,
        editor: (record) => {
          return (
            <Attachment
              readOnly
              viewMode='popup'
              funcType={FuncType.link}
              value={record.get('attachmentUuid')}
              bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
            />
          );
        },
      },
      {
        name: 'fileUrl',
        width: 120,
        renderer: ({ value }) => {
          return value ? (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleViewFile(value)}>
              <Icon type="find_in_page" />
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ) : null;
        },
      },
      (false && {
        name: 'ocrFileUrl',
        width: 120,
        renderer: ({ value }) => {
          return value ? (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleViewInvoiceFile(value)}>
              <Icon type="find_in_page" />
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ) : null;
        },
      }) as ColumnProps,
      (false && {
        name: 'ofdFileUrl',
        width: 120,
        renderer: ({ value }) => {
          return value ? (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleViewInvoiceFile(value)}>
              {intl.get('hzero.common.button.download').d('下载')}
            </Button>
          ) : null;
        },
      }) as ColumnProps,
    ];
  }, [docType, handleViewInvoiceDetail, handleViewFile, handleViewInvoiceFile, primaryKey]);

  // 发票录入
  const handleEntryInvoice = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.invoiceEntry').d('发票录入'),
      className: commonStyles['ssta-medium-modal'],
      children: <InvoiceEntry docType={docType} feeRecord={feeDs.current} okCallback={() => feeDs.query()} />,
      okText: intl.get('ssta.sourcingCost.view.button.invoiceEntryDone').d('发票录入完成'),
    });
  }, [docType, feeDs]);

  // 发票作废
  const handleVoidInvoice = useCallback(async () => {
    const res = await invoiceRecordDs.setState('submitType', 'invoiceVoid').forceSubmit();
    if (!res) return;
    feeDs.query();
  }, [feeDs, invoiceRecordDs]);

  // 获取红字信息表
  const handleGetRedInkInfoSheet = useCallback(async () => {
    const res = await invoiceRecordDs.setState('submitType', 'getRedInkInfoSheet').forceSubmit();
    if (!res) return;
    feeDs.query();
  }, [feeDs, invoiceRecordDs]);

  const buttons = useMemo<Buttons[]>(() => {
    const invoiceVoidDisabled = isEmpty(selected) || selected.some((record) => record.get('invoiceStatus') !== 'NORMAL');
    return allFlag ? [
      (invoiceEntryFlag && [
        TableButtonType.add,
        {
          loading,
          children: intl.get('ssta.sourcingCost.view.button.invoiceEntry').d('发票录入'),
          onClick: handleEntryInvoice,
        },
      ]) as Buttons,
      ...(invoiceVoidFlag ? [
        <Button
          icon='feed'
          key='getRedInkInfoSheet'
          wait={1000}
          loading={loading}
          disabled={invoiceVoidDisabled}
          onClick={handleGetRedInkInfoSheet}
        >
          {intl.get('ssta.sourcingCost.view.button.getRedInkInfoSheet').d('获取红字信息表')}
        </Button>,
        <Button
          icon='cancel'
          key='invoiceVoid'
          wait={1000}
          loading={loading}
          disabled={invoiceVoidDisabled}
          onClick={handleVoidInvoice}
        >
          {intl.get('ssta.sourcingCost.view.button.invoiceVoidOrRedFlush').d('发票作废(红冲)')}
        </Button>,
      ] : []),
    ] : [];
  }, [
    loading,
    allFlag,
    selected,
    invoiceVoidFlag,
    invoiceEntryFlag,
    handleEntryInvoice,
    handleVoidInvoice,
    handleGetRedInkInfoSheet,
  ]);


  const viewImages = useMemo(() => {
    const downloadUrl = (getAttachmentUrl as any)(viewFileUrl, bucketName, tenantId, bucketDirectory);
    return [
      {
        alt: '',
        downloadUrl,
        src: downloadUrl,
      },
    ];
  }, [viewFileUrl]);

  return (
    <Fragment>
      {customizeTable(
        { code: gridCodeMap[docType] },
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={invoiceRecordDs}
          style={{ maxHeight: 430 }}
        />
      )}
      <Viewer
        noNavbar
        downloadable
        noImgDetails
        scalable={false}
        changeable={false}
        images={viewImages}
        visible={Boolean(viewFileUrl)}
        onClose={() => setViewFileUrl('')}
      />
    </Fragment>

  );
}) as (props: InvoiceRecordProps) => ReactElement;

export default InvoiceRecord;

