/**
 * FilterForm - 查询
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Row, Col, Button, DatePicker, Select } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId } from 'utils/utils';
import ValueList from 'components/ValueList';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const tenantId = getCurrentOrganizationId();

@cacheComponent({ cacheKey: '/sslm/supplier-quota-report/list' })
export default class SupplierQuotaManage extends Component {
  state = {
    expand: false,
  };

  /**
   * 查询条件收起／展开
   */
  @Bind()
  handleToggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    onSearch();
  }

  render() {
    const {
      statusList = [],
      form: { getFieldDecorator, getFieldValue },
      customizeFilterForm,
      code,
    } = this.props;
    const { expand } = this.state;
    return customizeFilterForm(
      {
        code, // 单元编码，必传
        form: this.props.form,
        expand, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierQuotaManage.modal.quota.agreementNo')
                    .d('配额协议号')}
                >
                  {getFieldDecorator('quotaAgreementNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierQuotaManage.modal.quota.businessEntity')
                    .d('业务实体')}
                >
                  {getFieldDecorator('ouId')(<Lov code="HPFM.OU" queryParams={{ tenantId }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.supplierQuotaManage.modal.quota.status').d('单据状态')}
                >
                  {getFieldDecorator('evalStatus')(
                    <Select allowClear>
                      {statusList.map(n => (
                        <Option key={n.value}>{n.meaning}</Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierQuotaManage.modal.quota.createdDateFrom')
                    .d('创建日期从')}
                >
                  {getFieldDecorator('createDateFrom')(
                    <DatePicker
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('createDateTo') &&
                        moment(getFieldValue('createDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierQuotaManage.modal.quota.createdDateTo')
                    .d('创建日期至')}
                >
                  {getFieldDecorator('createDateTo')(
                    <DatePicker
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('createDateFrom') &&
                        moment(getFieldValue('createDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.supplierQuotaManage.modal.quota.founder').d('创建人')}
                >
                  {getFieldDecorator('createName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierQuotaManage.modal.quota.sourceDocType')
                    .d('来源单据类型')}
                >
                  {getFieldDecorator('sourceDocType')(
                    <ValueList lovCode="SSLM.QUOTA_SOURCE_DOC_TYPE" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierQuotaManage.modal.quota.sourceNumber')
                    .d('来源单据编号')}
                >
                  {getFieldDecorator('sourceNumber')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.supplierQuotaManage.modal.quota.buyer').d('分管采购员')}
                >
                  {getFieldDecorator('buyerName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
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
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
