import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getDateFormat } from 'utils/utils';
// import Lov from 'components/Lov';
import intl from 'utils/intl';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import cacheComponent from 'components/CacheComponent';
import LovModal from '../../components/MultipleLov';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/purchase-order-maintain/source-from-requisition/list' })
export default class Search extends Component {
  /**
   * 表单查询
   */
  @Bind()
  handleSearch(page = {}, buttonFlag) {
    const { onSearch } = this.props;
    onSearch(page, buttonFlag);
  }

  // 查询更多
  @Bind()
  toggle(type) {
    const { searchMore } = this.props;
    searchMore(type);
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  render() {
    const {
      form,
      tenantId,
      collapse,
      customizeFilterForm,
      enumMap: { resultStatus = [] },
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    return customizeFilterForm(
      {
        form,
        expand: !collapse,
        code: 'SODR.PURCHASE_SOURCE_LIST.FILTER',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sodr.orderMaintain.sourceFrom.sourceNum`).d('寻源单号')}
                  {...formLayout}
                >
                  {getFieldDecorator('sourceNum')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...formLayout}>
                  {getFieldDecorator('companyName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.supplier.tag`).d('供应商')} {...formLayout}>
                  {getFieldDecorator('supplierCompanyName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: collapse ? 'none' : 'block' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sodr.orderMaintain.sourceFrom.invOrganizationIds`).d('库存组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('invOrganizationIds')(
                    <LovModal
                      defaultWidth={600}
                      code="HPFM.INV_ORG"
                      queryParams={{ tenantId }}
                      textField="organizationName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sodr.orderMaintain.sourceFrom.purchaseAgentId`).d('采购员')}
                  {...formLayout}
                >
                  {getFieldDecorator('purchaseAgentIds')(
                    <LovModal
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      queryParams={{ tenantId }}
                      textValue={getFieldValue('purchaseAgentName')}
                      textField="purchaseAgentName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.roles.creator`).d('创建人')} {...formLayout}>
                  {getFieldDecorator('rfxCreatedBy')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('creatDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creatDateTo') &&
                        moment(getFieldValue('creatDateTo')).isBefore(currentDate, 'time')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('creatDateTo')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creatDateFrom') &&
                        moment(getFieldValue('creatDateFrom')).isAfter(currentDate, 'time')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sodr.orderMaintain.sourceFrom.itemdescriptions`).d('物料名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('itemName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sodr.orderMaintain.sourceFrom.pendingFlag`).d('是否暂挂')}
                >
                  {getFieldDecorator('pendingFlag', {
                    initialValue: '0',
                  })(
                    <Select style={{ width: '100%' }}>
                      <Select.Option value="1">
                        {intl.get(`hzero.common.yes`).d('是')}
                      </Select.Option>
                      <Select.Option value="0">{intl.get(`hzero.common.no`).d('否')}</Select.Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sodr.common.model.common.resultStatus`).d('寻源结果状态')}
                >
                  {getFieldDecorator('resultStatusSet', {
                    initialValue: ['VALID'],
                  })(
                    <Select mode="multiple" style={{ width: '100%' }}>
                      {resultStatus.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              {collapse ? (
                <Button onClick={() => this.toggle(false)}>
                  {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    this.toggle(true);
                  }}
                >
                  {intl.get(`hzero.common.button.collected`).d('收起查询')}
                </Button>
              )}
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={() => this.handleSearch({}, 1)}
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
