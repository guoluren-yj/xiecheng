/*
 * FieldPropertyModal - 事件属性
 * @date: 2018/08/10 14:42:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind, Debounce } from 'lodash-decorators';
import {
  DataSet,
  notification,
  Table,
  CheckBox,
  Tooltip,
  TextField,
  Modal,
  Form,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { FieldPropertyDS, ConditionTableDS, FilterLogicDS, lovParamDS } from './stores';
import styles from './index.less';
import { saveFieldPropertys } from '@/services/supplierModelDefinitionService';

export default class FieldPropertyModal extends Component {
  fieldPropertyDS = new DataSet({
    ...FieldPropertyDS(),
  });

  // 必填，编辑条件配置
  conditionTableDS = new DataSet({
    ...ConditionTableDS(),
    queryParameter: {
      modelSettingId: this.props.modelSettingId,
    },
  });

  // lov查询参数
  lovParamDs = new DataSet({
    ...lovParamDS({ propertyType: 'lovParam' }),
  });

  // 筛选逻辑
  filterLogicDS = new DataSet({
    ...FilterLogicDS(),
  });

  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
    const { currentRecord } = this.props;
    this.fieldPropertyDS.setQueryParameter(
      'modelSettingLineId',
      currentRecord.get('modelSettingLineId')
    );
    this.fieldPropertyDS.query();
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'fieldPropertyCode',
        editor: true,
      },
      {
        name: 'fieldPropertyValue',
        className: styles['supplier-model-property'],
        renderer: ({ record }) => {
          const hiddenCheckBox = record.get('fieldPropertyCode') === 'lovParam';
          if (
            record.get('fieldPropertyCode') === 'disabled' ||
            record.get('fieldPropertyCode') === 'required' ||
            hiddenCheckBox
          ) {
            return (
              <span>
                {!hiddenCheckBox && (
                  <CheckBox
                    name="fieldPropertyValue"
                    value="1"
                    unCheckedValue="0"
                    record={record}
                  />
                )}
                <Tooltip
                  title={intl.get(`sslm.supplierModelDefine.model.define.condition`).d('条件配置')}
                  placement="top"
                >
                  <a onClick={() => this.openConditionModal(record)} style={{ marginLeft: 10 }}>
                    {intl.get(`sslm.supplierModelDefine.model.define.fx`).d('fx')}
                  </a>
                </Tooltip>
              </span>
            );
          } else if (
            record.get('fieldPropertyCode') === 'display' ||
            record.get('fieldPropertyCode') === 'displayUrl'
          ) {
            return (
              <CheckBox name="fieldPropertyValue" value="1" unCheckedValue="0" record={record} />
            );
          } else {
            return (
              <TextField name="fieldPropertyValue" record={record} style={{ width: '100%' }} />
            );
          }
        },
      },
    ];
    return columns;
  }

  /**
   * 必输编辑条件配置
   */
  @Debounce(200)
  @Bind()
  openConditionModal(currentRecord = {}) {
    const { conExpression, fieldPropertyCode } = currentRecord.get([
      'conExpression',
      'fieldPropertyCode',
    ]);
    const lovParamFlag = fieldPropertyCode === 'lovParam';
    const conditionDs = lovParamFlag ? this.lovParamDs : this.conditionTableDS;
    conditionDs.loadData([]);
    this.filterLogicDS.create({
      conExpression,
    });
    if (currentRecord.getState('validate')) {
      // 修改过数据
      const fieldProperty = currentRecord.get('lines');
      if (fieldProperty) {
        const fieldPropsData = JSON.parse(fieldProperty);
        if (fieldPropsData && Array.isArray(fieldPropsData) && fieldPropsData.length !== 0) {
          fieldPropsData.forEach((li) => {
            conditionDs.create(li);
          });
        }
      }
    } else {
      // 第一次打开条件配置
      const currentData = currentRecord.toData();
      const { lines } = currentData;
      if (lines && Array.isArray(lines) && lines.length !== 0) {
        lines.forEach((li) => {
          conditionDs.create(li);
        });
      }
    }
    const buttons = [['add', { afterClick: () => this.handleConditionAdd(conditionDs) }]];
    const columns = [
      {
        name: lovParamFlag ? 'sourceFieldCode' : 'sourceFieldCodeLov',
        editor: true,
      },
      {
        name: 'conExpression',
        editor: true,
        width: 130,
      },
      {
        name: 'targetValue',
        editor: true,
        width: 180,
      },

      {
        name: 'operator',
        renderer: ({ record }) => (
          <a
            onClick={() => {
              conditionDs.delete(record);
            }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        ),
      },
    ];
    Modal.open({
      title: intl.get(`sslm.supplierModelDefine.model.define.condition`).d('条件配置'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      closable: true,
      style: { width: 800 },
      destroyOnClose: true,
      children: lovParamFlag ? (
        <Table rowNumber dataSet={conditionDs} columns={columns} buttons={buttons} />
      ) : (
        <>
          <Table rowNumber dataSet={conditionDs} columns={columns} buttons={buttons} />
          <Form
            record={this.filterLogicDS.current}
            columns={1}
            labelLayout="float"
            style={{ marginTop: 40 }}
          >
            <TextField name="conExpression" />
          </Form>
        </>
      ),
      onOk: () => {
        return lovParamFlag
          ? this.handleLovParamModalSave(currentRecord)
          : this.handleConditionModalSave(currentRecord);
      },
      onCancel: () => {
        if (!currentRecord.getState('validate')) {
          this.filterLogicDS.reset();
          conditionDs.reset();
        }
      },
    });
  }

  /**
   * 处理值条件配置保存
   */
  @Bind()
  async handleConditionModalSave(currentRecord) {
    if (this.conditionTableDS.dirty || this.filterLogicDS.dirty) {
      const filterLogicValidateFlag = await this.filterLogicDS.current.validate();
      const conditionTableValidateFlag = await this.conditionTableDS.validate();
      if (filterLogicValidateFlag && conditionTableValidateFlag) {
        // 配置行数据
        const conditionTableData = this.conditionTableDS.toJSONData() || [];
        // 筛选逻辑
        const conExpression = this.filterLogicDS.current.get('conExpression');
        if (conditionTableData.length) {
          const conditionLogic = conExpression.match(/\d/g) || [];
          let conditionFlag = false;
          this.conditionTableDS.some((record) => {
            const index = (record.index + 1).toString();
            if (!conditionLogic.includes(index)) {
              conditionFlag = true;
              return true;
            }
            return false;
          });
          if (conditionLogic.length !== conditionTableData.length || conditionFlag) {
            notification.warning({
              placement: 'bottomRight',
              message: intl
                .get('sslm.supplierModelDefine.view.message.filterLogicError')
                .d('筛选逻辑配置不正确！'),
            });
            return false;
          } else {
            currentRecord.setState('validate', true);
            this.handleConditionSaveData({ conditionTableData, currentRecord, conExpression });
          }
        }
        // else {
        // currentRecord.setState('validate', true);
        // this.handleConditionSaveData({ conditionTableData, currentRecord, conExpression });
        // }
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl.get('sslm.common.view.message.maintainInfo').d('请填写相关信息！'),
        });
        return false;
      }
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('sslm.common.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
      });
      return false;
    }
  }

  /**
   * 处理值条件配置保存
   */
  @Bind()
  async handleLovParamModalSave(currentRecord) {
    if (this.lovParamDs.dirty) {
      const conditionTableValidateFlag = await this.lovParamDs.validate();
      if (conditionTableValidateFlag) {
        // 配置行数据
        const conditionTableData = this.lovParamDs.toJSONData() || [];
        // 筛选逻辑
        if (conditionTableData.length) {
          currentRecord.setState('validate', true);
          this.handleConditionSaveData({ conditionTableData, currentRecord, conExpression: '' });
        }
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl.get('sslm.common.view.message.maintainInfo').d('请填写相关信息！'),
        });
        return false;
      }
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('sslm.common.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
      });
      return false;
    }
  }

  /**
   * 处理条件配置的数据格式
   */
  @Bind()
  handleConditionSaveData(params = {}) {
    const { conditionTableData, currentRecord, conExpression } = params;
    const newconditionTableData = conditionTableData.map((i, index) => {
      return {
        ...i,
        conCode: index + 1,
      };
    });
    // 配置的条件
    const lines = JSON.stringify(newconditionTableData);
    currentRecord.set('lines', lines);
    currentRecord.set('conExpression', conExpression);
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { currentRecord } = this.props;
    const { modelSettingId, modelSettingLineId, tenantId } = currentRecord.get([
      'modelSettingId',
      'modelSettingLineId',
      'tenantId',
    ]);
    const currentRow = this.fieldPropertyDS.current || {};
    currentRow.set({
      modelSettingId,
      modelSettingLineId,
      tenantId,
    });
  }

  /**
   * 新建条件配置
   */
  @Bind()
  handleConditionAdd(conditionDs) {
    const { currentRecord } = this.props;
    const { modelSettingId, modelSettingLineId, tenantId } = currentRecord.get([
      'modelSettingId',
      'modelSettingLineId',
      'tenantId',
    ]);
    const currentRow = conditionDs.current || {};
    currentRow.set({
      modelSettingId,
      modelSettingLineId,
      tenantId,
    });
  }

  /**
   * 处理取消
   */
  @Bind()
  handleCancel() {
    this.fieldPropertyDS.reset();
  }

  /**
   * 处理保存
   */
  @Bind()
  async handleSave() {
    const modalCloseFlag = false;
    if (this.fieldPropertyDS.dirty) {
      const validateFlag = await this.fieldPropertyDS.validate();
      if (validateFlag) {
        const fieldPropertyData = this.fieldPropertyDS.toJSONData() || [];
        const payload = fieldPropertyData.map((n) => {
          const { lines, ...others } = n;
          let newLines = [];
          if (lines && typeof lines === 'string') {
            // 修改过条件配置
            const parseLines = JSON.parse(lines);
            if (parseLines && Array.isArray(parseLines) && parseLines.length !== 0) {
              newLines = parseLines;
            }
          } else {
            // 未修改条件配置
            newLines = lines || [];
          }
          return {
            ...others,
            lines: newLines,
          };
        });
        // 保存
        saveFieldPropertys(payload).then((res) => {
          if (getResponse(res)) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            this.fieldPropertyDS.query();
          }
        });
        return modalCloseFlag;
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
        });
        return false;
      }
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('sslm.common.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
      });
      return false;
    }
  }

  render() {
    const buttons = [
      ['add', { afterClick: () => this.handleAdd() }],
      ['delete', { color: 'red' }],
    ];
    return (
      <React.Fragment>
        <Table dataSet={this.fieldPropertyDS} columns={this.getColumns()} buttons={buttons} />
      </React.Fragment>
    );
  }
}
