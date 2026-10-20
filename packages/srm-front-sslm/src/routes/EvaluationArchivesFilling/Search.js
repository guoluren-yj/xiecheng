import React, { Component } from 'react';
import { Form, Button, Input, Col, Row, Select, DatePicker } from 'hzero-ui';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import { getDateFormat } from 'utils/utils';
import moment from 'moment';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';

/**
 * 考评档案填制查询表单组件
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} onSearch - 查询方法
 * @returns React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sslm/archive-filling' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      dateFormat: getDateFormat(),
      display: false,
    };
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
          // this.handleMoreFields();
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
  }

  /**
   * 折叠或展开查询表单
   */
  @Bind()
  toggleForm = () => {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  };

  /**
   * render
   * @returns React.element
   * @memberof Search
   */
  render() {
    const { dateFormat, display } = this.state;
    const {
      form,
      evaluationCycle,
      evaluationDim,
      tenantId,
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
        code: 'SSLM.ARCHIVE_FILLING_HEADER.FILTER', // 单元编码，必传
        form,
        expand: display, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archive.fileCode`).d('档案编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalNum', {})(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archive.describe`).d('档案描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalName', {})(<Input trim />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archive.group`).d('集团')}
                  {...formLayout}
                >
                  {getFieldDecorator('groupId', {})(
                    <Lov code="SSLM.TENANT_GROUP" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: !display ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.view.company.name`).d('公司')}
                  {...formLayout}
                >
                  {getFieldDecorator('companyId', {})(
                    <Lov code="HPFM.COMPANY" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archive.purchaseOrg`).d('采购组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('purOrgId')(
                    <Lov code="HPFM.PURCHASE_ORGANIZATION" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sslm.common.view.message.inventoryOrganization').d('库存组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('invOrgId', {})(
                    <Lov code="HPFM.INV_ORG" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archive.evaluationCycle`).d('考评周期')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalCycle', {})(
                    <Select allowClear>
                      {evaluationCycle.map(item => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archive.evaluationDimension`).d('考评维度')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalDimension', {})(
                    <Select allowClear>
                      {evaluationDim.map(item => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archive.kpiMethod`).d('考评方式')}
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
                  label={intl.get(`sslm.common.model.archive.filingDateFrom`).d('建档日期从')}
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
                  label={intl.get(`sslm.common.model.archive.filingDateTo`).d('建档日期至')}
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
                  label={intl.get(`sslm.common.model.evaluation.charger`).d('考评负责人')}
                  {...formLayout}
                >
                  {getFieldDecorator('processUserName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.evaluation.createdUserName`).d('创建人')}
                  {...formLayout}
                >
                  {getFieldDecorator('createdUserName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.evaluation.evalTplName`).d('考评模板')}
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
                  label={intl.get(`sslm.common.model.evaluation.evalTplType`).d('模板类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalTplType')(
                    <ValueList lovCode="SSLM.KPI_EVAL_TPL_TYPE_ALL" allowClear />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archiveFilled.completeFlag`).d('评分状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('scoreStatus')(
                    <ValueList lovCode="SSLM.EVAL_SCORE_STATUS" allowClear />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {!display
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
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
