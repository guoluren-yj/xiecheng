/**
 *parityRule -比价规则 查询页面
 * @date: 2019-11-19
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Row, Col, Radio, Cascader } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class FilterFrom extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  queryList() {
    const {
      // onChange,
      queryParityList,
      form: { validateFields },
    } = this.props;
    validateFields((err) => {
      if (!err) {
        queryParityList();
        // onChange(1);
      }
    });
  }

  /**
   * 重置
   */
  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 权重类型选择
   */
  @Bind()
  handleChange(e) {
    const { onChange } = this.props;
    onChange(e.target.value);
  }

  render() {
    const {
      value,
      treeList,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className="table-list-search">
        <React.Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={6}>
                <Form.Item
                  label={intl.get('small.product.model.productClassify').d('商品分类')}
                  {...formlayout}
                >
                  {getFieldDecorator('categoryIds', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`small.product.model.productClassify`).d('商品分类'),
                        }),
                      },
                    ],
                  })(
                    <Cascader
                      options={treeList}
                      style={{ width: '100%' }}
                      fieldNames={{
                        label: 'categoryName',
                        value: 'categoryId',
                        children: 'children',
                      }}
                      placeholder={intl
                        .get('smpc.parityRule.view.parityRule.selectType')
                        .d('请选择分类')}
                      allowClear
                      // onChange={this.handleTypeChange}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('smpc.parityRule.model.weightType').d('权重类型')}
                  {...formlayout}
                >
                  <Radio.Group value={value} onChange={this.handleChange}>
                    <Radio value={1}>
                      {intl.get('smpc.parityRule.view.averageFactor').d('平均权重')}
                    </Radio>
                    <Radio value={0}>{intl.get('smpc.parityRule.view.custom').d('自定义')}</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button data-code="reset" onClick={this.handlerFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.queryList}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </React.Fragment>
      </div>
    );
  }
}
