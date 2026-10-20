import React, { PureComponent } from 'react';
import {
  Form,
  TextField,
  Button,
  Row,
  Col,
  Lov,
  Select,
  DataSet,
  Table,
  Modal,
} from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { differenceWith, isEqual, uniqWith, isEmpty, intersectionWith } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  saveCondition,
  deleteCondition,
  fetchLovConfig,
  saveAppoint,
  fetchAppointCheckedData,
} from '@/services/priceLibDimensionService';
import { lovConfigDS, selectConfigDS } from './lineDS';

import style from './../../index.less';

const { Column } = Table;
const modalKey = Modal.key();
let _modal;

@observer
export default class ConditionConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      appointCheckedData: [], // 目标值已勾选值
    };
  }

  lovConfigDs = new DataSet(lovConfigDS());

  selectConfigDs = new DataSet(selectConfigDS());

  componentDidMount() {
    this.props.conditionDs.addEventListener('load', this.handleConditionLoad);

    // 增加选中记录的事件监听
    this.lovConfigDs.addEventListener('select', this.handleSelect);
    // 增加撤销选择记录的事件监听
    this.lovConfigDs.addEventListener('unSelect', this.handleUnSelect);
    // 增加全选记录的事件监听
    this.lovConfigDs.addEventListener('selectAll', this.handleSelectAll);
    // 增加撤销全选记录的事件监听
    this.lovConfigDs.addEventListener('unSelectAll', this.handleUnSelectAll);
    // 增加数据加载完后监听
    this.lovConfigDs.addEventListener('load', this.handleLoad);

    this.selectConfigDs.addEventListener('select', this.handleSelect);
    this.selectConfigDs.addEventListener('unSelect', this.handleUnSelect);
    this.selectConfigDs.addEventListener('selectAll', this.handleSelectAll);
    this.selectConfigDs.addEventListener('unSelectAll', this.handleUnSelectAll);
    this.selectConfigDs.addEventListener('load', this.handleLoad);
  }

  // 选中数据
  @Bind()
  handleSelect({ record }) {
    this.setState({
      appointCheckedData: [...this.state.appointCheckedData, record.toData()],
    });
  }

  // 取消选择数据
  @Bind()
  handleUnSelect({ record }) {
    const { appointCheckedData = [] } = this.state;
    let newData = [];
    // 数据库已存在的数据，取消选择
    if (record.toData().ruleLnDataId) {
      newData = appointCheckedData.filter(
        (item) => item.ruleLnDataId !== record.toData().ruleLnDataId
      );
    } else {
      // appointCheckedData临时数据，取消选择
      newData = differenceWith(appointCheckedData, [record.toData()], isEqual);
    }
    this.setState({
      appointCheckedData: newData,
    });
  }

  // 全选
  @Bind()
  handleSelectAll({ dataSet }) {
    // 去除数据库中已存在的数据
    const data = dataSet
      .filter((record) => !record.toData().ruleLnDataId)
      .map((record) => record.toData());
    // 去除重复数据
    const newData = uniqWith([...this.state.appointCheckedData, ...data], isEqual);
    this.setState({
      appointCheckedData: newData,
    });
  }

  // 撤销全选
  @Bind()
  handleUnSelectAll({ dataSet }) {
    const { appointCheckedData = [] } = this.state;
    let newData = appointCheckedData;
    dataSet.forEach((record) => {
      if (record.toData().ruleLnDataId) {
        newData = newData.filter((item) => item.ruleLnDataId !== record.toData().ruleLnDataId);
      } else {
        newData = differenceWith(newData, [record.toData()], isEqual);
      }
    });
    this.setState({
      appointCheckedData: newData,
    });
  }

  /**
   * 数据加载完后事件
   */
  @Bind()
  handleLoad({ dataSet }) {
    const { appointCheckedData = [] } = this.state;
    const realData = [];
    // 已勾选的真实数据
    appointCheckedData.forEach((item) => {
      if (item.ruleLnDataId) {
        realData.push(item.ruleLnDataId);
      }
    });
    dataSet.forEach((record) => {
      if (realData.includes(record.data.ruleLnDataId)) {
        Object.assign(record, { isSelected: true });
      } else if (!isEmpty(intersectionWith(appointCheckedData, [record.toData()], isEqual))) {
        Object.assign(record, { isSelected: true });
      }
    });
  }

  /**
   * 条件加载完后事件
   */
  @Bind()
  handleConditionLoad() {
    this.props.modal.update();
  }

  /**
   * 指定范围 - 选择目标字段值 - LOV
   */
  @Bind()
  async handleClickAppointLov(record) {
    const item = record.toData();
    const params = { dimensionCode: item.dimensionCode, ruleLineId: item.ruleLineId };
    const { fetchConditionData, conditionDs, conditionParams = {} } = this.props;

    // 打开弹框
    _modal = Modal.open({
      key: modalKey,
      title: item.dimensionName,
      style: {
        width: 680,
      },
      children: <Table dataSet={this.lovConfigDs} columns={[]} queryFieldsLimit={2} />,
      onOk: () => {},
      onCancel: () => true,
      afterClose: () => {
        this.lovConfigDs.loadData([]);
      },
    });

    // 查询头
    const res = getResponse(await fetchLovConfig({ viewCode: item.sourceCode }));
    if (res && !res.failed) {
      const queryFromDs = new DataSet();
      const columns = [];
      res.tableFields.forEach((n) => {
        this.lovConfigDs.addField(n.dataIndex, {
          name: n.dataIndex,
          label: n.title,
        });
        columns.push({
          name: n.dataIndex,
          label: n.title,
          width: n.width,
        });
      });
      res.queryFields.forEach((n) => {
        queryFromDs.addField(n.field, {
          name: n.field,
          label: n.label,
        });
      });
      Object.assign(this.lovConfigDs, { queryDataSet: queryFromDs });

      // 查询所有已数据，为了做跨页勾选
      const appointCheckedData = getResponse(await fetchAppointCheckedData(params));
      if (appointCheckedData && !appointCheckedData.failed) {
        this.setState(
          {
            appointCheckedData,
          },
          () => {
            // 查询行
            this.lovConfigDs.setQueryParameter('params', params);
            this.lovConfigDs.query();

            _modal.update({
              children: <Table dataSet={this.lovConfigDs} columns={columns} queryFieldsLimit={2} />,
              onOk: async () => {
                const saveRes = getResponse(
                  await saveAppoint({
                    data: this.state.appointCheckedData,
                    ruleLineId: item.ruleLineId,
                  })
                );
                if (saveRes && !saveRes.failed) {
                  notification.success();
                  fetchConditionData(conditionDs, conditionParams);
                  return true;
                } else {
                  return false;
                }
              },
            });
          }
        );
      }
    }
  }

  /**
   * 指定范围 - 选择目标字段值 - 下拉框
   */
  @Bind()
  async handleClickAppointSelect(record) {
    const item = record.toData();

    const params = { dimensionCode: item.dimensionCode, ruleLineId: item.ruleLineId };

    const { fetchConditionData, conditionDs, conditionParams = {} } = this.props;

    // 查询所有已数据，为了做跨页勾选
    const appointCheckedData = getResponse(await fetchAppointCheckedData(params));
    if (appointCheckedData && !appointCheckedData.failed) {
      this.setState(
        {
          appointCheckedData,
        },
        () => {
          this.selectConfigDs.setQueryParameter('params', params);
          this.selectConfigDs.query();

          // 打开弹框
          Modal.open({
            key: modalKey,
            title: item.dimensionName,
            style: {
              width: 680,
            },
            children: (
              <Table mode="tree" dataSet={this.selectConfigDs} queryFieldsLimit={2}>
                <Column name="dataName" />
                <Column name="dataCode" />
              </Table>
            ),
            onOk: async () => {
              const saveRes = getResponse(
                await saveAppoint({
                  data: this.state.appointCheckedData,
                  ruleLineId: item.ruleLineId,
                })
              );
              if (saveRes && !saveRes.failed) {
                notification.success();
                fetchConditionData(conditionDs, conditionParams);
                return true;
              } else {
                return false;
              }
            },
            onCancel: () => true,
            afterClose: () => {
              this.selectConfigDs.loadData([]);
            },
          });
        }
      );
    }
  }

  /**
   * 新增-条件
   */
  @Bind()
  handleAddCondition() {
    this.props.conditionDs.create({}, 0);
    // this.props.modal.update();
  }

  /**
   * 删除-条件
   */
  @Bind()
  async handleDeleteCondition(record) {
    const { conditionDs, conditionParams = {}, fetchConditionData, modal } = this.props;
    if (record.data.ruleLineId) {
      const res = getResponse(await deleteCondition([record.toData()]));
      if (res && !res.failed) {
        notification.success();
        fetchConditionData(conditionDs, conditionParams);
      }
    } else {
      conditionDs.remove(record);
      notification.success();
      modal.update();
    }
  }

  /**
   * 保存-条件
   */
  @Bind()
  async handleSaveCondition() {
    const { conditionDs, conditionParams = {}, fetchConditionData } = this.props;
    const flag = await conditionDs.validate();
    if (flag) {
      const params = conditionDs.map((item) => ({
        ...item.toData(),
        ...conditionParams,
      }));
      const res = getResponse(await saveCondition(params));
      if (res && !res.failed) {
        fetchConditionData(conditionDs, conditionParams);
      }
    }
  }

  /**
   * 筛选运算符
   * 目标维度类型为下拉框或lov，可以选择表达式包含于不包含
   * 目标维度类型为其他，可以选择等于不等于
   */
  @Bind()
  ruleExpressionOptionsFilter(option, record) {
    if (record.get('dimensionCodeLOV')) {
      if (
        record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
        record.get('dimensionCodeLOV').fieldWidget === 'SELECT'
      ) {
        return option.get('value') !== 'EQUAL' && option.get('value') !== 'NOT_EQUAL';
      } else {
        return option.get('value') !== 'BE_CONTAIN' && option.get('value') !== 'NOT_CONTAIN';
      }
    } else {
      return option.get('value');
    }
  }

  /**
   * 筛选匹配类型
   * 目标价格维度类型为下拉框或lov，若运算符是等于不等于，只能是指定值；若运算符是包含于不包含，匹配类型是当前价格维度或指定范围
   */
  @Bind()
  appointTypeOptionsFilter(option, record) {
    if (record.get('dimensionCodeLOV')) {
      if (
        record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
        record.get('dimensionCodeLOV').fieldWidget === 'SELECT'
      ) {
        return option.get('value') === 'SCOPE';
      } else if (
        record.get('dimensionCodeLOV').fieldWidget !== 'LOV' &&
        record.get('dimensionCodeLOV').fieldWidget !== 'SELECT'
      ) {
        return option.get('value') === 'VALUE';
      }
    } else {
      return option.get('value') !== 'CURRENT_DIMENSION';
    }
  }

  /**
   * 渲染指定值
   */
  @Bind()
  renderAppointValue(record) {
    if (
      record.get('dimensionCodeLOV') &&
      record.get('dimensionCodeLOV').fieldWidget === 'LOV' &&
      record.get('ruleExpression') !== 'IS_NULL' &&
      record.get('ruleExpression') !== 'NOT_NULL' &&
      record.get('appointType') === 'SCOPE'
    ) {
      return <Lov record={record} name="appointValueLov" />;
    } else if (
      record.get('dimensionCodeLOV') &&
      record.get('dimensionCodeLOV').fieldWidget === 'SELECT' &&
      record.get('ruleExpression') !== 'IS_NULL' &&
      record.get('ruleExpression') !== 'NOT_NULL' &&
      record.get('appointType') === 'SCOPE'
    ) {
      return <Select record={record} name="appointValue" />;
    } else {
      return <TextField record={record} name="appointValue" />;
    }
  }

  render() {
    const { conditionDs, filterDs, enabledEdit } = this.props;

    return (
      <React.Fragment>
        <div className={style['condition-config-layout']}>
          <div className={style['condition-config-title']}>
            {intl.get('ssrc.priceLibDimension.view.message.analyzingConditions').d('判断条件')}
          </div>
          <div className={style['condition-config-button']}>
            {enabledEdit && (
              <>
                <Button
                  icon="playlist_add"
                  key="add"
                  color="primary"
                  funcType="flat"
                  onClick={() => this.handleAddCondition()}
                >
                  {intl.get('ssrc.priceLibDimension.view.message.addCondition').d('添加条件')}
                </Button>
                {/* <Button
                  icon="save"
                  key="save"
                  color="primary"
                  funcType="flat"
                  onClick={() => this.handleSaveCondition()}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button> */}
              </>
            )}
          </div>
        </div>
        <div style={{ minHeight: '150px' }}>
          {conditionDs.map((record, index) => {
            return (
              <Row type="flex" style={{ marginLeft: '-4px' }}>
                <Col span={1} style={{ height: '39px', lineHeight: '39px', textAlign: 'center' }}>
                  {index + 1}
                </Col>
                <Col span={21} className={style['form-field-wrapper']}>
                  <Form
                    labelLayout="placeholder"
                    columns={4}
                    record={record}
                    disabled={!enabledEdit}
                  >
                    <Lov name="dimensionCodeLOV" clearButton={false} />
                    <Select
                      name="ruleExpression"
                      clearButton={false}
                      optionsFilter={(option) => this.ruleExpressionOptionsFilter(option, record)}
                      onChange={() => this.props.modal.update()}
                    />
                    {record.get('ruleExpression') === 'IS_NULL' ||
                    record.get('ruleExpression') === 'NOT_NULL'
                      ? []
                      : [
                        <Select
                          name="appointType"
                          clearButton={false}
                          optionsFilter={(option) =>
                              this.appointTypeOptionsFilter(option, record)
                            }
                          onChange={() => this.props.modal.update()}
                        />,
                          this.renderAppointValue(record),
                        ]}
                  </Form>
                </Col>
                <Col span={2} style={{ height: '39px', lineHeight: '39px', textAlign: 'center' }}>
                  {enabledEdit && (
                    <Popconfirm
                      title={intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？')}
                      onConfirm={() => this.handleDeleteCondition(record)}
                      okText={intl.get('hzero.common.button.ok').d('确定')}
                      cancelText={intl.get('hzero.common.button.cancel').d('取消')}
                    >
                      <Button
                        color="red"
                        icon="delete"
                        funcType="flat"
                        style={{ marginLeft: '8px' }}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </Button>
                    </Popconfirm>
                  )}
                </Col>
              </Row>
            );
          })}
        </div>
        <div className={style['condition-config-layout']}>
          <div className={style['condition-config-title']}>
            {intl.get('ssrc.priceLibDimension.view.message.filterLogic').d('筛选逻辑')}
          </div>
        </div>
        <div style={{ minHeight: '100px', marginLeft: '12px' }}>
          <TextField
            dataSet={filterDs}
            name="combExpression"
            help={intl
              .get('ssrc.priceLibDimension.view.placeholder.combExpression')
              .d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3')}
            style={{ width: '99%', lineHeight: '39px' }}
            disabled={!enabledEdit}
          />
        </div>
      </React.Fragment>
    );
  }
}
