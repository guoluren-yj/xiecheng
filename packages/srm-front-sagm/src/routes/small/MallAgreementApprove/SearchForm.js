import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId } from 'utils/utils';

import delCache from '@/components/DelCache';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

class Search extends Component {
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
        supplierName: undefined,
        supplierCompanyName: undefined,
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
                {...formLayout}
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
                {...formLayout}
              >
                {getFieldDecorator('companyName', {
                  initialValue: dataValue.companyName,
                })}
                {getFieldDecorator('companyId', {
                  initialValue: dataValue.companyId,
                })(
                  <Lov
                    code="SPFM.USER_AUTHORITY_COMPANY"
                    originTenantId={getCurrentOrganizationId()}
                    textValue={getFieldValue('companyName')}
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                    }}
                    onChange={this.lovChange}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.model.supplier').d('供应商')}
                {...formLayout}
              >
                {getFieldDecorator('supplierCompanyName', {
                  initialValue: dataValue.supplierCompanyName,
                })}
                {getFieldDecorator('supplierCompanyId')(
                  <Lov
                    allowClear
                    code="SMAL.SUPPLIER_BY_PUR"
                    textField="supplierName"
                    originTenantId={getCurrentOrganizationId()}
                    textValue={getFieldValue('supplierCompanyName')}
                    lovOptions={{
                      displayField: 'supplierName',
                      valueField: 'supplierId',
                    }}
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                      companyId: getFieldValue('companyId'),
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
                  onClick={() => this.handleSearch()}
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

@Form.create({ fieldNameProp: null })
@delCache({ cacheKey: '/small/mall-agreement-approve/list' })
@cacheComponent({ cacheKey: '/small/mall-agreement-approve/list' })
export class ApproveSearch extends Search {}

@Form.create({ fieldNameProp: null })
@delCache({ cacheKey: '/small/mall-agreement-publish/list' })
@cacheComponent({ cacheKey: '/small/mall-agreement-publish/list' })
export class PublishSearch extends Search {}
