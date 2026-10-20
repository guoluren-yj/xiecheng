import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { getDateFormat } from 'utils/utils';
import moment from 'moment';
import intl from 'utils/intl';
import SearchDrawer from './SearchDrawer';

const FormItem = Form.Item;

// const commonPrompt = 'hzero.common';

const formItemLayout = {
  labelCol: { span: 11 },
  wrapperCol: { span: 13 },
};

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      moreSearchParams: false,
    };
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  /**
   * 打开滑窗搜索
   */
  @Bind()
  handleSearchMore() {
    this.setState({ moreSearchParams: false }, this.handleSearch());
  }

  /**
   * 改变滑窗Visible
   * @param {String} field
   * @param {Boolean} flag
   */
  @Bind()
  handleMoreParamsVisible(field, flag) {
    // const { form: { setFieldsValue } } = this.props;
    this.setState({ [field]: !!flag });
    // if (flag) {
    //   const currentDateTime = isFunction(currentDate.valueOf) ? currentDate.valueOf() : null;
    //   if (!currentDateTime) {
    //     return;
    //   }
    //   // 将半年的时间单位换算成毫秒
    //   const halfYear = (currentDate.isLeapYear() ? 366 : 365) / 2 * 24 * 3600 * 1000;
    //   const pastResult = currentDateTime - halfYear; // 半年前的时间（毫秒单位）
    //   setFieldsValue({ trxDateFrom: moment(pastResult) });
    // }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 关闭滑窗搜索
   */
  @Bind()
  handleHideDrawer() {
    this.handleMoreParamsVisible('moreSearchParams', false);
  }

  render() {
    const { form, specialInventory, customizeForm = () => {} } = this.props;
    const { moreSearchParams } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const searchDrawerProps = {
      form,
      customizeForm,
      specialInventory,
      visible: moreSearchParams,
      onHideDrawer: this.handleHideDrawer,
      onSearch: this.handleSearchMore,
      onReset: this.handleFormReset,
    };
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sinv.common.model.common.displayTrxNum`).d('事务编号')}
              >
                {getFieldDecorator('displayTrxNum')(
                  <Input trim typeCase="upper" inputChinese={false} />
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sinv.common.model.common.displaySourcePoNum`).d('来源订单号')}
              >
                {getFieldDecorator('displayPoNum')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号')}
              >
                {getFieldDecorator('displayLineNum')(<Input />)}
              </FormItem>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sinv.common.model.common.displayTrxLineNum`).d('事务行号')}
              >
                {getFieldDecorator('displayTrxLineNum')(<Input />)}
              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sinv.common.model.common.trxDateFrom`).d('事务日期从')}
              >
                {getFieldDecorator('trxDateFrom')(
                  <DatePicker
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={(currentDate) =>
                      getFieldValue('trxDateTo') &&
                      moment(getFieldValue('trxDateTo')).isBefore(currentDate, 'day')
                    }
                  />
                )}
              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sinv.common.model.common.trxDateTo`).d('事务日期至')}
              >
                {getFieldDecorator('trxDateTo')(
                  <DatePicker
                    disabledDate={(currentDate) =>
                      getFieldValue('trxDateFrom') &&
                      moment(getFieldValue('trxDateFrom')).isAfter(currentDate, 'day')
                    }
                    format={getDateFormat()}
                    placeholder={null}
                  />
                )}
              </FormItem>
            </Col>

            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button
                  data-code="reset"
                  onClick={() => this.handleMoreParamsVisible('moreSearchParams', true)}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
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
              </FormItem>
            </Col>
          </Row>
        </Form>
        <SearchDrawer {...searchDrawerProps} />
      </div>
    );
  }
}
