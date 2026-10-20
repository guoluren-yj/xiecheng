/**
 * 新建逻辑模型总体DS
 */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'utils/utils';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import ImgIcon from '@/utils/ImgIcon';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default function (
  dataModelFieldDataSet,
  baseTableFieldDataSet,
  modelList,
  resourceUponRoleHierarchy
) {
  return {
    autoCreate: true,
    paging: false,
    fields: [
      {
        name: 'dataSourceType',
        type: 'string',
        label: '数据来源类型',
        defaultValue: 'TABLE',
        required: true,
      },
      {
        name: 'type',
        type: 'string',
        label: '模型分类',
        required: true,
        dynamicProps: () => {
          return {
            defaultValue:
              resourceUponRoleHierarchy === 'tenant' || isTenantRoleLevel() ? 'TENANT' : '',
          };
        },
      },
      {
        name: 'code',
        type: 'string',
        label: '模型编码',
        required: true,
        validator: async (value, nu, record: Record) => {
          const patternA = /^[a-zA-Z0-9][a-zA-Z0-9-_./]*$/g;
          // 校验方法
          if (record.get('code')) {
            if (!patternA.test(value)) {
              return '模型编码只能由大小写英文字母、数字、"_"、"."组成';
            }
            if (!value) {
              return '模型编码不能为空';
            }
            const flag = (modelList || []).some(
              (i) => i.code === value && i.type !== 'PLATFORM_SHARED'
            );
            if (flag) {
              return '已存在相同模型编码';
            }
          }
          return true;
        },
      },
      {
        name: 'name',
        type: 'string',
        label: '逻辑模型名称',
        validator: async (value, nu, record: Record) => {
          // 校验方法
          if (record.get('name')) {
            if (record.get('name').toString().length > 120) {
              return '模型名称长度应小于等于120。';
            }
            if (!value) {
              return '模型名称不能为空';
            }
          }
          return true;
        },
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        label: '逻辑模型描述',
        maxLength: 200,
      },
      {
        name: 'refTable',
        type: 'object',
        label: '引用表',
        lovCode: isTenantRoleLevel() ? 'HMDE.REF_TABLE' : 'HMDE.REF_TABLE.SITE',
        required: true,
        ignore: 'always',
        dynamicProps: {
          lovQueryAxiosConfig: function lovQueryAxiosConfig() {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/tables/page?tableTypeList=POSITIVE&tableTypeList=REVERSE`,
              method: 'GET',
            };
          },
        },
      },
      {
        name: 'refTableName',
        type: 'string',
        label: '引用表',
        required: true,
        bind: 'refTable.name',
      },
      {
        name: 'refTableCode',
        type: 'string',
        label: '编码',
        bind: 'refTable.code',
      },
      {
        name: 'refServiceCode',
        type: 'string',
        label: '引用表服务名',
        bind: 'refTable.serviceCode',
      },
      {
        name: 'refSchemaName',
        type: 'string',
        label: '引用表数据库名',
        bind: 'refTable.schemaName',
      },
      {
        name: 'refDataSourceType',
        type: 'string',
        label: '引用表数据库类型',
        bind: 'refTable.dataSourceType',
      },
      {
        name: 'sourceType',
        type: 'string',
        label: '来源',
      },
      {
        name: 'fieldName',
        type: 'string',
        label: '字段名称',
      },
      {
        name: 'fieldDescription',
        type: 'string',
        label: '字段说明',
      },
      {
        name: 'showName',
        type: 'string',
        label: '显示名称',
      },
      {
        name: 'extendsParentName',
        type: 'string',
        label: '继承自模型',
      },
      // {
      //   name: 'extendsParentCode',
      //   type: 'string',
      //   label: '父模型编码',
      // },
      {
        name: 'assignPattern',
        type: 'string',
        label: (
          <React.Fragment>
            <span>默认共享模式</span>
            <Tooltip
              title="授权租户的默认共享模式，如需调整可在【模型授权租户】菜单下编辑。白名单模式选择的租户允许查看当前模型，黑名单模式仅限制选择的租户查看当前模型。"
              placement="top"
            >
              <ImgIcon name="help.svg" size={14} style={{ margin: '0px 2px', marginBottom: 2 }} />
            </Tooltip>
          </React.Fragment>
        ),
        // required: true,
        defaultValue: 'BLOCK_LIST',
      },
    ],
    transport: {
      create: (args) => {
        const { data, dataSet } = args;
        const dataModelFieldData = dataSet?.getState('dataModelFieldData');
        const subCanAddFlagList = dataSet?.getState('subCanAddFlagList');
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/logic-models`,
          method: 'post',
          data: {
            ...data[0],
            assignPattern: data?.[0]?.type === 'PLATFORM_SHARED' ? data[0]?.assignPattern : null,
            modelFields: constructPayloadData(dataModelFieldData),
            subCanAddFlagList,
          },
        };
      },
      submit: (args) => {
        const { data } = args;
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/logic-models`,
          method: 'post',
          data: {
            ...data[0],
            modelFields: constructPayloadData(dataModelFieldDataSet.toData()),
            subCanAddFlagList: baseTableFieldDataSet
              ?.toData()
              .filter((record) => record.subCanAddFlag),
          },
        };
      },
    },
    events: {
      update: (args) => {
        const { name, value, dataSet } = args;
        if (name === 'refTable') {
          if (value && value.code) {
            dataModelFieldDataSet.removeAll();
            baseTableFieldDataSet.removeAll();
            baseTableFieldDataSet.setQueryParameter('code', value.code);
            baseTableFieldDataSet.setQueryParameter('refDataSourceType', value.dataSourceType);
            baseTableFieldDataSet.query();
          }
          if (value && value.dataSourceType) {
            dataSet.current.set('refDataSourceType', value.dataSourceType);
          }
        }
      },
    },
    data: [],
  } as DataSetProps;
}

function constructPayloadData(dataModelFieldData: any[]) {
  return dataModelFieldData.map((item) => {
    return {
      ...item,
      refTableId: item.metaTableId,
      metaTableId: undefined,
      // physicalFieldCode: item.code,
      // code: undefined,
      physicalFieldDecimalDigits: item.decimalDigits,
      decimalDigits: undefined,
      physicalFieldJdbcType: item.jdbcType,
      jdbcType: undefined,
    };
  });
}
