import React from 'react';

import {
  Form,
  Lov,
  TextField,
  Select,
  NumberField,
  Table,
  Switch,
  TextArea,
  IntlField,
  Button,
  DataSet,
  Modal,
  Output,
  Tooltip,
} from 'choerodon-ui/pro';
import { Modal as c7nModal, Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, differenceWith, isEqual, uniqWith, isEmpty, intersectionWith } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  fetchLovConfig,
  saveAppoint,
  fetchAppointCheckedData,
} from '@/services/priceLibDimensionService';
import style from './../../index.less';
import { lovConfigDS, selectConfigDS } from './lineDS';

const { Sidebar } = c7nModal;
const { TabPane } = Tabs;
const { Column } = Table;
const modalKey = Modal.key();
let _modal;

export default class Drawer extends React.Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      appointCheckedData: [], // 目标值已勾选值
    };
  }

  lovConfigDs = new DataSet(lovConfigDS());

  selectConfigDs = new DataSet(selectConfigDS());

  componentDidMount() {
    this.props.computeDrawerFormDs.addEventListener('load', this.handleLoadForm);

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
   * 表单数据加载完后事件
   */
  @Bind()
  handleLoadForm({ dataSet }) {
    dataSet.forEach((record) => {
      if (record.status === 'sync') {
        Object.assign(record, { status: 'update' });
      }
    });
    this.forceUpdate();
  }

  /**
   * 新增
   * @memberof PriceLibDimension
   */
  @Bind()
  handleAdd(ds) {
    const record = ds.create({}, 0);
    record.setState('_status', 'create');
  }

  /**
   * 编辑
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelEdit(record) {
    record.setState('_status', 'update');
  }

  /**
   * 取消
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handleCancel(record) {
    record.reset();
    record.setState('_status', '');
  }

  /**
   * 指定范围 - 选择目标字段值 - LOV
   */
  @Bind()
  async handleClickAppointLov(record) {
    const item = record.toData();
    const { computeDrawerRuleDs } = this.props;
    const params = { dimensionCode: item.dimensionCode, ruleLineId: item.ruleLineId };

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
                  computeDrawerRuleDs.query();
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
    const { computeDrawerRuleDs } = this.props;

    const params = { dimensionCode: item.dimensionCode, ruleLineId: item.ruleLineId };

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
                computeDrawerRuleDs.query();
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
   * 筛选触发计算逻辑
   */
  @Bind()
  triggerTypeOptionsFilter(record) {
    const { computeDrawerFormDs } = this.props;
    if (
      computeDrawerFormDs.current &&
      computeDrawerFormDs.current.get('dimensionCode') !== 'relevantPrice'
    ) {
      return record.get('value') !== 'LINK';
    }
    return record.get('value');
  }

  /**
   * 筛选运算符
   * 目标价格维度类型为下拉框或lov，可以选择表达式包含于不包含
   */
  @Bind()
  ruleExpressionOptionsFilter(option, record) {
    if (record.get('dimensionCodeLOV')) {
      if (
        record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
        record.get('dimensionCodeLOV').fieldWidget === 'SELECT'
      ) {
        return option.get('value');
      } else {
        return option.get('value') !== 'BE_CONTAIN' && option.get('value') !== 'NOT_CONTAIN';
      }
    } else {
      return option.get('value');
    }
  }

  /**
   * 筛选匹配类型
   * 目标价格维度类型为下拉框或lov，若运算符是等于不等于，只能是当前价格维度；若运算符是包含于不包含，匹配类型是当前价格维度或指定范围
   */
  @Bind()
  appointTypeOptionsFilter(option, record) {
    if (record.get('dimensionCodeLOV')) {
      if (
        record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
        record.get('dimensionCodeLOV').fieldWidget === 'SELECT'
      ) {
        if (
          record.get('ruleExpression') === 'EQUAL' ||
          record.get('ruleExpression') === 'NOT_EQUAL'
        ) {
          return option.get('value') === 'CURRENT_DIMENSION';
        }
        return option.get('value') !== 'VALUE';
      } else if (
        record.get('dimensionCodeLOV').fieldWidget !== 'LOV' &&
        record.get('dimensionCodeLOV').fieldWidget !== 'SELECT'
      ) {
        return option.get('value') !== 'SCOPE';
      }
    } else {
      return option.get('value');
    }
  }

  /**
   * 渲染高阶维度弹框内容
   */
  @Bind()
  renderComputeChild() {
    const {
      computeDrawerFormDs,
      computeDrawerRuleDs,
      editor = false,
      enabledEdit = false,
    } = this.props;
    const ruleListColumns = [
      {
        name: 'lineNum',
        width: 60,
      },
      {
        name: 'dimensionCodeLOV',
        width: 150,
        tooltip: 'overflow',
        editor: (record) => ['create'].includes(record.getState('_status')),
      },
      {
        name: 'ruleExpression',
        width: 120,
        editor: (record) => {
          if (['update', 'create'].includes(record.getState('_status'))) {
            return (
              <Select
                name="sourceFrom"
                optionsFilter={(option) => this.ruleExpressionOptionsFilter(option, record)}
              />
            );
          } else {
            return false;
          }
        },
      },
      {
        name: 'appointType',
        width: 150,
        editor: (record) => {
          if (['update', 'create'].includes(record.getState('_status'))) {
            return (
              <Select
                name="appointType"
                optionsFilter={(option) => this.appointTypeOptionsFilter(option, record)}
              />
            );
          } else {
            return false;
          }
        },
      },
      {
        name: 'appointValue1',
        header: intl.get('ssrc.priceLibDimension.model.dimension.appointValue').d('目标字段值'),
        width: 200,
        // tooltip: 'overflow',
        renderer: ({ record }) => {
          if (['update', 'create'].includes(record.getState('_status'))) {
            if (record.get('appointType') === 'CURRENT_DIMENSION') {
              return <Lov record={record} name="appointValueLov" style={{ width: '100%' }} />;
            } else if (
              record.get('dimensionCodeLOV') &&
              record.get('dimensionCodeLOV').fieldWidget === 'LOV' &&
              record.get('ruleExpression') !== 'IS_NULL' &&
              record.get('ruleExpression') !== 'NOT_NULL' &&
              record.get('appointType') === 'SCOPE'
            ) {
              return <Lov record={record} name="appointValueLov" style={{ width: '100%' }} />;
            } else if (
              record.get('dimensionCodeLOV') &&
              record.get('dimensionCodeLOV').fieldWidget === 'SELECT' &&
              record.get('ruleExpression') !== 'IS_NULL' &&
              record.get('ruleExpression') !== 'NOT_NULL' &&
              record.get('appointType') === 'SCOPE'
            ) {
              return <Select record={record} name="appointValue" style={{ width: '100%' }} />;
            } else {
              return <TextField record={record} name="appointValue" style={{ width: '100%' }} />;
            }
          } else if (record.get('appointType') === 'VALUE') {
            return record.get('appointValue');
          } else if (record.get('appointType') === 'SCOPE') {
            // 绕开不走appointValue的dynamicProps，保存不传appointValue
            if (record.data && record.data.fieldWidget === 'LOV') {
              return (
                <Tooltip title={<Output record={record} name="appointValueMeaning" />}>
                  <div
                    style={{
                      width: '100%',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Output record={record} name="appointValueMeaning" />
                    <Output record={record} name="appointValue" style={{ display: 'none' }} />
                  </div>
                </Tooltip>
              );
            } else if (record.data && record.data.fieldWidget === 'SELECT') {
              return (
                <Tooltip title={<Output record={record} name="appointValue" />}>
                  <Output record={record} name="appointValue" />
                </Tooltip>
              );
            }
          } else {
            return record.toData().appointValueMeaning;
          }
        },
      },
      enabledEdit && {
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        renderer: ({ record }) => {
          if (!['update', 'create'].includes(record.getState('_status'))) {
            return (
              <a onClick={() => this.handelEdit(record)}>
                {intl.get('hzero.common.button.editor').d('编辑')}
              </a>
            );
          } else if (record.getState('_status') === 'update') {
            return (
              <a onClick={() => this.handleCancel(record)}>
                {intl.get('hzero.common.view.button.cancel').d('取消')}
              </a>
            );
          }
        },
      },
    ];
    const addButtons = [
      ['delete', { color: 'red' }],
      <Button icon="playlist_add" onClick={() => this.handleAdd(computeDrawerRuleDs)} key="add">
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
    ];
    return (
      <React.Fragment>
        <Form
          dataSet={computeDrawerFormDs}
          columns={2}
          disabled={!enabledEdit}
          className={style['c7n-form-label-required']}
        >
          <TextField name="dimensionCode" disabled={!enabledEdit || editor} />
          <IntlField name="dimensionName" />
          <Select name="dimensionCategory" disabled={!enabledEdit || editor} />
          <Select name="triggerType" optionsFilter={this.triggerTypeOptionsFilter} />
          <TextField name="computeFunction" />
          <NumberField name="gridSeq" />
          <NumberField name="gridWidth" />
          <Switch name="fieldVisible" />
          <Switch name="enabledFlag" />
          <Switch name="fieldRequired" />
          <Switch name="queryFlag" />
          <IntlField type="multipleLine" name="computeLogic" colSpan={1.5} newLine resize="vertical" rows={6} />
        </Form>
        {computeDrawerFormDs.current && computeDrawerFormDs.current.get('triggerType') === 'LINK' && (
          <Tabs defaultActiveKey="relevantPrice" style={{ marginTop: '16px' }} animated={false}>
            <TabPane
              tab={intl.get('ssrc.priceLibDimension.view.tab.relevantPrice').d('相关价格匹配规则')}
              key="relevantPrice"
            >
              <Table
                // className={style['draw-table']}
                dataSet={computeDrawerRuleDs}
                columns={ruleListColumns}
                buttons={enabledEdit && addButtons}
              />
            </TabPane>
          </Tabs>
        )}
      </React.Fragment>
    );
  }

  render() {
    const { visible = false, onOk, saveLoading, enabledEdit = false, onCancel } = this.props;
    return (
      <Sidebar
        closable
        destroyOnClose
        width={850}
        title={
          enabledEdit
            ? intl.get('ssrc.priceLibDimension.view.title.dimensionConfiguration').d('维度配置')
            : intl.get('ssrc.priceLibDimension.view.title.dimensionView').d('维度查看')
        }
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={saveLoading}
        maskStyle={{ zIndex: 997 }}
        wrapClassName={style['c7n-modal-price-warp']}
      >
        {this.renderComputeChild()}
      </Sidebar>
    );
  }
}
