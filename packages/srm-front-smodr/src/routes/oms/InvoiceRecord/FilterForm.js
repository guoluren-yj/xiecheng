import React from 'react';
import moment from 'moment';
import { Input, Radio, Button, Form, Row, Col, DatePicker, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';

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
export default class OrderLineManage extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      flag: false,
      dateFlag: 0,
      companyName: undefined,
      moreFlag: false,
      morePurFlag: false,
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
    const { onSearch, companyList, purchaseCompanyList } = this.props;
    if (name === 'invoiceTypeCode') {
      this.props.form.setFieldsValue({ invoiceTypeCode: params });
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
    } else if (name === 'validityStatus') {
      this.props.form.setFieldsValue({ validityStatus: params });
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
    }
    if (onSearch) {
      onSearch();
    }
  }

  render() {
    const {
      form,
      invoiceTypes = [],
      companyList = [],
      invoiceStatus = [],
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
                  style={{ width: '300px' }}
                  placeholder={intl
                    .get('smodr.invoiceRecord.model.alltips')
                    .d('商城开票编码｜发票代码｜订单编码｜发票号码')}
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
              {intl.get('smodr.invoiceRecord.view.query').d('查询')}
            </Button>
            <Button style={{ borderRadius: '1px' }} onClick={() => this.setState({ flag: !flag })}>
              {intl.get('smodr.invoiceRecord.view.advanceQuery').d('高级筛选')}
              {flag ? <Icon type="up" /> : <Icon type="down" />}
            </Button>
          </Form.Item>
        </div>
        {flag && (
          <Form className={styles['search-form']}>
            <Form.Item
              label={intl.get('smodr.invoiceRecord.view.newGatherCompany').d('供应商')}
              {...formLineLayout}
            >
              {getFieldDecorator('companyId')(
                <Radio.Group
                  defaultValue="1"
                  buttonStyle="solid"
                  onChange={(e) => this.handleSearch(e.target.value || '', 'companyId')}
                >
                  <Radio.Button>{intl.get('smodr.invoiceRecord.view.all').d('全部')}</Radio.Button>
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
                  {companyList.length > 2 && (
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
                      {intl.get('smodr.invoiceRecord.view.more').d('更多')}
                    </Lov>
                  )}
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('smodr.invoiceRecord.view.newPurchaseCompany').d('采购方')}
              {...formLineLayout}
            >
              {getFieldDecorator('purchaseCompanyId')(
                <Radio.Group
                  defaultValue="1"
                  buttonStyle="solid"
                  onChange={(e) => this.handleSearch(e.target.value || '', 'purchaseCompanyId')}
                >
                  <Radio.Button>{intl.get('smodr.acceptOrder.view.all').d('全部')}</Radio.Button>
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
                  {purchaseCompanyList.length > 2 && (
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
                      {intl.get('smodr.invoiceRecord.view.more').d('更多')}
                    </Lov>
                  )}
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('smodr.invoiceRecord.view.invoiceTypeCode').d('发票类型')}
              {...formLineLayout}
            >
              {getFieldDecorator('invoiceTypeCode')(
                <Radio.Group
                  defaultValue="1"
                  buttonStyle="solid"
                  onChange={(e) => this.handleSearch(e.target.value || '', 'invoiceTypeCode')}
                >
                  <Radio.Button>{intl.get('smodr.invoiceRecord.view.all').d('全部')}</Radio.Button>
                  {invoiceTypes &&
                    invoiceTypes.map((item) => (
                      <Radio.Button key={item.value} value={item.value}>
                        {item.meaning}
                      </Radio.Button>
                    ))}
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('smodr.invoiceRecord.model.validityStatusMeaning').d('有效性')}
              {...formLineLayout}
            >
              {getFieldDecorator('validityStatus')(
                <Radio.Group
                  defaultValue="1"
                  buttonStyle="solid"
                  onChange={(e) => this.handleSearch(e.target.value || '', 'validityStatus')}
                >
                  <Radio.Button>{intl.get('smodr.invoiceRecord.view.all').d('全部')}</Radio.Button>
                  {invoiceStatus &&
                    invoiceStatus.map((item) => (
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
                  label={intl.get('smodr.invoiceRecord.view.queryDateCode').d('开票时间')}
                  {...formDateLineLayout}
                >
                  {getFieldDecorator('queryDateCode')(
                    <Radio.Group
                      defaultValue="1"
                      onChange={(e) => this.handleSearch(e.target.value || '', 'queryDateCode')}
                      buttonStyle="solid"
                    >
                      <Radio.Button>
                        {intl.get('smodr.invoiceRecord.view.all').d('全部')}
                      </Radio.Button>
                      <Radio.Button value="withinOneWeek">
                        {intl.get('smodr.invoiceRecord.view.oneWeek').d('一周内')}
                      </Radio.Button>
                      <Radio.Button value="withinOneMonth">
                        {intl.get('smodr.invoiceRecord.view.oneMonth').d('一个月内')}
                      </Radio.Button>
                      <Radio.Button value="withinThreeMonth">
                        {intl.get('smodr.invoiceRecord.view.threeMonth').d('三个月内')}
                      </Radio.Button>
                      <Radio.Button value="withinOneYear">
                        {intl.get('smodr.invoiceRecord.view.oneYear').d('一年内')}
                      </Radio.Button>
                      <Radio.Button value="all">
                        {intl.get('smodr.invoiceRecord.view.custom').d('自定义')}
                      </Radio.Button>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
              {!!dateFlag && (
                <Col span={12}>
                  <div className="date-line">
                    <Form.Item
                      label={intl.get('smodr.invoiceRecord.view.from').d('从')}
                      {...formLayout}
                    >
                      {getFieldDecorator('queryDateFrom', { initialValue: '' })(
                        <DatePicker
                          showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
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
                    <Form.Item
                      label={intl.get('smodr.invoiceRecord.view.to').d('至')}
                      {...formLayout}
                    >
                      {getFieldDecorator('queryDateTo', { initialValue: '' })(
                        <DatePicker
                          showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
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
                      {intl.get('smodr.invoiceRecord.view.reset').d('重置')}
                    </Button>
                    <Button onClick={this.searchData} type="primary">
                      {intl.get('smodr.invoiceRecord.view.query').d('查询')}
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
