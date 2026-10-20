/*
 * @Date: 2023-08-22 10:36:05
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getIndexDS = ({ tenantId, supplierCompanyId }) => ({
  autoCreate: true,
  fields: [
    {
      name: 'companyNum',
      label: intl.get('sslm.common.view.company.code').d('公司编码'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierDetail.model.supDetail.companyInfo.createDate').d('注册时间'),
    },
    {
      name: 'count',
      label: intl.get('sslm.supplierDetail.model.commpany.updateRecord').d('更新记录'),
    },
    {
      name: 'eRPInfo',
      label: intl.get('sslm.supplierDetail.model.commpany.localSuppliers').d('关联本地供应商'),
    },
    {
      name: 'cooperationTime',
      type: 'dateTime',
      label: intl.get('sslm.supplierDetail.model.commpany.cooperationTime').d('合作开始时间'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierDetail.model.supplierDetail.lastEditDate').d('最近更新'),
    },
    {
      name: 'companyId',
      type: 'object',
      lovCode: 'SSLM.USER_AUTH.COMPANY',
      lovPara: { tenantId, partnerCompanyId: supplierCompanyId },
      label: intl.get('sslm.supplierDetail.model.company.selectCompany').d('选择采购方公司'),
      help: intl
        .get('sslm.supplierDetail.model.company.selectCompanyMsg')
        .d('选择公司后，将展示该公司下供应商所处的生命周期阶段及相关的主数据信息'),
    },
    {
      name: 'partnerPurchaseAgentName',
      label: intl.get(`sslm.common.model.buyer`).d('采购员'),
    },
  ],
});
