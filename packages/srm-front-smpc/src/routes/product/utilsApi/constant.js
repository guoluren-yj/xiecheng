import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export const enabledDataSet = () =>
  new DataSet({
    data: [
      {
        value: 1,
        meaning: intl.get('hzero.common.status.enable').d('启用'),
      },
      {
        value: 0,
        meaning: intl.get('hzero.common.status.disable').d('禁用'),
      },
    ],
  });

export const ynDataSet = () =>
  new DataSet({
    data: [
      {
        value: 1,
        meaning: intl.get('smpc.product.model.effective').d('有效'),
      },
      {
        value: 0,
        meaning: intl.get('smpc.product.model.invalid').d('无效'),
      },
    ],
  });

export const mappingStatusDataSet = () =>
  new DataSet({
    data: [
      {
        value: 1,
        meaning: intl.get('smpc.product.model.hadMapping').d('已映射'),
      },
      {
        value: 0,
        meaning: intl.get('smpc.product.model.noMapping').d('未映射'),
      },
    ],
  });

export const createMethodDataSet = () =>
  new DataSet({
    data: [
      {
        value: 1,
        meaning: intl.get('smpc.product.model.agreementCreation').d('协议创建'),
      },
      {
        value: 0,
        meaning: intl.get('smpc.product.model.manualCreation').d('手工创建'),
      },
    ],
  });

export const yesOrNodDataSet = () =>
  new DataSet({
    data: [
      {
        value: 1,
        meaning: intl.get('smpc.product.model.yes').d('是'),
      },
      {
        value: 0,
        meaning: intl.get('smpc.product.model.no').d('否'),
      },
    ],
  });
