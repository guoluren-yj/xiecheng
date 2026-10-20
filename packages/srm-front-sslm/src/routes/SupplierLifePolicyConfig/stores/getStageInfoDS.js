/*
 * @Date: 2022-09-26 20:59:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getStageInfoDS = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'stageCode',
      required: true,
      label: intl.get('sslm.supplierLifePolicyConfig.modal.stage.num').d('阶段编码'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('_local'),
      },
    },
    {
      name: 'stageDescription',
      type: 'intl',
      required: true,
      label: intl.get('sslm.supplierLifePolicyConfig.modal.stage.name').d('阶段名称'),
    },
    {
      name: 'allowOrders',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl
        .get(`sslm.supplierLifeConfig.view.message.allowSupplyCreateOrder`)
        .d('允许该阶段的供应商创建订单'),
    },
    {
      name: 'allowProtocolFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl
        .get(`sslm.supplierLifeConfig.view.message.supplySignAgreement`)
        .d('允许该阶段供应商签署协议'),
    },
    {
      name: 'allowSmallOrders',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl
        .get(`sslm.supplierLifeConfig.view.message.allowCreateSmallOrder`)
        .d('允许该阶段供应商创建商城订单'),
    },
    {
      name: 'allowSettleAccount',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl
        .get(`sslm.supplierLifeConfig.view.message.allowSupplierSettleAcount`)
        .d('允许该阶段供应商结算'),
    },
  ],
});
