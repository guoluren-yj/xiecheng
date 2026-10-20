import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import DelCache from '@/components/DelCache';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId } from 'utils/utils';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@DelCache({ cacheKey: '/small/mall-protocol-management/list4' })
@cacheComponent({ cacheKey: '/small/mall-protocol-management/list4' })
export default class FilterList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  @Bind()
  handlerFormReset() {
    const { form, onReset, onHandleChange } = this.props;
    form.resetFields();
    onReset();
    onHandleChange(
      {
        agreementName: undefined,
        companyId: undefined,
        companyName: undefined,
        supplierCompanyId: undefined,
        supplierCompanyName: undefined,
        agreementStatus: undefined,
        materialType: undefined,
        agreementType: undefined,
        sourceFrom: undefined,
        creationDateFrom: undefined,
        creationDateTo: undefined,
      },
      true
    );
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { onOpen } = this.props;
    if (onOpen) {
      onOpen();
    }
  }

  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    onSearch();
  }

  @Bind()
  lovChange(val, record) {
    const { onHandleChange } = this.props;
    onHandleChange({ companyId: val, companyName: record.companyName });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      dataValue,
      onHandleChange,
    } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.view.agreementCodeAndName').d('协议编号/名称')}
                {...formlayout}
              >
                {getFieldDecorator('agreementName', {
                  initialValue: dataValue.agreementName,
                })(
                  <Input
                    value={dataValue.agreementName}
                    onChange={(e) => onHandleChange({ agreementName: e.target.value })}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.model.purchaser').d('采购方')}
                {...formlayout}
              >
                {getFieldDecorator('companyName', {
                  initialValue: dataValue.companyName,
                })}
                {getFieldDecorator('companyId', {
                  initialValue: dataValue.companyId,
                })(
                  <Lov
                    allowClear
                    code="SPFM.USER_AUTHORITY_COMPANY"
                    textField="companyName"
                    textValue={getFieldValue('companyName')}
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                      lovCode: 'SPFM.USER_AUTH.COMPANY',
                    }}
                    onChange={this.lovChange}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.model.supplier').d('供应商')}
                {...formlayout}
              >
                {getFieldDecorator('supplierCompanyName', {
                  initialValue: dataValue.supplierCompanyName,
                })}
                {getFieldDecorator('supplierCompanyId')(
                  <Lov
                    allowClear
                    code="SMAL.SUPPLIER_BY_PUR"
                    textValue={getFieldValue('supplierCompanyName')}
                    queryParams={{
                      companyId: getFieldValue('companyId'),
                      tenantId: getCurrentOrganizationId(),
                    }}
                    onChange={(val, record) =>
                      onHandleChange({
                        supplierCompanyId: val,
                        supplierCompanyName: record.supplierName,
                      })
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={() => this.toggleForm()}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button data-code="reset" onClick={this.handlerFormReset}>
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
      </div>
    );
  }
}
