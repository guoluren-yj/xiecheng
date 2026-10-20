/**
 * EcAcquirerAddress -收单地址
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

// import Lov from 'components/Lov';
import CacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/small/ec-acquirer-address' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    // this.state = {
    //   display: false,
    // };
  }

  /**
   * 表单查询
   */
  @Bind()
  fetchEcAcquirerAddressList() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
          ...values,
        });
      }
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
    const {
      form: { getFieldDecorator },
      activeKey,
    } = this.props;

    // const { display } = this.state;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          {activeKey !== 'perAcquireAddress' && (
            <Col span={6}>
              <FormItem
                label={intl.get(`small.common.model.companyName`).d('公司名称')}
                {...formLayout}
              >
                {getFieldDecorator('companyName')(<Input />)}
              </FormItem>
            </Col>
          )}
          <Col span={6}>
            <FormItem label={intl.get(`small.common.model.contact`).d('联系人')} {...formLayout}>
              {getFieldDecorator('contactName')(<Input />)}
            </FormItem>
          </Col>
          {/* <Col span={6}>
            <FormItem
              label={intl.get('small.companyDeliveryAddress.view.stockName').d('库存组织')}
              {...formLayout}
            >
              {getFieldDecorator('invOrganizationId')(<Lov code="SPFM.USER_AUTH.INVORG" />)}
            </FormItem>
          </Col> */}
          <Col span={6} className="search-btn-more">
            <FormItem>
              {/* <Button
                style={{ marginRight: 8 }}
                onClick={() => {
                  this.setState({ display: !display });
                }}
              >
                {display
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button> */}
              <Button style={{ marginRight: 8 }} onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchEcAcquirerAddressList}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        {/* <Row gutter={12} style={{ display: display ? 'block' : 'none' }}>
          <Col span={6}>
            <FormItem label={intl.get('hzero.common.phone').d('手机')} {...formLayout}>
              {getFieldDecorator('mobile')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get(`small.ecAcquirerAddress.model.address`).d('详细地址')}
              {...formLayout}
            >
              {getFieldDecorator('fullAddress')(<Input />)}
            </FormItem>
          </Col>
        </Row> */}
      </Form>
    );
  }
}
