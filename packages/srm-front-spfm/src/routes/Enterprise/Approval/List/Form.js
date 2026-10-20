import React, { PureComponent } from 'react';
import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import {
  DEFAULT_DATE_FORMAT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';

const FormItem = Form.Item;
const { Option } = Select;
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['setDisabledDateFrom', 'setDisabledDateTo', 'onClick', 'onReset'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
    this.state = {
      isExpendSearch: false,
    };
  }

  @Bind()
  onClick() {
    const { handleQueryList } = this.props;
    handleQueryList();
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
   * @function handleExpendSearch - 显示高级查询条件
   * @param {boolean} flag - 显示高级查询标识
   */
  @Bind()
  handleExpendSearch() {
    const { isExpendSearch } = this.state;
    this.setState({ isExpendSearch: !isExpendSearch });
  }

  render() {
    const {
      form: { getFieldDecorator = (e) => e },
      processing = {},
      approvalMethod = [],
    } = this.props;
    const { isExpendSearch } = this.state;
    return (
      <Form>
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_4_LAYOUT}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.certificationApproval.model.certification.companyName')
                    .d('企业名称')}
                >
                  {getFieldDecorator('companyName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
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
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
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
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: isExpendSearch ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('spfm.registerEnterprise.model.view.tenantApproval')
                    .d('审批方式')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('tenantApproval', { initialValue: '0' })(
                    <Select>
                      {approvalMethod.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('spfm.registerEnterprise.model.view.tenantName')
                    .d('注册域名所属租户')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('tenantName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleExpendSearch}>
                {isExpendSearch
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.onReset}>
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
    );
  }
}
