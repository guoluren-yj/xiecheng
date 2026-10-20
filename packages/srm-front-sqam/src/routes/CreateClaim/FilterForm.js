import React, { Component } from 'react';
import { Form, Input, Row, Col, Button, DatePicker } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
} from 'utils/constants';
import moment from 'moment';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import cacheComponent from 'components/CacheComponent';

@withCustomize({
  unitCode: ['SQAM.CREATE_CLAIM_LIST.FILTER'],
})
@cacheComponent({ cacheKey: '/sqam/createClaim/list' })
export default class FilterForm extends Component {
  state = {
    showMore: false,
  };

  /**
   * 重置表单点击事件
   */
  @Bind()
  reset() {
    this.props.form.resetFields();
  }

  // 展示更多查询
  @Bind()
  showMore() {
    const { showMore } = this.state;
    this.setState({
      showMore: !showMore,
    });
  }

  render() {
    const { form, fetchClaim, customizeFilterForm } = this.props;
    const { showMore } = this.state;
    const { getFieldDecorator, getFieldValue, registerField, setFieldsValue } = form;
    return customizeFilterForm(
      {
        code: 'SQAM.CREATE_CLAIM_LIST.FILTER',
        form,
        expand: showMore,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sqam.common.model.claimNum`).d('索赔单号')}
                >
                  {getFieldDecorator('formNum', {
                    rules: [
                      {
                        max: 150,
                        message: intl.get('hzero.common.validation.max', {
                          max: 150,
                        }),
                      },
                    ],
                  })(<Input trim typeCase="upper" inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sqam.common.model.formTitle`).d('索赔单标题')}
                >
                  {getFieldDecorator('formTitle', {
                    rules: [
                      {
                        max: 150,
                        message: intl.get('hzero.common.validation.max', {
                          max: 150,
                        }),
                      },
                    ],
                  })(<Input trim />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.supplier.tag`).d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SQAM.CLAIM_SEARCH_SUPPLIER"
                      textField="erpSupplierName"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        companyId: getFieldValue('companyId'),
                      }}
                      onChange={(_, lovRecord) => {
                        registerField('supplierId');
                        registerField('supplierCompanyIdStash');
                        setFieldsValue({
                          supplierId: lovRecord.supplierId,
                          supplierCompanyIdStash: lovRecord.supplierCompanyId,
                          erpSupplierName: lovRecord.erpSupplierName
                            ? lovRecord.erpSupplierName
                            : lovRecord.supplierCompanyName,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}
                >
                  {getFieldDecorator('claimTypeId')(
                    <Lov
                      code="SQAM.CLAIM_TYPE"
                      lovOptions={{ valueField: 'claimTypeId', displayField: 'typeDesc' }}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: showMore ? 'block' : 'none' }}>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.business.tag`).d('业务实体')}
                >
                  {getFieldDecorator('ouId')(<Lov code="SPRM.OU" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.company.tag`).d('公司')}
                >
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTH.COMPANY" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationId')(<Lov code="SPRM.INV_ORG" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('sqam.common.date.requireFeedbackDate.to').d('要求反馈日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('feedbackDateTo')(
                    <DatePicker
                      placeholder=""
                      format={getDateFormat()}
                      disabledDate={currentDate =>
                        getFieldValue('feedbackDateFrom') &&
                        moment(getFieldValue('feedbackDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('sqam.common.date.requireFeedbackDate.from').d('要求反馈日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('feedbackDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={getDateFormat()}
                      disabledDate={currentDate =>
                        getFieldValue('feedbackDateTo') &&
                        moment(getFieldValue('feedbackDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.roles.creator`).d('创建人')}
                >
                  {getFieldDecorator('createName', {
                    rules: [
                      {
                        max: 20,
                        message: intl.get('hzero.common.validation.max', {
                          max: 20,
                        }),
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.showMore}>
                {showMore
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button onClick={fetchClaim} htmlType="submit" type="primary">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
