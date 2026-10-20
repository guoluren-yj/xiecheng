import React, { Component } from 'react';
import { Form, Input, Row, Col, Button } from 'hzero-ui';
import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
} from 'utils/constants';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';

@cacheComponent({ cacheKey: '/sqam/claimApproval/list' })
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

  /**
   * 更多查询条件显隐切换
   */
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
    const { getFieldDecorator, registerField, setFieldsValue } = form;
    return customizeFilterForm(
      {
        code: 'SQAM.CLAIM_APPROVAL_LIST.FILTER',
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
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: showMore ? 'block' : 'none' }}>
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
                  label={intl.get('sqam.common.model.appealedFlag').d('是否申诉')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('appealedFlag')(
                    <ValueList
                      style={{ width: '100' }}
                      lovCode="HPFM.FLAG"
                      lazyLoad={false}
                      allowClear
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('sqam.common.model.dealAction').d('处理动作')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('appealHandleActionCode')(
                    <ValueList
                      style={{ width: '100' }}
                      lovCode="SQAM.APPEAL_PROCESS_ACTION"
                      lazyLoad={false}
                      allowClear
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`entity.supplier.tag`).d('供应商')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('supplierId')(
                    <Lov
                      code="SQAM.CLAIM_SEARCH_SUPPLIER"
                      textField="erpSupplierName"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                      }}
                      onChange={(_, lovRecord) => {
                        registerField('supplierCompanyId');
                        setFieldsValue({
                          supplierCompanyId: lovRecord.supplierCompanyId,
                          erpSupplierName: lovRecord.erpSupplierName
                            ? lovRecord.erpSupplierName
                            : lovRecord.supplierCompanyName,
                        });
                      }}
                    />
                  )}
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
              <Button type="primary" htmlType="submit" onClick={fetchClaim}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
