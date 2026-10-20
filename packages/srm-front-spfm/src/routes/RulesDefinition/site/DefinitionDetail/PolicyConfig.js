/**
 * 策略配置
 * @date: 2020-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useState, useContext } from 'react';
import { Table, Button, Lov, DataSet } from 'choerodon-ui/pro';
import { Modal } from 'choerodon-ui';
import { omit, isObject, isEmpty, isArray } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  savePolicyConfigData,
  deletePolicyConfigData,
  updatePolicyConfigData,
  addImportDefaultConfig,
} from '@/services/rulesDefinitionService';
import Context from '../../components/Context';
import PolicyConfigModal from './PolicyConfigModal';
import { isJSON } from '../../util';

function PolicyConfig() {
  const [modalVisible, handleVisible] = useState(false);
  const [modalTitle, handleModalTitle] = useState('');
  const [conditionVisible, handleConditionVisible] = useState(false);
  const [conditionTypeDisabled, handleConditionTypeDisabled] = useState(false);
  const {
    policyConfigDs,
    policyConfigDataDs,
    conditionJsonDs,
    paramServiceDs,
    paramTableDs,
    returnValueDs,
    returnFieldDs,
    returnMutlValueFlag,
  } = useContext(Context);

  /**
   * 控制modal展开收起方法
   * @param {Boolean} flag modal展开收起标志位
   */
  const handleModalVisible = (flag) => {
    handleVisible(flag);
    if (flag) {
      handleConditionTypeDisabled((paramTableDs.toData() || []).length <= 0);
    } else {
      policyConfigDataDs.reset();
      returnFieldDs.reset();
      conditionJsonDs.loadData([]);
    }
    // 临时处理lov多选弹框后显示已勾选的数据错乱bug，因此在弹框dom上面添加一个className
    const modalDom = document.querySelector('.c7n-pro-modal-container') || {};
    if (flag) {
      modalDom.className =
        'c7n-pro-modal-container rule-definition-pro-modal-container-remove-visibility';
    } else {
      modalDom.className = 'c7n-pro-modal-container';
    }
  };

  /**
   * 行编辑事件
   * @param {Object} param 参数
   * @param {Boolean} flag 展开收起标志位
   * @param {String} title 标题
   */
  const editPolicyConfig = (param = {}, flag = false, title = '') => {
    const { record = {} } = param;
    const { conditionType, conditionLines } =
      JSON.parse(record.data && record.data.conditionJson) || {};
    let value = isJSON(record.data.value) ? JSON.parse(record.data.value) : record.data.value;
    if (isArray(value) || !isObject(value)) {
      const fieldData = returnValueDs.toData() || [];
      if (!isEmpty(fieldData)) {
        record.data[fieldData[0].name] = value;
      }
      value = { value }; // 转成对象，以便后面解构
    }
    const editData = {
      ...record.data,
      conditionType,
      conditionLines,
    };
    policyConfigDataDs.create(editData);
    returnFieldDs.create({ ...editData, ...value });
    handleConditionVisible(conditionType !== 'TRUE');
    policyConfigDataDs.first();
    conditionJsonDs.loadData(conditionLines);
    handleModalVisible(flag);
    handleModalTitle(title);
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
      name: 'action',
      width: 200,
      renderer: ({ record, dataSet }) => (
        <span className="action-link">
          <a
            onClick={() =>
              editPolicyConfig(
                { record, dataSet },
                true,
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

  /**
   * 新建策略，并且控制弹框
   */
  const addPolicyConfig = () => {
    handleModalVisible(true);
    handleConditionVisible(false);
    handleModalTitle(intl.get('spfm.rulesDefinition.view.modal.title.create').d('策略新建'));
    conditionJsonDs.create({});
    policyConfigDataDs.create({});
    returnFieldDs.create({});
  };

  /**
   * 保存或者更新策略数据
   */
  const savePolicyConfig = () => {
    policyConfigDataDs.validate().then((response) => {
      returnFieldDs.validate().then((result) => {
        conditionJsonDs.validate().then((r) => {
          const policyConfigData = policyConfigDataDs.current.toData();
          const { conditionType } = policyConfigData;
          if (response && result && (conditionType === 'TRUE' || r)) {
            const returnFieldData = returnFieldDs.current.toData();
            const conditionJsonData = conditionJsonDs.toData();
            const conditionJson = {
              conditionType,
              conditionLines: conditionType === 'TRUE' ? [] : conditionJsonData,
            };

            // 返回字段值拼成对象最后转成json字符串
            const fieldData = returnValueDs.toData() || [];
            const value = !returnMutlValueFlag ? returnFieldData[fieldData[0].name] : {};
            if (returnMutlValueFlag) {
              fieldData.forEach((item) => (value[item.name] = returnFieldData[item.name])); // eslint-disable-line
            }
            const saveData = {
              ...omit(policyConfigData, [
                'conditionExpression',
                ...fieldData.map((item) => item.name),
              ]),
              fullPathCode: paramServiceDs.current.toData().fullPathCode,
              tenantId: getCurrentOrganizationId(),
              conditionJson: JSON.stringify(conditionJson),
              value: !returnMutlValueFlag ? value : JSON.stringify(value),
              executeType: 'CONSTANT', // 暂时写死
            };
            if (policyConfigData.actionId) {
              updatePolicyConfigData(saveData).then((res) => {
                if (getResponse(res)) {
                  policyConfigDs.query();
                  handleModalVisible(false);
                  notification.success();
                }
              });
            } else {
              savePolicyConfigData(saveData).then((res) => {
                if (getResponse(res)) {
                  policyConfigDs.query();
                  handleModalVisible(false);
                  notification.success();
                }
              });
            }
          }
        });
      });
    });
  };

  /**
   * 删除策略
   * @param {Object} record 行数据
   */
  const deletePolicyConfig = (record) => {
    const deleted = record.toData();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        deletePolicyConfigData(deleted).then((res) => {
          if (getResponse(res)) {
            policyConfigDs.query();
            notification.success();
          }
        });
      },
    });
  };

  /**
   * 创建按钮
   */
  const createButton = () => {
    return (
      <Button icon="playlist_add" onClick={addPolicyConfig} key="add">
        {intl.get('hzero.common.create').d('新建')}
      </Button>
    );
  };

  const saveImportDefaultConfig = (record = [], defaultConfigDs) => {
    addImportDefaultConfig(
      record.map((r) => {
        return {
          ...r,
          tenantId: getCurrentOrganizationId(),
          priority: -1,
        };
      })
    ).then((res) => {
      if (getResponse(res)) {
        policyConfigDs.query();
        notification.success();
      }
      defaultConfigDs.reset();
    });
  };

  /**
   * 引用预设策略按钮
   */
  const renderDefaultConfigBtn = () => {
    const { hasDefault, fullPathCode } = paramServiceDs.current.toData() || {};
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
        onChange={(record = {}) => saveImportDefaultConfig(record, defaultConfigDs)}
        clearButton={false}
        placeholder={intl
          .get('spfm.rulesDefinition.view.action.importConfig.button')
          .d('引用预设策略')}
      />
    ) : null;
  };

  const buttons = [createButton(), renderDefaultConfigBtn()];

  return (
    <React.Fragment>
      <Table columns={columns} buttons={buttons} dataSet={policyConfigDs} />
      <PolicyConfigModal
        title={modalTitle}
        conditionVisible={conditionVisible}
        handleConditionVisible={handleConditionVisible}
        cancel={() => handleModalVisible(false)}
        onOk={savePolicyConfig}
        visible={modalVisible}
        conditionTypeDisabled={conditionTypeDisabled}
      />
    </React.Fragment>
  );
}

export default PolicyConfig;
