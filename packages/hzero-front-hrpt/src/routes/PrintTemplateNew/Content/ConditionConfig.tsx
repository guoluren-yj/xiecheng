import React, { memo, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { getCurrentTenant, getResponse } from 'hzero-front/lib/utils/utils';
import { isArray } from 'lodash';
import { Spin, DataSet } from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';
import ExpressionEngineRule from "srm-front-boot/lib/components/ExpressionEngineRule";
import intl from 'srm-front-boot/lib/utils/intl';

import { queryPrintDocConditionParams } from '@/services/printTemplateService';
import type { IStore } from '../store';
import Store from '../store';

const ConditionConfig = ({
  loading,
  templateMultiple,
  enableConfigFileType,
}: {
  loading: boolean,
  templateMultiple: boolean,
  enableConfigFileType: boolean,
}) => {
  const {
    tenantId,
    currentDocument: {
      docCode, docId, sceneCode,
    },
  }: IStore = useContext<any>(Store).store;

  const tenantNum = useMemo(() => {
    const { tenantNum } = getCurrentTenant() || {};
    return tenantNum;
  }, []);

  const defaultRuleParamHook = ({ param, config }) => {
    const res = param;
    if (isArray(config)) {
      const field = config.find(i => i.name === "templateCode");
      if (field && (templateMultiple || field.multiple) && res && res.templateCode) {
        let template = JSON.parse(res.templateCode);
        if (isArray(template)) {
          template = template.map(t => JSON.stringify(t));
        }
        res.templateCode = JSON.stringify(template);
      }
    }
    return res;
  };

  const defaultReturnHook = ({ param, config }) => {
    const res = param;
    if (isArray(config)) {
      const field = config.find(i => i.name === "templateCode");
      if (field && (templateMultiple || field.multiple) && res && res.templateCode) {
        let template = JSON.parse(res.templateCode);
        if (isArray(template)) {
          template = template.map(t => JSON.parse(t));
        }
        res.templateCode = JSON.stringify(template);
      }
    }
    return res;
  };

  const beforeSave = async(params) => {
    let flag = true;
    if (params && params.sceneExecuteConfig && params.sceneExecuteConfig.length) {
      if (templateMultiple) {
        params.sceneExecuteConfig = params.sceneExecuteConfig.map(i => {
          if (i.name === 'templateCode') {
            return {
              ...i,
              multiple: true,
            };
          }
          return i;
        });
      }
      if (enableConfigFileType && !params.sceneExecuteConfig.some(i => i.name === 'printOutType')) {
        params.sceneExecuteConfig = [
          {
            name: 'printOutType',
            type: 'string',
            label: intl.get('hrpt.printTemplate.model.printTemplate.printOutType').d('输出文件格式'),
            lookupCode: 'HRPT.PRINT_FILE_TYPE',
            dynamicProps: {
              required: () => false,
            }
          },
          ...params.sceneExecuteConfig,
        ]
      }
    }
    const { conditionExpressionJson } = params || {};
    if (conditionExpressionJson) {
      const condition = JSON.parse(conditionExpressionJson);
      if (condition && condition.conditionLines && condition.conditionLines.length) {
        // 查询所有参数
        const res = await queryPrintDocConditionParams(docId);
        if (getResponse(res) && res && res.length) {
          // 过滤出已弃用的参数
          const deprecatedFields = res.filter(i => i.deprecatedFlag).map(i => i.fieldCode);
          if (deprecatedFields.length) {
            // 判断配置规则中是否包含已弃用的参数，左值和变量类型的右值均需判断
            const invalidConditionIndex = condition.conditionLines.findIndex(i =>
              (i.leftValue && deprecatedFields.includes(i.leftValue.name)) ||
              (i.rightValueType === 'variable' && i.rightValue && deprecatedFields.includes(JSON.parse(i.rightValue).name))
            );
            if (invalidConditionIndex !== -1) {
              flag = false;
              notification.warning({
                message: intl.get(`hrpt.printTemplate.view.message.conditonHasDeprecatedFields`, { index: invalidConditionIndex })
                  .d(`规则 ${invalidConditionIndex} 中包含已弃用字段，请调整后重新保存`),
              });
            }
          }
        }
      }
    }
    return flag;
  };

  const returnRuleDsConfigHook = (config) => {
    let newConfig: any[] = [];
    if (enableConfigFileType && (!config || !config.length || !config.some(i => i.name === 'printOutType'))) {
      newConfig.push({
        name: 'printOutType',
        type: 'string',
        label: intl.get('hrpt.printTemplate.model.printTemplate.printOutType').d('输出文件格式'),
        lookupCode: 'HRPT.PRINT_FILE_TYPE',
        dynamicProps: {
          required: () => false,
        }
      });
    }
    let textField = 'reportName';
    let valueField = 'reportCode';
    if (config && config.length) {
      newConfig = [...newConfig, ...config];
      newConfig = newConfig.map(i => {
        if (i.name === 'templateCode') {
          textField = i.textField;
          valueField = i.valueField;
          return {
            ...i,
            multiple: templateMultiple,
            dynamicProps: {
              lovPara: ({ record }) => {
                const printOutType = record.get('printOutType');
                return printOutType ? { printOutType, docId } : { docId };
              }
            }
          };
        } else {
          return i;
        }
      });
    }
    if (templateMultiple) {
      newConfig.push({
        name: 'defaultTemplate',
        label: intl.get('hrpt.printTemplate.model.printTemplate.defaultTemplate').d('默认模板'),
        type: 'string',
        textField,
        valueField,
        component: 'select',
        dynamicProps: {
          options: ({ record }) => {
            return new DataSet({
              data: record.get('templateCode'),
            });
          },
        },
      });
    }
    return newConfig;
  };

  const sceneExecuteConfigHook = (config) => {
    return config.map(field => {
      if (field.name === 'templateCode') {
        field.multiple = field.multiple || templateMultiple;
      }
      return field;
    });
  };

  const expressionFieldValueHook = {
    templateCode: ({ value, config }) => {
      let res = value;
      if (config && value) {
        let template = JSON.parse(value);
        const multiple = config.multiple || templateMultiple;
        if (isArray(template)) {
          template = template.map(t => JSON.parse(t));
          res = JSON.stringify(multiple ? template : template[0]);
        }
      }
      return res;
    },
  };

  const returnRuleDataHook = ({ param, config }) => {
    const res = param;
    if (isArray(config)) {
      const field = config.find(i => i.name === "templateCode");
      if (field && (templateMultiple || field.multiple) && res && res.templateCode) {
        let template = JSON.parse(res.templateCode);
        const { defaultTemplate } = res;
        if (isArray(template)) {
          let newList: any[] = [];
          let targetTemplate;
          template.forEach(t => {
            if (defaultTemplate && t.reportCode === defaultTemplate) {
              targetTemplate = JSON.stringify(t);
            } else {
              newList.push(JSON.stringify(t));
            }
          });
          if (targetTemplate) {
            // 默认模板移到第一位
            newList = [targetTemplate].concat(newList);
          }
          template = newList;
        }
        res.templateCode = JSON.stringify(template);
      }
    }
    return res;
  };

  const returnRuleDsChangeHook = ({ record, name, value }) => {
    if (name === 'templateCode' && templateMultiple) {
      const defaultTemplate = record.get('defaultTemplate');
      if (!defaultTemplate || !value || !value.some(v => v.reportCode === defaultTemplate)) {
        record.set('defaultTemplate', undefined);
      }
    } else if (name === 'printOutType') {
      record.set('templateCode', undefined);
      record.set('defaultTemplate', undefined);
    }
  };

  const returnRuleDataInitHook = ({ data, config, originData }) => {
    const newData = data;
    if (newData && newData.templateCode && templateMultiple) {
      const template = JSON.parse(newData.templateCode);
      if (template && template[0] && config && config.length) {
        const targetField = config.find(c => c.name === 'templateCode');
        if (targetField && targetField.valueField && template[0]) {
          const { valueField } = targetField;
          if (valueField) {
            newData.defaultTemplate = template[0][valueField]
          }
        }
      }
    }
    if (originData && originData.valueExpressionJson) {
      const valueExpressionData = JSON.parse(originData.valueExpressionJson);
      if (valueExpressionData && valueExpressionData.printOutType) {
        newData.printOutType = valueExpressionData.printOutType;
      }
    }
    return newData;
  };

  return loading ? <Spin /> : (
    <ExpressionEngineRule
      key={`${tenantNum}:${sceneCode}:${docCode}:${docId}:${templateMultiple}:${enableConfigFileType}`}
      code={`${tenantNum}:${sceneCode}:${docCode}`}
      sceneCode={sceneCode}
      leftValueCode="HRPT.PRINT_DOC_PARAM"
      leftValueLovQueryPara={{
        docId,
        tenantId,
        enabledFlag: 1,
      }}
      returnRuleDsConfigHook={returnRuleDsConfigHook}
      dataSource={{ docId, tenantId, enabledFlag: 1 }}
      params={{enabledFlag: 1}}
      defaultRuleParamHook={defaultRuleParamHook}
      defaultReturnHook={defaultReturnHook}
      expressionFieldValueHook={expressionFieldValueHook}
      returnRuleDataHook={returnRuleDataHook}
      beforeSave={beforeSave}
      sceneExecuteConfigHook={sceneExecuteConfigHook}
      returnRuleDsChangeHook={returnRuleDsChangeHook}
      returnRuleDataInitHook={returnRuleDataInitHook}
    />
  );
};

export default memo(observer(ConditionConfig));