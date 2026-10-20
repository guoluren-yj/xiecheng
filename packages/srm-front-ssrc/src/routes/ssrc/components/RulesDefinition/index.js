import React, { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { isArray, isNil, isEmpty, omit, isObject, noop } from 'lodash';
import { useDataSet, Table, Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import { saveRuleConfig } from '@/services/commonService';

import {
  tableDS,
  getPolicyConfigDataDs,
  getConditionJsonDs,
  getParamTableDs,
  getReturnValueTableDs,
  getCustomizeConditionCombinationDs,
  getReturnFieldTableDs,
} from './indexDS';
import RulesDefinitionModal from './RulesDefinitionModal';
import RulesDefinitionDetailModal from './RulesDefinitionDetailModal';
import { isJSON } from './util';

const RulesDefinition = ({
  targetRule = {},
  businessKey = '', // 业务主键
  type = 'edit', // 判断表格是否查询或者编辑
  metaBusinessKey = '',
  targetName = '',
  documentType = '', // 单据类型
  onQuery = noop, // 弹框操作查询
}) => {
  const tableDs = useDataSet(
    () =>
      tableDS({
        targetName,
        businessKey,
        type,
        documentType,
        metaBusinessKey,
      }),
    []
  );
  const paramTableDs = useDataSet(() => getParamTableDs(), []); // 参数表格 ds
  const returnValueDs = useDataSet(() => getReturnValueTableDs(), []); // 返回值 ds
  const policyConfigDataDs = useDataSet(() => getPolicyConfigDataDs(), []); // 策略配置行数据 ds
  const conditionJsonDs = useDataSet(() => getConditionJsonDs(), []); // 策略配置条件 ds
  const customizeConditionCombinationDs = useDataSet(
    () => getCustomizeConditionCombinationDs(),
    []
  );
  const returnFieldDs = useDataSet(() => getReturnFieldTableDs(), []);

  const [returnMultipleValueFlag, setReturnMultipleValueFlag] = useState(false); // 多值返回类型标识

  useEffect(() => {
    tableDs.query();
    if (!isEmpty(targetRule)) {
      setReturnMultipleValueFlag(!isEmpty(targetRule.multipleRet));
      targetRule.parameters && paramTableDs.loadData(JSON.parse(targetRule.parameters)); // eslint-disable-line
      if (targetRule.ret) {
        const ret = JSON.parse(targetRule.ret);
        returnValueDs.loadData(isArray(ret) ? ret : [ret]);
        initDs(isArray(ret) ? ret : [ret]);
      }
    }
  }, []);

  // 添加 field 字段 描述、执行规则值
  const initDs = (data) => {
    data.forEach((item) => {
      returnFieldDs.addField(item.name, {
        ...item,
        required: true,
        type: item.lovCode ? 'object' : item.type || 'string',
        transformResponse: (value, object) => {
          if (object && !object.value && !object.valueMeaning) {
            return null;
          }
          if (item.lovCode && item.valueField) {
            return item.multiple
              ? (isJSON(value) ? JSON.parse(value) : value).map((v, index) => {
                  const meaning = JSON.parse(object.valueMeaning || '[]');
                  return {
                    [item.valueField]: v,
                    [item.textField]: meaning[index],
                  };
                })
              : {
                  [item.valueField]: value,
                  [item.textField]: !returnMultipleValueFlag
                    ? object.valueMeaning
                    : JSON.parse(object.valueMeaning)[item.name],
                };
          } else {
            const reValue = isJSON(value) ? JSON.parse(value) : value;
            return isNil(reValue) ? '' : reValue;
          }
        },
        transformRequest: (value) => {
          if (value === undefined || value === null) {
            return null;
          }
          if (item.lovCode && item.valueField) {
            return isArray(value)
              ? JSON.stringify(value.map((v) => v[item.valueField]))
              : value[item.valueField];
          } else {
            return isArray(value) ? JSON.stringify(value) : value;
          }
        },
      });
    });
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'actionName',
        width: 200,
        renderer: ({ value, record }) => {
          return !isNil(value) ? (
            <Button funcType="link" onClick={() => handleEdit({ record })}>
              {value}
            </Button>
          ) : null;
        },
      },
      {
        name: 'description',
      },
      {
        name: 'priority',
        width: 120,
      },
    ];
  }, []);

  // 创建条件
  const conditionCreate = () => {
    conditionJsonDs.create({});
  };

  // 新增
  const handleCreate = () => {
    returnFieldDs.create({});
    policyConfigDataDs.create({});
    customizeConditionCombinationDs.create({});
    openModal({
      title: intl
        .get(`ssrc.rulesDefinition.model.rulesDefinition.rulesDefinitionAdd`)
        .d('策略新建'),
    });
  };

  // 策略配置的删除
  const handleDelete = async () => {
    const data = tableDs.selected || [];
    await tableDs.delete(data, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
    onQuery(businessKey);
  };

  // 编辑或者查看策略
  const handleEdit = ({ record }) => {
    const { conditionType, conditionLines, customizeConditionCombination } =
      JSON.parse(record.data && record.data.conditionJson) || {};
    let value = isJSON(record.data.value) ? JSON.parse(record.data.value) : record.data.value;
    if (isArray(value) || !isObject(value)) {
      const fieldData = returnValueDs.toData() || [];
      if (!isEmpty(fieldData)) {
        // eslint-disable-next-line no-param-reassign
        record.data[fieldData[0].name] = value;
      }
      value = { value }; // 转成对象，以便后面解构
    }
    const editData = {
      ...record.data,
      conditionType,
      conditionLines,
    };
    policyConfigDataDs.loadData([editData]);
    conditionJsonDs.loadData(conditionLines);
    returnFieldDs.create({ ...editData, ...value });
    customizeConditionCombinationDs.create({ customizeConditionCombination });
    if (type === 'edit') {
      openModal({
        title: intl
          .get(`ssrc.rulesDefinition.model.rulesDefinition.rulesDefinitionEdit`)
          .d('策略编辑'),
      });
    } else {
      return Modal.open({
        key: Modal.key(),
        title: intl
          .get(`ssrc.rulesDefinition.model.rulesDefinition.rulesDefinitionView`)
          .d('策略查看'),
        closable: true,
        okCancel: true,
        destroyOnClose: true,
        drawer: true,
        style: { width: 800 },
        okButton: false,
        cancelProps: {
          color: 'primary',
        },
        cancelText: intl.get(`hzero.common.button.close`).d('关闭'),
        children: (
          <RulesDefinitionDetailModal
            policyConfigDataDs={policyConfigDataDs}
            conditionJsonDs={conditionJsonDs}
            paramTableDs={paramTableDs}
            returnValueDs={returnValueDs}
            conditionCreate={conditionCreate}
            returnFieldDs={returnFieldDs}
            customizeConditionCombinationDs={customizeConditionCombinationDs}
          />
        ),
      });
    }
  };

  // 取消弹框事件
  const handleCancel = () => {
    policyConfigDataDs.reset();
    returnFieldDs.reset();
    conditionJsonDs.loadData([]);
    customizeConditionCombinationDs.reset();
  };

  // 保存策略
  const savePolicyConfig = (resolve, reject) => {
    policyConfigDataDs
      .validate()
      .then((response) => {
        returnFieldDs
          .validate()
          .then((result) => {
            conditionJsonDs
              .validate()
              .then((r) => {
                customizeConditionCombinationDs
                  .validate()
                  .then((vr) => {
                    const policyConfigData = policyConfigDataDs.current.toData();
                    const { conditionType } = policyConfigData;
                    const {
                      customizeConditionCombination,
                    } = customizeConditionCombinationDs.current.toData();
                    if (response && result && (conditionType === 'TRUE' || (r && vr))) {
                      const returnFieldData = returnFieldDs.current.toData();
                      const conditionJsonData = conditionJsonDs.toData();
                      const conditionJson = {
                        conditionType,
                        customizeConditionCombination:
                          conditionType === 'TRUE' ? undefined : customizeConditionCombination,
                        conditionLines: conditionType === 'TRUE' ? [] : conditionJsonData,
                      };

                      // 返回字段值拼成对象最后转成json字符串
                      const fieldData = returnValueDs.toData() || [];
                      const value = !returnMultipleValueFlag
                        ? returnFieldData[fieldData[0].name]
                        : {};
                      if (returnMultipleValueFlag) {
                        fieldData.forEach(
                          (item) => (value[item.name] = returnFieldData[item.name]) // eslint-disable-line
                        );
                      }
                      const saveData = {
                        ...omit(policyConfigData, [
                          'conditionExpression',
                          ...fieldData.map((item) => item.name),
                        ]),
                        fullPathCode: ['RFI', 'RFP'].includes(documentType)
                          ? 'SSRC.RF_TEMPLSTE_DEFINE_V2'
                          : 'SSRC.SOURCE_TEMPLATE_DEFINE_V2',
                        tenantId: getCurrentOrganizationId(),
                        conditionJson: JSON.stringify(conditionJson),
                        value: !returnMultipleValueFlag ? value : JSON.stringify(value),
                        executeType: 'CONSTANT', // 暂时写死
                        metaBusinessKey,
                        businessKey,
                        targetField: targetName,
                      };
                      saveRuleConfig(saveData)
                        .then((res) => {
                          if (getResponse(res)) {
                            tableDs.query();
                            onQuery(businessKey); // 查询更新外层数据
                            notification.success();
                            resolve();
                          } else {
                            resolve(false);
                          }
                        })
                        .catch(() => resolve(false));
                    } else {
                      reject(
                        intl
                          .get('ssrc.rulesDefinition.view.message.title.filler')
                          .d('请填写完整相关信息')
                      );
                    }
                  })
                  .catch(() => resolve(false));
              })
              .catch(() => resolve(false));
          })
          .catch(() => resolve(false));
      })
      .catch(() => resolve(false));
  };

  // 打开弹框事件
  const openModal = ({ title }) => {
    return Modal.open({
      key: Modal.key(),
      title,
      closable: true,
      okCancel: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 800 },
      onOk: () => new Promise((resolve, reject) => savePolicyConfig(resolve, reject)),
      afterClose: () => handleCancel(),
      children: (
        <RulesDefinitionModal
          policyConfigDataDs={policyConfigDataDs}
          conditionJsonDs={conditionJsonDs}
          paramTableDs={paramTableDs}
          returnValueDs={returnValueDs}
          conditionCreate={conditionCreate}
          returnFieldDs={returnFieldDs}
          customizeConditionCombinationDs={customizeConditionCombinationDs}
        />
      ),
    });
  };

  const buttons = useMemo(() => {
    return [
      ['add', { onClick: handleCreate }],
      ['delete', { onClick: handleDelete }],
    ];
  }, []);

  return (
    <Table
      dataSet={tableDs}
      columns={columns}
      buttons={type === 'edit' ? buttons : []}
      style={{ maxHeight: 'calc(100vh - 235px)' }}
      customizedCode="SSRC.SOURCE_TEMPLATE_WORKBENCH.DETAIL.RULES_DEFINITION"
    />
  );
};

export default observer(RulesDefinition);
