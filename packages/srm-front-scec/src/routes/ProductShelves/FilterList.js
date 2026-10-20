/**
 * ProductShelves -电商商品上下架 表单Form页面
 * @date: 2019-12-25
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

const { Option } = Select;

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/goods-manage/list' })
export default class FilterList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
      tenantId: getCurrentOrganizationId(),
    };
  }

  @Bind()
  handlerSearch() {
    const { form, onFetchGoods } = this.props;
    form.validateFields(err => {
      if (!err) {
        onFetchGoods();
      }
    });
  }

  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /* 选择公司Lov
   * @param {String} val 当前值
   * @param {Object} record 选择值
   */
  @Bind()
  selectCompany() {
    this.props.form.resetFields(['supplierId']);
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { display, tenantId } = this.state;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.ecPlatFormName').d('电商名称')}
                {...formlayout}
              >
                {getFieldDecorator('ecPlatForm', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`scec.productShelves.model.productShelves.ecPlatFormName`)
                          .d('电商名称'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SCEC.EC_PLATFORM_NAME"
                    queryParams={{ tenantId }}
                    onChange={() => {
                      this.props.form.setFieldsValue({
                        ecCategoryId: undefined,
                      });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.ecCategoryName').d('电商分类')}
                {...formlayout}
              >
                {getFieldDecorator('ecCategoryId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`scec.productShelves.model.productShelves.ecCategoryName`)
                          .d('电商分类'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SCEC.QUERY_THIRD_CATEGORY"
                    queryParams={{ ecPlatform: getFieldValue('ecPlatForm') }}
                    disabled={!getFieldValue('ecPlatForm')}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.tntShelfFlag').d('是否上架')}
                {...formlayout}
              >
                {getFieldDecorator('tntShelfFlag')(
                  <Select allowClear>
                    <Option key={1}>
                      {intl.get('scec.productShelves.model.productShelves.onShelve').d('已上架')}
                    </Option>
                    <Option key={0}>
                      {intl.get('scec.productShelves.model.productShelves.noShelve').d('未上架')}
                    </Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  style={{ display: display ? 'inline-block' : 'none' }}
                  onClick={() => this.toggleForm()}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button
                  style={{ display: display ? 'none' : 'inline-block' }}
                  onClick={() => this.toggleForm()}
                >
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
                <Button data-code="reset" onClick={this.handlerFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handlerSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.ecProductNum').d('商品编码')}
                {...formlayout}
              >
                {getFieldDecorator('ecProductNum')(
                  <Input trim typeCase="upper" inputChinese={false} />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.ecProductName').d('商品名称')}
                {...formlayout}
              >
                {getFieldDecorator('ecProductName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('scec.common.model.mappingStatus').d('映射状态')}
                {...formlayout}
              >
                {getFieldDecorator('mappingStatus')(
                  <Select allowClear>
                    <Option key={1}>
                      {intl.get('scec.productShelves.model.productShelves.mapped').d('已映射')}
                    </Option>
                    <Option key={0}>
                      {intl.get('scec.productShelves.model.productShelves.mapping').d('未映射')}
                    </Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
