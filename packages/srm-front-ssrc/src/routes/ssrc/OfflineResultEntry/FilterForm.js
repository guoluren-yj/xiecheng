import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { isEmpty, isObject } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';
import { onBeforeMenuTabRemove, getActiveTabKey } from 'utils/menuTab';

import { getFilterDataRangeDefaultValue } from '@/utils/utils';
import { INQUIRY, BID } from '@/utils/globalVariable';
import { getCacheContent, setCacheContent, getCacheKey, deleteCache } from './utils';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const promptCode = 'ssrc.offlineResultEntry';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    display: false,
  };

  componentDidMount() {
    const { form, sourceKey = '' } = this.props;
    const cacheCode =
      sourceKey === BID
        ? 'SSRC.BID_OFFLINE_RESULT_LIST_FILTER_FORM'
        : 'SSRC.OFFLINE_RESULT_LIST_FILTER_FORM';
    const content = getCacheContent(cacheCode) || null;
    if (form && content) {
      let mayNotMountField = true;
      if (isObject(content)) {
        Object.keys(content).forEach((item) => {
          mayNotMountField = mayNotMountField && !form.getFieldInstance(item);
          form.registerField(item);
        });
      }
      const cb = () => {
        if (mayNotMountField) {
          setTimeout(() => {
            Object.keys(content).forEach((item) => {
              mayNotMountField = mayNotMountField && !form.getFieldInstance(item);
            });
            cb();
          }, 100);
          return;
        }

        if (content.__LOV_TEXT_FIELD__) {
          Object.keys(content.__LOV_TEXT_FIELD__).forEach((k) => {
            const instance = form.getFieldInstance(k);
            if (
              instance?.state?.lov &&
              instance?.props?.code &&
              !instance?.props?.textField &&
              !instance?.state?.text
            ) {
              instance.setState({ text: content.__LOV_TEXT_FIELD__[k] });
            }
          });
        }
      };
      form.setFieldsValue(content, cb);
    }
    onBeforeMenuTabRemove(getActiveTabKey(), () => {
      const cacheKey = getCacheKey(cacheCode);
      setTimeout(() => {
        deleteCache(cacheKey);
      });
    });
  }

  componentWillUnmount() {
    const { form = {}, sourceKey = '' } = this.props;
    const cacheCode =
      sourceKey === BID
        ? 'SSRC.BID_OFFLINE_RESULT_LIST_FILTER_FORM'
        : 'SSRC.OFFLINE_RESULT_LIST_FILTER_FORM';
    if (form) {
      const { getFieldsValue, getFieldInstance } = form;
      const content = getFieldsValue();
      const __LOV_TEXT_FIELD__ = {};
      Object.keys(content).forEach((k) => {
        const instance = getFieldInstance(k);
        if (!!instance?.state?.lov && !!instance?.props?.code && !instance?.props?.textField) {
          __LOV_TEXT_FIELD__[k] = instance?.state?.text;
        }
      });
      if (!isEmpty(__LOV_TEXT_FIELD__)) {
        content.__LOV_TEXT_FIELD__ = __LOV_TEXT_FIELD__;
      }
      setCacheContent(cacheCode, content);
    }
  }

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
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
      form,
      sourceKey = INQUIRY,
      customizeFilterForm,
      sourceMethod = [],
      sourceCategory = [],
      auctionDirection = [],
      quotationType = [],
    } = this.props;
    const { getFieldDecorator } = form;
    const { display } = this.state;

    const createFromValueSet = getFilterDataRangeDefaultValue();

    return (
      <React.Fragment>
        {customizeFilterForm(
          {
            code: `SSRC.${sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.FILTER`,
            form,
            expand: display,
          },
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      label={
                        sourceKey === INQUIRY
                          ? intl.get(`${promptCode}.model.offlineEntry.RFXNo.`).d('RFx单号')
                          : intl.get(`${promptCode}.model.offlineEntry.BIDNo.`).d('招标编号')
                      }
                      {...formLayout}
                    >
                      {getFieldDecorator('rfxNum')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.offlineEntry.pruchOrg`).d('采购组织')}
                      {...formLayout}
                    >
                      {getFieldDecorator('purOrganizationId')(
                        <Lov code="SPFM.USER_AUTH.PURORG" textField="organizationName" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label={intl.get('ssrc.common.company').d('公司')} {...formLayout}>
                      {getFieldDecorator('companyId')(
                        <Lov code="SPFM.USER_AUTH.COMPANY" textField="companyName" />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'block' : 'none' }}>
                  <Col span={8}>
                    <FormItem
                      label={
                        sourceKey === INQUIRY
                          ? intl
                              .get(`${promptCode}.model.offlineEntry.inquiryTitle`)
                              .d('询价单标题')
                          : intl.get(`${promptCode}.model.offlineEntry.newBidTitle`).d('招标事项')
                      }
                      {...formLayout}
                    >
                      {getFieldDecorator('rfxTitle')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.offlineEntry.createdUnitName`)
                        .d('创建人部门')}
                      {...formLayout}
                    >
                      {getFieldDecorator('createdUnitName')(<Input maxLength={40} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                      {...formLayout}
                    >
                      {getFieldDecorator('creationDateFrom', {
                        initialValue: createFromValueSet[0],
                      })(
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder=""
                          format={getDateFormat()}
                          disabledDate={(currentDate) =>
                            form.getFieldValue('creationDateTo') &&
                            moment(form.getFieldValue('creationDateTo')).isBefore(
                              currentDate,
                              'day'
                            )
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.offlineEntry.creationDateTo`)
                        .d('创建日期至')}
                      {...formLayout}
                    >
                      {getFieldDecorator('creationDateTo', {
                        initialValue: createFromValueSet[1],
                      })(
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder=""
                          format={getDateFormat()}
                          disabledDate={(currentDate) =>
                            form.getFieldValue('creationDateFrom') &&
                            moment(form.getFieldValue('creationDateFrom')).isAfter(
                              currentDate,
                              'day'
                            )
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.offlineEntry.sourcingApproach`)
                        .d('寻源方式')}
                      {...formLayout}
                    >
                      {getFieldDecorator('sourceMethod')(
                        <Select allowClear>
                          {sourceMethod &&
                            sourceMethod.map((item) => (
                              <Option key={item.meaning} value={item.value}>
                                {item.meaning}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.offlineEntry.quotationType`)
                        .d('报价方式')}
                      {...formLayout}
                    >
                      {getFieldDecorator('quotationType')(
                        <Select allowClear>
                          {quotationType &&
                            quotationType.map((item) => (
                              <Option key={item.value} value={item.value}>
                                {item.meaning}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  {sourceKey === INQUIRY ? (
                    <Col span={8}>
                      <FormItem
                        label={intl
                          .get(`${promptCode}.model.offlineEntry.sourcingCategory`)
                          .d('寻源类别')}
                        {...formLayout}
                      >
                        {getFieldDecorator('sourceCategory')(
                          <Select allowClear>
                            {sourceCategory &&
                              sourceCategory.map((item) => (
                                <Option key={item.meaning} value={item.value}>
                                  {item.meaning}
                                </Option>
                              ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  ) : null}
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.offlineEntry.biddingDirection`)
                        .d('报价方向')}
                      {...formLayout}
                    >
                      {getFieldDecorator('auctionDirection')(
                        <Select allowClear>
                          {auctionDirection &&
                            auctionDirection.map((item) => (
                              <Option key={item.meaning} value={item.value}>
                                {item.meaning}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.offlineEntry.sourcingTemplate`)
                        .d('寻源模板')}
                      {...formLayout}
                    >
                      {getFieldDecorator('templateNum')(<Lov code="SSRC.TEMPLATE_CODE" />)}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleForm}>
                    {display
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleFormReset}>
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
        )}
      </React.Fragment>
    );
  }
}
