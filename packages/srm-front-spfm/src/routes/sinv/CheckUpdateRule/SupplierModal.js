import React, { Component } from 'react';
import { Modal, Form, Table, Input, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { Bind } from 'lodash-decorators';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class OrderConfig extends Component {
  componentDidMount() {
    const { onSearch } = this.props;
    onSearch();
  }

  /**
   * 查询供应商详情新增
   * @param {Object} page - 分页信息
   */
  @Bind()
  handSupplierDetailSearch(page = {}) {
    const { dispatch, form = {} } = this.props;
    const values = filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'acceptanceSheet/querySupplierDetail',
      payload: {
        dimensionCode: 'SUPPLIER',
        page,
        ...values,
      },
    });
  }

  render() {
    const {
      visible,
      pagination,
      loading,
      onSearch,
      form,
      supplierDetailList,
      hideModal,
      rowSelection,
      saveSupplier,
    } = this.props;
    const { getFieldDecorator } = form;
    const supplierColumns = [
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        width: 300,
        dataIndex: 'supplierNum',
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierName',
      },
    ];
    return (
      <Modal
        title={intl.get(`sinv.CheckUpdateRule.view.message.supplirTitle`).d('供应商')}
        width={1000}
        visible={visible}
        destroyOnClose
        onClose={hideModal}
        onOk={() => saveSupplier()}
        onCancel={hideModal}
      >
        {/* <Content style={{ paddingLeft: 0, paddingRight: 0 }}> */}
        <div className="table-list-search">
          <Form layout="inline" style={{ marginBottom: 16 }}>
            <FormItem label={intl.get('entity.supplier.code').d('供应商编码')}>
              {getFieldDecorator('supplierNum')(<Input style={{ width: 150 }} />)}
            </FormItem>
            <FormItem label={intl.get('entity.supplier.name').d('供应商名称')}>
              {getFieldDecorator('supplierName')(<Input style={{ width: 150 }} />)}
            </FormItem>
            <FormItem>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => this.handSupplierDetailSearch()}
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
            rowKey="supplierCompanyId"
            dataSource={supplierDetailList}
            rowSelection={rowSelection}
            pagination={pagination}
            onChange={onSearch}
            columns={supplierColumns}
          />
        </div>
        {/* </Content> */}
      </Modal>
    );
  }
}
