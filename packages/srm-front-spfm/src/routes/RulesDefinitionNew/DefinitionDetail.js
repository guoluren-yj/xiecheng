/**
 * index.js 业务规则定义
 * @date: 2021-06-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, Output, Table, Button, Lov, DataSet, Modal, Tabs } from 'choerodon-ui/pro';
import { isObject, isEmpty, isArray, omit } from 'lodash';
import { toJS } from 'mobx';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import {
  savePolicyConfigData,
  deletePolicyConfigData,
  updatePolicyConfigData,
  addImportDefaultConfig,
} from '@/services/rulesDefinitionService';
import { isJSON } from './util';
import RulesDefinitionModal from './RulesDefinitionModal';
import OperationLog from './OperationLog';
import styles from './index.less';

const modalKey = Modal.key();
const { TabPane } = Tabs;

function DefinitionDetail(props = {}) {
  const {
    formDs,
    tableDs,
    policyConfigDataDs,
    conditionJsonDs,
    paramTableDs,
    returnValueDs,
    returnFieldDs,
    customizeConditionCombinationDs,
    returnMultipleValueFlag,
  } = props;

  /**
   * 删除策略
   * @param {Object} record 行数据
   */
  const deletePolicyConfig = record => {
    const deleted = record.toData();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        deletePolicyConfigData(deleted).then(res => {
          if (getResponse(res)) {
            tableDs.query();
            notification.success();
          }
        });
      },
    });
  };

  const editRule = ({ record }, title) => {
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
    openEditModal(title);
  };

  const columns = [
    {
      name: 'actionName',
      width: 200,
    },
    {
      name: 'description',
    },
    {
      name: 'priority',
      width: 120,
    },
    {
      name: 'conditionExpression',
      width: 200,
    },
    {
      name: 'action',
      width: 200,
      renderer: ({ record, dataSet }) => (
        <span className="action-link">
          <a
            onClick={() =>
              editRule(
                { record, dataSet },
                intl.get('spfm.rulesDefinition.view.modal.title.edit').d('策略编辑')
              )
            }
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => deletePolicyConfig(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </span>
      ),
    },
  ];

  const ruleColumns = [
    {
      name: 'name',
      width: 120,
    },
    {
      name: 'type',
      width: 120,
    },
    {
      name: 'label',
      width: 90,
    },
    {
      name: 'lovCode',
      width: 120,
    },
    {
      name: 'lookupCode',
      width: 120,
    },
    {
      name: 'textField',
      width: 120,
    },
    {
      name: 'valueField',
      width: 120,
    },
  ];

  /**
   * 保存或者更新策略数据
   */
  const savePolicyConfig = (resolve, reject) => {
    policyConfigDataDs
      .validate()
      .then(response => {
        returnFieldDs
          .validate()
          .then(result => {
            conditionJsonDs
              .validate()
              .then(r => {
                customizeConditionCombinationDs
                  .validate()
                  .then(vr => {
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
                          item => (value[item.name] = returnFieldData[item.name]) // eslint-disable-line
                        );
                      }
                      const saveData = {
                        ...omit(policyConfigData, [
                          'conditionExpression',
                          ...fieldData.map(item => item.name),
                        ]),
                        fullPathCode: formDs.current.toData().fullPathCode,
                        tenantId: getCurrentOrganizationId(),
                        conditionJson: JSON.stringify(conditionJson),
                        value: !returnMultipleValueFlag ? value : JSON.stringify(value),
                        executeType: 'CONSTANT', // 暂时写死
                      };
                      if (policyConfigData.actionId) {
                        updatePolicyConfigData(saveData)
                          .then(res => {
                            if (getResponse(res)) {
                              tableDs.query();
                              notification.success();
                              resolve();
                            } else {
                              resolve(false);
                            }
                          })
                          .catch(() => resolve(false));
                      } else {
                        savePolicyConfigData(saveData)
                          .then(res => {
                            if (getResponse(res)) {
                              tableDs.query();
                              notification.success();
                              resolve();
                            } else {
                              resolve(false);
                            }
                          })
                          .catch(() => resolve(false));
                      }
                    } else {
                      reject(
                        intl
                          .get('spfm.rulesDefinition.view.action.validate.save')
                          .d('必输项有缺失，请完善')
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

  const handleCancel = () => {
    policyConfigDataDs.reset();
    returnFieldDs.reset();
    conditionJsonDs.loadData([]);
    customizeConditionCombinationDs.reset();
  };

  const openEditModal = title => {
    Modal.open({
      key: modalKey,
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

  const conditionCreate = () => {
    conditionJsonDs.create({});
  };

  const addRule = () => {
    returnFieldDs.create({});
    policyConfigDataDs.create({});
    customizeConditionCombinationDs.create({});
    openEditModal(intl.get('spfm.rulesDefinition.view.modal.title.create').d('策略新建'));
  };

  /**
   * 创建按钮
   */
  const createButton = () => {
    return (
      <Button icon="playlist_add" onClick={addRule} key="add">
        {intl.get('hzero.common.create').d('新建')}
      </Button>
    );
  };

  /**
   * 保存引用预设
   * @param {Array} record
   * @param {Object} defaultConfigDs
   */
  const saveImportDefaultConfig = (record = [], defaultConfigDs) => {
    addImportDefaultConfig(
      record.map(r => {
        return {
          ...r,
          tenantId: getCurrentOrganizationId(),
          priority: -1,
        };
      })
    ).then(res => {
      if (getResponse(res)) {
        tableDs.query();
        notification.success();
      }
      defaultConfigDs.reset();
    });
  };

  /**
   * 引用预设策略按钮
   */
  const renderDefaultConfigBtn = () => {
    const { hasDefault, fullPathCode } =
      (formDs && formDs.current && formDs.current.toData()) || {};
    const defaultConfigDs = new DataSet({
      fields: [
        {
          name: 'defaultConfig',
          label: intl.get('spfm.rulesDefinition.view.action.importConfig.button').d('引用预设策略'),
          type: 'object',
          lovCode: 'SPFM.DEFAULT_CNF_ACTIONS_VIEW',
          lovPara: { fullPathCode },
          multiple: true,
        },
      ],
    });

    return hasDefault ? (
      <Lov
        dataSet={defaultConfigDs}
        name="defaultConfig"
        noCache
        mode="button"
        onChange={(record = []) => saveImportDefaultConfig(record || [], defaultConfigDs)}
        clearButton={false}
        placeholder={intl
          .get('spfm.rulesDefinition.view.action.importConfig.button')
          .d('引用预设策略')}
      />
    ) : null;
  };

  const buttons = [createButton(), renderDefaultConfigBtn()];

  const rennderDescription = ({ value }) => {
    return (
      // eslint-disable-next-line react/no-danger
      <div
        className={styles['rule-definition-description']}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  };

  const rennderModelObject = ({ value, record }) => {
    if (isEmpty(record?.get('modelObjectVOList'))) {
      return (
        // eslint-disable-next-line react/no-danger
        <div
          className={styles['rule-definition-description']}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    } else {
      const modelObjectVOList = toJS(record?.get('modelObjectVOList'));

      const primaryStr = `${intl.get('spfm.rulesDefinition.view.msg.masterModel').d('主模型')}：${
        modelObjectVOList.find(item => item.primaryModelFlag)?.modelObject
      }；`;
      const otherStr = `${intl
        .get('spfm.rulesDefinition.view.msg.otherModel')
        .d('其他模型')}：${modelObjectVOList
        .filter(item => !item.primaryModelFlag)
        .map(ele => ele.modelObject)
        .join(',')}`;

      return (
        <div
          className={styles['rule-definition-description']}
          dangerouslySetInnerHTML={{ __html: primaryStr + otherStr }}
        />
      );
    }
  };

  const openOperationLog = () => {
    const { fullPathCode } = (formDs && formDs.current && formDs.current.toData()) || {};
    Modal.open({
      key: modalKey,
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      closable: true,
      okCancel: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 742 },
      footer: null,
      children: <OperationLog fullpathCode={fullPathCode} />,
    });
  };

  return (
    <div style={{ overflow: 'hidden scroll' }}>
      <div className="definition-detail-wrapper">
        <div className="definition-detail-form">
          <div style={{ display: 'flex' }}>
            <div style={{ fontWeight: 600, fontSize: '16px', flex: 1 }}>
              {intl.get('spfm.rulesDefinition.view.tab.basicServiceInfo').d('基础服务信息')}
            </div>
            <div>
              <Button onClick={() => openOperationLog()} funcType="flat">
                {intl.get(`hzero.common.button.operating`).d('操作记录')}
              </Button>
            </div>
          </div>
          <Form
            dataSet={formDs}
            labelLayout="vertical"
            columns={3}
            className="c7n-pro-vertical-form-display"
          >
            <Output name="fullPathCode" colSpan={1} />
            <Output name="defaultRetMeaning" colSpan={1} />
            <Output
              name="modelObject"
              colSpan={1}
              renderer={({ value, text, record }) => rennderModelObject({ value, text, record })}
            />
            <Output
              name="description"
              colSpan={3}
              renderer={({ value, text }) => rennderDescription({ value, text })}
            />
          </Form>
        </div>
        <div className="definition-detail-table">
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={intl.get('spfm.rulesDefinition.view.tab.policyConfig').d('策略配置')}
              key="1"
            >
              <FilterBarTable
                dataSet={tableDs}
                columns={columns}
                buttons={buttons}
                filterBarConfig={{
                  autoQuery: false,
                  collpaseble: true,
                  collpase: true,
                }}
                customizable
                customizedCode="SPFM.RULE_DEFINITION.POLICY_CONFIG.LIST"
              />
            </TabPane>
            <TabPane
              tab={intl.get('spfm.rulesDefinition.view.tab.paramInfo').d('参数说明')}
              key="2"
            >
              <div className="content-title">
                {intl.get('spfm.rulesDefinition.view.card.paramTable').d('允许使用的特性值配置')}
              </div>
              <Table columns={ruleColumns} dataSet={paramTableDs} width={1000} data={[]} />
              <div className="content-title">
                {intl.get('spfm.rulesDefinition.view.card.returnValue').d('允许使用的执行规则配置')}
              </div>
              <Table columns={ruleColumns} width={1000} dataSet={returnValueDs} data={[]} />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default DefinitionDetail;
