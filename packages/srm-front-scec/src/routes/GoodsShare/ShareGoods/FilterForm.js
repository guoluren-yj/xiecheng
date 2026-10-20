/* eslint-disable comma-dangle */
/**
 * GoodsShare - 商品分享 -form
 * @date: 2019-10-28
 * @author ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Button, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';

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
    const { display } = this.state;
    const {
      companyId,
      form: { getFieldDecorator },
      shareGoodsList,
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
              label={intl.get('scec.common.model.common.supplier').d('供应商')}
              {...formLayout}
            >
              {getFieldDecorator('supplierId')(
                <Lov
                  code="SCEC.COMPANY_SUPPLIER"
                  queryParams={{
                    companyId,
                  }}
                  lovOptions={{ valueField: 'supplierId', displayFiled: 'supplierName' }}
                  textField="supplierName"
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
              <Button type="primary" htmlType="submit" onClick={() => shareGoodsList({}, true)}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.common.model.common.bannerStatus').d('状态')}
              {...formLayout}
            >
              {getFieldDecorator('enableFlag')(
                <Select allowClear>
                  <Option value={1}>{intl.get('hzero.common.status.enable').d('启用')}</Option>
                  <Option value={0}>{intl.get('hzero.common.status.disable').d('禁用')}</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
