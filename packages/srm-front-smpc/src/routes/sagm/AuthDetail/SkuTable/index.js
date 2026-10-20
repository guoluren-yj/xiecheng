import React, { Component } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { precisionRender } from '@/routes/product/utilsApi/precision';
import { openSkuDetail } from '@/utils/openCommonTab';
import { openPriceInfo, openLadderPrice } from './openPrices';

const tableDs = (url, initParams) => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    { name: 'supplierCompanyName', label: intl.get('sagm.common.model.supplier').d('供应商') },
    { name: 'skuCode', label: intl.get('sagm.common.model.productCode').d('商品编码') },
    { name: 'skuName', label: intl.get('sagm.common.model.productName').d('商品名称') },
    { name: 'categoryName', label: intl.get('sagm.common.model.plateformCategory').d('平台分类') },
    { name: 'catalogName', label: intl.get('sagm.common.model.catalog').d('目录') },
    {
      name: 'agreementPrice',
      type: 'number',
      label: intl.get('sagm.common.model.taxPrice').d('单价（含税）'),
    },
    {
      name: 'nakedPrice',
      type: 'number',
      label: intl.get('sagm.common.model.noTaxPrice').d('单价（不含税）'),
    },
    { name: 'uomName', label: intl.get('sagm.common.model.uom').d('单位') },
    { name: 'agreementNumber', label: intl.get('sagm.common.model.agreementNum').d('协议号') },
    {
      name: 'agreementLineNumber',
      label: intl.get('sagm.common.model.lineNumber').d('行号'),
      type: 'number',
    },
    { name: 'option', label: intl.get('hzero.common.action').d('操作') },
  ],
  transport: {
    read({ data }) {
      const { filterParams = {} } = data;
      return {
        url,
        method: 'GET',
        data: { ...filterParams, ...initParams },
      };
    },
  },
});

export default class Transfer extends Component {
  constructor(props) {
    super(props);
    const { url, params } = props;
    this.skuAssignDs = new DataSet(tableDs(url, params));
  }

  handleViewSku = (record) => {
    const { backPath } = this.props;
    openSkuDetail({
      record,
      backPath,
      type: backPath?.includes('-sup') ? 'sup' : 'pur',
    });
  };

  rendererPrices = ({ name, record }) => {
    const priceList = record.get('productPoolList') || [];
    const priceInfo = priceList[0] || {};
    // 价格信息不为一或者为类型为阶梯价格，未税单价不展示
    if (name !== 'nakedPrice' && (priceList.length !== 1 || priceInfo.ladderEnableFlag)) {
      return undefined;
    }
    // 价格信息小于二，同时类型不为阶梯价格
    if (priceList.length < 2 && !priceInfo.ladderEnableFlag) {
      return precisionRender({ name, recordData: priceInfo });
    } else if (priceList.length < 2 && priceInfo.ladderEnableFlag) {
      return (
        <a onClick={() => openLadderPrice(priceInfo.productPoolLadderList)}>
          {intl.get('sagm.common.model.ladderPrice').d('阶梯价格')}
        </a>
      );
    }
    return (
      <a onClick={() => openPriceInfo(priceList)}>
        {intl.get('sagm.common.model.priceInfo').d('价格信息')}
      </a>
    );
  };

  renderAgreementLineOrNumber = ({ record }) => {
    const priceList = record.get('productPoolList') || [];
    const { agreementNumber = '', agreementLineNumber = '' } = priceList[0] || {};
    return priceList.length > 1 ? '-' : `${agreementNumber}-${agreementLineNumber}`;
  };

  getColumns = () => {
    const columns = [
      {
        name: 'skuCode',
        width: 120,
        renderer: ({ record: r, text }) => {
          const sourceFrom = r.get('sourceFrom');
          return sourceFrom === 'EC' ? (
            text
          ) : (
            <Button funcType="link" onClick={() => this.handleViewSku(r)}>
              {text}
            </Button>
          );
        },
      },
      {
        name: 'skuName',
        minWidth: 130,
      },
      { name: 'categoryName', width: 120 },
      {
        name: 'catalogName',
        width: 150,
        label: intl.get('sagm.common.model.catalog').d('目录'),
        tooltip: 'overflow',
      },
      {
        name: 'uomName',
        width: 80,
        renderer: ({ record }) => {
          const priceList = record.get('productPoolList') || [];
          const { uomName } = priceList[0] || {};

          return priceList.length > 1 ? undefined : uomName;
        },
      },
      { name: 'nakedPrice', width: 120, renderer: this.rendererPrices },
      { name: 'agreementPrice', width: 120, renderer: this.rendererPrices },
      {
        name: 'agreementNumber',
        width: 150,
        title: intl.get('sagm.common.model.agreementNumAndLine').d('协议号-行号'),
        renderer: this.renderAgreementLineOrNumber,
      },
    ];
    return columns.filter((f) => f.show !== false);
  };

  render() {
    const columns = this.getColumns();

    return (
      <Table
        dataSet={this.skuAssignDs}
        columns={columns}
        customizedCode="SKU_TRANSFER.READ.LIST"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      />
    );
  }
}
