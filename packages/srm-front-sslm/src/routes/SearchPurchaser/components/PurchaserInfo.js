/*
 * PurchaserInfo - 采购方信息弹窗
 * @date: 2023/11/13 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryCompanyInformation } from '@/services/searchPurchaserServices';
import { registerInfoDS, businessInfoDS, contactInfoDS } from '../stores/purchaserInfoDS';

import RegisterInfo from './RegisterInfo';
import BusinessInfo from './BusinessInfo';
import ContactInfo from './ContactInfo';

import styles from '../index.less';

/**
 * 采购方信息弹窗
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
export default class PurchaserInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      basic: {},
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
      queryCompanyInformation({
        companyId,
      })
        .then(res => {
          if (getResponse(res)) {
            const { basic = {}, business = {}, contactList = [] } = res;
            this.registerInfoDs.loadData([basic]);
            this.businessInfoDs.loadData([business]);
            this.contactInfoDs.loadData(contactList);
            this.setState({
              basic,
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
    const { basic, loading } = this.state;
    return (
      <React.Fragment>
        <Spin spinning={loading} wrapperClassName={styles['purchaser-info-c7n-card']}>
          <Card
            bordered={false}
            title={intl.get(`spfm.enterprise.view.message.registerInfo`).d('登记信息')}
          >
            <RegisterInfo dataSet={this.registerInfoDs} basic={basic} />
          </Card>
          <Card
            bordered={false}
            title={intl.get(`spfm.enterprise.view.message.business`).d('基础业务信息')}
          >
            <BusinessInfo dataSet={this.businessInfoDs} />
          </Card>
          <Card
            bordered={false}
            title={intl.get(`spfm.enterprise.view.message.contact`).d('联系人信息')}
          >
            <ContactInfo dataSet={this.contactInfoDs} />
          </Card>
        </Spin>
      </React.Fragment>
    );
  }
}
