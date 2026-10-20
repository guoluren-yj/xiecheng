import { Form, notification } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'utils/remote';

// import { openTab } from 'utils/menuTab';
import CompanySearch from './index';

@formatterCollections({
  code: [
    'spfm.companySearch',
    'spfm.enterprise',
    'spfm.supplier',
    'entity.company',
    'spfm.common',
    'spfm.disposeInvite',
    'entity.attachment',
    'spfm.certificateAuthority',
    'spfm.certificationApproval',
    'spfm.supplierRegister',
    'spfm.invitationList',
    'spfm.invitationRegister',
    'spfm.registerEnterprise',
  ],
})
@withCustomize({
  unitCode: [
    'SPFM.SUPPLIER_SEARCH.LIST.SUPPLIER_BTN_GROUP',
    'SPFM.SUPPLIER_SEARCH.QUERY_SUPPLIER_RANGE',
  ],
})
@connect(({ loading, companySearchSupplier, user = {} }) => {
  const commonProps = {
    loadingInit:
      loading.effects['companySearchSupplier/batchCode'] ||
      loading.effects['companySearchSupplier/initIndustry'],
    loadingQueryList: loading.effects['companySearchSupplier/queryList'],
    loadingFetchcategoryCodeList: loading.effects['companySearchSupplier/fetchcategoryCodeList'],
    loadingInvite: loading.effects['companySearchSupplier/invite'],
    loadingInviteRegister: loading.effects['companySearchSupplier/inviteRegister'],
    companyLoading: loading.effects['companySearchSupplier/queryCompanyInformation'],
    loadingInvitedCompany: loading.effects['companySearchSupplier/queryCompanyInvited'],
    loadingQuerySupplierCategory: loading.effects['companySearchSupplier/querySupplierCategory'],
    loadingQueryInviter: loading.effects['companySearchSupplier/queryInviterData'],
    companySearch: companySearchSupplier,
    organizationId: getCurrentOrganizationId(),
  };
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
  } = themeConfigVO;
  if (enableThemeConfig) {
    return {
      primaryColor: colorCode,
      ...commonProps,
    };
  }
  return {
    ...commonProps,
  };
})
@Form.create({ fieldNameProp: null })
@remote({
  code: 'SSLM_COMPANY_SEARCH_SUPPLIER', // 对应二开模块暴露的Expose的编码
  name: 'searchSupplierRemote', // 默认 'remote'， 如有属性冲突可以改此属性
}, {
  events: {
    cuxHandleInviteInit() {}, // 邀请合作弹框初始化
  },
})
export default class CompanySearchSupplier extends CompanySearch {
  state = {
    isSupplier: true,
    onlyShowMySupplierFlag: 1,
    onlyShowNoPartnerFlag: 1,
  };

  namespace = 'companySearchSupplier';

  /**
   * 调用 邀请注册的接口
   * @param {Object} payload - 租户id 和 邀请注册的信息
   * @returns
   */
  @Bind()
  inviteRegister(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'companySearchSupplier/inviteRegister',
      payload,
    });
  }

  /**
   * 斯瑞德风险扫描内嵌页
   */
  @Bind()
  handleEmbedPage(company) {
    const { dispatch } = this.props;
    dispatch({
      type: 'companySearchSupplier/riskEmbedFlag',
    }).then((res) => {
      if (res) {
        notification.success({
          message: intl.get(`spfm.supplier.model.supplier.platform.successRisk`).d('操作成功'),
        });
        this.handleToPage(company);
      }
      // else {
      //   notification.warning({
      //     message: intl.get(`spfm.supplier.model.supplier.platform.failRisk`).d('操作失败'),
      //     description: intl
      //       .get(`spfm.supplier.model.supplier.platform.failRiskMsg`)
      //       .d('您尚未开通风控服务，请联系400-900-9298开通，或直接咨询售前人员！'),
      //   });
      // }
    });
  }

  /**
   * 斯瑞德风险扫描内嵌页
   */
  @Bind()
  handleToPage(company) {
    const { dispatch } = this.props;
    const load = intl.get('spfm.common.view.riskMonitoring.loading').d('正在加载');
    const prompt = `<p style="text-align: center">${load}...</p>`;
    const riskEmbedPage = window.open();
    if (riskEmbedPage) {
      // 防止窗口被拦截
      riskEmbedPage.document.body.innerHTML = prompt;
      dispatch({
        type: 'companySearchSupplier/riskEmbedPage',
        payload: {
          enterpriseName: company.companyName,
          supplierCompanyId: company.companyId,
        },
      }).then((res) => {
        if (res) {
          if (!res.failed) {
            riskEmbedPage.location = res.monitorUrl;
          } else {
            const errPrompt = `<p style="text-align: center">${res.message}</p>`;
            riskEmbedPage.document.body.innerHTML = errPrompt;
          }
        }
      });
    }
  }
}
