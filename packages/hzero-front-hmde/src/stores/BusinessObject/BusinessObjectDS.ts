// import { API_HOST } from 'utils/config';
import intl from 'srm-front-boot/lib/utils/intl';
import { isTenantRoleLevel, getResponse } from 'utils/utils';
import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

// TODO:提测前删除
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

import { PublishStatus } from '@/businessGlobalData/common';

/**
 * @param {string} boId 业务对象Id
 * @return {DataSetProps}
 */
export default ({
  boId,
  domainId,
  serviceCode,
  domainCode,
  isEdit = false,
}: {
  boId?: string;
  domainId?: string;
  serviceCode?: string;
  domainCode?: string;
  isEdit?: boolean;
}): DataSetProps => ({
  autoCreate: false,
  autoQuery: !!boId,
  autoQueryAfterSubmit: true,
  selection: false,
  paging: !boId,
  pageSize: 20,
  transport: {
    read: ({ params }) => {
      return {
        // url: `${API_HOST}/hmde/v1/${
        //   isTenantRoleLevel() ? `${getUserOrganizationId()}/` : ''
        // }business-objects/${boId ? `${boId}/detail` : 'page'}`,
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects/${
          boId ? `${boId}/detail` : 'page'
        }`, // TODO:体测前更换为上面注释路径
        method: 'GET',
        params,
      };
    },
    submit: ({ data }) => ({
      // url: `${API_HOST}/hmde/v1/${
      //   isTenantRoleLevel() ? `${getUserOrganizationId()}/` : ''
      // }business-objects`,
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects`,
      data: { ...data[0], businessObjectCode: `${domainCode}_${data[0]?.businessObjectCode}` },
      method: 'POST',
      params: {
        domainId,
      },
    }),
    update: ({ data }) => {
      const record = data[0];
      return {
        // url: `${API_HOST}/hmde/v1/${
        //   isTenantRoleLevel() ? `${getUserOrganizationId()}/` : ''
        // }business-objects`,
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects`, // TODO:体测前更换为上面注释路径
        data: { ...record },
        method: 'PUT',
      };
    },
    destroy: ({ data }) => {
      const deleteId = data.map(({ businessObjectId }) => businessObjectId)?.[0]; // 指定业务对象删除
      return {
        // url: `${API_HOST}/hmde/v1/${
        //   isTenantRoleLevel() ? `${getUserOrganizationId()}/` : ''
        // }business-objects/${deleteId}`, // 批量删除
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects/${deleteId}`, // TODO:体测前更换为上面注释路径
        method: 'delete',
        data: undefined,
      };
    },
  },
  fields: [
    {
      name: 'businessObjectId',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectName').d('对象名称'),
      name: 'businessObjectName',
      type: FieldType.intl,
      maxLength: 200,
      required: true,
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectCode').d('对象编码'),
      name: 'businessObjectCode',
      unique: true,
      type: FieldType.string,
      pattern: /^[a-zA-Z0-9_]*$/,
      required: true,
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectType').d('对象类型'),
      name: 'sourceType',
      type: FieldType.string,
      textField: 'text',
      valueField: 'value',
      options: new DataSet({
        selection: DataSetSelection.single,
        data: [
          {
            text: intl.get('hmde.bo.sourceType.predefine').d('系统对象'),
            value: 'PREDEFINE',
          },
          {
            text: intl.get('hmde.bo.sourceType.platform').d('标准对象'),
            value: 'PLATFORM',
          },
          {
            text: intl.get('hmde.bo.sourceType.tenant').d('租户自定义对象'),
            value: 'TENANT',
          },
        ],
      }),
    },
    {
      label: intl.get('hmde.common.tenant').d('所属租户'),
      name: 'tenantName',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectPublishStatus').d('发布状态'),
      name: 'publishStatus',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectDescription').d('对象描述'),
      name: 'remark',
      type: FieldType.intl,
    },
    {
      label: intl.get('hmde.bo.view.message.header.enabledFlag').d('启用状态'),
      name: 'enabledFlag',
      type: FieldType.boolean,
    },
    {
      label: intl.get('hmde.bo.view.message.header.autoCreateFlag').d('关联物理模型'),
      name: 'autoCreateFlag',
      type: FieldType.boolean,
      trueValue: false,
      falseValue: true,
    },
    {
      label: intl.get('hmde.bo.view.message.header.physicalModel').d('物理模型'),
      name: 'physicalModel',
      type: FieldType.object,
      lovCode: isTenantRoleLevel()
        ? 'HMDE.BUSINESS_OBJECT.REF_TABLE'
        : 'HMDE.BUSINESS_OBJECT.REF_TABLE.SITE',
      lovPara: {
        serviceCode,
      },
      ignore: FieldIgnore.always,
    },
    {
      name: 'physicalModelId',
      type: FieldType.string,
      bind: 'physicalModel.id',
    },
    {
      label: intl.get('hmde.bo.view.message.header.extPhysicalModel').d('扩展物理模型'),
      name: 'extPhysicalModel',
      type: FieldType.object,
      lovCode: isTenantRoleLevel()
        ? 'HMDE.BUSINESS_OBJECT.REF_TABLE'
        : 'HMDE.BUSINESS_OBJECT.REF_TABLE.SITE',
      lovPara: {
        serviceCode,
        tableTypeList: 'REDUNDANT,REDUNDANT_X',
      },
      ignore: FieldIgnore.always,
    },
    {
      name: 'extendsTableId',
      type: FieldType.string,
      bind: 'extPhysicalModel.id',
    },
    {
      label: intl.get('hmde.bo.view.message.header.physicalModelName').d('物理模型名称'),
      name: 'physicalModelName',
      type: FieldType.string,
      pattern: /^[a-zA-Z0-9_]*$/,
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('autoCreateFlag');
        },
      },
    },
    {
      label: intl.get('hmde.bo.view.message.header.extendsTableName').d('扩展物理模型名称'),
      name: 'extendsTableName',
      type: FieldType.string,
      pattern: /^[a-zA-Z0-9_]*$/,
    },
    {
      label: intl
        .get('hmde.domainOwnBOList.view.message.header.customPrimaryKeyCode')
        .d('自定义主键编码'),
      name: 'customPrimaryKeyCode',
      type: FieldType.string,
      pattern: /^(?=[a-z])[a-zA-Z0-9]*$/,
    },
    {
      label: intl
        .get('hmde.domainOwnBOList.view.message.header.refExtFieldFlag')
        .d('引用标准扩展字段'),
      name: 'refExtFieldFlag',
      type: FieldType.boolean,
      defaultValue: true,
    },
    {
      label: intl
        .get('hmde.domainOwnBOList.view.message.header.businessObjectType')
        .d('业务对象类型'),
      name: 'businessType',
      required: !isEdit,
    },
    {
      label: intl.get('hmde.bo.view.message.header.physicalModel').d('物理模型'),
      name: 'tableName',
      type: FieldType.object,
      ignore: FieldIgnore.always,
      lovCode: 'HMDE.BUSINESS_OBJECT.UNCREATE_BO_TABLE',
      optionsProps: {
        transport: {
          read: ({ params, data }) => {
            const { tableName } = data || {};
            const { page = 0, size = 10 } = params || {};
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/business-objects/tables-uncreated-bo`,
              method: 'GET',
              params: {
                ...params,
                domainId,
              },
              transformResponse: resp => {
                const newResp: any = {};
                let newContent: any[] = [];
                try {
                  newContent = JSON.parse(resp);
                } catch (e) {
                  return e;
                }
                if (getResponse(newResp)) {
                  if (newContent && newContent.length > 0) {
                    if (tableName) {
                      newContent = newContent.filter(
                        item => item && item.name && item.name.indexOf(tableName) !== -1
                      );
                    }
                    newResp.content = newContent.slice(page * size, (page + 1) * size + 1);
                    newResp.totalElements = newContent.length;
                  }
                  return newResp;
                } else {
                  return null;
                }
              },
            };
          },
        },
      },
      lovPara: {
        domainId,
      },
      dynamicProps: {
        required: ({ record }) => {
          return !record?.get('autoCreateFlag') && !isEdit;
        },
      },
    },
  ],
  queryFields: [
    {
      label: intl.get('hmde.bo.view.message.header.nameOrCode').d('对象名称/编码'),
      name: 'nameOrCode',
      merge: true,
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectType').d('对象类型'),
      name: 'sourceType',
      type: FieldType.string,
      textField: 'text',
      valueField: 'value',
      display: true,
      optionsData: [
        {
          text: intl.get('hmde.bo.sourceType.predefine').d('系统对象'),
          value: 'PREDEFINE',
        },
        {
          text: intl.get('hmde.bo.sourceType.platform').d('标准对象'),
          value: 'PLATFORM',
        },
        {
          text: intl.get('hmde.bo.sourceType.tenant').d('租户自定义对象'),
          value: 'TENANT',
        },
      ],
    },
    !isTenantRoleLevel() && {
      label: intl.get('hmde.common.tenantId').d('选择租户'),
      name: 'tenantName',
      type: FieldType.object,
      lovCode: 'HPFM.TENANT',
      display: true,
      transformRequest: res => res?.tenantName,
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectPublishStatus').d('发布状态'),
      name: 'publishStatus',
      type: FieldType.string,
      textField: 'text',
      valueField: 'value',
      display: true,
      optionsData: [
        {
          text: intl.get('hmde.common.status.published').d('已发布'),
          value: PublishStatus.PUBLISHED,
        },
        {
          text: intl.get('hmde.common.status.modified').d('已修改'),
          value: PublishStatus.MODIFIED,
        },
        {
          text: intl.get('hmde.common.status.unpublished').d('未发布'),
          value: PublishStatus.UNPUBLISHED,
        },
      ],
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectDescription').d('对象描述'),
      name: 'remark',
      display: true,
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.view.message.header.enabledFlag').d('启用状态'),
      name: 'enabledFlag',
      textField: 'meaning',
      valueField: 'value',
      lookupCode: 'HPFM.ENABLED_FLAG',
      display: true,
      transformValue: res => (res ? !!Number(res) : undefined),
    },
    {
      label: intl.get('hmde.bo.view.message.header.physicalModelName').d('物理模型名称'),
      name: 'physicalModelName',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.view.message.header.extendsTableName').d('扩展物理模型名称'),
      name: 'extendsTableName',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.view.message.header.objectProps').d('对象属性'),
      name: 'businessType',
      type: FieldType.string,
      textField: 'text',
      valueField: 'value',
      optionsData: [
        {
          text: intl.get('hmde.bo.sourceType.system').d('系统'),
          value: 'SYSTEM_OBJECT',
        },
        {
          text: intl.get('hmde.bo.sourceType.business').d('业务'),
          value: 'SRM_OBJECT',
        },
        {
          text: intl.get('hmde.bo.sourceType.mainData').d('主数据'),
          value: 'DATA_OBJECT',
        },
      ],
    },
  ].filter(Boolean) as FieldProps[],
  events: {
    update: ({ name, value, record }) => {
      if (name === 'autoCreateFlag') {
        record.set('physicalModel', {});
        if (record.get('physicalModelName')) {
          record.set('physicalModelName', '');
        }
        if (record.get('tableName')) {
          record.set('tableName', '');
        }
        if (!value) {
          record.set('customPrimaryKeyCode', '');
        }
      }
      if (name === 'physicalModel' && value?.name) {
        record.set('physicalModelName', value?.name);
      }
      if (name === 'extPhysicalModel' && value?.name) {
        record.set('extendsTableName', value?.name);
      }
      if (name === 'businessObjectCode' && record.get('autoCreateFlag')) {
        record.set('physicalModelName', `${domainCode}_${record?.get('businessObjectCode') || ''}`);
        record.set(
          'extendsTableName',
          `${domainCode}_${record?.get('businessObjectCode') || ''}_ext`
        );
      }
    },
    load: ({ dataSet }) => {
      if (
        !dataSet.current?.get('customPrimaryKeyCode') &&
        boId &&
        dataSet.current?.get('publishStatus') !== PublishStatus.UNPUBLISHED
      ) {
        // eslint-disable-next-line no-unused-expressions
        dataSet.current?.set('customPrimaryKeyCode', 'id');
      }
    },
  },
});
