import React from 'react';
import intl from 'utils/intl';

import {
  Modal,
} from 'choerodon-ui/pro';

import {
  getResponse,
  getCurrentUserId,
  getUserOrganizationId,
} from 'utils/utils';

import {
  destroyAccount,
} from '@/services/simplifiedRegisterService';

const userId = getCurrentUserId();
const userOrganizationId = getUserOrganizationId();

/**
 * 格式化国际化手机号格式
 * internationalTelMeaning 国别码meaning字段
 * phone 手机号码
 */
export function formatInternationalTel(internationalTelMeaning, phone) {
  let value = phone;
  if (internationalTelMeaning && phone) {
    value = `${internationalTelMeaning} | ${phone}`;
  }
  return <span>{value}</span>;
}

// 防XSS漏洞，供应商认证附件目录名
export const FILE_BUCKET_DIRECTORY = 'spfm-business-license';

export const getErrorMsg = (code = '') => {
  const messages = {
    'company.name.repeat': intl.get('spfm.enterprise.model.legal.companyName').d('企业名称'),
    'unified.social.code.repeat': intl
      .get('spfm.enterprise.model.legal.unifiedSocialCode')
      .d('统一社会信用代码号'),
    'duns.code.repeat': intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码'),
    'business.registration.number.repeat': intl
      .get('spfm.enterprise.model.legal.businessRegistrationNumber')
      .d('企业注册登记号/税号'),
    'spfm.id.num.repeat.err': intl.get('hzero.common.model.identityNum').d('身份证号'),
    'spfm.passport.repeat.err': intl
      .get('spfm.supplierRegister.model.legal.passportNum')
      .d('护照号/通行证号'),
  };
  return messages[code] || '';
};

// 更换企业弹窗
export const openChangeCompanyModal = (params = {}) => {
  const { fieldName, callBack } = params;
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    okText: intl.get('sslm.common.view.button.changeCompany').d('更换企业'),
    cancelText: intl.get('sslm.common.view.button.enterpriseRecovery').d('企业找回'),
    children: (
      <>
        <div>
          {intl
            .get('sslm.common.view.message.companyRepeat', {
              name: fieldName,
            })
            .d(
              `该${fieldName}已在本平台注册，如需加入该企业请发起企业找回；如需修改企业信息请选择更换企业。`
            )}
        </div>
        <div>
          {intl
            .get('sslm.common.view.message.companyRepeatTips')
            .d(
              '注意：选择企业找回，则将为您注销账号并自动退出登录，便于释放手机号/邮箱进行企业找回；退出登录后请关闭页面重新打开，在首页点击“企业找回”加入企业。'
            )}
        </div>
      </>
    ),
    onCancel: () => {
      return new Promise((resolve) => {
        const payload = [
          {
            organizationId: userOrganizationId,
            id: userId,
          },
        ];
        destroyAccount(payload)
          .then((res) => {
            if(getResponse(res)){
              if(callBack){
                callBack();
              }
            }
          })
          .finally(() => resolve(true));
      });
    },
  });
};