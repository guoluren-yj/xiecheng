/**
 * InformationCompare  - 企业信息变更申请详情 ---- 信息比对
 * @date: 2019-11-04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import WithCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';

import InfoDetail from '../infoDetail';

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryInfoChangeApprovalDetailLoading:
    loading.effects['enterpriseInform/queryInfoChangeApprovalDetail'],
  queryInvestigateLoading: loading.effects['enterpriseInform/queryInvestigate'],
}))
@formatterCollections({ code: ['sslm.enterpriseInform', 'spfm.enterprise', 'sslm.common'] })
@WithCustomize({
  unitCode: [
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BANK_INFO', // 银行信息
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.INVOICE_INFO', // 开票信息
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.OTHER_INFO', // 其它信息
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.COLLAPSE', // 折叠面板
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.CONTACT_INFO', // 联系人
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.ADDRESS_INFO', // 地址
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.ATTA_INFO', // 附件
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.FINANCIAL_INFO', // 财务状况
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS', // 登记信息 （境内外）
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL', // 登记信息（个人）
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BUSINESS_INFO', // 业务信息
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY', // 供应商分类
  ],
  manualQuery: true,
})
export default class InformationCompare extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(props.location.search.substr(1));
    const { partnerTenantId, workflowFlag } = routerParam;
    const { queryUnitConfig } = props;
    if (queryUnitConfig) {
      queryUnitConfig({ customizeTenantId: partnerTenantId });
    }
    this.state = {
      workflowFlag: !!Number(workflowFlag),
    };
  }

  componentDidMount() {
    this.queryCustomize();
  }

  /**
   * 查询个性化
   */
  @Bind()
  queryCustomize() {
    const { dispatch, location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { partnerTenantId, secondaryDomainTenantId, isSecondaryDomain = 'false' } = routerParam;
    const payload = {
      unitCode:
        isSecondaryDomain === 'true'
          ? 'SSLM.ENTERPRISE_INFORM_CHANGE_SUPPLIER.COLLAPSE'
          : 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.COLLAPSE',
      customizeTenantId: isSecondaryDomain === 'true' ? secondaryDomainTenantId : partnerTenantId,
      isSecondaryDomain,
    };
    dispatch({
      type: 'enterpriseInform/queryCustomize',
      payload,
    });
  }

  // 处理界面返回
  @Bind()
  handleBackPath() {
    const {
      location,
      match: {
        params: { changeReqId, companyId },
      },
    } = this.props;
    const { state: { historyBack } = {} } = location;
    const isPub = location.pathname.match('/pub/');
    const routerParam = querystring.parse(location.search.substr(1));
    const { source, ...rest } = routerParam;
    let backPath = '';
    switch (source) {
      case 'enterprise':
        backPath = `${
          isPub ? '/pub' : ''
        }/sslm/enterprise-inform-change/detail/${changeReqId}?${querystring.stringify({
          ...rest,
          companyId,
        })}`;
        break;
      default:
        backPath = historyBack;
        break;
    }
    return backPath;
  }

  render() {
    const {
      match: { params },
      location,
      dispatch,
      custLoading,
      customizeForm,
      customizeTable,
      enterpriseInform: { collapseCodeList = [] },
    } = this.props;
    const { workflowFlag } = this.state;
    const { changeReqId, companyId } = params;
    const routerParam = querystring.parse(location.search.substr(1));
    const { partnerTenantId, domesticForeignRelation, changeLevel } = routerParam;
    return (
      <Fragment>
        <Header
          backPath={workflowFlag ? '' : this.handleBackPath()}
          title={intl.get('sslm.enterpriseInform.view.title.changeContrast').d('明细比对')}
        />
        <Content wrapperClassName="enterpriseCompare">
          <InfoDetail
            dispatch={dispatch}
            changeReqId={changeReqId}
            companyId={companyId}
            partnerTenantId={partnerTenantId}
            changeLevel={changeLevel}
            domesticForeignRelation={Number(domesticForeignRelation)}
            custLoading={custLoading}
            customizeForm={customizeForm}
            customizeTable={customizeTable}
            collapseCodeList={collapseCodeList}
            source="enterpriseCompare"
          />
        </Content>
      </Fragment>
    );
  }
}
