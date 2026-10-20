import { getCurrentOrganizationId } from 'utils/utils';
import { PHONE, NOT_CHINA_PHONE, EMAIL } from 'utils/regExp';
import intl from 'utils/intl';
import { isArray, toString, isNil, isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

const commonFields = ({
  inviteSupplierFlag = false,
  itemCategorySingleFlag = false,
  purchaseAgentSingleFlag = false,
  supplierCategorySingleFlag = false,
  purchaseSelectedRows = [],
} = {}) => [
  {
    name: 'purchaseAgentIdLov',
    label: intl.get('spfm.invitationRegister.model.invitation.purchaseAgentId').d('采购员'),
    type: 'object',
    multiple: !purchaseAgentSingleFlag,
    noCache: true,
    lovCode: 'SPFM.TENANT_PURCHASE_AGENT',
    lovPara: {
      tenantId: organizationId,
    },
    ignore: 'always',
    defaultValue: purchaseAgentSingleFlag
      ? (isArray(purchaseSelectedRows) && purchaseSelectedRows[0]) || {}
      : purchaseSelectedRows,
  },
  {
    name: 'purchaseAgentId',
    bind: 'purchaseAgentIdLov.purchaseAgentId',
    transformRequest: value => {
      if (value) {
        return isArray(value) ? value.join(',') : value;
      } else {
        return value;
      }
    },
  },
  {
    name: 'rePurchaseAgentName',
    bind: 'purchaseAgentIdLov.purchaseAgentName',
    transformRequest: value => {
      if (value) {
        return isArray(value) ? value.join(',') : value;
      } else {
        return value;
      }
    },
  },
  {
    name: 'supplierName',
    label: intl.get('spfm.companySearch.view.message.supplierName').d('供应商企业'),
    required: true,
    disabled: inviteSupplierFlag,
  },
  {
    name: 'roleType',
    label: intl.get('spfm.companySearch.view.message.supplierRole').d('供应商角色'),
    lookupCode: 'SPFM.PARTNER_INVITE_ROLE_TYPE',
    defaultValue: 'SALES',
  },
  {
    name: 'levelTypeFlag',
    type: 'string',
    required: true,
    lookupCode: 'HPFM.FLAG',
    defaultValue: '0',
    label: intl.get('spfm.companySearch.view.message.levelTypeOrg').d('集团级'),
    help: intl
      .get(`spfm.companySearch.view.message.groupLevelNotice`)
      .d('若勾选，则在供应商同意邀约后，将和您的集团下所有的公司都建立合作伙伴关系'),
    transformResponse: value => {
      return isNil(value) ? value : toString(value);
    },
    transformRequest: value => {
      return value ? Number(value) : 0;
    },
  },
  {
    name: 'investigateType',
    label: intl.get('spfm.companySearch.view.message.investigateType').d('调查表类型'),
    lookupCode: 'SSLM.INVESTIGATE_TYPE',
    dynamicProps: {
      required: ({ record }) => {
        const { autosendInvestigateFlag, sendRegisterInvestigateFlag } = record.get([
          'autosendInvestigateFlag',
          'sendRegisterInvestigateFlag',
        ]);
        return inviteSupplierFlag
          ? !!Number(autosendInvestigateFlag)
          : !!Number(autosendInvestigateFlag) || Number(sendRegisterInvestigateFlag);
      },
      disabled: ({ record }) => {
        const { autosendInvestigateFlag, sendRegisterInvestigateFlag } = record.get([
          'autosendInvestigateFlag',
          'sendRegisterInvestigateFlag',
        ]);
        return inviteSupplierFlag
          ? !Number(autosendInvestigateFlag)
          : !Number(autosendInvestigateFlag) && !Number(sendRegisterInvestigateFlag);
      },
    },
  },
  {
    name: 'investigateTemplateIdLov',
    type: 'object',
    lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
    label: intl.get('spfm.companySearch.view.message.investigateTemplate').d('调查表模板'),
    dynamicProps: {
      required: ({ record }) => {
        const { autosendInvestigateFlag, sendRegisterInvestigateFlag } = record.get([
          'autosendInvestigateFlag',
          'sendRegisterInvestigateFlag',
        ]);
        return inviteSupplierFlag
          ? !!Number(autosendInvestigateFlag)
          : !!Number(autosendInvestigateFlag) || Number(sendRegisterInvestigateFlag);
      },
      disabled: ({ record }) => !record.get('investigateType'),
      lovPara: ({ record }) => {
        const companyIds = record.get('companyIds') || record.get('inviteCompanyIds');
        return {
          organizationId,
          enabledFlag: 1,
          investigateType: record.get('investigateType'),
          companyIds: isArray(companyIds) ? companyIds.join() : null,
          assignMenuScope: 'srm.partner.my-partner.supplier-invite',
        };
      },
    },
    noCache: true,
    ignore: 'always',
  },
  {
    name: 'investigateTemplateId',
    bind: 'investigateTemplateIdLov.investigateTemplateId',
  },
  {
    name: 'multiSupplierCategoryIdLov',
    type: 'object',
    lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
    label: intl
      .get('spfm.invitationRegister.model.invitation.supplierCategoryCode')
      .d('供应商分类'),
    multiple: !supplierCategorySingleFlag,
    noCache: true,
    ignore: 'always',
    lovPara: {
      tenantId: organizationId,
      enabledFlag: 1,
      parentCategoryId: 0,
    },
    textField: 'categoryDescription',
    optionsProps: {
      paging: 'server',
      idField: 'categoryId',
      parentIdField: 'parentCategoryId',
      record: {
        dynamicProps: {
          selectable: record => record.get('checkFlag'),
        },
      },
      events: {
        select: ({ dataSet, record }) => {
          if (!supplierCategorySingleFlag) {
            // 仅多选时处理联动
            const parentCategoryId = record.get('parentCategoryId');
            if (parentCategoryId) {
              const parentRecord = dataSet.find(rec => rec.get('categoryId') === parentCategoryId);
              if (parentRecord) {
                dataSet.select(parentRecord);
              }
            }
          }
        },
      },
    },
  },
  {
    name: 'multiSupplierCategoryId',
    bind: 'multiSupplierCategoryIdLov.categoryId',
    transformRequest: value => {
      if (value) {
        return isArray(value) ? value.join(',') : value;
      } else {
        return value;
      }
    },
  },
  {
    name: 'categoryIdLov',
    type: 'object',
    lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
    label: intl.get('spfm.invitationRegister.model.invitation.categoryCode').d('准入品类'),
    textField: 'categoryName',
    multiple: !itemCategorySingleFlag,
    lovPara: {
      tenantId: organizationId,
      businessObjectCode: 'SRM_C_SRM_SPFM_PARTNER_INVITE',
    },
    noCache: true,
    optionsProps: {
      paging: 'server',
      idField: 'categoryId',
      parentIdField: 'parentCategoryId',
      record: {
        dynamicProps: {
          selectable: record => record.get('isCheck') !== false,
        },
      },
    },
    ignore: 'always',
  },
  {
    name: 'categoryIds',
    bind: 'categoryIdLov.categoryId',
    transformRequest: value => {
      if (value) {
        return isArray(value) ? value : [value];
      } else {
        return value;
      }
    },
  },
  // 供应商子角色
  {
    name: 'childRoleId',
    type: 'object',
    lovCode: 'SRM.PURCHASER_SALES_ROLE_LIST',
    label: intl
      .get('sslm.supplierInvite.model.supplierInvite.suppplierChildRole')
      .d('供应商子角色'),
    lovPara: {
      tenantId: organizationId,
    },
    noCache: true,
    transformRequest: value => value && value.id,
  },
  {
    name: 'toCycleStageId',
    label: intl.get('spfm.invitationRegister.model.invitation.lifeCycle').d('生命周期'),
    lookupCode: 'SSLM.LIFE_CYCLE_STAGE',
  },
];

// 邀请供应商弹窗
const inviteModalDS = ({
  itemCategorySingleFlag,
  purchaseAgentSingleFlag,
  supplierCategorySingleFlag,
  purchaseSelectedRows,
} = {}) => ({
  // autoCreate: true,
  fields: [
    ...commonFields({
      inviteSupplierFlag: true,
      itemCategorySingleFlag,
      purchaseAgentSingleFlag,
      supplierCategorySingleFlag,
      purchaseSelectedRows,
    }),
    {
      name: 'mergerInvitationFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      label: intl.get('sslm.supplierInvite.model.invite.mergerInvitationFlag').d('合并邀约'),
      help: intl
        .get('sslm.supplierInvite.view.invite.mergerInvitationRemark')
        .d(
          '若勾选，如果您选择了多个邀请方，则将合并为一条邀约记录，供应商只需同意一次就会和您选择的多个邀请方都建立合作伙伴关系；如果选择发送调查表，也只需填写一份调查表，且填写的调查表内容会共享至勾选的多个邀请方。否则，供应商需要单独同意每个邀请方的邀约，也需针对每个邀请方分别填写调查表'
        ),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'autosendInvestigateFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      label: intl.get('spfm.companySearch.view.message.sendInvestigation').d('发送调查表'),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'companyIdLov',
      label: intl.get(`spfm.companySearch.view.message.inviter`).d('邀请方'),
      type: 'object',
      noCache: true,
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          const levelTypeFlag = !!(record.get('levelTypeFlag') === '1');
          return {
            organizationId,
            // 集团集邀约，传一个标识给后端适配器
            levelTypeFlag: levelTypeFlag ? 1 : undefined,
          };
        },
        // multiple: ({ record }) => record.get('levelTypeFlag') === '0',
        multiple: ({ record }) => {
          // 集团级: 邀请方-单选 | 销售员姓名-多选
          // 非集团: 邀请方-默认多选 | 销售员姓名-默认多选 (其中有一个多选，另一个单选)
          const levelTypeFlag = record.get('levelTypeFlag') === '1';
          const salesPersonIds = record.get('salesPersonIds');
          if (levelTypeFlag) {
            return !levelTypeFlag;
          } else {
            const onlyOne = isArray(salesPersonIds) && salesPersonIds.length <= 1;
            const multipleFlag = !isArray(salesPersonIds) || onlyOne;
            return multipleFlag;
          }
        },
      },
      ignore: 'always',
    },
    {
      name: 'companyIds',
      bind: 'companyIdLov.companyId',
    },
    {
      name: 'salesPersonIdsLov',
      label: intl.get('sslm.supplierInvite.model.invite.salesName').d('销售员姓名'),
      type: 'object',
      noCache: true,
      lovCode: 'SPFM.QUERY_SALES_PERSON',
      required: true,
      ignore: 'always',
      dynamicProps: {
        multiple: ({ record }) => {
          const levelTypeFlag = record.get('levelTypeFlag') === '1';
          const companyIds = record.get('companyIds');
          if (levelTypeFlag) {
            return levelTypeFlag;
          } else {
            const onlyOne = isArray(companyIds) && companyIds.length <= 1;
            const multipleFlag = !isArray(companyIds) || onlyOne;
            return multipleFlag;
          }
        },
        lovPara: ({ record, dataSet }) => {
          const { activeKey, ...rest } = dataSet.getState('salesPersonIdsLovParams') || {};
          // 会员供应商额外参数
          const othersParams =
            activeKey === 'memberSupplier'
              ? {
                  ...rest,
                  memberInfoFlag: 1,
                }
              : {};
          return {
            ...othersParams,
            supplierTenantId: record.get('inviteTenantId'),
            supplierCompanyId: record.get('srmCompanyId'),
          };
        },
      },
    },
    {
      name: 'salesPersonIds',
      bind: 'salesPersonIdsLov.id',
      transformRequest: value => {
        if (value) {
          return isArray(value) ? value : [value];
        } else {
          return value;
        }
      },
    },
    {
      name: 'salesPersonEmail',
      label: intl.get('sslm.supplierInvite.model.invite.salesMail').d('销售员邮箱'),
      disabled: true,
    },
    {
      name: 'salesInternationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      disabled: true,
    },
    {
      name: 'salesPersonPhone',
      type: 'tel',
      regionField: 'salesInternationalTelCode',
      label: intl.get('sslm.supplierInvite.model.invite.salesPhone').d('销售员手机号'),
      disabled: true,
    },
    {
      name: 'remark',
      label: intl.get('spfm.disposeInvite.view.message.remark').d('调查说明'),
      dynamicProps: {
        disabled: ({ record }) => record.get('autosendInvestigateFlag') === '0',
      },
    },
    {
      name: 'inviteRemark',
      label: intl.get('spfm.companySearch.view.message.inviteRemark').d('邀请说明'),
    },
  ],
  events: {
    update: ({ value, record, name }) => {
      switch (name) {
        case 'levelTypeFlag':
          {
            let newCompanyIdLov = null;
            const companyInfo = record.get('companyIdLov');
            const singleFlag = Number(value) === 1;
            if (!isEmpty(companyInfo)) {
              // 切换到单选
              if (singleFlag) {
                if (companyInfo.length === 1) {
                  const { companyId, companyName } = companyInfo[0];
                  newCompanyIdLov = {
                    companyId,
                    companyName,
                  };
                }
              } else {
                const { companyId, companyName } = companyInfo;
                newCompanyIdLov = [
                  {
                    companyId,
                    companyName,
                  },
                ];
              }
              record.init('companyIdLov', newCompanyIdLov);
            }
          }
          break;
        case 'salesPersonIdsLov':
          if (!isEmpty(value)) {
            let otherFieldObj = {}; // 个性化字段集合
            // 多选
            if (isArray(value)) {
              const data = value[0];
              // 查询其他信息个性化字段, 选多个销售员只取一个
              const {
                email,
                phone,
                internationalTelCode,
                id,
                loginName,
                realName,
                _token,
                ...others
              } = data;
              otherFieldObj = others;
              const onlyOne = value.length === 1;
              if (onlyOne) {
                record.set({
                  salesPersonEmail: email,
                  salesPersonPhone: phone,
                  salesInternationalTelCode: internationalTelCode,
                });
              } else {
                record.set({
                  salesPersonEmail: null,
                  salesPersonPhone: null,
                  salesInternationalTelCode: null,
                });
              }
              // 单选
            } else {
              const {
                email,
                phone,
                internationalTelCode,
                id,
                loginName,
                realName,
                _token,
                ...others
              } = value;
              otherFieldObj = others;
              record.set({
                salesPersonEmail: email,
                salesPersonPhone: phone,
                salesInternationalTelCode: internationalTelCode,
              });
            }
            if (!isEmpty(otherFieldObj)) {
              // 设置个性化字段
              record.setState('otherFieldObj', otherFieldObj);
              record.set({ ...otherFieldObj });
            }
          } else {
            const clearObj = {};
            const otherFieldObj = record.getState('otherFieldObj');
            // 清空时清空个性化字段
            if (!isEmpty(otherFieldObj)) {
              for (const key in otherFieldObj) {
                if (Object.hasOwnProperty.call(otherFieldObj, key)) {
                  clearObj[key] = null;
                }
              }
            }
            record.set({
              ...clearObj,
              salesPersonEmail: null,
              salesPersonPhone: null,
              salesInternationalTelCode: null,
            });
            record.setState('otherFieldObj', null);
          }
          break;
        case 'autosendInvestigateFlag':
          record.set({
            investigateType: null,
            investigateTemplateIdLov: null,
            remark: null,
          });
          break;
        case 'investigateType':
          record.set({
            investigateTemplateIdLov: null,
          });
          break;
        default:
          break;
      }
    },
  },
});

// 注册弹窗
const registerModalDS = ({
  itemCategorySingleFlag,
  purchaseAgentSingleFlag = false,
  supplierCategorySingleFlag,
  purchaseSelectedRows,
} = {}) => ({
  // autoCreate: true,
  fields: [
    ...commonFields({
      inviteSupplierFlag: false,
      itemCategorySingleFlag,
      purchaseAgentSingleFlag,
      supplierCategorySingleFlag,
      purchaseSelectedRows,
    }),
    {
      name: 'supplierErpCode',
      label: intl.get('sslm.supplierInvite.model.invite.supplierErpCode').d('供应商EPR编码'),
    },
    {
      name: 'mergerInvitationFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      label: intl.get('sslm.supplierInvite.model.invite.mergerInvitationFlag').d('合并邀约'),
      help: intl
        .get('sslm.supplierInvite.view.invite.registerMergerInvitationRemark')
        .d(
          '若选择是，如果您选择了多个邀约合作公司，将合并为一条邀约记录，供应商只需同意一次就会和您选择的多个邀请方都建立合作伙伴关系；如果选择发送调查表，也只需填写一份调查表，且填写的调查表内容会共享至选择的多个邀约合作公司。否则，供应商需要单独同意每个公司的邀约，也需针对每个公司分别填写调查表'
        ),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'autosendInvestigateFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      label: intl.get('sslm.supplierInvite.model.invite.sendInvestigation').d('发送邀约调查表'),
      help: intl
        .get('sslm.supplierInvite.model.invite.sendInvestigationTips')
        .d(
          '若勾选是，则供应商认证通过后收到的邀约内将带有您发送的调查表，供应商需填写并提交您审批'
        ),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'companyIdLov',
      label: intl.get(`spfm.companySearch.view.message.invitationRegistration`).d('邀请注册公司'),
      type: 'object',
      noCache: true,
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      required: true,
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
    },
    {
      name: 'companyId',
      bind: 'companyIdLov.companyId',
    },
    {
      name: 'inviteCompanyLov',
      label: intl.get(`spfm.companySearch.view.message.InvitePartnerCompanies`).d('邀约合作公司'),
      type: 'object',
      noCache: true,
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      required: true,
      ignore: 'always',
      dynamicProps: {
        multiple: ({ record }) => record.get('levelTypeFlag') === '0',
      },
    },
    {
      name: 'inviteCompanyIds',
      bind: 'inviteCompanyLov.companyId',
    },
    {
      name: 'supplierMail',
      label: intl.get('sslm.supplierInvite.model.invite.salesMail').d('销售员邮箱'),
      pattern: EMAIL,
      required: true,
    },
    {
      name: 'salesPersonName',
      label: intl.get('sslm.supplierInvite.model.invite.salesName').d('销售员姓名'),
    },
    {
      name: 'autosendPartnerInviteFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      label: intl.get('spfm.invitationRegister.model.invitation.autoSendInviteFlag').d('发送邀约'),
      help: intl
        .get('sslm.supplierInvite.model.invite.autoSendInvite')
        .d('若选择是，则供应商认证通过后，需要手动处理邀约，同意邀约后才会与其建立合作伙伴关系'),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'autobuildPartnerFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '1',
      label: intl
        .get('spfm.invitationRegister.model.invitation.autoPartnerFlag')
        .d('自动建立合作伙伴关系'),
      help: intl
        .get('sslm.supplierInvite.model.invite.autoPartnerRemark')
        .d('若选择是，则供应商认证通过后，将自动与其建立合作伙伴关系，无需供应商手动处理邀约'),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'purchaseAgentPhone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl
        .get('spfm.invitationRegister.model.invitation.purchaseAgentPhone')
        .d('采购员联系方式'),
      dynamicProps: {
        pattern: ({ record }) =>
          (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'salesInternationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      required: true,
    },
    {
      name: 'salesPersonPhone',
      label: intl.get('sslm.supplierInvite.model.invite.salesPhone').d('销售员手机号'),
      required: true,
      type: 'tel',
      regionField: 'salesInternationalTelCode',
      dynamicProps: {
        pattern: ({ record }) =>
          (record.get('salesInternationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'inviteRegisterRemark',
      label: intl.get('spfm.companySearch.view.message.inviteRemark').d('邀请说明'),
    },
    {
      name: 'inviteInvestigateRemark',
      label: intl.get('spfm.disposeInvite.view.message.remark').d('调查说明'),
      dynamicProps: {
        disabled: ({ record }) => {
          const { autosendInvestigateFlag, sendRegisterInvestigateFlag } = record.get([
            'autosendInvestigateFlag',
            'sendRegisterInvestigateFlag',
          ]);
          return !Number(autosendInvestigateFlag) && !Number(sendRegisterInvestigateFlag);
        },
      },
    },
    {
      name: 'sendRegisterInvestigateFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      label: intl.get('sslm.supplierInvite.model.invite.registerInvestigate').d('发送注册调查表'),
      help: intl
        .get('sslm.supplierInvite.model.invite.registerInvestigateTips')
        .d(
          '若勾选是，则供应商将在注册认证过程中填写您发送的调查表；如果【注册策略配置】中有配置的默认注册调查表，将被邀请注册的调查表直接替换'
        ),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'cancelRegisterInvestigateFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      label: intl.get('sslm.supplierInvite.model.invite.cancelInvestigate').d('取消默认注册调查表'),
      help: intl
        .get('sslm.supplierInvite.model.invite.cancelInvestigateTips')
        .d(
          '若勾选是，供应商无需在注册认证过程中填写按照【注册策略配置】内条件生成的调查表；若勾选否，供应商需要在注册认证中和收到的邀约内分别填写两份调查表，都将回写主数据'
        ),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'showRiskScanCard',
      label: intl.get('sslm.supplierInvite.model.invite.showRiskScanCard').d('展示风险档案卡片'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      ignore: 'always',
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      switch (name) {
        case 'levelTypeFlag':
          record.set({
            companyIdLov: null,
            // salesPersonName: null,
            inviteCompanyLov: null,
          });
          break;
        case 'autosendPartnerInviteFlag':
          if (!Number(value)) {
            record.set({
              inviteInvestigateRemark: null,
            });
          }
          // 【自动建立合作关系】为“否”，【发送邀约】为“是”时展示
          if (!(!!Number(value) && !Number(record.get('autobuildPartnerFlag')))) {
            record.set({
              autosendInvestigateFlag: '0',
            });
          }
          break;
        case 'autobuildPartnerFlag':
          if (!Number(value)) {
            record.set({
              autosendPartnerInviteFlag: '1',
              // 自动建立合作伙伴关系 选否 不展示
              sendRegisterInvestigateFlag: '0',
            });
          }
          // 【自动建立合作关系】为“否”，【发送邀约】为“是”时展示
          if (!(!Number(value) && !!Number(record.get('autosendPartnerInviteFlag')))) {
            record.set({
              autosendInvestigateFlag: '0',
            });
          }
          break;
        case 'autosendInvestigateFlag':
        case 'sendRegisterInvestigateFlag': {
          const investigateRemarkObj = Number(value)
            ? {}
            : {
                inviteInvestigateRemark: null,
              };
          record.set({
            investigateType: null,
            investigateTemplateIdLov: null,
            ...investigateRemarkObj,
          });
          break;
        }
        case 'investigateType':
          record.set({
            investigateTemplateIdLov: null,
          });
          break;
        case 'companyIdLov':
          // 邀约合作公司字段为空时，选择邀请注册公司，自动带出一样的值
          if (!record.get('inviteCompanyLov') || record.get('inviteCompanyLov').length === 0) {
            record.set({
              inviteCompanyLov: record.get('companyIdLov'),
            });
          }
          break;
        case 'purchaseAgentIdLov': {
          let purchaseInfo = {};
          // 清空采购员不清空对应的手机号
          if (purchaseAgentSingleFlag) {
            purchaseInfo = value;
          } else {
            const onlyOnePurchase = isArray(value) && value.length === 1;
            purchaseInfo = onlyOnePurchase ? value[0] : {};
          }
          if (!isEmpty(purchaseInfo)) {
            const { phone, internationalTelCode } = purchaseInfo;
            // 采购员手机号没值不需要带出
            const phoneInfo = phone
              ? {
                  internationalTelCode,
                  purchaseAgentPhone: phone,
                }
              : {};
            record.set(phoneInfo);
          }
          break;
        }
        default:
          break;
      }
    },
  },
});

export { inviteModalDS, registerModalDS };
