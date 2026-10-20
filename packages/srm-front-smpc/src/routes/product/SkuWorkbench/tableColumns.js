import React from 'react';
import { Icon } from 'choerodon-ui';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { isNull } from 'lodash';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import listCellRender from '@/routes/renderTools/listCellRender';
import { isCustomNumber } from '@/utils/precision';
import { StatusTag, DropdownMenus } from './components';
import { precisionRender } from '../utilsApi/precision';
import { openLadderPrice, openPriceInfo, openStockInfo } from './drawers';
import { getRecordFields } from './utils';

import styles from './index.less';

const colorMaps = {
  0: ['rgba(252,160,0,0.10)', '#F88D10'], // 默认状态
  1: ['rgba(71,184,129,0.10)', '#47B881'], // 成功状态
  2: ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.85)'], // 失效状态
  3: ['#ffeeeb', '#f56649'], // 失败状态
  4: ['#EAF4FD', '#3095F2'], // 新建状态
};

const rendererCompare = ({ record, name, value }) => {
  const compareList = record.get('keyList') || [];
  const color = compareList.includes(name) ? '#fca000' : undefined;
  return <span style={{ color }}>{value || '-'}</span>;
};

const rendererCompose = ({ record, name, value }, codeField) => {
  const code = record.get(codeField);
  const composeValue = code ? `${code}-${value}` : value;
  return rendererCompare({ record, name, value: composeValue });
};

const renderApplyType = ({ record, text }, aggregation) => {
  const { approveReason, approveType } = record.get(['approveReason', 'approveType']);
  return (
    <div style={{ overflow: 'hidden' }}>
      {text}
      {aggregation &&
        approveType === 'INVALID' &&
        listCellRender(
          [
            {
              name: 'approveReason',
              labelMinWidth: 24,
              label: intl.get('smpc.product.model.cause').d('原因:'),
            },
          ],
          { approveReason }
        )}
    </div>
  );
};

const rendererStatus = ({ record }, aggregation) => {
  const {
    shelfRemark,
    purSkuStatus,
    unshelveRemarkMeaning,
    purSkuStatusMeaning,
    shelfErrorMessageMeaning: msg = '',
    submitErrorMessageMeaning: smsg = '',
    remarkMeaning = '',
    // receiveFlag,
  } = getRecordFields(record, [
    'shelfRemark',
    'purSkuStatus',
    'unshelveRemarkMeaning',
    'purSkuStatusMeaning',
    'shelfErrorMessageMeaning',
    'submitErrorMessageMeaning',
    'remarkMeaning',
    'receiveFlag',
  ]);
  // shelfFlag 1 已上架 2 手工下架 3 上架失败 4 待上架 5 已生效
  // skuStatus 0 新建 1 审批通过 2 审批拒绝 3 已生效 4 解锁
  // purSkuStatus 0 自动下架 1 已上架 2 手工下架 3 上架失败 4 审批通过 5 新建
  // 6 待审批 7 已生效 8 上架中 9 下价中 10 审批拒绝
  // approveStatus APPROVED REJECT

  const meaning = purSkuStatusMeaning;
  const colorKey = [1, 4, 7].includes(purSkuStatus)
    ? 1
    : [0, 2].includes(purSkuStatus)
    ? 2
    : [3, 10].includes(purSkuStatus)
    ? 3
    : 0;

  // const receiveTip =
  //   receiveFlag === 1 ? intl.get('smpc.product.view.receiveSku').d('领用商品') : '';

  const [bgColor, fontColor] = colorMaps[colorKey] || [];
  const iconType = purSkuStatus === 10 ? 'error' : undefined;
  return (
    meaning && (
      <div style={{ overflow: 'hidden' }}>
        <StatusTag
          bgColor={bgColor}
          fontColor={fontColor}
          text={meaning}
          // tip={tip}
          message={msg || smsg || remarkMeaning || unshelveRemarkMeaning}
          aggregation={aggregation}
          iconType={iconType}
        />
        {shelfRemark &&
          aggregation &&
          listCellRender(
            [
              {
                name: 'shelfRemark',
                labelMinWidth: 24,
                label: intl.get('smpc.product.model.remark').d('备注'),
              },
            ],
            { shelfRemark }
          )}
      </div>
    )
  );
};

const renderApprove = ({ record }, aggregation) => {
  const { __versionId, remark, approveStatus, approveStatusMeaning } = getRecordFields(record, [
    'remark',
    '__versionId',
    'approveStatus',
    'approveStatusMeaning',
  ]);
  const text = __versionId
    ? intl.get('smpc.product.view.historyVersion').d('历史版本')
    : approveStatusMeaning;
  const colorKey = ['APPROVED', 'REVERTED'].includes(approveStatus)
    ? 1
    : approveStatus === 'REJECT'
    ? 3
    : __versionId
    ? 2
    : 0;
  const [bgColor, fontColor] = colorMaps[colorKey];
  return (
    <StatusTag
      bgColor={bgColor}
      fontColor={fontColor}
      text={text}
      message={remark}
      aggregation={aggregation}
    />
  );
};

const statusColumn = (aggregation = true) => {
  return {
    name: 'skuStatus',
    width: 120,
    tooltip: 'none',
    renderer: (p) => rendererStatus(p, aggregation),
  };
};

const approveStatusColumn = (isWaiting = false, aggregation = true, className = '') => ({
  name: 'approveStatus',
  width: isWaiting ? 110 : 100,
  minWidth: 130,
  renderer: (param) => renderApprove(param, aggregation),
  tooltip: 'none',
  className: isWaiting ? `wait-approve ${className}` : 'reject-approve',
});

const supStatusColumn = (aggregation = true) => ({
  name: 'supplierShelfFlag',
  width: 120,
  tooltip: 'none',
  renderer: ({ value, record }) => {
    const remark = record.get('remarkMeaning');
    const receiveFlag = record.get('receiveFlag');
    const text = record.get('supplierShelfFlagMeaning');
    const [bgColor, fontColor] = colorMaps[value === 1 ? 1 : 2];
    const receiveTip =
      receiveFlag === 1 ? intl.get('smpc.product.view.receiveSku').d('领用商品') : '';
    return (
      <div style={{ overflow: 'hidden' }}>
        <StatusTag
          text={text}
          bgColor={bgColor}
          fontColor={fontColor}
          message={receiveTip || remark}
          aggregation={aggregation}
        />
      </div>
    );
  },
});

const supPublishStatusColumn = (aggregation = true) => ({
  name: 'supplierShelfFlag',
  width: 140,
  tooltip: 'none',
  renderer: ({ record }) => {
    const { purSkuStatus, remarkMeaning, purSkuStatusMeaning } = record.get([
      'purSkuStatus',
      'remarkMeaning',
      'purSkuStatusMeaning',
    ]);
    const colorKey = [1, 4, 7].includes(purSkuStatus)
      ? 1
      : [0, 2].includes(purSkuStatus)
      ? 2
      : [3, 10].includes(purSkuStatus)
      ? 3
      : 0;
    const [bgColor, fontColor] = colorMaps[colorKey];
    return (
      <div style={{ overflow: 'hidden' }}>
        <StatusTag
          text={purSkuStatusMeaning}
          bgColor={bgColor}
          fontColor={fontColor}
          message={remarkMeaning}
          aggregation={aggregation}
        />
      </div>
    );
  },
});

// 无限库存判断
const isInfiniteStock = (val) => val === -1 || isNaN(val) || isNull(val);

// 可用库存渲染
const getSkuStock = ({
  record,
  skuStockName = 'skuStock',
  totalStockName = 'totalStock',
  warningStockName = 'warningStock',
  showLine = true,
  isCreate = false,
}) => {
  const skuStock = record.get(skuStockName);
  const totalStock = record.get(totalStockName);
  const warningStock = record.get(warningStockName);
  // const receiveFlag = record.get('receiveFlag');
  if (isCreate) return '-';
  if (isInfiniteStock(totalStock)) {
    return intl.get('smpc.product.model.noLimitStock').d('无限库存');
  }
  const isWarn =
    isCustomNumber(warningStock) && isCustomNumber(skuStock) && math.lte(skuStock, warningStock);
  const precisionStock = precisionRender({ name: skuStockName, record, showLine });
  if (isWarn) {
    return (
      <Tooltip title={intl.get('smpc.product.model.canUseStockWarningMsg').d('可用库存低于预警值')}>
        <span style={{ color: 'red' }}>{precisionStock}</span>
      </Tooltip>
    );
  }
  return precisionStock;
};

// 可用库存渲染
const stockFieldRender = ({ record, name }, showLine = true) => {
  const stocks = record.get('skuStockList') || [];
  const stock = stocks[0] || {};
  const { surplusStock, warningStock } = stock;
  if (stocks.length > 1) {
    if (name === 'inventoryName') {
      return viewStockInfo(record, stocks);
    }
    return '-';
  }
  // 可用库存
  if (name === 'skuStock') {
    const isWarn =
      isCustomNumber(warningStock) &&
      isCustomNumber(surplusStock) &&
      math.lte(surplusStock, warningStock);
    // 领用库存字段名不一样
    const precisionStock = precisionRender({ name: 'surplusStock', recordData: stock, showLine });
    if (isWarn) {
      return (
        <Tooltip
          title={intl.get('smpc.product.model.canUseStockWarningMsg').d('可用库存低于预警值')}
        >
          <span style={{ color: 'red' }}>{precisionStock}</span>
        </Tooltip>
      );
    }
    return precisionStock;
  }
  return precisionRender({ name, recordData: stock, showLine });
};

const recycleStatusColumn = () => ({
  name: 'recycleFlagMeaning',
  width: 120,
  renderer: ({ record }) => {
    const text = record.get('recycleFlagMeaning');
    const [bgColor, fontColor] = colorMaps[2];
    return (
      <div style={{ overflow: 'hidden' }}>
        <StatusTag text={text} bgColor={bgColor} fontColor={fontColor} />
      </div>
    );
  },
});

const stockRender = ({ record }) => {
  return listCellRender(
    [
      {
        name: 'skuStock',
        label: intl.get('smpc.product.model.canUseStock').d('可用库存'),
        render: ({ skuStock, warningStock, totalStock }, contentClass) => {
          const isInfinite = isInfiniteStock(totalStock);
          const text = isInfinite
            ? intl.get('smpc.product.view.bigStock').d('无限库存')
            : precisionRender({ name: 'skuStock', record, showLine: true });
          const isWarn = isCustomNumber(warningStock) && !isInfinite && skuStock <= warningStock;
          return (
            <span className={contentClass} style={{ color: isWarn ? 'red' : undefined }}>
              {text}
            </span>
          );
        },
      },
      {
        name: 'warningStock',
        label: intl.get('smpc.product.model.warnStock').d('预警库存'),
        getVal: () => precisionRender({ name: 'warningStock', record, showLine: true }),
      },
      {
        name: 'consumedStock',
        label: intl.get('smpc.product.model.useStock').d('消耗库存'),
        getVal: () => precisionRender({ name: 'consumedStock', record, showLine: true }),
      },
      {
        name: 'totalStock',
        label: intl.get('smpc.product.model.allStock').d('总库存'),
        getVal: (val) =>
          isInfiniteStock(val)
            ? intl.get('smpc.product.view.bigStock').d('无限库存')
            : precisionRender({ name: 'totalStock', record, showLine: true }),
        labelMinWidth: 36,
      },
    ],
    record.toData()
  );
};

const priceRender = (record, skuType) => {
  const prices = record.get('skuSalesInfos') || record.get('skuApproveSalesList') || [];
  const firstPrice = prices[0] || {};
  const {
    currencyName,
    tax,
    taxRate,
    priceTypeMeaning,
    priceType,
    skuSalesLadders,
    validDateFrom,
    validDateTo,
  } = firstPrice;
  const ecValidDateTo = record.get('ecValidDateTo');
  // 没有 商品来源， 默认目录化
  const isEC = skuType === 'EC';
  return listCellRender(
    [
      {
        name: 'taxPrice',
        label: intl.get('smpc.product.model.taxPrice').d('含税单价'),
        render: (_, contentClass) => {
          if (priceType === 'LADDER_PRICE') {
            return (
              <a
                onClick={() =>
                  openLadderPrice({
                    data: skuSalesLadders || [],
                    readOnly: true,
                    title: intl.get('smpc.product.model.lookLadderPrice').d('查看阶梯价格'),
                  })
                }
                className={contentClass}
                style={{ color: '#29BECE' }}
              >
                {intl.get('smpc.product.model.lookLadderPrice').d('查看阶梯价格')}
              </a>
            );
          } else {
            return (
              <span className={contentClass}>
                {precisionRender({
                  name: 'agreementTaxedPrice',
                  recordData: firstPrice,
                }) || '-'}
              </span>
            );
          }
        },
        showLabel: priceType !== 'LADDER_PRICE',
      },
      {
        name: 'tax',
        label: intl.get('smpc.product.model.tax').d('税率'),
        labelMinWidth: 24,
        getVal: () => (tax || taxRate ? Number(tax || taxRate) : '-'),
      },
      {
        name: 'effectTime',
        label: isEC
          ? intl.get('smpc.product.model.dateTo').d('有效期至')
          : intl.get('smpc.product.view.effectTime').d('有效期'),
        labelMinWidth: 36,
        getVal: () =>
          isEC
            ? dateRender(ecValidDateTo)
            : validateDateRender({ from: validDateFrom, to: validDateTo }),
      },
      {
        name: 'priceType',
        label: intl.get('smpc.product.model.priceType').d('价格类型'),
        getVal: () => priceTypeMeaning,
      },
      {
        name: 'currencyName',
        label: intl.get('smpc.product.model.currency').d('币种'),
        labelMinWidth: 24,
        getVal: () => currencyName,
      },
    ],
    record.toData()
  );
};

const viewPriceInfo = (record, { status, afterClose = (e) => e, isSup, ...otherProps }) => {
  const prices = record.get('skuSalesInfos') || record.get('skuApproveSalesList') || [];
  return (
    <a
      className={styles['cus-aggregation-line-height']}
      onClick={() =>
        openPriceInfo(
          {
            isSup,
            skuId: record.get('skuId'),
            data: prices,
            afterClose,
            hiddenColumn: { option: status === '7' },
            ...otherProps,
          },
          status !== '5'
        )
      }
    >
      {intl.get('smpc.product.view.lookPrice').d('查看价格')}
    </a>
  );
};

const viewStockInfo = (record, stocks) => {
  return (
    <a
      className={styles['cus-aggregation-line-height']}
      onClick={() =>
        openStockInfo(
          {
            skuId: record.get('skuId'),
            data: stocks,
          },
          false
        )
      }
    >
      {intl.get('smpc.product.view.lookStock').d('查看库存信息')}
    </a>
  );
};

const priceFieldRender = ({ record, name }, viewArgs = {}) => {
  const prices = record.get('skuSalesInfos') || record.get('skuApproveSalesList') || [];
  const firstPrice = prices[0] || {};
  const { showLine = true } = viewArgs;
  const {
    currencyName,
    tax,
    taxRate,
    priceTypeMeaning,
    priceType,
    skuSalesLadders,
    validDateFrom,
    validDateTo,
  } = firstPrice;
  const fieldRenderMap = {
    taxPrice: () => {
      if (priceType === 'LADDER_PRICE') {
        return (
          <a
            onClick={() =>
              openLadderPrice({
                data: skuSalesLadders || [],
                readOnly: true,
                title: intl.get('smpc.product.model.lookLadderPrice').d('查看阶梯价格'),
              })
            }
          >
            {intl.get('smpc.product.model.lookLadderPrice').d('查看阶梯价格')}
          </a>
        );
      } else {
        return (
          precisionRender({
            name: 'agreementTaxedPrice',
            recordData: firstPrice,
          }) || '-'
        );
      }
    },
    currencyName: () => currencyName || '-',
    tax: () => {
      const _tax = tax ?? taxRate;
      const taxIsNumber = typeof _tax === 'number'; // 是一个数字
      const taxIsStrNumber = typeof _tax === 'string' && !isNaN(Number(_tax)); // 是一个字符串数字
      return taxIsNumber || taxIsStrNumber ? Number(_tax) : _tax;
    },
    priceType: () => priceTypeMeaning || '-',
    validDateFrom: () => (validDateFrom ? dateRender(validDateFrom) : showLine ? '-' : ''),
    validDateTo: () => (validDateTo ? dateRender(validDateTo) : showLine ? '-' : ''),
  };
  if (prices.length <= 1) {
    return fieldRenderMap[name]();
  } else if (name === 'taxPrice') {
    return viewPriceInfo(record, viewArgs);
  } else {
    return showLine ? '-' : '';
  }
};

const validateDateRender = ({ record, from = '', to = '' }) => {
  const fromStr = record
    ? priceFieldRender({ record, name: 'validDateFrom' }, { showLine: false })
    : dateRender(from) || '';
  const toStr = record
    ? priceFieldRender({ record, name: 'validDateTo' }, { showLine: false })
    : dateRender(to) || '';
  if (!fromStr && !toStr) {
    return '-';
  }
  return `${fromStr}~${toStr}`;
};

const getOptions = (actions = [], maxLength = 4, aggregation = true) => {
  const filterActions = actions.filter((f) => {
    const { show = true } = f;
    return show;
  });
  const viewActions =
    filterActions.length > maxLength ? filterActions.slice(0, maxLength - 1) : filterActions;
  const menuActions = filterActions.slice(maxLength - 1, filterActions.length);
  const command = viewActions.map((m, idx) => {
    const { text, iconSpace, disabled, event = (e) => e, items = [], style } = m;
    if (items && items.length > 0) {
      return (
        <DropdownMenus menus={items} placement="bottomLeft">
          <Button funcType="link" color="primary" style={style}>
            {text}
            <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginTop: -2 }} />
          </Button>
        </DropdownMenus>
      );
    }
    return (
      <Button
        disabled={disabled}
        onClick={event}
        funcType="link"
        style={{ marginLeft: idx !== 0 && !aggregation ? 16 : 'initial' }}
      >
        {text}
        {iconSpace && (
          <Icon
            type="expand_more"
            style={{ fontSize: 14, marginLeft: 4, marginTop: -2, visibility: 'hidden' }}
          />
        )}
      </Button>
    );
  });
  if (filterActions.length > maxLength) {
    command.push(
      <DropdownMenus menus={menuActions} placement="bottomLeft">
        <Button funcType="link" color="primary">
          {intl.get('hzero.common.button.more').d('更多')}
          <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginTop: -2 }} />
        </Button>
      </DropdownMenus>
    );
  }
  return command;
};

const getMappingGroup = () => ({
  key: 'mappingGroup',
  aggregation: true,
  width: 180,
  align: 'left',
  header: intl.get('smpc.product.view.mappingInfo').d('映射信息'),
  children: [
    {
      name: 'catalogName',
      width: 120,
      renderer: (params) => rendererCompose(params, 'catalogCode'),
    },
    { name: 'itemCode', width: 120, renderer: rendererCompare },
    { name: 'itemName', width: 120, renderer: rendererCompare },
    {
      name: 'itemCategoryName',
      width: 120,
      renderer: (params) => rendererCompose(params, 'itemCategoryCode'),
    },
  ],
});

export {
  statusColumn,
  supStatusColumn,
  approveStatusColumn,
  recycleStatusColumn,
  stockRender,
  priceRender,
  rendererStatus,
  priceFieldRender,
  getOptions,
  viewPriceInfo,
  viewStockInfo,
  rendererCompare,
  getMappingGroup,
  getSkuStock,
  renderApplyType,
  supPublishStatusColumn,
  stockFieldRender,
  validateDateRender,
};
