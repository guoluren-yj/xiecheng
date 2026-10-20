/**
 * AddDataModal - 增加数据弹框
 * @date: 2018-12-8
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal, Table, Button, List, Icon, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import ValueList from 'components/ValueList';

import { uniqBy } from 'lodash';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const ListItem = List.Item;

@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { selectDate } = this.props;
    this.state = {
      addRows: selectDate,
      expandForm: false,
    };
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { addData } = this.props;
    const { addRows } = this.state;
    if (addData) {
      addData(addRows);
    }
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { onHideAddModal } = this.props;
    if (onHideAddModal) {
      onHideAddModal(false);
    }
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    const {
      fetchModalData,
      form: { getFieldsValue },
    } = this.props;
    const filterValues = getFieldsValue();
    if (fetchModalData) {
      fetchModalData({
        page: pagination,
        ...filterValues,
      });
    }
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(selectedKeys, selectedRow) {
    const { addRows } = this.state;
    const { rowKey } = this.props;
    const newAddRows = addRows.filter((ele) => selectedKeys.includes(ele[rowKey]));
    this.setState({ addRows: uniqBy(newAddRows.concat(selectedRow), rowKey) });
  }

  @Bind()
  handleCurrentRowSelect(current) {
    const { addRows } = this.state;
    const { rowKey } = this.props;
    if (addRows.some((ele) => ele[rowKey] === current[rowKey])) {
      const updateRows = addRows.filter((ele) => ele[rowKey] !== current[rowKey]);
      this.setState({ addRows: updateRows });
    } else {
      this.setState({ addRows: [...addRows, current] });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询方法
   */
  @Bind()
  queryValue() {
    const { form, fetchModalData } = this.props;
    if (fetchModalData) {
      fetchModalData(form.getFieldsValue() || {});
    }
  }

  @Bind()
  renderForm() {
    const { queryCode, queryName, queryCodeDesc, queryNameDesc, queryCodeObj } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { expandForm } = this.state;
    const [
      value1 = { label: queryCodeDesc, name: queryCode, type: 'input' },
      value2 = { label: queryNameDesc, name: queryName, type: 'input' },
      ...others
    ] = queryCodeObj || [];

    return (
      <Form layout="inline">
        <Row gutter={20}>
          <Col span={15}>
            <Row gutter={24}>
              <Col span={12} style={{ padding: 0 }}>
                <FormItem label={value1?.label}>
                  {getFieldDecorator(`${value1?.name}`)(
                    value1?.type === 'input' ? <Input /> : <ValueList {...value1} />
                  )}
                </FormItem>
              </Col>
              <Col span={12} style={{ padding: 0 }}>
                <FormItem label={value2?.label}>
                  {getFieldDecorator(`${value2?.name}`)(
                    value2?.type === 'input' ? <Input /> : <ValueList {...value1} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24} style={{ display: expandForm ? 'block' : 'none' }}>
              {others.map((e) => {
                return (
                  <Col span={12} style={{ padding: 0 }}>
                    <FormItem label={e?.label}>
                      {getFieldDecorator(`${e?.name}`)(
                        e?.type === 'input' ? <Input /> : <ValueList {...e} />
                      )}
                    </FormItem>
                  </Col>
                );
              })}
            </Row>
          </Col>
          <Col span={9} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm && queryCodeObj && queryCodeObj?.length > 2
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.queryValue}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  renderItem(item) {
    const { queryName } = this.props;
    return (
      <ListItem
        style={{
          display: 'inline-block',
          border: 'none',
          padding: 0,
          marginLeft: '10px',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
          }}
        >
          {item[queryName]}
          <Icon
            type="close-circle"
            theme="filled"
            style={{ marginLeft: '3px' }}
            onClick={() => this.handleCurrentRowSelect(item)}
          />
        </span>
      </ListItem>
    );
  }

  render() {
    const {
      title,
      modalVisible,
      loading,
      confirmLoading,
      rowKey,
      columns = [],
      dataSource = [],
      pagination = {},
      remote,
    } = this.props;
    const { handleCuxRowSelection, handleCuxCurrentRowSelect } = remote?.props?.process || {};
    const { addRows } = this.state;
    const that = this;
    const rowSelection =
      typeof handleCuxRowSelection === 'function'
        ? handleCuxRowSelection({ that })
        : {
            onChange: this.onSelectChange,
            selectedRowKeys: addRows.map((n) => n[rowKey]),
          };
    return (
      <Modal
        destroyOnClose
        confirmLoading={confirmLoading}
        title={title}
        visible={modalVisible}
        onOk={this.okHandle}
        width={800}
        onCancel={this.cancelHandle}
      >
        <div className="table-list-search">{this.renderForm()}</div>
        <p style={{ minHeight: '20px', margin: 0, padding: 0, display: 'flex' }}>
          <span style={{ height: '20px', padding: 0, width: '50px', flexShrink: 0 }}>
            {intl.get('hzero.common.button.selected').d('已选择')}:
          </span>
          {addRows.length > 0 && (
            <List
              dataSource={addRows}
              renderItem={(item) => this.renderItem(item)}
              style={{ padding: 0 }}
            />
          )}
        </p>
        <Table
          bordered
          rowKey={rowKey}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          loading={loading}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.handleTableChange}
          onRow={(record) => ({
            onClick: () =>
              typeof handleCuxCurrentRowSelect === 'function'
                ? handleCuxCurrentRowSelect({ that, current: record })
                : this.handleCurrentRowSelect(record),
          })}
        />
      </Modal>
    );
  }
}
