import React, { PureComponent } from 'react';
import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId } from 'utils/utils';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';

const { Option } = Select;
const tenantId = getCurrentOrganizationId();

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/spfm/certification-tenant-approval' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['setDisabledDateFrom', 'setDisabledDateTo', 'onClick', 'onReset'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
    this.state = {
      display: false,
    };
  }

  @Bind()
  onClick() {
    const {
      handleQueryList = (e) => e,
      form: { getFieldsValue = (e) => e },
    } = this.props;
    const data = getFieldsValue() || {};
    handleQueryList(data);
  }

  @Bind()
  onReset() {
    const {
      handleQueryList = (e) => e,
      form: { resetFields = (e) => e },
    } = this.props;
    const params = { page: 0, size: 10 };
    resetFields();
    handleQueryList(params);
  }

  @Bind()
  setDisabledDateFrom(currentDate) {
    const {
      form: { getFieldValue = (e) => e },
    } = this.props;
    const processDateTo = getFieldValue('processDateTo');
    return (
      currentDate &&
      processDateTo &&
      moment(currentDate.format(`${DEFAULT_DATE_FORMAT} 00:00:00`)).valueOf() >
        moment(processDateTo.format(`${DEFAULT_DATE_FORMAT} 00:00:00`)).valueOf()
    );
  }

  @Bind()
  setDisabledDateTo(currentDate) {
    const {
      form: { getFieldValue = (e) => e },
    } = this.props;
    const processDateFrom = getFieldValue('processDateFrom');
    return (
      currentDate &&
      processDateFrom &&
      moment(currentDate.format(`${DEFAULT_DATE_FORMAT} 00:00:00`)).valueOf() <
        moment(processDateFrom.format(`${DEFAULT_DATE_FORMAT} 00:00:00`)).valueOf()
    );
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      form: { getFieldDecorator = (e) => e },
      processing = {},
      registrationSource = [],
    } = this.props;
    const { display } = this.state;
    return (
      // <Form layout="inline">
      //   <FormItem
      //     label={intl
      //       .get('spfm.certificationApproval.model.certification.companyName')
      //       .d('企业名称')}
      //   >
      //     {getFieldDecorator('companyName')(<Input dbc2sbc={false} />)}
      //   </FormItem>
      //   <FormItem
      //     label={intl
      //       .get('spfm.certificationApproval.model.certification.DateFrom')
      //       .d('提交时间从')}
      //   >
      //     {getFieldDecorator('processDateFrom')(
      //       <DatePicker placeholder={null} disabledDate={this.setDisabledDateFrom} />
      //     )}
      //   </FormItem>
      //   <FormItem
      //     label={intl
      //       .get('spfm.certificationApproval.model.certification.processDateTo')
      //       .d('提交时间至')}
      //   >
      //     {getFieldDecorator('processDateTo')(
      //       <DatePicker placeholder={null} disabledDate={this.setDisabledDateTo} />
      //     )}
      //   </FormItem>
      //   <FormItem>
      //     <Button onClick={this.onReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
      //   </FormItem>
      //   <FormItem>
      //     <Button
      //       type="primary"
      //       disabled={processing.approval}
      //       onClick={this.onClick}
      //       htmlType="submit"
      //     >
      //       {intl.get('hzero.common.button.search').d('查询')}
      //     </Button>
      //   </FormItem>
      // </Form>
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl
                      .get('spfm.certificationApproval.model.certification.companyName')
                      .d('企业名称')}
                  >
                    {getFieldDecorator('companyName')(<Input dbc2sbc={false} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl
                      .get('spfm.certificationApproval.model.certification.DateFrom')
                      .d('申请时间从')}
                  >
                    {getFieldDecorator('processDateFrom')(
                      <DatePicker
                        placeholder={null}
                        disabledDate={this.setDisabledDateFrom}
                        format={DEFAULT_DATETIME_FORMAT}
                        showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                        style={{ width: '100%' }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl
                      .get('spfm.certificationApproval.model.certification.processDateTo')
                      .d('申请时间至')}
                  >
                    {getFieldDecorator('processDateTo')(
                      <DatePicker
                        placeholder={null}
                        disabledDate={this.setDisabledDateTo}
                        format={DEFAULT_DATETIME_FORMAT}
                        showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                        style={{ width: '100%' }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: !display ? 'none' : 'block' }}>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl
                      .get(`spfm.certificationApproval.model.certification.purchaseAgentName`)
                      .d('采购员')}
                  >
                    {getFieldDecorator('purchaseAgentId')(
                      <LovMulti
                        delimma=","
                        code="SPFM.TENANT_PURCHASE_AGENT"
                        queryParams={{ tenantId }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl
                      .get(`spfm.certificationApproval.model.certification.registrationSource`)
                      .d('注册来源')}
                  >
                    {getFieldDecorator('supRegisteredSource')(
                      <Select allowClear>
                        {registrationSource.map((item) => (
                          <Option value={item.value}>{item.meaning}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                {!display ? (
                  <Button onClick={this.toggleForm}>
                    {intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                ) : (
                  <Button onClick={this.toggleForm}>
                    {intl.get('hzero.common.button.collected').d('收起查询')}
                  </Button>
                )}
                <Button data-code="reset" onClick={this.onReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  type="primary"
                  disabled={processing.approval}
                  onClick={this.onClick}
                  htmlType="submit"
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
