/**
 * 批量创建物料DS配置
 */

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty, isArray } from 'lodash';

import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const BatchCreateItemDS = ({ rfxInfoDS = {} } = {}) => ({
  autoCreate: true,
  fields: [
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
        disabled({ record }) {
          const invOrganizationIdData = record.get('invOrganizationId');
          return isArray(invOrganizationIdData) && invOrganizationIdData.length > 1;
        },
        lovPara({ dataSet }) {
          const { companyId = null } = dataSet.queryParameter.company || {};
          return {
            companyId,
          };
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
      noCache: true,
      dynamicProps: {
        lovPara({ dataSet, record }) {
          const { companyId = null } = dataSet.queryParameter.company || {};
          return {
            ouId: record.get('ouId'),
            companyId,
            enabledFlag: 1,
            organizationId,
          };
        },
        multiple({ record }) {
          const itemIdLovData = record.get('itemIdLov');
          return !isEmpty(itemIdLovData)
            ? itemIdLovData?.length
              ? itemIdLovData.length <= 1
              : true
            : true;
        },
      },
    },
    {
      name: 'invOrganizationId',
      bind: 'invOrganizationIdLov.organizationId',
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationIdLov.organizationName',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
      name: 'itemIdLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSRC.CUSTOMER_ITEM_INCLUDE_CATEGORY',
      textField: 'itemCode',
      valueField: 'itemIdAndCategoryId',
      required: true,
      dynamicProps: {
        lovPara({ dataSet, record }) {
          const { companyId = null } = dataSet.queryParameter.company || {};
          const { templateNum } = dataSet.queryParameter.headers || {};
          const commonParams = {
            ouId: record.get('ouId'),
            invOrganizationId: isArray(record.get('invOrganizationId'))
              ? null
              : record.get('invOrganizationId'),
            InvOrganizationIds: isArray(record.get('invOrganizationId'))
              ? record.get('invOrganizationId').toString()
              : record.get('invOrganizationId'),
            companyId,
            asyncCountFlag: 'Y',
            from: 'ITEM_LIMIT',
            templateNum,
          };
          const { expandResultsFlag, resultsExpandingHierarchy, resultsExpandingDimensions } =
            rfxInfoDS?.current?.get([
              'expandResultsFlag',
              'resultsExpandingHierarchy',
              'resultsExpandingDimensions',
            ]) || {};
          const expandCompany =
            resultsExpandingDimensions !== 'ITEM_LINE'
              ? rfxInfoDS?.current?.get('expandCompany')
              : record.get('expandCompany');
          const expandInvOrganization =
            resultsExpandingDimensions !== 'ITEM_LINE'
              ? rfxInfoDS?.current?.get('expandInvOrganization')
              : record.get('expandInvOrganization');
          if (expandResultsFlag === 0) {
            return commonParams;
          } else if (expandResultsFlag === 1) {
            // 拓展公司需要考虑单选和多选的情况
            const _expandCompany = isArray(expandCompany)
              ? (expandCompany || []).map((item) => item.companyId).join(',')
              : expandCompany?.companyId;
            const _expandInvOrganization =
              expandInvOrganization &&
              (expandInvOrganization || []).map((item) => item.organizationId).join(',');
            return {
              ...commonParams,
              expandCompany: _expandCompany,
              expandInvOrganization:
                resultsExpandingHierarchy === 'INV_ORGANIZATION'
                  ? _expandInvOrganization
                  : undefined,
            };
          }
          return commonParams;
        },
        multiple({ record }) {
          const invOrganizationIdLovData = record.get('invOrganizationIdLov');
          return !isEmpty(invOrganizationIdLovData)
            ? invOrganizationIdLovData?.length
              ? invOrganizationIdLovData?.length <= 1
              : true
            : true;
        },
      },
    },
    {
      name: 'itemIds',
      bind: 'itemIdLov.itemId',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
      min: '0.000001',
      max: '99999999999999999999',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
      name: 'rfxQuantity',
      type: 'number',
      min: '0.000001',
      max: '99999999999999999999',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
      name: 'taxIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
      name: 'taxIdLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMDM.TAX',
      // textField: 'taxRate',
      valueField: 'taxId',
      dynamicProps: {
        disabled({ record }) {
          return !record.get('taxIncludedFlag');
        },
        required({ dataSet, record }) {
          const { taxChangeFlag = 0 } = dataSet.queryParameter.headers || {};
          return record.get('taxIncludedFlag') && taxChangeFlag === 0;
        },
      },
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
      name: 'taxCode',
      bind: 'taxIdLov.taxCode',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
      name: 'demandDate',
      type: 'date',
      format: 'YYYY-MM-DD',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
      name: 'ladderInquiryFlag',
      type: 'boolean',
      align: 'center',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'freightIncludedFlag',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.includingFreight').d('是否含运费'),
      lookupCode: 'HPFM.FLAG',
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
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'ouIdLov') {
        const { invOrganizationId, invOrganizationName } = value || {};
        if (invOrganizationId) {
          record.set('invOrganizationId', [invOrganizationId]);
          record.set('invOrganizationName', [invOrganizationName]);
        } else {
          record.set('invOrganizationIdLov', []);
          record.set('invOrganizationId', []);
          record.set('invOrganizationName', []);
        }
        record.set('itemIdLov', null);
        record.set('itemIds', null);
      } else if (name === 'taxIncludedFlag' && !value) {
        record.set('taxId', null);
        record.set('taxRate', null);
      }
    },
  },
  transport: {
    submit: ({ dataSet }) => {
      const {
        queryParameter: { commonProps = {} },
      } = dataSet;
      const { rfxHeaderId, customizeUnitCode = null } = commonProps;
      const data = dataSet.current?.toData();
      return {
        method: 'POST',
        url: `${Prefix}/${organizationId}/rfx/items/batch-save`,
        params: {
          rfxHeaderId,
        },
        data: {
          ...data,
          bathRfxLineItemList: isArray(data.itemIdLov) ? data.itemIdLov : [data.itemIdLov],
          tenantId: organizationId,
          customizeUnitCode,
          bathInvOrganizationIds: isArray(data.invOrganizationId)
            ? data.invOrganizationId
            : [data.invOrganizationId],
          itemIdLov: isArray(data.itemIdLov) ? data.itemIdLov : [data.itemIdLov],
          itemIds: isArray(data.itemIds) ? data.itemIds : [data.itemIds],
          invOrganizationId: isArray(data.invOrganizationId) ? null : data.invOrganizationId,
        },
      };
    },
  },
});

export default BatchCreateItemDS;
