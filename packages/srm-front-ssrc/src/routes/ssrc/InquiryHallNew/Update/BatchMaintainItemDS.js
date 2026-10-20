import intl from 'utils/intl';
import { isEmpty } from 'lodash';

const BatchMaintainItemDS = (options = {}) => {
  const { remote, rfxInfoDS } = options;
  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxIdLov',
        type: 'object',
        lovCode: 'SMDM.TAX',
      },
      {
        name: 'taxId',
        bind: 'taxIdLov.taxId',
      },
      {
        name: 'taxRate',
        bind: 'taxIdLov.taxRate',
      },
      {
        /** ********* 华恒生物二开ouIdLov-勿动!!! *********** */
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        valueField: 'ouId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return record.get('prHeaderId') || allowChangeItemsFlag;
          },
          lovPara({ dataSet, record }) {
            const { companyId } = dataSet.queryParameter.headers || {};
            const param = { companyId };
            const lovPara = remote
              ? remote.process(
                  'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_ITEMLINE_TABLE_BATCH_FIELDS_OU_LOVPARA',
                  param,
                  { dataSet, record, rfxInfoDS }
                )
              : param;
            return lovPara;
          },
        },
      },
      {
        name: 'ouName',
        bind: 'ouIdLov.ouName',
      },
      {
        name: 'ouId',
        bind: 'ouIdLov.ouId',
      },
      {
        /** ********* 华恒生物二开invOrganizationIdLov-勿动!!! *********** */
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationIdLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.INV_ORG',
        textField: 'organizationName',
        valueField: 'organizationId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return record.get('prHeaderId') || allowChangeItemsFlag;
          },
          lovPara({ dataSet, record }) {
            const { organizationId = null, companyId = null } =
              dataSet.queryParameter.headers || {};
            const param = {
              ouId: record.get('ouId'),
              enabledFlag: 1,
              companyId,
              organizationId,
            };
            const lovPara = remote
              ? remote.process(
                  'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_ITEMLINE_TABLE_BATCH_FIELDS_INV_ORG_LOVPARA',
                  param,
                  { dataSet, record, rfxInfoDS }
                )
              : param;
            return lovPara;
          },
        },
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationIdLov.organizationName',
      },
      {
        name: 'invOrganizationId',
        bind: 'invOrganizationIdLov.organizationId',
      },
      {
        name: 'projectTaskId',
        label: intl.get('ssrc.common.model.common.projectTaskNme').d('项目任务名称'),
        lovCode: 'SIEC.PROJECT_TASK_TREE',
        type: 'object',
        textField: 'taskName',
        valueField: 'taskId',
        optionsProps: {
          childrenField: 'children',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        transformRequest: (value = {}) => {
          return value?.taskId || null;
        },
        transformResponse: (value) => {
          return value
            ? {
                taskId: value,
              }
            : null;
        },
        dynamicProps: {
          lovPara({ dataSet }) {
            const { secondarySourceCategory } = dataSet.queryParameter.headers || {};
            return {
              businessObjectCode:
                secondarySourceCategory === 'NEW_BID'
                  ? 'SRM_C_SRM_SSRC_BID_HEADER'
                  : 'SRM_C_SRM_SSRC_RFX_HEADER',
            };
          },
        },
      },
      {
        name: 'projectTaskName',
        bind: 'projectTaskId.taskName',
      },
      {
        name: 'expandCompany',
        type: 'object',
        multiple: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expandCompany`).d('拓展公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        lovPara: { enabledFlag: 1 },
        dynamicProps: {},
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.companyId).join(',');
        },
      },
      {
        name: 'expandCompanyMeaning',
        bind: 'expandCompany.companyName',
        multiple: ',',
      },
      {
        name: 'expandInvOrganization',
        type: 'object',
        multiple: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.expandInvOrganization`)
          .d('拓展库存组织'),
        lovCode: 'HPFM_INV_ORGANIZATION_LIST',
        dynamicProps: {
          disabled({ record }) {
            return isEmpty(record.get('expandCompany'));
          },
          lovPara({ record }) {
            const companyIds = record?.get('expandCompany') || [];
            // 考虑单选和多选
            const param = {
              companyIds: companyIds?.map((item) => item.companyId)?.join(','),
            };
            return param;
          },
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          // 考虑单选和多选
          return value && value.map((item) => item.organizationId).join(',');
        },
      },
      {
        name: 'expandInvOrganizationMeaning',
        bind: 'expandInvOrganization.organizationName',
        multiple: ',',
      },
    ],
    events: {
      update: ({ record, name, value = {} }) => {
        if (name === 'ouIdLov') {
          const currentValue = value || {};
          const { invOrganizationId, invOrganizationName } = currentValue;
          record.set('ouName', currentValue.ouName);
          record.set('ouId', currentValue.ouId);
          if (invOrganizationId) {
            record.set('invOrganizationId', invOrganizationId);
            record.set('invOrganizationName', invOrganizationName);
          } else {
            record.set('invOrganizationIdLov', null);
          }
        } else if (name === 'invOrganizationIdLov') {
          const currentValue = value || {};
          record.set('invOrganizationName', currentValue.organizationName);
          record.set('invOrganizationId', currentValue.organizationId);
          if (!isEmpty(currentValue) && currentValue?.ouId) {
            record.set('ouName', currentValue.ouName);
            record.set('ouId', currentValue.ouId);
          }
        }
      },
    },
  };
};

export default BatchMaintainItemDS;
