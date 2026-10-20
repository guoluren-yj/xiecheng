/*
 * @Date: 2024-06-07 14:58:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { head } from 'lodash';

import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getFormDS = ({ strategyId, isEdit, isCreate } = {}) => ({
  paging: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    // 基础信息
    {
      name: 'strategyNum',
      disabled: true,
      label: intl.get('spcm.amountStrategy.model.strategy.num').d('策略编码'),
    },
    {
      name: 'strategyName',
      required: isEdit,
      label: intl.get('spcm.amountStrategy.model.strategy.name').d('策略名称'),
    },
    {
      name: 'strategyStatus',
      disabled: true,
      lookupCode: 'SPCM.STRATEGY_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'versionNumber',
      disabled: true,
      label: intl.get('spcm.common.model.field.version').d('版本'),
    },
    {
      name: 'createdByName',
      disabled: true,
      label: intl.get('hzero.common.date.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      disabled: true,
      label: intl.get('hzero.common.date.createDate').d('创建时间'),
    },
    {
      name: 'lastUpdateDate',
      disabled: true,
      label: intl.get('hzero.common.date.lastUpdateDate').d('创建时间'),
    },
    {
      name: 'enableFlag',
      defaultValue: 1,
    },
    // 控制维度
    {
      name: 'amountControlDimension',
      lookupCode: 'SPCM.STRATEGY.AMOUNT_CONTROL_DIMENSION',
      label: intl
        .get('spcm.amountStrategy.model.controlDimension.amountControlDimension')
        .d('合同金额控制维度'),
      dynamicProps: {
        required: ({ record }) => isEdit && !isCreate && record.get('strategyStatus'),
      },
    },
    {
      name: 'manuallyModifyAmount',
      lookupCode: 'HPFM.FLAG',
      label: intl
        .get('spcm.amountStrategy.model.controlDimension.manuallyModifyAmount')
        .d('允许手工维护合同上限金额'),
      dynamicProps: {
        disabled: ({ record }) => record.get('amountControlDimension') === 'NO',
        required: ({ record }) =>
          isEdit && !isCreate && record.get('amountControlDimension') !== 'NO',
      },
    },
    {
      name: 'limitAmountField',
      lookupCode: 'SPCM.STRATEGY.LIMIT_AMOUNT_FIELD',
      label: intl
        .get('spcm.amountStrategy.model.controlDimension.limitAmountField')
        .d('合同上限金额取值字段'),
      dynamicProps: {
        disabled: ({ record }) =>
          !(
            record.get('amountControlDimension') !== 'NO' &&
            record.get('manuallyModifyAmount') === '0'
          ),
        required: ({ record }) =>
          isEdit &&
          !isCreate &&
          record.get('amountControlDimension') !== 'NO' &&
          record.get('manuallyModifyAmount') === '0',
      },
    },
    // 取值规则
    {
      name: 'amountField',
      lookupCode: 'SPCM.STRATEGY.AMOUNT_FIELD',
      defaultValue: 'TAX_INCLUDED_PRICE',
      label: intl.get('spcm.amountStrategy.model.valueRules.amountField').d('金额取值字段'),
      dynamicProps: {
        required: ({ record }) => isEdit && !isCreate && record.get('strategyStatus'),
      },
    },
    {
      name: 'amountControlCurrencyCode',
      type: 'object',
      lovCode: 'SMDM.CURRENCY',
      textField: 'currencyCode',
      label: intl
        .get('spcm.amountStrategy.model.valueRules.amountControlCurrencyCode')
        .d('金额控制币种'),
      transformRequest: (value) => value && value.currencyCode,
      transformResponse: (value) =>
        value
          ? {
              currencyCode: value,
            }
          : null,
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      switch (name) {
        case 'amountControlDimension':
          record.set({
            limitAmountField: null,
            manuallyModifyAmount: value === 'NO' ? '0' : null,
          });
          break;
        case 'manuallyModifyAmount':
          record.set({ limitAmountField: null });
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: {
      url: `${SRM_SPCM}/v1/${tenantId}/pc-amount-occupy-strategy/${strategyId}`,
      method: 'GET',
    },
    create: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${tenantId}/pc-amount-occupy-strategy/create-strategy`,
        method: 'POST',
        data: head(data),
      };
    },
  },
});

export const getControlRulesDS = () => ({
  paging: false,
  selection: false,
  forceValidate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'node',
      lookupCode: 'SPCM.STRATEGY.NODE',
      label: intl.get('spcm.amountStrategy.model.controlRules.node').d('节点'),
    },
    {
      name: 'amountControlType',
      lookupCode: 'SPCM.STRATEGY.AMOUNT_CONTROL_TYPE',
      label: intl
        .get('spcm.amountStrategy.model.controlRules.amountControlType')
        .d('协议金额控制类型'),
    },
    {
      name: 'insufficientBalanceReminder',
      label: intl
        .get('spcm.amountStrategy.model.controlRules.insufficientBalanceReminder')
        .d('余额不足提醒'),
      type: 'boolean',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '0',
      dynamicProps: {
        disabled: ({ record }) => record.get('amountControlType') !== 'STRONG',
      },
    },
    {
      name: 'insufficientBalanceReminderRatio',
      label: intl
        .get('spcm.amountStrategy.model.controlRules.insufficientBalanceReminderRatio')
        .d('余额不足提醒比例(%)'),
      type: 'number',
      min: 0,
      help: intl
        .get('spcm.amountStrategy.model.controlRules.insufficientBalanceReminderRatioMsg')
        .d(
          '强控制时，余额不足该比例时进行提醒。即，已占用金额>协议上限金额*余额不足提醒比例时，提示用户余额不足'
        ),
      dynamicProps: {
        disabled: ({ record }) => record.get('amountControlType') !== 'STRONG',
      },
      validator: (value) => {
        if (value >= 100) {
          return intl
            .get('spcm.amountStrategy.model.controlRules.insufficientValidatorMsg')
            .d('余额不足提醒比例(%)必须小于100');
        } else {
          return true;
        }
      },
    },
    {
      name: 'excessReminder',
      label: intl.get('spcm.amountStrategy.model.controlRules.excessReminder').d('超额提醒'),
      type: 'boolean',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '0',
      dynamicProps: {
        disabled: ({ record }) => record.get('amountControlType') !== 'WEAK',
      },
    },
    {
      name: 'excessReminderRatio',
      label: intl
        .get('spcm.amountStrategy.model.controlRules.excessReminderRatio')
        .d('超额提醒开启比例(%)'),
      type: 'number',
      min: 0,
      dynamicProps: {
        disabled: ({ record }) => record.get('amountControlType') !== 'WEAK',
      },
    },
    {
      name: 'timeFieldValue',
      label: intl.get('spcm.amountStrategy.model.controlRules.timeFieldValue').d('时间字段取值'),
      type: 'date',
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'amountControlType':
          record.set({
            insufficientBalanceReminder: '0',
            insufficientBalanceReminderRatio: null,
            excessReminder: '0',
            excessReminderRatio: null,
          });
          break;
        default:
          break;
      }
    },
  },
});
