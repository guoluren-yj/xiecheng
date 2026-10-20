import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import DelCache from '@/components/DelCache';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId } from 'utils/utils';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@DelCache({ cacheKey: '/small/mall-protocol-management/list7' })
@cacheComponent({ cacheKey: '/small/mall-protocol-management/list7' })
export default class FilterList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  @Bind()
  handlerFormReset() {
    const { form, onReset, onHandleChange } = this.props;
    const params = {
      agreementName: undefined,
      skuId: undefined,
      skuName: undefined,
      itemName: undefined,
      itemId: undefined,
      itemCategoryName: undefined,
      companyName: undefined,
      companyId: undefined,
      supplierCompanyName: undefined,
      supplierCompanyId: undefined,
      agreementStatus: undefined,
      hasSkuFlag: undefined,
      creationDateFrom: undefined,
      creationDateTo: undefined,
      validDateFrom: undefined,
      validDateTo: undefined,
    };
    form.resetFields();
    onReset();
    onHandleChange(params, true);
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
    const { activeKey, onSearch, onSearchLine } = this.props;
    if (activeKey === 'a') {
      onSearch();
    } else {
      onSearchLine();
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      dataValue = {},
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
                })(<Input onChange={(e) => onHandleChange({ agreementName: e.target.value })} />)}
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label={intl.get('small.common.model.product').d('商品')} {...formlayout}>
                {getFieldDecorator('skuName', { initialValue: dataValue.skuName })}
                {getFieldDecorator('skuId', {
                  initialValue: dataValue.skuId,
                })(
                  <Lov
                    allowClear
                    code="SMPC.CATA_PUR_SKU"
                    textValue={getFieldValue('skuName')}
                    queryParams={{ tenantId: getCurrentOrganizationId() }}
                    onChange={(_, record) =>
                      onHandleChange({ skuId: record.skuId, skuName: record.skuName })
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('small.common.view.itemCodeAndName').d('物料编码/名称')}
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
