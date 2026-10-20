/**
 * ReviewForm - 评审澄清函维护
 * @date: 2019-8-15
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import moment from 'moment';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { getDateFormat } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import { Form, Row, Col, Input, Button, DatePicker, Select } from 'hzero-ui';

const FormItem = Form.Item;
const promptCode = 'ssrc.supplierBid';
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/supplier-bid-hall/quedddstion-list/view-form' })
export default class ReviewForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  /**
   * 更多查询
   */
  @Bind()
  handleToggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleQuery() {
    const { onSearch } = this.props;
    onSearch();
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      code,
    } = this.props;
    const { expand } = this.state;
    const dateFormat = getDateFormat();
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const replayStatus =
      code.replayStatus && code.replayStatus.filter(item => item.value !== 'NEW');
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.clarifyNotifyNum`)
                    .d('澄清通知编号')}
                >
                  {getFieldDecorator('clarifyNotifyNum')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.supplierBid.replyStatus`).d('回复状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('replyStatus')(
                    <Select>
                      {replayStatus &&
                        replayStatus.map(item => (
                          <Option key={item.meaning} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.supplierBid.clarifyNotifyTitle`).d('标题')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('clarifyNotifyTitle')(<Input maxLength={40} />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.submittedDateFrom`)
                    .d('提交日期从')}
                >
                  {getFieldDecorator('submittedDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('submittedDateTo') &&
                        moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'time')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.submittedDateTo`)
                    .d('提交日期至')}
                >
                  {getFieldDecorator('submittedDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('submittedDateFrom') &&
                        moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'time')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.replyEndDateFrom`)
                    .d('回复截止日期从')}
                >
                  {getFieldDecorator('replyEndDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('replyEndDateTo') &&
                        moment(getFieldValue('replyEndDateTo')).isBefore(currentDate, 'time')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.replyEndDateTo`)
                    .d('回复截止日期至')}
                >
                  {getFieldDecorator('replyEndDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('replyEndDateFrom') &&
                        moment(getFieldValue('replyEndDateFrom')).isAfter(currentDate, 'time')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleToggle}>
                {expand
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleQuery}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
