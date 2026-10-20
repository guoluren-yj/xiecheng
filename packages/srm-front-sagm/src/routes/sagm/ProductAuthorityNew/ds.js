import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getQueryFields = (isAgreement) => {
  const fields = [
    {
      name: 'authorityListCodeName',
      type: 'string',
      label: intl.get('sagm.common.model.authorityListCodeName').d('权限编码/名称'),
    },
    {
      name: 'agreementType',
      type: 'string',
      lookupCode: 'SAGM.AUTH_AGREEMENT_TYPE',
      label: intl.get('sagm.common.model.dataFrom').d('数据来源'),
      isFilter: isAgreement,
    },
    {
      name: 'agreementHeaderNum',
      type: 'string',
      label: intl.get('sagm.common.model.sourceNum').d('来源单号'),
    },
    {
      name: 'controlWayCode',
      type: 'string',
      lookupCode: 'SAGM.AUTH_CONTROL_WAY',
      label: intl.get('sagm.common.model.controlMethod').d('控制方式'),
    },
    {
      name: 'statusCode',
      type: 'string',
      lookupCode: 'SAGM.AUTHORITY_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'operationAuth',
      type: 'string',
      lookupCode: 'SAGM.OPERATION_AUTH',
      label: intl.get('sagm.common.view.operationAuth').d('操作权限'),
    },
  ];
  return fields.filter((f) => !f.isFilter);
};

const queryDs = (isAgreement = false) => ({
  fields: getQueryFields(isAgreement),
});

const tableDs = (otherProps = {}) => ({
  selection: false,
  autoQuery: false, // 默认不查询（筛选器自动触发，新建为Table，不查询），商城协议、销售协议、采买权限公用
  pageSize: 20,
  autoLocateFirst: false,
  autoLocateAfterCreate: false,
  idField: 'primaryKey',
  parentField: 'parentPrimaryKey',
  cacheSelection: true,
  primaryKey: 'primaryKey',
  paging: 'server',
  ...otherProps,
  fields: [
    {
      name: 'authorityListCode',
      type: 'string',
      label: intl.get('sagm.common.model.authorityCode').d('权限编码'),
    },
    {
      name: 'statusCode',
      label: intl.get('sagm.common.model.statusCode').d('是否发布'),
    },
    {
      name: 'authorityListName',
      type: 'string',
      label: intl.get('sagm.common.model.authorityName').d('权限名称'),
    },
    {
      name: 'agreementTypeMeaning',
      type: 'string',
      label: intl.get('sagm.common.model.dataFrom').d('数据来源'),
    },
    {
      name: 'agreementHeaderNum',
      type: 'string',
      label: intl.get('sagm.common.model.sourceNum').d('来源单号'),
    },
    {
      name: 'controlWayCodeMeaning',
      type: 'string',
      label: intl.get('sagm.common.model.controlMethod').d('控制方式'),
    },
    {
      name: 'controlRangeMeaning',
      label: intl.get('sagm.common.view.controlRange').d('控制范围'),
    },
    {
      name: 'operationAuthMeaning',
      label: intl.get('sagm.common.view.operationAuth').d('操作权限'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('sagm.common.model.remark').d('备注'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('sagm.common.model.createBy').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sagm.common.model.creationDate').d('创建时间'),
    },
    {
      name: 'effectiveDate',
      ignore: 'always',
      type: 'date',
      range: ['start', 'end'],
      label: intl.get('sagm.common.view.validDate').d('有效期'),
    },
    {
      name: 'effectiveStartDate',
      type: 'date',
      bind: 'effectiveDate.start',
      label: intl.get('sagm.common.model.dateFrom').d('有效期从'),
    },
    {
      name: 'effectiveEndDate',
      type: 'date',
      bind: 'effectiveDate.end',
      label: intl.get('sagm.common.model.dateTo').d('有效期至'),
    },
    {
      name: 'enableFlag',
      type: 'number',
      label: intl.get('hzero.common.button.enable').d('启用'),
      lookupCode: 'SAGM.ENABLED_FLAG',
    },
    {
      name: 'versionNum',
      type: 'string',
      label: intl.get('sagm.common.view.versionNum').d('版本'),
    },
    {
      name: 'options',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/sagm/v1/${organizationId}/authority-lists`,
        method: 'GET',
        data: { ...data, showFlag: 1 },
        transformResponse: (data) => {
          try {
            const jsonData = JSON.parse(data);
            if (jsonData) {
              const { content = [], ...others } = jsonData;
              return {
                ...others,
                content: content.map((m) => ({
                  ...m,
                  primaryKey: `${m.authorityListId}-${m.agreementHeaderId || 'none'}`,
                })), // 构建唯一数据key
              };
            }
          } catch (err) {
            console.log('transformResponse in Authority Dataset', err);
          }
        },
      };
    },
  },
});

export { queryDs, tableDs };
