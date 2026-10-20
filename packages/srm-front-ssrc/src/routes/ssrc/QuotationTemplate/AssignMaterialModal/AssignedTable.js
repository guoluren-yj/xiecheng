/**
 * AssignedTable - 已分配Table
 * @date: 2019-08-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Table, Form, Row, Col, Input, Button } from 'hzero-ui';

import intl from 'utils/intl';

const promptCode = 'ssrc.quotationTemplate';

@Form.create({ fieldNameProp: null })
export default class AssignedTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // 选中项的key
    };
    this.props.onRef(this);
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleAssignedSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
    const father = this.props.getFather();

    father.setState({
      disabledLeft: !selectedRowKeys.length > 0,
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const {
      onSearch,
      form: { validateFields },
    } = this.props;
    validateFields(err => {
      if (!err) {
        onSearch();
      }
    });
  }

  render() {
    const {
      onChange,
      currentRow,
      form: { getFieldDecorator },
      assignedMaterialList,
      assignedMaterialPagination,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleAssignedSelectChange,
      getCheckboxProps: record => ({
        disabled: record && currentRow.templateStatus === 'RELEASED',
      }),
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.material.code`).d('物料编码'),
        dataIndex: 'itemCategoryCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.material.name`).d('物料名称'),
        dataIndex: 'itemCategoryName',
        width: 200,
      },
    ];
    return (
      <Fragment>
        <Form>
          <Row gutter={24} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Col span={9}>{intl.get(`${promptCode}.model.material.code`).d('物料编码')}:</Col>
                <Col span={15}>
                  {getFieldDecorator('itemCategoryCode')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Col span={9}>{intl.get(`${promptCode}.model.material.name`).d('物料名称')}:</Col>
                <Col span={15}>{getFieldDecorator('itemCategoryName')(<Input />)}</Col>
              </Row>
            </Col>
            <Col span={8}>
              <Button data-code="reset" onClick={this.handleReset} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
        </Form>
        <Table
          bordered
          columns={columns}
          onChange={onChange}
          rowKey="dimensionId"
          rowSelection={rowSelection}
          dataSource={assignedMaterialList}
          pagination={assignedMaterialPagination}
        />
      </Fragment>
    );
  }
}
