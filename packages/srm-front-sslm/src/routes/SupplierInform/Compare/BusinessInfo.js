/**
 * BusinessInfo - 业务信息
 * @date: 2021-04-07
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Row, Col, Icon, Form } from 'hzero-ui';
import intl from 'utils/intl';
import { getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import './style.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const organizationId = getCurrentOrganizationId();

const bucketDirectory = 'spfm-comp';

@Form.create({ fieldNameProp: null })
export default class BusinessInfo extends Component {
  /**
   * 查看图片
   */
  @Bind()
  showUrlImgFun(url) {
    const imgUrl = getAttachmentUrl(url, PRIVATE_BUCKET, organizationId, bucketDirectory);
    window.open(imgUrl);
  }

  render() {
    const {
      data = {},
      customizeForm = () => {},
      custLoading,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        dataSource: data,
        form: this.props.form,
        readOnly: true,
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BUSINESS_INFO',
      },
      <Form className="regist-form" custLoading={custLoading}>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.business.serviceType')
                .d('经营性质')}
            >
              {getFieldDecorator('serviceType', {
                initialValue: data.serviceType,
              })(
                <div
                  style={{
                    color:
                      (data.manufacturerFlagFlag === 'UPDATE' ||
                        data.traderFlagFlag === 'UPDATE' ||
                        data.servicerFlagFlag === 'UPDATE' ||
                        data.agentFlagFlag === 'UPDATE' ||
                        data.integrationFlagFlag === 'UPDATE' ||
                        data.contractorFlagFlag === 'UPDATE' ||
                        data.dealerFlagFlag === 'UPDATE') &&
                      'red',
                  }}
                >
                  {`${
                    data.manufacturerFlag === 1
                      ? intl
                          .get('sslm.enterpriseInform.view.model.business.manufacturer')
                          .d('制造商')
                      : ''
                  } ${
                    data.traderFlag === 1
                      ? intl.get('sslm.enterpriseInform.view.model.business.trader').d('贸易商')
                      : ''
                  } ${
                    data.servicerFlag === 1
                      ? intl.get('sslm.enterpriseInform.view.model.business.servicer').d('服务商')
                      : ''
                  } ${
                    data.agentFlag === 1
                      ? intl.get('sslm.enterpriseInform.model.business.agent').d('代理商')
                      : ''
                  } ${
                    data.integrationFlag === 1
                      ? intl
                          .get('sslm.enterpriseInform.view.model.business.integration')
                          .d('集成商')
                      : ''
                  } ${
                    data.contractorFlag === 1
                      ? intl.get('sslm.enterpriseInform.view.model.business.contractor').d('承包商')
                      : ''
                  } ${
                    data.dealerFlag === 1
                      ? intl.get('sslm.enterpriseInform.view.model.business.dealer').d('经销商')
                      : ''
                  }`}
                </div>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.business.industryReqList')
                .d('行业类型')}
            >
              {getFieldDecorator('industryReqList', {
                initialValue: data.industryReqList,
              })(
                <div style={{ color: data.industryFlag === 'UPDATE' && 'red' }}>
                  {(data.industryReqList || []).map(({ industryName }) => industryName).join(',')}
                </div>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.business.industryList')
                .d('主营品类')}
            >
              {getFieldDecorator('industryCategoryReqList', {
                initialValue: data.industryCategoryReqList,
              })(
                <div style={{ color: data.industryCategoryFlag === 'UPDATE' && 'red' }}>
                  {(data.industryCategoryReqList || [])
                    .map(({ categoryName }) => categoryName)
                    .join(',')}
                </div>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
                .d('送货服务范围')}
            >
              {getFieldDecorator('serviceAreaReqList', {
                initialValue: data.serviceAreaReqList,
              })(
                <div style={{ color: data.serviceAreaFlag === 'UPDATE' && 'red' }}>
                  {(data.serviceAreaReqList || [])
                    .map(({ serviceAreaMeaning }) => serviceAreaMeaning)
                    .join(',')}
                </div>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.view.model.business.website').d('公司官网')}
            >
              {getFieldDecorator('website', {
                initialValue: data.website,
              })(
                <div style={{ color: data.websiteFlag === 'UPDATE' && 'red' }}>{data.website}</div>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.view.model.business.logoUrl').d('公司 Logo')}
            >
              {getFieldDecorator('logoUrl', {
                initialValue: data.logoUrl,
              })(
                <div>
                  {data.logoUrl && (
                    <a
                      onClick={() => this.showUrlImgFun(data.logoUrl)}
                      style={{ color: data.logoUrlFlag === 'UPDATE' && 'red' }}
                    >
                      <Icon type="download" />
                      {intl
                        .get('sslm.enterpriseInform.view.model.business.viewPhoto')
                        .d('查看图片')}
                    </a>
                  )}
                </div>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.view.model.business.description')
                .d('公司简介')}
            >
              {getFieldDecorator('description', {
                initialValue: data.description,
              })(
                <div style={{ color: data.descriptionFlag === 'UPDATE' && 'red' }}>
                  {data.description}
                </div>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
