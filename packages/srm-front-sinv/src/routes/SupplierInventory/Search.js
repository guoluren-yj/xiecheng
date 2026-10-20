import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import LovModal from '../components/MultipleLov';

/**
 * 库存列表表单
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const modelPrompt = 'sinv.common.model.common';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      organizationId: getUserOrganizationId(),
      expandForm: false,
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

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  @Bind()
  onChangeSupplierId(value, record = []) {
    const supplierIds = [];
    const supplierCompanyIds = [];
    const { form } = this.props;
    const { registerField, setFieldsValue } = form;
    for (let i = 0; i < record.length; i++) {
      if (record[i]) {
        const { supplierId, supplierCompanyId } = record[i];
        if (supplierId) {
          supplierIds.push(supplierId);
        }
        if (supplierCompanyId) {
          supplierCompanyIds.push(supplierCompanyId);
        }
      }
    }
    registerField('supplierIds');
    registerField('supplierCompanyIds');
    setFieldsValue({
      supplierCompanyIds: supplierCompanyIds.join(','),
      supplierIds: supplierIds.join(','),
    });
  }

  render() {
    const { form, customizeFilterForm } = this.props;
    const { expandForm, organizationId } = this.state;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      {
        form,
        expand: expandForm,
        code: 'SINV.SUPPLIER_INVENTORY.SEARCH',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.supplierCompanyName`).d('供应商')}
                >
                  {getFieldDecorator('tempkeys')(
                    <LovModal
                      code="SPUC.SINV.SUPPLIER"
                      queryParams={{ tenantId: organizationId }}
                      onChange={this.onChangeSupplierId}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.code`).d('物料编码')}>
                  {getFieldDecorator('itemCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.name`).d('物料名称')}>
                  {getFieldDecorator('itemName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" style={{ marginRight: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
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
