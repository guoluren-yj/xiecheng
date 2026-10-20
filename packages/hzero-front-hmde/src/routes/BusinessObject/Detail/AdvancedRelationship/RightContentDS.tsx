import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'srm-front-boot/lib/utils/intl';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { DataToJSON, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import { API_HOST } from 'hzero-front/lib/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const isTenant = isTenantRoleLevel();
export default (createOrEdit, businessObjectId) =>
  ({
    autoCreate: true,
    transport: {
      read: ({ dataSet }) => {
        const businessObjectAssociateId = dataSet?.getState('businessObjectAssociateId');
        return {
          url: `${API_HOST}/${lowcodeOrganizationURL()}/business-object-associates/${businessObjectAssociateId}`,
          method: 'GET',
        };
      },
    },
    fields: [
      {
        name: 'masterBusinessObjectId', // 当前业务对象id
        type: 'string',
      },
      {
        name: 'associateName',
        type: 'intl',
        label: intl.get('hmde.bo.field.associateName').d('关系名称'),
        required: true,
      },
      {
        name: 'associateCode',
        type: 'string',
        label: intl.get('hmde.bo.field.associateCode').d('关系编码'),
        dynamicProps: {
          required: () => createOrEdit === 'create',
        },
      },
      {
        name: 'masterBusinessObjectName',
        type: 'string',
        label: intl.get('hmde.bo.field.masterBusinessObjectName').d('当前对象'),
      },
      {
        name: 'masterBusinessObjectCode',
        type: 'string',
      },
      // {
      //     name: 'associateBusinessObjectCode',
      //     type: 'object',
      //     label: intl.get('hmde.bo.field.associateBusinessObjectCode').d('目标对象'),
      //     required: true,
      //     textField: '',
      //     valueField: '',
      //     lookupCode: '',
      // },
      {
        name: 'associateBusinessObject',
        label: intl.get('hmde.bo.field.associateBusinessObject').d('目标对象'),
        required: true,
        type: 'object',
        ignore: 'always',
        textField: 'businessObjectName',
        valueField: 'businessObjectId',
        lovCode: isTenant ? 'HMDE.BUSINESS_OBJECT' : 'HMDE.BUSINESS_OBJECT.SITE',
        // lovPara: isFromDomain ? { sourceType: 'PREDEFINE' } : {},
      },
      {
        name: 'associateBusinessObjectId',
        type: 'string',
        bind: 'associateBusinessObject.businessObjectId',
      },
      {
        name: 'associateBusinessObjectCode',
        type: 'string',
        bind: 'associateBusinessObject.businessObjectCode',
      },
      {
        name: 'associateBusinessObjectName',
        label: intl.get('hmde.bo.field.associateBusinessObject').d('目标对象'),
        type: 'string',
      },
      {
        name: 'associateType',
        type: 'string',
        label: intl.get('hmde.bo.field.associateType').d('关系'),
        defaultValue: 'LINK',
        required: true,
      },
      {
        name: 'referenceList',
        type: 'object',
        // label: intl.get('hmde.bo.field.referenceList').d('引用值列表'),
        ignore: 'always',
        textField: 'businessObjectOptionName',
        lovCode: isTenant
          ? 'HMDE.BUSINESS_OBJECT_FIELD.AVAILABLE.OPTION'
          : 'HMDE.BUSINESS_OBJECT_FIELD.AVAILABLE.OPTION.SITE',
        dynamicProps: {
          disabled: ({ record, dataSet }) => {
            return (
              !record.get('associateBusinessObjectId') ||
              dataSet.children.businessObjectAssociateFieldList.length > 1
            );
          },
          lovPara: ({ record }) => ({
            businessObjectCode: record.get('associateBusinessObjectCode'),
          }),
        },
      },
      {
        name: 'businessObjectOptionCode',
        type: 'string',
        bind: 'referenceList.businessObjectOptionCode',
      },
      {
        name: 'prevConditions',
        type: 'string',
        // label: intl.get('hmde.bo.field.prevConditions').d('前置条件'),
        ignore: 'always',
      },
      {
        name: 'prevConditionFields',
        type: 'object',
        lookupCode: 'HMDE.BUSINESS_OBJECT_ASSOCIATE.AVAILABLE.FIELD.SITE',
        textField: 'businessObjectFieldName',
        valueField: 'businessObjectFieldCode',
        ignore: 'always',
        noCache: true,
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            return {
              associateFieldType: 'CONSTANT',
              publishFlag: false,
              businessObjectId: dataSet.current?.get('masterBusinessObjectId') || businessObjectId,
            };
          },
        },
      },
      {
        name: 'componentType',
        bind: 'prevConditionFields.componentType',
      },
      {
        name: 'masterBusinessObjectFieldCode',
        bind: 'prevConditionFields.businessObjectFieldCode',
      },
      {
        name: 'associateValue',
        dynamicProps: {
          type: ({ record }) => {
            switch (record?.get('componentType')) {
              case 'SWITCH':
                return 'boolean';
              case 'DATE_SELECTION_BOX':
                return 'date';
              case 'DATETIME_SELECTION_BOX':
                return 'dateTime';
              default:
                return 'string';
            }
          },
        },
        // type: 'dateTime',
      },
      {
        name: 'linkRelationType',
        type: 'string',
        label: intl.get('hmde.bo.field.linkRelationType').d('关联关系'),
        // textField: 'text',
        // valueField: 'value',
        options: (() => {
          return new DataSet({
            selection: DataSetSelection.single,
            data: [
              {
                meaning: intl
                  .get('hmde.bo.field.linkRelationType.oneToMany')
                  .d('关联对象 1 条记录对应当前对象的多条记录'),
                value: 'ONE_TO_MANY',
              },
              {
                meaning: intl
                  .get('hmde.bo.field.linkRelationType.oneToOne')
                  .d('关联对象 1 条记录对应当前对象的 1 条记录'),
                value: 'ONE_TO_ONE',
              },
            ],
          });
        })(),
        dynamicProps: {
          required: ({ record }) => record?.get('associateType') === 'SLAVE_MASTER',
        },
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.model.status.enabledFlag').d('启用'),
        defaultValue: true,
      },
    ],
    children: {
      // 已有编码规则
      businessObjectAssociateFieldList: new DataSet({
        primaryKey: 'masterBusinessObjectFieldCode',
        selection: false,
        paging: false,
        dataToJSON: DataToJSON.all,
        fields: [
          {
            name: 'relationField',
            type: 'object',
            label: intl.get('hmde.bo.field.relationField').d('关联字段'),
            lookupCode: 'HMDE.BUSINESS_OBJECT_ASSOCIATE.AVAILABLE.FIELD.SITE',
            textField: 'businessObjectFieldName',
            valueField: 'businessObjectFieldCode',
            ignore: 'always',
            noCache: true,
            required: true,
            dynamicProps: {
              lovPara: ({ dataSet }) => {
                const selectedFieldList = dataSet
                  .toData()
                  .filter(field => field?.masterBusinessObjectFieldCode)
                  .map(item => item?.masterBusinessObjectFieldCode);
                return {
                  selectedFieldList: selectedFieldList.toString(),
                  associateFieldType: 'FIELD',
                  publishFlag: false,
                  businessObjectId: dataSet.parent.current?.get('masterBusinessObjectId') || businessObjectId,
                };
              },
            },
          },
          {
            name: 'masterBusinessObjectFieldCode',
            type: 'string',
            bind: 'relationField.businessObjectFieldCode',
          },
          {
            name: 'associatedField',
            type: 'object',
            noCache: true,
            label: intl.get('hmde.bo.field.associatedField').d('被关联字段'),
            // lookupCode: 'HMDE.BUSINESS_OBJECT_ASSOCIATE.AVAILABLE.FIELD.SITE',
            textField: 'businessObjectFieldName',
            valueField: 'businessObjectFieldCode',
            ignore: 'always',
            required: true,
            dynamicProps: {
              lookupCode: ({ dataSet }) =>
                dataSet.parent.current.get('associateBusinessObjectId') ?
                  'HMDE.BUSINESS_OBJECT_ASSOCIATE.AVAILABLE.FIELD.SITE' : undefined,
              disabled: ({ dataSet }) => !dataSet.parent.current.get('associateBusinessObjectId'),
              lovPara: ({ dataSet }) => {
                const selectedFieldList = dataSet
                  .toData()
                  .filter(field => field?.associateBusinessObjectFieldCode)
                  .map(item => item?.associateBusinessObjectFieldCode);
                return {
                  selectedFieldList: selectedFieldList.toString(),
                  associateFieldType: 'FIELD',
                  publishFlag: true,
                  businessObjectId: dataSet.parent.current.get('associateBusinessObjectId') || businessObjectId,
                };
              },
            },
          },
          {
            name: 'associateBusinessObjectFieldCode',
            type: 'string',
            bind: 'associatedField.businessObjectFieldCode',
          },
          {
            name: 'associateFieldType',
            type: 'string',
            defaultValue: 'FIELD',
          },
        ],
      } as DataSetProps),
    },
    events: {
      update: ({ name, record, dataSet }) => {
        if (name === 'prevConditionFields') {
          record.set('associateValue', null);
        }
        if (name === 'associateBusinessObject') {
          dataSet.children.businessObjectAssociateFieldList.forEach(ele => {
            ele.set('associatedField', null);
          });
        }
      },
    },
  } as DataSetProps);
