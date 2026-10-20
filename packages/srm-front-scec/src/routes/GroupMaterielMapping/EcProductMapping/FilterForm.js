/**
 * FilterForm -查询表单
 * @date: 2020-2-11
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Button, Input, Select } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: false,
    };
  }

  /**
   * 展开收起
   */
  @Bind()
  expandSearch() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * 查询
   */
  @Bind()
  fetchData() {
    const { form, onSearch } = this.props;
    form.validateFieldsAndScroll(err => {
      if (!err) {
        onSearch();
      }
    });
  }

  /**
   * 查询
   */
  @Bind()
  handleLov(value) {
    if (!value) this.props.form.setFieldsValue({ ecCategoryId: null });
  }

  /**
   * 表单重置
   */
  @Bind()
  reset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { display } = this.state;
    const {
      mapStatusList = [],
      productSourceList = [],
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get('scec.groupMaterielMapping.model.ecPlatformCode').d('商品来源')}
                  {...formLayout}
                >
                  {getFieldDecorator('ecPlatformCode', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('scec.common.model.ecPlatformCode').d('商品来源'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear onChange={this.handleLov}>
                      {productSourceList.map(item => (
                        <Select.Option key={item.ecPlatformCode} value={item.ecPlatformCode}>
                          {item.ecPlatformName}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('scec.common.model.ecCategoryName').d('商品分类')}
                  {...formLayout}
                >
                  {getFieldDecorator('ecCategoryId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('scec.common.model.ecCategoryName').d('商品分类'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      disabled={!getFieldValue('ecPlatformCode')}
                      code="SCEC.QUERY_THIRD_CATEGORY"
                      queryParams={{ ecPlatform: getFieldValue('ecPlatformCode') }}
                    />
                  )}
                </FormItem>
              </Col>

              <Col span={8}>
                <FormItem
                  label={intl.get('scec.common.model.ecProductName').d('商品')}
                  {...formLayout}
                >
                  {getFieldDecorator('ecProductName', {
                    rules: [
                      {
                        max: 50,
                        message: intl.get('hzero.common.validation.max', {
                          max: 50,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem label={intl.get('scec.common.model.itemName').d('物料')} {...formLayout}>
                  {getFieldDecorator('itemName', {
                    rules: [
                      {
                        max: 50,
                        message: intl.get('hzero.common.validation.max', {
                          max: 50,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('scec.common.model.categoryName').d('品类')}
                  {...formLayout}
                >
                  {getFieldDecorator('categoryName', {
                    rules: [
                      {
                        max: 50,
                        message: intl.get('hzero.common.validation.max', {
                          max: 50,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('scec.common.model.mappingStatus').d('映射状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('mappingStatus')(
                    <Select allowClear>
                      {mapStatusList.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                style={{ display: display ? 'none' : 'inline-block' }}
                onClick={this.expandSearch}
              >
                {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button
                onClick={this.expandSearch}
                style={{ display: display ? 'inline-block' : 'none' }}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.reset}>{intl.get('scec.common.button.reset').d('重置')}</Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchData}>
                {intl.get('scec.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
