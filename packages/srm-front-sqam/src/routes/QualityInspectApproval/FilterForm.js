/**
 * qualityInspectApprval - FilterForm
 * @date: 2020-8-5
 * @author JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';

const tenantId = getCurrentOrganizationId();

const commonPrompt = 'hzero.common';
const promptCode = 'sqam.incomingInspectionQuery';

@withCustomize({
  unitCode: ['SQAM.QUALITY_INSPECT_APPROVAL_LIST.FILTER'],
})
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sqam/quality-inspect-approval/list' })
export default class FilterForm extends PureComponent {
  state = {
    display: false,
  };

  componentDidMount() {
    const { bindForm, form } = this.props;
    bindForm(form);
  }

  /**
   * 收起打开
   */
  @Bind()
  toggleForm() {
    this.setState((prevState) => ({
      display: !prevState.display,
    }));
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { onSearch, form, customizeFilterForm, enumMap } = this.props;
    const { assessmentResult = [], decisionResult = [] } = enumMap;
    const { getFieldDecorator, registerField, setFieldsValue } = form;
    const { display } = this.state;
    return customizeFilterForm(
      {
        code: 'SQAM.QUALITY_INSPECT_APPROVAL_LIST.FILTER',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_4_LAYOUT}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionNum`)
                    .d('检验批号')}
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
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
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
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.model.common.sourceNum`).d('来源单据')}
                >
                  {getFieldDecorator('sourceNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: display ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.company.tag`).d('公司')}
                >
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTH.COMPANY" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationId')(<Lov code="SPFM.USER_AUTH.INVORG" />)}
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
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.common.assessmentResult`).d('评价结果')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('assessmentResult')(
                    <Select allowClear>
                      {assessmentResult.map((item) => (
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
                  label={intl.get(`${promptCode}.model.common.decisionResult`).d('决策结果')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('decisionResult')(
                    <Select allowClear mode="multiple" maxTagCount={2}>
                      {decisionResult.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get(`${commonPrompt}.button.collected`).d('收起查询')
                  : intl.get(`${commonPrompt}.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get(`${commonPrompt}.button.reset`).d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => onSearch(form)}>
                {intl.get(`${commonPrompt}.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
