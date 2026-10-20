/**
 * MaintainIndex -非寄销开票申请维护查询界面 -form 表单查询
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import CacheComponent from 'components/CacheComponent';

const { Option } = Select;

@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SFIN.BILL_MAINTAIN_LIST.FILTER'],
})
@CacheComponent({ cacheKey: '/sfin/bill-maintain/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
      companyId: '',
    };
  }

  componentDidMount() {
    // 删除后，根据条件筛选一次
    this.fetchData();
  }

  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  @Bind()
  fetchData() {
    const { form, onFetchConsigBill } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchConsigBill({
          ...values,
        });
      }
    });
  }

  /**
   * 选择公司lov,将componyId传递给业务实体LOV
   * @param {*String} text 当前值
   * @param {*Object} record 行记录
   */
  @Bind()
  changeCompanyName(text, record) {
    const { form } = this.props;
    if (isUndefined(text)) {
      form.resetFields(['ouId']);
    }
    this.setState({
      companyId: record.companyId,
    });
  }

  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      format,
      organizationId,
      customizeFilterForm,
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };
    return customizeFilterForm(
      {
        code: 'SFIN.BILL_MAINTAIN_LIST.FILTER',
        form,
        expand,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('displayBillNum')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sfin.invoiceBill.model.payableInvoice.suppliesName`)
                    .d('物料名称')}
                  {...formlayout}
                >
                  {getFieldDecorator('itemName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.companyName').d('客户公司')}
                  {...formlayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.CUSTOMER"
                      queryParams={{ organizationId: getUserOrganizationId() }}
                      textField="companyName"
                      onChange={(text, record) => {
                        this.changeCompanyName(text, record);
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                      format={format}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.to`).d('创建时间至')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={format}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.ouName`).d('业务实体')}
                  {...formlayout}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      disabled={!getFieldValue('companyId')}
                      code="HPFM.OU"
                      textField="ouName"
                      queryParams={{
                        organizationId,
                        companyId: this.state.companyId,
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`hzero.common.status`).d('状态')} {...formlayout}>
                  {getFieldDecorator('billStatus')(
                    <Select allowClear>
                      <Option value="NEW">
                        {intl.get(`hzero.common.button.create`).d('新建')}
                      </Option>
                      <Option value="REJECTED">
                        {intl.get(`sfin.invoiceBill.view.button.backed`).d('已退回')}
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.purAgentName`).d('采购员')}
                  {...formlayout}
                >
                  {getFieldDecorator('agentName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.purchaseOrgName`)
                    .d('采购组织')}
                  {...formlayout}
                >
                  {getFieldDecorator('organizationId')(
                    <Lov
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId: organizationId }}
                      textField="organizationName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType')(
                    <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {!expand
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.fetchData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
