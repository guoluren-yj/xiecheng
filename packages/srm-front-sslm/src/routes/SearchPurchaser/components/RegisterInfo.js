/*
 * RegisterInfo - 登记信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { round } from 'lodash';
import { getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

const language = getCurrentLanguage();

/**
 * 登记信息
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
export default class RegisterInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 处理境内/境外
   */
  @Bind()
  renderForm() {
    const { basic = {} } = this.props;
    const {
      domesticForeignRelation,
      registeredCapital,
      currencyName,
      registeredRegionName,
      addressDetail,
      longTermFlag,
      licenceEndDate,
      tenantName,
    } = basic;
    // domesticForeignFlag 境内-1，境外-0
    const dom =
      domesticForeignRelation === 1 ? (
        <React.Fragment>
          <Output name="companyName" />
          <Output name="companyNum" />
          <Output name="unifiedSocialCode" />

          <Output name="organizingInstitutionCode" />
          <Output name="dunsCode" />
          <Output name="institutionalType" />

          <Output name="companyType" />
          <Output name="registeredCountryName" />
          <Output
            name="registeredRegionName"
            renderer={() => {
              const regionName =
                registeredRegionName && addressDetail
                  ? `${registeredRegionName}${addressDetail}`
                  : registeredRegionName || addressDetail;
              return regionName;
            }}
          />

          <Output name="legalRepName" />
          <Output name="taxpayerType" />
          <Output
            name="currencyName"
            renderer={() => {
              const formatValue =
                language === 'en_US'
                  ? registeredCapital
                    ? round(registeredCapital / 100, 8)
                    : registeredCapital
                  : registeredCapital;
              const finalValue =
                registeredCapital === undefined
                  ? intl.get('hzero.common.currency.none').d('无')
                  : `${formatValue}${currencyName ||
                      intl.get('hzero.common.currency.cny').d('人民币')}(${intl
                      .get(`spfm.common.currency.ten.thousand`)
                      .d('万')})`;
              return finalValue;
            }}
          />

          <Output name="buildDate" />
          <Output
            name="licenceEndDate"
            renderer={() => {
              return longTermFlag === 1
                ? intl.get(`spfm.enterprise.view.message.longTerm`).d('长期')
                : dateRender(licenceEndDate) || '-';
            }}
          />
          <Output name="tenantName" hidden={!tenantName} />

          <Output name="businessScope" newLine colSpan={3} />
        </React.Fragment>
      ) : domesticForeignRelation === 2 ? (
        <React.Fragment>
          <Output name="companyName" />
          <Output name="phone" />
          <Output name="email" />
          <Output name="registeredCountryName" />
          <Output name="regionPathName" />
          <Output name="addressDetail" />
          <Output name="tenantName" hidden={!tenantName} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Output name="companyName" />
          <Output name="companyNum" />
          <Output name="businessRegistrationNumber" />

          <Output name="dunsCode" />
          <Output name="registeredCountryName" />
          <Output
            name="registeredRegionName"
            renderer={() => {
              const regionName =
                registeredRegionName && addressDetail
                  ? `${registeredRegionName}${addressDetail}`
                  : registeredRegionName || addressDetail;
              return regionName;
            }}
          />

          <Output name="legalRepName" />
          <Output
            name="currencyName"
            renderer={() => {
              const formatValue =
                language === 'en_US'
                  ? registeredCapital
                    ? round(registeredCapital / 100, 8)
                    : registeredCapital
                  : registeredCapital;
              const finalValue =
                registeredCapital === undefined
                  ? intl.get('hzero.common.currency.none').d('无')
                  : `${formatValue}${currencyName ||
                      intl.get('hzero.common.currency.cny').d('人民币')}(${intl
                      .get(`spfm.common.currency.ten.thousand`)
                      .d('万')})`;
              return finalValue;
            }}
          />
          <Output name="buildDate" />

          <Output name="tenantName" hidden={!tenantName} />
          <Output name="businessScope" newLine colSpan={3} />
        </React.Fragment>
      );
    return dom;
  }

  render() {
    const { dataSet } = this.props;

    return (
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
      >
        {this.renderForm()}
      </Form>
    );
  }
}
