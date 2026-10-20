/**
 * FilterForm - 查询
 * @extends {Component} - React.Component
 * @reactProps {object} form - 表单对象
 * @returns React.element
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, DatePicker, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';

const tenantId = getCurrentOrganizationId();

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sslm/site-investigate-report/result/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
    };
    const { onRef } = props;
    onRef(this);
  }

  /**
   * 展开/折叠
   */
  @Bind()
  handleToggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch = (e) => e } = this.props;
    onSearch();
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { expand } = this.state;
    const {
      evalStatus,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      code = '',
      customizeFilterForm,
      custLoading,
    } = this.props;

    return customizeFilterForm(
      { code, form: this.props.form, expand },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('evalStatus')(
                    <Select allowClear>
                      {evalStatus.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码')}
                >
                  {getFieldDecorator('evalNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get('sslm.siteInvestigateReport.modal.mange.describe')
                    .d('考察报告描述')}
                >
                  {getFieldDecorator('evalDescription')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get('sslm.siteInvestigateReport.modal.mange.creationDateFrom')
                    .d('创建时间从')}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get('sslm.siteInvestigateReport.modal.mange.creationDateTo')
                    .d('创建时间至')}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('sslm.siteInvestigateReport.modal.mange.company').d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      queryParams={{ tenantId }}
                      textField="companyName"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('sslm.siteInvestigateReport.modal.mange.createdBy').d('创建人')}
                >
                  {getFieldDecorator('realName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get('sslm.siteInvestigateReport.modal.mange.supplierName')
                    .d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyIdLov')(
                    <Lov
                      code="SSLM.SITE_SUPPLIER"
                      queryParams={{ tenantId }}
                      textField="displaySupplierName"
                      lovOptions={{
                        displayField: 'displaySupplierName',
                        valueField: 'unionKey',
                      }}
                      onChange={(_, lovRecord) => {
                        const { dataType } = lovRecord;
                        setFieldsValue({
                          supplierId: dataType === 'plate' ? null : lovRecord.dataId,
                          supplierCompanyId: dataType === 'plate' ? lovRecord.dataId : null,
                        });
                      }}
                    />
                  )}
                  {getFieldDecorator('supplierCompanyId', {
                    initialValue: undefined,
                  })}
                  {getFieldDecorator('supplierId', {
                    initialValue: undefined,
                  })}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.handleToggle}>
                {expand
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.status.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
