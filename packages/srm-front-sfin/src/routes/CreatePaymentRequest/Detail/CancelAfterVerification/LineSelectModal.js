/**
 * index-新增发票行
 * @date: 2020-03-13
 * @author JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Button, DatePicker, Row, Col, Select } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import {
  SEARCH_FORM_ROW_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_4_LAYOUT,
  FORM_COL_2_LAYOUT,
} from 'utils/constants';

import List from './ListTable';

const FormItem = Form.Item;
const { Option } = Select;
const commonPrompt = 'sfin.payment.common';

@Form.create({ fieldNameProp: null })
export default class Creation extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * componentDidMount 生命周期函数
   * 获取数据
   */
  componentDidMount() {
    this.fetchModalList();
  }

  /**
   * fetchDetailModalList - 查询列表行数据
   * @param {object} page - 查询条件
   */
  @Bind()
  fetchModalList(page = {}) {
    const { onFetchModalList = e => e } = this.props;
    onFetchModalList(page);
  }

  /**
   * handleReset - 重置按钮事件
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form,
      loading,
      pagination,
      selectedRows,
      dataSource = [],
      onSelectedRowChange,
      paymentSourceType = [],
    } = this.props;
    const { getFieldDecorator = e => e, getFieldValue } = form;
    const listProps = {
      isFromModal: true,
      loading,
      pagination,
      dataSource,
      onSearch: this.fetchModalList,
      selectedRows,
      onSelectedRowChange,
    };
    return (
      <Fragment>
        <Form className="more-fields-search-form" style={{ marginBottom: 18 }}>
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_4_LAYOUT}>
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_2_LAYOUT}>
                  <FormItem
                    label={intl.get(`${commonPrompt}.paymentNum`).d('预付款申请单号')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('paymentNum')(<Input typeCase="upper" />)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_2_LAYOUT}>
                  <FormItem
                    label={intl.get(`${commonPrompt}.paymentSourceType`).d('付款类型')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('paymentSourceTypeCode')(
                      <Select allowClear style={{ width: '100%' }}>
                        {paymentSourceType.map(item => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_2_LAYOUT}>
                  <FormItem
                    label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('creationDateStart')(
                      <DatePicker
                        placeholder={null}
                        disabledDate={currentDate =>
                          getFieldValue('creationDateEnd') &&
                          moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_2_LAYOUT}>
                  <FormItem
                    label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('creationDateEnd')(
                      <DatePicker
                        placeholder={null}
                        disabledDate={currentDate =>
                          getFieldValue('creationDateStart') &&
                          moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
              <FormItem>
                <Button onClick={this.handleReset}>
                  {intl.get(`hzero.common.button.reset`).d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={this.fetchModalList}>
                  {intl.get(`hzero.common.button.search`).d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <List {...listProps} />
      </Fragment>
    );
  }
}
