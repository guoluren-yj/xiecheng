/*
 * @Date: 2023-08-22 10:36:05
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getHeaderDS = () => ({
  fields: [
    {
      name: 'supplierCompanyId',
      type: 'object',
      lovCode: 'SSLM.USER_AUTH.COMPANY.PARTNER',
      lovPara: { tenantId },
      noCache: true,
    },
    {
      name: 'companyNum',
      label: intl.get('sslm.common.view.company.code').d('公司编码'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierDetail.model.supDetail.companyInfo.createDate').d('注册时间'),
    },
  ],
});

// 采购方公司lovDs
export const getPurchaserCompanyDS = ({ supplierCompanyId } = {}) => ({
  fields: [
    {
      name: 'companyId',
      type: 'object',
      lovCode: 'SSLM.USER_AUTH.CUSTOMER',
      lovPara: { supplierCompanyId },
      label: intl
        .get('sslm.supplierMasterData.model.company.selectPartnerCompany')
        .d('选择合作伙伴'),
      help: intl
        .get('sslm.supplierMasterData.model.company.selectPartnerCompanyMsg')
        .d('选择合作伙伴后，将展示该合作伙伴下公司的主数据信息'),
    },
  ],
});
