/**
 * CompanyInfo - 供应商360度查询-公司logo和基本信息
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { getUserOrganizationId, getAttachmentUrl } from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { dateTimeRender } from 'utils/renderer';
import defaultLogo from 'hzero-front/lib/assets/logo-placeholder.png';
import formatterCollections from 'utils/intl/formatterCollections';

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 供应商360度查询 - 公司信息
 * @extends {Component} - React.Component
 * @reactProps {Object} companyInfo - 公司信息数据源
 * @reactProps {Object} ERPInfo - ERP信息数据源
 * @reactProps {Object} editedInfo - 编辑次数数据源
 * @return React.element
 */
@formatterCollections({ code: ['sslm.supplierDetail', 'sslm.common'] })
export default class CompanyInfo extends PureComponent {
  /**
   *点击查看历史修改记录
   */
  @Bind()
  onClick() {
    const { historyVersion } = this.props;
    if (historyVersion) {
      historyVersion();
    }
  }

  /**
   *渲染函数
   *
   * @returns
   */
  render() {
    const {
      remote,
      companyInfo = {},
      ERPInfo = [],
      editedInfo = {},
      purchaseFormList = {},
      customizeForm,
      form,
    } = this.props;
    const { basic = {}, business = {} } = companyInfo || {};
    const url = business && business.logoUrl;
    const bucketName = PRIVATE_BUCKET;
    const newUrl = getAttachmentUrl(url, bucketName, getUserOrganizationId());
    const erpValue =
      ERPInfo.map(data => `[${data.companyName}]-${data.companyNum}`)?.join('、') || '-';
    return (
      <Row
        gutter={24}
        style={{
          backgroundColor: '#fbfbfb',
          padding: '10px',
          margin: '-16px -16px 40px',
          border: '1px solid #eee',
        }}
      >
        <Col span={24}>
          <div className="logo-div">
            <img className="logo-img" src={url ? newUrl : defaultLogo} alt="logo" />
          </div>
          <div className="company-info">
            <Row>
              <div style={{ fontSize: '24px', marginTop: '14px' }}>
                {basic && basic.companyName}
                {remote
                  ? remote.render('SSLM.SUPPLIER_DETAIL_COMPANY_INFO_EXTRA', null, { basic })
                  : null}
              </div>
            </Row>
            {customizeForm(
              {
                code: 'SSLM.SUPPLIER_LIFE_CYCLE.SUPPLIER_BASIC',
                form,
                dataSource: basic,
                readOnly: true,
              },
              <Form>
                <Row gutter={48}>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get('sslm.common.view.company.code').d('公司编码')}
                    >
                      {form.getFieldDecorator('companyNum')(<div>{basic && basic.companyNum}</div>)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl
                        .get('sslm.supplierDetail.model.supDetail.companyInfo.createDate')
                        .d('注册时间')}
                    >
                      {form.getFieldDecorator('creationDate')(
                        <div>{basic && dateTimeRender(basic.creationDate)}</div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl
                        .get('sslm.supplierDetail.model.supplierDetail.lastEditDate')
                        .d('最近更新')}
                    >
                      {form.getFieldDecorator('lastUpdateDate')(
                        <div>{dateTimeRender(editedInfo.lastUpdateDate)}</div>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={48}>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl
                        .get('sslm.supplierDetail.model.supplierDetail.ERPInfo.companyName')
                        .d('ERP供应商')}
                    >
                      {form.getFieldDecorator('erp')(
                        <div className="text-overflow">
                          <Tooltip placement="topLeft" title={erpValue}>
                            {erpValue}
                          </Tooltip>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl
                        .get('sslm.supplierDetail.model.supDetail.updateCount')
                        .d('更新次数')}
                    >
                      {form.getFieldDecorator('count')(
                        <div>
                          {editedInfo.count && (
                            <>
                              {editedInfo.count}
                              {intl
                                .get('sslm.supplierDetail.model.supplierDetail.editedInfo.count')
                                .d('次')}
                              <a onClick={this.onClick}>
                                {intl
                                  .get(
                                    'sslm.supplierDetail.model.supplierDetail.editedInfo.history'
                                  )
                                  .d('历史版本')}
                              </a>
                            </>
                          )}
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get('hzero.common.button.bookKeepreeze').d('记账冻结')}
                    >
                      {form.getFieldDecorator('frozenFlag')(
                        <div>
                          {purchaseFormList.frozenFlag
                            ? intl
                                .get('sslm.supplierDetail.model.supDetail.companyInfo.frozen')
                                .d('已冻结')
                            : intl
                                .get('sslm.supplierDetail.model.supDetail.companyInfo.unfrozen')
                                .d('未冻结')}
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`sslm.common.model.buyer`).d('采购员')}
                    >
                      {form.getFieldDecorator('partnerPurchaseAgentName')(
                        <div className="text-overflow">
                          <Tooltip
                            placement="topLeft"
                            title={basic && basic.partnerPurchaseAgentName}
                          >
                            {(basic && basic.partnerPurchaseAgentName) || '-'}
                          </Tooltip>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    );
  }
}
