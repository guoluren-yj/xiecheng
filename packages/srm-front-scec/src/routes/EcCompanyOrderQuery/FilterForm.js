/**
 * ecCompanyOrderQuery -订单查询 -form
 * @date: 2019-08-27
 * @author  <xia.li05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { Form, Button, Row, Col, DatePicker } from 'hzero-ui';
// import Lov from 'components/Lov';
import intl from 'utils/intl';

const modelPrompt = 'scec.ecCompanyOrderQuery.model';
const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 提交查询表单
   *
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields(err => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  /**
   * 展开收起
   */
  // @Bind()
  // toggleForm() {
  //   const { display } = this.state;
  //   this.setState({
  //     display: !display,
  //   });
  // }

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
    } = this.props;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem label={intl.get(`${modelPrompt}.startDate`).d('开始日期')} {...formLayout}>
              {getFieldDecorator('startDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.startDate`).d('开始日期'),
                    }),
                  },
                ],
              })(<DatePicker placeholder={null} />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label={intl.get(`${modelPrompt}.endDate`).d('截止日期')} {...formLayout}>
              {getFieldDecorator('endDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.endDate`).d('截止日期'),
                    }),
                  },
                ],
              })(<DatePicker placeholder={null} />)}
            </FormItem>
          </Col>
          {/* <Col span={6}>
            <FormItem label="用户名" {...formLayout}>
              {getFieldDecorator('loginName')(<Input />)}
            </FormItem>
          </Col> */}
          <Col span={6} className="search-btn-more">
            <FormItem>
              {/* <Button
                style={{ marginRight: 8, display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                更多查询
              </Button>
              <Button
                onClick={this.toggleForm}
                style={{ marginRight: 8, display: display ? 'none' : 'inline-block' }}
              >
                收起查询
              </Button> */}
              <Button onClick={this.reset} style={{ marginRight: 8 }}>
                {intl.get(`${modelPrompt}.reset`).d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get(`${modelPrompt}.search`).d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        {/* <Row gutter={12} style={{ display: display ? 'none' : 'block' }}> */}
        {/* <Col span={6}>
            <FormItem
              label='支付状态'
              {...formLayout}
            >
              {getFieldDecorator('paymentStatus')(
                <Select allowClear>
                  <Select.Option value='1'>
                    111
                  </Select.Option>
                </Select>
              )}
            </FormItem>
          </Col> */}
        {/* <Col span={6}>
            <FormItem label="收货人" {...formLayout}>
              {getFieldDecorator('receivingContactName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="商品名称" {...formLayout}>
              {getFieldDecorator('ecProductNum')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="电商平台" {...formLayout}>
              {getFieldDecorator('ecPlatformName')(
                <Lov code="SCEC.EC_PLATFORM_NAME" queryParams={{ tenantId: 0 }} />
              )}
            </FormItem>
          </Col>
        </Row> */}
      </Form>
    );
  }
}
