import React, { Component } from 'react';
import { Form, Button, Row, Col, Input, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import Lov from 'components/Lov';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sinv/acceptance-sheet-create/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = { isRowCollapsed: false, organizationId: getCurrentOrganizationId() };
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          onSearch(values);
        }
      });
    }
  }

  /**
   * toggleForm - 查询条件展开/收起
   */
  @Bind()
  toggleForm() {
    const { isRowCollapsed } = this.state;
    this.setState({
      isRowCollapsed: !isRowCollapsed,
    });
  }

  /**
   * 改变供应商Lov
   * @param {Number} rowKey
   */
  @Bind()
  onChangeSupplierId(rowKey, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue } = form;
    const { supplierId, supplierCompanyId } = record || {};
    registerField('supplierId');
    registerField('supplierCompanyId');
    setFieldsValue({ supplierId, supplierCompanyId });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      orderSource,
      statusCode,
    } = this.props;
    const { isRowCollapsed, organizationId } = this.state;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.acceptListNum`).d('验收单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acceptListNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.companyId`).d('公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      allowClear
                      code="SPFM.USER_AUTH.COMPANY"
                      textField="companyName"
                      queryParams={{ organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.supplier`).d('供应商')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('tempkeys')(
                    <Lov
                      allowClear
                      code="SPRM.SUPPLIER"
                      queryParams={{ tenantId: organizationId }}
                      onChange={this.onChangeSupplierId}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            {isRowCollapsed && (
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`sinv.acceptanceSheetCreate.model.acceptListType`)
                      .d('验收类型')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('acceptListTypeId')(
                      <Lov
                        code="SPUC.ACCEPT_TYPE"
                        // textValue={headerInfo.acceptListTypeName}
                        // textField="acceptListTypeName"
                        queryParams={{ tenantId: organizationId }}
                        lovOptions={{
                          valueField: 'acceptListTypeId',
                          displayField: 'acceptListTypeName',
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`sinv.acceptanceSheetCreate.model.sourceCode`)
                      .d('验收单据来源')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('sourceCode')(
                      <Select style={{ width: '100%' }} allowClear>
                        {orderSource.map((n) => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.checkMan`).d('验收人')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('acceptorName')(
                      <Lov
                        allowClear
                        code="SPUC.ACCEPT_USER"
                        queryParams={{ tenantId: organizationId }}
                        lovOptions={{
                          valueField: 'userId',
                          displayField: 'userName',
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {isRowCollapsed && (
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sinv.acceptanceSheetCreate.model.checkDateForm`)
                      .d('验收日期从')}
                  >
                    {getFieldDecorator('acceptDateStart')(
                      <DatePicker
                        format={getDateFormat()}
                        style={{ width: '100%' }}
                        placeholder={null}
                        disabledDate={(currentDate) =>
                          getFieldValue('acceptDateEnd') &&
                          moment(getFieldValue('acceptDateEnd')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.checkDateTo`).d('验收日期至')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('acceptDateEnd')(
                      <DatePicker
                        format={getDateFormat()}
                        style={{ width: '100%' }}
                        placeholder={null}
                        disabledDate={(currentDate) =>
                          getFieldValue('acceptDateStart') &&
                          moment(getFieldValue('acceptDateStart')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.title`).d('验收单标题')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('title')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.status`).d('状态')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('acStatusCode')(
                      <Select style={{ width: '100%' }} allowClear>
                        {statusCode
                          .filter((item) => ['PENDING', 'REJECTED'].includes(item.value))
                          .map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                {/* <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sinv.acceptance.view.message.acceptanceSourceId`)
                      .d('来源单据编号')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('acceptSourceNum')(
                      <Input disabled={getFieldValue('sourceCode') === 'NONE'} />
                    )}
                  </Form.Item>
                </Col> */}
              </Row>
            )}
          </Col>

          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {isRowCollapsed
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
