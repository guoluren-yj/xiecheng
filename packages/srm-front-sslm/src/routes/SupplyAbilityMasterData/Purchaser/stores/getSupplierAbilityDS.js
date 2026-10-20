/*
 * * 主数据（采）供应商维度列表ds
 * @Date: 2024-06-20 15:23:43
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const codeList = [
  'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.SUPPLIER_TABLE',
  'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_LIST.SUPPLIER_SEARCH',
];

// 供货能力清单-供应商维度
const getSupplierAbilityDs = () => ({
  primaryKey: 'supplyAbilityId',
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.common.view.supplier.stageDescription').d('生命周期阶段'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.name').d('公司'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sslm.common.view.created.date').d('创建日期'),
    },
    {
      name: 'lastUpdateUserName',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateUserName').d('最后更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'date',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateDate').d('最后更新日期'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode: codeList.join(','),
        },
      };
    },
  },
});

export default getSupplierAbilityDs;
