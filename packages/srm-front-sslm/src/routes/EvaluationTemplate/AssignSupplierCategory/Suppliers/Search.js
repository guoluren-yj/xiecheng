/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import LovMultiple from '@/routes/components/LovMultiple';

const FormItem = Form.Item;
// Option组件初始化
const { Option } = Select;

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@formatterCollections({ code: ['sslm.evaluationTemplate'] })
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onClick', 'onReset'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchList = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const data = getFieldsValue() || {};
    fetchList({
      ...data,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form,
      form: { getFieldDecorator = e => e },
      lifeCycleStageCode = [],
      evaluationTemplateRemote,
    } = this.props;
    const remoteParams = {
      formItemLayout,
      form,
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.evaluationTemplate.view.supplier.platformSupplierCode')
                    .d('平台供应商编码')}
                >
                  {getFieldDecorator('companyNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.evaluationTemplate.view.supplier.platformSupplierName')
                    .d('平台供应商名称')}
                >
                  {getFieldDecorator('companyName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.evaluationTemplate.view.supplier.erpSupplierCode')
                    .d('ERP供应商编码')}
                >
                  {getFieldDecorator('erpSupplierNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.evaluationTemplate.view.supplier.erpSupplierName')
                    .d('ERP供应商名称')}
                >
                  {getFieldDecorator('erpSupplierName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.evaluationTemplate.model.evalTemplate.supplierCategory`)
                    .d('供应商分类')}
                >
                  {getFieldDecorator('categoryIds')(
                    <LovMultiple
                      textField="categoryDescription"
                      code="SSLM.SUPPLIER_CATEGORY"
                      queryParams={{ enabledFlag: 1, tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.evaluationTemplate.model.evalTemplate.stageId`)
                    .d('供应商生命阶段')}
                >
                  {getFieldDecorator('stageId')(
                    <Select allowClear>
                      {lifeCycleStageCode.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            {/* 按钮埋点 */}
            {evaluationTemplateRemote &&
              evaluationTemplateRemote.render(
                'SSLM_EVALUATIONTEMPLATE_CUSTOMER_ITEM',
                <></>,
                remoteParams
              )}
            <Row>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.evaluationTemplate.model.evalTemplate.companyName`)
                    .d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SSLM.PURCHASE_COMPANY"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.onReset} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
