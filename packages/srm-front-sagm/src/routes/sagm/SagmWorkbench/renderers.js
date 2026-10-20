// 公有renderer|column
import React from 'react';
import { Icon, Tooltip, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { precisionRender } from '@/utils/precision';
// import listCellRender from '@/routes/renderTools/listCellRender';
import { handleUpdateSaleLine } from './funcs';
import openLadder from './Drawers/ladder';
import openDimension from './Drawers/dimension';

import styles from './index.less';

export function agmStatusRenderer({ record, text } = {}, showTip = true) {
  if (!record) return text;

  const { deleteFlag, submitErrorMessageMeaning } = record.get([
    'deleteFlag',
    'submitErrorMessageMeaning',
  ]);

  if (deleteFlag) {
    return (
      <Tag color="gray" style={{ border: 'none' }}>
        {intl.get('sagm.common.view.deleted').d('已删除')}
      </Tag>
    );
  }

  const { statusCode, rejectRemark } = record.get(['statusCode', 'rejectRemark']);

  const typeMap = {
    EFFECTED: ['green'],
    APPROVED: ['green'],
    EXPIRED: ['gray'],
    REJECTED: ['red', '#f05434'],
    OTHER: ['yellow', '#f88d10'], // 其他状态统一取黄色tag
  };

  const type = typeMap[statusCode] || typeMap.OTHER;
  const tagColor = type[0];
  const iconColor = type.length > 1 ? type[1] : '';
  const tipTitle = rejectRemark || submitErrorMessageMeaning;
  return (
    <div style={{ overflow: 'hidden' }}>
      <Tag color={tagColor} style={{ border: 'none' }} className={styles['agm-tag']}>
        {text}
        {showTip && tipTitle && (
          <Tooltip title={tipTitle} placement="top">
            <Icon
              type={['NEW', 'REJECTED'].includes(statusCode) ? 'error' : 'help'}
              style={{
                fontSize: 14,
                fontWeight: 'normal',
                marginLeft: 4,
                color: iconColor,
              }}
            />
          </Tooltip>
        )}
      </Tag>
      {/* {submitErrorMessageMeaning &&
        listCellRender(
          [
            {
              name: 'submitErrorMessageMeaning',
              labelMinWidth: 24,
              label: intl.get('sagm.common.view.status.remark').d('提示'),
            },
          ],
          { submitErrorMessageMeaning }
        )} */}
    </div>
  );
}

export function agmTypeRenderer({ record, text }) {
  const agmType = record.get('agreementHeaderType');
  const icon =
    agmType === 'AGENT'
      ? 'published_with_changes'
      : agmType === 'MEMBER'
      ? 'how_to_reg'
      : 'sync_alt';
  return (
    <span style={{ display: 'flex', alignItems: 'center' }}>
      <Icon
        type={icon}
        style={{
          fontSize: '14px',
          marginRight: 4,
          color: 'rgba(0,0,0,0.50)',
        }}
      />
      {text}
    </span>
  );
}

// 协议行操作列
export function agmLineActionColumn(props = {}) {
  return {
    ...props,
    width: 80,
    name: 'action',
    header: intl.get('hzero.common.action').d('操作'),
    renderer: ({ record, dataSet }) =>
      record.get('priceStrategyId') ? (
        <Button funcType="link" onClick={() => handleUpdateSaleLine({ record, dataSet })}>
          {record.get('effectiveFlag')
            ? intl.get('sagm.common.button.noEffective').d('失效')
            : intl.get('sagm.common.button.effective').d('生效')}
        </Button>
      ) : (
        '-'
      ),
  };
}

// 协议行操作列
export function agmLineOrgColumn(props = {}) {
  return {
    ...props,
    name: 'orgId',
    width: 140,
    renderer: ({ record }) => {
      const { orgId, unitCode, unitName } = record.get(['orgId', 'unitCode', 'unitName']);
      return orgId === -2
        ? intl.get('sagm.common.model.allOrganizations').d('所有组织')
        : unitCode && unitName
        ? `${unitCode}-${unitName}`
        : '';
    },
  };
}

export function agmLinePurPriceColumn(props = {}) {
  return {
    ...props,
    name: 'purchasePrice',
    width: 90,
    renderer: ({ record, name }) => {
      const { priceType, purAgreementLineLadders: ladders } = record.get([
        'priceType',
        'purAgreementLineLadders',
      ]);
      if (priceType !== 'LADDER_PRICE' || (ladders || []).length < 1) {
        return precisionRender({ record, name });
      }
      return (
        <a
          onClick={() =>
            openLadder({
              data: ladders,
              filterFields: ['lineNum', 'ladderFrom', 'ladderTo', 'unitPrice', 'taxPrice'],
            })
          }
        >
          {intl.get('sagm.common.view.button.ladderPrice').d('阶梯价')}
        </a>
      );
    },
  };
}

// 协议行销售价列
export function agmLineSellPriceColumn(props = {}) {
  return {
    ...props,
    name: 'sellingPrice',
    width: 100,
    renderer: ({ record, name }) => {
      const { priceType, saleAgreementLineLadders } = record.get([
        'priceType',
        'saleAgreementLineLadders',
      ]);
      if (priceType !== 'LADDER_PRICE') return precisionRender({ record, name });
      return (
        <a
          onClick={() =>
            openLadder({
              data: saleAgreementLineLadders,
              filterFields: ['lineNum', 'ladderFrom', 'ladderTo', 'purchasePrice', 'salePrice'],
            })
          }
        >
          {intl.get('sagm.common.view.button.ladderPrice').d('阶梯价')}
        </a>
      );
    },
  };
}

export function strategyDetailRenderer({ record, name }) {
  const { [name]: value } = record.get('priceStrategy') || {};
  return value;
}

export function strategyAdjustRenderer(data) {
  const { isLadderPrice, ladderPriceStrategies, amountMarkupFlag, adjustDetailsMeaning } =
    data || {};
  if (isLadderPrice) {
    const otherField = amountMarkupFlag ? 'amount' : 'percentage';
    return (
      <a
        onClick={() =>
          openLadder({
            data: ladderPriceStrategies,
            filterFields: ['number', 'quantityFrom', 'quantityTo', otherField],
          })
        }
      >
        {intl.get('sagm.common.view.button.ladderPrice').d('阶梯价')}
      </a>
    );
  }
  return adjustDetailsMeaning;
}

// 价格策略调价方向列
export function strategyAdjustColumn(props = {}) {
  return {
    name: 'adjustDetailsMeaning',
    minWidth: 220,
    ...props,
    renderer: ({ record }) => {
      return strategyAdjustRenderer(record.get('priceStrategy'));
    },
  };
}

// 价格策略策略维度列
export function strategyDimensionColumn(props = {}) {
  return {
    name: 'strategyDimension',
    width: 100,
    ...props,
    renderer: ({ record }) => {
      return (
        <a onClick={() => openDimension(record.get('priceStrategyId'))}>
          {intl.get('hzero.common.button.look').d('查看')}
        </a>
      );
    },
  };
}

export function flagRenderer({ value, meaning }) {
  const newMeaning =
    meaning ||
    (value === 1 ? intl.get('hzero.common.yes').d('是') : intl.get('hzero.common.no').d('否'));
  return (
    <span className={styles['sagm-detail-out-price']}>
      <span className={value === 1 ? 'green' : 'red'} />
      {newMeaning}
    </span>
  );
}

export function overlinePriceRenderer({ record, name = 'overlinePriceEnableMeaning' }) {
  const { [name]: meaning, overlinePriceEnable: value = 0 } = record.get('priceStrategy') || {};
  return flagRenderer({ value, meaning });
}
