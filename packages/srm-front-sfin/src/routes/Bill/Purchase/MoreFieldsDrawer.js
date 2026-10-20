/**
 * MoreFieldsDrawer - 我的采购账单 - 查询表单 - 更多modal
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Drawer, Button, Form, Select, DatePicker, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isNil } from 'lodash';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import LovMulti from '@/routes/components/MultipleLov';

const { Option } = Select;
@formatterCollections({ code: ['sfin.invoiceBill'] })
@withCustomize({
  unitCode: ['SFIN.BILL_PURCHASE_LIST.MORE_FILTER'],
})
export default class MoreFieldsDrawer extends PureComponent {
  /**
   * 重置
   */
  @Bind()
  onReset() {
    const { onReset } = this.props;
    if (onReset) {
      onReset();
    }
  }

  renderForm() {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue, registerField },
    } = this.props;
    const { codes = [], onSearch, form, customizeForm } = this.props;
    const formlayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const organizationId = getCurrentOrganizationId();
    return customizeForm(
      {
        code: 'SFIN.BILL_PURCHASE_LIST.MORE_FILTER',
        form,
        // dataSource: detail,
      },
      <Form className="more-fields-form" style={{ marginLeft: 12, marginRight: 12 }}>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
            >
              {getFieldDecorator('billNum')(
                <Input inputChinese={false} style={{ width: '100%' }} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.displayTrxNum').d('事务编号')}
            >
              {getFieldDecorator('displayTrxNum')(
                <Input inputChinese={false} style={{ width: '100%' }} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.displayPoNum').d('订单号')}
            >
              {getFieldDecorator('displayPoNum')(
                <Input inputChinese={false} style={{ width: '100%' }} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.material').d('物料')}
            >
              {getFieldDecorator('itemId')(
                <Lov
                  style={{ width: '100%' }}
                  code="SMDM.CUSTOMER_ITEM"
                  queryParams={{ organizationId }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.supplierCompanyId').d('供应商')}
            >
              {getFieldDecorator('supplierCompanyId')(
                <Lov
                  style={{ width: '100%' }}
                  code="SFIN.USER_AUTH.EXT_SUPPLIER"
                  textField="displaySupplierName"
                  queryParams={{ tenantId: organizationId }}
                  onChange={(_, record) => {
                    const { supplierId } = record;
                    registerField('supplierId');
                    setFieldsValue({
                      supplierId,
                    });
                  }}
                  onOk={(record) => {
                    const { supplierCompanyId } = record;
                    setFieldsValue({
                      supplierCompanyId: isNil(supplierCompanyId) ? '' : supplierCompanyId,
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item {...formlayout} label={intl.get('entity.company.tag').d('公司')}>
              {getFieldDecorator('companyId')(
                <Lov
                  style={{ width: '100%' }}
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  queryParams={{ organizationId }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item {...formlayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('billStatus')(
                <Select allowClear>
                  {codes.length > 0 &&
                    codes
                      .filter((item) => item.value.indexOf('INFORM_') === -1)
                      .map((code) => (
                        <Option key={code.value} value={code.value}>
                          {code.meaning}
                        </Option>
                      ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员')}
            >
              {getFieldDecorator('purchaseAgentIds')(
                <LovMulti
                  style={{ width: '100%' }}
                  code="SPUC.PURCHASE_AGENT_NOUSER"
                  queryParams={{ tenantId: organizationId }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.ouName').d('业务实体')}
            >
              {getFieldDecorator('ouId')(
                <Lov style={{ width: '100%' }} code="SPFM.USER_AUTH.OU" />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.submitDateFrom').d('提交日期从')}
            >
              {getFieldDecorator('submittedDateFrom')(
                <DatePicker
                  disabledDate={(currentDate) =>
                    getFieldValue('submittedDateTo') &&
                    moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'day')
                  }
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder=""
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.submitDateTo').d('提交日期至')}
            >
              {getFieldDecorator('submittedDateTo')(
                <DatePicker
                  disabledDate={(currentDate) =>
                    getFieldValue('submittedDateFrom') &&
                    moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'day')
                  }
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder=""
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName').d('采购组织')}
            >
              {getFieldDecorator('purOrganizationIds')(
                <LovMulti
                  style={{ width: '100%' }}
                  code="HPFM.PURCHASE_ORGANIZATION"
                  queryParams={{ tenantId: organizationId }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl
                .get('sfin.invoiceBill.model.invoiceBill.approvedDateFrom')
                .d('审核日期从')}
            >
              {getFieldDecorator('approvedDateFrom')(
                <DatePicker
                  disabledDate={(currentDate) =>
                    getFieldValue('approvedDateTo') &&
                    moment(getFieldValue('approvedDateTo')).isBefore(currentDate, 'day')
                  }
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder=""
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.approvedDateTo').d('审核日期至')}
            >
              {getFieldDecorator('approvedDateTo')(
                <DatePicker
                  disabledDate={(currentDate) =>
                    getFieldValue('approvedDateFrom') &&
                    moment(getFieldValue('approvedDateFrom')).isAfter(currentDate, 'day')
                  }
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder=""
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl
                .get('sfin.invoiceBill.model.invoiceBill.isSupplierCreateFlag')
                .d('是否供应商创建')}
            >
              {getFieldDecorator('supplierCreateFlag', {
                // initialValue: 1,
              })(
                <Select allowClear>
                  <Option key={1} value={1}>
                    {intl.get('hzero.common.status.yes').d('是')}
                  </Option>
                  <Option key={0} value={0}>
                    {intl.get('hzero.common.status.no').d('否')}
                  </Option>
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl
                .get('sfin.invoiceBill.model.invoiceBill.invoiceCompleteFlag')
                .d('是否已完全开票')}
            >
              {getFieldDecorator('invoiceCompleteFlag')(
                <Select allowClear>
                  <Option key={1} value={1}>
                    {intl.get('hzero.common.status.yes').d('是')}
                  </Option>
                  <Option key={0} value={0}>
                    {intl.get('hzero.common.status.no').d('否')}
                  </Option>
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别')}
            >
              {getFieldDecorator('businessType')(
                <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl
                .get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceNumber`)
                .d('税务发票号')}
            >
              {getFieldDecorator('taxInvoiceNums')(<Input trim inputChinese={false} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get(`sfin.invoiceBill.model.invoiceBill.erpInvoiceNum`).d('ERP发票号')}
            >
              {getFieldDecorator('erpInvoiceNums')(<Input trim inputChinese={false} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item>
              <Button onClick={this.onReset} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                htmlType="submit"
                type="primary"
                onClick={onSearch}
                style={{ marginRight: 12 }}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { visible, onHideDrawer } = this.props;
    const drawerProps = {
      title: intl.get('sfin.invoiceBill.view.button.searchMore').d('查询更多'),
      visible,
      mask: true,
      onClose: () => onHideDrawer(),
      width: 636,
      style: {
        height: 'calc(100% - 103px)',
        overflow: 'auto',
        padding: 12,
      },
    };
    return <Drawer {...drawerProps}>{this.renderForm()}</Drawer>;
  }
}
