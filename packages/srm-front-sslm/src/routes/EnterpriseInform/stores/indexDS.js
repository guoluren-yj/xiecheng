/*
 * EnterpriseInform - 企业信息变更新建弹窗
 * @date: 2022/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const indexDS = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseName').d('企业名称'),
      name: 'companyLov',
      type: 'object',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      required: true,
      lovPara: {
        tenantId: organizationId,
      },
      noCache: true,
      ignore: 'always',
    },
    {
      name: 'companyNum',
      bind: 'companyLov.companyNum',
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      label: intl.get('sslm.enterpriseInform.model.application.changeContent').d('变更内容'),
      name: 'changeContent',
      lookupCode: 'SSLM.ENTERPRISE_CHANGE_CONTENT',
      required: true,
      computedProps: {
        help: ({ record }) => {
          if (record.get('changeContent') === 'PUBLIC') {
            return intl
              .get('sslm.enterpriseInform.view.message.platformTips')
              .d(
                '变更对平台所有采购方可见的信息，如公司名称、法人代表、公开联系人等，变更内容将对所有合作的采购方生效。'
              );
          } else if (record.get('changeContent') === 'purchaser') {
            return intl
              .get('sslm.enterpriseInform.view.message.purchaserTips')
              .d(
                '变更所选采购方的特有业务信息，如个性化字段、对接该采购方的联系人、指定的资质文件等，变更内容只对所选采购方生效。'
              );
          } else {
            return '';
          }
        },
      },
    },
    {
      label: intl.get('sslm.enterpriseInform.model.application.latitudeChange').d('变更维度'),
      name: 'changeLevel',
      lookupCode: 'SSLM.SUPPLIER_CHANGE_LEVEL',
      computedProps: {
        required: ({ record }) => !!(record.get('changeContent') !== 'PUBLIC'),
        // disabled: ({ record }) => !!(record.get('changeContent') === 'PUBLIC'),
        help: ({ record }) => {
          if (record.get('changeLevel') === 'GROUP') {
            return intl
              .get('sslm.enterpriseInform.view.message.groupTips')
              .d(
                '如您与采购方下多家子公司有合作关系，选择集团级维度变更后，变更内容将对所有子公司生效。'
              );
          } else if (record.get('changeLevel') === 'COMPANY') {
            return intl
              .get('sslm.enterpriseInform.view.message.companyTips')
              .d(
                '如您与采购方下多家子公司有合作关系，选择公司级维度变更后，变更内容只对所选的子公司一家生效。'
              );
          } else {
            return '';
          }
        },
      },
    },
    {
      label: intl.get('sslm.enterpriseInform.model.application.company').d('对应变更采购方'),
      name: 'partnerCompanyLov',
      type: 'object',
      dynamicProps: {
        lovCode: ({ record }) =>
          record.get('changeLevel') === 'COMPANY'
            ? 'SSLM.COMPANY_CUSTOMER'
            : 'SSLM.INFO_CHANGE_GROUP',
        required: ({ record }) => !!(record.get('changeContent') !== 'PUBLIC'),
        disabled: ({ record }) => !!(record.get('changeContent') === 'PUBLIC'),
        lovPara: ({ record }) => {
          return {
            companyId: record.get('companyId'),
            tenantId: record.get('changeLevel') === 'COMPANY' ? organizationId : undefined,
          };
        },
      },
      noCache: true,
      ignore: 'always',
    },
    {
      name: 'partnerCompanyId',
      bind: 'partnerCompanyLov.partnerCompanyId',
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'companyLov') {
        record.set({
          partnerCompanyLov: null,
          companyNum: (value || {}).companyNum,
        });
      }
      if (name === 'changeContent') {
        record.set({
          changeLevel: null,
          partnerCompanyLov: null,
        });
      }
      if (name === 'changeLevel') {
        record.set({
          partnerCompanyLov: null,
        });
      }
      if (name === 'partnerCompanyLov') {
        record.set({
          partnerTenantId: (value || {}).partnerTenantId || (value || {}).tenantId,
        });
      }
    },
  },
});

export { indexDS };
