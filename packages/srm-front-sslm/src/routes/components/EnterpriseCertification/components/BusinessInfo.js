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

import UploadCard from './UploadCard';
import styles from '../index.less';

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

  componentWillUnmount() {
    this.setState({
      business: {},
    });
  }

  @Bind()
  handleBussinessInfo() {
    const { dataSet } = this.props;
    const { business } = this.state;
    const {
      industryCategoryReqList = [],
      serviceAreaReqList = [],
      industryReqList = [],
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
    const industryListMeaning = industryReqList.map(i => i.industryName);
    const industryCategoryListMeaning = industryCategoryReqList.map(i => i.categoryName);
    const serviceAreaListMeaning = serviceAreaReqList.map(i => i.serviceAreaMeaning);
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
        industryReqList: industryReqList.map(i => i.industryId),
        industryCategoryReqList: industryCategoryReqList.map(i => i.industryCategoryId),
        serviceAreaReqList: serviceAreaReqList.map(i => i.serviceAreaCode),
      },
    ]);
  }

  render() {
    const { dataSet, bussinessInfoConfig = {} } = this.props;
    const { enableFieldList = [] } = bussinessInfoConfig;
    const {
      industryMeaning,
      industryCategoryMeaning,
      serviceAreaMeaning,
      serviceTypeMeaning,
    } = this.state;
    return (
      <div className={styles['supplier-info-form']}>
        <Form
          dataSet={dataSet}
          columns={2}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output
            name="serviceType"
            renderer={() => {
              return serviceTypeMeaning;
            }}
            hidden={!enableFieldList.includes('serviceType')}
          />
          <Output
            name="industryReqList"
            renderer={() => {
              return industryMeaning;
            }}
            hidden={!enableFieldList.includes('industryReqList')}
          />

          <Output
            name="industryCategoryReqList"
            renderer={() => {
              return industryCategoryMeaning;
            }}
            hidden={!enableFieldList.includes('industryCategoryReqList')}
          />
          <Output
            name="serviceAreaReqList"
            renderer={() => {
              return serviceAreaMeaning;
            }}
            hidden={!enableFieldList.includes('serviceAreaReqList')}
          />
          <Output
            name="website"
            colSpan={2}
            newLine
            hidden={!enableFieldList.includes('website')}
          />
          <Output
            name="description"
            colSpan={2}
            hidden={!enableFieldList.includes('description')}
          />
        </Form>
        <Form dataSet={dataSet} columns={2} labelLayout="vertical">
          <Output
            renderer={({ record = {} }) => {
              const logoUrl = isEmpty(record) ? undefined : record.get('logoUrl');
              const logoFilename = isEmpty(record) ? undefined : record.get('logoFilename');
              return <UploadCard fileName={logoFilename} fileUrl={logoUrl} />;
            }}
            hidden={!enableFieldList.includes('logoUrl')}
          />
        </Form>
      </div>
    );
  }
}
