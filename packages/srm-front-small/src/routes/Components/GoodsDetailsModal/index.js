/**
 * GoodsDetailsModal 商品详情弹框
 * @date: 2019-12-11
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, Table, Form, Button, Input, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class GoodsDetailsModal extends Component {
  /**
   * 查询商品列表
   * @param {object} page  分页信息
   */
  @Bind()
  fetchList(page = {}) {
    const { form, onFetch } = this.props;
    const params = form ? form.getFieldsValue() : {};
    onFetch(page, params);
  }

  /**
   * 重置
   */
  @Bind()
  reset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      visible,
      loading,
      onCancel,
      totalCount = 0,
      dataSource,
      pagination,
      categoryInfo = {},
      form: { getFieldDecorator },
    } = this.props;
    const { code, name = '' } = categoryInfo;
    const columns = [
      {
        title: intl.get('small.common.model.productNum').d('商品编码'),
        dataIndex: 'productCode',
        width: 140,
      },
      {
        title: intl.get('small.common.model.productName').d('商品名称'),
        dataIndex: 'productName',
        width: 260,
      },
    ];
    const tableProps = {
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: 'productId',
      onChange: this.fetchList,
      loading,
    };
    return (
      <Modal
        destroyOnClose
        title={intl
          .get('small.common.model.currentCatalog.TotalProduct', {
            value1: `${code}-${name}`,
            value2: totalCount,
          })
          .d(`当前分类：${code}-${name}下共有${totalCount}件商品`)}
        visible={visible}
        onCancel={() => onCancel()}
        footer={null}
        width={705}
      >
        <Form layout="inline" className="fields-form">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                label={intl.get(`small.common.model.productNum`).d('商品编码')}
                {...formLayout}
              >
                {getFieldDecorator('productCode')(
                  <Input trim typeCase="upper" inputChinese={false} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('small.common.model.productName').d('商品名称')}
                {...formLayout}
              >
                {getFieldDecorator('productName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.reset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={this.fetchList}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table className="small-table-all-space" {...tableProps} />
      </Modal>
    );
  }
}
