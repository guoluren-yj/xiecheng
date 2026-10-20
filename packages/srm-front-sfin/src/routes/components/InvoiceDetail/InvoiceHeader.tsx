import React, { useMemo, useCallback, Fragment } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Attachment } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import { previewPdf } from '../../../utils/utils';
import EditorForm from '../EditorForm';
import { getCuszCode } from './type';
import type { DocType } from './storeDS';

interface InvoiceHeaderProps {
  docType: DocType,
  invoiceHeaderDs: DataSet,
  customizeForm: any,
}

const InvoiceHeader = (props: InvoiceHeaderProps) => {

  const { docType, invoiceHeaderDs, customizeForm } = props;

  const CuszCode = getCuszCode(docType);

  const handleViewFile = useCallback((fileUrl) => {
    const fA = fileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(fileUrl);
    else window.open(fileUrl);
  }, []);

  const basicColumns = useMemo(() => [
    'invoiceCode',
    'invoiceNumber',
    'billingDate',
    'invoiceTypeCodeMeaning',
    'checkCode',
    'totalAmount',
    'taxAmount',
    'taxIncludedAmount',
    <Attachment name="attachmentUuid" readOnly />,
  ], []);

  const buyerColumns = useMemo(() => [
    'companyName',
    'purUnifiedSocialCode',
    'purAccount',
    'purAddrAndTel',
  ], []);

  const sellerColumns = useMemo(() => [
    'supplierCompanyName',
    'supUnifiedSocialCode',
    'supAccount',
    'supAddrAndTel',
  ], []);

  const otherColumns = useMemo(() => [
    'drawer',
    'payee',
    'reviewer',
    'remark',
    {
      name: 'fileUrl',
      renderer: ({ value }) => value ? (
        <a onClick={() => handleViewFile(value)}>
          {intl.get('sfin.invoice.view.button.viewFile').d('查看文件')}
        </a>
      ) : null,
    },
    // 'tollFlag',
    // 'invalidFlagMeaning',
    // 'machineNum',
  ], [handleViewFile]);

  const cardList = useMemo(() => {
    return [
      {
        key: 'basic',
        title: intl.get(`sfin.invoice.view.title.basicInfo`).d('基本信息'),
        editorColumns: basicColumns,
        cuszCode: CuszCode.BasicFormCode,
      },
      {
        key: 'buyer',
        title: intl.get(`sfin.invoice.view.title.buyerInfo`).d('购方信息'),
        editorColumns: buyerColumns,
        cuszCode: CuszCode.BuyerFormCode,
      },
      {
        key: 'seller',
        title: intl.get(`sfin.invoice.view.title.sellerInfo`).d('销方信息'),
        editorColumns: sellerColumns,
        cuszCode: CuszCode.SellerFormCode,
      },
      {
        key: 'other',
        title: intl.get(`sfin.invoice.view.title.otherInfo`).d('其他信息'),
        editorColumns: otherColumns,
        cuszCode: CuszCode.OtherFormCode,
      },
    ];
  }, [CuszCode, basicColumns, buyerColumns, sellerColumns, otherColumns]);

  return (
    <Fragment>
      {cardList.map((item) => {
        const { key, title, cuszCode, editorColumns } = item;
        return (
          <Card key={key} bordered={false} className={DETAIL_CARD_CLASSNAME} title={title}>
            <EditorForm
              useWidthPercent
              columns={3}
              useColon={false}
              editorFlag={false}
              dataSet={invoiceHeaderDs}
              editorColumns={editorColumns}
              customizeForm={customizeForm}
              customizeOptions={{ code: cuszCode }}
            />
          </Card>
        );
      })}
    </Fragment>
  );
};

export default InvoiceHeader;