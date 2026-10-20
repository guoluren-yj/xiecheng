/**
 * LineCreation - 预付款
 * @date: 2020-03-18
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, DatePicker, Row, Col } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject, getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { SEARCH_FORM_ROW_LAYOUT, SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const commonPrompt = 'sfin.advancePaymentRecord.model.common';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      // organizationId: getUserOrganizationId(),
      tenantId: getCurrentOrganizationId(),
    };
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const {
      fetchDetailList = e => e,
      form: { getFieldsValue = e => e },
      pagination = { pageSize: 10, current: 1 },
    } = this.props;
    const data = filterNullValueObject(getFieldsValue()) || {};
    fetchDetailList({
      ...data,
      size: pagination.pageSize,
      page: pagination.current - 1,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const { form = {} } = this.props;
    const { expandForm, tenantId } = this.state;
    const { getFieldDecorator = e => e, getFieldValue } = form;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={17}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.displayNums`).d('采购协议编号')}
                >
                  {getFieldDecorator('displayNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.pcName`).d('采购协议名称')}
                >
                  {getFieldDecorator('pcName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.pcTypeName`).d('协议类型')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pcTypeName')(
                    <Lov code="SPCM.PC_TYPE" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.creationDateStart`).d('创建日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateEnd') &&
                        moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.creationDateEnd`).d('创建日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateEnd')(
                    <DatePicker
                      placeholder={null}
                      format={getDateFormat()}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateStart') &&
                        moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.confirmedDateStart`).d('生效日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('publishDateStart')(
                    <DatePicker
                      placeholder={null}
                      format={getDateFormat()}
                      disabledDate={currentDate =>
                        getFieldValue('publishDateEnd') &&
                        moment(getFieldValue('publishDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.confirmedDateEnd`).d('生效日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('publishDateEnd')(
                    <DatePicker
                      placeholder={null}
                      format={getDateFormat()}
                      disabledDate={currentDate =>
                        getFieldValue('publishDateStart') &&
                        moment(getFieldValue('publishDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={7} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
