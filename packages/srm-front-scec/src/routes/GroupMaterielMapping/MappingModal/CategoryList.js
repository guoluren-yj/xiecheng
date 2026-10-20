/**
 * CategoryList 品类列表
 * @date: 2020-2-11
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Button, Input, Table } from 'hzero-ui';

import intl from 'utils/intl';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class CategoryList extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const {
      onSave,
      loading,
      onSearch,
      dataSource,
      selectedRow,
      rowSelectChange,
      beforeRowSelectChange,
      form: { getFieldDecorator },
    } = this.props;
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: selectedRow.map(n => n.categoryId),
      onChange: (_, rows) => beforeRowSelectChange(rows),
    };
    const tableProps = {
      columns: [
        {
          title: intl.get('scec.common.model.categoryCode').d('品类编码'),
          width: 210,
          dataIndex: 'categoryCode',
        },
        {
          title: intl.get('scec.common.model.categoryName').d('品类名称'),
          width: 210,
          dataIndex: 'categoryName',
        },
      ],
      loading,
      dataSource,
      rowSelection,
      bordered: true,
      pagination: false,
      rowKey: 'categoryId',
      onRow: record => ({
        onClick: () => beforeRowSelectChange([record]),
        onDoubleClick: () =>
          rowSelectChange(undefined, () => {
            onSave(record);
          }),
      }),
    };
    return (
      <>
        <Row gutter={12}>
          <Col span={8}>
            <FormItem
              label={intl.get('scec.common.model.categoryCode').d('品类编码')}
              {...formLayout}
            >
              {getFieldDecorator('categoryCode')(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('scec.common.model.categoryName').d('品类名称')}
              {...formLayout}
            >
              {getFieldDecorator('categoryName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={8} className="search-btn-more">
            <FormItem>
              <Button onClick={() => this.props.form.resetFields()}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={onSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Table {...tableProps} />
      </>
    );
  }
}
