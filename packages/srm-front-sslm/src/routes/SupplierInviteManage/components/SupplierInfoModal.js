/*
 * SupplierInfoModal - 发现供应商-信息弹窗
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentLanguage } from 'utils/utils';
import { queryCompanyInfo } from '@/services/supplierInviteManageServices';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { registerInfoDS, businessInfoDS, contactInfoDS } from '../stores/supplierInfoDS';

import RegisterInfo from './RegisterInfo';
import BusinessInfo from './BusinessInfo';
import ContactInfo from './ContactInfo';

import styles from '../index.less';

const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

/**
 * 发现供应商信息弹窗
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class SupplierInfoModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      basic: {},
      business: {},
      loading: false,
    };
  }

  componentDidMount() {
    this.handelCompanyInfo();
  }

  /**
   * 公司信息
   */
  @Bind()
  handelCompanyInfo() {
    const { companyId } = this.props;
    if (companyId) {
      this.setState({
        loading: true,
      });
      queryCompanyInfo({
        companyId,
      })
        .then(res => {
          if (getResponse(res)) {
            const { basic = {}, business = {}, contactList = [] } = res;
            this.contactInfoDs.loadData(contactList);
            // this.attachmentDs.loadData(attachmentList);
            this.setState({
              basic,
              business,
            });
          }
        })
        .finally(() => {
          this.setState({
            loading: false,
          });
        });
    }
  }

  registerInfoDs = new DataSet(registerInfoDS());

  businessInfoDs = new DataSet(businessInfoDS());

  contactInfoDs = new DataSet(contactInfoDS());

  render() {
    const { basic, business, loading } = this.state;
    const { sourceKey, showTagFlag, zhimaLabels } = this.props;
    const tagShowFlag = !isEmpty(zhimaLabels) && showTagFlag && isChinese;
    return (
      <React.Fragment>
        <Spin spinning={loading} wrapperClassName={styles['modal-c7n-card']}>
          {tagShowFlag && (
            <div className={styles['enterprise-tags-wrap']}>
              <div className={styles['enterprise-tags-title']}>{basic.companyName}</div>
              <EnterpriseTags
                key={sourceKey}
                tagList={zhimaLabels}
                parentId="sslmSupplierInfoModal"
                tagClassName="sslm-supplier-info-modal"
              />
            </div>
          )}
          <Card
            bordered={false}
            // id="supplierBaseInfo"
            title={intl.get(`spfm.enterprise.view.message.registerInfo`).d('登记信息')}
          >
            <RegisterInfo dataSet={this.registerInfoDs} basic={basic} fileHidden />
          </Card>
          <Card
            bordered={false}
            // id="contact"
            title={intl.get(`spfm.enterprise.view.message.business`).d('基础业务信息')}
          >
            <BusinessInfo dataSet={this.businessInfoDs} business={business} />
          </Card>
          <Card
            bordered={false}
            // id="address"
            title={intl.get(`spfm.enterprise.view.message.contact`).d('联系人信息')}
          >
            <ContactInfo dataSet={this.contactInfoDs} />
          </Card>
        </Spin>
      </React.Fragment>
    );
  }
}
