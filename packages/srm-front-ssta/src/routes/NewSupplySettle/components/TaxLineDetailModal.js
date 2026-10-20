import React, { useMemo, Fragment, useContext, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, DataSet, Attachment, Button } from 'choerodon-ui/pro';
import { Content } from 'components/Page';
import { Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import { taxLineDetailDS, taxFormDetailDs } from '@/stores/NewSupplySettleDS';
import Styles from '@/routes/common.less';
import CommonForm from './CommonForm';
import { Store } from '../Detail/StoreProvider';
import { previewFile } from '@/utils/utils';

const customizeUnitCodes = {
  basic: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_BASIC', // 销售方结算单详情-开票-税务发票-查看-基本信息
  purchase: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_PURCHASE', // 销售方结算单详情-开票-税务发票-查看-购方信息
  supply: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_SUPPLY', // 销售方结算单详情-开票-税务发票-查看-销方信息
  other: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_OTHER', // 销售方结算单详情-开票-税务发票-查看-其他信息
  file: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_FILE', // 销售方结算单详情-开票-税务发票-查看-文件信息
};

const otherCustomizeUnitCodes = {
  line: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.VIEW_LINE', // 销售方结算单详情-开票-税务发票-查看-发票行
};

const TaxLineDetailModal = (props) => {
  const { taxInvoiceHeaderId } = props;
  const { customizeTable, customizeForm, remoteProps, settleHeaderDs } = useContext(Store);

  const titleMap = useMemo(
    () => ({
      basic: intl.get(`ssta.supplySettle.view.message.panel.baseInfos`).d('基本信息'),
      purchase: intl.get(`ssta.supplySettle.view.message.panel.purchaseInfos`).d('购方信息'),
      supply: intl.get(`ssta.supplySettle.view.message.panel.supplyInfos`).d('销方信息'),
      other: intl.get(`ssta.supplySettle.view.message.panel.otherInfos`).d('其他信息'),
      file: intl.get(`ssta.common.view.title.fileInfo`).d('文件信息'),
    }),
    []
  );

  const taxLineDS = useMemo(
    () =>
      new DataSet(
        taxLineDetailDS({ taxInvoiceHeaderId, customizeUnitCode: otherCustomizeUnitCodes.line })
      ),
    [taxInvoiceHeaderId]
  );

  const taxFormDetailDS = useMemo(
    () =>
      new DataSet(
        taxFormDetailDs({
          taxInvoiceHeaderId,
          customizeUnitCode: Object.values(customizeUnitCodes).join(),
        })
      ),
    [taxInvoiceHeaderId]
  );

  const aiAttachmentUrl = taxFormDetailDS.current?.get('aiAttachmentUrl');

  const columns = useMemo(() => {
    const normalColumns = [
      {
        width: 150,
        name: 'taxInvoiceLineNum',
      },
      {
        width: 150,
        name: 'itemCode',
      },
      {
        width: 150,
        name: 'itemName',
      },
      {
        width: 150,
        name: 'specificationsModel',
      },
      {
        width: 150,
        name: 'uom',
      },
      {
        width: 150,
        name: 'quantity',
      },
      {
        width: 150,
        name: 'netPrice',
      },
      {
        width: 150,
        name: 'netAmount',
      },
      {
        width: 150,
        name: 'taxIncludedAmount',
      },
      {
        width: 150,
        name: 'taxRate',
      },
      {
        width: 150,
        name: 'taxAmount',
      },
      {
        width: 150,
        name: 'plateNo',
      },
      {
        width: 150,
        name: 'trafficType',
      },
      {
        width: 150,
        name: 'trafficDateStart',
      },
      {
        width: 150,
        name: 'trafficDateEnd',
      },
    ];
    const processColumns = remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_TAX_INVOICE_VIEW_COLUMNS', normalColumns, {
          settleHeaderDs,
          taxFormDetailDS,
        })
      : normalColumns;
    return processColumns;
  }, [remoteProps, settleHeaderDs, taxFormDetailDS]);
  const basicColumns = useMemo(
    () => [
      'invoiceCode',
      'invoiceNumber',
      'invoicingDate',
      'invoiceSpeciesMeaning',
      'sumCheckTimes',
      'checkTimes',
      'checkCode',
      'netAmount',
      'taxAmount',
      'taxIncludedAmount',
    ],
    []
  );
  const purchaseColumns = useMemo(
    () => ['companyName', 'purUnifiedSocialCode', 'purAccount', 'purAddrAndTel'],
    []
  );
  const supplyColumns = useMemo(
    () => ['supplierCompanyName', 'supUnifiedSocialCode', 'supAccount', 'supAddrAndTel'],
    []
  );
  const otherColumns = useMemo(
    () => [
      'drawer',
      'payee',
      'reviewer',
      'remark',
      'tollFlag',
      'invalidFlagMeaning',
      'invoiceSpecialMark',
      'machineNum',
      'buyerContact',
      'sellerContact',
      'beneficiaryBank',
      'beneficiaryBankAddress',
      'beneficiaryAccountNum',
      'beneficiaryAccountName',
      'paymentTerms',
    ],
    []
  );
  const handleViewOfdFile = useCallback((jpgUrl, record) => {
    const { sourceCode, ofdFileUrl } = record?.get(['sourceCode', 'ofdFileUrl']) || {};
    if (ofdFileUrl && sourceCode == 'DIRECT_INVOICE') {
      const linkDom = document.createElement('a');
      linkDom.href = ofdFileUrl;
      linkDom.target = '_blank';
      linkDom.click();
      return;
    }
    return previewFile(jpgUrl, { originFileUrl: ofdFileUrl });
  }, []);
  const fileColumns = useMemo(
    () => [
      'invoiceUrl',
      {
        name: 'jpgUrl',
        renderer: ({ value, record }) => {
          const originFileUrl = record?.get('ofdFileUrl');
          return (
            (value || originFileUrl) && (
              <Button funcType="link" onClick={() => handleViewOfdFile(value, record)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </Button>
            )
          );
        },
      },
      'xmlSourceFileUrl',
      {
        name: 'ocrFileUrl',
        renderer: ({ value }) => {
          return (
            value && (
              <Button funcType="link" onClick={() => previewFile(value)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </Button>
            )
          );
        },
      },
      aiAttachmentUrl && {
        name: 'aiAttachmentUrl',
        renderer: ({ value }) => {
          return (
            value && (
              <Button funcType="link" onClick={() => previewFile(value)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </Button>
            )
          );
        },
      },
      { name: 'attachmentUuid', editor: Attachment },
    ],
    [aiAttachmentUrl, handleViewOfdFile]
  );
  const headerColumns = useMemo(
    () => ({
      basic: basicColumns,
      purchase: purchaseColumns,
      supply: supplyColumns,
      other: otherColumns,
      file: fileColumns,
    }),
    [basicColumns, purchaseColumns, supplyColumns, otherColumns, fileColumns]
  );

  const cardList = useMemo(
    () =>
      Object.entries(titleMap).map(([key, value]) => {
        return {
          title: value,
          content: (
            <CommonForm
              dataSet={taxFormDetailDS}
              editorColumns={headerColumns[key]}
              customizeForm={customizeForm}
              customizeCode={customizeUnitCodes[key]}
            />
          ),
        };
      }),
    [titleMap, taxFormDetailDS, customizeForm, headerColumns]
  );

  return (
    <Fragment>
      <div className={`${Styles['ssta-detail-content']} ${Styles['ssta-detail-modal-content']}`}>
        <Content>
          <h3 className="ssta-form-title">
            {intl.get(`ssta.costSheet.view.message.panel.headerInfos`).d('发票头信息')}
          </h3>
          {cardList.map((item) => {
            const { title, content } = item;
            return (
              <Card bordered={false} className={DETAIL_CARD_CLASSNAME} title={title}>
                {content}
              </Card>
            );
          })}
        </Content>
        <Content wrapperClassName="ssta-last-page-content-wrapper">
          <h3 className="ssta-form-title">
            {intl.get(`ssta.invoiceSheet.view.message.panel.transactiossnDetails`).d('发票行信息')}
          </h3>
          {customizeTable(
            { code: otherCustomizeUnitCodes.line },
            <Table columns={columns} dataSet={taxLineDS} style={{ maxHeight: 430 }} />
          )}
        </Content>
      </div>
    </Fragment>
  );
};

export default observer(TaxLineDetailModal);
