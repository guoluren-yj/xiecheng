/**
 * customBar\FilterForm.js - 平台自定义栏管理-Form
 * @date: 2019年2月20日 09:03:41
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, DatePicker, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';

import CacheComponent from 'components/CacheComponent';

// const commonPrompt = 'scec.custombar';
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
    moreQuery: false,
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
    const { moreQuery } = this.state;
    this.setState({
      moreQuery: !moreQuery,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      customBarStatus,
    } = this.props;
    const { moreQuery } = this.state;

    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`scec.customBar.model.customBar.barName`).d('自定义栏名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('barName', {
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
                        // showTime
                        // format={getDateTimeFormat()}
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
              <Row style={{ display: moreQuery ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`scec.customBar.model.customBar.Catelogue.Mapping.status`)
                      .d('自定义栏状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('barStatus')(
                      <Select allowClear>
                        {customBarStatus.map(item => (
                          <Select.Option value={item.value} key={item.value}>
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
                  style={{ marginRight: 8, display: moreQuery ? 'none' : 'inline-block' }}
                  onClick={this.handleMoreQuery}
                >
                  {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
                <Button
                  style={{ marginRight: 8, display: moreQuery ? 'inline-block' : 'none' }}
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
