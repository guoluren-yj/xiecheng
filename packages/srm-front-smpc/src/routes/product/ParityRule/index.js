/**
 * parityRule -比价规则
 * @date: 2019-11-19
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Col } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';

import EditTable from 'components/EditTable';
import { Header, Content } from 'components/Page';
import FilterForm from './FilterForm';

@formatterCollections({ code: ['smpc.product', 'smpc.parityRule'] })
@connect(({ parityRule, loading }) => ({
  parityRule,
  loading: loading.effects['parityRule/fetchParityList'],
  saveLoading: loading.effects['parityRule/fetchSaveList'],
}))
@Form.create({ fieldNameProp: null })
export default class ParityRule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [], // 勾选数据
      selectedKeys: [],
      value: 1,
      floor: 1,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'parityRule/fetchTypeTree',
    });
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询列表
   * @param {object} page  查询参数
   */
  @Bind()
  queryParityList() {
    const { dispatch } = this.props;
    const { value } = this.state;
    this.form.validateFields((err, values) => {
      if (!err) {
        const { categoryIds, ...other } = values;
        const categoryId = [...(categoryIds || [])].pop();
        dispatch({
          type: 'parityRule/fetchParityList',
          payload: {
            value,
            ...other,
            categoryId,
          },
        }).then((res) => {
          if (res) {
            const { success = true, message } = res;
            if (success) {
              const {
                parityRule: {
                  ruleList,
                  ruleData: { compareType },
                },
              } = this.props;
              this.setState({
                floor: res.floor || 1,
                selectedKeys: ruleList.filter((item) => item.factor).map((item) => item.attrId),
                selectedRows: ruleList.filter((item) => item.factor),
                value: compareType ? 1 : 0,
              });
            } else {
              notification.error({ message });
            }
          }
        });
        this.setState({
          selectedKeys: [],
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveList() {
    const { selectedRows = [], floor, value } = this.state;
    const {
      dispatch,
      parityRule: { ruleData },
    } = this.props;
    const payload = {
      ...ruleData,
      compareAttrVOS: getEditTableData(selectedRows),
      tenantId: getCurrentOrganizationId(),
      compareType: value,
      floor: floor ? numberRender(floor, 2, false) : 1,
    };
    if (selectedRows.length > 0) {
      dispatch({
        type: 'parityRule/fetchSaveList',
        payload,
      }).then((res) => {
        if (res) {
          this.queryParityList();
          notification.success();
          // this.onChange(1);
        }
      });
    } else {
      notification.warning({
        message: intl.get('smpc.parityRule.view.selected.oneAttr').d('请至少选择一条属性'),
      });
    }
  }

  /**
   * 勾选框勾选数据
   * @param {object} selectedRows 勾选的当前行数据
   */
  @Bind()
  handleRowSelectChange(_, selectedRows) {
    this.setState(
      {
        selectedKeys: selectedRows.map((item) => item.attrId),
        selectedRows,
      },
      () => {
        this.changeFactor();
      }
    );
  }

  /**
   * 处理权重
   */
  @Bind()
  changeFactor() {
    const { value, selectedKeys, selectedRows } = this.state;
    if (value === 0) {
      return false;
    }
    const {
      dispatch,
      parityRule: { ruleList },
    } = this.props;
    // 处理权重
    const newList = [...ruleList.map((item) => ({ ...item, factor: 0 }))];
    newList.forEach((item, index) => {
      if (selectedKeys.includes(item.attrId)) {
        const num = numberRender(100 / selectedKeys.length, 3, false);
        newList[index].factor = Number(num.substring(0, num.lastIndexOf('.') + 3));
        if (item.attrId === selectedRows[selectedRows.length - 1].attrId) {
          const newRow = [...newList.filter((newItem) => newItem.factor > 0)];
          newList[index].factor = Number(
            numberRender(
              100 - sum(newRow.slice(0, newRow.length - 1).map((rowItem) => rowItem.factor)),
              2,
              false
            )
          );
        }
      } else {
        newList[index].factor = 0;
      }
    });
    const newSelectedRows = newList.filter((newSelectRow) =>
      selectedKeys.includes(newSelectRow.attrId)
    );
    this.setState({
      selectedRows: newSelectedRows,
    });
    newList.forEach((item, index) => {
      if (item.factor === 0) {
        newList[index].factor = '';
      }
    });
    dispatch({
      type: 'parityRule/updateState',
      payload: { ruleList: newList },
    });
  }

  /**
   *  行内编辑
   */
  @Bind()
  onChange(e) {
    this.setState(
      {
        value: e,
      },
      () => {
        if (this.state.selectedRows.length > 0) {
          this.changeFactor();
        }
      }
    );
  }

  @Bind()
  changeFloor(e) {
    const { value } = e.target;
    if ((!isNaN(value) && value > 0 && value <= 100) || value === '') {
      this.setState({
        floor: value,
      });
    }
  }

  render() {
    const { value, selectedKeys, floor } = this.state;
    const {
      loading,
      saveLoading,
      parityRule: { ruleList, treeList },
    } = this.props;
    const columns = [
      {
        title: intl.get('smpc.product.model.attribute').d('属性'),
        dataIndex: 'attrName',
      },
      {
        title: intl.get('smpc.product.model.attributeType').d('属性类型'),
        dataIndex: 'type',
        render: (text) =>
          text === 0
            ? intl.get('smpc.product.model.checkbox').d('多选')
            : text === 1
            ? intl.get('smpc.product.model.radio').d('单选')
            : intl.get('smpc.product.model.boolean').d('布尔值'),
      },
      {
        title: `${intl.get('smpc.product.model.factor').d('比价权重')}(%)`,
        dataIndex: 'factor',
        width: 200,
        render: (val, record) =>
          value === 0 && selectedKeys.includes(record.attrId) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`factor`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smpc.product.model.factor`).d('比价权重'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];

    const filterProps = {
      value,
      treeList,
      onRef: this.handleRef,
      onChange: this.onChange,
      queryParityList: this.queryParityList,
    };
    const rowSelection = {
      onChange: this.handleRowSelectChange,
      selectedRowKeys: selectedKeys,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('smpc.parityRule.view.parityRule.title').d('比价规则')}>
          <Button type="primary" loading={saveLoading} onClick={this.handleSaveList}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={() => this.queryParityList()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <EditTable
            bordered
            className="small-table-all-space"
            pagination={false}
            rowKey="attrId"
            columns={columns}
            loading={loading}
            dataSource={ruleList || []}
            rowSelection={rowSelection}
            // onChange={page => this.queryParityList(page)}
          />
          <Col span={6}>
            <Form.Item
              label={intl.get('smpc.parityRule.model.same.floor').d('相似度下限')}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
            >
              <Input suffix="%" inputChinese={false} value={floor} onChange={this.changeFloor} />
            </Form.Item>
          </Col>
        </Content>
      </React.Fragment>
    );
  }
}
