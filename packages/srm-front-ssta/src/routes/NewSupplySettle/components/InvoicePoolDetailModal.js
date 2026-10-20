import React, { useMemo, Fragment, useContext } from 'react';
import { useDataSet, Table } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { compose } from 'lodash';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import { invPoolHeaderDS, invPoolLineDS } from '@/stores/NewSupplySettleDS';
import Styles from '@/routes/common.less';
import CommonForm from './CommonForm';
import { Store } from '../Detail/StoreProvider';

const customizeUnitCodes = {
  basic: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.BASIC', // 销售方结算单详情-开票-税务发票-选择发票池-查看-基本信息
  purchase: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.PURCHASE', // 销售方结算单详情-开票-税务发票-选择发票池-查看-购方信息
  supply: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.SUPPLY', // 销售方结算单详情-开票-税务发票-选择发票池-查看-销方信息
  other: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.OTHER', // 销售方结算单详情-开票-税务发票-选择发票池-查看-其他信息
};

const otherCustomizeUnitCodes = {
  line: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.POOL_VIEW.NEWLINE', // 销售方结算单详情-开票-税务发票-选择发票池-查看-发票行
};

const InvoicePoolDetailModal = ({ invoiceHeaderId }) => {
  const { customizeTable, customizeForm } = useContext(Store);
  const titleMap = {
    basic: intl.get(`ssta.supplySettle.view.message.panel.baseInfos`).d('基本信息'),
    purchase: intl.get(`ssta.supplySettle.view.message.panel.purchaseInfos`).d('购方信息'),
    supply: intl.get(`ssta.supplySettle.view.message.panel.supplyInfos`).d('销方信息'),
    other: intl.get(`ssta.supplySettle.view.message.panel.otherInfos`).d('其他信息'),
  };
  const invPoolHeaderDs = useDataSet(
    () =>
      invPoolHeaderDS({
        invoiceHeaderId,
        customizeUnitCode: Object.values(customizeUnitCodes).join(),
      }),
    [invoiceHeaderId]
  );
  const invPoolLineDs = useDataSet(
    () => invPoolLineDS({ invoiceHeaderId, customizeUnitCode: otherCustomizeUnitCodes.line }),
    [invoiceHeaderId]
  );

  const listColumns = useMemo(
    () => [
      {
        name: 'lineNum',
        width: 120,
      },
      {
        name: 'itemName',
        width: 240,
      },
      {
        name: 'netAmount',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'taxRate',
        width: 150,
      },
      {
        name: 'taxAmount',
        width: 150,
      },
      {
        name: 'taxIncludedPrice',
        width: 150,
      },
      {
        name: 'taxIncludedAmount;',
        width: 150,
      },
      {
        name: 'netPrice',
        width: 150,
      },
      {
        name: 'spec',
        width: 150,
      },
      {
        name: 'uom',
        width: 150,
      },
      // {
      //   name: 'expenseItem',
      //   width: 150,
      // },
      {
        name: 'plateNo',
        width: 150,
      },
      {
        name: 'trafficType',
        width: 150,
      },
      {
        name: 'trafficDateStart',
        width: 150,
      },
      {
        name: 'trafficDateEnd',
        width: 150,
      },
    ],
    []
  );

  const basicColumns = [
    'invoiceCode',
    'invoiceNum',
    'invoicingDate',
    'invoiceTypeMeaning',
    'sumCheckTimes',
    'checkTimes',
    'checkCode',
    'netAmount',
    'taxAmount',
    'taxIncludedAmount',
  ];
  const purchaseColumns = ['companyName', 'purUnifiedSocialCode', 'purAccount', 'purAddrAndTel'];
  const supplyColumns = [
    'supplierCompanyName',
    'supUnifiedSocialCode',
    'supAccount',
    'supAddrAndTel',
  ];
  const otherColumns = [
    'drawer',
    'payee',
    'reviewer',
    'remark',
    'fileUrl',
    'tollFlag',
    'invalidFlagMeaning',
    'invoiceSpecialMark',
    'machineNum',
  ];
  const headerColumns = {
    basic: basicColumns,
    purchase: purchaseColumns,
    supply: supplyColumns,
    other: otherColumns,
  };

  const cardList = Object.entries(titleMap).map(([key, value]) => {
    return {
      title: value,
      content: (
        <CommonForm
          dataSet={invPoolHeaderDs}
          editorColumns={headerColumns[key]}
          customizeForm={customizeForm}
          customizeCode={customizeUnitCodes[key]}
        />
      ),
    };
  });

  return (
    <Fragment>
      <div
        className={Styles['ssta-detail-content']}
        style={{ marginBottom: '0px', paddingBottom: 10 }}
      >
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
            <Table columns={listColumns} dataSet={invPoolLineDs} style={{ maxHeight: 430 }} />
          )}
        </Content>
      </div>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.invoiceSheet',
      'ssta.costSheet',
      'entity.attachment',
      'ssta.settlePool',
      'sbud.budgeting',
      'hzero.common',
      'ssta.supplySettle',
    ],
  })
)(InvoicePoolDetailModal);
