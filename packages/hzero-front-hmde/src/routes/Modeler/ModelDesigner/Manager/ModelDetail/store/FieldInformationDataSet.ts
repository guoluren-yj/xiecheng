/**
 * 字段信息DS
 */
// import sortBy from 'lodash/sortBy';
import { HZERO_HMDE, HZERO_HPFM } from '@/utils/config';
import { upperFirst } from 'lodash';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

export default function (id, handleMenuQueryList, resourceUponRoleHierarchy, extendsParentCode) {
  return {
    autoQuery: false,
    pageSize: 20,
    fields: [
      { name: 'displayName', type: 'string', label: '显示名称', required: true },
      { name: 'fieldName', type: 'string', label: '字段名称', defaultValue: 'ID' },
      { name: 'code', type: 'string', label: '字段编码' },
      {
        name: 'dataType',
        type: 'string',
        label: '数据类型',
        required: true,
        transformRequest: (val) => upperFirst(val),
      },
      {
        name: 'description',
        type: 'string',
        label: '字段说明',
      },
      {
        name: 'fieldType',
        type: 'string',
        label: '字段类型',
        required: true,
      },
      { name: 'dataSize', type: 'string', label: '最大长度', defaultValue: '200', required: true },
      { name: 'defaultValue', type: 'string', label: '默认值' },
      {
        name: 'requiredFlag',
        type: 'boolean',
        label: '是否必输',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'valueList',
        type: 'object',
        label: '值集名称',
        ignore: 'always',
        lovCode: 'HPFM.LOV.LOV_DETAIL.ORG',
        valueField: 'lovCode',
        textField: 'lovName',
        lovQueryAxiosConfig: function lovQueryAxiosConfig() {
          return {
            url: `${lowcodeOrganizationURL({
              route: HZERO_HPFM,
            })}/lov-headers?enabledFlag=1`,
            method: 'GET',
          };
        },
      },
      {
        name: 'valueListCode',
        type: 'string',
        bind: 'valueList.lovCode',
      },
      {
        name: 'valueListName',
        label: '值集名称',
        type: 'string',
        bind: 'valueList.lovName',
      },
      {
        name: 'valueListCode',
        type: 'string' as FieldType,
        label: '值集编码或值集视图编码',
        bind: 'valueList.lovCode',
      },
      {
        name: 'valueListName',
        type: 'string' as FieldType,
        label: '值集编码或值集视图编码',
        bind: 'valueList.lovName',
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
        name: 'regexpExpression',
        type: 'string' as FieldType,
        label: '正则属性配置',
        // required: true,
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
        name: 'encryptFlag',
        type: 'boolean',
        label: '是否加密',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        help: '同Hzero主键加密策略，将数字类型的字段进行加密并转化为字符串类型字段',
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-fields/${id}/page`,
        method: 'get',
        transformResponse: (data) => {
          try {
            const parseData = JSON.parse(data);
            // let content = sortBy(parseData.content, [
            //   (o) => !o.primaryFlag,
            //   (o) => o.requiredFlag === 1,
            // ]);
            let { content } = parseData;
            content = content.map((item) => {
              if (item.fieldType) {
                let fieldTypeMeaning;
                switch (item.fieldType) {
                  case 'VIRTUAL_FIELD':
                    fieldTypeMeaning = '虚拟字段';
                    break;
                  case 'REDUNDANT_FIELD':
                    fieldTypeMeaning = '扩展字段';
                    break;
                  case 'TABLE_FIELD':
                    fieldTypeMeaning = '模型字段';
                    break;
                  default:
                    break;
                }
                return { ...item, fieldTypeMeaning };
              }
              return item;
            });
            return { ...parseData, content };
          } catch (e) {
            // do nothing, use default error deal
          }
          return data;
        },
      },
      destroy: ({ data }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-fields/${id}/batch-delete`,
        method: 'delete',
        data,
      }),
      submit: ({ data }) => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/model-fields/${id}/batch-update`,
          method: 'post',
          data,
        };
      },
    },
    events: {
      submitSuccess: () => {
        handleMenuQueryList();
      },
      load: ({ dataSet }) => {
        dataSet.forEach((ele) => {
          // 模型字段列表，如果字段是主键或者who字段或者parentFieldFlag === 1 则不能删除
          if (
            ele.get('primaryFlag') ||
            isPresetField(ele.get('fieldName'), ['others', ['OBJECT_VERSION_NUMBER']]) ||
            (extendsParentCode &&
              resourceUponRoleHierarchy === 'tenant' &&
              ele.get('parentFieldFlag'))
          ) {
            Object.assign(ele, { selectable: false });
          }
        });

        // 在当前DS载入完成前禁止点击新增字段
        const button = document.querySelector(
          '.model-detail-button-add-field'
        ) as HTMLElement | null;

        if (button) {
          button.classList.remove('.model-detail-button-add-field-operation-disabled');

          setTimeout(() => {
            button.style.cursor = '';
            button.style.pointerEvents = '';
            button.style.opacity = '';
          }, 750);
        }
      },
    },
  };
}
