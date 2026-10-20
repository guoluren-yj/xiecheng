/**
 * MoreFieldsDrawer - 我的采购账单 - 查询表单 - 更多modal
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Drawer, Button, Form, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import LovMulti from '@/routes/components/MultipleLov';

@formatterCollections({ code: ['sfin.invoiceBill'] })
@withCustomize({
  unitCode: ['SFIN.BILL_SYNC.LIST.SEARCH'],
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
      form: { getFieldDecorator, setFieldsValue, registerField },
    } = this.props;
    const { onSearch, form, customizeForm } = this.props;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 10 },
      style: { width: '100%' },
    };
    const organizationId = getCurrentOrganizationId();
    return customizeForm(
      {
        code: 'SFIN.BILL_SYNC.LIST.SEARCH',
        form,
        // dataSource: detail,
      },
      <Form className="more-fields-form" style={{ marginLeft: 12, marginRight: 12 }}>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.sync.billNum').d('开票申请单号')}
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
              label={intl
                .get('sfin.invoiceBill.model.invoiceBill.sync.supplierCompanyId')
                .d('供应商')}
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
            <Form.Item
              {...formlayout}
              label={intl
                .get(`sfin.invoiceBill.model.invoiceBill.sync.syncStatusMeaning`)
                .d('导入状态')}
            >
              {getFieldDecorator('syncStatus')(
                <ValueList
                  style={{ width: '100%' }}
                  lovCode="SPUC.BILL_SYNC_STATUS"
                  lazyLoad={false}
                  allowClear
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item {...formlayout} label={intl.get('entity.company.sync.tag').d('公司')}>
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
            <Form.Item
              {...formlayout}
              label={intl.get('sfin.invoiceBill.model.invoiceBill.sync.purAgentName').d('采购员')}
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
              label={intl.get('sfin.invoiceBill.model.invoiceBill.sync.ouName').d('业务实体')}
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
              label={intl.get(`sfin.invoiceBill.model.invoiceBill.sync.businessType`).d('业务类别')}
            >
              {getFieldDecorator('businessType')(
                <ValueList
                  style={{ width: '100%' }}
                  lovCode="SFIN.BUSINESS_TYPE"
                  lazyLoad={false}
                  allowClear
                />
              )}
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
