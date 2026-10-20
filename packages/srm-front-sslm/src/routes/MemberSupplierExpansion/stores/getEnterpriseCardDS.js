/*
 * @Date: 2024-08-05 16:32:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

export const enterpriseCardDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'interBusinessShield',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.memberExpansion.model.checkbox.shield').d('屏蔽'),
    },
    {
      name: 'logoUrl',
    },
    {
      name: 'legalRepName',
      label: intl.get('sslm.supplierManage.model.supplierManage.legalRepName').d('法定代表人'),
    },
    {
      name: 'registeredCapital',
      type: 'number',
      label: intl
        .get('sslm.supplierManage.model.supplierManage.registeredCapital')
        .d('注册资金(万元)'),
    },
    {
      name: 'currencyName',
      label: intl.get('sslm.common.model.field.registeredCurrency').d('注册币种'),
    },
    {
      name: 'buildDate',
      type: 'date',
      label: intl.get('sslm.supplierManage.model.supplierManage.buildDate').d('成立日期'),
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'industryNames',
      label: intl.get('sslm.common.model.field.relatedIndustry').d('所处行业'),
    },
    {
      name: 'industryCategoryNames',
      label: intl
        .get('sslm.supplierManage.model.supplierManage.industryCategoryName')
        .d('主营品类'),
    },
    {
      name: 'riskScanDate',
      type: 'dateTime',
      label: intl.get('sslm.common.model.field.latestScanningTime').d('最近扫描时间'),
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
    {
      name: 'count',
      label: intl.get('sslm.supplierDetail.model.commpany.updateRecord').d('更新记录'),
    },
    {
      name: 'ERPInfo',
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
  ],
});
