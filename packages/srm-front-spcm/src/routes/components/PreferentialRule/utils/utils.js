/*
 * @Description:
 * @Date: 2023-05-11 15:27:19
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const tenantId = getCurrentOrganizationId();

export function stepbBtns(btns = []) {
  const showBtns = [];
  btns
    .filter((item) => item)
    .forEach((btn) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      if (!group && !btnComp) {
        showBtns.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, key: name },
        });
      } else {
        showBtns.push(btn);
      }
    });
  return showBtns;
}

export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

// 个性化区域校验
export function unitValidate(dataSet, valiFields) {
  return new Promise(async (resolve) => {
    const res = await Promise.all(
      valiFields.map((item) => dataSet?.current?.getField(item).checkValidity())
    );
    resolve(res.every((item) => item === true));
  });
}

export function lovOptionDS({ paging, ...queryParameter }) {
  return {
    paging,
    queryParameter,
    autoQuery: true,
    selection: 'single',
    transport: {
      read() {
        return {
          url: `${HZERO_PLATFORM}/v1/${tenantId}/lovs/data`,
          method: 'get',
        };
      },
    },
  };
}

export function getPreferLabel(type, field) {
  const isDiscount = typeof type === 'string' ? type === 'discount' : !type;
  switch (field) {
    case 'create':
      return isDiscount
        ? intl
            .get(`spfp.ruleMaintenance.model.ruleMaintenance.createDiscountRule`)
            .d('新建折扣规则')
        : intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.createRebateRule`).d('新建返利规则');
    case 'detail':
      return isDiscount
        ? intl.get('spfp.ruleMaintenance.detail.title.viewDiscountRule').d('查看折扣规则')
        : intl.get('spfp.ruleMaintenance.detail.title.viewRebateRule').d('查看返利规则');
    case 'change':
      return isDiscount
        ? intl.get('spfp.ruleMaintenance.detail.title.changeDiscountRule').d('变更折扣规则')
        : intl.get('spfp.ruleMaintenance.detail.title.changeRebateRule').d('变更返利规则');
    case 'scene':
      return isDiscount
        ? intl.get('spfp.ruleMaintenance.detail.card.title.discountScenario').d('折扣场景')
        : intl.get('spfp.ruleMaintenance.view.title.create.rebateScene').d('返利场景');
    case 'resultValue':
      return isDiscount
        ? intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.discountValue`).d('折扣')
        : intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.rebateValue`).d('返利');
    case 'rangeFromValue':
      return isDiscount
        ? intl
            .get(`spfp.ruleMaintenance.model.ruleMaintenance.discountRangeFromValue`)
            .d('折扣范围从')
        : intl
            .get(`spfp.ruleMaintenance.model.ruleMaintenance.rebateRangeFromValue`)
            .d('返利范围从');
    case 'rangeToValue':
      return isDiscount
        ? intl
            .get(`spfp.ruleMaintenance.model.ruleMaintenance.discountRangeToValue`)
            .d('折扣范围至')
        : intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.rebateRangeToValue`).d('返利范围至');
    case 'cumResultValue':
      return isDiscount
        ? intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.discountValueResult`).d('折扣结果')
        : intl.get(`spfp.ruleMaintenance.model.ruleMaintenance.rebateValueResult`).d('返利结果');
    default:
      return isDiscount
        ? intl.get('spfp.ruleMaintenance.view.title.create.discountRule').d('生成折扣规则')
        : intl.get('spfp.ruleMaintenance.view.title.create.generateRule').d('生成返利规则');
  }
}
