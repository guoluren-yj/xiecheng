import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, DatePicker, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { getCurrentTenant } from 'utils/utils';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * Search - 考评档案管理查询组件
 * @extends {Component} - React.Component
 * @reactProps {object} form - 表单对象
 * @returns React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sslm/evaluation-doc-manage' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false,
    };
    const { onRef } = props;
    onRef(this);
  }

  /**
   * handleToggle - 展开或折叠更多按钮
   */
  @Bind()
  handleToggle(flag) {
    this.setState({
      collapse: flag,
    });
  }
  /**
   * handleSearch - 查询表单请求
   */

  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  /**
   *handleReset - 重置查询表单
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * @return React.element
   */
  render() {
    const { collapse } = this.state;
    const {
      form,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      statusValue,
      cycleValue,
      levelValue,
      methodValue,
      customizeFilterForm = () => {},
      custLoading,
    } = this.props;
    const { tenantId } = getCurrentTenant();
    getFieldDecorator('supplierId');
    return customizeFilterForm(
      {
        code: 'SSLM.EVALUATION_DOC_MANAGE_LIST.FILTER', // 单元编码，必传
        form,
        expand: collapse, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.supplierDocManage.model.docManage.evalNum`).d('档案编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalNum')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.supplierDocManage.model.docManage.evalName`).d('档案描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.evalStatus`)
                    .d('档案状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalStatus')(
                    <Select allowClear>
                      {statusValue.map(item => {
                        if (item.value === 'MANUAL_EVALUATING_COMPLETE') {
                          return null;
                        }
                        return (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: collapse ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.supplierDocManage.model.docManage.group`).d('集团')}
                  {...formLayout}
                >
                  {getFieldDecorator('groupId')(
                    <Lov code="SSLM.TENANT_GROUP" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.supplierDocManage.model.docManage.company`).d('公司')}
                  {...formLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov code="HPFM.COMPANY" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.supplier`)
                    .d('供应商名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierNameLov')(
                    <Lov
                      code="SSLM.USER_AUTH.SUPPLIER"
                      queryParams={{ tenantId, asyncCountFlag: 'Y' }}
                      textField="supplierCompanyName"
                      lovOptions={{
                        valueField: 'uniqueKey',
                      }}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({ supplierId: lovRecord.supplierCompanyId });
                      }}
                      // ref={node => {
                      //   this.lovRef = node;
                      // }}
                      // onChange={(_, lovRecord) => {
                      //   this.lovRef.state.text = lovRecord.erpSupplierName
                      //     ? lovRecord.erpSupplierName
                      //     : lovRecord.supplierCompanyName;
                      // }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.purchaseOrganization`)
                    .d('采购组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('purOrgId')(
                    <Lov code="HPFM.PURCHASE_ORGANIZATION" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.stockOrganization`)
                    .d('库存组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('invOrgId')(
                    <Lov
                      textValue={getFieldValue('organizationName')}
                      code="HPFM.INV_ORG"
                      queryParams={{ tenantId }}
                      lovOptions={{ displayField: 'organizationName' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.supplierDocManage.model.docManage.evalCycle`).d('考评周期')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalCycle')(
                    <Select allowClear>
                      {cycleValue.map(item => {
                        return (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.evalDimension`)
                    .d('考评维度')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalDimension')(
                    <Select allowClear>
                      {levelValue.map(item => {
                        return (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.supplierDocManage.model.docManage.kpiMethod`).d('考评方式')}
                  {...formLayout}
                >
                  {getFieldDecorator('kpiMethod')(
                    <Select allowClear>
                      {methodValue.map(item => {
                        return (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.evaluationDocManage.PIC`)
                    .d('考评负责人')}
                  {...formLayout}
                >
                  {getFieldDecorator('processUserName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.evaluationDocManage.createdUserName`)
                    .d('创建人')}
                  {...formLayout}
                >
                  {getFieldDecorator('createdUserName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.creationDateFrom`)
                    .d('建档日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.creationDateTo`)
                    .d('建档日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.evalTplName`)
                    .d('考评模板')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalTplCode')(
                    <Lov
                      code="SSLM.KPI_EVAL_CODE"
                      lovOptions={{
                        displayField: 'evalTplName',
                        valueField: 'evalTplCode',
                      }}
                      queryParams={{
                        tenantId,
                        evalFlag: 1,
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.evalTplType`)
                    .d('模板类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalTplType')(
                    <ValueList lovCode="SSLM.KPI_EVAL_TPL_TYPE_ALL" allowClear />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              {!collapse ? (
                <Button onClick={() => this.handleToggle(true)}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
              ) : (
                <Button onClick={() => this.handleToggle(false)}>
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
              )}
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
