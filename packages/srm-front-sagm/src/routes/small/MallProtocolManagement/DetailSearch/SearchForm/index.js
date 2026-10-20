import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import DelCache from '@/components/DelCache';
// import { deleteCache } from 'components/CacheComponent';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@withRouter
@Form.create({ fieldNameProp: null })
@DelCache({ cacheKey: '/small/mall-protocol-management/list6' })
@cacheComponent({ cacheKey: '/small/mall-protocol-management/list6' })
export default class FilterList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  @Bind()
  handlerFormReset() {
    const { form, onReset, onHandleChange } = this.props;
    form.resetFields();
    onReset();
    onHandleChange(
      {
        agreementName: undefined,
        itemName: undefined,
        itemId: undefined,
        itemCategoryName: undefined,
        companyId: undefined,
        companyName: undefined,
        supplierCompanyId: undefined,
        supplierCompanyName: undefined,
        agreementStatus: undefined,
        effectiveFlag: undefined,
        hasSkuFlag: undefined,
        materialType: undefined,
        sourceFrom: undefined,
        validDateFrom: undefined,
        validDateTo: undefined,
        creationDateFrom: undefined,
        creationDateTo: undefined,
      },
      true
    );
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { onOpen } = this.props;
    if (onOpen) {
      onOpen();
    }
  }

  @Bind()
  handleSearch() {
    const { onSearchLine } = this.props;
    onSearchLine();
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      dataValue,
      onHandleChange,
    } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.view.agreementCodeAndName').d('协议编号/名称')}
                {...formlayout}
              >
                {getFieldDecorator('agreementName', {
                  initialValue: dataValue.agreementName,
                })(
                  <Input
                    value={dataValue.agreementName}
                    onChange={(e) => onHandleChange({ agreementName: e.target.value })}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.view.itemCodeAndName').d('物料编号/名称')}
                {...formlayout}
              >
                {getFieldDecorator('itemName', {
                  initialValue: dataValue.itemName,
                })}
                {getFieldDecorator('itemId', {
                  initialValue: dataValue.itemId,
                })(
                  <Lov
                    allowClear
                    code="SMAL.CUSTOMER_ITEM"
                    textField="itemName"
                    textValue={getFieldValue('itemName')}
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                    }}
                    onChange={(val, record) =>
                      onHandleChange({
                        itemId: val,
                        itemName: record.itemName,
                      })
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.view.itemCategory').d('物料分类')}
                {...formlayout}
              >
                {getFieldDecorator('itemCategoryName', {
                  initialValue: dataValue.itemCategoryName,
                })(
                  <Input
                    value={dataValue.itemCategoryName}
                    onChange={(e) => onHandleChange({ itemCategoryName: e.target.value })}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={() => this.toggleForm()}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button data-code="reset" onClick={this.handlerFormReset}>
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
      </div>
    );
  }
}
