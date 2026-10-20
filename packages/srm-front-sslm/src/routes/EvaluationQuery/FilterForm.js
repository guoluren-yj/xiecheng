/**
 * FilterForm - 考评结果查询/按明细查询
 * @date: 2019-11-22
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, DatePicker, Button, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import cacheComponent from 'components/CacheComponent';
import LovMultiple from '@/routes/components/LovMultiple';

/**
 * 考评结果查询
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sslm/evaluation-query-detail' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      collapse: false,
      dateFormat: getDateFormat(),
      categorySelectRows: [],
      itemSelectRows: [],
    };
  }

  componentDidMount() {
    const { defaultFilterValues, form } = this.props;
    form.setFieldsValue(defaultFilterValues);
  }

  /**
   * 品类选中时的回调
   */
  @Bind()
  changeCategorySelectRows(selectRows) {
    this.setState({ categorySelectRows: selectRows });
  }

  /**
   * 物料选中时的回调
   */
  @Bind()
  changeItemSelectRows(selectRows) {
    this.setState({ itemSelectRows: selectRows });
  }

  /**
   * 发起查询请求
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
    this.setState({ categorySelectRows: [], itemSelectRows: [] });
  }

  /**
   * 折叠或展开查询表单
   */
  @Bind()
  handleToggle() {
    this.setState(state => ({
      collapse: !state.collapse,
    }));
  }

  /**
   * render
   * @return React.element
   */
  render() {
    const { collapse, dateFormat, categorySelectRows, itemSelectRows } = this.state;
    const {
      tenantId,
      form,
      archiveStatus,
      levelValue,
      cycleValue,
      methodValue,
      customizeFilterForm = () => {},
      custLoading,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    return customizeFilterForm(
      {
        code: 'SSLM.EVALUATION_QUERY_DETAIL.LIST_FILTER', // 单元编码，必传
        form,
        expand: collapse, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalNum', {})(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.evaluationQuery.model.archive.describe`).d('档案描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalName', {})(<Input trim />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.view.company.name`).d('公司')}
                  {...formLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov code="HPFM.COMPANY" textField="companyName" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: !collapse ? 'none' : 'block' }}>
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
                  label={intl.get(`sslm.evaluationQuery.model.date.from`).d('建档日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
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
                  label={intl.get(`sslm.evaluationQuery.model.date.to`).d('建档日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
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
                  label={intl.get(`sslm.evaluationQuery.model.archive.status`).d('档案状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalStatus', {})(
                    <Select allowClear>
                      {archiveStatus.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.evaluationQuery.model.exam.method`).d('考评方式')}
                  {...formLayout}
                >
                  {getFieldDecorator('kpiMethod')(
                    <Select allowClear>
                      {methodValue.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.evaluationQuery.model.archive.supplierName`)
                    .d('供应商名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierName', {})(<Input trim />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.evaluationQuery.model.evaluation.charger`).d('考评负责人')}
                  {...formLayout}
                >
                  {getFieldDecorator('processUserName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.evaluationQuery.model.evaluation.createdUserName`)
                    .d('创建人')}
                  {...formLayout}
                >
                  {getFieldDecorator('createdUserName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.evaluationQuery.model.evaluation.startDate`)
                    .d('考评日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('evalDateTo') &&
                        moment(getFieldValue('evalDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.evaluationQuery.model.evaluation.endDate`).d('考评日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('evalDateFrom') &&
                        moment(getFieldValue('evalDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('sslm.common.model.category').d('品类')} {...formLayout}>
                  {getFieldDecorator('categoryIds')(
                    <LovMultiple
                      code="SMDM.TREE_ITEM_CATEGORY"
                      queryParams={{ tenantId }}
                      textField="categoryName"
                      changeSelectRows={this.changeCategorySelectRows}
                      selectedRows={categorySelectRows}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('sslm.common.model.item').d('物料')} {...formLayout}>
                  {getFieldDecorator('itemIds')(
                    <LovMultiple
                      code="SMDM.CUSTOMER_ITEM"
                      queryParams={{ tenantId }}
                      textField="itemName"
                      changeSelectRows={this.changeItemSelectRows}
                      selectedRows={itemSelectRows}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sslm.evaluationQuery.model.evaluation.evalTplName`)
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
                    .get(`sslm.evaluationQuery.model.evaluation.evalTplType`)
                    .d('模板类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalTplType')(
                    <ValueList lovCode="SSLM.KPI_EVAL_TPL_TYPE_ALL" allowClear />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierCategoryIds')(
                    <LovMultiple
                      isCascade // 是否级联勾选
                      textField="categoryDescription"
                      code="SSLM.SUPPLIER_CATEGORY_TREE"
                      queryParams={{ tenantId }}
                      parentRowKey="parentCategoryId"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.evaluationQuery.model.evaluation.cycle`).d('考评周期')}
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
                  label={intl.get(`sslm.evaluationQuery.model.item.level`).d('等级')}
                  {...formLayout}
                >
                  {getFieldDecorator('levelDesc', {})(<Input trim typeCase="upper" inputChinese />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.handleToggle}>
                {!collapse
                  ? intl.get(`hzero.common.button.viewMore`).d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
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
