import { isEmpty, isArray } from 'lodash';

import { notification } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import {
  checkBlackListSupplier as queryBlackListSupplier,
  batchQueryBlackListSupplier,
} from '@/services/supplierInviteManageServices';

const getEffectiveValueByType = (key = '') => {
  const keyObj = {
    inviteCooperate: 1,
    inviteRegister: 2,
    supplierEntry: 3,
    supplierActiveInvite: 4,
  };
  return keyObj[key] || '';
};

export const checkBlackListSupplier = async (params = {}) => {
  if (isEmpty(params)) {
    return true;
  }
  const {
    supplierInfo = {},
    effectiveType = '',
    notificationMsg = '',
    weakCheckFlag = true,
    purchaserTenantId,
    purchaserCompanyName,
  } = params;
  if (isEmpty(supplierInfo)) {
    return true;
  }
  const {
    companyId,
    companyName,
    businessRegistrationNumber,
    dunsCode,
    organizingInstitutionCode,
    unifiedSocialCode,
  } = supplierInfo || {};
  const payload = {
    hpfmCompanyId: companyId,
    companyName,
    checkType: 0,
    businessRegistrationNumber,
    dunsCode,
    organizingInstitutionCode,
    unifiedSocialCode,
    effectiveScenario: getEffectiveValueByType(effectiveType), // 触发场景标识
    purchaserTenantId, // 采购方租户id
    purchaserCompanyName, // 采购方公司名称
  };
  try {
    const res = await queryBlackListSupplier(payload);
    if (getResponse(res)) {
      // 判断是否前端提示 strongCheckFlag 开启业务规则标识，blackRelationResult => {} 是否有关联名单
      const { blackRelationResult = {}, strongCheckFlag } = res;
      if (!strongCheckFlag) {
        // 没开启业务规则原逻辑
        return true;
      } else {
        // 开启业务规则，判断是否黑名单供应商
        // relation true 收费 前端弱校验提示信息(然后走原逻辑)，false 不收费 走原逻辑
        const { relation } = blackRelationResult;
        if (relation && weakCheckFlag) {
          // 1. 邀请供应商合作右下角提示，返回true
          notification.warning({
            placement: 'bottomRight',
            message:
              notificationMsg ||
              intl
                .get('sslm.common.view.message.blackListRelevantSupplierTips')
                .d('该供应商为黑名单供应商的关联企业，请谨慎进行邀约。'),
          });
          return true;
        }
        return true;
      }
    } else {
      return false;
    }
  } catch (e) {
    return true;
  }
};

export const batchCheckBlackListSupplier = async (params = {}) => {
  if (isEmpty(params)) {
    return true;
  }
  const {
    supplierInfoList = [],
    effectiveType = '',
    // notificationMsg = '',
    weakCheckFlag = true,
  } = params;
  if (isEmpty(supplierInfoList)) {
    return true;
  }
  const payload = supplierInfoList.map(i => {
    const {
      companyId,
      companyName,
      businessRegistrationNumber,
      dunsCode,
      organizingInstitutionCode,
      unifiedSocialCode,
    } = i;
    return {
      hpfmCompanyId: companyId,
      companyName,
      businessRegistrationNumber,
      dunsCode,
      organizingInstitutionCode,
      unifiedSocialCode,
      checkType: 0,
      effectiveScenario: getEffectiveValueByType(effectiveType), // 触发场景标识
    };
  });
  try {
    const res = await batchQueryBlackListSupplier(payload);
    // 返回值是数组
    if (getResponse(res)) {
      if(!isArray(res)){
        return true;
      }
      // 判断是否开启业务规则定义校验，取第一条判断就行
      const { strongCheckFlag } = res[0];
      if (!strongCheckFlag) {
        // 没开启业务规则原逻辑
        return true;
      } else {
        // strongCheckFlag 开启业务规则标识，需报错提示
        // blackRelationResult => { relation: boolean } 是否有关联名单
        // relation true 有黑名单关联关系 前端弱校验提示信息(然后走原逻辑)，false 不收费 走原逻辑
        const supplierCompanyList = [];
        res.forEach((r) => {
          const { blackRelationResult = {}, companyName: supplierCompanyName = "" } = r;
          const { relation } = blackRelationResult;
          if(relation){
            supplierCompanyList.push(supplierCompanyName);
          }
        });
        if (weakCheckFlag && !isEmpty(supplierCompanyList)) {
          const supplierCompanyNameStr = supplierCompanyList.join('、');
          notification.warning({
            placement: 'bottomRight',
            message: intl
            .get('sslm.common.view.message.batchBlackListSupplierTips', {
              supplierCompany: supplierCompanyNameStr,
            })
            .d(`【${supplierCompanyNameStr}】为黑名单供应商的关联企业，请谨慎进行邀约`),
          });
        }
        return true;
      }
    } else {
      return false;
    }
  } catch (e) {
    return true;
  }
};
