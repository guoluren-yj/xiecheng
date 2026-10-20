/**
 * 字段信息DS
 */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Tooltip } from 'choerodon-ui';

import ImgIcon from '@/utils/ImgIcon';
import { HZERO_HMDE, HZERO_HPFM } from '@/utils/config';
import { upperFirst } from 'lodash';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { Record } from 'choerodon-ui/dataset';

// import { getNumberTypeFields } from '@/routes/Modeler/ModelDesigner/utils/utils';

export default function(id): DataSetProps {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'displayName',
        type: 'string' as FieldType,
        label: '显示名称',
        required: true,
      },
      {
        name: 'fieldName',
        type: 'string' as FieldType,
        label: '字段名称',
        required: true,
      },
      {
        name: 'dataType',
        type: 'string' as FieldType,
        label: '数据类型',
        required: true,
        transformRequest: val => upperFirst(val),
      },
      {
        name: 'description',
        type: 'string' as FieldType,
        label: '字段说明',
      },
      {
        name: 'dataSize',
        type: 'string' as FieldType,
        label: '最大长度',
        required: true,
        // @ts-ignore
        validator: (value, name, record) => {
          if (
            record instanceof Record &&
            record &&
            record.dataSet &&
            record.dataSet.queryParameter &&
            // @ts-ignore
            record.dataSet.queryParameter.modelRadio === 'apiTable'
          ) {
            return;
          }
          // @ts-ignore

          if (value > record.get('physicalFieldDataSize')) {
            // @ts-ignore

            return `最大长度不能大于${record.get('physicalFieldDataSize')}`;
          }
          if (value < 1) {
            return '最大长度不能小于1';
          }
        },
      },
      {
        name: 'defaultValue',
        type: 'string' as FieldType,
        label: '默认值',
      },
      {
        name: 'requiredFlag',
        type: 'boolean' as FieldType,
        label: '是否必输',
        // required: true,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record }) => record.get('primaryFlag'),
        },
      },
      {
        name: 'primaryFlag',
        type: 'boolean' as FieldType,
        label: '是否主键',
        // required: true,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'valueList',
        type: 'object' as FieldType,
        label: '值集名称',
        ignore: 'always' as FieldIgnore,
        lovCode: 'HPFM.LOV.LOV_DETAIL.ORG',
        valueField: 'lovCode',
        textField: 'lovName',
        dynamicProps: {
          lovQueryAxiosConfig: function lovQueryAxiosConfig() {
            return {
              url: `${lowcodeOrganizationURL({ route: HZERO_HPFM })}/lov-headers?enabledFlag=1`,
              method: 'GET',
            };
          },
        },
      },
      {
        name: 'encodingRule',
        type: 'object' as FieldType,
        label: '编码规则',
        ignore: 'always' as FieldIgnore,
        lovCode: isTenantRoleLevel() ? 'HMDE.CODE_RULE' : 'HMDE.CODE_RULE.SITE',
        valueField: 'ruleCode',
        textField: 'ruleName',
        dynamicProps: {
          lovQueryAxiosConfig: function lovQueryAxiosConfig() {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HPFM,
              })}/code-rule?&tenantId=${getCurrentOrganizationId()}`,
              method: 'GET',
            };
          },
        },
      },
      {
        name: 'ruleCode',
        type: 'string' as FieldType,
        bind: 'encodingRule.ruleCode',
      },
      {
        name: 'ruleName',
        type: 'string' as FieldType,
        bind: 'encodingRule.ruleName',
      },
      {
        name: 'referenceValue',
        type: 'string' as FieldType,
        label: '传参值',
      },
      {
        name: 'encryptFlag',
        type: 'boolean' as FieldType,
        label: (
          <span>
            是否加密{' '}
            <Tooltip
              placement="top"
              title="同Hzero主键加密策略，将数字类型的字段进行加密并转化为字符串类型字段"
            >
              <ImgIcon name="help.svg" size={14} />
            </Tooltip>
          </span>
        ),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'valueListCode',
        type: 'string' as FieldType,
        // label: '值集编码或值集视图编码',
        bind: 'valueList.lovCode',
      },
      {
        name: 'valueListName',
        type: 'string' as FieldType,
        label: '值集编码或值集视图编码',
        bind: 'valueList.lovName',
      },
    ],
    transport: {
      submit: ({ data }) => {
        const newData = {
          ...data[0],
          _status: 'update',
          sourceLogicModelId: data[0]?.logicModelId,
        };
        const url = `/model-fields/${id}`;
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}${url}`,
          method: 'PUT',
          data: newData,
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(ele => {
          if (ele.get('primaryFlag')) {
            // eslint-disable-next-line no-param-reassign
            ele.selectable = false;
          }
        });
      },
      update: ({ name, record, value }) => {
        if (name === 'primaryFlag' && value) {
          record.set('requiredFlag', 1);
        }
      },
    },
  };
}
