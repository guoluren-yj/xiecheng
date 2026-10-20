import React, { useMemo, useEffect } from 'react';
import { Tag, Tooltip } from 'choerodon-ui';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import useRuleConfig from '@/hooks/useRuleConfig';
import { getCustDimColumns, rendererLovDimension } from '@/utils/customDimension';
import { Content } from 'components/Page';
import { precisionRender } from '../utilsApi/precision';
import customStore from './customStore';
import { saleInfoDs } from '../SkuDetail/ds';

export default function PriceInfo(props) {
  const { id, title, sku } = props;
  const { sourceFrom, marketPrice } = sku || {};
  const [custDimensions] = useRuleConfig({ code: 'custDimensions', defaultValue: [] });
  const dataSet = useMemo(() => new DataSet(saleInfoDs()), []);
  const isCata = useMemo(() => sourceFrom === 'CATA', [sourceFrom]);
  const prexCode = isCata ? 'CATA' : 'EC';
  const { customizeTable } = customStore.getCustFuncs();
  const customizeCode = customStore.getCustomCode(`${prexCode}_PRICE_INFO`);

  useEffect(() => {
    const { skuSalesInfos, skuPreviewInfoDTO } = sku || {};
    dataSet.loadData(
      (isCata ? skuSalesInfos || [] : [skuPreviewInfoDTO]).map((item) => ({ marketPrice, ...item }))
    );
  }, [sku]);

  const columns = useMemo(() => {
    const custDimColumns = getCustDimColumns(dataSet, custDimensions, {
      readOnly: true,
      sort: 170,
    });

    return [
      {
        name: 'skuPriceStatusMeaning',
        width: 130,
        tooltip: 'none',
        show: isCata,
        renderer: ({ value, record }) => {
          const status = record.get('skuPriceStatus');
          const colors = {
            NEW: 'orange',
            WAITING: 'orange',
            WAITING_VALID: 'orange',
            WAITING_APPROVE: 'orange',
            WORKFLOW_WAITING: 'orange',
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
        name: 'agreementTaxedPrice',
        width: isCata ? 120 : 200,
        renderer: precisionRender,
      },
      {
        name: 'agreementPrice',
        width: isCata ? 120 : 200,
        renderer: precisionRender,
      },
      {
        name: 'marketPrice',
        width: 200,
        align: 'right',
        show: !isCata,
        renderer: precisionRender,
      },
      {
        name: 'uomLov',
        width: 140,
        show: !isCata,
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
        name: 'freightLov',
        width: 140,
        show: isCata,
        renderer: ({ record }) =>
          record.get('freeShippingFlag') === 1
            ? intl.get('small.common.view.free').d('包邮')
            : record.get('shippingRuleName'),
      },
      {
        name: 'installLov',
        width: 140,
        show: isCata,
        renderer: ({ record }) => record.get('installName'),
      },
      {
        name: 'orderQuantity',
        width: 120,
        show: isCata,
        renderer: precisionRender,
      },
      {
        name: 'minPackageQuantity',
        width: 130,
        show: isCata,
        renderer: precisionRender,
      },
      {
        name: 'skuSalesRegions',
        width: 150,
        show: isCata,
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
        show: isCata,
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
      ...custDimColumns,
    ].filter((f) => f.show || !('show' in f));
  }, [custDimensions, dataSet, sourceFrom]);

  return (
    <Content>
      <div className="pur-price-wrapper" id={id}>
        <div className="part-title">{title}</div>
        {customizeTable(
          { code: customizeCode },
          <Table dataSet={dataSet} columns={columns} style={{ maxHeight: 430 }} />
        )}
      </div>
    </Content>
  );
}
