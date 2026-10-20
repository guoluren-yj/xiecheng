import React, { Fragment } from 'react';
import moment from 'moment';
import { withRouter } from 'react-router';
import {
  Card,
  Pagination,
  Form,
  Row,
  Col,
  Input,
  Button,
  Tooltip,
  Modal,
  Spin,
  Drawer,
  Avatar,
  Checkbox,
  Table,
  Select,
  Tag,
  DatePicker,
} from 'hzero-ui';
import { map, forEach, isFunction, isEmpty, join, intersectionWith, round, isArray } from 'lodash';
import { PRIVATE_BUCKET, SRM_PLATFORM } from '_utils/config';
import { Bind, Debounce } from 'lodash-decorators';
import Lov from 'components/Lov';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import LovMultiple from '@/routes/components/LovMultiple';
import intl from 'utils/intl';
import querystring from 'querystring';
import {
  isTenantRoleLevel,
  getAccessToken,
  getUserOrganizationId,
  getDateFormat,
  getResponse,
  getCurrentLanguage,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DEBOUNCE_TIME } from 'utils/constants';
import { HZERO_FILE } from 'utils/config';
import { openTab } from 'utils/menuTab';
import { dateRender } from 'utils/renderer';
import { Button as PerButton } from 'components/Permission';
import CommonImport from 'components/Import';

import companyNotFindPng from '@/assets/company-search-icon-no-result.png';
import Invitation from '../Invitation/Invitation';
import InvitationRegisterModal from '../InvitationRegister/InvitationRegisterModel';
import CompanyInformation from './CompanyInformation';
import { queryRiskMonitorType } from '@/services/supplierService';

import styles from './index.less';
import TagList from './TagList';
import Tags from './Tags';

const { Item: FormItem } = Form;
const language = getCurrentLanguage();

/**
 * 左右组件 描述 与 值
 * 值会加上 Tooltip 提示框
 * @param {String} className - 额外的className
 * @param {React.Element} first - 左侧的组件 描述
 * @param {React.Element} second - 右侧的组件 值
 * @example
 *    <Tuple
 *      first={intl.get(`spfm.companySearch.model.company.industry`).d('行业')}
 *      second="计算机，农业，畜牧业"
 *      className={styles['table-item-content']}
 *    />
 */
function Tuple({ className, first, second }) {
  const mergeClassName = `${styles['list-item-content']} ${className || ''}`;
  return (
    <div className={mergeClassName}>
      <div className={styles['list-item-content-first']}>{first}:&nbsp;</div>
      <div className={styles['list-item-content-second']}>
        <Tooltip placement="top" title={second}>
          {second.length > 12 ? `${second.substr(0, 12)}...` : second}
        </Tooltip>
      </div>
    </div>
  );
}
/**
 * @reactProps {Boolean} isSupplier - 是否是 发现采购页面, 如果不是发现采购页面，则是发现供应商
 */
@withRouter
export default class CompanySearch extends React.PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    invitationProps: {
      visible: false,
    },
    displayFlag: true,
    companyInfoVisible: false, // 公司模态框
    visibleModal: false,
    visibleTagList: false,
    companyId: 0,
    industryCategoryParam: [], // 主营品类lov查询参数
    purchaseSelectedRows: [], // 当前登录人对应的采购员
    platformPolicyText: [],
    privacyPolicyText: [], // 采购方公司隐私协议
  };

  componentWillUnmount() {
    this.queryPage.cancel();
  }

  componentDidMount() {
    // 查询当前登录人对应的采购员
    const { isSupplier } = this.props;
    if (isSupplier) {
      this.queryCurrentUserPurchaseAgent();
    } else {
      // 发现采购商，查询平台静态文本
      this.handlePlatformPolicyText();
    }
  }

  /**
   *  查询平台政策文档
   */
  @Bind()
  handlePlatformPolicyText() {
    const { dispatch } = this.props;
    dispatch({
      type: 'companySearchPurchaser/fetchPlatformPolicyText',
      payload: {
        partnerTenantId: 0,
        companyId: 0,
        textCode: 'SRM.SHARE.PERSONAL.INFORMATION',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          platformPolicyText: [res],
        });
      }
    });
  }

  // 查询当前登录人对应的采购员
  @Bind()
  queryCurrentUserPurchaseAgent() {
    const { dispatch } = this.props;
    dispatch({
      type: 'companySearchSupplier/queryCurrentUserPurchaseAgent',
    }).then((res) => {
      if (res) {
        this.setState({ purchaseSelectedRows: res });
      }
    });
  }

  /**
   * 邀请 供应商/采购商 按钮点击
   * 打开 供应商/采购商 邀请模态框
   * @param {Object} company - 公司信息
   * @param {!Number} company.companyId - 公司id
   * @param {!Number} company.tenantId - 公司对应的租户id
   * @param {String} company.companyName - 公司名称
   * @memberof CompanySearch
   */
  @Bind()
  handleInviteBtnClick(company) {
    // 需要打开 邀请模态框
    const { isSupplier, queryOwnCompany, onFetchShowSupplierCategory } = this.props;
    const { invitationProps } = this.state;

    if (isSupplier) {
      queryOwnCompany().then((res) => {
        let defaultCompanyList = [];
        const defaultCompany={};
        if (res) {
          // 默认采购方
          if(res.companyId){
            defaultCompanyList = [{
              companyId: res.companyId,
              companyName: res.companyName,
            }];
            defaultCompany.defaultCompanyId = res.companyId;
            defaultCompany.defaultCompanyName= res.companyName;
          }
          this.setState({
            invitationProps: {
              ...invitationProps,
              isSupplier,
              inviteCompanyName: company.companyName,
              inviteCompanyId: company.companyId,
              inviteTenantId: company.tenantId,
              visible: true,
              inviteData: res, // 邀请合作数据源
              ...defaultCompany,
              defaultCompanyList,
              itemCategorySingleFlag: Number(res.itemCategorySingleFlag || 0), // srm-106903 多选lov变单选标识拆分控制 1-单选
              purchaseAgentSingleFlag: Number(res.purchaseAgentSingleFlag || 0),
              supplierCategorySingleFlag: Number(res.supplierCategorySingleFlag || 0),
            },
          });
        } else {
          this.setState({
            invitationProps: {
              ...invitationProps,
              isSupplier,
              inviteCompanyName: company.companyName,
              inviteCompanyId: company.companyId,
              inviteTenantId: company.tenantId,
              defaultCompanyId,
              defaultCompanyName,
              defaultCompanyList,
              visible: true,
            },
          });
        }
      });
    } else {
      onFetchShowSupplierCategory(company.tenantId).then(() => {
        this.setState({
          invitationProps: {
            ...invitationProps,
            isSupplier,
            inviteCompanyName: company.companyName,
            inviteCompanyId: company.companyId,
            inviteTenantId: company.tenantId,
            visible: true,
          },
        });
      });
    }
  }

  /**
   * 校验黑名单
   */
  @Bind()
  checkBlacklist(company) {
    const { isSupplier, dispatch } = this.props;
    if (isSupplier) {
      dispatch({ type: 'companySearchSupplier/checkBlacklist', payload: company.companyId }).then(
        (res) => {
          if (res) {
            this.handleInviteBtnClick(company);
          }
        }
      );
    } else {
      const { companyId, tenantId } = company;
      // 查询采购方隐私协议
      dispatch({
        type: 'companySearchPurchaser/fetchPurchaserPolicyText',
        payload: { tenantId, companyId },
      })
        .then((res) => {
          if (res) {
            this.setState({
              privacyPolicyText: res,
            });
          }
        })
        .finally(() => {
          this.handleInviteBtnClick(company);
        });
    }
  }

  /**
   * 关闭 供应商/采购商 邀请模态框
   * @memberof CompanySearch
   */
  @Bind()
  hideModal() {
    const { invitationProps } = this.state;
    this.setState({
      invitationProps: {
        ...invitationProps,
        visible: false,
      },
    });
  }

  /**
   * relInvitationRegisterModal - 拿到 邀请注册组件的 引用
   * @memberof CompanySearch
   */
  @Bind()
  relInvitationRegisterModal(invitationRegisterModal) {
    this.invitationRegisterModal = invitationRegisterModal;
  }

  /**
   * 打开 邀请注册 模态框
   * @memberof CompanySearch
   */
  @Bind()
  handleInviteRegisterBtnClick() {
    // 需要打开 邀请注册
    const { invitationRegisterModal } = this;
    const { isSupplier, queryOwnCompany } = this.props;
    if (isSupplier && invitationRegisterModal && isFunction(invitationRegisterModal.showModal)) {
      invitationRegisterModal.showModal();
      queryOwnCompany().then((res) => {
        if (res) {
          invitationRegisterModal.showDefault(res);
        } else {
          invitationRegisterModal.clearDefault();
        }
      });
    }
  }

  /**
   * 一级行业改变,重新设置二级行业
   * @param {Number[]} industryIds - 一级行业的id数组
   */
  @Bind()
  handleIndustryChange(industryIds) {
    const { form, industries: { industryMap = {} } = {} } = this.props;
    const childIndustryIds = form.getFieldValue('childrenIndustryIds') || [];
    if (!isEmpty(industryIds)) {
      let allLegalChildIndustries = [];
      forEach(industryIds, (industryId) => {
        allLegalChildIndustries = allLegalChildIndustries.concat(
          (industryMap[industryId] && industryMap[industryId].children) || []
        );
      });
      const legalChildIndustryIds = intersectionWith(
        childIndustryIds,
        allLegalChildIndustries,
        (industryId, industry) => {
          return industryId === industry.industryId;
        }
      );
      if (legalChildIndustryIds.length !== childIndustryIds.length) {
        form.setFieldsValue({ childrenIndustryIds: legalChildIndustryIds });
      }
    }
    this.handleFormSearch();
  }

  /**
   * 查询表单 查询
   * 调用查询接口
   * @param {e} e - submit 事件
   * @memberof CompanySearch
   */
  @Bind()
  handleFormSearch(e, childrenIndustryFlag = false) {
    const { industries = {} } = this.props;
    if (e && isFunction(e.preventDefault)) {
      e.preventDefault();
    }
    if (childrenIndustryFlag) {
      if (e && industries.childIndustryLength <= e.length) {
        // 所有的 二级行业全部选了, 主营品类lov不传查询参数
        this.setState({ industryCategoryParam: undefined });
      } else {
        this.setState({ industryCategoryParam: e });
      }
    }
    this.queryPage();
  }

  /**
   * 分页改变
   * 调用查询接口
   * @param {Number} current - 页码
   * @param {Number} pageSize - 分页大小
   * @memberof CompanySearch
   */
  @Bind()
  handlePaginationChange(current, pageSize) {
    const { listPage = {} } = this.props;
    this.queryPage({ page: current - 1, size: pageSize, total: listPage.total });
  }

  /**
   * 为了 防抖
   */
  @Debounce(DEBOUNCE_TIME)
  queryPage(pagination) {
    const { queryPage } = this.props;
    if (isFunction(queryPage)) {
      queryPage(pagination);
    }
  }

  /**
   *展示公司信息modal
   *
   * @param {*} srmCompanyId
   * @memberof CompanySearch
   */
  @Bind()
  showCompanyInfo(srmCompanyId) {
    this.props.onQueryCompanyInformation(srmCompanyId);
    this.setState({ companyInfoVisible: true });
  }

  @Bind()
  showTagList(companyId) {
    // this.props.onHandleTags(companyId);
    this.setState({
      visibleTagList: true,
      companyId,
    });
  }

  /**
   * 关闭公司信息modal
   */
  @Bind()
  hideCompanyInfoModal() {
    this.setState({ companyInfoVisible: false });
  }

  @Bind()
  onCompanyInvited(companyId) {
    const { onQueryCompanyInvited } = this.props;
    this.setState({ visibleModal: true, currentCompanyId: companyId });
    onQueryCompanyInvited(companyId);
  }

  @Bind()
  handleImport() {
    openTab({
      key: `/spfm/company-search/batchInviteRegistration/import/SPFM.BATCH_INVITE`,
      title: intl.get('spfm.companySearch.view.invitation.batchInviteRegist').d('批量邀请注册'),
      search: querystring.stringify({
        action: intl.get('spfm.companySearch.view.invitation.batchInviteRegist').d('批量邀请注册'),
      }),
    });
  }

  /**
   * 隐藏详情弹框
   */
  @Bind()
  hiddenModal() {
    this.setState({
      visibleModal: false,
    });
  }

  /**
   * 隐藏标签弹框
   */
  @Bind()
  hiddenTagsModal() {
    this.setState({
      visibleTagList: false,
    });
  }

  /**
   * 下拉框按钮触发
   */
  @Bind()
  handleMenuClick(type) {
    if (type === 'onlyOne') {
      this.handleInviteRegisterBtnClick();
    } else {
      this.handleImport();
    }
  }

  /**
   * 渲染查询表单
   * @memberof CompanySearch
   */
  @Bind()
  renderForm() {
    const {
      form: { getFieldDecorator, getFieldsValue, getFieldValue, setFieldsValue },
      form,
      code,
      industries = {},
      isSupplier,
      searchLabelWidth = 120,
      onlyShowMySupplierFlag,
      onlyShowNoPartnerFlag,
      inviteStatus = [],
      customizeForm = () => {},
    } = this.props;
    const { displayFlag = false } = this.state;
    const formItemLayout = {
      labelCol: {
        style: { width: searchLabelWidth, minWidth: searchLabelWidth, maxWidth: searchLabelWidth },
      },
      wrapperCol: { style: { flex: 'auto' } },
      style: { width: '100%', display: 'flex' },
    };
    // const colGrid = { xxl: 6, xl: 8, md: 12, xs: 24 };
    const formValues = getFieldsValue();
    const selectedIndustry = {};
    const { industries: allIndustries = [] } = industries;
    let containsIndustries = [];
    if (!isEmpty(formValues.industryIds)) {
      forEach(formValues.industryIds, (industryId) => {
        selectedIndustry[industryId] = true;
      });
      forEach(allIndustries, (industry) => {
        if (selectedIndustry[industry.industryId]) {
          containsIndustries = containsIndustries.concat(industry.children || []);
        }
      });
    } else {
      forEach(allIndustries, (industry) => {
        containsIndustries = containsIndustries.concat(industry.children || []);
      });
    }
    return (
      <Form className={styles['search-form']} layout="inline">
        <Row>
          {isSupplier && customizeForm(
            {
              code: 'SPFM.SUPPLIER_SEARCH.QUERY_SUPPLIER_RANGE',
              form,
              isCreate: true,
            },
            <Form className={styles['search-supper-option-form']}>
              <Row>
                <Col span={8}>
                  <FormItem
                    labelCol={{
                      style: {
                        width: searchLabelWidth,
                        minWidth: searchLabelWidth,
                        maxWidth: searchLabelWidth,
                      },
                    }}
                    wrapperCol={{ style: { flex: 'auto' }, span: 24 }}
                  >
                    {getFieldDecorator(`onlyShowMySupplierFlag`, {
                      initialValue: onlyShowMySupplierFlag === 1 ? 1 : 0,
                    })(
                      <Checkbox checkedValue={1} unCheckedValue={0} onChange={this.handleFormSearch}>
                        {intl
                          .get(`spfm.companySearch.view.option.interBusinessShield`)
                          .d('仅查看我的供应商')}
                      </Checkbox>
                    )}
                    <Tooltip
                      title={intl
                        .get(`spfm.companySearch.view.option.interBusinessShieldMessage`)
                        .d('若勾选，则仅展示通过我的二级域名注册的供应商')}
                    >
                      <span className={styles['only-show-supper-option']}>
                        {intl
                          .get(`spfm.companySearch.view.option.interBusinessShieldMessage`)
                          .d('若勾选，则仅展示通过我的二级域名注册的供应商')}
                      </span>
                    </Tooltip>
                  </FormItem>
                </Col>
                <Col span={16}>
                  <FormItem
                    labelCol={{
                      style: {
                        width: searchLabelWidth,
                        minWidth: searchLabelWidth,
                        maxWidth: searchLabelWidth,
                      },
                    }}
                    wrapperCol={{ style: { flex: 'auto' }, span: 24 }}
                  >
                    {getFieldDecorator(`onlyShowNoPartnerFlag`, {
                      initialValue: onlyShowNoPartnerFlag === 1 ? 1 : 0,
                    })(
                      <Checkbox checkedValue={1} unCheckedValue={0} onChange={this.handleFormSearch}>
                        {intl
                          .get(`spfm.companySearch.view.option.viewUncooperativeSuppliers`)
                          .d('仅查看未合作供应商')}
                      </Checkbox>
                    )}
                    <Tooltip
                      title={intl
                        .get(`spfm.companySearch.view.option.viewUncooperativeSuppliersMessage`)
                        .d('若勾选，则仅展示未建立集团级合作伙伴关系的子公司')}
                    >
                      <span className={styles['only-show-supper-option']}>
                        {intl
                          .get(`spfm.companySearch.view.option.viewUncooperativeSuppliersMessage`)
                          .d('若勾选，则仅展示未建立集团级合作伙伴关系的子公司')}
                      </span>
                    </Tooltip>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          )}
        </Row>
        <Row>
          <FormItem>
            {getFieldDecorator('companyName')(
              <Input
                style={{ width: '100%' }}
                dbc2sbc={false}
                placeholder={intl
                  .get(`spfm.companySearch.view.message.companyName.placeholder`)
                  .d('请输入公司名称查询')}
              />
            )}
          </FormItem>
          <FormItem>
            <Button
              onClick={() => {
                this.setState({
                  displayFlag: !displayFlag,
                });
              }}
            >
              {displayFlag
                ? intl.get('hzero.common.button.collected').d('收起查询')
                : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
            </Button>
            <Button
              onClick={this.handleFormSearch}
              htmlType="submit"
              style={{ marginRight: 8, marginLeft: 8 }}
              type="primary"
            >
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
          {/* <span>
            {isSupplier && (
              <FormItem
                labelCol={{
                  style: {
                    width: searchLabelWidth,
                    minWidth: searchLabelWidth,
                    maxWidth: searchLabelWidth,
                  },
                }}
                wrapperCol={{ style: { flex: 'auto' } }}
              >
                {getFieldDecorator(`onlyShowMySupplierFlag`, {
                  initialValue: onlyShowMySupplierFlag === 1 ? 1 : 0,
                })(
                  <Checkbox checkedValue={1} unCheckedValue={0} onChange={this.handleFormSearch}>
                    {intl
                      .get(`spfm.companySearch.view.option.interBusinessShield`)
                      .d('仅查看我的供应商')}
                  </Checkbox>
                )}
              </FormItem>
            )}
            {isSupplier && (
              <span style={{ color: '#999999', lineHeight: '39.9999px' }}>
                {intl
                  .get(`spfm.companySearch.view.option.interBusinessShieldMessage`)
                  .d('若勾选，则仅展示通过我的二级域名注册的供应商')}
              </span>
            )}
          </span> */}
        </Row>
        {displayFlag ? (
          isSupplier ? (
            <React.Fragment>
              <Row>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.companyId')
                      .d('邀请方')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('companyId')(
                      <Lov
                        code="SPFM.USER_AUTHORITY_COMPANY"
                        queryParams={{ organizationId: getUserOrganizationId() }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.inviteStatus')
                      .d('邀请状态')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('inviteStatus', {
                      initialValue: 'ALL',
                    })(
                      <Select>
                        {inviteStatus.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.identifyTimeFrom')
                      .d('认证通过时间从')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('approveFromDate')(
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue('approveToDate') &&
                          moment(getFieldValue('approveToDate')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.identifyTimeTo')
                      .d('认证通过时间至')}
                  >
                    {getFieldDecorator('approveToDate')(
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue('approveFromDate') &&
                          moment(getFieldValue('approveFromDate')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    className={styles['first-form-item']}
                    label={intl.get(`spfm.companySearch.model.company.industry`).d('行业')}
                  >
                    {getFieldDecorator('industryIds')(
                      <LovMulti
                        code="HPFM.INDUSTRY_FIRST"
                        onChange={() => {
                          this.props.form.setFieldsValue({
                            childrenIndustryIds: undefined,
                            industrycategoryIds: undefined,
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.companySearch.model.company.childrenIndustry`)
                      .d('产品服务分类')}
                  >
                    {getFieldDecorator('childrenIndustryIds')(
                      <LovMulti
                        code="HPFM.INDUSTRY_SECOND"
                        queryParams={{
                          industryIds: this.props.form.getFieldValue('industryIds'),
                        }}
                        onChange={() => {
                          this.props.form.setFieldsValue({
                            industrycategoryIds: undefined,
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get('spfm.companySearch.model.companySearch.industryCategoryList')
                      .d('主营品类')}
                  >
                    {getFieldDecorator(
                      'industrycategoryIds',
                      {}
                    )(
                      <LovMulti
                        code="HPFM.INDUSTRY.CATEGORY"
                        queryParams={{
                          industryIds: this.props.form.getFieldValue('childrenIndustryIds'),
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.companySearch.model.company.serviceArea`)
                      .d('送货或服务范围')}
                  >
                    {getFieldDecorator('serviceAreaCodes')(
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        expandable
                        onChange={this.handleFormSearch}
                      >
                        {map(code.serviceArea, (area) => {
                          return (
                            <Select.Option value={area.value} key={area.value}>
                              {area.meaning}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`spfm.companySearch.model.company.capitalRange`).d('注册资本')}
                  >
                    {getFieldDecorator('capitalRanges')(
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        expandable
                        onChange={this.handleFormSearch}
                      >
                        {map(code.registeredCapital, (capital) => {
                          return (
                            <Select.Option value={capital.value} key={capital.value}>
                              {capital.meaning}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.companySearch.model.company.currencyCode`)
                      .d('注册资本币种')}
                  >
                    {getFieldDecorator('currencyCode')(
                      <Lov
                        code="SPFM.CURRENCY"
                        queryParams={{ organizationId: getUserOrganizationId() }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.companySearch.model.company.supplierCategoryId`)
                      .d('标签')}
                  >
                    {getFieldDecorator('supplierCategoryIds')(
                      <LovMultiple
                        textField="categoryDescription"
                        code="SSLM.SUPPLIER_CATEGORY_LABEL_TREE"
                        queryParams={{ organizationId: getUserOrganizationId() }}
                        getCheckboxProps={(record) => {
                          return { disabled: !record.setToLabelFlag };
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`spfm.registerEnterprise.model.view.countryName`).d('注册国家')}
                  >
                    {getFieldDecorator('registeredCountryId')(
                      <Lov
                        code="HPFM.COUNTRY"
                        lovOptions={{ displayField: 'countryName', valueField: 'countryId' }}
                        onChange={(_, lovRecord) => {
                          const { countryCode, quickIndex } = lovRecord || {};
                          const chainFlag = countryCode === 'CN' || quickIndex === 'CN';
                          setFieldsValue({
                            registeredRegionId: undefined,
                            registeredCityId: undefined,
                            registeredDistrictId: undefined,
                            chainFlag,
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`spfm.companySearch.model.company.regionName`).d('注册省份')}
                  >
                    {getFieldDecorator('registeredRegionId')(
                      <LovMulti
                        code="SSLM.REGION"
                        queryParams={{
                          countryId: getFieldValue('registeredCountryId'),
                        }}
                        disabled={!getFieldValue('chainFlag')}
                        onChange={() => {
                          setFieldsValue({
                            registeredCityId: undefined,
                            registeredDistrictId: undefined,
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`spfm.companySearch.model.company.cityName`).d('注册城市')}
                  >
                    {getFieldDecorator('registeredCityId')(
                      <LovMulti
                        code="SSLM.REGION"
                        queryParams={{
                          parentRegionIds: getFieldValue('registeredRegionId'),
                        }}
                        disabled={!getFieldValue('registeredRegionId')}
                        onChange={() => {
                          setFieldsValue({
                            registeredDistrictId: undefined,
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.companySearch.model.company.registerDistrict`)
                      .d('注册区县')}
                  >
                    {getFieldDecorator('registeredDistrictId')(
                      <LovMulti
                        code="SSLM.REGION"
                        queryParams={{
                          parentRegionIds: getFieldValue('registeredCityId'),
                        }}
                        disabled={!getFieldValue('registeredCityId')}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Row>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    className={styles['first-form-item']}
                    label={intl.get(`spfm.companySearch.model.company.industry`).d('行业')}
                  >
                    {getFieldDecorator('industryIds')(
                      <LovMulti
                        code="HPFM.INDUSTRY_FIRST"
                        onChange={() => {
                          this.props.form.setFieldsValue({
                            childrenIndustryIds: undefined,
                            industrycategoryIds: undefined,
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.companySearch.model.company.childrenIndustry`)
                      .d('产品服务分类')}
                  >
                    {getFieldDecorator('childrenIndustryIds')(
                      <LovMulti
                        code="HPFM.INDUSTRY_SECOND"
                        queryParams={{
                          industryIds: this.props.form.getFieldValue('industryIds'),
                        }}
                        onChange={() => {
                          this.props.form.setFieldsValue({
                            industrycategoryIds: undefined,
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get('spfm.companySearch.model.companySearch.industryCategoryList')
                      .d('主营品类')}
                  >
                    {getFieldDecorator(
                      'industrycategoryIds',
                      {}
                    )(
                      <LovMulti
                        code="HPFM.INDUSTRY.CATEGORY"
                        queryParams={{
                          industryIds: this.props.form.getFieldValue('childrenIndustryIds'),
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.companySearch.model.company.serviceArea`)
                      .d('送货或服务范围')}
                  >
                    {getFieldDecorator('serviceAreaCodes')(
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        expandable
                        onChange={this.handleFormSearch}
                      >
                        {map(code.serviceArea, (area) => {
                          return (
                            <Select.Option value={area.value} key={area.value}>
                              {area.meaning}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`spfm.companySearch.model.company.capitalRange`).d('注册资本')}
                  >
                    {getFieldDecorator('capitalRanges')(
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        expandable
                        onChange={this.handleFormSearch}
                      >
                        {map(code.registeredCapital, (capital) => {
                          return (
                            <Select.Option value={capital.value} key={capital.value}>
                              {capital.meaning}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.companySearch.model.company.currencyCode`)
                      .d('注册资本币种')}
                  >
                    {getFieldDecorator('currencyCode')(
                      <Lov
                        code="SPFM.CURRENCY"
                        queryParams={{ organizationId: getUserOrganizationId() }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </React.Fragment>
          )
        ) : null}
      </Form>
    );
  }

  /**
   * 查询数据为空时显示的界面
   * 当发现采购商 isSupplier === true 没有查找到对应的公司时,
   * 显示 邀请注册按钮
   * @memberof CompanySearch
   */
  @Bind()
  renderInviteRegisterBtn() {
    const { isSupplier } = this.props;
    return (
      <div className={styles['company-not-find']}>
        <div className={styles['invite-register']}>
          <img
            src={companyNotFindPng}
            alt={intl.get(`spfm.companySearch.view.option.inviteRegister`).d('邀请注册')}
          />
          <div className={styles.description}>
            <p
              style={{
                fontSize: 18,
                color: '#434e59',
              }}
            >
              {intl.get(`spfm.companySearch.view.message.noResult`).d('没有检索到相关企业')}
            </p>
            {isSupplier && (
              <p
                style={{
                  fontSize: 14,
                  color: '#848587',
                }}
              >
                {intl
                  .get(`spfm.companySearch.view.message.invitePart1`)
                  .d('目标企业还未注册？试试')}
                <a
                  style={{
                    color: '#6c8be0',
                  }}
                  onClick={this.handleInviteRegisterBtnClick}
                >
                  &nbsp;{intl.get(`spfm.companySearch.view.option.inviteRegister`).d('邀请注册')}
                  &nbsp;
                </a>
                {intl.get(`spfm.companySearch.view.message.invitePart2`).d('吧')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * 渲染标签
   * @param {*} list
   */
  @Bind()
  renderTag(tags) {
    // const addCategory = [
    //   {
    //     categoryDescription: intl.get(`spfm.companySearch.view.option.title.addTags`).d('添加标签'),
    //     categoryId: 0,
    //   },
    // ];
    // const categotyAll=[...addCategory, ...tags];
    // console.log(categotyAll);
    // return(<Tag color="orange" onClick={()=>this.showTagList(companyId)}>添加标签</Tag>);
    // const categoryAll = [];
    if (tags) {
      return map(tags, (tag) => {
        return <Tag color="orange">{tag.categoryDescription}</Tag>;
      });
    }
    // }else{
    //   for( let i =0; i++; i<=tags.length) {
    //     if(i<=2){
    //       return(<Tag color="orange">{tags[i].categoryDescription}</Tag>);
    //     }else{
    //       categoryAll.push(tags[i].categoryDescription);
    //     }
    //   }
    // }
  }

  /**
   * 渲染查询到的公司列表
   *
   * @param {Object} list - 后台返回的查询数据
   * @param {Object[]} list.content - 公司信息
   * @returns
   * @memberof CompanySearch
   */
  @Bind()
  renderList(list, isSupplier) {
    const {
      loading: { loadingQueryList, queryPurchaserPolicyTextLoading = false },
      listPage = {},
      showPage,
      customizeBtnGroup = () => {},
    } = this.props;
    const tableItemStyle = {
      padding: 0,
      width: '23.5%',
      height: 380,
      marginRight: 16,
      marginTop: 16,
    };
    const tableItemBodyStyle = {
      padding: 0,
    };
    return (
      <Spin spinning={loadingQueryList || queryPurchaserPolicyTextLoading}>
        <Card bordered={false} bodyStyle={{ padding: 0, marginRight: -23 }}>
          {map(list.content, (company) => {
            const formatValue =
              language === 'en_US'
                ? company.registeredCapital
                  ? round(company.registeredCapital / 100, 8)
                  : company.registeredCapital
                : company.registeredCapital;
            return (
              <Card.Grid
                style={tableItemStyle}
                key={company.companyId}
                className={styles['table-item']}
              >
                <Card
                  title={this.companyHead(company)}
                  bordered={false}
                  bodyStyle={tableItemBodyStyle}
                >
                  <div className={styles['list-item']}>
                    <Tuple
                      first={intl.get(`spfm.companySearch.model.company.industry`).d('行业')}
                      second={join(company.industries, ',')}
                      className={styles['table-item-content']}
                    />
                    <Tuple
                      first={intl
                        .get(`spfm.companySearch.model.company.childrenIndustry`)
                        .d('产品服务分类')}
                      second={join(company.childrenIndustries, ',')}
                      className={styles['table-item-content']}
                    />
                    <Tuple
                      first={intl
                        .get(`spfm.companySearch.model.company.capitalRange`)
                        .d('注册资本')}
                      second={`${
                        company.registeredCapital === undefined
                          ? intl.get('hzero.common.currency.none').d('无')
                          : `${formatValue}${
                              company.currencyName ||
                              intl.get('hzero.common.currency.cny').d('人民币')
                            }(${intl.get(`spfm.common.currency.ten.thousand`).d('万')})`
                      }`}
                      className={styles['table-item-content']}
                    />
                    <Tuple
                      first={intl
                        .get(`spfm.companySearch.model.company.serviceArea`)
                        .d('送货或服务范围')}
                      second={join(company.serviceAreas, ',')}
                      className={styles['table-item-content']}
                    />
                  </div>
                  <div className={styles['table-item-footer']}>
                    {isSupplier ? customizeBtnGroup(
                      {
                        code: 'SPFM.SUPPLIER_SEARCH.LIST.SUPPLIER_BTN_GROUP',
                      },
                      [
                        <Tooltip
                          data-name="invite"
                          title={
                            isSupplier && company.tenantPartnerFlag === 1
                              ? intl
                                  .get(`spfm.companySearch.view.inviteCooperationBtn.tips`)
                                  .d(
                                    '已经与全部子公司建立合作伙伴关系的供应商，邀请合作按钮不能操作'
                                  )
                              : ''
                          }
                        >
                          <Button
                            type="primary"
                            style={{ width: '120px' }}
                            onClick={() => {
                              this.checkBlacklist(company);
                            }}
                            disabled={isSupplier && company.tenantPartnerFlag === 1}
                          >
                            {intl.get('spfm.companySearch.view.option.invite').d('邀请合作')}
                          </Button>
                        </Tooltip>,
                        <Button
                          data-name="riskScan"
                          onClick={() => this.handleSickSacn(company)}
                          style={{ width: '120px', marginLeft: 8 }}
                        >
                          {intl.get(`spfm.companySearch.view.message.riskScan`).d('风险扫描')}
                        </Button>,
                      ]
                    ) : (
                      <Tooltip
                        title={
                          isSupplier && company.tenantPartnerFlag === 1
                            ? intl
                                .get(`spfm.companySearch.view.inviteCooperationBtn.tips`)
                                .d('已经与全部子公司建立合作伙伴关系的供应商，邀请合作按钮不能操作')
                            : ''
                        }
                      >
                        <Button
                          type="primary"
                          style={{ width: '144px' }}
                          onClick={() => {
                            this.checkBlacklist(company);
                          }}
                          disabled={isSupplier && company.tenantPartnerFlag === 1}
                        >
                          {intl.get('spfm.companySearch.view.option.invite').d('邀请合作')}
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                  {isSupplier && (
                    <div
                      style={{
                        textAlign: 'left',
                        height: '81px',
                        lineHeight: '28px',
                        paddingRight: '0px',
                        marginLeft: '20px',
                        overflow: 'hidden',
                      }}
                    >
                      <Tags data={company} showTagList={this.showTagList} />
                    </div>
                  )}
                  {isSupplier && (
                    <div
                      style={{
                        color: '#666',
                        textAlign: 'right',
                        lineHeight: '28px',
                        paddingRight: 16,
                      }}
                    >
                      <span>
                        {company.processDate
                          ? `${intl
                              .get('spfm.supplier.model.supplier.platform.processTime')
                              .d('认证通过时间')}：${dateRender(company.processDate)}`
                          : ''}
                      </span>
                    </div>
                  )}
                </Card>
              </Card.Grid>
            );
          })}
        </Card>
        <div className={styles['content-footer']}>
          {showPage && (
            <Pagination
              {...listPage}
              onChange={this.handlePaginationChange}
              onShowSizeChange={this.handlePaginationChange}
            />
          )}
        </div>
      </Spin>
    );
  }

  /**
   * 点击已认证跳转页面
   */
  @Bind()
  handleJumpPage(companyName) {
    const { isSupplier } = this.props;
    const router = isSupplier ? '/seci/supplier-credit-info' : '/seci/purchaser-credit-info';
    openTab({
      title: intl.get('hzero.common.title.creditInfo').d('企业扩展信息'),
      key: router,
      path: `${router}`,
      icon: 'info',
      search: `companyName=${companyName}`,
      closable: true,
    });
  }

  /**
   * 再渲染公司列表的 公司的头界面
   * @param {Object} company - 公司信息
   * @param {String} company.companyName - 公司名称
   * @memberof CompanySearch
   */
  @Bind()
  companyHead(company = {}) {
    const { isSupplier, primaryColor = '#29BECE' } = this.props;
    // const companyIconColorStyle = { fill: '#8991f1' };
    // const companyIconBorderColorStyle = { fill: '#a5c7ff' };
    // const companyIconBgColorStyle = { fill: '#fff' };
    const {
      companyName = '',
      logoUrl,
      srmCompanyId,
      // certificationStatus,
      invitedFlag,
      companyId,
      rejectFlag,
    } = company;
    const bucketName = PRIVATE_BUCKET;
    const logoNewUrl = `${HZERO_FILE}/v1${
      isTenantRoleLevel() ? `/${getUserOrganizationId()}/` : '/'
    }files/redirect-url?bucketName=${bucketName}&url=${encodeURIComponent(
      logoUrl
    )}&organizationId=${getUserOrganizationId()}&access_token=${getAccessToken()}`;

    const companyAvatar = logoUrl ? (
      <Avatar size={44} className={styles['company-icon']} src={`${logoNewUrl}`} />
    ) : (
      <Avatar size={44} className={styles['company-icon']}>
        {companyName.substr(0, 1)}
      </Avatar>
    );
    return (
      <div>
        <div className={styles['company-head']}>
          {companyAvatar}
          <div className={styles['company-title']}>
            <a
              title={companyName}
              onClick={() => {
                this.showCompanyInfo(srmCompanyId);
              }}
            >
              {companyName}
            </a>
          </div>
        </div>
        <div style={{ float: 'right', fontSize: '12px', display: 'flex' }}>
          {isSupplier && rejectFlag === 1 && (
            <a style={{ marginRight: '8px' }} onClick={() => this.onCompanyInvited(companyId)}>
              {intl.get(`spfm.companySearch.view.message.title.rejectFlag`).d('已拒绝')}
            </a>
          )}
          {isSupplier && invitedFlag === 1 && (
            <a style={{ marginRight: '8px' }} onClick={() => this.onCompanyInvited(companyId)}>
              {intl.get(`spfm.companySearch.view.message.title.invitedFlag`).d('已邀约')}
            </a>
          )}
          {isSupplier && invitedFlag === 0 && (
            <div style={{ color: primaryColor }}>
              {intl.get(`spfm.companySearch.view.message.title.notInvited`).d('未邀约')}
            </div>
          )}
        </div>
      </div>
    );
  }

  @Bind()
  handleSickSacn(company) {
    const { handleEmbedPage, handleToPage } = this.props;
    queryRiskMonitorType().then((res) => {
      const riskMonitorTypeResult = getResponse(res);
      if (riskMonitorTypeResult) {
        const { partnerCode: riskMonitorType } = riskMonitorTypeResult;
        if (riskMonitorType === 'SRD') {
          handleEmbedPage(company);
        }
        if (riskMonitorType === 'ZHENYUN_PARTNER') {
          handleToPage(company);
        }
      }
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport() {
    openTab({
      key: '/spfm/company-search/supplier/import/SPFM.ORG_COMPANY.IMPORT',
      title: intl.get(`spfm.companySearch.view.option.importSupplierGenerate`).d('供应商导入生成'),
      search: querystring.stringify({
        action: intl
          .get(`spfm.companySearch.view.option.importSupplierGenerate`)
          .d('供应商导入生成'),
        backPath: '/spfm/company-search/supplier',
        dataImportButton: false,
      }),
    });
  }

  // 个人供应商导入
  @Bind()
  handlePersonalSupplierImport() {
    openTab({
      key: `/spfm/company-search/personal/import/SPFM.SELF-EMPLOYED.IMPORT`,
      title: intl
        .get('spfm.companySearch.view.invitation.personalSupplierImport')
        .d('个人供应商导入'),
      search: querystring.stringify({
        action: intl
          .get('spfm.companySearch.view.invitation.personalSupplierImport')
          .d('个人供应商导入'),
        backPath: '/spfm/company-search/supplier',
        dataImportButton: false,
      }),
    });
  }

  /**
   * @returns React.Element
   * @memberof CompanySearch
   */
  render() {
    const {
      dispatch,
      isSupplier,
      invite,
      inviteRegister,
      list = {},
      organizationId,
      loading = {},
      code = {},
      queryInvestigateTemplates,
      investigateTemplates = [],
      companyInformation,
      invitedList = [],
      invitedPagination = {},
      tagList = [],
      onQueryCompanyInvited,
      onQuerySupplierCategoryDate, // 查询供应商分类信息的
      supplierCategoryDate, // 供应商分类数据
      inviterData, // 邀请方数据
      onQueryInviterData,
      onHandleTags,
      onSaveTags,
      queryOwnCompany,
      categoryCodeList = [], // 准入品类列表
      loadingFetchcategoryCodeList,
      supplierCategoryFlag = {},
      identityFlag = false,
      lifeCycleList,
      searchSupplierRemote,
    } = this.props;
    const invitedColumns = [
      {
        title: intl.get(`spfm.invitationList.model.invitationList.inviteId`).d('邀请编号'),
        width: 100,
        dataIndex: 'displayInviteIdStr',
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.processStatus`).d('邀约状态'),
        width: 100,
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.inviteTypeMeaning`).d('邀请类型'),
        width: 150,
        dataIndex: 'inviteTypeMeaning',
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.companyName`).d('发起邀请的公司'),
        width: 200,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.creationDate`).d('发出邀请时间'),
        width: 150,
        dataIndex: 'creationDate',
      },
      {
        title: intl.get(`spfm.invitationList.model.invitationList.sendUserName`).d('发起邀请人'),
        width: 150,
        dataIndex: 'sendUserName',
      },
    ];

    const {
      invitationProps = {},
      companyInfoVisible,
      visibleModal = false,
      visibleTagList = false,
      companyId = 0,
      purchaseSelectedRows,
      currentCompanyId,
      platformPolicyText,
      privacyPolicyText,
    } = this.state;
    const headerTitle = isSupplier
      ? intl.get(`spfm.companySearch.view.option.title.supplier`).d('发现供应商')
      : intl.get(`spfm.companySearch.view.option.title.purchaser`).d('发现采购商');
    const tagListrops = {
      onCancel: this.hiddenTagsModal,
      visibleTagList,
      onHandleThandleTagsListags: onHandleTags,
      tagList,
      onHandleTags,
      onSaveTags,
      companyId,
      loading: loading.loadingQuerySupplierCategory,
    };

    const invitationCommonProps = {
      supplierCategoryFlag,
      invite,
      onQuerySupplierCategoryDate,
      supplierCategoryDate,
      inviterData,
      onQueryInviterData,
      investigateTypeList: code.investigateType || [],
      saving: loading.loadingInvite,
    };
    return (
      <React.Fragment>
        <Header title={headerTitle}>
          {isSupplier && identityFlag && (
            <Fragment>
              <PerButton
                type="primary"
                icon="user-add"
                permissionList={[
                  {
                    code: `srm.partner.my-partner.search-supplier.ps.invite-register`,
                    type: 'button',
                    meaning: '发现供应商-邀请供应商',
                  },
                ]}
                onClick={() => this.handleMenuClick('onlyOne')}
              >
                {intl.get(`spfm.companySearch.view.option.inviteRegisterSupplier`).d('邀请供应商')}
              </PerButton>
              <CommonImport
                businessObjectTemplateCode="SPFM.BATCH_INVITE"
                prefixPatch={SRM_PLATFORM}
                refreshButton
                buttonText={intl
                  .get('spfm.companySearch.view.invitation.batchInviteRegist.new')
                  .d('(新)批量邀请注册')}
                buttonProps={{
                  icon: 'archive',
                  type: 'c7n-pro',
                  funcType: 'flat',
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.search-supplier.ps.invite.import.model',
                      type: 'button',
                      meaning: '发现供应商-批量邀约',
                    },
                  ],
                }}
              />
              <PerButton
                type="c7n-pro"
                funcType="flat"
                icon="archive"
                permissionList={[
                  {
                    code: `srm.partner.my-partner.search-supplier.ps.invite-register-batch`,
                    type: 'button',
                    meaning: '发现供应商-批量邀请注册',
                  },
                ]}
                onClick={() => this.handleMenuClick('All')}
              >
                {intl.get('spfm.companySearch.view.invitation.batchInviteRegist').d('批量邀请注册')}
              </PerButton>
              <Tooltip
                placement="top"
                title={intl
                  .get(`spfm.companySearch.view.option.importSupplierPrompt`)
                  .d('供应商信息导入生成并建立邀约')}
              >
                <CommonImport
                  businessObjectTemplateCode="SPFM.ORG_COMPANY.IMPORT"
                  prefixPatch={SRM_PLATFORM}
                  autoExecute={false}
                  refreshButton
                  buttonText={intl
                    .get(`spfm.companySearch.view.option.newImportSupplierGenerate`)
                    .d('(新)供应商导入生成')}
                  buttonProps={{
                    icon: 'archive',
                    type: 'c7n-pro',
                    funcType: 'flat',
                    permissionList: [
                      {
                        code: `srm.partner.my-partner.search-supplier.ps.sup-import-new`,
                        type: 'button',
                        meaning: '发现供应商-供应商导入',
                      },
                    ],
                  }}
                />
              </Tooltip>
              <Tooltip
                placement="top"
                title={intl
                  .get(`spfm.companySearch.view.option.importSupplierPrompt`)
                  .d('供应商信息导入生成并建立邀约')}
              >
                <PerButton
                  type="c7n-pro"
                  funcType="flat"
                  icon="archive"
                  onClick={this.handleBatchImport}
                  permissionList={[
                    {
                      code: `srm.partner.my-partner.search-supplier.ps.sup-import`,
                      type: 'button',
                      meaning: '发现供应商-供应商导入',
                    },
                  ]}
                >
                  {intl
                    .get(`spfm.companySearch.view.option.importSupplierGenerate`)
                    .d('供应商导入生成')}
                </PerButton>
              </Tooltip>
              <CommonImport
                businessObjectTemplateCode="SPFM.SELF-EMPLOYED.IMPORT"
                prefixPatch={SRM_PLATFORM}
                autoExecute={false}
                refreshButton
                buttonText={intl
                  .get('spfm.companySearch.view.invitation.newPersonalSupplierImport')
                  .d('(新)个人供应商导入')}
                buttonProps={{
                  icon: 'archive',
                  type: 'c7n-pro',
                  funcType: 'flat',
                  permissionList: [
                    {
                      code: `srm.partner.my-partner.search-supplier.ps.self-employed-import-new`,
                      type: 'button',
                      meaning: '发现供应商-个人供应商导入',
                    },
                  ],
                }}
              />
              <PerButton
                type="c7n-pro"
                funcType="flat"
                icon="archive"
                permissionList={[
                  {
                    code: `srm.partner.my-partner.search-supplier.ps.self-employed-import`,
                    type: 'button',
                    meaning: '发现供应商-个人供应商导入',
                  },
                ]}
                onClick={() => this.handlePersonalSupplierImport()}
              >
                {intl
                  .get('spfm.companySearch.view.invitation.personalSupplierImport')
                  .d('个人供应商导入')}
              </PerButton>
            </Fragment>
          )}
        </Header>
        <Content style={{ paddingTop: 24 }}>
          <div>{identityFlag && this.renderForm()}</div>
          {identityFlag &&
            (isEmpty(list) ? (
              <Spin />
            ) : isEmpty(list.content) ? (
              this.renderInviteRegisterBtn()
            ) : (
              this.renderList(list, isSupplier)
            ))}
        </Content>
        <Modal
          width={1100}
          destroyOnClose
          visible={invitationProps.visible}
          onCancel={this.hideModal}
          footer={null}
        >
          <Invitation
            {...invitationProps}
            supplierCategoryFlag={supplierCategoryFlag}
            dispatch={dispatch}
            loadingFetchcategoryCodeList={loadingFetchcategoryCodeList}
            categoryCodeList={categoryCodeList}
            hideModal={this.hideModal}
            invite={invite}
            onQuerySupplierCategoryDate={onQuerySupplierCategoryDate}
            supplierCategoryDate={supplierCategoryDate}
            inviterData={inviterData}
            onQueryInviterData={onQueryInviterData}
            organizationId={organizationId}
            investigateTypeList={code.investigateType || []}
            lifeCycleList={lifeCycleList}
            saving={loading.loadingInvite}
            roleTypeSet={code.roleTypeSet || []}
            purchaseSelectedRows={purchaseSelectedRows || []}
            platformPolicyText={platformPolicyText}
            privacyPolicyText={privacyPolicyText}
            searchSupplierRemote={searchSupplierRemote}
          />
        </Modal>
        {isSupplier && (
          <InvitationRegisterModal
            lifeCycleList={lifeCycleList}
            organizationId={organizationId}
            inviteRegister={inviteRegister}
            categoryCodeList={categoryCodeList}
            dispatch={dispatch}
            loadingFetchcategoryCodeList={loadingFetchcategoryCodeList}
            onRef={this.relInvitationRegisterModal}
            confirmLoading={loading.loadingInviteRegister}
            queryInvestigateTemplates={queryInvestigateTemplates}
            queryOwnCompany={queryOwnCompany}
            investigateTemplates={investigateTemplates.content || []}
            investigateType={code.investigateType || []}
            roleTypeSet={code.roleTypeSet || []}
            idd={code.idd || []}
            purchaseSelectedRows={purchaseSelectedRows || []}
            invitationCommonProps={invitationCommonProps}
            searchSupplierRemote={searchSupplierRemote}
          />
        )}
        <Drawer
          width={1000}
          destroyOnClose
          visible={companyInfoVisible}
          onClose={this.hideCompanyInfoModal}
        >
          <CompanyInformation
            companyLoading={loading.companyLoading}
            companyInformation={companyInformation}
            searchSupplierRemote={searchSupplierRemote}
          />
        </Drawer>
        {isSupplier && visibleModal && (
          <Modal
            destroyOnClose
            title={intl
              .get('spfm.companySearch.view.option.title.invitedCompany')
              .d('已邀约的公司')}
            visible={visibleModal}
            width={900}
            onCancel={this.hiddenModal}
            footer={null}
          >
            <Table
              bordered
              loading={loading.loadingInvitedCompany}
              dataSource={isArray(invitedList) ? invitedList : []}
              columns={invitedColumns}
              onChange={(page) => onQueryCompanyInvited(currentCompanyId, page)}
              pagination={invitedPagination}
            />
          </Modal>
        )}
        {isSupplier && visibleTagList && <TagList {...tagListrops} />}
      </React.Fragment>
    );
  }
}
