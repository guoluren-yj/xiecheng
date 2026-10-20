/**
 *
 * @date: 2020/6/17
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import LovMultiple from '@/routes/components/LovMultiple';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
// Option组件初始化
const { Option } = Select;

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);
    this.state = {
      purAgentSelectRows: [],
    };
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const {
      fetchList = e => e,
      form: { validateFields = e => e },
    } = this.props;
    validateFields({ force: true }, (err, fieldsValue) => {
      if (!err) {
        fetchList({
          ...fieldsValue,
        });
      }
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
    this.setState({ purAgentSelectRows: [] });
  }

  /**
   * 采购员选中时的回调
   */
  @Bind()
  changePurAgentSelectRows(selectRows) {
    this.setState({ purAgentSelectRows: selectRows });
  }

  render() {
    const {
      form,
      basicForm,
      form: { getFieldDecorator },
      lifeCycleStageCode = [],
      customizeFilterForm,
      docManageRemote,
      basicInfo,
    } = this.props;
    const { purAgentSelectRows } = this.state;
    const filterRowProps = {
      form,
      basicForm,
      basicInfo,
    };
    // 添加供应商弹窗，筛选条件，增加埋点字段
    const filterRowColumns = docManageRemote ? (
      docManageRemote.process(
        'SSLM.EVALUATION_DOC_MANAGE_DETAIL_ADD_SUP_PROCESS',
        <></>,
        filterRowProps
      )
    ) : (
      <></>
    );
    return customizeFilterForm(
      {
        code: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_FILTER', // 单元编码，必传
        form,
        expand: true,
      },
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
                  {getFieldDecorator('categoryId')(
                    <Lov
                      code="SSLM.SUPPLIER_CATEGORY"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
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
                  {getFieldDecorator('stageIds')(
                    <Select mode="multiple" allowClear>
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
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.evaluationTemplate.model.evalTemplate.purchaseAgent`)
                    .d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentIds')(
                    <LovMultiple
                      code="SPFM.TENANT_PURCHASE_AGENT"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      textField="purchaseAgentName"
                      changeSelectRows={this.changePurAgentSelectRows}
                      selectedRows={purAgentSelectRows}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            {filterRowColumns}
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
