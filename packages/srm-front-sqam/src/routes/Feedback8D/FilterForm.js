import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, Row, Col, DatePicker, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getDateFormat, getDateTimeFormat } from 'utils/utils';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
} from 'utils/constants';

const prefix = `sqam.common.model.qualityRectification`;

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sqam/feedback8D' })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      dateFormat: getDateFormat(),
      timeFormat: getDateTimeFormat(),
      expandForm: false,
    };
  }

  /**
   * 表单查询
   * 状态(限制)：已发布、措施审核拒绝、永久措施反馈中、永久措施审核拒绝
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
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
    const {
      form,
      status,
      tenantId,
      significance,
      urgency,
      rectifyTypeCode,
      issueType,
      customizeFilterForm,
    } = this.props;
    const { dateFormat, timeFormat, expandForm } = this.state;
    const { getFieldDecorator, getFieldValue, registerField, setFieldsValue } = form;
    // const organizationId = getUserOrganizationId();
    return customizeFilterForm(
      {
        code: 'SQAM.FEEDBACK_8D_LIST.FILTER_FORM',
        form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.code`).d('整改报告编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'problemNum',
                    {}
                  )(<Input trim typeCase="upper" inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.status`).d('状态')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'problemStatus',
                    {}
                  )(
                    <Select allowClear mode="multiple">
                      {status
                        .filter((i) =>
                          ['PUBLISHED', 'ICA_REJECTED', 'PCA_FEEDBACKING', 'PCA_REJECTED'].includes(
                            i.value
                          )
                        )
                        .map((item) => (
                          <Select.Option key={item.value}>{item.meaning}</Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.clientInventory`).d('客户库存组织')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('invOrganizationName', {})(<Input trim />)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.clientCompany`).d('客户公司')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'companyId',
                    {}
                  )(<Lov code="SQAM.TENANT.CUSTOMER_COMPANIES" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('entity.item.name').d('物料名称')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('itemName', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('entity.item.code').d('物料编码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('itemCodeParam', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('entity.item.code').d('物料编码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'itemCode',
                    {}
                  )(
                    <Lov
                      code="SQAM.ITEM"
                      queryParams={{ tenantId }}
                      onChange={(val, record) => {
                        registerField('itemId');
                        setFieldsValue({ itemId: record.itemId });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.significance`).d('重视度')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'problemImportanceCode',
                    {}
                  )(
                    <Select allowClear>
                      {significance.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.urgency`).d('紧急度')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'problemUrgencyCode',
                    {}
                  )(
                    <Select allowClear>
                      {urgency.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.issue`).d('问题类型')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'problemTypeCode',
                    {}
                  )(
                    <Select allowClear>
                      {issueType.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.icaDemandDateFrom`).d('ICA要求时间从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('icaDemandDateAfter')(
                    <DatePicker
                      showTime
                      placeholder=""
                      format={timeFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('icaDemandDateBefore') &&
                        moment(getFieldValue('icaDemandDateBefore')).isBefore(currentDate, 'second')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.icaDemandDateTo`).d('ICA要求时间至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('icaDemandDateBefore')(
                    <DatePicker
                      showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                      placeholder=""
                      format={timeFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('icaDemandDateAfter') &&
                        moment(getFieldValue('icaDemandDateAfter')).isAfter(currentDate, 'second')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.pcaDemandDateFrom`).d('PCA要求日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pcaDemandDateAfter')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('pcaDemandDateBefore') &&
                        moment(getFieldValue('pcaDemandDateBefore')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.pcaDemandDateTo`).d('PCA要求日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pcaDemandDateBefore')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('pcaDemandDateAfter') &&
                        moment(getFieldValue('pcaDemandDateAfter')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={`${intl.get(`${prefix}.icaDelayDays`).d('ICA累计延期')}(≥${intl
                    .get(`hzero.common.date.unit.day`)
                    .d('天')})`}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'icaDelayDays',
                    {}
                  )(<InputNumber min={0.1} precision={1} step={0.1} allowThousandth />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={`${intl.get(`${prefix}.pcaDelayDays`).d('PCA累计延期')}(≥${intl
                    .get(`hzero.common.date.unit.day`)
                    .d('天')})`}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'pcaDelayDays',
                    {}
                  )(<InputNumber min={0} precision={0} allowThousandth />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.poNum`).d('订单编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('poNum', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`entity.roles.creator`).d('创建人')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('createdName', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.publishedName`).d('发布人')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('publishedName', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.sourceNum`).d('来源单据编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('inspectionNum', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.rectifyTypeCode`).d('整改单类型')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'rectifyTypeCode',
                    {}
                  )(
                    <Select allowClear>
                      {rectifyTypeCode.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
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
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
