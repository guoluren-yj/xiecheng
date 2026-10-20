// 领域管理列表 DS 配置
// import { getConfig } from 'choerodon-ui';
// import { HZERO_HMDE } from '@/utils/config';
// import { lowcodeOrganizationURL } from '@/utils/common';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse } from 'utils/utils';
// import { API_HOST } from 'utils/config';
// import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

// const isTenant = isTenantRoleLevel();
// const currentTenantId = getCurrentOrganizationId();

// const prefix = isTenant ? `hmde/v1/${currentTenantId}` : 'hmde/v1';

export const DomainListDataSetConfig = (): DataSetProps => ({
  // autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'domainName',
      label: intl.get('hmde.domain.view.message.header.domainName').d('领域名称'),
      type: FieldType.intl,
    },
    {
      name: 'domainCode',
      label: intl.get('hmde.domain.view.message.header.domainCode').d('领域编码'),
      type: FieldType.string,
    },
    {
      name: 'icon',
      label: 'icon',
      type: FieldType.string,
      defaultValue: 'project_filled',
    },
    {
      name: 'remark',
      label: intl.get('hmde.domain.view.message.header.remark').d('描述'),
      type: FieldType.string,
    },
    {
      name: 'serviceState',
      label: intl.get('hmde.domain.view.message.header.serviceEnabled').d('服务可用状态'),
    },
    {
      name: 'tenantName',
      label: intl.get('hmde.common.tenant').d('所属租户'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        // url: `${API_HOST}/${prefix}/domains/page`,
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/domains/page`,
        method: 'GET',
        params,
      };
    },
  },
});

export const CreateAndEditDataSetConfig = (
  required = true,
  tenantInfoRef?: { current: null | number | string },
  domainId?: string | number
): DataSetProps =>
  ({
    autoQuery: false,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'domainCode',
        label: intl.get('hmde.domain.view.message.header.domainCode').d('领域编码'),
        required,
        maxLength: 5,
        type: FieldType.string,
        pattern: !domainId ? /[a-zA-Z0-9_]{1,5}$/ : undefined,
        defaultValidationMessages: {
          patternMismatch: intl
            .get('hmde.bo.rule.code.patternValidation')
            .d('支持字母、数字及下划线'),
        },
      },
      {
        name: 'domainName',
        label: intl.get('hmde.domain.view.message.header.domainName').d('领域名称'),
        required: true,
        maxLength: 32,
        type: FieldType.intl,
      },
      {
        name: 'serviceId',
        label: intl.get('hmde.domain.view.message.header.service').d('服务'),
        required,
        valueField: 'id',
        textField: 'serviceCode',
        type: FieldType.string,
        lookupAxiosConfig: required
          ? {
              // url: `${API_HOST}/${prefix}/domains/services/list`,
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/domains/services/list`,
              method: 'GET',
              transformResponse: (res) => {
                if (Array.isArray(res)) return res;
                try {
                  const data: any = JSON.parse(res);
                  if (getResponse(data)) {
                    return Object.keys(data).map((ele) => {
                      const { id } = data[ele]?.[0] || {};
                      return {
                        id,
                        serviceCode: ele,
                      };
                    });
                  } else {
                    return [];
                  }
                } catch (error) {
                  console.error(error);
                }
              },
            }
          : {},
      },
      {
        name: 'icon',
        label: 'icon',
        type: FieldType.string,
        defaultValue: 'project_filled',
      },
      {
        name: 'remark',
        label: intl.get('hmde.common.label.remark').d('描述'),
        type: FieldType.intl,
      },
      // {
      //   name: 'dataSourceId',
      //   label: intl.get('hmde.domain.view.message.header.dataSource').d('数据源'),
      // },
      {
        name: 'dataSource',
        label: intl.get('hmde.domain.view.message.header.dataSource').d('数据源'),
      },
      {
        name: 'serviceState',
        label: intl.get('hmde.domain.view.message.header.serviceEnabled').d('服务可用状态'),
      },
      {
        name: 'serviceCode',
        label: intl.get('hmde.domain.view.message.header.service').d('服务'),
      },
      {
        name: 'tenantName',
        label: intl.get('hmde.common.tenant').d('所属租户'),
      },
      {
        label: intl.get('hmde.domain.view.message.header.sourceType').d('领域类别'),
        name: 'sourceType',
        type: FieldType.string,
      },
      {
        name: 'flexFieldEnabledFlag',
        type: FieldType.boolean,
        defaultValue: false,
      },
      {
        name: 'extendTableEnabledFlag',
        type: FieldType.boolean,
        defaultValue: false,
      },
      {
        name: 'flexFieldRecognizeRegularExpression',
      },
      {
        name: 'physicsPublishStrategy',
        label: intl
          .get('hmde.domain.view.message.title.physicsPublishStrategy')
          .d('业务对象发布更新物理模型选项'),
        type: FieldType.string,
        required: true,
        defaultValue: 'VERIFY',
        labelWidth: 200,
      },
      {
        name: 'editListBtn',
        ignore: 'always',
      },
      {
        name: 'blockOrWhiteBusinessObjects',
        type: 'object',
      },
      {
        name: 'allow',
        label: intl.get('hmde.bo.field.extendField.allowUpdateObject').d('允许更新的业务对象'),
      },
      {
        name: 'notAllow',
        label: intl.get('hmde.bo.field.extendField.notAllowUpdateObject').d('不允许更新的业务对象'),
      },
    ],
    transport: {
      read: () => {
        return {
          // url: `${API_HOST}/${prefix}/domains/${domainId}/detail`,
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/domains/${domainId}/detail`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        const { serviceId, flexFieldRecognizeRegularExpression, ...rest } = data[0];
        // 保存时根据决定是否清空 flexFieldRecognizeRegularExpression
        const resultFlexFieldRecognizeRegularExpression = data[0].flexFieldEnabledFlag
          ? flexFieldRecognizeRegularExpression
          : '';
        return {
          // url: `${API_HOST}/${prefix}/domains`,
          url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/domains`,
          data: required
            ? {
                ...rest,
                datasourceId: serviceId,
                flexFieldRecognizeRegularExpression: resultFlexFieldRecognizeRegularExpression,
              }
            : {
                ...data[0],
                flexFieldRecognizeRegularExpression: resultFlexFieldRecognizeRegularExpression,
              },
          method: required ? 'POST' : 'PUT',
          params: { tenantId: tenantInfoRef?.current },
        };
      },
    },
    events: {
      update: ({ name, value, record }) => {
        if (name === 'flexFieldEnabledFlag' && value) {
          record.set('extendTableEnabledFlag', false);
        }
        if (name === 'extendTableEnabledFlag' && value) {
          record.set('flexFieldEnabledFlag', false);
        }
      },
    },
  } as DataSetProps);

export const DomainFieldsDataSetConfig = () => ({
  autoCreate: false,
  autoQuery: false,
  selection: DataSetSelection.multiple,
  fields: [
    {
      name: 'templateFieldName',
      type: 'string',
      label: intl.get('hmde.common.view.message.displayName').d('显示名称'),
    },
    {
      name: 'templateFieldCode',
      type: 'string',
      label: intl.get('hmde.bo.field.code').d('字段编码'),
    },
    {
      name: 'componentType',
      type: 'string',
      label: intl.get('hmde.bo.field.componentType').d('字段类型'),
      lookupCode: 'HMDE.BUSINESS_OBJECT.FIELD_TYPE',
    },
    {
      name: 'requiredFlag',
      type: 'number',
      label: intl.get('hzero.common.title.individuation.required').d('是否必输'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hmde.common.label.remark').d('描述'),
    },
    {
      name: 'businessObjectName',
      type: 'string',
      label: intl.get('hmde.bo.field.masterObject').d('关联对象'),
    },
  ],
  transport: {
    read: () => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/domain-template-fields/page`,
      method: 'GET',
    }),
    destroy: () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/domain-template-fields/batch`,
      method: 'DELETE',
    }),
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('category') === 'PREDEFINED') {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});
