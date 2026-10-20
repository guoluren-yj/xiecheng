/**
 * 参数配置ds
 * @date: 2021-06-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_DATA_PROCESS } from '_utils/config';
import intl from 'utils/intl';

export default function getParameterManagesDs() {
  return {
    selection: false,
    autoQuery: true,
    fields: [
      {
        name: 'parameterKey',
        type: 'string',
        label: intl.get('sdps.parameterManages.model.parameterManages.key').d('参数key'),
        // trim: 'both',
        required: true,
        pattern: '^[a-zA-Z][a-zA-Z0-9_.]*$',
        // 当选择的数据类型是转换参数时该框生效
        dynamicProps: ({ record }) => {
          const pt = record.get('paramType');
          if (pt === 'transform_parameter') {
            return {
              highlight: intl
                .get('sdps.parameterManages.model.parameterManages.paramTip')
                .d('参数key需要遵循格式：T.+参数名'),
            };
          } else return { highlight: null };
        },
      },
      {
        name: 'parameterName',
        type: 'intl',
        label: intl.get('sdps.parameterManages.model.parameterManages.parameterName').d('参数名称'),
        required: true,
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'paramType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.TYPE',
        label: intl.get('sdps.parameterManages.model.parameterManages.paramType').d('参数类型'),
        required: true,
      },
      {
        name: 'dataType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
        label: intl.get('sdps.parameterManages.model.parameterManages.dataType').d('数据类型'),
        required: true,
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('sdps.parameterManages.model.parameterManages.description').d('描述'),
      },
      {
        name: 'createdBy',
        type: 'string',
        label: intl.get('sdps.parameterManages.model.parameterManages.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'datetime',
        label: intl.get('sdps.parameterManages.model.parameterManages.creationDate').d('创建时间'),
      },
      {
        name: 'lastUpdatedBy',
        type: 'string',
        label: intl
          .get('sdps.parameterManages.model.parameterManages.lastUpdatedBy')
          .d('最后更新人'),
      },
      {
        name: 'lastUpdateDate',
        type: 'datetime',
        label: intl
          .get('sdps.parameterManages.model.parameterManages.lastUpdateDate')
          .d('最后更新时间'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.action').d('操作'),
      },
      {
        name: 'expression',
        type: 'string',
        label: intl.get('sdps.parameterManages.model.parameterManages.expression').d('表达式'),
        // 当选择的数据类型是转换参数时该框是否提交
        dynamicProps: ({ record }) => {
          const pt = record.get('paramType');
          if (pt === 'transform_parameter') {
            return { required: true, ignore: 'never' };
          } else return { required: false, ignore: 'always' };
        },
      },
    ],
    queryFields: [
      {
        name: 'parameterKey',
        type: 'string',
        label: intl.get('sdps.parameterManages.model.parameterManages.key').d('参数key'),
      },
      {
        name: 'parameterName',
        type: 'string',
        label: intl.get('sdps.parameterManages.model.parameterManages.name').d('参数名称'),
      },
      {
        name: 'enableFlag',
        type: 'string',
        label: intl.get('hzero.common.status').d('状态'),
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'paramType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.TYPE',
        label: intl.get('sdps.parameterManages.model.parameterManages.paramType').d('参数类型'),
      },
      {
        name: 'dataType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
        label: intl.get('sdps.parameterManages.model.parameterManages.dataType').d('数据类型'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/parameter-manages`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/parameter-manages`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
}
