/*
 * @Date: 2023-04-23 10:42:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getIndexDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'supplierCompanyName',
      required: true,
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'supplierCompanyId',
    },
    {
      name: 'companyLov',
      required: true,
      type: 'object',
      lovCode: 'SSLM.TENANT_COMPANY',
      label: intl.get('sslm.common.view.company.subsidiary').d('子公司'),
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId,
          supplierCompanyId: record.get('supplierCompanyId'),
        }),
      },
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyLov.companyName',
    },
    {
      name: 'partnerFlag', // 子公司带出的是否合作， 1 合作、0 未合作
    },
    {
      name: 'operateType',
      lookupCode: 'SSLM.SUP.WORK_BENCH_INTRO_TYPE',
      label: intl.get('sslm.common.view.company.operateType').d('操作类型'),
    },
    {
      name: 'isSynergy',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('sslm.workbench.view.stepTitle.isSynergy').d('供应商是否在线协同'),
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      switch (name) {
        case 'supplierCompanyName':
          record.set({
            companyLov: null,
            partnerFlag: null,
            operateType: null,
            isSynergy: null,
          });
          break;
        case 'companyLov':
          record.set({
            partnerFlag: value ? value.partnerFlag || 0 : null,
            operateType: null,
            isSynergy: null,
          });
          break;
        default:
          break;
      }
    },
  },
});
