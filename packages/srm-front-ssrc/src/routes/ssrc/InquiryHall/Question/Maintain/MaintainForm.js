/**
 * MaintainForm - 澄清维护查询
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input, Button, DatePicker, Select } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import { getDateFormat } from 'utils/utils';

const { Option } = Select;
const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
@cacheComponent({
  cacheKey: '/ssrc/inquiry-hall/inter-question/:sourceId/:rfxNum/:rfxTitle/:companyId/:flag',
})
export default class MaintainForm extends React.Component {
  form;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
    };
  }

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  /**
   * handleToggle - 更多查询
   */
  @Bind()
  handleToggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  /**
   * handleReset - 重置
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      clarifyStatus,
      form,
      form: { getFieldDecorator, getFieldValue },
      customizeFilterForm,
      bidFlag,
    } = this.props;
    const { expand } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    const searchForm = (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.questionNo`).d('澄清单号')}
                >
                  {getFieldDecorator('clarifyNum')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('ssrc.common.company').d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTH.COMPANY" textField="companyName" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('clarifyStatus')(
                    <Select allowClear>
                      {clarifyStatus &&
                        clarifyStatus.map((item) => (
                          <Option key={item.meaning} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: !expand ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.questionReleaseDateFrom`)
                    .d('发布日期从')}
                >
                  {getFieldDecorator('submittedDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('submittedDateTo') &&
                        moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.questionReleaseDateTo`)
                    .d('发布日期至')}
                >
                  {getFieldDecorator('submittedDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('submittedDateFrom') &&
                        moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.questionUser`).d('发布人')}
                >
                  {getFieldDecorator('submittedByUserName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleToggle}>
                {!expand
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
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );

    return customizeFilterForm
      ? customizeFilterForm(
          {
            code: bidFlag
              ? 'SSRC.BID_HALL.NEW_CLARIFY.LIST_CLARIFICATION_SEARCH'
              : 'SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_CLARIFICATION_SEARCH',
            form,
            expand,
          },
          searchForm
        )
      : searchForm;
  }
}
