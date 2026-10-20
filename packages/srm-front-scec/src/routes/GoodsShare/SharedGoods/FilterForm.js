/* eslint-disable comma-dangle */
/**
 * GoodsShare - 商品分享 -form
 * @date: 2019-10-28
 * @author ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Button, Input, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';

import { getCurrentOrganizationId } from 'utils/utils';
import CacheComponent from 'components/CacheComponent';

const { Option } = Select;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/ec-category-company-catalog/list1' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * 展开收起
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
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
    const { display, tenantId } = this.state;
    const {
      companyId,
      form: { getFieldDecorator },
      sharedGoodsList,
      status,
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.common.model.common.productNum').d('商品编码')}
              {...formLayout}
            >
              {getFieldDecorator('productNum')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.common.model.common.productName').d('商品名称')}
              {...formLayout}
            >
              {getFieldDecorator('productName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.goodsShare.model.goodsShare.sourceCompany').d('来源公司')}
              {...formLayout}
            >
              {getFieldDecorator('sourceName')(
                <Lov
                  code="HPFM.COMPANY"
                  queryParams={{ tenantId }}
                  lovOptions={{ valueField: 'companyName', displayFiled: 'companyName' }}
                  textField="sourceName"
                />
              )}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                style={{ display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button
                onClick={this.toggleForm}
                style={{ display: display ? 'none' : 'inline-block' }}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={sharedGoodsList}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.goodsShare.view.message.productStatus').d('商品状态')}
              {...formLayout}
            >
              {getFieldDecorator('productStatus')(
                <Select allowClear>
                  {status.map(item => {
                    return (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.goodsShare.model.goodsShare.shareFlag').d('分享状态')}
              {...formLayout}
            >
              {getFieldDecorator('enableFlag')(
                <Select allowClear>
                  <Option value={1}>{intl.get('hzero.common.status.available').d('可用')}</Option>
                  <Option value={0}>
                    {intl.get('hzero.common.status.unavailable').d('不可用')}
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.common.model.common.supplier').d('供应商')}
              {...formLayout}
            >
              {getFieldDecorator('supplierName')(
                <Lov
                  code="SCEC.COMPANY_SUPPLIER"
                  queryParams={{
                    companyId,
                  }}
                  lovOptions={{ valueField: 'supplierName', displayFiled: 'supplierName' }}
                  textField="supplierName"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.goodsShare.model.goodsShare.receiveTime').d('接收时间')}
              {...formLayout}
            >
              {getFieldDecorator('creationDate')(<DatePicker placeholder="" />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
