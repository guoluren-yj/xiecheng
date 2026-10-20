import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty, isNil } from 'lodash';

import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import CacheComponent from 'components/CacheComponent';
import LovMulti from '@/routes/components/MultipleLov';
import { dateRangeTransform } from '@/utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'sfin.invoiceBill';

/**
 * 币种定义(租户级)表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sfin/bill-create' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      expandForm: false,
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form, dispatch } = this.props;
    if (onSearch) {
      form.validateFields((err, value) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch(value, undefined, {}, true);
          dispatch({
            type: 'bill/updateState',
            payload: { createRowKeys: [], createRows: [] },
          });
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
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  @Bind()
  handleDateRangeChange(value, fieldName) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const [trxDateFrom, trxDateTo] = dateRangeTransform(value);
    const mapFieldsValue = { trxDateFrom, trxDateTo };
    if (fieldName) return mapFieldsValue[fieldName];
    setFieldsValue(mapFieldsValue);
  }

  // 提交
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      // supplierOrganizationId,
      // flagList,
      dateRange = [],
      customizeFilterForm,
      organizationId,
      cuszDateRangeDefault,
      initLoadData,
      form: { getFieldDecorator, getFieldValue, setFieldsValue, registerField },
      form,
      // sourceCodeValue,
      businessTypeValueDefault,
      businessTypeMeaningDefault,
    } = this.props;
    const { expandForm } = this.state;
    const dateFormat = getDateFormat();
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const defaultDateRange = initLoadData ? cuszDateRangeDefault : getFieldValue('dateRange');
    return customizeFilterForm(
      {
        code: 'SFIN.CREATE_INVOICE_NOTIFICATION_LIST.FILTER',
        form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.accountSource`)
                    .d('对账数据来源')}
                >
                  {getFieldDecorator('sourceCode', {
                    initialValue: sourceCodeValue || 'RCV',
                  })(
                    <Lov
                      code="SFIN.SOURCE_CONFIG"
                      queryParams={{ tenantId: organizationId }}
                      textValue="接收事务"
                      textField="sourceName"
                    />
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType', {
                    initialValue: businessTypeValueDefault || 'STANDARD',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.invoiceBill.businessType`)
                            .d('业务类别'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SFIN.EN_BUSINESS_TYPE_CONFIG"
                      queryParams={{ tenantId: organizationId }}
                      textValue={
                        businessTypeMeaningDefault ||
                        intl.get('sfin.invoiceBill.standard').d('标准')
                      }
                      textField="businessTypeMeaning"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.poNum`).d('采购订单号')}
                >
                  {getFieldDecorator('poNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.transactionDateRange`)
                    .d('对账事务日期范围')}
                >
                  {getFieldDecorator('dateRange', {
                    initialValue: isEmpty(dateRange) ? undefined : 'RECENT HALF YEAR', // 显示优化
                  })(
                    <Select allowClear onChange={(value) => this.handleDateRangeChange(value)}>
                      {dateRange.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.trxDateFrom`).d('事务日期从')}
                >
                  {getFieldDecorator('trxDateFrom', {
                    initialValue: this.handleDateRangeChange(defaultDateRange, 'trxDateFrom'),
                  })(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabled={![undefined, 'ALL TIME'].includes(defaultDateRange)}
                      disabledDate={(currentDate) =>
                        getFieldValue('trxDateTo') &&
                        moment(getFieldValue('trxDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.toTrxDate`).d('事务日期至')}
                >
                  {/* {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      // showTime
                      format={getDateTimeFormat()}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )} */}
                  {getFieldDecorator('trxDateTo', {
                    initialValue: this.handleDateRangeChange(defaultDateRange, 'trxDateTo'),
                  })(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabled={![undefined, 'ALL TIME'].includes(defaultDateRange)}
                      disabledDate={(currentDate) =>
                        getFieldValue('trxDateFrom') &&
                        moment(getFieldValue('trxDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号')}
                >
                  {getFieldDecorator('releaseNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.deliverNum`).d('送货单号')}
                >
                  {getFieldDecorator('asnNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.material`).d('物料')}
                >
                  {getFieldDecorator('item')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.displayTrxNumber`).d('事务编号')}
                >
                  {getFieldDecorator('displayTrxNumber')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentIds')(
                    <LovMulti
                      code="SPUC.PURCHASE_AGENT_NOUSER"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName')
                    .d('采购组织')}
                >
                  {getFieldDecorator('purOrganizationIds')(
                    <LovMulti
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.supplierCompanyId`).d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.EXT_SUPPLIER"
                      textField="displaySupplierName"
                      queryParams={{ tenantId: organizationId }}
                      onChange={(_, record = {}) => {
                        setFieldsValue({ ouId: undefined });
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      onOk={(record) => {
                        const { supplierCompanyId } = record;
                        setFieldsValue({
                          supplierCompanyId: isNil(supplierCompanyId) ? '' : supplierCompanyId,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('entity.business.tag').d('业务实体')}>
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="HPFM.OU"
                      textField="ouName"
                      queryParams={{
                        organizationId: getCurrentOrganizationId(),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.needInvoiceFlag`)
                    .d('显示已移除数据')}
                >
                  {getFieldDecorator('needInvoiceFlag', {
                    initialValue: 1,
                  })(
                    <Select allowClear>
                      <Option key={0} value={0}>
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key={1} value={1}>
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.inventoryName`).d('收货库房')}
                >
                  {getFieldDecorator('inventoryId')(
                    <Lov
                      code="SODR.INVENTORY"
                      queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.displayReverseFlag`)
                    .d('显示冲销数据')}
                >
                  {getFieldDecorator('displayReverseFlag', {
                    initialValue: '1',
                  })(
                    <Select allowClear>
                      <Option key="1" value="1">
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key="0" value="0">
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.includedZeroFlag`)
                    .d('显示数量为0数据')}
                >
                  {getFieldDecorator('includedZeroFlag', {
                    initialValue: '1',
                  })(<ValueList lovCode="HPFM.FLAG" lazyLoad={false} allowClear />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.specifications`)
                    .d('规格')}
                >
                  {getFieldDecorator('specifications')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.filter.model`).d('型号')}
                >
                  {getFieldDecorator('model')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.displayTrxNumber`).d('事务编号')}
                >
                  {getFieldDecorator('displayTrxNumberRightMatch')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.poNum`).d('采购订单号')}
                >
                  {getFieldDecorator('poNumRightMatch')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.deliverNum`).d('送货单号')}
                >
                  {getFieldDecorator('asnNumRightMatch')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.material`).d('物料')}
                >
                  {getFieldDecorator('itemRightMatch')(<Input />)}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType', {
                    initialValue: businessTypeValue,
                  })(<ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} />)}
                </FormItem>
              </Col> */}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
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
  }
}
