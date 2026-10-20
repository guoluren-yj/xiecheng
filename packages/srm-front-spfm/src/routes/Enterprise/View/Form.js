/**
 * Form - 企业信息-明细展示页面-Form组件
 * @date: 2018-7-17
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import moment from 'moment';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Row, Checkbox, Icon, Select, Spin, DatePicker } from 'hzero-ui';
import intl from 'utils/intl';
import {DEFAULT_DATE_FORMAT} from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './Form.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;

@formatterCollections({ code: ['spfm.finance', 'spfm.approval'] })
export default class EnterpriseInfoForm extends PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    dataSource: PropTypes.object,
  };

  static defaultProps = {
    dataSource: {},
  };

  setCheckboxGroupValues = (data = []) => data.map(n => (n.enabledFlag === 1 ? n.key : undefined));

  render() {
    const {
      form: { getFieldDecorator },
      dataSource = {},
      loading = false,
    } = this.props;
    const {
      companyName,
      companyTypeMeaning,
      registeredCountryName,
      registeredRegionName,
      addressDetail,
      legalRepName,
      registeredCapital,
      licenceEndDate,
      buildDate,
      longTermFlag,
      businessScope,
      domesticForeignRelation,
      shortName,
      dunsCode,
      taxpayerTypeMeaning,
      licenceUrl,
      industryList = [],
      industryCategoryList = [],
      saleFlag,
      purchaseFlag,
      manufuctuerFlag,
      traderFlag,
      servicerFlag,
      dealerFlag,
      agentFlag,
      website,
      description,
      logoUrl,
    } = dataSource;

    return (
      <Spin spinning={loading}>
        <Form layout="inline" className={styles['spfm-enterprise-info-view-form']}>
          <h2>{intl.get('spfm.approval.view.message.title.companyInfo').d('企业信息')}</h2>
          <h3>{intl.get('spfm.approval.view.message.title.regInfo').d('登记信息')}</h3>
          <Row gutter={24}>
            <FormItem label={intl.get('spfm.approval.model.legal.companyName').d('名称')}>
              {getFieldDecorator('companyName', { initialValue: companyName })(<Input disabled />)}
            </FormItem>
            <FormItem label={intl.get('spfm.approval.model.legal.companyType').d('类型')}>
              {getFieldDecorator('companyType', { initialValue: companyTypeMeaning })(
                <Input disabled />
              )}
            </FormItem>
            <FormItem
              label={intl.get('spfm.approval.model.legal.registeredCountryName').d('注册国家')}
            >
              {getFieldDecorator('registeredCountryName', { initialValue: registeredCountryName })(
                <Input disabled />
              )}
            </FormItem>
          </Row>
          <Row gutter={24}>
            <FormItem
              label={intl.get('spfm.approval.model.legal.registeredRegionName').d('注册地址')}
            >
              {getFieldDecorator('registeredRegionName', { initialValue: registeredRegionName })(
                <Input disabled />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('addressDetail', { initialValue: addressDetail })(
                <Input disabled style={{ width: 230 }} />
              )}
            </FormItem>
            <FormItem label={intl.get('spfm.approval.model.legal.legalRepName').d('法定代表人')}>
              {getFieldDecorator('legalRepName', { initialValue: legalRepName })(
                <Input disabled />
              )}
            </FormItem>
          </Row>
          <Row gutter={24}>
            <FormItem
              label={intl.get('spfm.approval.model.legal.registereCapital').d('注册资本(万元)')}
            >
              {getFieldDecorator('registeredCapital', { initialValue: registeredCapital })(
                <Input disabled />
              )}
            </FormItem>
            <FormItem label={intl.get('spfm.approval.model.legal.buildDate').d('成立日期')}>
              {getFieldDecorator('buildDate', { initialValue: buildDate && moment(buildDate, DEFAULT_DATE_FORMAT) })(<DatePicker disabled placeholder={null} />)}
            </FormItem>
            <FormItem label={intl.get('spfm.approval.model.legal.licenceEndDate').d('营业期限')}>
              {getFieldDecorator('licenceEndDate', { initialValue: licenceEndDate&& moment(licenceEndDate, DEFAULT_DATE_FORMAT) })(
                <DatePicker disabled placeholder={null} />
              )}
            </FormItem>
            <FormItem style={{ width: 120 }}>
              {getFieldDecorator('longTermFlag', {
                valuePropName: 'checked',
                initialValue: longTermFlag === 1,
              })(
                <Checkbox disabled>
                  {intl.get('spfm.approval.model.legal.longTermFlag').d('长期')}
                </Checkbox>
              )}
            </FormItem>
          </Row>
          <Row>
            <FormItem
              label={intl.get('spfm.approval.model.legal.businessScope').d('经营范围')}
              style={{ width: '100%' }}
            >
              {getFieldDecorator('businessScope', { initialValue: businessScope })(
                <TextArea disabled style={{ width: 742 }} rows={4} />
              )}
            </FormItem>
          </Row>
          <Row gutter={24}>
            <FormItem label={intl.get('spfm.approval.model.legal.shortName').d('简称')}>
              {getFieldDecorator('shortName', { initialValue: shortName })(<Input disabled />)}
            </FormItem>
            <FormItem
              label={intl.get('spfm.approval.model.legal.domesticForeignRelation').d('境内外关系')}
            >
              {getFieldDecorator('domesticForeignRelation', {
                initialValue: domesticForeignRelation,
              })(<Input disabled />)}
            </FormItem>
            <FormItem label={intl.get('spfm.approval.model.legal.dunsCode').d('D-U-N-S')}>
              {getFieldDecorator('dunsCode', { initialValue: dunsCode })(<Input disabled />)}
            </FormItem>
          </Row>
          <Row gutter={24}>
            <FormItem label={intl.get('spfm.approval.model.legal.taxpayerType').d('纳税人标识')}>
              {getFieldDecorator('taxpayerType', { initialValue: taxpayerTypeMeaning })(
                <Input disabled />
              )}
            </FormItem>
            <FormItem>
              <a href={licenceUrl}>
                <Icon type="download" />
                {intl.get('spfm.approval.model.legal.licenceUrl').d('营业执照扫描件')}
              </a>
            </FormItem>
          </Row>
          <br />
          <h3>{intl.get('spfm.approval.view.message.title.businessInfo').d('业务信息')}</h3>
          <Row gutter={24}>
            <FormItem
              label={intl.get('spfm.approval.model.business.primaryIdentity').d('主要身份')}
            >
              {getFieldDecorator('primaryIdentity', {
                initialValue: this.setCheckboxGroupValues([
                  { key: 'saleFlag', enabledFlag: saleFlag },
                  { key: 'purchaseFlag', enabledFlag: purchaseFlag },
                ]),
              })(
                <CheckboxGroup
                  disabled
                  options={[
                    {
                      label: intl
                        .get('spfm.approval.model.business.primaryIdentity.saleFlag')
                        .d('我要销售'),
                      value: 'purchaseFlag',
                    },
                    {
                      label: intl
                        .get('spfm.approval.model.business.primaryIdentity.purchaseFlag')
                        .d('我要采购'),
                      value: 'saleFlag',
                    },
                  ]}
                />
              )}
            </FormItem>
            <FormItem
              label={intl.get('spfm.approval.model.business.businessNature').d('经营性质')}
              style={{ width: 400 }}
            >
              {getFieldDecorator('businessNature', {
                initialValue: this.setCheckboxGroupValues([
                  { key: 'manufuctuerFlag', enabledFlag: manufuctuerFlag },
                  { key: 'traderFlag', enabledFlag: traderFlag },
                  { key: 'servicerFlag', enabledFlag: servicerFlag },
                  { key: 'agentFlag', enabledFlag: agentFlag },
                  { key: 'dealerFlag', enabledFlag: dealerFlag },
                ]),
              })(
                <CheckboxGroup
                  disabled
                  options={[
                    {
                      label: intl
                        .get('spfm.approval.model.business.businessNature.manufuctuerFlag')
                        .d('制造商'),
                      value: 'manufuctuerFlag',
                    },
                    {
                      label: intl
                        .get('spfm.approval.model.business.businessNature.traderFlag')
                        .d('贸易商'),
                      value: 'traderFlag',
                    },
                    {
                      label: intl
                        .get('spfm.approval.model.business.businessNature.servicerFlag')
                        .d('服务商'),
                      value: 'servicerFlag',
                    },
                    {
                      label: intl
                        .get('spfm.certificationApproval.model.detailForm.agentFlag')
                        .d('代理商'),
                      value: 'agentFlag',
                    },
                    {
                      label: intl
                      .get('spfm.certificationApproval.model.detailForm.dealer')
                      .d('经销商'),
                    value: 'dealerFlag',
                    },
                  ]}
                />
              )}
            </FormItem>
          </Row>
          <Row gutter={24}>
            <FormItem
              label={intl.get('spfm.approval.model.business.industryList').d('行业类型')}
              style={{ width: '100%' }}
            >
              {getFieldDecorator('industryList', {
                initialValue: industryList.map(n => n.industryName),
              })(<Select mode="multiple" disabled style={{ width: 550 }} />)}
            </FormItem>
          </Row>
          <Row gutter={24}>
            <FormItem
              label={intl.get('spfm.approval.model.business.industryCategoryList').d('主营品类')}
              style={{ width: '100%' }}
            >
              {getFieldDecorator('industryCategoryList', {
                initialValue: industryCategoryList.map(n => n.categoryName),
              })(<Select mode="multiple" disabled style={{ width: 550 }} />)}
            </FormItem>
          </Row>
          <Row gutter={24}>
            <FormItem label={intl.get('spfm.approval.model.business.website').d('公司官网')}>
              {getFieldDecorator('website', { initialValue: website })(<Input disabled />)}
            </FormItem>
            <FormItem>
              <a href={logoUrl}>
                <Icon type="download" />
                {intl.get('spfm.approval.model.business.logoUrl').d('下载公司logo')}
              </a>
            </FormItem>
          </Row>
          <Row gutter={24}>
            <FormItem
              label={intl.get('spfm.approval.model.business.description').d('公司简介')}
              style={{ width: '100%' }}
            >
              {getFieldDecorator('description', { initialValue: description })(
                <TextArea disabled style={{ width: 742 }} rows={4} />
              )}
            </FormItem>
          </Row>
        </Form>
      </Spin>
    );
  }
}
