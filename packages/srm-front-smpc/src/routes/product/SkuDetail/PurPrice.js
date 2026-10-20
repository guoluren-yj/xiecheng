import React, { useMemo } from 'react';
import { Tag, Tooltip } from 'choerodon-ui';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import useRuleConfig from '@/hooks/useRuleConfig';
import { getCustDimColumns, rendererLovDimension } from '@/utils/customDimension';
import { openLadderPrice } from '../SkuWorkbench/drawers';
import { precisionRender } from '../utilsApi/precision';
import customStore from './customStore';

export default function PurPrice(props) {
  const { id, title, dataSet, isSup, skuList, skuId, remote } = props;
  const [custDimensions] = useRuleConfig({ code: 'custDimensions', defaultValue: [] });
  const { customizeTable } = customStore.getCustFuncs();
  const isReceive = customStore.getState('isReceive');
  const skuType = useMemo(() => skuList?.find((s) => s.skuId === skuId)?.skuType, [skuList, skuId]);

  function handleViewLadders(record) {
    const ladders = record.get('skuSalesLadders') || [];
    openLadderPrice({
      data: ladders,
      readOnly: true,
      title: intl.get('smpc.product.model.viewLadderPrice').d('查看阶梯价格'),
    });
  }

  const columns = useMemo(() => {
    const custDimColumns = !isReceive
      ? getCustDimColumns(dataSet, custDimensions, { readOnly: true, sort: 170 })
      : [];
    return [
      {
        name: 'skuPriceStatusMeaning',
        width: 130,
        tooltip: 'none',
        show: !isReceive,
        renderer: ({ value, record }) => {
          const status = record.get('skuPriceStatus');
          const colors = {
            NEW: 'orange',
            WAITING_VALID: 'orange',
            WAITING_APPROVE: 'orange',
            VALID: 'green',
            INVALID: 'gray',
            VALID_ERROR: 'red',
          };
          return (
            <Tag color={colors[status] || 'gray'} style={{ border: 'none' }}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'shelfErrorMessageMeaning',
        width: 130,
        show: !isReceive,
      },
      {
        name: 'uomLov',
        width: 140,
        renderer: ({ record }) => record.get('uomName'),
      },
      {
        name: 'taxLov',
        width: 140,
        renderer: ({ record }) => {
          const { tax, taxRate } = record.get(['tax', 'taxRate']);
          const _tax = tax ?? taxRate;
          const taxIsNumber = typeof _tax === 'number'; // 是一个数字
          const taxIsStrNumber = typeof _tax === 'string' && !isNaN(Number(_tax)); // 是一个字符串数字
          return taxIsNumber || taxIsStrNumber ? Number(_tax) : _tax;
        },
      },
      {
        name: 'currencyLov',
        width: 140,
        renderer: ({ record }) => record.get('currencyName'),
      },
      {
        name: 'agreementTaxedPrice',
        width: 120,
        renderer: precisionRender,
      },
      {
        name: 'agreementPrice',
        width: 120,
        renderer: precisionRender,
      },
      {
        name: 'priceBatchQuantity',
        width: 120,
        show: !isReceive,
      },
      {
        name: 'priceType',
        width: 120,
        show: !isReceive,
        renderer: ({ record }) => record.get('priceTypeMeaning'),
      },
      {
        name: 'skuSalesLadders',
        width: 120,
        show: !isReceive,
        renderer: ({ record }) =>
          record.get('priceType') === 'LADDER_PRICE' ? (
            <a onClick={() => handleViewLadders(record)}>
              {intl.get('smpc.product.model.viewLadderPrice').d('查看阶梯价格')}
            </a>
          ) : (
            '-'
          ),
      },
      {
        name: 'priceHiddenFlag',
        width: 150,
        show: !isReceive,
        renderer: ({ record }) => record.get('priceHiddenFlagMeaning'),
      },
      {
        name: 'validDate',
        width: 240,
        show: !isReceive,
      },
      {
        name: 'freightLov',
        width: 140,
        show: !isReceive,
        renderer: ({ record }) =>
          record.get('freeShippingFlag') === 1
            ? intl.get('small.common.view.free').d('包邮')
            : record.get('shippingRuleName'),
      },
      {
        name: 'installLov',
        width: 140,
        show: !isReceive,
        renderer: ({ record }) => record.get('installName'),
      },
      {
        name: 'orderQuantity',
        width: 120,
        show: !isReceive,
        renderer: precisionRender,
      },
      {
        name: 'minPackageQuantity',
        width: 130,
        show: !isReceive,
        renderer: precisionRender,
      },
      {
        name: 'skuSalesRegions',
        width: 150,
        show: !isReceive,
        renderer: ({ record }) => {
          const { allRegionFlag, skuSalesRegions } = record.get([
            'allRegionFlag',
            'skuSalesRegions',
          ]);
          const regions = skuSalesRegions || [];
          const regionColumns = [
            {
              name: 'regionCode',
              header: intl.get('smpc.product.view.regionCode').d('区域编码'),
            },
            {
              name: 'regionName',
              header: intl.get('smpc.product.view.regionName').d('区域名称'),
              renderer: ({ value, record: r }) => {
                const valid = r.get('regionEnableFlag') === 0; // 失效
                return (
                  <Tooltip
                    title={
                      valid
                        ? intl
                            .get('smpc.product.model.skuSalesRegions.validator')
                            .d('地址库已升级，该地址已经不存在，请重新编辑。')
                        : ''
                    }
                  >
                    <span style={{ color: valid ? 'red' : '#000' }}>{value}</span>
                  </Tooltip>
                );
              },
            },
          ];
          return rendererLovDimension({
            title: intl.get('smpc.product.model.postRegion').d('送货区域'),
            isAll: () => allRegionFlag === 1,
            allText: intl.get('smpc.product.model.allRegion').d('所有区域'),
            data: regions,
            columns: regionColumns,
            textField: 'regionName',
          });
        },
      },
      {
        name: 'skuSalesUnits',
        width: 150,
        show: !isReceive,
        renderer: ({ record }) => {
          const { allUnitFlag, skuSalesUnits } = record.get(['allUnitFlag', 'skuSalesUnits']);
          const units = skuSalesUnits || [];
          const orgColumns = [
            {
              name: 'unitCode',
              header: intl.get('smpc.product.view.unitCode').d('组织编码'),
            },
            {
              name: 'unitName',
              header: intl.get('smpc.product.view.unitName').d('组织名称'),
            },
          ];
          const { unitCode, unitName } = units[0] || {};
          return rendererLovDimension({
            title: intl.get('smpc.product.model.buyOrg').d('可采买组织'),
            isAll: () => allUnitFlag === 1,
            allText: intl.get('smpc.product.model.allOrg').d('所有组织'),
            data: units,
            columns: orgColumns,
            text: `${unitCode || ''}-${unitName || ''}`,
          });
        },
      },
      {
        name: 'priceSourceFromNum',
        width: 130,
      },
      {
        name: 'priceSourceFromLnNum',
        width: 130,
      },
      ...custDimColumns,
      {
        name: 'priceLibNumber',
        width: 150,
        show: !isSup && !isReceive,
        header: intl.get('smpc.product.view.useProceLinNum').d('引用价格库编码'),
      },
      {
        name: 'deliveryDay',
        width: 120,
        show: !isReceive,
      },
      {
        name: 'guaranteeDay',
        width: 120,
        show: !isReceive,
      },
      {
        name: 'remarkMeaning',
        width: 100,
        show: !isReceive,
      },
    ].filter((f) => f.show || !('show' in f));
  }, [custDimensions, dataSet, isReceive]);
  const newAllColumns = remote
    ? remote?.process('SMPC_SKU_WORKBENCH_DETAIL_PUR_PRICE_TABLE_COLUMNS', columns, {
        isSup,
        skuType,
      })
    : columns;
  return (
    <div className="pur-price-wrapper" id={id}>
      <div className="sku-card-title">{title}</div>
      {isReceive ? (
        <Table
          dataSet={dataSet}
          columns={columns}
          style={{ maxHeight: 430 }}
          customizedCode="receive.price.list"
        />
      ) : (
        customizeTable(
          { code: customStore.getCustomCode('PRICE_INFO') },
          <Table dataSet={dataSet} columns={newAllColumns} style={{ maxHeight: 430 }} />
        )
      )}
    </div>
  );
}
