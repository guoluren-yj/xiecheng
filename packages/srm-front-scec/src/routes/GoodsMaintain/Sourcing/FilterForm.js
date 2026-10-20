/**
 * GoodsMaintain -Sourcing 商品维护-寻源 查询页面
 * @date: 2019-2-21
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input, Icon, Button, DatePicker } from 'hzero-ui';
import moment from 'moment';

import { isFunction } from 'lodash';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      display: true,
    };
  }

  /**
   * 查询
   */
  @Bind()
  handlerSearch() {
    const { onFetchData } = this.props;
    if (isFunction(onFetchData)) {
      onFetchData();
    }
  }

  /**
   * 重置
   */
  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
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

  /* 选择公司Lov
   * @param {String} val 当前值
   * @param {Object} record 选择值
   */
  @Bind()
  selectCompany() {
    this.props.form.resetFields(['supplierCompanyId']);
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { display, tenantId } = this.state;
    return (
      <div className="table-list-search">
        <React.Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('scec.common.model.sourceNum').d('寻源单号')}
                      {...formlayout}
                    >
                      {getFieldDecorator('sourceNum')(
                        <Input trim typeCase="upper" inputChinese={false} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('scec.common.model.itemCode').d('物料编码')}
                      {...formlayout}
                    >
                      {getFieldDecorator('itemCode')(
                        <Input trim typeCase="upper" inputChinese={false} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('scec.common.model.itemName').d('物料名称')}
                      {...formlayout}
                    >
                      {getFieldDecorator('itemName')(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('scec.common.model.company').d('公司')}
                      {...formlayout}
                    >
                      {getFieldDecorator('companyId')(
                        <Lov
                          code="HPFM.COMPANY"
                          queryParams={{ tenantId }}
                          onChange={() => this.selectCompany()}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('scec.common.model.supplier').d('供应商')}
                      {...formlayout}
                    >
                      {getFieldDecorator('supplierCompanyId')(
                        <Lov
                          code="SCEC.COMPANY_SUPPLIER"
                          disabled={!getFieldValue('companyId')}
                          queryParams={{
                            companyId: getFieldValue('companyId'),
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('scec.common.model.effectiveDateFrom').d('有效期从')}
                      {...formlayout}
                    >
                      {getFieldDecorator('quotationExpiryDateFrom')(
                        <DatePicker
                          showTime={{ format: DEFAULT_DATETIME_FORMAT }}
                          disabledDate={currentDate =>
                            getFieldValue('quotationExpiryDateTo') &&
                            moment(getFieldValue('quotationExpiryDateTo')).isBefore(
                              currentDate,
                              'day'
                            )
                          }
                          format={DEFAULT_DATETIME_FORMAT}
                          placeholder=""
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('scec.common.model.effectiveDateTo').d('有效期至')}
                      {...formlayout}
                    >
                      {getFieldDecorator('quotationExpiryDateTo')(
                        <DatePicker
                          showTime={{ format: DEFAULT_DATETIME_FORMAT }}
                          disabledDate={currentDate =>
                            getFieldValue('quotationExpiryDateFrom') &&
                            moment(getFieldValue('quotationExpiryDateFrom')).isAfter(
                              currentDate,
                              'day'
                            )
                          }
                          format={DEFAULT_DATETIME_FORMAT}
                          placeholder=""
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handlerSearch}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                  <Button
                    data-code="reset"
                    style={{ marginLeft: 8 }}
                    onClick={this.handlerFormReset}
                  >
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <a
                    style={{ marginLeft: 8, display: display ? 'none' : 'inline-block' }}
                    onClick={() => this.toggleForm()}
                  >
                    {intl.get(`hzero.common.button.up`).d('收起')} <Icon type="up" />
                  </a>
                  <a
                    style={{ marginLeft: 8, display: display ? 'inline-block' : 'none' }}
                    onClick={() => this.toggleForm()}
                  >
                    {intl.get(`hzero.common.button.expand`).d('展开')} <Icon type="down" />
                  </a>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </React.Fragment>
      </div>
    );
  }
}
