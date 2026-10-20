/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Button } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  filterNullValueObject,
  getUserOrganizationId,
  getCurrentOrganizationId,
} from 'utils/utils';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getUserOrganizationId(),
      tenantId: getCurrentOrganizationId(),
      searchValues: {
        itemId: '',
        itemCode: '',
      },
    };
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchDetailList = (e) => e,
      form: { getFieldsValue = (e) => e },
      pagination = { pageSize: 10, current: 1 },
    } = this.props;
    const { searchValues } = this.state;
    const { itemId, itemCode } = searchValues;
    const data = filterNullValueObject(getFieldsValue()) || {};
    fetchDetailList(
      {
        ...data,
        size: pagination.pageSize,
        page: pagination.current - 1,
      },
      filterNullValueObject({
        itemId,
        itemCode,
      })
    );
  }

  /**
   * onReset - 重置按钮事件
   */
  onReset() {
    const {
      form: { resetFields = (e) => e },
    } = this.props;
    resetFields();
    this.setState({
      searchValues: {
        itemId: '',
        itemCode: '',
      },
    });
  }

  handleItemCodeChange = (value, record) => {
    const { itemId, itemCode } = record || {};
    this.setState({
      searchValues: {
        itemId,
        itemCode,
      },
    });
  };

  render() {
    const { form = {}, quoteSourceFlag } = this.props;
    const { organizationId, tenantId } = this.state;
    const { getFieldDecorator = (e) => e } = form;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={
                    quoteSourceFlag
                      ? intl.get(`spcm.common.model.common.sourceNum`).d('寻源单号')
                      : intl.get(`sodr.quotePurchase.model.quotePurchase.applyPoNum`).d('申请编码')
                  }
                >
                  {getFieldDecorator('displayPrNum')(
                    <Input typeCase="upper" inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.quotePurchase.model.quotePurchase.lineNum`).d('行号')}
                >
                  {getFieldDecorator('displayPrLineNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.quotePurchase.model.quotePurchase.itemCode`).d('物料编码')}
                >
                  {getFieldDecorator('itemId')(
                    <Lov
                      style={{ width: '156px' }}
                      code="SPRM.ITEM"
                      queryPrams={{ organizationId, tenantId }}
                      lovOptions={{ valueField: 'partnerItemId', displayField: 'itemCode' }}
                      onChange={(value, record) => {
                        this.handleItemCodeChange(value, record);
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button data-code="reset" onClick={this.onReset.bind(this)}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.onClick.bind(this)}
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
