import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const basicFormDS = (params) => ({
  primaryKey: 'requestId',
  autoQuery: true,
  // table表单显示的字段
  fields: [
    {
      name: 'requestNum',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.requestNum').d('申请单号'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get(`ssrc.priceLibraryNew.model.library.application`).d('申请人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`ssrc.priceLibraryNew.model.library.creationDate`).d('创建日期'),
    },
    {
      name: 'requestStatus',
      type: 'string',
      label: intl.get(`ssrc.priceLibraryNew.model.library.status`).d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_REQUEST_STATUS',
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.updateRemark').d('更新说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.attchment').d('附件'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-reqs/detail`,
        method: 'GET',
        data: {
          ...params,
          customizeUnitCode: 'SSRC.PRICE_LIB_NEW.REQ_APPRO',
        },
      };
    },
  },
});

const relevantQueryFormDS = () => ({
  // 查询表单显示的字段
  fields: [],
});

const historyTableDS = () => ({
  autoQuery: true,
  selection: false,
  primaryKey: 'historyId',
  fields: [
    {
      name: 'endTime',
      type: 'dateTime',
      label: intl.get('hwfp.common.model.approval.time').d('审批时间'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.action').d('审批动作'),
    },
    {
      name: 'name',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.step').d('审批环节'),
    },
    {
      name: 'assigneeName',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.owner').d('审批人'),
    },
    {
      name: 'comment',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.opinion', { title: '审批意见' }).d('审批意见'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('hwfp.common.model.approval.file').d('附件'),
    },
  ],
});

const scopeTableDS = (param) => ({
  primaryKey: 'id',
  idField: 'key',
  parentField: 'parentKey',

  fields: [
    {
      name: 'dataName',
    },
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.enable').d('启用'),
    },
  ],
  // 查询表单字段
  queryFields: [
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
    },
    {
      name: 'dataName',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataName').d('名称'),
    },
  ],

  events: {
    submitSuccess: ({ dataSet }) => {
      dataSet.query();
    },
  },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      if (params.dimensionCode) {
        const url = params.from
          ? `${SRM_SPC}/v1/${organizationId}/price-app-scope-lines`
          : `${SRM_SPC}/v1/${organizationId}/price-lib-req-scope-lns`;
        return {
          url,
          method: 'GET',
          data: {
            ...param,
            ...params,
            ...queryParams,
          },
        };
      }
    },
  },
});

const ladderQuotationDS = () => ({
  primaryKey: 'priceLibLadderId',
  selection: false,

  // table表单显示的字段
  fields: [
    {
      name: 'ladderLineNum',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.ladderLineNum').d('行号'),
    },
    {
      name: 'ladderFrom',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.numRanger').d('数量范围'),
    },
    {
      name: 'ladderPrice',
      type: 'number',
      label: intl.get('ssrc.priceLibraryNew.model.library.taxIncludedPrice').d('单价(含税)'),
    },
    {
      name: 'ladderNetPrice',
      type: 'number',
      label: intl.get('ssrc.priceLibraryNew.model.library.netPrice').d('单价(不含税)'),
    },
    {
      name: 'cumulativeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.cumulativeFlag').d('是否累计价格'),
    },
    {
      name: 'ladderPriceRemark',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.remark').d('备注'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-req-ladders`;
      return {
        url,
        method: 'GET',
        data,
      };
    },
  },
});

export { basicFormDS, historyTableDS, scopeTableDS, ladderQuotationDS, relevantQueryFormDS };
