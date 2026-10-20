import React from 'react';
import intl from 'utils/intl';
import { precisionRender } from '@/utils/precision';
import { openPriceInfo, openLadderPrice } from './openPrices';

export function unitColumns() {
  return [
    {
      name: 'unitCode',
      header: intl.get('sagm.common.view.organization.code').d('组织编码'),
    },
    {
      name: 'unitName',
      header: intl.get('sagm.common.view.organization.name').d('组织名称'),
    },
  ];
}
export function categoryColumns() {
  return [
    {
      name: 'code',
      header: intl.get('sagm.common.view.category.code').d('分类编码'),
    },
    {
      name: 'name',
      header: intl.get('sagm.common.view.category.name').d('分类名称'),
    },
  ];
}
export function directoryColumns() {
  return [
    {
      name: 'code',
      header: intl.get('sagm.common.view.directory.code').d('目录编码'),
    },
    {
      name: 'name',
      header: intl.get('sagm.common.view.directory.name').d('目录名称'),
    },
  ];
}
export function supplierColumns() {
  return [
    {
      name: 'supplierCompanyNum',
      header: intl.get('sagm.common.view.suplier.code').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      header: intl.get('sagm.common.view.suplier.name').d('供应商名称'),
    },
  ];
}

function rendererPrices({ record, name }) {
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
}
export function skuColumns() {
  return [
    {
      name: 'supplierCompanyName',
      minWidth: 120,
      header: intl.get('sagm.common.model.supplier').d('供应商'),
    },
    {
      name: 'skuCode',
      width: 120,
      header: intl.get('sagm.common.model.productCode').d('商品编码'),
    },
    {
      name: 'skuName',
      minWidth: 200,
      header: intl.get('sagm.common.model.productName').d('商品名称'),
    },
    {
      name: 'categoryName',
      width: 120,
      header: intl.get('sagm.common.model.plateformCategory').d('平台分类'),
    },
    {
      name: 'uomName',
      width: 80,
      header: intl.get('sagm.common.model.uom').d('单位'),
      renderer: ({ record }) => {
        const priceList = record.get('productPoolList') || [];
        const { uomName } = priceList[0] || {};

        return priceList.length > 1 ? undefined : uomName;
      },
    },
    {
      name: 'nakedPrice',
      width: 120,
      header: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
      align: 'right',
      renderer: rendererPrices,
    },
    {
      name: 'agreementPrice',
      width: 120,
      align: 'right',
      header: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
      renderer: rendererPrices,
    },
  ];
}
