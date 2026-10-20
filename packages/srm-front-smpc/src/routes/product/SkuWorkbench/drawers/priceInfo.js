import React, { useMemo } from 'react';
import { Tag, Tooltip } from 'choerodon-ui';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { dateRender } from 'utils/renderer';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import useRuleConfig from '@/hooks/useRuleConfig';
import { getCustDimColumns, rendererLovDimension } from '@/utils/customDimension';
import { saleInfoDs } from './ds';
import openLadderPrice from './ladderPrice';
import openTextArea from './textArea';
import { validSales, inValidSales } from '../api';
import { precisionRender } from '../../utilsApi/precision';

const PriceInfo = (props) => {
  const { dataSet, isSup, isReceive, hiddenColumn, effectService, otherProps } = props;
  const { skuType, remote } = otherProps || {};
  const [custDimensions] = useRuleConfig({ code: 'custDimensions', defaultValue: [] });
  const renderTagColor = (status) => {
    if (
      ['NEW', 'WAITING_VALID', 'WAITING_APPROVE', 'WAITING', 'WORKFLOW_WAITING'].includes(status)
    ) {
      return 'orange';
    } else if (['VALID', 'APPROVED'].includes(status)) {
      return 'green';
    } else if (['VALID_ERROR', 'REJECT'].includes(status)) {
      return 'red';
    } else {
      return 'gray';
    }
  };

  const columns = useMemo(() => {
    const dimensionColumns =
      !isReceive && !isSup
        ? [
            {
              name: 'skuSalesRegion',
              width: 150,
              show: !isReceive,
              header: intl.get('smpc.product.model.postRegion').d('送货区域'),
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
              name: 'skuSalesUnit',
              width: 150,
              show: !isReceive,
              header: intl.get('smpc.product.model.buyOrg').d('可采买组织'),
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
            ...getCustDimColumns(dataSet, custDimensions, { readOnly: true }),
          ]
        : [];
    const allColumns = [
      {
        name: 'skuPriceStatusMeaning',
        width: 130,
        tooltip: 'none',
        renderer: ({ value, record }) => {
          const status = record.get('skuPriceStatus');
          return (
            <Tag color={renderTagColor(status)} border={false}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'shelfErrorMessageMeaning',
        width: 130,
      },
      {
        name: 'priceType',
        width: 110,
        renderer: ({ record }) => record.get('priceTypeMeaning'),
      },
      {
        name: 'agreementTaxedPrice',
        width: 130,
        renderer: precisionRender,
      },
      {
        name: 'agreementPrice',
        width: 130,
        renderer: precisionRender,
      },
      {
        name: 'priceHiddenFlag',
        width: 130,
      },
      {
        name: 'skuSalesLadders',
        title: intl.get('smpc.product.model.ladderPrice').d('阶梯价格'),
        width: 130,
        align: 'right',
        renderer: ({ record }) =>
          record.get('priceType') === 'LADDER_PRICE' ? (
            <a
              onClick={() =>
                openLadderPrice({
                  data: record.get('skuSalesLadders') || record.get('skuApproveSaleLadders') || [],
                  readOnly: true,
                  title: intl.get('smpc.product.model.lookLadderPrice').d('查看阶梯价格'),
                })
              }
            >
              {intl.get('smpc.product.model.lookLadderPrice').d('查看阶梯价格')}
            </a>
          ) : (
            '-'
          ),
      },
      {
        name: 'validDate',
        title: intl.get('smpc.product.view.effectTime').d('有效期'),
        minWidth: 200,
        renderer: ({ record }) => {
          const { validDateFrom, validDateTo } = record.get(['validDateFrom', 'validDateTo']);
          return `${dateRender(validDateFrom) || ''}~${dateRender(validDateTo) || ''}`;
        },
      },
      ...dimensionColumns,
      {
        name: 'uomLov',
        width: 100,
        renderer: ({ record }) => record.get('uomName'),
      },
      {
        name: 'taxLov',
        width: 100,
        align: 'right',
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
        width: 100,
        renderer: ({ record }) => record.get('currencyName'),
      },
      {
        name: 'deliveryDay',
        width: 120,
      },
      {
        name: 'guaranteeDay',
        width: 120,
      },
      {
        name: 'remarkMeaning',
        width: 100,
      },
      {
        name: 'option',
        width: 80,
        show: false,
        lock: 'right',
        renderer: ({ record }) => {
          const { skuPriceStatus, logicDeleteFlag } = record.get([
            'skuPriceStatus',
            'logicDeleteFlag',
          ]);
          if (logicDeleteFlag) return '-';

          const params = record.toJSONData();
          delete params.skuSalesUnits;
          delete params.skuSalesRegions;

          const invalidOpt = (
            <a
              onClick={() => {
                openTextArea({
                  title: intl.get('smpc.product.view.manualInvalid').d('手动失效'),
                  name: 'validRemark',
                  label: intl.get('smpc.product.view.invalidReason').d('失效原因'),
                  maxLength: 100,
                  onOk: (param) => effectService(inValidSales, { ...params, ...param }),
                });
              }}
            >
              {intl.get('smpc.product.view.invalid').d('失效')}
            </a>
          );

          const validOpt = (
            <a
              onClick={() =>
                openTextArea({
                  title: intl.get('smpc.product.view.manualValid').d('手动生效'),
                  name: 'validRemark',
                  label: intl.get('smpc.product.view.validReason').d('生效原因'),
                  maxLength: 100,
                  onOk: (param) => effectService(validSales, { ...params, ...param }),
                })
              }
            >
              {intl.get('smpc.product.view.effect').d('生效')}
            </a>
          );

          const optionsMap = {
            // 生效
            VALID: invalidOpt,
            // 待生效
            WAITING_VALID: validOpt,
            // 失效
            INVALID: validOpt,
            // 生效失败
            VALID_ERROR: validOpt,
          };
          return optionsMap[skuPriceStatus];
        },
      },
    ];
    const newAllColumns = remote
      ? remote?.process('SMPC_SKU_WORKBENCH_PRICE_INFO_TABLE_COLUMNS', allColumns, {
          isSup,
          skuType,
        })
      : allColumns;
    return newAllColumns.filter((f) => f.show !== false && !hiddenColumn[f.name]);
  }, [isSup, hiddenColumn, custDimensions]);

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      customizedCode="SKU.VIEW_PRICE"
      style={{ maxHeight: 'calc(100vh - 170px)' }}
    />
  );
};

// 查看价格信息(isReceive:领用商品暂时只会有一条价格，不会打开到此弹窗)
export default function openPriceInfo(
  {
    skuId,
    data,
    isReceive,
    isSup = false,
    afterClose = (e) => e,
    hiddenColumn = {},
    ...otherProps
  },
  isSearch
) {
  const dataSet = new DataSet(saleInfoDs());
  dataSet.setQueryParameter('skuId', skuId);
  if (isSearch) {
    dataSet.query();
  } else {
    dataSet.loadData(data);
  }

  // 判断关闭是否需要查询
  let isEffect;

  // 触发生效、失效
  const effectService = async (api, params) => {
    dataSet.status = 'loading';
    const res = getResponse(await api([{ ...params, skuId }]));
    dataSet.status = 'ready';
    if (res) {
      isEffect = true;
      notification.success();
      dataSet.query();
    }
  };

  return Modal.open({
    title: intl.get('smpc.product.view.lookPrice').d('查看价格'),
    mask: true,
    drawer: true,
    closable: true,
    maskClosable: false,
    destroyOnClose: true,
    afterClose: () => {
      if (isEffect) {
        afterClose();
      }
    },
    style: { width: 1090 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: (
      <PriceInfo
        isSup={isSup}
        isReceive={isReceive}
        dataSet={dataSet}
        hiddenColumn={hiddenColumn}
        effectService={effectService}
        otherProps={otherProps}
      />
    ),
  });
}
