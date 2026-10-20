import React, { Component } from 'react';
import { Form, Col, Row, Button, Input, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';

/**
 * 考评结果查询表单组件
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} onSearch - 查询
 * @return React.element
 */

@formatterCollections({ code: ['sslm.common'] })
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sslm/received-query' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
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
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * render
   * @return React.element
   */
  render() {
    const { form, tenantId, levelValue, customizeFilterForm = () => {}, custLoading } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { display } = this.state;

    return customizeFilterForm(
      {
        code: 'SSLM.EVALUATION_RECEIVED_LIST.FILTER', // 单元编码，必传
        form,
        expand: display, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.archive.num`).d('档案编码')}
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
                  label={intl.get(`sslm.common.model.evaluation.charger`).d('考评负责人')}
                  {...formLayout}
                >
                  {getFieldDecorator('processUserName', {})(<Input trim />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: !display ? 'none' : 'block' }}>
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
                  label={intl.get(`sslm.common.model.evaluation.createdUserName`).d('创建人')}
                  {...formLayout}
                >
                  {getFieldDecorator('createdUserName', {})(<Input trim />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sslm.common.model.filing.date.from`).d('建档日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder=""
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
                  label={intl.get(`sslm.common.model.filing.date.to`).d('建档日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
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
                {intl.get('hzero.common.status.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
