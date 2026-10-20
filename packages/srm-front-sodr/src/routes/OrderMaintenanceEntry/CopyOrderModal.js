import React, { Component } from 'react';
import { Table, Modal, Form, Row, Col, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isEmpty } from 'lodash';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { dateTimeRender } from 'utils/renderer';
import {
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class CopyOrderModal extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      selectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  componentDidMount() {
    const { fetchCopyOrderList = (e) => e } = this.props;
    fetchCopyOrderList();
  }

  @Bind()
  handleChangeCompanyLov(value) {
    const { form } = this.props;
    if (!value) {
      form.resetFields(['displaySupplierName', 'tempKey']);
    }
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.statusCode`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.poTypeCode`).d('订单类型'),
        dataIndex: 'poTypeCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get(`entity.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.ouName`).d('业务实体'),
        dataIndex: 'orgName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaseAgentName`).d('采购员'),
        dataIndex: 'agentName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
    ];
    return columns;
  }

  @Bind()
  onSelectedChange(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    });
  }

  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form,
      visible,
      copyOrder,
      copyOrderList,
      copyOrderPagination,
      handleChangeModal,
      fetchCopyOrderList,
      fetchCopyOrderListLoading,
      copyOrderLoading,
    } = this.props;
    const { tenantId, organizationId, selectedRowKeys = [] } = this.state;
    const { getFieldDecorator, getFieldValue, registerField, setFieldsValue } = form;
    const poHeaderId = selectedRowKeys[0];
    const columns = this.getColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 150;
    const tabelProps = {
      bordered: true,
      columns,
      dataSource: copyOrderList,
      pagination: { ...copyOrderPagination, showQuickJumper: true },
      scroll: { x: scrollX, y: 'calc(100vh - 390px)' },
      onChange: (page) => fetchCopyOrderList(page, true),
      rowSelection: {
        type: 'radio',
        selectedRowKeys,
        onChange: this.onSelectedChange,
      },
      loading: fetchCopyOrderListLoading,
      rowKey: 'poHeaderId',
    };
    const modalProps = {
      width: '1100px',
      visible,
      onOk: () => copyOrder(poHeaderId),
      onCancel: () => handleChangeModal(false),
      title: intl.get(`sodr.common.model.common.orderList`).d('订单列表'),
      footer: (
        <div>
          <Button
            type="primary"
            onClick={() => copyOrder(poHeaderId)}
            loading={copyOrderLoading}
            disabled={isEmpty(selectedRowKeys)}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={() => handleChangeModal(false)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      ),
    };
    return (
      <Modal {...modalProps}>
        <Form layout="inline" className="more-fields-search-form">
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col span={18}>
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sodr.common.model.common.orderNum`).d('订单号')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('displayPoNum')(<Input trim inputChinese={false} />)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get(`entity.supplier.tag`).d('供应商')}
                  >
                    {getFieldDecorator('tempKey')(
                      <Lov
                        code="SODR.AUTH_SUPPLIER"
                        textField="displaySupplierName"
                        onChange={(val, record) => {
                          const { supplierId, supplierCompanyId } = record;
                          registerField('supplierId');
                          registerField('supplierCompanyId');
                          setFieldsValue({ supplierId, supplierCompanyId });
                        }}
                        queryParams={{
                          tenantId,
                          companyId: getFieldValue('companyId'),
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get(`entity.company.tag`).d('公司')}
                  >
                    {getFieldDecorator('companyId')(
                      <Lov
                        code="SPFM.USER_AUTH.COMPANY"
                        textField="companyName"
                        queryParams={{ tenantId }}
                        onChange={this.handleChangeCompanyLov}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get(`entity.business.tag`).d('业务实体')}
                  >
                    {getFieldDecorator('ouId')(
                      <Lov
                        code="HPFM.OU"
                        queryParams={{ organizationId, tenantId, enabledFlag: 1 }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('purchaseOrgId')(
                      <Lov
                        code="SPFM.USER_AUTH.PURORG"
                        queryParams={{ organizationId }}
                        lovOptions={{ displayField: 'organizationName' }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`sodr.common.model.common.purchaseAgentName`).d('采购员')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('agentId')(
                      <Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" queryParams={{ organizationId }} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={fetchCopyOrderList}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Table {...tabelProps} />
      </Modal>
    );
  }
}
