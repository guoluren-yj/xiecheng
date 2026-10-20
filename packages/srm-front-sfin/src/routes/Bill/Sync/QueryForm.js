/**
 * QueryForm - 我的采购账单 - 查询表单
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import ValueList from 'components/ValueList';
import MoreFieldsDrawer from './MoreFieldsDrawer';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 表单布局属性
 */
const formItemProps = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      moreFieldsVisible: false, // 查询框显示/隐藏标记
    };
  }

  /**
   * 查询数据
   */
  @Bind()
  queryData() {
    const { onQueryNoConsignment } = this.props;
    if (onQueryNoConsignment) {
      onQueryNoConsignment();
    }
  }

  @Bind()
  handleFormReset() {
    const { onHandleFormReset, form } = this.props;
    if (onHandleFormReset) {
      onHandleFormReset();
    }
    form.resetFields();
  }

  /**
   * 更多条件查询滑窗显示
   * @param {boolean} [flag = false] - 显示标记
   */
  @Bind()
  handleMoreFields(flag = false) {
    this.setState({ moreFieldsVisible: flag });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { form, codes } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { moreFieldsVisible } = this.state;
    const organizationId = getCurrentOrganizationId();

    const moreFieldsProps = {
      form,
      codes,
      visible: moreFieldsVisible,
      onSearch: this.queryData,
      onReset: this.handleFormReset,
      onHideDrawer: this.handleMoreFields,
    };

    return (
      <React.Fragment>
        <div className="table-list-search">
          <Form layout="inline">
            <Row gutter={24}>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl
                        .get('sfin.invoiceBill.model.invoiceBill.sync.billNum')
                        .d('开票单号')}
                    >
                      {getFieldDecorator('displayBillNum')(<Input inputChinese={false} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemProps}
                      label={intl.get('entity.company.sync.tag').d('公司')}
                    >
                      {getFieldDecorator('companyId')(
                        <Lov
                          style={{ width: '100%' }}
                          code="SPFM.USER_AUTHORITY_COMPANY"
                          queryParams={{ organizationId }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemProps}
                      label={intl
                        .get(`sfin.invoiceBill.model.invoiceBill.sync.syncStatusMeaning`)
                        .d('导入状态')}
                    >
                      {getFieldDecorator('syncStatus')(
                        <ValueList lovCode="SPUC.BILL_SYNC_STATUS" lazyLoad={false} allowClear />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={() => this.handleMoreFields(true)}>
                    {intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.queryData}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        <MoreFieldsDrawer {...moreFieldsProps} />
      </React.Fragment>
    );
  }
}
