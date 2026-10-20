import React from 'react';
import moment from 'moment';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import CompanySearchDetail from './CompanySearch';

export default class CompanySearchRoute extends React.Component {
  componentDidMount() {
    // const routerParam = qs.parse(this.props.history.location.search.substr(1));
    // const { _back } = routerParam;
    const {
      location: { state: { _back } = {} },
    } = this.props;
    const { isSupplier } = this.state;
    if (_back === -1) {
      this.reloadList();
    } else if (isSupplier) {
      // 查询当前采购方租户任意二级域名开启了新注册，则展示空白
      this.fetchOpenNewRegister();
    } else {
      this.fetchCompanyMainIdentity(false);
    }
  }

  getSnapshotBeforeUpdate(nextProps) {
    const { supplierCompanyName } = querystring.parse(nextProps.location.search.substr(1));
    const { supplierCompanyName: curSupplierCompanyName } = querystring.parse(
      this.props.location.search.substr(1)
    );
    return supplierCompanyName !== curSupplierCompanyName;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.hanldeWorbenchJump();
    }
  }

  // 供应商管理工作台，操作指引跳转进来，需要带供应商名称查询条件
  @Bind()
  hanldeWorbenchJump() {
    const { supplierCompanyName } = querystring.parse(this.props.location.search.substr(1));
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ companyName: supplierCompanyName });
    this.queryPage();
  }

  // 获取companySearch子组件
  companySearch;

  // 查询当前采购方租户任意二级域名是否开启了新注册
  @Bind()
  fetchOpenNewRegister() {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.namespace}/fetchOpenNewRegister`,
    }).then((res) => {
      if (res) {
        const { NewRegisterFlag } = res;
        if(NewRegisterFlag === '1'){
          this.setState({
            identityFlag: false,
          });
          notification.warning({
            message: intl
              .get(`spfm.companySearch.view.message.menuClose`)
              .d('当前功能已下线，请前往【供应商邀约】使用最新版本的功能'),
          });
        }else{
          this.fetchCompanyMainIdentity(true);
        }
      }
    });
  }

  /**
   * 查询租户下公司是否都有[我要采购][我要销售]标识
   */
  @Bind()
  fetchCompanyMainIdentity(isSupplier) {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.namespace}/fetchCompanyMainIdentity`,
    }).then((res) => {
      if (res) {
        const { saleFlag = 0, purchaseFlag = 0 } = res;
        if (isSupplier) {
          if (purchaseFlag) {
            this.handleOnlyShowMySupplier(true);
            this.setState({
              identityFlag: true,
            });
          } else {
            this.setState({
              identityFlag: false,
            });
            notification.warning({
              message: intl
                .get(`spfm.companySearch.view.message.noPermissionMsg`)
                .d('当前租户没有权限操作此功能，请检查采购、销售身份是否维护正确！'),
            });
          }
        } else if (saleFlag) {
          this.queryList();
          this.setState({
            identityFlag: true,
          });
        } else {
          this.setState({
            identityFlag: false,
          });
          notification.warning({
            message: intl
              .get(`spfm.companySearch.view.message.noPermissionMsg`)
              .d('当前租户没有权限操作此功能，请检查采购、销售身份是否维护正确！'),
          });
        }
      }
    });
  }

  /**
   * 初始化 以及 查询一次
   */
  @Bind()
  queryList() {
    const { dispatch } = this.props;
    // 初始化 行业
    dispatch({
      type: `${this.namespace}/initIndustry`,
    });
    const { isSupplier } = this.state;
    const lovCodes = {
      // 送货服务范围值集
      serviceArea: 'SPFM.COMPANY.SERVICE_AREA',
      // 注册资本范围值集
      registeredCapital: 'SPFM.COMPANY.CAPITAL_RANGE',
    };
    if (isSupplier) {
      lovCodes.investigateType = 'SSLM.INVESTIGATE_TYPE';
      lovCodes.investigateTemplateId = 'SSLM.INVESTIGATE_TEMPLATE_ID';
      lovCodes.roleTypeSet = 'SPFM.PARTNER_INVITE_ROLE_TYPE';
      lovCodes.idd = 'HPFM.IDD';
      dispatch({
        type: `${this.namespace}/fetchInviteStatus`,
      });
      dispatch({
        type: `${this.namespace}/queryLifeCycleStage`,
      });
    }
    // 初始化 值集
    dispatch({
      type: `${this.namespace}/batchCode`,
      payload: {
        lovCodes,
      },
    });
    // 查询信息
    this.queryPage();
  }

  /**
   * 通过 form 表单中的值 以及 传过来的分页信息 查询数据
   * 将 分页信息存在 state 中
   * @param {Object} pagination - 分页信息
   */
  @Bind()
  queryPage(pagination = { page: 0, size: 10 }) {
    const {
      form,
      companySearch: { code = {} },
      organizationId,
    } = this.props;

    const formValues = form.getFieldsValue([
      'companyName',
      'companyId',
      'inviteStatus',
      'industryIds',
      'childrenIndustryIds',
      'serviceAreaCodes',
      'capitalRanges',
      'onlyShowMySupplierFlag',
      'onlyShowNoPartnerFlag',
      'approveFromDate',
      'approveToDate',
      'industrycategoryIds',
      'currencyCode',
      'supplierCategoryIds',
      'registeredCountryId',
      'registeredRegionId',
      'registeredCityId',
      'registeredDistrictId',
    ]);
    const { registeredRegionId, registeredCityId, registeredDistrictId, ...others } = formValues;
    const registeredRegionIdsStr = registeredDistrictId || registeredCityId || registeredRegionId;
    const registeredRegionIds = registeredRegionIdsStr
      ? registeredRegionIdsStr.split(',')
      : undefined;
    // 格式化 认证时间从／至
    const approveFromDate =
      formValues.approveFromDate && moment(formValues.approveFromDate).format(DATETIME_MIN);
    const approveToDate =
      formValues.approveToDate && moment(formValues.approveToDate).format(DATETIME_MAX);

    if (
      formValues.serviceAreaCodes &&
      code.serviceArea &&
      code.serviceArea.length <= formValues.serviceAreaCodes.length
    ) {
      // 所有的 服务或送货范围 都选中了,就不传 范围 给后台
      delete formValues.serviceAreaCodes;
    }
    if (
      formValues.capitalRanges &&
      code.registeredCapital &&
      code.registeredCapital.length <= formValues.capitalRanges.length
    ) {
      // 所有的 注册资本 都选中了,就不传 注册资本 给后台
      delete formValues.capitalRanges;
    }
    const params = {
      ...others,
      approveFromDate,
      approveToDate,
      industryIds: formValues.industryIds && formValues.industryIds.split(','),
      childrenIndustryIds:
        formValues.childrenIndustryIds && formValues.childrenIndustryIds.split(','),
      industrycategoryIds:
        formValues.industrycategoryIds && formValues.industrycategoryIds.split(','),
      supplierCategoryIds:
        formValues.supplierCategoryIds && formValues.supplierCategoryIds.split(','),
      registeredRegionIds,
    };

    this.setState({
      pagination,
    });
    this.fetchList({ params, pagination, organizationId });
  }

  /**
   * fetchList - 查询公司
   */
  @Bind()
  fetchList(payload) {
    const { dispatch, location } = this.props;
    const { sourceType, supplierCompanyName } = querystring.parse(location.search.substr(1));
    const { pagination } = payload;
    // 分页改造参数
    const pageFilterParams =
      this.namespace === 'companySearchSupplier'
        ? {
            asyncCountFlag: 'Y',
            oldTotalElements: pagination.total ? pagination.total : undefined,
            customizeUnitCode: 'SPFM.SUPPLIER_SEARCH.QUERY_SUPPLIER_RANGE',
          }
        : {};
    const newPayload = {
      ...payload,
      pagination: {
        ...pagination,
        ...pageFilterParams,
        total: undefined, // 去除查询参数total
      },
    };
    this.setState({
      showPage: this.namespace !== 'companySearchSupplier',
    });
    dispatch({
      type: `${this.namespace}/queryList`,
      payload: newPayload,
    }).then((res) => {
      if (res) {
        // 处理异步分页页码
        if (res.needCountFlag === 'Y') {
          this.handleAsyncPage(newPayload);
        }else {
          this.setState({
            showPage: true,
          });
        }
        // 供应商管理工作台-操作指引，未查询出供应商时，打开邀请供应商弹框
        if (isEmpty(res.content) && sourceType === 'GUIDE') {
          this.companySearch.handleMenuClick('onlyOne');
          if (this.companySearch.invitationRegisterModal) {
            this.companySearch.invitationRegisterModal.props.form.setFieldsValue({
              supplierName: supplierCompanyName,
            });
          }
        }
      }
    });
  }

  /**
   * 处理异步分页页码
   */
  @Bind()
  handleAsyncPage(newPayload) {
    if (this.namespace === 'companySearchSupplier') {
      const { dispatch } = this.props;
      dispatch({
        type: `${this.namespace}/queryListPage`,
        payload: newPayload,
      }).then(() => {
        this.setState({
          showPage: true,
        });
      });
    }
  }

  /**
   * 查询标签
   */
  @Bind()
  handleTags(companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.namespace}/querySupplierCategory`,
      payload: { companyId },
    });
  }

  /**
   * 创建邀约
   * @param {!Object} values
   */
  @Bind()
  invite(values) {
    const { dispatch, organizationId } = this.props;
    const { pagination = { page: 0, size: 10 } } = this.state;
    dispatch({
      type: `${this.namespace}/invite`,
      payload: { ...values, organizationId },
    }).then((res) => {
      if (res) {
        notification.success({
          message: intl
            .get(`spfm.companySearch.view.message.invitatSuccessMsg`)
            .d('您好，您已向对方发起合作邀约，需等待被邀约企业处理，请耐心等待！'),
        });
        this.companySearch.hideModal();
        this.queryPage(pagination);
      }
    });
  }

  /**
   * 标签保存
   */
  @Bind()
  saveTags(values, companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.namespace}/saveSupplierCategoryList`,
      payload: {
        companyId,
        body: values,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.companySearch.hiddenTagsModal();
        this.queryPage();
      }
    });
  }

  /**
   * 依据缓存中的数据 重新查询
   */
  @Bind()
  reloadList() {
    const { pagination = { page: 0, size: 10 } } = this.state;
    this.queryPage(pagination);
  }

  /**
   *  查询是否仅显示我的域名注册的供应商
   */
  @Bind()
  handleOnlyShowMySupplier() {
    const {
      dispatch,
      location,
      form: { setFieldsValue },
    } = this.props;
    dispatch({
      type: `${this.namespace}/fetchOnlyShowMySupplier`,
    }).then((res) => {
      if (res) {
            // 供应商管理工作台-操作指引
            const { supplierCompanyName } = querystring.parse(location.search.substr(1));
            if (supplierCompanyName) {
              setFieldsValue({ companyName: supplierCompanyName });
            }
            this.queryList();
          }
    });
  }

  @Bind()
  fetchShowSupplierCategory(tenantId) {
    const { dispatch } = this.props;
    return dispatch({
      type: `${this.namespace}/fetchShowSupplierCategory`,
      payload: {
        tenantId,
      },
    });
  }

  /**
   * 查询调查表模板
   */
  @Bind()
  queryInvestigateTemplates(params) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `${this.namespace}/queryInvestigateTemplates`,
      payload: {
        organizationId,
        ...params,
      },
    });
  }

  @Bind()
  queryCompanyInformation(companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.namespace}/queryCompanyInformation`,
      payload: { companyId },
    });
  }

  // 查询供应商分类的数据
  @Bind()
  querySupplierCategoryDate(params) {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.namespace}/querySupplierCategoryDate`,
      payload: { ...params },
    });
  }

  // 查询供应商分类的数据
  @Bind()
  queryInviterData(params) {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.namespace}/queryInviterData`,
      payload: { ...params },
    });
  }

  @Bind()
  queryCompanyInvited(companyId, page = {}) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `${this.namespace}/queryCompanyInvited`,
      payload: { tenantId: organizationId, companyId, page },
    });
  }

  @Bind()
  queryOwnCompany(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: `${this.namespace}/companyOwn`,
      payload,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.companySearch = ref || {};
  }

  render() {
    // 根据路径的不同传不同参数给真正的公司查询页面
    const { isSupplier, onlyShowMySupplierFlag, onlyShowNoPartnerFlag, identityFlag, showPage } = this.state;
    const {
      dispatch,
      form,
      organizationId,
      loadingInit = false,
      loadingQueryList = false,
      loadingInvite = false,
      loadingInviteRegister = false,
      loadingInvitedCompany = false,
      loadingQueryInviter = false,
      loadingQuerySupplierCategory = false,
      companyLoading = false,
      primaryColor,
      companySearch: {
        list,
        code = {},
        lifeCycleList,
        codeMap = {},
        industries = {},
        categoryCodeList = [],
        investigateTemplates = {},
        companyInformation = {},
        invitedList = [],
        invitedPagination = {},
        tagList = [],
        supplierCategoryDate = {},
        inviteStatus = [],
        inviterData = {},
        supplierCategoryFlag = {},
        listPage = {},
      },
      queryPurchaserPolicyTextLoading = false,
      customizeBtnGroup,
      customizeForm,
      searchSupplierRemote,
    } = this.props;
    const loading = {
      loadingInit,
      loadingInvite,
      loadingInviteRegister,
      loadingQueryList,
      companyLoading,
      loadingInvitedCompany,
      loadingQuerySupplierCategory,
      loadingQueryInviter,
      queryPurchaserPolicyTextLoading,
    };
    const companySearchProps = {
      customizeBtnGroup,
      customizeForm,
      dispatch,
      lifeCycleList,
      supplierCategoryFlag,
      categoryCodeList,
      onlyShowMySupplierFlag,
      onlyShowNoPartnerFlag,
      loading,
      isSupplier,
      form,
      list,
      invitedList,
      invitedPagination,
      tagList,
      codeMap,
      code,
      industries,
      organizationId,
      companyInformation,
      investigateTemplates,
      onRef: this.handleRef,
      searchLabelWidth: 140,
      queryPage: this.queryPage,
      // 邀请 客户/供应商
      invite: this.invite,
      // 邀请供应商注册
      inviteRegister: this.inviteRegister,
      queryInvestigateTemplates: this.queryInvestigateTemplates,
      onQueryCompanyInformation: this.queryCompanyInformation,
      onQuerySupplierCategoryDate: this.querySupplierCategoryDate, // 查供应商分类数据函数
      onQueryInviterData: this.queryInviterData,
      onQueryCompanyInvited: this.queryCompanyInvited,
      onHandleOnlyShowMySupplier: this.handleOnlyShowMySupplier,
      onFetchShowSupplierCategory: this.fetchShowSupplierCategory,
      onHandleTags: this.handleTags,
      onSaveTags: this.saveTags,
      handleEmbedPage: this.handleEmbedPage,
      handleToPage: this.handleToPage,
      queryOwnCompany: this.queryOwnCompany,
      supplierCategoryDate, // 供应商分类数据
      inviterData, // 邀请方数据
      inviteStatus, // 邀请状态
      identityFlag, // 租户身份标识
      primaryColor,
      listPage,
      showPage,
      searchSupplierRemote,
    };
    return <CompanySearchDetail {...companySearchProps} />;
  }
}
