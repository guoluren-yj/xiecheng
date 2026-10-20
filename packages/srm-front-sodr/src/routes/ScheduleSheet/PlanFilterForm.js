import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { isNil } from 'lodash';

import Lov from 'components/Lov';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import { SRM_SPUC } from '_utils/config';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class PlanFilterForm extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * 查询
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
    const { customizeFilterForm, form } = this.props;
    const { getFieldDecorator, getFieldsValue, getFieldValue } = form;
    const { tenantId } = this.state;
    const queryParams = form ? filterNullValueObject(getFieldsValue()) : {};
    return customizeFilterForm(
      {
        code: 'SODR.PLAN_SHEET.CREATE_FILTER_FORM',
        form,
        expand: true,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.tag`).d('物料')}>
                  {getFieldDecorator('itemCode')(
                    <Lov code="SODR.PO_ITEM" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      textField="displaySupplierName"
                      onChange={(value, record) => {
                        const { registerField, setFieldsValue } = form;
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      queryParams={{
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                      onOk={(record) => {
                        const { setFieldsValue } = form;
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
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.common.model.common.poNum`).d('订单号')}
                >
                  {getFieldDecorator('poNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.sheet.displayPoLineNum`).d('订单行号')}
                >
                  {getFieldDecorator('lineNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => this.handleSearch()}
                type="primary"
                htmlType="submit"
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <ExcelExport
                method="POST"
                otherButtonProps={{ icon: null }}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/plans/batch-export/create`}
                queryParams={queryParams}
              />
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
