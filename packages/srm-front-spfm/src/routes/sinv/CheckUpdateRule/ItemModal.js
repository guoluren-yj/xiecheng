import React, { Component } from 'react';
import { Modal, Form, Table, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class OrderConfig extends Component {
  componentDidMount() {
    // this.handleSearch();
    const { onSearch } = this.props;
    onSearch();
  }

  /**
   * 查询物料新增
   * @param {Object} page - 分页信息
   */
  @Bind()
  handItemDetailSearch(page = {}) {
    const { dispatch, form = {} } = this.props;
    const values = form.getFieldsValue();
    dispatch({
      type: 'acceptanceSheet/queryItemDetail',
      payload: {
        dimensionCode: 'CATEGORY',
        page,
        ...values,
      },
    });
  }

  @Bind()
  handleFormReset() {
    const { form = {} } = this.props;
    form.resetFields();
  }

  render() {
    const {
      visible,
      pagination,
      itemDetailList,
      hideModal,
      rowSelection,
      saveItem,
      loading,
      onSearch,
      form,
    } = this.props;
    const { getFieldDecorator } = form;
    const itemCategoryColumns = [
      {
        title: intl.get('sinv.CheckUpdateRule.model.common.categoryCode').d('品类编码'),
        width: 300,
        dataIndex: 'categoryCode',
      },
      {
        title: intl.get('sinv.CheckUpdateRule.model.common.categoryName').d('品类名称'),
        dataIndex: 'categoryName',
      },
    ];
    return (
      <Modal
        title={intl.get(`sinv.CheckUpdateRule.view.message.itemTitle`).d('物料品类')}
        width={1000}
        visible={visible}
        destroyOnClose
        onClose={hideModal}
        onOk={() => saveItem()}
        onCancel={hideModal}
      >
        {/* <Content style={{ paddingLeft: 0, paddingRight: 0 }}> */}
        <div className="table-list-search">
          <Form layout="inline" style={{ marginBottom: 16 }}>
            <FormItem
              label={intl.get('sinv.CheckUpdateRule.model.common.categoryCode').d('品类编码')}
            >
              {getFieldDecorator('categoryCode')(<Input style={{ width: 150 }} />)}
            </FormItem>
            <FormItem
              label={intl.get('sinv.CheckUpdateRule.model.common.categoryName').d('品类名称')}
            >
              {getFieldDecorator('categoryName')(<Input style={{ width: 150 }} />)}
            </FormItem>
            <FormItem>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => this.handItemDetailSearch()}
                type="primary"
                htmlType="submit"
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Form>
          <Table
            bordered
            loading={loading}
            rowKey="categoryId"
            dataSource={itemDetailList}
            rowSelection={rowSelection}
            pagination={pagination}
            onChange={onSearch}
            columns={itemCategoryColumns}
          />
        </div>
        {/* </Content> */}
      </Modal>
    );
  }
}
