import intl from 'srm-front-boot/lib/utils/intl';
import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isTenantRoleLevel } from 'utils/utils';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { PublishStatus } from '@/businessGlobalData/common';
import { runInAction } from 'mobx';

const ObjectCompositionDS = flag =>
  ({
    cacheSelection: true,
    autoCreate: flag,
    autoQuery: false,
    paging: true,
    pageSize: 10,
    fields: [
      {
        name: 'businessObjectId',
        type: FieldType.string,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectName').d('对象名称'),
        name: 'businessObjectName',
        type: FieldType.intl,
        required: true,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectCode').d('对象编码'),
        name: 'businessObjectCode',
        unique: true,
        type: FieldType.string,
        required: true,
      },
      {
        label: intl.get('hmde.common.tenant').d('所属租户'),
        name: 'tenantName',
        type: FieldType.string,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectPublishStatus').d('发布状态'),
        name: 'publishStatus',
        type: FieldType.string,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectStandardFlag').d('是否标准'),
        name: 'standardFlag',
        type: FieldType.boolean,
        trueValue: true,
        falseValue: false,
        defaultValue: false,
      },
      {
        name: 'masterBusinessObjectName',
        label: intl.get('hmde.boComposition.view.message.header.masterObjectName').d('主对象名称'),
        type: FieldType.string,
        bind: 'masterObject.businessObjectName',
      },
      {
        name: 'masterBusinessObjectCode',
        label: intl.get('hmde.boComposition.view.message.header.masterObjectCode').d('主对象编码'),
        type: FieldType.string,
        bind: 'masterObject.businessObjectCode',
      },
      {
        name: 'domainCode',
        type: FieldType.string,
        bind: 'masterObject.domainCode',
        defaultValue: '',
      },
      {
        name: 'masterBusinessObjectId',
        type: FieldType.string,
        bind: 'masterObject.businessObjectId',
        required: true,
      },
      {
        name: 'masterObject',
        type: 'object',
        ignore: 'always',
        label: intl.get('hmde.boComposition.view.message.header.masterObject').d('主对象'),
        required: true,
        textField: 'businessObjectName',
        lovCode: isTenantRoleLevel() ? 'HMDE.BUSINESS_OBJECT' : 'HMDE.BUSINESS_OBJECT.SITE',
      },
      {
        name: 'sourceType',
        type: FieldType.string,
        label: intl.get('hmde.boComposition.view.message.header.objectType').d('对象类型'),
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
        label: intl.get('hmde.boComposition.view.message.header.objectDescription').d('对象描述'),
        name: 'remark',
        type: FieldType.intl,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.enabledFlag').d('启用状态'),
        name: 'enabledFlag',
        type: FieldType.boolean,
        defaultValue: true,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.isStandard').d('是否标准组合'),
        name: 'standardFlag',
        type: FieldType.boolean,
        defaultValue: false,
      },
    ],
    queryFields: [
      {
        label: intl
          .get('hmde.boComposition.view.message.header.objectNameOrCode')
          .d('对象名称/编码'),
        name: 'nameCondition',
        type: FieldType.string,
        labelWidth: '120',
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectPublishStatus').d('发布状态'),
        name: 'publishStatus',
        type: FieldType.string,
        textField: 'text',
        valueField: 'value',
        options: new DataSet({
          selection: DataSetSelection.single,
          data: [
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
        }),
      },
      {
        name: 'masterBusinessObjectCondition',
        label: intl
          .get('hmde.boComposition.view.message.header.masterObjectNameCondition')
          .d('主对象名称/编码'),
        type: FieldType.string,
        labelWidth: '120',
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectDescription').d('对象描述'),
        name: 'remark',
        type: FieldType.string,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.enabledFlag').d('启用状态'),
        name: 'enabledFlag',
        type: FieldType.boolean,
        // defaultValue: '1',
        trueValue: '1',
        falseValue: '0',
        textField: 'meaning',
        valueField: 'value',
        lookupCode: 'HPFM.ENABLED_FLAG',
        transformRequest: res => (res ? !!Number(res) : undefined),
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.isStandard').d('是否标准组合'),
        name: 'standardFlag',
        type: FieldType.boolean,
        // defaultValue: '1',
        trueValue: '1',
        falseValue: '0',
        textField: 'meaning',
        valueField: 'value',
        lookupCode: 'HPFM.FLAG',
        transformRequest: res => (res ? !!Number(res) : undefined),
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects/combine/page`,
        method: 'get',
      },
    },
    events: {
      load: ({ dataSet}) => {
        runInAction(() => {
          dataSet.forEach(record => {
            if (record.get('publishStatus') !== 'PUBLISHED') {
              // eslint-disable-next-line no-param-reassign
              record.selectable = false;
            }
          });
        });
      },
      update: ({ record }) => {
        if (!record.get('masterObject')) {
          record.set('domainCode', '');
        }
      },
    },
  } as DataSetProps);

const ObjectCompositionListDS = flag =>
  ({
    cacheSelection: true,
    autoCreate: flag,
    autoQuery: false,
    paging: true,
    pageSize: 20,
    fields: [
      {
        name: 'businessObjectId',
        type: FieldType.string,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectName').d('对象名称'),
        name: 'businessObjectName',
        type: FieldType.intl,
        required: true,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectCode').d('对象编码'),
        name: 'businessObjectCode',
        unique: true,
        type: FieldType.string,
        required: true,
      },
      {
        label: intl.get('hmde.common.tenant').d('所属租户'),
        name: 'tenantName',
        type: FieldType.string,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectPublishStatus').d('发布状态'),
        name: 'publishStatus',
        type: FieldType.string,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectStandardFlag').d('是否标准'),
        name: 'standardFlag',
        type: FieldType.boolean,
        trueValue: true,
        falseValue: false,
        defaultValue: false,
      },
      {
        name: 'masterBusinessObjectName',
        label: intl.get('hmde.boComposition.view.message.header.masterObjectName').d('主对象名称'),
        type: FieldType.string,
        bind: 'masterObject.businessObjectName',
      },
      {
        name: 'masterBusinessObjectCode',
        label: intl.get('hmde.boComposition.view.message.header.masterObjectCode').d('主对象编码'),
        type: FieldType.string,
        bind: 'masterObject.businessObjectCode',
      },
      {
        name: 'domainCode',
        type: FieldType.string,
        bind: 'masterObject.domainCode',
        defaultValue: '',
      },
      {
        name: 'masterBusinessObjectId',
        type: FieldType.string,
        bind: 'masterObject.businessObjectId',
        required: true,
      },
      {
        name: 'masterObject',
        type: 'object',
        ignore: 'always',
        label: intl.get('hmde.boComposition.view.message.header.masterObject').d('主对象'),
        required: true,
        textField: 'businessObjectName',
        lovCode: isTenantRoleLevel() ? 'HMDE.BUSINESS_OBJECT' : 'HMDE.BUSINESS_OBJECT.SITE',
      },
      {
        name: 'sourceType',
        type: FieldType.string,
        label: intl.get('hmde.boComposition.view.message.header.objectType').d('对象类型'),
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
        label: intl.get('hmde.boComposition.view.message.header.objectDescription').d('对象描述'),
        name: 'remark',
        type: FieldType.intl,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.enabledFlag').d('启用状态'),
        name: 'enabledFlag',
        type: FieldType.boolean,
        defaultValue: true,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.isStandard').d('是否标准组合'),
        name: 'standardFlag',
        type: FieldType.boolean,
        defaultValue: false,
      },
    ],
    queryFields: [
      {
        label: intl
          .get('hmde.boComposition.view.message.header.objectNameOrCode')
          .d('对象名称/编码'),
        name: 'nameCondition',
        type: FieldType.string,
        labelWidth: '120',
        merge: true,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectPublishStatus').d('发布状态'),
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
        name: 'masterBusinessObjectCondition',
        label: intl
          .get('hmde.boComposition.view.message.header.masterObjectNameCondition')
          .d('主对象名称/编码'),
        type: FieldType.string,
        display: true,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.objectDescription').d('对象描述'),
        name: 'remark',
        type: FieldType.string,
        display: true,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.enabledFlag').d('启用状态'),
        name: 'enabledFlag',
        display: true,
        textField: 'meaning',
        valueField: 'value',
        lookupCode: 'HPFM.ENABLED_FLAG',
        transformValue: res => res ? !!Number(res) : undefined,
      },
      {
        label: intl.get('hmde.boComposition.view.message.header.isStandard').d('是否标准组合'),
        name: 'standardFlag',
        display: true,
        textField: 'meaning',
        valueField: 'value',
        lookupCode: 'HPFM.FLAG',
        transformValue: res => res ? !!Number(res) : undefined,
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects/combine/page`,
        method: 'get',
      },
    },
    events: {
      load: ({ dataSet}) => {
        runInAction(() => {
          dataSet.forEach(record => {
            if (record.get('publishStatus') !== 'PUBLISHED') {
              // eslint-disable-next-line no-param-reassign
              record.selectable = false;
            }
          });
        });
      },
      update: ({ record }) => {
        if (!record.get('masterObject')) {
          record.set('domainCode', '');
        }
      },
    },
  } as any);

export { ObjectCompositionDS, ObjectCompositionListDS };
