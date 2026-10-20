import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import { isUndefined } from 'lodash';
import moment from 'moment';
import ValueList from 'components/ValueList';
import { getCurrentOrganizationId } from 'utils/utils';
import { SEARCH_FORM_ITEM_LAYOUT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, onSearch, enumMap = {}, customizeFilterForm } = this.props;
    const { expandForm, tenantId } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const { status = [] } = enumMap;
    return customizeFilterForm(
      {
        code: 'SPFM.PORTAL.NOTICESIGN.PUBLISH.LIST.FILTER',
        form: this.props.form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spfm.common.model.noticeCode`).d('通知单编号')}
                >
                  {getFieldDecorator('notificationNum', {})(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spfm.common.model.noticeTitle`).d('通知单标题')}
                >
                  {getFieldDecorator('notificationTitle', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`hzero.common.status`).d('状态')}
                >
                  {getFieldDecorator('notificationStatus')(
                    <Select allowClear>
                      {status
                        .filter((item) => ['NOT_RECEIVE', 'ALL_RECEIVE'].includes(item.value))
                        .map((n) => (
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spfm.common.model.noticeType`).d('通知单类型')}
                >
                  {getFieldDecorator('notificationType')(
                    <ValueList allowClear lovCode="SNTM.NOTIFICATION_TYPE" lazyLoad={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.customer.tag`).d('客户')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov code="HPFM.PURCHASE_COMPANY" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.roles.creator`).d('创建人')}
                >
                  {getFieldDecorator('realName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      showTime
                      placeholder=""
                      format={DEFAULT_DATETIME_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      showTime
                      format={DEFAULT_DATETIME_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get(`hzero.common.button.reset`).d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={onSearch}>
                {intl.get(`hzero.common.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
