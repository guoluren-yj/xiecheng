import React from 'react';
import moment from 'moment';
import { Input, Radio, Button, Form, Row, Col, DatePicker, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import intl from 'utils/intl';

import styles from './index.less';

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

const formLineLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 14 },
};

const formDateLineLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      flag: false,
      dateFlag: 0,
      companyName: undefined,
      moreFlag: false,
      morePurFlag: false,
      purchaseCompanyName: '',
      paymentTypeName: '',
    };
  }

  @Bind()
  handleChange(e) {
    if (e.target.value === '6') {
      this.setState({
        dateFlag: 1,
      });
    } else {
      this.setState({
        dateFlag: 0,
      });
    }
  }

  @Bind()
  resetData() {
    this.props.form.resetFields();
  }

  @Bind()
  searchData() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  @Bind()
  handleSearch(params, name, lovParam) {
    const { onSearch, companyList, purchaseCompanyList, paymentTypes } = this.props;
    if (name === 'paymentTypeCode') {
      if (lovParam) {
        if (
          paymentTypes.length > 0 &&
          (lovParam.value === paymentTypes[0].value ||
            lovParam.value === paymentTypes[1].value ||
            lovParam.value === paymentTypes[2].value)
        ) {
          // debugger;
          this.setState({ moreFlag: false });
          this.props.form.setFieldsValue({
            paymentTypeCode: params,
          });
        } else {
          // debugger;
          this.props.form.setFieldsValue({
            paymentTypeCode: params,
          });
          this.setState({ paymentTypeName: lovParam.meaning, moreFlag: true });
        }
      } else {
        this.props.form.setFieldsValue({
          paymentTypeCode: params,
        });
        this.setState({ moreFlag: false });
      }
      // this.props.form.setFieldsValue({ paymentTypeCode: params });
    } else if (name === 'companyId') {
      if (lovParam) {
        if (
          companyList.length > 0 &&
          (lovParam.supplierCompanyId === companyList[0].supplierCompanyId ||
            lovParam.supplierCompanyId === companyList[1].supplierCompanyId ||
            lovParam.supplierCompanyId === companyList[2].supplierCompanyId)
        ) {
          this.setState({ moreFlag: false });
          this.props.form.setFieldsValue({
            companyId: params,
          });
        } else {
          this.props.form.setFieldsValue({
            companyId: params,
          });
          this.setState({ companyName: lovParam.supplierCompanyName, moreFlag: true });
        }
      } else {
        this.props.form.setFieldsValue({
          companyId: params,
        });
        this.setState({ moreFlag: false });
      }
    } else if (name === 'purchaseCompanyId') {
      if (lovParam) {
        if (
          purchaseCompanyList.length > 0 &&
          (lovParam.companyId === purchaseCompanyList[0].companyId ||
            lovParam.companyId === purchaseCompanyList[1].companyId ||
            lovParam.companyId === purchaseCompanyList[2].companyId)
        ) {
          this.setState({ morePurFlag: false });
          this.props.form.setFieldsValue({
            purchaseCompanyId: params,
          });
        } else {
          this.props.form.setFieldsValue({
            purchaseCompanyId: params,
          });
          this.setState({ purchaseCompanyName: lovParam.companyName, morePurFlag: true });
        }
      } else {
        this.props.form.setFieldsValue({
          purchaseCompanyId: params,
        });
        this.setState({ morePurFlag: false });
      }
    } else if (name === 'queryDateCode') {
      if (params === 'all') {
        this.setState({
          dateFlag: 1,
        });
      } else {
        this.setState({
          dateFlag: 0,
        });
        this.props.form.setFieldsValue({ queryDateCode: params });
      }
    } else if (name === 'paymentStatus') {
      this.props.form.setFieldsValue({ paymentStatus: params });
    }
    if (onSearch) {
      onSearch();
    }
  }

  render() {
    const {
      form,
      paymentTypes = [],
      companyList,
      paymentStatus = [],
      purchaseCompanyList = [],
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { flag, dateFlag } = this.state;
    return (
      <React.Fragment>
        <div style={{ display: 'flex', marginBottom: '12px' }}>
          <Form>
            <Form.Item>
              {getFieldDecorator('aggregateQuery')(
                <Input
                  style={{ width: '200px' }}
                  placeholder={intl.get('smodr.payment.model.newtips').d('订单编码｜下单人')}
                  onPressEnter={() => this.searchData()}
                />
              )}
            </Form.Item>
          </Form>
          <Form.Item>
            <Button
              type="primary"
              funcType="raised"
              style={{ borderRadius: '1px' }}
              onClick={() => this.searchData()}
            >
              {intl.get('smodr.payment.view.query').d('查询')}
            </Button>
            <Button style={{ borderRadius: '1px' }} onClick={() => this.setState({ flag: !flag })}>
              {intl.get('smodr.payment.view.advanceQuery').d('高级筛选')}
              {flag ? <Icon type="up" /> : <Icon type="down" />}
            </Button>
          </Form.Item>
        </div>
        {flag && (
          <Form className={styles['search-form']}>
            <Form.Item
              label={intl.get('smodr.payment.view.supplierCompany').d('供应商公司')}
              {...formLineLayout}
            >
              {getFieldDecorator('companyId')(
                <Radio.Group
                  defaultValue="1"
                  buttonStyle="solid"
                  onChange={(e) => this.handleSearch(e.target.value || '', 'companyId')}
                >
                  <Radio.Button>{intl.get('smodr.payment.view.all').d('全部')}</Radio.Button>
                  {companyList.length > 0 && (
                    <Radio.Button value={companyList[0] && companyList[0].supplierCompanyId}>
                      {companyList && companyList[0] && companyList[0].supplierCompanyName}
                    </Radio.Button>
                  )}
                  {companyList.length > 1 && (
                    <Radio.Button value={companyList[1] && companyList[1].supplierCompanyId}>
                      {companyList && companyList[1] && companyList[1].supplierCompanyName}
                    </Radio.Button>
                  )}
                  {companyList.length > 1 && (
                    <Radio.Button value={companyList[2] && companyList[2].supplierCompanyId}>
                      {companyList && companyList[2] && companyList[2].supplierCompanyName}
                    </Radio.Button>
                  )}
                  {this.state.companyName && this.state.moreFlag && (
                    <Radio.Button value={this.props.form.getFieldValue('companyId')}>
                      {this.state.companyName}
                    </Radio.Button>
                  )}
                  {companyList.length > 3 && (
                    <Lov
                      style={{ color: '#29BECE' }}
                      isButton
                      code="SPFM.USER_AUTH.SUPPLIER"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                      }}
                      onChange={(val, lovParam) => this.handleSearch(val, 'companyId', lovParam)}
                    >
                      {intl.get('smodr.payment.view.more').d('更多')}
                    </Lov>
                  )}
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('smodr.payment.view.purchaseCompany').d('采购方公司')}
              {...formLineLayout}
            >
              {getFieldDecorator('purchaseCompanyId')(
                <Radio.Group
                  defaultValue="1"
                  buttonStyle="solid"
                  onChange={(e) => this.handleSearch(e.target.value || '', 'purchaseCompanyId')}
                >
                  <Radio.Button>{intl.get('smodr.payment.view.all').d('全部')}</Radio.Button>
                  {purchaseCompanyList.length > 0 && (
                    <Radio.Button
                      value={purchaseCompanyList[0] && purchaseCompanyList[0].companyId}
                    >
                      {purchaseCompanyList &&
                        purchaseCompanyList[0] &&
                        purchaseCompanyList[0].companyName}
                    </Radio.Button>
                  )}
                  {purchaseCompanyList.length > 1 && (
                    <Radio.Button
                      value={purchaseCompanyList[1] && purchaseCompanyList[1].companyId}
                    >
                      {purchaseCompanyList &&
                        purchaseCompanyList[1] &&
                        purchaseCompanyList[1].companyName}
                    </Radio.Button>
                  )}
                  {purchaseCompanyList.length > 1 && (
                    <Radio.Button
                      value={purchaseCompanyList[2] && purchaseCompanyList[2].companyId}
                    >
                      {purchaseCompanyList &&
                        purchaseCompanyList[2] &&
                        purchaseCompanyList[2].companyName}
                    </Radio.Button>
                  )}
                  {this.state.purchaseCompanyName && this.state.morePurFlag && (
                    <Radio.Button value={this.props.form.getFieldValue('purchaseCompanyId')}>
                      {this.state.purchaseCompanyName}
                    </Radio.Button>
                  )}
                  {purchaseCompanyList.length > 3 && (
                    <Lov
                      style={{ color: '#29BECE' }}
                      isButton
                      code="SPFM.USER_AUTH.COMPANY"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                      }}
                      onChange={(val, lovParam) =>
                        this.handleSearch(val, 'purchaseCompanyId', lovParam)
                      }
                    >
                      {intl.get('smodr.payment.view.more').d('更多')}
                    </Lov>
                  )}
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('smodr.invoiceRecord.view.paymentMethodCode').d('支付方式')}
              {...formLineLayout}
            >
              {getFieldDecorator('paymentTypeCode')(
                <Radio.Group
                  defaultValue="1"
                  buttonStyle="solid"
                  onChange={(e) => this.handleSearch(e.target.value || '', 'paymentTypeCode')}
                >
                  <Radio.Button>{intl.get('smodr.payment.view.all').d('全部')}</Radio.Button>
                  {paymentTypes.length > 0 && (
                    <Radio.Button value={paymentTypes[0] && paymentTypes[0].value}>
                      {paymentTypes && paymentTypes[0] && paymentTypes[0].meaning}
                    </Radio.Button>
                  )}
                  {paymentTypes.length > 1 && (
                    <Radio.Button value={paymentTypes[1] && paymentTypes[1].value}>
                      {paymentTypes && paymentTypes[1] && paymentTypes[1].meaning}
                    </Radio.Button>
                  )}
                  {paymentTypes.length > 1 && (
                    <Radio.Button value={paymentTypes[2] && paymentTypes[2].value}>
                      {paymentTypes && paymentTypes[2] && paymentTypes[2].meaning}
                    </Radio.Button>
                  )}
                  {this.state.paymentTypeName && this.state.moreFlag && (
                    <Radio.Button value={this.props.form.getFieldValue('paymentTypeCode')}>
                      {this.state.paymentTypeName}
                    </Radio.Button>
                  )}
                  {paymentTypes.length > 3 && (
                    <Lov
                      style={{ color: '#29BECE' }}
                      isButton
                      code="S2FUL.PAYMENT_TYPE"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                      }}
                      onChange={(val, lovParam) =>
                        this.handleSearch(val, 'paymentTypeCode', lovParam)
                      }
                    >
                      {intl.get('smodr.payment.view.more').d('更多')}
                    </Lov>
                  )}
                  {/* {paymentTypes &&
                    paymentTypes.map((item) => (
                      <Radio.Button key={item.value} value={item.value}>
                        {item.meaning}
                      </Radio.Button>
                    ))} */}
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('smodr.invoiceRecord.view.paymentStatus').d('支付状态')}
              {...formLineLayout}
            >
              {getFieldDecorator('paymentStatus')(
                <Radio.Group
                  defaultValue="1"
                  buttonStyle="solid"
                  onChange={(e) => this.handleSearch(e.target.value || '', 'paymentStatus')}
                >
                  <Radio.Button>{intl.get('smodr.payment.view.all').d('全部')}</Radio.Button>
                  {paymentStatus &&
                    paymentStatus.map((item) => (
                      <Radio.Button key={item.value} value={item.value}>
                        {item.meaning}
                      </Radio.Button>
                    ))}
                </Radio.Group>
              )}
            </Form.Item>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={intl.get('smodr.payment.view.creationCode').d('创建时间')}
                  {...formDateLineLayout}
                >
                  {getFieldDecorator('queryDateCode')(
                    <Radio.Group
                      defaultValue="1"
                      onChange={(e) => this.handleSearch(e.target.value || '', 'queryDateCode')}
                      buttonStyle="solid"
                    >
                      <Radio.Button>{intl.get('smodr.payment.view.all').d('全部')}</Radio.Button>
                      <Radio.Button value="oneWeekAgo">
                        {intl.get('smodr.payment.view.oneWeekAgo').d('一周前')}
                      </Radio.Button>
                      <Radio.Button value="oneMonthAgo">
                        {intl.get('smodr.payment.view.oneMonthAgo').d('一个月前')}
                      </Radio.Button>
                      <Radio.Button value="threeMonthAgo">
                        {intl.get('smodr.payment.view.threeMonthAgo').d('三个月前')}
                      </Radio.Button>
                      <Radio.Button value="oneYearAgo">
                        {intl.get('smodr.payment.view.oneYearAgo').d('一年前')}
                      </Radio.Button>
                      <Radio.Button value="all">
                        {intl.get('smodr.payment.view.custom').d('自定义')}
                      </Radio.Button>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
              {!!dateFlag && (
                <Col span={12}>
                  <div className="date-line">
                    <Form.Item label={intl.get('smodr.payment.view.from').d('从')} {...formLayout}>
                      {getFieldDecorator('queryDateFrom', { initialValue: '' })(
                        <DatePicker
                          showTime
                          className={styles['date-picker']}
                          format={getDateTimeFormat()}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('queryDateTo') &&
                            moment(getFieldValue('queryDateTo')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                    <Form.Item label={intl.get('smodr.payment.view.to').d('至')} {...formLayout}>
                      {getFieldDecorator('queryDateTo', { initialValue: '' })(
                        <DatePicker
                          showTime
                          className={styles['date-picker']}
                          format={getDateTimeFormat()}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('queryDateFrom') &&
                            moment(getFieldValue('queryDateFrom')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                    <Button style={{ margin: '6px 12px' }} onClick={this.resetData}>
                      {intl.get('smodr.payment.view.reset').d('重置')}
                    </Button>
                    <Button onClick={this.searchData} type="primary">
                      {intl.get('smodr.payment.view.query').d('查询')}
                    </Button>
                  </div>
                </Col>
              )}
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
