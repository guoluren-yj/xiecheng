import { SRM_SSLM } from '_utils/config';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getInvitationInfoDs = ({
  changeReqId,
  // upstageFlag = false,
  supplierCategorySingleFlag = false,
}) => ({
  paging: false,
  fields: [
    {
      name: 'supplierCompanyName',
      type: 'string',
      disabled: true,
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.supplierName').d('供应商名称'),
    },
    {
      name: 'companyObj',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSLM.ENTERING_INVITE_COMPANY',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.inviterCompany')
        .d('邀请合作公司'),
      textField: 'companyName',
      required: true,
      dynamicProps: {
        multiple: ({ record }) => {
          return +record.get('levelTypeFlag') === 0;
        },
        lovPara: ({ dataSet }) => {
          return {
            partnerCompanyId: dataSet.getState('partnerCompanyId'),
          };
        },
      },
      transformResponse: (value, data) => {
        if (+data.levelTypeFlag === 0) {
          if (!isEmpty(data)) {
            const val = data.companyList;
            return val;
          } else {
            return null;
          }
        }
      },
    },
    {
      name: 'companyId',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.inviter').d('邀请方'),
      bind: 'companyObj.companyId',
    },
    {
      name: 'companyNum',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.inviter').d('邀请方'),
      bind: 'companyObj.companyNum',
    },
    {
      name: 'companyName',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.inviter').d('邀请方'),
      bind: 'companyObj.companyName',
    },
    {
      name: 'autoPartnerFlag',
      lookupCode: 'HPFM.FLAG',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.partnerships')
        .d('自动建立合作关系'),
      defaultValue: 1,
    },
    {
      name: 'levelTypeFlag',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.levelTypeOrg').d('集团级'),
      defaultValue: 0,
      dynamicProps: {
        required: ({ record }) => {
          return +record.get('autoPartnerFlag') === 1;
        },
      },
    },
    {
      name: 'privateFlag',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.privateFlag').d('私有化'),
      defaultValue: 0,
      // dynamicProps: {
      //   required: ({ record }) => {
      //     return +record.get('autoPartnerFlag') === 1;
      //   },
      // },
    },
    {
      name: 'stageId',
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.stageId').d('生命周期阶段'),
    },
    {
      name: 'investigateFlag',
      lookupCode: 'HPFM.FLAG',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.sendQuestionnaire')
        .d('发送调查表'),
      defaultValue: 0,
      dynamicProps: {
        required: ({ record }) => {
          return +record.get('autoPartnerFlag') === 1;
        },
      },
    },
    {
      name: 'investigateType',
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.investigateType')
        .d('调查表类型'),
      dynamicProps: {
        required: ({ record }) => {
          return +record.get('autoPartnerFlag') === 1 && +record.get('investigateFlag') === 1;
        },
      },
    },
    {
      name: 'investigateWrite',
      type: 'string',
      lookupCode: 'SSLM_SUPPLIER_ENTER_INVESTIG_WRITE',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.maintenanceParty')
        .d('调查表维护方'),
      dynamicProps: {
        required: ({ record }) => {
          return +record.get('investigateFlag') === 1;
        },
      },
    },
    {
      name: 'mergerInvestigateFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.mergeSurveyForms')
        .d('合并调查表'),
      defaultValue: '1',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('investigateWrite') === 'SUPPLIER';
        },
      },
    },
    {
      name: 'investigateTemplateObj',
      type: 'object',
      lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.template').d('调查表模板'),
      textField: 'templateName',
      valueField: 'investigateTemplateId',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            organizationId,
            enabledFlag: 1,
            investigateType: record.get('investigateType'),
          };
        },
        required: ({ record }) => {
          return +record.get('autoPartnerFlag') === 1 && +record.get('investigateFlag') === 1;
        },
      },
    },
    {
      name: 'investigateTemplateId',
      bind: 'investigateTemplateObj.investigateTemplateId',
    },
    {
      name: 'templateCode',
      bind: 'investigateTemplateObj.templateCode',
    },
    {
      name: 'templateName',
      bind: 'investigateTemplateObj.templateName',
    },
    {
      name: 'investigateRemark',
      type: 'string',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.remark').d('调查说明'),
    },
    {
      name: 'categoryIds',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      type: 'object',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.categoryDescriptions')
        .d('供应商分类'),
      noCache: true,
      multiple: !supplierCategorySingleFlag,
      textField: 'categoryDescription',
      lovPara: { enabledFlag: 1, parentCategoryId: 0 },
      transformResponse: (value, data) => {
        const { categoryList, categoryDescription } = data;
        if (value) {
          if (!supplierCategorySingleFlag) {
            return categoryList;
          } else {
            return { categoryId: value, categoryDescription };
          }
        } else {
          return null;
        }
      },
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
              const parentCategoryId = record.get('parentCategoryId');
              if (parentCategoryId) {
                const parentRecord = dataSet.find(
                  rec => rec.get('categoryId') === parentCategoryId
                );
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
      name: 'itemCategoryIds',
      type: 'object',
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.categoryClassify')
        .d('准入品类'),
      noCache: true,
      multiple: true,
      textField: 'categoryName',
      lovPara: {
        source: 'supplierEnter',
        businessObjectCode: 'SRM_C_SSLM_FIRM_ENTERING_PARENT',
      },
      transformResponse: (value, data) => {
        const { itemCaegoryList } = data;
        if (!isEmpty(itemCaegoryList)) {
          return itemCaegoryList;
        } else {
          return value;
        }
      },
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('checkFlag') !== false,
          },
        },
      },
    },
    {
      name: 'purchaseAgentIds',
      type: 'object',
      lovCode: 'SPFM.TENANT_PURCHASE_AGENT',
      label: intl.get('sslm.supplierEntryDetail.model.invitationInfo.purchaseAgent').d('采购员'),
      multiple: true,
      transformResponse: (value, data) => {
        const { purchaseAgentList } = data;
        if (!isEmpty(purchaseAgentList)) {
          return purchaseAgentList;
        }
        return value;
      },
    },
    {
      name: 'remark',
      type: 'string',
      label: intl
        .get('sslm.supplierEntryDetail.model.invitationInfo.cooperationRemark')
        .d('合作说明'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/firm-entering-parents/${changeReqId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.INVITATION_INFO',
          ...queryParams,
          ...other,
        },
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'countryObj') {
        record.set('regionId', null);
        record.set('regionPathName', null);
      }
      if (name === 'levelTypeFlag' && !isEmpty(record.get('companyObj'))) {
        record.set('companyObj', null);
      }
      if (name === 'investigateWrite') {
        if (value === 'PURCHASE') {
          record.set('mergerInvestigateFlag', null);
        } else {
          record.set('mergerInvestigateFlag', '1');
        }
      }
      if (name === 'investigateType' && !isEmpty(record.get('investigateTemplateObj'))) {
        record.set('investigateTemplateObj', null);
      }
    },
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

const getOtherInfoDs = ({ changeReqId }) => ({
  paging: false,
  fields: [],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-others/entering/getSupChangeOther`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.OTHER_FORM',
          ...queryParams,
          ...other,
          changeReqId,
          dataSource: 3,
        },
      };
    },
    // destroy: ({ data, params }) => ({
    //   url: ``,
    //   method: 'POST',
    //   data,
    //   params: {
    //     ...params,
    //     customizeUnitCode: customizeUnitCode.join(),
    //   },
    // }),
    // },
    // events: {
    //   load: ({ dataSet }) => {
    //     dataSet.forEach((record) => {
    //       if (record.data.reqStatus === 'RELEASE_APPROVING') {
    //         Object.assign(record, { selectable: false });
    //       }
    //     });
    //   },
  },
  events: {
    update: ({ record, name }) => {
      if (name === 'countryObj') {
        record.set('regionId', null);
        record.set('regionPathName', null);
      }
    },
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

export { getInvitationInfoDs, getOtherInfoDs };
