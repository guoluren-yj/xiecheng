import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Button, Select, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { getDateFormat } from 'utils/utils';
import { dateRangeTransform } from '@/utils/utils';

const { Option } = Select;
const promptCode = 'sqam.quoteIncomingInspection.model.quoteIncomingInspection';

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

  @Bind()
  handleDateRangeChange(value, fieldName) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const [creationDateFrom, creationDateTo] = dateRangeTransform(value);
    const mapFieldsValue = { creationDateFrom, creationDateTo };
    if (fieldName) return mapFieldsValue[fieldName];
    setFieldsValue(mapFieldsValue);
  }

  @Bind()
  handleTrxDateRangeChange(value, fieldName) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const [trxDateStart, trxDateEnd] = dateRangeTransform(value);
    const mapFieldsValue = { trxDateStart, trxDateEnd };
    if (fieldName) return mapFieldsValue[fieldName];
    setFieldsValue(mapFieldsValue);
  }

  render() {
    const { expandForm, dateFormat } = this.state;
    const {
      loading,
      tenantId,
      onSearch,
      decisionResult = [],
      form,
      form: { getFieldDecorator, getFieldValue, registerField, setFieldsValue },
      isSelectTx,
      trxLoading,
      backFlag,
      customizeFilterForm,
      dateRangeList = [],
      flagList = [],
    } = this.props;
    const defaultDateRange = getFieldValue('dateRange');
    const defaultTrxDateRangeType = getFieldValue('trxDateRangeType');
    return !isSelectTx
      ? customizeFilterForm(
          {
            code: 'SQAM.CREATE_8D_LIST.QUOTE_FILTER',
            form,
            expand: expandForm,
          },
          <Form className="more-fields-search-form">
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_4_LAYOUT}>
                <Row {...SEARCH_FORM_ROW_LAYOUT}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${promptCode}.inspectionNum`).d('检验单号')}
                    >
                      {getFieldDecorator('inspectionNum')(
                        <Input trim typeCase="upper" inputChinese={false} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                    >
                      {getFieldDecorator('supplierCompanyId')(
                        <Lov
                          code="SQAM.CLAIM_SEARCH_SUPPLIER"
                          textField="erpSupplierName"
                          queryParams={{ tenantId }}
                          onChange={(val, record) => {
                            registerField('supplierId');
                            registerField('supplierCompanyIdStash');
                            setFieldsValue({
                              supplierId: record.supplierId,
                              supplierCompanyIdStash: record.supplierCompanyId,
                              erpSupplierName: record.erpSupplierName
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
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.item.tag`).d('物料')}
                    >
                      {getFieldDecorator('itemCode')(
                        <Lov
                          code="SQAM.ITEM"
                          queryParams={{ tenantId }}
                          lovOptions={{ valueField: 'itemCode', displayField: 'itemName' }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
                  {!Number(backFlag) && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...SEARCH_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('sqam.common.model.common.createDateRange')
                          .d('创建日期范围')}
                      >
                        {getFieldDecorator('dateRange', {
                          initialValue: isEmpty(dateRangeList) ? undefined : 'RECENT HALF YEAR', // 显示优化
                        })(
                          <Select
                            allowClear
                            onChange={(value) => this.handleDateRangeChange(value)}
                          >
                            {dateRangeList.map((item) => (
                              <Option value={item.value} key={item.value}>
                                {item.meaning}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  {!Number(backFlag) && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...SEARCH_FORM_ITEM_LAYOUT}
                        label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                      >
                        {getFieldDecorator('creationDateFrom', {
                          initialValue: this.handleDateRangeChange(
                            defaultDateRange,
                            'creationDateFrom'
                          ),
                        })(
                          <DatePicker
                            format={dateFormat}
                            placeholder=""
                            disabled={![undefined, 'ALL TIME'].includes(defaultDateRange)}
                            disabledDate={(currentDate) =>
                              getFieldValue('creationDateTo') &&
                              moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  {!Number(backFlag) && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...SEARCH_FORM_ITEM_LAYOUT}
                        label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                      >
                        {getFieldDecorator('creationDateTo', {
                          initialValue: this.handleDateRangeChange(
                            defaultDateRange,
                            'creationDateTo'
                          ),
                        })(
                          <DatePicker
                            format={dateFormat}
                            placeholder=""
                            disabled={![undefined, 'ALL TIME'].includes(defaultDateRange)}
                            disabledDate={(currentDate) =>
                              getFieldValue('creationDateFrom') &&
                              moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('entity.company.tag').d('公司')}
                    >
                      {getFieldDecorator('companyName', {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                    >
                      {getFieldDecorator('invOrganizationId')(
                        <Lov
                          code="HPFM.INV_ORGANIZATION"
                          queryParams={{ tenantId }}
                          lovOptions={{
                            valueField: 'organizationId',
                            displayField: 'organizationName',
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${promptCode}.decisionResult`).d('决策结果')}
                    >
                      {getFieldDecorator(
                        'decisionResult',
                        {}
                      )(
                        <Select allowClear>
                          {decisionResult.map((n) => (
                            <Select.Option key={n.value}>{n.meaning}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${promptCode}.poNum`).d('采购订单编号')}
                    >
                      {getFieldDecorator('poNum')(
                        <Input trim typeCase="upper" inputChinese={false} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${promptCode}.transactionNum`).d('事务编号')}
                    >
                      {getFieldDecorator('transactionNum')(
                        <Input trim typeCase="upper" inputChinese={false} />
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
        )
      : customizeFilterForm(
          {
            code: 'SQAM.CREATE_8D_LIST.TRX_QUOTE_FILTER',
            form,
            expand: expandForm,
          },
          <Form className="more-fields-search-form">
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_4_LAYOUT}>
                <Row {...SEARCH_FORM_ROW_LAYOUT}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`sqam.common.model.commom.trxDateRange`).d('事务日期范围')}
                    >
                      {getFieldDecorator('trxDateRangeType', {
                        initialValue: 'LAST THREE MONTHS', // 显示优化
                      })(
                        <Select
                          allowClear
                          onChange={(value) => this.handleTrxDateRangeChange(value)}
                        >
                          {dateRangeList.map((item) => (
                            <Option value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('sqam.common.model.common.trxDateFrom').d('事务日期从')}
                    >
                      {getFieldDecorator('trxDateStart', {
                        initialValue: this.handleTrxDateRangeChange(
                          defaultTrxDateRangeType,
                          'trxDateStart'
                        ),
                      })(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabled={![undefined, 'ALL TIME'].includes(defaultTrxDateRangeType)}
                          disabledDate={(currentDate) =>
                            getFieldValue('trxDateEnd') &&
                            moment(getFieldValue('trxDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('sqam.common.model.common.trxDateTo').d('事务日期至')}
                    >
                      {getFieldDecorator('trxDateEnd', {
                        initialValue: this.handleTrxDateRangeChange(
                          defaultTrxDateRangeType,
                          'trxDateEnd'
                        ),
                      })(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabled={![undefined, 'ALL TIME'].includes(defaultTrxDateRangeType)}
                          disabledDate={(currentDate) =>
                            getFieldValue('trxDateStart') &&
                            moment(getFieldValue('trxDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`sqam.common.model.commom.rectificationInitiatedFlag`)
                        .d('是否已发起整改')}
                    >
                      {getFieldDecorator('qamFlag', {
                        initialValue: '0', // 显示优化
                      })(
                        <Select allowClear>
                          {flagList.map((item) => (
                            <Option value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                    >
                      {getFieldDecorator('supplierCompanyId')(
                        <Lov
                          code="SQAM.CLAIM_SEARCH_SUPPLIER"
                          textField="erpSupplierName"
                          queryParams={{ tenantId }}
                          onChange={(val, record) => {
                            registerField('supplierId');
                            registerField('supplierCompanyIdStash');
                            setFieldsValue({
                              supplierId: record.supplierId,
                              supplierCompanyIdStash: record.supplierCompanyId,
                              erpSupplierName: record.erpSupplierName
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
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.item.tag`).d('物料')}
                    >
                      {getFieldDecorator('itemId')(
                        <Lov
                          code="SQAM.ITEM"
                          queryParams={{ tenantId }}
                          lovOptions={{ valueField: 'itemId', displayField: 'itemName' }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('entity.company.tag').d('公司')}
                    >
                      {getFieldDecorator('companyId')(
                        <Lov
                          code="SPFM.USER_AUTH.COMPANY"
                          queryParams={{ tenantId }}
                          lovOptions={{ valueField: 'companyId', displayField: 'companyName' }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                    >
                      {getFieldDecorator('invOrganizationId')(
                        <Lov
                          code="HPFM.INV_ORGANIZATION"
                          queryParams={{ tenantId }}
                          lovOptions={{
                            valueField: 'organizationId',
                            displayField: 'organizationName',
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>

                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.organization.class.rcvTrxTypeCode`).d('事务类型')}
                    >
                      {getFieldDecorator('rcvTrxTypeId')(<Lov code="SINV.RECEIVE_TRX_TYPE" />)}
                    </Form.Item>
                  </Col>

                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`entity.organization.class.sourceHeaderNum`)
                        .d('事务来源单号')}
                    >
                      {getFieldDecorator('allSource')(
                        <Input trim typeCase="upper" inputChinese={false} />
                      )}
                    </Form.Item>
                  </Col>

                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`entity.organization.class.displayTrxNum`).d('事务编号')}
                    >
                      {getFieldDecorator('displayTrxNum')(
                        <Input trim typeCase="upper" inputChinese={false} />
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
                    loading={trxLoading}
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
