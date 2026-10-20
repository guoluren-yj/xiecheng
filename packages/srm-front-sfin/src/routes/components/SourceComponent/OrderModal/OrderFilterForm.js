import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import { getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class SourceFilterForm extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }
  /**
   * render
   * @returns React.element
   */

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.displayPoNum`).d('订单编号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.sheet.releasedDateFrom`).d('发布日期从')}
                >
                  {getFieldDecorator('releasedDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('releasedDateTo') &&
                        moment(getFieldValue('releasedDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.sheet.releasedDateTo`).d('发布日期至')}
                >
                  {getFieldDecorator('releasedDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('releasedDateFrom') &&
                        moment(getFieldValue('releasedDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => this.handleSearch()}
                type="primary"
                htmlType="submit"
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
