/**
 * shoppingBasket - 购物篮管理 -form
 * @date: 2019年11月05日
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, DatePicker, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/custom-bar' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    display: false,
  };

  /**
   * 表单重置
   */
  @Bind()
  onReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 更多查询条件
   */
  @Bind()
  handleMoreQuery() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      // basketStatus,
    } = this.props;
    const { display } = this.state;

    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('scec.shopBasket.model.shoppingBasket.basketName')
                      .d('购物篮名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('basketName', {
                      rules: [
                        {
                          max: 120,
                          message: intl.get('hzero.common.validation.max', {
                            max: 120,
                          }),
                        },
                      ],
                    })(<Input dbc2sbc={false} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('scec.shopBasket.model.shoppingBasket.startDate').d('开始时间')}
                    {...formLayout}
                  >
                    {getFieldDecorator('startDate')(
                      <DatePicker
                        // showTime
                        // format={getDateTimeFormat()}
                        placeholder={null}
                        disabledDate={currentDate =>
                          getFieldValue('endDate') &&
                          moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('scec.shopBasket.model.shoppingBasket.endDate').d('截止时间')}
                    {...formLayout}
                  >
                    {getFieldDecorator('endDate')(
                      <DatePicker
                        placeholder={null}
                        disabledDate={currentDate =>
                          getFieldValue('startDate') &&
                          moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: display ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
                    {getFieldDecorator('enabledFlag')(
                      <Select allowClear>
                        <Select.Option value={1} key={1}>
                          {intl.get('hzero.common.status.enable').d('启用')}
                        </Select.Option>
                        <Select.Option value={0} key={0}>
                          {intl.get('hzero.common.status.disable').d('禁用')}
                        </Select.Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button
                  style={{ marginRight: 8, display: display ? 'none' : 'inline-block' }}
                  onClick={this.handleMoreQuery}
                >
                  {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
                <Button
                  style={{ marginRight: 8, display: display ? 'inline-block' : 'none' }}
                  onClick={this.handleMoreQuery}
                >
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
                <Button data-code="reset" onClick={this.onReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.props.onFetchData}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
