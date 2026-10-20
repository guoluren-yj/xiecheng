import moment from 'moment';

import { isNil } from 'lodash';
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { validateBits } from '@/utils/util';

const organizationId = getCurrentOrganizationId();

// 协议阶段信息
const stageDS = (props) => {
  const { editable, pcHeaderId, headerInfo = {}, remote } = props;
  const { contractCalculateMethod, supplementFlag } = headerInfo;
  return {
    selection: editable && 'multiple',
    primaryKey: 'pcStageId',

    fields: [
      {
        name: 'stageNo',
        type: 'number',
        label: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
        min: 1,
        step: 1,
      },
      {
        name: 'stageCode',
        type: 'string',
        label: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
        required: true,
        maxLength: 12,
        pattern: /^[A-Z\d]+$/,
        defaultValidationMessages: {
          patternMismatch: intl.get(`spcm.common.view.message.capitalLettersOrNumbersOnly`, {
            fieldName: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
          }),
        },
      },
      {
        name: 'stageName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
        required: true,
      },
      {
        name: 'prepaymentStage',
        type: 'boolean',
        label: intl.get(`spcm.common.model.common.prepaymentStage`).d('预付款阶段'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'milestoneTime',
        type: 'date',
        label: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
        min: Number(supplementFlag) ? null : moment().format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'payRatio',
        type: 'number',
        label: `${intl.get(`spcm.common.model.common.payRatio`).d('付款比例')}(%)`,
        validator: (value, _, record) => {
          if (isNaN(value) && isNaN(record.get('costQuantity'))) {
            return intl
              .get('spcm.common.view.message.noPayratioAndCostQuantity')
              .d('付款比例和原币费用必填其一；也可二者都填');
          }
          return true;
        },
        dynamicProps: {
          required: ({ record }) =>
            contractCalculateMethod !== '0' &&
            (isNaN(record.get('costQuantity')) || isNil(record.get('costQuantity'))),
        },
      },
      {
        name: 'supplierCurrencyCodeLov',
        type: 'object',
        label: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        required: true,
        lovCode: 'SPCM.CURRENCY',
        ignore: 'always',
        textField: 'currencyCode',
      },
      {
        name: 'supplierCurrencyCode',
        bind: 'supplierCurrencyCodeLov.currencyCode',
      },
      {
        name: 'purchaseCurrencyCodeLov',
        type: 'object',
        label: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        required: true,
        lovCode: 'SPCM.CURRENCY',
        ignore: 'always',
        textField: 'currencyCode',
      },
      {
        name: 'purchaseCurrencyCode',
        bind: 'purchaseCurrencyCodeLov.currencyCode',
      },
      {
        name: 'exchangeRate',
        type: 'number',
        label: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
        required: true,
        min: 0.0000001,
        precision: 10,
        validator: (value) => validateBits(value),
      },
      {
        name: 'costQuantity',
        type: 'number',
        min: 0,
        label: intl.get(`spcm.common.model.common.supplierCostQuantity`).d('原币费用'),
        validator: (value, _, record) => {
          if (isNaN(value) && isNaN(record.get('payRatio'))) {
            return intl
              .get('spcm.common.view.message.noPayratioAndCostQuantity')
              .d('付款比例和原币费用必填其一；也可二者都填');
          }
          validateBits(value);
        },
        dynamicProps: {
          required: ({ record }) =>
            contractCalculateMethod !== '1' &&
            (isNaN(record.get('payRatio')) || isNil(record.get('payRatio'))),
        },
      },
      {
        name: 'purchaseCostQuantity',
        type: 'number',
        label: intl.get('spcm.common.model.purchaseCostQuantity').d('本币费用'),
      },
      {
        name: 'costQuantityChinese',
        type: 'string',
        title: intl.get('spcm.common.model.costQuantity.chinese').d('大写费用'),
      },
      {
        name: 'purchaseCostQuantityChinese',
        type: 'string',
        title: intl
          .get('spcm.common.model.purchaseCostQuantity.chinese')
          .d('大写本币费用(原币费用x（本币/原币）'),
      },
      {
        name: 'termIdLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.termId`).d('付款条款'),
        lovCode: 'SMDM.PAYMENT.TERM',
        ignore: 'always',
        textField: 'termName',
        lovPara: {
          pcTypeId: headerInfo.pcTypeId,
        },
      },
      {
        name: 'termId',
        bind: 'termIdLov.termId',
      },
      {
        name: 'termName',
        bind: 'termIdLov.termName',
      },
      {
        name: 'typeIdLov',
        type: 'object',
        label: intl.get('spcm.common.model.common.typeId').d('付款方式'),
        required: true,
        lovCode: 'SPCM.PAYMENT_TYPE',
        ignore: 'always',
        textField: 'typeName',
        lovPara: {
          pcTypeId: headerInfo.pcTypeId,
        },
      },
      {
        name: 'typeId',
        bind: 'typeIdLov.typeId',
      },
      {
        name: 'typeCode',
        bind: 'typeIdLov.typeCode',
      },
      {
        name: 'typeName',
        bind: 'typeIdLov.typeName',
      },
      {
        name: 'remindCycle',
        type: 'currency',
        label: intl.get(`spcm.common.model.common.remindCycle`).d('提醒周期'),
        min: 0,
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.explain').d('说明'),
        validator: (value) => {
          if (value && value.length > 300) {
            return intl.get('hzero.common.validation.max', { max: 300 });
          }
          return true;
        },
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/page`,
          method: 'GET',
          data: queryParams,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/batch`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      update: (params) => {
        if (remote?.event) {
          remote.event.fireEvent('handleUpdateStageDs', { params, props });
        }
      },
    },
  };
};

export default stageDS;
