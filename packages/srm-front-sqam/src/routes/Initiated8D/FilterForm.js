import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import CacheComponent from 'components/CacheComponent';
import { getDateFormat, filterNullValueObject } from 'utils/utils';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import moment from 'moment';
import ValueList from 'components/ValueList';
import './index.less';

const prefix = `sqam.common.model.qualityRectification`;

@CacheComponent({ cacheKey: '/sqam/initiated8D' })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      dateFormat: getDateFormat(),
      expandForm: false,
    };
  }

  componentDidMount() {
    const { routerParams, form } = this.props;
    if (routerParams && Object.keys(filterNullValueObject(routerParams)).length > 0) {
      if (form) {
        form.registerField('extSupplierId');
        form.registerField('supplierId');
        form.registerField('supplierCompanyId');
        form.setFieldsValue(routerParams);
      }
    }
  }

  /**
   * 表单查询
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
      tenantId,
      issueType,
      status,
      urgency,
      rectifyTypeCode,
      significance,
      problemSource,
      customizeFilterForm,
      validateType,
      routerParams,
    } = this.props;
    const { dateFormat, expandForm } = this.state;
    const { getFieldDecorator, registerField, setFieldsValue, getFieldValue } = form;
    return customizeFilterForm(
      { code: 'SQAM.INITIATED_8D_LIST.FILTER', form, expand: expandForm },
      <Form
        layout="inline"
        className={`more-fields-search-form ${expandForm ? 'show-search-form' : ''}`}
      >
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.code`).d('整改报告编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('problemNum', {
                    rules: [
                      {
                        max: 20,
                        message: intl.get('hzero.common.validation.max', {
                          max: 20,
                        }),
                      },
                    ],
                  })(<Input trim typeCase="upper" inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`entity.supplier.tag`).d('供应商')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'supplierNum',
                    {}
                  )(
                    <Lov
                      code="SQAM.CLAIM_SEARCH_SUPPLIER"
                      queryParams={{ tenantId }}
                      textField="erpSupplierName"
                      onChange={(val, record) => {
                        registerField('extSupplierId');
                        registerField('supplierCompanyId');
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId: record.supplierId,
                          extSupplierId: record.supplierId,
                          supplierCompanyId: record.supplierCompanyId,
                          erpSupplierName: record.erpSupplierName
                            ? record.erpSupplierName
                            : record.supplierCompanyName,
                        });
                      }}
                      textValue={routerParams?.supplierCompanyName || getFieldValue('supplierNum')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
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
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
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
                        .filter(
                          (item) =>
                            !['CANCEL FINISH APPROVAL REJECT', 'PUBULISH APPROVAE REJECT'].includes(
                              item.value
                            )
                        )
                        .map((item) => (
                          <Select.Option key={item.value}>{item.meaning}</Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('entity.company.tag').d('公司')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'companyId',
                    {}
                  )(
                    <Lov
                      code="HPFM.COMPANY"
                      textValue={routerParams?.companyName}
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('entity.organization.class.inventory').d('库存组织')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'invOrganizationId',
                    {}
                  )(
                    <Lov
                      code="SQAM.INVORGNIZATION"
                      queryParams={{ companyId: getFieldValue('companyId') }}
                      disabled={getFieldValue('companyId') === undefined}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
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
              <Col span={8}>
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
              <Col span={8}>
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
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sqam.common.model.8d.project`).d('项目编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('projectNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
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
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.title`).d('整改报告标题')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('problemTitle', {
                    rules: [
                      {
                        max: 80,
                        message: intl.get('hzero.common.validation.max', {
                          max: 80,
                        }),
                      },
                    ],
                  })(<Input trim />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('entity.roles.creator').d('创建人')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('createdName', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('createTimeAfter')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('createTimeBefore') &&
                        moment(getFieldValue('createTimeBefore')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('createTimeBefore')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('createTimeAfter') &&
                        moment(getFieldValue('createTimeAfter')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.publishedName`).d('发布人')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('publishedName', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.sourceNum`).d('来源单据编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('inspectionNum', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.`).d('整改单类型')}
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
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sqam.common.model.8d.claimFormNum').d('关联索赔单号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('claimFormNum', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sqam.common.model.publishDateFrom').d('发布日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('publishedTimeAfter')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('publishedTimeBefore') &&
                        moment(getFieldValue('publishedTimeBefore')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sqam.common.model.publishDateTo').d('发布日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('publishedTimeBefore')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('publishedTimeAfter') &&
                        moment(getFieldValue('publishedTimeAfter')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'flex' : 'none', flexWrap: 'wrap' }}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sqam.common.model.qualityRectification.validationResults`)
                    .d('验证结果')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator(
                    'validateResultFlag',
                    {}
                  )(
                    <Select allowClear>
                      {validateType.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sqam.common.model.common.icaDelayFlag`).d('ICA超期')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('icaDelayFlag')(
                    <ValueList lovCode="HPFM.FLAG" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sqam.common.model.common.pcaDelayFlag`).d('PCA超期')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('pcaDelayFlag')(
                    <ValueList lovCode="HPFM.FLAG" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'flex' : 'none', flexWrap: 'wrap' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sqam.common.model.common.erpProblemNum`).d('外部系统单据编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('erpProblemNum', {})(<Input />)}
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
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
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
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
