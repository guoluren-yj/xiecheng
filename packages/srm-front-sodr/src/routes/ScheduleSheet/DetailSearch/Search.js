import React, { Component } from 'react';
import { Form, Button, Input, DatePicker, Col, Row, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import Lov from 'components/Lov';
import LovModal from '@/routes/components/MultipleLov';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
// @withCustomize({
//   unitCode: ['SODR.PLAN_SHEET_UPDATE.QUERY_FORM'],
// })
@cacheComponent({ cacheKey: '/sodr/plan-sheet/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
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
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const {
      form,
      customizeFilterForm,
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
      remote,
    } = this.props;
    const { expandForm, tenantId } = this.state;
    const { planStatus = [] } = enumMap;
    const paramsOuId = getFieldValue('ouId') ? { ouId: getFieldValue('ouId') } : {};
    return customizeFilterForm(
      {
        code: 'SODR.PLAN_SHEET_UPDATE.QUERY_FORM',
        form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.code`).d('物料编码')}>
                  {getFieldDecorator('itemCodes')(
                    <LovModal code="SODR.PO_ITEM" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.orderMaintain.sourceFrom.categoryName`).d('物料分类')}
                >
                  {getFieldDecorator('categoryId')(
                    <Lov
                      code="SSRC.QUOTATION_TPL.ITEM_CAT"
                      textValue="categoryName"
                      queryParams={{ tenantId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('tempKey')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      textField="displaySupplierName"
                      onChange={(value, record) => {
                        const { registerField, setFieldsValue } = form;
                        const { supplierId, supplierCompanyId } = record;
                        registerField('supplierId');
                        registerField('supplierCompanyId');
                        setFieldsValue({ supplierId, supplierCompanyId });
                      }}
                      queryParams={{
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.poNum`).d('订单号')}
                >
                  {getFieldDecorator('poNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sodr.common.model.common.status`).d('状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('planStatus')(
                    <Select allowClear>
                      {planStatus.map((n) => {
                        if (n.value !== 'MODIFY' && n.value !== 'NEW') {
                          return (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          );
                        }
                        return false;
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sodr.common.model.common.status`).d('状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('queryPlanStatusList')(
                    <Select allowClear mode="multiple">
                      {planStatus.map((n) => {
                        if (n.value !== 'MODIFY' && n.value !== 'NEW') {
                          return (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          );
                        }
                        return false;
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.agentId`).d('采购员')}
                >
                  {getFieldDecorator('agentId')(
                    <Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      queryParams={{ tenantId }}
                      textValue="companyName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov code="SPFM.USER_AUTH.INVORG" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.inventoryName`).d('库房')}
                >
                  {getFieldDecorator('inventoryId')(
                    <Lov
                      code="SODR.INVENTORY"
                      queryParams={{ ...paramsOuId, tenantId }}
                      textField="inventoryName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.needByDateStart`).d('需求日期从')}
                >
                  {getFieldDecorator('needByDateStart', {
                    initialValue: remote
                      ? remote.process('SODR_SCHEDULES_SHEET_LIST_PROCESS_SEARCH_DATE_FROM', null)
                      : null,
                  })(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateEnd') &&
                        moment(getFieldValue('needByDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.needByDateEnd`).d('需求日期至')}
                >
                  {getFieldDecorator('needByDateEnd', {
                    initialValue: remote
                      ? remote.process('SODR_SCHEDULES_SHEET_LIST_PROCESS_SEARCH_DATE_TO', null)
                      : null,
                  })(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateStart') &&
                        moment(getFieldValue('needByDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.displayPoLineNum`).d('订单行号')}
                >
                  {getFieldDecorator('lineNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sodr.common.model.common.creationDateStarts`).d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateEnd') &&
                        moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sodr.common.model.common.creationDateEnds').d('创建日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateStart') &&
                        moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.lastUpdateDateStart`).d('需求日期从')}
                >
                  {getFieldDecorator('lastUpdateDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('lastUpdateDateEnd') &&
                        moment(getFieldValue('lastUpdateDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.lastUpdateDateEnd`).d('需求日期至')}
                >
                  {getFieldDecorator('lastUpdateDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('lastUpdateDateStart') &&
                        moment(getFieldValue('lastUpdateDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              {remote
                ? remote.render('SODR_SCHEDULES_SHEET_LIST_RENDER_FORM', null, {
                    form,
                    context: this,
                  })
                : null}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
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

  render() {
    return this.renderForm();
  }
}
