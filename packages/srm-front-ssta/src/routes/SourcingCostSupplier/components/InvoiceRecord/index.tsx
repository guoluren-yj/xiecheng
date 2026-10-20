import type { ReactElement } from 'react';
import React, { useMemo, useCallback, useState, Fragment, useEffect } from 'react';
import { DataSet, Table, Modal, Button, Attachment, Icon } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { flow, isNil } from 'lodash';
import Viewer from 'react-viewer';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';

import type { DocType } from './storeDS';
import InvoiceDetail from '../InvoiceDetail';
import { invoiceRecordDS, primaryKeyMap } from './storeDS';
import ColumnBtnGroup from '../../../Components/ColumnBtnGroup';
import { previewPdf, getAttachmentUrlWithToken } from '../../../../utils/utils';
import { TenderDetailGridUnitCode, ServiceDetailGridUnitCode } from '../../utils/type';
import commonStyles from '../../../common.less';

const tenantId = getCurrentOrganizationId();
const bucketDirectory = 'finance-invoice';
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';

interface InvoiceRecordProps {
  feeDs: DataSet;
  docType: DocType,
  customizeTable: Function,
}

export const gridCodeMap: Record<DocType, string> = {
  tender: TenderDetailGridUnitCode.INV,
  service: ServiceDetailGridUnitCode.INV,
};

// 供应商不在列表页看开票记录
const InvoiceRecord = flow(
  observer,
  formatterCollections({ code: ['ssta.invoice', 'ssta.common'] }),
)((props) => {

  const { feeDs, docType, customizeTable } = props;
  const primaryKey = primaryKeyMap[docType]; // 发票表主键名

  const [viewFileUrl, setViewFileUrl] = useState<string>('');
  const invoiceRecordDs = useMemo<DataSet>(() => new DataSet(invoiceRecordDS(docType)), [docType]);

  useEffect(() => {
    if (feeDs) invoiceRecordDs.bind(feeDs, 'invoiceRecordList');
  }, [invoiceRecordDs, feeDs]);

  const handleViewInvoiceDetail = useCallback((invoiceHeaderId: string | number) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      bodyStyle: { padding: 0 },
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
  }, [handleViewInvoiceDetail, handleViewFile, handleViewInvoiceFile, primaryKey]);


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