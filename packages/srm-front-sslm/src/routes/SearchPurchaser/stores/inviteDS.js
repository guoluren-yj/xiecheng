/*
 * @Date: 2023-08-24 15:43:20
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { getUserOrganizationId } from 'utils/utils';
import { isArray, isEmpty, isNil } from 'lodash';

const userOrganizationId = getUserOrganizationId();
// 发起邀约
const inviteDS = ({ supplierCategoryFlag } = {}) => ({
  autoCreate: true,
  fields: [
    {
      name: 'groupLevelSupplierFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('spfm.companySearch.view.message.groupLevelSupplierFlag').d('集团级供应商'),
      help: intl
        .get('spfm.companySearch.view.message.groupLevelMsg')
        .d('若勾选，则您的公司将给采购方集团下所有公司发送邀约'),
      transformRequest: value => (isNil(value) ? 0 : value),
    },
    {
      name: 'companyId',
      label: intl.get('spfm.companySearch.view.message.inviter').d('邀请方'),
      type: 'object',
      required: true,
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      lovPara: {
        organizationId: userOrganizationId,
      },
      transformRequest: value => value && value.companyId,
    },
    {
      name: 'multiSupplierCategoryId',
      label: intl
        .get('spfm.invitationRegister.model.invitation.supplierCategoryCode')
        .d('供应商分类'),
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      multiple: true,
      dynamicProps: {
        required: () => {
          return supplierCategoryFlag;
        },
        lovPara: ({ dataSet }) => {
          const inviteTenantId = dataSet.getState('purchaserTenantId');
          return {
            queryTenantId: inviteTenantId,
          };
        },
      },
      optionsProps: {
        // paging: 'server',
        childrenField: 'children',
        record: {
          dynamicProps: {
            selectable: record => {
              const { hasChild } = record.data;
              return !+hasChild;
            },
          },
        },
      },
      transformRequest: value => {
        if (isArray(value)) {
          return value.map(i => i.categoryId).join(',');
        } else if (!isEmpty(value)) {
          return value.categoryId;
        } else {
          return null;
        }
      },
    },
    {
      name: 'inviteRemark',
      label: intl.get('spfm.companySearch.view.message.inviteRemark').d('邀请说明'),
    },
    // 黑名单校验专用
    {
      name: 'companyName',
      bind: 'companyId.companyName',
    },
  ],
});

const agreementDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'agreementFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
  ],
});

// 隐私协议
export { inviteDS, agreementDS };
