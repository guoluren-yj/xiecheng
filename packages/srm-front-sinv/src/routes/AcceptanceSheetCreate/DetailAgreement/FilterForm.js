import React, { Component } from 'react';
import { Form, Button, Row, Col, Input, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import Lov from 'components/Lov';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@cacheComponent({ cacheKey: '/sinv/acceptance-check/list' })
@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = { isRowCollapsed: false, organizationId: getCurrentOrganizationId() };
  }

  /**
   * 重置查询表单
   * @param {*} e
   */
  @Bind()
  handleResetBtnClick(e) {
    e.preventDefault();
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询表单-查询
   * @param {*} e
   */
  @Bind()
  handleSearchBtnClick(e) {
    e.preventDefault();
    const { onSearch } = this.props;
    onSearch();
  }

  /**
   * toggleForm - 查询条件展开/收起
   */
  @Bind()
  toggleForm() {
    const { isRowCollapsed } = this.state;
    this.setState({
      isRowCollapsed: !isRowCollapsed,
    });
  }

  render() {
    const { isRowCollapsed, organizationId } = this.state;
    const { form, headerInfo } = this.props;
    const { sourceCode, acceptBaseCode } = headerInfo;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              {sourceCode === 'ORDER' ? (
                <Col span={8}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.orderNumber`).d('订单号')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('poNum')(<Input />)}
                  </FormItem>
                </Col>
              ) : (
                <Col span={8}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.pcNum`).d('协议编号')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('pcNum')(<Input />)}
                  </FormItem>
                </Col>
              )}
              {sourceCode === 'ORDER' ? (
                <Col span={8}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.orderList`).d('订单行号')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('poLineNum')(<Input />)}
                  </FormItem>
                </Col>
              ) : (
                <Col span={8}>
                  <FormItem
                    label={intl.get(`sinv.acceptanceSheetCreate.model.pcName`).d('协议名称')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('pcName')(<Input />)}
                  </FormItem>
                </Col>
              )}

              <Col span={8}>
                <FormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('itemId')(
                    <Lov allowClear code="SPUC.ACCEPT_ITEM" queryParams={{ organizationId }} />
                  )}
                </FormItem>
              </Col>
            </Row>
            {isRowCollapsed && (
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                {sourceCode === 'ORDER' ? (
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.releaseDateStart`)
                        .d('发布日期从')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('releaseDateStart')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('releaseDateEnd') &&
                            moment(getFieldValue('releaseDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                ) : (
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.createDateFrom`)
                        .d('创建日期从')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('createDateFrom')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('acceptDateEnd') &&
                            moment(getFieldValue('acceptDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                )}
                {sourceCode === 'ORDER' ? (
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.releaseDateEnd`)
                        .d('发布日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('releaseDateEnd')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('releaseDateStart') &&
                            moment(getFieldValue('releaseDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                ) : (
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.createDateTo`)
                        .d('创建日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('createDateTo')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('acceptDateEnd') &&
                            moment(getFieldValue('acceptDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                )}

                {sourceCode === 'ORDER' ? (
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.confirmDateStart`)
                        .d('确认日期从')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('confirmDateStart')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('confirmDateEnd') &&
                            moment(getFieldValue('confirmDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                ) : (
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sinv.acceptanceSheetCreate.model.pcTypeCode`).d('协议类型')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('pcTypeId')(
                        <Lov
                          allowClear
                          code="SPCM.PC_TYPE"
                          queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
                          // lovOptions={{
                          //   valueField: 'userName',
                          //   displayField: 'userName',
                          // }}
                        />
                      )}
                    </FormItem>
                  </Col>
                )}
              </Row>
            )}
            {isRowCollapsed && (
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                {sourceCode === 'ORDER' ? (
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.confirmDateEnd`)
                        .d('确认日期至')}
                    >
                      {getFieldDecorator('confirmDateEnd')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('confirmDateStart') &&
                            moment(getFieldValue('confirmDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                ) : (
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.effectiveDateFrom`)
                        .d('生效日期从')}
                    >
                      {getFieldDecorator('effectiveDateFrom')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('acceptDateEnd') &&
                            moment(getFieldValue('acceptDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                )}
                {sourceCode === 'ORDER' ? (
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sinv.acceptanceSheetCreate.model.agentName`).d('采购员')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('agentId')(
                        <Lov
                          allowClear
                          code="SPFM.USER_AUTH.PURCHASE_AGENT"
                          queryParams={{ organizationId }}
                        />
                      )}
                    </FormItem>
                  </Col>
                ) : (
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.effectiveDateTo`)
                        .d('生效日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('effectiveDateTo')(
                        <DatePicker
                          format={getDateFormat()}
                          style={{ width: '100%' }}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('acceptDateStart') &&
                            moment(getFieldValue('acceptDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                )}
                {sourceCode === 'ORDER' ? null : (
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sinv.acceptanceSheetCreate.model.pcSourceCode`)
                        .d('来源单据编号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('pcSourceCode')(<Input />)}
                    </FormItem>
                  </Col>
                )}
                {sourceCode === 'CONTRACT' && acceptBaseCode === 'STAGE' && (
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sinv.acceptanceSheetCreate.model.stageName`).d('协议阶段')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('stageName')(<Input maxLength={120} />)}
                    </FormItem>
                  </Col>
                )}
              </Row>
            )}
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {isRowCollapsed
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleResetBtnClick}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearchBtnClick}
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
