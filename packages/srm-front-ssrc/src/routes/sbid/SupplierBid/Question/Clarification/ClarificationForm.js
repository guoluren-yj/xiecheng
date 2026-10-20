/**
 * ClarificationForm - 查看澄清函查询
 * @date: 2019-6-13
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import moment from 'moment';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import { Form, Row, Col, Input, Button, DatePicker } from 'hzero-ui';

const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();
const promptCode = 'ssrc.supplierBid';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/supplier-bid-hall/quedddstion-list/clarification-form' })
export default class ClarificationForm extends React.Component {
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
    } = this.props;
    const { expand } = this.state;
    const dateFormat = getDateFormat();
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.supplierBid.clarificationNo`).d('澄清单号')}
                >
                  {getFieldDecorator('clarifyNum')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('ssrc.common.company').d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="HPFM.PURCHASE_COMPANY"
                      queryParams={{
                        tenantId: organizationId,
                      }}
                      textField="companyName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.supplierBid.publisher`).d('发布人')}
                >
                  {getFieldDecorator('submittedByUserName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.supplierBid.pubDateFrom`).d('发布日期从')}
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
                  label={intl.get(`${promptCode}.model.supplierBid.pubDateEnd`).d('发布日期至')}
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
