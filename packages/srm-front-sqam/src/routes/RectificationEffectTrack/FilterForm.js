import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Button, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { isUndefined } from 'lodash';
import { getDateFormat } from 'utils/utils';
import moment from 'moment';

const prefix = `sqam.common.model.qualityRectification`;

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sqam/rectificationEffectTrack' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      dateFormat: getDateFormat(),
      expandForm: false,
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
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  render() {
    const { expandForm } = this.state;
    const {
      loading,
      onSearch,
      tenantId,
      status = [],
      rectifyTypeCode = [],
      actions = [],
      form,
      customizeFilterForm,
      issueType,
      significance,
      urgency,
      problemSource,
      form: { getFieldDecorator, registerField, setFieldsValue, getFieldValue },
    } = this.props;
    const { dateFormat } = this.state;
    return customizeFilterForm(
      { code: 'SQAM.EFFECT_TRACK_LIST.FILTER', form, expand: expandForm },
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_4_LAYOUT}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sqam.common.model.qualityRectification.code`).d('整改报告编号')}
                >
                  {getFieldDecorator('problemNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`hzero.common.status`).d('状态')}
                >
                  {getFieldDecorator(
                    'problemStatus',
                    {}
                  )(
                    <Select allowClear>
                      {status.map((n) => (
                        <Select.Option key={n.value}>{n.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`sqam.common.model.qualityRectification.validationResults`)
                    .d('验证结果')}
                >
                  {getFieldDecorator(
                    'validateResultFlag',
                    {}
                  )(
                    <Select allowClear>
                      {actions.map((n) => (
                        <Select.Option key={n.value}>{n.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sqam.common.model.qualityRectification.title`).d('整改报告标题')}
                >
                  {getFieldDecorator('problemTitle')(<Input trim />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.supplier.name`).d('供应商名称')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SQAM.CLAIM_SEARCH_SUPPLIER"
                      queryParams={{ tenantId }}
                      textField="supplierCompanyName"
                      onChange={(val, record) => {
                        registerField('extSupplierId');
                        registerField('supplierCompanyIdStash');
                        setFieldsValue({
                          extSupplierId: record.supplierId,
                          supplierCompanyIdStash: record.supplierCompanyId,
                          supplierCompanyName: record.erpSupplierName
                            ? record.erpSupplierName
                            : record.supplierCompanyName,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get('entity.company.tag').d('公司')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'companyId',
                    {}
                  )(<Lov code="HPFM.COMPANY" queryParams={{ tenantId }} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('entity.roles.creator').d('创建人')}
                >
                  {getFieldDecorator('createdName')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`sqam.common.model.qualityRectification.sourceNum`)
                    .d('来源单据编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('inspectionNum', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`hzero.common.rectifyTypeCode`).d('整改单类型')}
                >
                  {getFieldDecorator(
                    'rectifyTypeCode',
                    {}
                  )(
                    <Select allowClear>
                      {rectifyTypeCode.map((n) => (
                        <Select.Option key={n.value}>{n.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.validateDateFrom`).d('验证时间从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('validateDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('validateDateTo') &&
                        moment(getFieldValue('validateDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.validateDateTo`).d('验证时间至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('validateDateTo')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('validateDateFrom') &&
                        moment(getFieldValue('validateDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${prefix}.issue`).d('问题类型')}
                >
                  {getFieldDecorator('problemTypeCode')(
                    <Select allowClear>
                      {issueType.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
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
              <Col {...FORM_COL_3_LAYOUT}>
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
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get('entity.organization.class.inventory').d('库存组织')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov
                      code="SQAM.INVORGNIZATION"
                      queryParams={{ companyId: getFieldValue('companyId') }}
                      disabled={isUndefined(getFieldValue('companyId'))}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
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
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('entity.item.name').d('物料名称')}
                >
                  {getFieldDecorator('itemName')(<Input trim typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.dataSource`).d('创建方式')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'sourceCode',
                    {}
                  )(
                    <Select allowClear>
                      {problemSource.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={dateFormat}
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
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={onSearch}
                loading={loading}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
