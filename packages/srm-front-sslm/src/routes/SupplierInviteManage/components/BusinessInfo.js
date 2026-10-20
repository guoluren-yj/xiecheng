/*
 * BusinessInfo - 业务信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

import PictureCard from '@/routes/components/C7nUrlUpload/PictureCard';

const PURCHASE = 'purchase';
const SALE = 'sale';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const AGENT = 'agent';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

/**
 * 业务信息
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
export default class BusinessInfo extends Component {
  serviceTypeMap = [
    {
      text: intl.get('spfm.enterprise.view.message.manufacturer').d('制造商'),
      value: MANUFACTURER,
    },
    { text: intl.get('spfm.enterprise.view.message.trader').d('贸易商'), value: TRADER },
    { text: intl.get('spfm.enterprise.view.message.servicer').d('服务商'), value: SERVICER },
    { text: intl.get('spfm.enterprise.view.message.agent').d('代理商'), value: AGENT },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.integration').d('集成商'),
      value: INTEGRATION,
    },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.contractor').d('承包商'),
      value: CONTRACTOR,
    },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.dealer').d('经销商'),
      value: DEALER,
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      industryCategoryMeaning: '',
      industryMeaning: '',
      serviceAreaMeaning: '',
      serviceTypeMeaning: '',
      business: {},
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const { business = {} } = nextProps;
    if (!isEmpty(business) && isEmpty(prevState.business)) {
      nextState.business = business;
    }
    return nextState;
  }

  componentDidUpdate(prevProps, prevState) {
    const { business } = this.state;
    if (!isEmpty(business) && isEmpty(prevState.business)) {
      this.handleBussinessInfo();
    }
  }

  @Bind()
  handleBussinessInfo() {
    const { dataSet } = this.props;
    const { business } = this.state;
    const {
      industryCategoryReqList = [],
      industryCategoryList = [],
      serviceAreaList = [],
      industryReqList = [],
      industryList = [],
      saleFlag = 0,
      purchaseFlag = 0,
      manufacturerFlag = 0,
      traderFlag = 0,
      servicerFlag = 0,
      agentFlag = 0,
      integrationFlag = 0,
      contractorFlag = 0,
      dealerFlag = 0,
    } = business || {};
    const finalIndustryList = isEmpty(industryReqList) ? industryList : industryReqList;
    const finalIndustryCategoryList = isEmpty(industryCategoryReqList)
      ? industryCategoryList
      : industryCategoryReqList;
    const businessType = [];
    if (saleFlag === 1) businessType.push(SALE);
    if (purchaseFlag === 1) businessType.push(PURCHASE);
    const serviceType = [];
    if (manufacturerFlag === 1) serviceType.push(MANUFACTURER);
    if (traderFlag === 1) serviceType.push(TRADER);
    if (servicerFlag === 1) serviceType.push(SERVICER);
    if (agentFlag === 1) serviceType.push(AGENT);
    if (integrationFlag === 1) serviceType.push(INTEGRATION);
    if (contractorFlag === 1) serviceType.push(CONTRACTOR);
    if (dealerFlag === 1) serviceType.push(DEALER);
    // 处理只读下翻译值
    const industryListMeaning = finalIndustryList.map(i => i.industryName);
    const industryCategoryListMeaning = finalIndustryCategoryList.map(i => i.categoryName);
    const serviceAreaListMeaning = serviceAreaList.map(i => i.serviceAreaMeaning);
    const serviceTypeList = serviceType.map(i => {
      const object = this.serviceTypeMap.find(n => n.value === i);
      return object.text;
    });
    this.setState({
      industryMeaning: (industryListMeaning || []).join('、'),
      industryCategoryMeaning: (industryCategoryListMeaning || []).join('、'),
      serviceAreaMeaning: (serviceAreaListMeaning || []).join('、'),
      // businessTypeMeaning: (businessTypeList || []).join('、'),
      serviceTypeMeaning: (serviceTypeList || []).join('、'),
    });
    dataSet.loadData([
      {
        ...business,
        serviceType,
        businessType,
        industryReqList: finalIndustryList.map(i => i.industryId),
        industryCategoryReqList: finalIndustryCategoryList.map(i => i.industryCategoryId),
        serviceAreaList: serviceAreaList.map(i => i.serviceAreaCode),
      },
    ]);
  }

  render() {
    const { dataSet, useWidthPercent = false } = this.props;
    const {
      industryMeaning,
      industryCategoryMeaning,
      serviceAreaMeaning,
      // businessTypeMeaning,
      serviceTypeMeaning,
    } = this.state;
    return (
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
        useWidthPercent={useWidthPercent}
      >
        {/* <Output
          label={intl.get('spfm.enterprise.model.business.businessType').d('主要身份')}
          value={businessTypeMeaning}
        /> */}
        <Output
          label={intl.get('spfm.enterprise.model.business.serviceType').d('经营性质')}
          value={serviceTypeMeaning}
        />
        <Output
          label={intl.get('spfm.enterprise.model.business.industryList').d('行业类型')}
          value={industryMeaning}
        />
        <Output
          renderer={({ record = {} }) => {
            const logoUrl = isEmpty(record) ? undefined : record.get('logoUrl');
            const logoFilename = isEmpty(record) ? undefined : record.get('logoFilename');
            return <PictureCard fileName={logoFilename} fileUrl={logoUrl} />;
          }}
          rowSpan={3}
        />

        <Output
          label={intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类')}
          value={industryCategoryMeaning}
        />
        <Output
          label={intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围')}
          value={serviceAreaMeaning}
        />
        <Output name="website" colSpan={2} newLine />
        <Output name="description" colSpan={2} />
      </Form>
    );
  }
}
