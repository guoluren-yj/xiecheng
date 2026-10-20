import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';

import { handleFieldProps } from '../utils';

const organizationId = getCurrentOrganizationId();

// 字段组件属性行DS
const getComponentAttrsLineDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'attributeName',
      type: 'string',
      label: intl.get(`spfm.investigationDefinition.model.definition.attrName`).d('属性名称'),
    },
    {
      name: 'attributeDescription',
      label: intl.get(`spfm.investigationDefinition.model.definition.attrDesc`).d('属性描述'),
    },
    {
      name: 'attributeValue',
      label: intl.get(`spfm.investigationDefinition.model.definition.attrVal`).d('属性值'),
      // todo 待优化,用computedProps
      dynamicProps: ({ dataSet, record }) => {
        let config = {};
        config = handleFieldProps({ dataSet, record });
        if (isEmpty(config)) {
          config = {
            trueValue: 1,
            falseValue: 0,
          };
        }
        return config;
      },
      // computedProps: {
      //   // required: ({ record }) => false,
      //   type: ({ record, dataSet }) => {
      //     // const config = handleFieldProps({dataSet, record});
      //     // const { type = 'string' } = config;
      //     return 'boolean';
      //   },
      //   trueValue: ({ record, dataSet }) => {
      //     // const config = handleFieldProps({dataSet, record});
      //     // const { trueValue = 1 } = config;
      //     const trueValue = record.get('attributeName');
      //     return 1;
      //   },
      //   falseValue: ({ record, dataSet }) => {
      //     // const config = handleFieldProps({dataSet, record});
      //     // const { falseValue = 0 } = config;
      //     const falseValue = record.get('attributeName');
      //     return 0;
      //   },
      // lookupCode: ({ record, dataSet }) => {
      //   const config = handleFieldProps({dataSet, record});
      //   const { lookupCode = null } = config;
      //   return lookupCode;
      // },
      // lovCode: ({ record, dataSet }) => {
      //   const config = handleFieldProps({dataSet, record});
      //   const { lovCode = null } = config;
      //   return lovCode;
      // },
      // pattern: ({ record, dataSet }) => {
      //   const config = handleFieldProps({dataSet, record});
      //   const { pattern = null } = config;
      //   return pattern;
      // },
      // multiple: ({ record, dataSet }) => {
      //   const config = handleFieldProps({dataSet, record});
      //   const { multiple = null } = config;
      //   return multiple;
      // },
      // noCache: ({ record, dataSet }) => {
      //   const config = handleFieldProps({dataSet, record});
      //   const { noCache = null } = config;
      //   return noCache;
      // },
      // lovPara: ({ record, dataSet }) => {
      //   const config = handleFieldProps({dataSet, record});
      //   const { lovPara = {} } = config;
      //   return lovPara;
      // },
      // min: ({ record, dataSet }) => {
      //   const config = handleFieldProps({dataSet, record});
      //   const { min = null } = config;
      //   return min;
      // },
      // precision: ({ record, dataSet }) => {
      //   const config = handleFieldProps({dataSet, record});
      //   const { precision = null } = config;
      //   return precision;
      // },
      // },
    },
  ],
  events: {
    beforeLoad: ({ data }) => {
      const isUpload = (data || []).some(item => item.componentType === 'Upload');
      if (isUpload) {
        const multipleIndex = data.findIndex(item => item.attributeName === 'multiple');
        return data.splice(multipleIndex, 1);
      }
      return data;
    },
  },
  transport: {
    read: ({ data, params }) => {
      const { investgCfLineId } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate-config-components/${investgCfLineId}`,
        method: 'GET',
        params,
        data,
      };
    },
  },
});

// 字段组件属性头DS
const getComponentAttrsHeaderDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'fieldDescription',
      type: 'string',
      label: intl.get(`spfm.investigationDefinition.model.definition.fieldDesc`).d('字段描述'),
    },
    {
      name: 'componentTypeMeaning',
      type: 'string',
      label: intl.get(`spfm.investigationDefinition.model.definition.component`).d('组件'),
    },
    {
      name: 'defaultValueType',
      type: 'string',
      label: intl
        .get(`spfm.investigationDefinition.model.definition.componentDefaultValueType`)
        .d('组件默认值类型'),
      lookupCode: 'SSLM.INVESTG_COMPONENT_DEFAULT_VALUE_TYPE',
    },
  ],
});

export { getComponentAttrsLineDS, getComponentAttrsHeaderDS };
