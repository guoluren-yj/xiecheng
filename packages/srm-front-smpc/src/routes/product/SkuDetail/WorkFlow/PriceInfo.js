import React, { useMemo, useContext, useEffect } from 'react';
import { Tag, Tooltip } from 'choerodon-ui';
import { Table, DataSet } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import { Content } from 'components/Page';

import useRuleConfig from '@/hooks/useRuleConfig';
import { getCustDimColumns, rendererLovDimension } from '@/utils/customDimension';
import { openLadderPrice } from '../../SkuWorkbench/drawers';
import { precisionRender } from '../../utilsApi/precision';
import customStore from '../customStore';
import { renderFlowCompare } from '../renderCompare';
import SkuContext from '../skuContext';
import { saleInfoDs } from '../ds';

export default function PriceInfo(props) {
  const { title, dataSet, isSup, changeFlag } = props;
  const updateDataSet = new DataSet(saleInfoDs());
  const [custDimensions] = useRuleConfig({ code: 'custDimensions', defaultValue: [] });
  const { customizeTable } = customStore.getCustFuncs();
  const { onlyShowUpdateItem } = useContext(SkuContext);

  useEffect(() => {
    const prices = dataSet
      .filter((r) => r.get('approveChangeType') !== 'UNCHANGED')
      .map((m) => m.toData());
    updateDataSet.loadData(prices);
  }, [onlyShowUpdateItem]);

  function handleViewLadders(record) {
    const ladders = record.get('skuSalesLadders') || [];
    openLadderPrice({
      data: ladders,
      readOnly: true,
      title: intl.get('smpc.product.model.viewLadderPrice').d('查看阶梯价格'),
    });
  }

  const valueRender = ({ record, name, value, customValue, ...others }) => {
    if (changeFlag) {
      if (record.get('approveChangeType') === 'NEW') {
        return <div style={{ color: '#E64322' }}>{value}</div>;
      }
      return renderFlowCompare({
        value,
        name,
        keyList: record.get('changeFields'),
        getLastVersionValue() {
          if (customValue && isFunction(customValue)) {
            return customValue(record.get('formSalesInfo') || {});
          }
          return (record.get('formSalesInfo') || {})[name];
        },
        ...others,
      });
    }
    return value;
  };

  const columns = useMemo(() => {
    const custDimColumns = getCustDimColumns(dataSet, custDimensions, {
      readOnly: true,
      sort: 170,
    });
    return [
      {
        name: 'approveChangeType',
        title: intl.get('smpc.product.model.updateType').d('变更类型'),
        show: changeFlag,
        width: 110,
        renderer: ({ value, record }) => {
          // 未变更、 变更、 新增
          const approveChangeTypeMeaning = record.get('approveChangeTypeMeaning');
          const colors = {
            CHANGE: 'orange',
            NEW: 'green',
            UNCHANGED: 'gray',
          };
          return (
            <Tag color={colors[value] || 'gray'} border={false}>
              {approveChangeTypeMeaning}
            </Tag>
          );
        },
      },
      {
        name: 'skuPriceStatusMeaning',
        width: 120,
        tooltip: 'none',
        renderer: ({ value, record }) => {
          const status = record.get('skuPriceStatus');
          const colors = {
            NEW: 'yellow',
            WAITING_VALID: 'yellow',
            WAITING_APPROVE: 'yellow',
            WORKFLOW_WAITING: 'yellow',
            WAITING: 'yellow',
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
        width: 110,
        renderer(param) {
          const { record, name } = param;
          return valueRender({
            record,
            name,
            value: precisionRender(param),
            placement: 'topRight',
          });
        },
      },
      {
        name: 'agreementPrice',
        width: 120,
        renderer(param) {
          const { record, name } = param;
          return valueRender({
            record,
            name,
            value: precisionRender(param),
            placement: 'topRight',
          });
        },
      },
      {
        name: 'uomLov',
        width: 140,
        renderer({ record }) {
          return valueRender({
            record,
            name: 'uomId',
            value: record.get('uomName'),
            customValue: (data) => data.uomName,
          });
        },
      },
      {
        name: 'taxLov',
        width: 70,
        renderer: ({ record }) => {
          const { tax, taxRate } = record.get(['tax', 'taxRate']);
          const _tax = tax ?? taxRate;
          const taxIsNumber = typeof _tax === 'number'; // 是一个数字
          const taxIsStrNumber = typeof _tax === 'string' && !isNaN(Number(_tax)); // 是一个字符串数字
          const value = taxIsNumber || taxIsStrNumber ? Number(_tax) : _tax;
          return valueRender({
            record,
            name: 'taxId',
            value,
            customValue: (data) => data.tax,
            placement: 'topRight',
          });
        },
      },
      {
        name: 'currencyLov',
        width: 100,
        renderer({ record }) {
          return valueRender({
            record,
            name: 'currencyName',
            value: record.get('currencyName'),
            customValue: (data) => data.currencyName,
          });
        },
      },
      {
        name: 'priceBatchQuantity',
        width: 120,
        renderer(param) {
          return valueRender({ ...param, placement: 'topRight' });
        },
      },
      {
        name: 'priceType',
        width: 120,
        renderer({ record }) {
          return valueRender({
            record,
            name: 'priceTypeMeaning',
            value: record.get('priceTypeMeaning'),
            customValue: (data) => data.priceTypeMeaning,
          });
        },
      },
      {
        name: 'skuSalesLadders',
        width: 120,
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
        renderer: ({ record }) => record.get('priceHiddenFlagMeaning'),
      },
      {
        name: 'validDateField',
        title: intl.get('smpc.product.model.validDate').d('有效期'),
        width: 240,
        renderer({ record }) {
          const { validDateFrom, validDateTo } = record.get(['validDateFrom', 'validDateTo']);
          const value = `${validDateFrom ? validDateFrom.format('YYYY-MM-DD') : '-'} ~ ${
            validDateTo ? validDateTo.format('YYYY-MM-DD') : '-'
          }`;
          return valueRender({
            record,
            names: ['validDateFrom', 'validDateTo'],
            value,
            customValue(data) {
              return `${data.validDateFrom || '-'} ~ ${data.validDateTo || '-'}`;
            },
          });
        },
      },
      {
        name: 'freightLov',
        width: 80,
        renderer({ record }) {
          const value =
            record.get('freeShippingFlag') === 1
              ? intl.get('small.common.view.free').d('包邮')
              : record.get('shippingRuleName');
          return valueRender({
            record,
            names: ['shippingRuleName', 'freeShippingFlag'],
            value,
            customValue: (data) =>
              data.freeShippingFlag === 1
                ? intl.get('small.common.view.free').d('包邮')
                : data.shippingRuleName,
          });
        },
      },
      {
        name: 'installLov',
        width: 80,
        renderer({ record }) {
          return valueRender({
            record,
            name: 'installId',
            value: record.get('installName') || '-',
            customValue: (data) => data.installName,
          });
        },
      },
      {
        name: 'orderQuantity',
        width: 80,
        renderer(param) {
          const { record, name } = param;
          return valueRender({
            record,
            name,
            value: precisionRender(param),
            placement: 'topRight',
          });
        },
      },
      {
        name: 'minPackageQuantity',
        width: 90,
        renderer(param) {
          const { record, name } = param;
          return valueRender({
            record,
            name,
            value: precisionRender(param),
            placement: 'topRight',
          });
        },
      },
      {
        name: 'skuSalesRegions',
        width: 100,
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
            names: ['allRegionFlag'],
            keyList: record.get('changeFields'),
            createLine: changeFlag && record.get('approveChangeType') === 'NEW',
            getOldValue: () => {
              const data = record.get('formSalesInfo') || {};
              return data.allRegionFlag === 1
                ? intl.get('smpc.product.model.allRegion').d('所有区域')
                : (data.skuSalesRegions || [])[0]?.regionName;
            },
          });
        },
      },
      {
        name: 'skuSalesUnits',
        width: 100,
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
            names: ['allUnitFlag'],
            keyList: record.get('changeFields'),
            createLine: changeFlag && record.get('approveChangeType') === 'NEW',
            getOldValue: () => {
              const data = record.get('formSalesInfo') || {};
              return data.allUnitFlag === 1
                ? intl.get('smpc.product.model.allOrg').d('所有组织')
                : (data.skuSalesUnits || [])[0]?.unitName;
            },
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
        show: !isSup,
        header: intl.get('smpc.product.view.useProceLinNum').d('引用价格库编码'),
      },
      {
        name: 'deliveryDay',
        width: 120,
        renderer(param) {
          return valueRender({ ...param, placement: 'topRight' });
        },
      },
      {
        name: 'guaranteeDay',
        width: 120,
        renderer(param) {
          return valueRender({ ...param, placement: 'topRight' });
        },
      },
      {
        name: 'remarkMeaning',
        width: 100,
        renderer(param) {
          return valueRender({ ...param });
        },
      },
    ].filter((f) => f.show || !('show' in f));
  }, [custDimensions, dataSet.length, changeFlag, updateDataSet.length]);
  return (
    <Content>
      <div className="pur-price-wrapper">
        <div className="sku-card-title">{title}</div>
        {customizeTable(
          { code: customStore.getCustomCode('WORKFLOW_PRICE_INFO') },
          <Table
            dataSet={onlyShowUpdateItem ? updateDataSet : dataSet}
            columns={columns}
            style={{ maxHeight: 430 }}
          />
        )}
      </div>
    </Content>
  );
}
