/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
/*
 * InvitationList - 企业邀约汇总页面
 * @date: 2018/08/07 14:54:51
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Tabs, Modal, Input, Form, Col, Row, Select } from 'hzero-ui';
import { Button } from 'components/Permission';
import querystring from 'querystring';
import PropTypes from 'prop-types';
import { isEmpty, isUndefined, isArray, pickBy, values } from 'lodash';
import { Bind } from 'lodash-decorators';
import pathToRegex from 'path-to-regexp';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentUserId,
} from 'utils/utils';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { SRM_PLATFORM } from '_utils/config';
import { openTab, listenAfterFreeHandler } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Content, Header } from 'components/Page';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import MultiSelectModal from '../Invitation/components/MultiSelectModal';
import LovMulti from '../Invitation/components/LovMultiple';
import PrivacyPolicy from '../Invitation/components/PrivacyPolicy';

const organizationId = getCurrentOrganizationId();

const { TextArea } = Input;
const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const formLayOut = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const currentUserId = getCurrentUserId();

/**
 * 企业邀约汇总页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
const { TabPane } = Tabs;
@withCustomize({
  unitCode: [
    'SPFM.PARTNER_INVITE.CUSTOMER_INVITATION_PROCESSING',
    'SPFM.PARTNER_INVITE.SEND_LIST',
    'SPFM.PARTNER_INVITE.RECEIVE_LIST',
    'SPFM.PARTNER_INVITE.RECEIVE_FILTER',
    'SPFM.PARTNER_INVITE.LIST_TAB',
    'SPFM.PARTNER_INVITE.SEARCH_FORM',
    'SPFM.PARTNER_INVITE.RECEIVE_LIST.BTN_GROUP',
  ],
})
@connect(({ loading, invitationList }) => ({
  loading: loading.effects['invitationList/fetchInviteList'],
  // approveInviteList
  categoryDateLoading: loading.effects['disposeInvite/querySupplierCategoryDate'],
  rejectLoading: loading.effects['invitationList/rejectInviteList'],
  approveLoading: loading.effects['invitationList/approveInviteList'],
  invitationList,
  saveOperatorInfoLoading: loading.effects['disposeInvite/saveOperatorInfo'],
}))
@cacheComponent({ cacheKey: '/spfm/invitation/list' })
@formatterCollections({
  code: [
    'spfm.invitationList',
    'entity.company',
    'spfm.disposeInvite',
    'spfm.common',
    'spfm.invitationRegister',
  ],
})
@Form.create({ fieldNameProp: null })
export default class InvitationList extends Component {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      activeKey: 'send',
      selectedRowKeys: [],
      selectedRows: [],
      selectedChildRows: [],
      selectedPurAgentRowKeys: [],
      supplierCategoryIdList: [],
      aproveFlag: false,
      rejectFlag: false,
      remark: '',
      rejectModalVisible: false,
      approveModalVisible: false,
      supplierCategoryModal: false,
      initialSelect: [],
      approveFormData: {}, // 同意合作弹框表单数据源
      changedFlag: false, // 是否之前修改过供应商分类
      // invitesSendRisk: false, // 是否展示我发出的邀请的风险扫描
      // invitesReceiveRisk: false, // 是否展示我收到的邀请的风险扫描
      purchaseSelectedRows: [], // 我收到的邀约采购员多选
      queryPurchaseList: [], // 存放接口查询的当前登录人对应的采购员
      agreeSupplierVisible: false, // 我收到的邀约同意合作
      platformPolicyText: [],
      platformPolicyVisible: false, // 隐私协议弹窗
      policyText: {},
      verificationPlatFormText: [], // 我收到的邀约同意合作文本弹窗列表
      routerParams,
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: (e) => e,
  };

  componentDidMount() {
    this.queryCode();
    // this.fetchRiskScan();
    this.handleSearchEmit();
    // 监听该页面关闭tab是否刷新
    listenAfterFreeHandler('moduleCustomize', 'close', this.handleMenuTabClose);
    // 查询当前登录人对应的采购员
    this.queryCurrentUserPurchaseAgent();
  }

  componentWillUnmount() {
  }

  /**
   *  查询勾选政策文档
   */
  @Bind()
  fetchSelectPolicyText(selectedRows = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'invitationList/fetchSelectPolicyText',
      payload: {
        partnerInviteList: selectedRows,
        textCode: 'SSLM.INVITE.PRIVACY_AGREEMENT',
      },
    }).then(res => {
      if (res) {
        this.handleAgreeSupplierModal(true);
        this.setState({
          platformPolicyText: res,
        });
      }
    });
  }

  @Bind()
  queryCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invitationList/init',
    });
    dispatch({
      type: 'invitationList/queryLifeCycleStage',
    });
  }

  // 查询当前登录人对应的采购员
  @Bind()
  queryCurrentUserPurchaseAgent() {
    const { dispatch } = this.props;
    dispatch({
      type: 'disposeInvite/queryCurrentUserPurchaseAgent',
    }).then((res) => {
      if (res) {
        this.setState({ queryPurchaseList: res, purchaseSelectedRows: res });
      }
    });
  }

  /**
   * 刷新页面
   * @param {Object} param0
   */
  @Bind()
  handleMenuTabClose({ tabKey }) {
    if (pathToRegex('/spfm/dispose-invite/:inviteId').test(tabKey)) {
      this.handleTabsChange(this.state.activeKey);
    }
  }

  /**
   * 查询发出的邀约汇总列表
   * @param {Object} page - 查询字段
   */
  @Bind()
  handleSearchEmit(page = {}) {
    const { dispatch, location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { startDate, endDate, ...otherFields } = isUndefined(this.emitForm)
      ? {}
      : filterNullValueObject(this.emitForm.getFieldsValue());
    dispatch({
      type: 'invitationList/fetchInviteList',
      payload: {
        page,
        ...routerParams,
        ...otherFields,
        startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
        endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
        searchType: 'send',
        customizeUnitCode: 'SPFM.PARTNER_INVITE.SEND_LIST,SPFM.PARTNER_INVITE.SEARCH_FORM',
      },
    });
  }

  /**
   * 查询收到的邀约汇总列表
   * @param {Object} fields - 查询字段
   */
  @Bind()
  handleSearchReceive(fields, flag) {
    const {
      dispatch,
      location,
      invitationList: { receivePagination },
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { startDate, endDate, ...otherFields } = isUndefined(this.receiveForm)
      ? {}
      : filterNullValueObject(this.receiveForm.getFieldsValue());
    dispatch({
      type: 'invitationList/fetchInviteList',
      payload: {
        ...routerParams,
        page: flag === true ? receivePagination : fields,
        ...otherFields,
        startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
        endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
        searchType: 'receive',
        customizeUnitCode: 'SPFM.PARTNER_INVITE.RECEIVE_LIST,SPFM.PARTNER_INVITE.RECEIVE_FILTER',
      },
    });
  }

  /**
   * 标签页切换的回调
   * @param {String} activeKey - TabKey
   */
  @Bind()
  handleTabsChange(activeKey) {
    const {
      invitationList: { sendPagination, receivePagination },
    } = this.props;
    const action = {
      send: () => {
        this.handleSearchEmit(sendPagination);
      },
      receive: () => {
        this.handleSearchReceive(receivePagination);
      },
    };
    this.setState({
      activeKey,
    });
    if (action[activeKey]) {
      action[activeKey]();
    }
  }

  /**
   * 跳转到详情页
   * @param {Number} inviteId - 邀约Id
   */
  @Bind()
  onHandleToSendDetail(inviteId, record) {
    const search = querystring.stringify({
      status: 'send',
      back: 'invitation',
      pStatus: record.processStatus,
      partnerTenantId: record.inviteTenantId,
    });
    openTab({
      title: intl.get(`spfm.invitationList.view.title.disposeInvite`).d('合作邀约处理'),
      key: `/spfm/dispose-invite/${inviteId}`,
      path: `/spfm/dispose-invite/${inviteId}`,
      icon: 'preview',
      closable: true,
      search,
    });
  }

  /**
   * 跳转到详情页
   * @param {Number} inviteId - 邀约Id
   */
  @Bind()
  onHandleToReceivedDetail(inviteId, record) {
    const search = querystring.stringify({
      status: 'received',
      back: 'invitation',
      pStatus: record.processStatus,
      partnerTenantId: record.tenantId,
    });
    openTab({
      search,
      title: intl.get(`spfm.invitationList.view.title.disposeInvite`).d('合作邀约处理'),
      key: `/spfm/dispose-invite/${inviteId}`,
      path: `/spfm/dispose-invite/${inviteId}`,
      icon: 'preview',
      closable: true,
    });
  }

  /**
   * 分页改变时的回调查询方法
   * @param {object} pagination - 分页参数
   */
  @Bind()
  handleStandardTableChange(page) {
    const { activeKey } = this.state;
    if (activeKey === 'send') {
      this.handleSearchEmit(page);
    } else {
      this.handleSearchReceive(page);
    }
  }

  // 改变拒绝说明
  @Bind()
  handleChangeRemark(e) {
    this.setState({
      remark: e.target.value,
    });
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(selectedRowKeys, addSelectedRows) {
    const {
      invitationList: { receiveList },
    } = this.props;
    const { selectedRows = [] } = this.state;
    const currentRows = receiveList.map(item => item.inviteId);
    const oldRows = selectedRows.filter(item => !currentRows.includes(item.inviteId));
    const newSelectedRow = [...new Set([...oldRows, ...addSelectedRows])];
    if (isEmpty(selectedRowKeys)) {
      this.setState({
        aproveFlag: false,
        rejectFlag: false,
      });
    } else if (newSelectedRow.every(item => item.inviteType === 'SUPPLIER')) {
      if (newSelectedRow.every(item => item.processStatus === 'PENDING')) {
        this.setState({
          aproveFlag: true,
          rejectFlag: true,
        });
      } else if (newSelectedRow.every(item => item.processStatus === 'INVESTIGATE')) {
        this.setState({
          aproveFlag: false,
          rejectFlag: true,
        });
      } else {
        this.setState({
          aproveFlag: false,
          rejectFlag: false,
        });
      }
    } else if (newSelectedRow.every((item) => item.inviteType === 'CUSTOMER')) {
      if (newSelectedRow.every((item) => item.processStatus === 'PENDING')) {
        this.setState({
          aproveFlag: true,
          rejectFlag: true,
        });
      } else if (newSelectedRow.every((item) => item.processStatus === 'SUBMIT')) {
        this.setState({
          aproveFlag: false,
          rejectFlag: true,
        });
      } else {
        this.setState({
          aproveFlag: false,
          rejectFlag: false,
        });
      }
    } else {
      this.setState({
        aproveFlag: false,
        rejectFlag: false,
      });
    }
    this.setState({
      selectedRows: newSelectedRow,
      selectedRowKeys,
    });
  }

  // 我收到的邀约-同意合作弹框表单数据源
  @Bind()
  handleApproveForm(){
    const {dispatch} = this.props;
    dispatch({
      type: "invitationList/fetchApproveForm",
    }).then(res=>{
      if(res){
        this.setState({approveFormData: res});
      }
    });
  }

  // 拒绝弹窗
  @Bind()
  handleRejectModal(flag) {
    this.setState({ rejectModalVisible: flag });
  }

  /**
   * 批量同意
   */
  @Bind()
  handleApprovalApprove(tag) {
    const {
      dispatch,
      form: { validateFields = (e) => e, setFieldsValue },
      form,
    } = this.props;
    const { selectedRowKeys, platformPolicyText } = this.state;
    validateFields((err, formValues) => {
      if (!err) {
        // 获取只有静态文本的对象
        const policyObj = pickBy(formValues, (value, key) => key.includes('policy'));
        // 判断静态文本是否都已阅读
        const valueArray = values(policyObj);
        const isArrayFlag = !!isArray(valueArray);
        let checkedFlag = false;
        if (isArrayFlag) {
          const filterArray = valueArray.filter((n) => !n) || [];
          checkedFlag = isEmpty(filterArray);
        }
        if (checkedFlag) {
          const { supplierCategoryIdList = [], purchaseAgentId, categoryIds } = formValues;
          this.setState({
            approveModalVisible: false,
            agreeSupplierVisible: false,
          });
          dispatch({
            type: 'invitationList/approveInviteList',
            payload: {
              inviteIds: selectedRowKeys,
              supplierCategoryIdList: tag === 'SUPPLIER' ? null : supplierCategoryIdList,
              // 如果是邀请为客户,判断supplierCategoryIdList是否填写如果有填写返回字符串不然为null
              multiSupplierCategoryId:
                tag === 'SUPPLIER'
                  ? null
                  : isArray(supplierCategoryIdList)
                  ? supplierCategoryIdList.join()
                  : null,
              purchaseAgentId,
              categoryIds,
            },
          }).then((res) => {
            if (res !== undefined) {
              notification.success({
                message: intl
                  .get(`spfm.disposeInvite.message.agreeToInvite`)
                  .d('您已同意该合作邀约'),
              });
              setFieldsValue({
                categoryName: undefined,
                purchaseAgentName: undefined,
                purchaseAgentId: undefined,
                categoryIds: undefined,
                supplierCategoryIdList: undefined,
                multiSupplierCategoryId: undefined,
                supplierCategoryCode: undefined,
              });
              this.setState({
                purchaseSelectedRows: [], // 清空采购员
                selectedCategoryRows: [], // 清空品类，
                supplierCategoryCode: [], // 清空供应商分类
                selectedPurAgentRowKeys: [], // 清空供应商分类lov弹窗勾选行
                selectedChildRows: [], // 清空供应商分类lov弹窗勾选行
                initialSelect: [], // 清空供应商分类lov弹窗勾选行
              });
            }
            this.setState({
              selectedRowKeys: [],
              supplierCategoryIdList: [],
              selectedRows: [],
              aproveFlag: false,
              rejectFlag: false,
            });
            this.handleSearchReceive({}, true);
          });
        } else {
          this.setState({verificationPlatFormText: platformPolicyText.filter(n => !form.getFieldValue(`policy${n.textId}`))}, ()=>{
            this.onHandlePolicyModal(this.state.verificationPlatFormText[0]);
          });
        }
      }
    });
  }

  // 审批弹窗
  @Bind()
  handleApproveModal(flag) {
    const {
      form: { setFieldsValue, resetFields },
    } = this.props;
    const { selectedRows, queryPurchaseList = [] } = this.state;
    if (selectedRows.every((item) => item.inviteType === 'SUPPLIER')) {
      // this.handleApprovalApprove('SUPPLIER');
      this.fetchSelectPolicyText(selectedRows);
    } else {
      this.setState({ approveModalVisible: flag, supplierCategoryIdList: [] });
    }
    if (!flag) {
      setFieldsValue({
        categoryName: undefined,
        purchaseAgentName: undefined,
        purchaseAgentId: undefined,
        categoryIds: undefined,
        multiSupplierCategoryId: undefined,
        supplierCategoryCode: undefined,
      });
      this.setState({
        purchaseSelectedRows: [], // 清空采购员
        selectedCategoryRows: [], // 清空品类
        supplierCategoryCode: [], // 清空供应商分类
        selectedPurAgentRowKeys: [], // 清空供应商分类lov弹窗勾选行
        selectedChildRows: [], // 清空供应商分类lov弹窗勾选行
        initialSelect: [], // 清空供应商分类lov弹窗勾选行
      });
    } else {
      this.handleApproveForm();
      // 重置采购员
      this.setState({
        purchaseSelectedRows: queryPurchaseList,
      });
      resetFields(['purchaseAgentId', 'purchaseAgentName']);
    }
  }

  /**
   * 批量拒绝
   */
  @Bind()
  handleApprovalReject() {
    const { dispatch } = this.props;
    const { selectedRowKeys, remark } = this.state;
    confirm({
      title: intl.get('hzero.common.message.confirm.reject').d('是否确认拒绝'),
      onOk: () => {
        this.handleRejectModal(false);
        dispatch({
          type: 'invitationList/rejectInviteList',
          payload: {
            inviteIds: selectedRowKeys,
            processMsg: remark,
          },
        }).then(() => {
          notification.success({
            message: intl.get(`spfm.disposeInvite.message.refuseToInvite`).d('您已拒绝该合作邀约'),
          });
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
            aproveFlag: false,
            rejectFlag: false,
            remark: '',
          });
          this.handleSearchReceive({}, true);
        });
      },
    });
  }

  @Bind()
  handleFecthRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleCancelModal() {
    this.setState({
      supplierCategoryModal: false,
      changedFlag: false,
      // selectedChildRows: [],
      // selectedPurAgentRowKeys: [],
    });
  }

  @Bind()
  handleClear() {
    const { form } = this.props;
    form.setFieldsValue({
      supplierCategoryIdList: [],
      supplierCategoryCode: [],
      multiSupplierCategoryId: '',
    });
    this.setState({
      tags: [],
      supplierCategoryIdList: [],
      supplierCategoryCode: [],
      selectedChildRows: [],
      selectedPurAgentRowKeys: [],
      initialSelect: [],
    });
  }

  /**
   * 更新modal项目采购负责人列表数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  saveRecordRows(selectedRows) {
    const { form } = this.props;
    const { selectedChildRows = [] } = this.state;
    const newSelectedRows = selectedRows || selectedChildRows;
    const supplierCategoryCode = newSelectedRows.map((o) => o.supplierCategoryDescription);
    const supplierCategoryIdList = newSelectedRows.map((o) => o.supplierCategoryId);
    if (supplierCategoryCode) {
      form.registerField('supplierCategoryCode');
      form.setFieldsValue({
        supplierCategoryCode,
        multiSupplierCategoryId: String(supplierCategoryIdList),
      });
    }
    if (supplierCategoryIdList) {
      form.registerField('supplierCategoryIdList');
      form.setFieldsValue({ supplierCategoryIdList });
    }
    this.setState({
      // tags: supplierCategoryIdList,
      supplierCategoryIdList,
      supplierCategoryCode,
      initialSelect: selectedChildRows,
      selectedChildRows: [],
      selectedPurAgentRowKeys: [],
      supplierCategoryModal: false,
    });
  }

  @Bind()
  fetchSupplierDate(page = {}) {
    const fieldValues = isUndefined(this.form) ? {} : this.form.getFieldsValue();
    this.querySupplierCategoryDate({
      page,
      ...fieldValues,
    });
    this.setState({ supplierCategoryModal: true });
  }

  // 多选框
  @Bind()
  handlePurAgentRowSelect(selectedPurAgentRowKeys, selectedChild, rowSelect) {
    if (rowSelect) {
      const includeFlag = selectedPurAgentRowKeys.indexOf(rowSelect.supplierCategoryId);
      if (includeFlag >= 0) {
        selectedPurAgentRowKeys.splice(includeFlag, 1);
        selectedChild.splice(includeFlag, 1);
      } else {
        selectedPurAgentRowKeys.push(rowSelect.supplierCategoryId);
        selectedChild.push(rowSelect);
      }
    }
    const rowIds = selectedChild.map((ele) => ele.supplierCategoryId);
    const { selectedChildRows = [] } = this.state;
    const newRows = selectedChildRows.filter(
      (obj) => selectedPurAgentRowKeys.findIndex((ele) => obj.supplierCategoryId === ele) !== -1
    );
    const dataSource = newRows.filter((ele) => !rowIds.includes(ele.supplierCategoryId));
    this.setState({
      selectedPurAgentRowKeys,
      changedFlag: true,
      selectedChildRows: [...dataSource, ...selectedChild],
    });
  }

  @Bind()
  querySupplierCategoryDate(params) {
    const { dispatch } = this.props;
    dispatch({
      type: `disposeInvite/querySupplierCategoryDate`,
      payload: { ...params },
    }).then((res) => {
      if (res) {
        this.setState({ supplierCategoryDate: res });
      }
    });
  }

  /**
   * 斯瑞德风险扫描内嵌页
   */
  @Bind()
  handleEmbedPage(params) {
    const { dispatch } = this.props;
    const load = intl.get('spfm.common.view.riskMonitoring.loading').d('正在加载');
    const prompt = `<p style="text-align: center">${load}...</p>`;
    const riskEmbedPage = window.open();
    if (riskEmbedPage) {
      // 防止窗口被拦截
      riskEmbedPage.document.body.innerHTML = prompt;
      dispatch({
        type: 'invitationList/riskEmbedPage',
        payload: {
          ...params,
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

  // @Bind()
  // fetchRiskScan() {
  //   this.props
  //     .dispatch({
  //       type: 'invitationList/fetchRiskScan',
  //     })
  //     .then((res) => {
  //       if (isArray(res)) {
  //         res.forEach((item) => {
  //           if (item.scanCode === 'invites_send') {
  //             this.setState({
  //               invitesSendRisk: !!item.enabledFlag,
  //             });
  //           }
  //           if (item.scanCode === 'invites_receive') {
  //             this.setState({
  //               invitesReceiveRisk: !!item.enabledFlag,
  //             });
  //           }
  //         });
  //       }
  //     });
  // }

  /**
   * 校验供应商分类
   */
  @Bind()
  async checkClassify(selectedClassifyRows) {
    const { dispatch } = this.props;
    // const { selectedChildRows = [] } = this.state;
    const supplierCategoryIdList = selectedClassifyRows.map((o) => o.supplierCategoryId);
    const validateFlag = await dispatch({
      type: 'disposeInvite/checkClassify',
      payload: {
        supplierCategoryIdList,
      },
    });
    if (validateFlag) {
      this.saveRecordRows();
      // this.handleCancelModal();
    }
    return validateFlag;
  }

  @Bind()
  changeSelectRows(selectedRows) {
    this.setState({ purchaseSelectedRows: selectedRows });
  }

  /**
   * 保存品类多选数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  onSaveRecord(selectedCategoryRows) {
    const { form, dispatch } = this.props;
    const value = selectedCategoryRows.map((o) => o.categoryName);
    const rowKeys = selectedCategoryRows.map((o) => o.categoryId);
    form.registerField('categoryIds');
    form.setFieldsValue({ categoryIds: rowKeys, categoryName: value });
    if (selectedCategoryRows && selectedCategoryRows.length !== 0) {
      dispatch({
        type: 'disposeInvite/fetchGetPurchaser',
        payload: selectedCategoryRows.map((item) => ({ categoryId: item.categoryId })),
      }).then((res) => {
        if (res && isArray(res)) {
          // 带出多条采购员
          let newRes = [];
          if (isEmpty(res)) {
            newRes = this.state.queryPurchaseList;
          } else {
            newRes = res;
          }
          const purchaseAgentName = newRes.map((item) => item.purchaseAgentName).join();
          const purchaseAgentId = newRes.map((item) => item.purchaseAgentId).join();
          form.setFieldsValue({
            purchaseAgentName,
            purchaseAgentId,
          });
          this.setState({
            purchaseSelectedRows: newRes,
          });
        }
      });
    }
    this.setState({
      selectedCategoryRows,
    });
    // 清空准入品类，清空采购员
    if (isEmpty(selectedCategoryRows)) {
      const { queryPurchaseList } = this.state;
      const purchaseAgentName = queryPurchaseList.map((item) => item.purchaseAgentName).join();
      const purchaseAgentId = queryPurchaseList.map((item) => item.purchaseAgentId).join();
      form.setFieldsValue({
        purchaseAgentName,
        purchaseAgentId,
      });
    }
  }

  /**
   * 获取导出参数
   */
  @Bind()
  getExportParams() {
    const { activeKey, selectedRowKeys } = this.state;
    const filterForm = activeKey === 'receive' ? this.receiveForm : this.emitForm;
    const filterValues = isUndefined(filterForm) ? {} : filterForm.getFieldsValue();
    const { startDate, endDate, ...others } = filterValues;
    const params = {
      ...others,
      startDate: startDate && startDate.format(DATETIME_MIN),
      endDate: endDate && endDate.format(DATETIME_MAX),
      inviteIds: selectedRowKeys,
    };
    return filterNullValueObject(params);
  }

  /**
   * 获取导出url
   */
  @Bind()
  getExportUrl() {
    const { activeKey } = this.state;
    const url =
      activeKey === 'receive'
        ? `${SRM_PLATFORM}/v1/${organizationId}/invites/export`
        : `${SRM_PLATFORM}/v1/${organizationId}/invites/send/export`;
    return url;
  }

  // 静态文本弹框回调
  @Bind()
  modalCallback(n, value) {
    const { dispatch, form } = this.props;
    const { selectedRows, verificationPlatFormText } = this.state;
    if (value) {
      const payload = selectedRows.map((item) => {
        return {
          consentFormProcessor: currentUserId,
          inviteId: item.inviteId,
        };
      });
      // 平台隐私协议调接口保存操作人
      if (n.textCode === 'SRM.SHARE.PERSONAL.INFORMATION') {
        // 保存操作人信息
        dispatch({
          type: `disposeInvite/saveOperatorInfo`,
          payload,
        }).then((res) => {
          if (res) {
            form.setFieldsValue({ [`policy${n.textId}`]: value });
            this.handlePlatformPolicyModal(false);
        }
        });
      } else {
        form.setFieldsValue({ [`policy${n.textId}`]: value });
        this.handlePlatformPolicyModal(false);
      }
    } else {
      form.setFieldsValue({ [`policy${n.textId}`]: value });
      this.handlePlatformPolicyModal(false);
    }
    if(verificationPlatFormText.length > 1 && value) {
      const dataList = verificationPlatFormText.filter(v => v.textId !== n.textId);
      this.setState({verificationPlatFormText: dataList}, ()=>{
        this.onHandlePolicyModal(dataList[0]);
      });
  }
  }

  // 静态文本弹框
  @Bind()
  onHandlePolicyModal(n) {
    this.setState({
      platformPolicyVisible: true,
      policyText: n,
    });
  }

  // 我收到的邀约，邀请供应商同意合作
  @Bind()
  handleAgreeSupplierModal(flag) {
    this.setState({
      agreeSupplierVisible: flag,
    });
  }

  // 平台预定义静态文本
  @Bind()
  handlePlatformPolicyModal(flag) {
    this.setState({
      platformPolicyVisible: flag,
    });
  }

  render() {
    const {
      activeKey,
      selectedRowKeys = [],
      aproveFlag,
      rejectFlag,
      supplierCategoryModal,
      selectedPurAgentRowKeys,
      supplierCategoryDate,
      selectedChildRows,
      changedFlag,
      initialSelect,
      purchaseSelectedRows,
      selectedCategoryRows = [],
      platformPolicyText,
      policyText,
      routerParams,
      approveFormData,
    } = this.state;
    const {
      loading,
      rejectLoading,
      approveLoading,
      categoryDateLoading,
      customizeForm,
      invitationList: {
        sendPagination,
        receivePagination,
        emitList,
        receiveList,
        inviteType,
        processStatus,
        levelTypeYOrNStatus,
        investigateYOrNStatus,
        lifeCycleList,
      },
      form: { getFieldDecorator },
      customizeTable,
      customizeFilterForm,
      customizeTabPane,
      customizeBtnGroup,
      form,
      saveOperatorInfoLoading,
    } = this.props;
    const filterPropsEmit = {
      loading,
      inviteType,
      processStatus,
      levelTypeYOrNStatus,
      investigateYOrNStatus,
      emit: true,
      customizeFilterForm,
      onFilterChange: this.handleSearchEmit,
      onRef: (node) => {
        this.emitForm = node.props.form;
      },
      code: 'SPFM.PARTNER_INVITE.SEARCH_FORM',
      routerParams,
    };
    const filterPropsReceive = {
      loading,
      inviteType,
      processStatus,
      levelTypeYOrNStatus,
      investigateYOrNStatus,
      customizeFilterForm,
      code: 'SPFM.PARTNER_INVITE.RECEIVE_FILTER',
      onFilterChange: this.handleSearchReceive,
      onRef: (node) => {
        this.receiveForm = node.props.form;
      },
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelect,
    };
    const listPropsEmit = {
      loading,
      customizeTable,
      pagination: sendPagination,
      dataSource: emitList,
      emit: true,
      editLine: this.editLine,
      // riskFlag: this.state.invitesSendRisk,
      searchPaging: this.handleStandardTableChange,
      handleToDetail: this.onHandleToSendDetail,
      handleEmbedPage: this.handleEmbedPage,
      code: 'SPFM.PARTNER_INVITE.SEND_LIST',
    };
    const listPropsReceive = {
      loading,
      rowSelection,
      customizeTable,
      pagination: receivePagination,
      dataSource: receiveList,
      editLine: this.editLine,
      // riskFlag: this.state.invitesReceiveRisk,
      searchPaging: this.handleStandardTableChange,
      handleToDetail: this.onHandleToReceivedDetail,
      handleEmbedPage: this.handleEmbedPage,
      code: 'SPFM.PARTNER_INVITE.RECEIVE_LIST',
    };
    const purAgentModel = {
      selectedChildRows: changedFlag ? selectedChildRows : initialSelect,
      supplierCategoryModal,
      supplierCategoryDate,
      onRef: this.handleFecthRef,
      checkClassify: this.checkClassify,
      handleCancelModal: this.handleCancelModal,
      onSaveRecord: this.saveRecordRows,
      fetchSupplierDate: this.fetchSupplierDate,
      handleRowSelect: this.handlePurAgentRowSelect,
      loading: categoryDateLoading,
      selectedRowKeys: changedFlag
        ? selectedPurAgentRowKeys
        : initialSelect.map((ele) => ele.supplierCategoryId),
    };
    const lovClassNames = ['lov-input'];
    lovClassNames.push('lov-suffix');
    // const suffix = (
    //   <React.Fragment>
    //     <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.handleClear} />
    //     <Icon
    //       key="search"
    //       type="search"
    //       onClick={() => this.fetchSupplierDate()}
    //       style={{ cursor: 'pointer', color: '#666' }}
    //     />
    //   </React.Fragment>
    // );

    const policyProps = {
      form,
      platformPolicyText,
      onHandlePolicyModal: this.onHandlePolicyModal,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`spfm.invitationList.view.message.title`).d('企业邀约汇总')}>
          {activeKey === 'receive' ? (
            customizeBtnGroup(
              {
                code: 'SPFM.PARTNER_INVITE.RECEIVE_LIST.BTN_GROUP',
              },
              [
                <Button
                  data-name="agree"
                  type={aproveFlag ? 'primary' : null}
                  icon="check"
                  disabled={!aproveFlag}
                  loading={approveLoading || rejectLoading}
                  permissionList={[
                    {
                      code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                      type: 'button',
                      meaning: '企业合作邀约-按钮组',
                    },
                  ]}
                  onClick={() => this.handleApproveModal(true)}
                >
                  {intl.get('spfm.disposeInvite.view.message.agree').d('同意合作')}
                </Button>,
                <Button
                  data-name="inviteRefuse"
                  icon="exclamation-circle-o"
                  disabled={!rejectFlag}
                  onClick={() => this.handleRejectModal(true)}
                  loading={approveLoading || rejectLoading}
                  permissionList={[
                    {
                      code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                      type: 'button',
                      meaning: '企业合作邀约-按钮组',
                    },
                  ]}
                >
                  {intl.get('spfm.disposeInvite.view.option.inviteRefuse').d('邀约拒绝')}
                </Button>,
                <ExcelExportPro
                  data-name="exportPro"
                  buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
                  templateCode="SRM_C_SRM_SPFM_PARTNER_INVITE_EXPORT" // 导出模板编码
                  requestUrl={this.getExportUrl()} // 导出请求路径
                  queryParams={() => this.getExportParams()} // 导出请求参数
                  otherButtonProps={{
                    type: 'c7n-pro',
                    // funcType: 'flat',
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: 'srm.partner.my-partner.invitation-list.ps.invites.export.new',
                        type: 'button',
                        meaning: '我收到的邀约-导出',
                      },
                    ],
                  }}
                />,
                <ExcelExport
                  data-name="export"
                  requestUrl={this.getExportUrl()}
                  queryParams={this.getExportParams}
                  otherButtonProps={{
                    type: 'c7n-pro',
                    // funcType: 'flat',
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: 'srm.partner.my-partner.invitation-list.ps.invites.export.old',
                        type: 'button',
                        meaning: '我收到的邀约-导出',
                      },
                    ],
                  }}
                />,
              ]
            )
          ) : (
            <React.Fragment>
              <ExcelExportPro
                buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
                templateCode="SRM_C_SRM_SPFM_PARTNER_INVITE_SEND"
                requestUrl={this.getExportUrl()}
                queryParams={() => this.getExportParams()}
                otherButtonProps={{
                  type: 'c7n-pro',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.invitation-list.ps.invites-send.export.new',
                      type: 'button',
                      meaning: '我发出的邀约-导出（新）',
                    },
                  ],
                }}
              />
              <ExcelExport
                requestUrl={this.getExportUrl()}
                queryParams={this.getExportParams}
                otherButtonProps={{
                  type: 'c7n-pro',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.invitation-list.ps.invites-send.export.old',
                      type: 'button',
                      meaning: '我发出的邀约-导出',
                    },
                  ],
                }}
              />
            </React.Fragment>
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          {customizeTabPane(
            {
              code: 'SPFM.PARTNER_INVITE.LIST_TAB',
            },
            <Tabs defaultActiveKey={activeKey} onChange={this.handleTabsChange} animated={false}>
              <TabPane
                tab={intl.get(`spfm.invitationList.view.message.title.send`).d('我发出的邀约')}
                key="send"
              >
                <FilterForm {...filterPropsEmit} />
                <ListTable {...listPropsEmit} />
              </TabPane>
              <TabPane
                tab={intl.get(`spfm.invitationList.view.message.title.receive`).d('我收到的邀约')}
                key="receive"
              >
                <FilterForm {...filterPropsReceive} />
                <ListTable {...listPropsReceive} />
              </TabPane>
            </Tabs>
          )}
        </Content>
        {this.state.rejectModalVisible && (
          <Modal
            title={intl.get(`spfm.disposeInvite.view.modal.reject.title`).d('拒绝原因')}
            visible={this.state.rejectModalVisible}
            onCancel={() => this.handleRejectModal(false)}
            onOk={this.handleApprovalReject}
            okText={intl.get(`spfm.disposeInvite.view.button.reject`).d('拒绝')}
            width={640}
          >
            <TextArea
              rows={16}
              value={this.state.remark}
              onChange={this.handleChangeRemark}
            />
          </Modal>
        )}
        {this.state.approveModalVisible && (
          <Modal
            title={intl
              .get(`spfm.disposeInvite.view.modal.supplierCategoryCode.title`)
              .d('维护供应商分类')}
            visible={this.state.approveModalVisible}
            width={800}
            onCancel={() => this.handleApproveModal(false)}
            onOk={this.handleApprovalApprove}
            okText={intl.get(`spfm.disposeInvite.view.message.agree`).d('同意合作')}
          >
            <div style={{ color: '#999', marginBottom: '30px' }}>
              {intl
                .get('spfm.disposeInvite.view.invitation.supplierCategoryCode')
                .d('同意多个供应商的邀约,已选择的供应商分类将批量维护到供应商分类中')}
            </div>
            <p>
              {customizeForm(
                {
                  code: 'SPFM.PARTNER_INVITE.CUSTOMER_INVITATION_PROCESSING', // 必传，和unitCode一一对应
                  form: this.props.form, // 无论个性化单元是否只读，均必传
                  dataSource: approveFormData, // 必传，从后端接口获取到的数据
                },
                <Form layout="horizontal">
                  <Row style={{ marginBottom: 10 }}>
                    <Col md={12} span={12}>
                      <FormItem
                        label={intl
                          .get(`spfm.invitationRegister.model.invitation.supplierCategoryCode`)
                          .d('供应商分类')}
                        {...formLayOut}
                      >
                        {getFieldDecorator('multiSupplierCategoryId', {
                          initialValue: isArray(selectedChildRows)
                            ? selectedChildRows.map((i) => i.supplierCategoryId).join()
                            : '',
                        })(
                          <LovMulti
                            code="SSLM.SUPPLIER_CATEGORY_TREE"
                            textValue={selectedChildRows
                              .map((i) => i.supplierCategoryDescription)
                              .join()}
                            textField="supplierCategoryDescription"
                            lovOptions={{
                              valueField: 'supplierCategoryId',
                              displayField: 'supplierCategoryDescription',
                            }}
                            queryParams={{ tenantId: organizationId }}
                            selectedRows={selectedChildRows}
                            checkData={this.checkClassify}
                            changeSelectRows={this.saveRecordRows}
                            getCheckboxProps={(record) => ({ disabled: record.hasChild })}
                          />
                          // <Tooltip
                          //   title={isArray(supplierCategoryCode) ? supplierCategoryCode.join() : ''}
                          // >
                          //   <Input
                          //     readOnly={!false}
                          //     suffix={suffix}
                          //     // onChange={e => this.saveRecordRows(e.target.value)}
                          //     className={lovClassNames.join(' ')}
                          //     value={
                          //       isArray(supplierCategoryCode) ? supplierCategoryCode.join() : ''
                          //     }
                          //   />
                          // </Tooltip>
                        )}
                      </FormItem>
                    </Col>
                    <Col md={12} span={12}>
                      <FormItem
                        label={intl
                          .get(`spfm.invitationRegister.model.invitation.purchaseAgentId`)
                          .d('采购员')}
                        {...formLayOut}
                      >
                        {getFieldDecorator('purchaseAgentId', {
                          initialValue: !isEmpty(purchaseSelectedRows)
                            ? purchaseSelectedRows.map((item) => item.purchaseAgentId).join()
                            : '',
                        })(
                          <LovMulti
                            textField="purchaseAgentName"
                            code="SPFM.PURCHASE_AGENT_NOUSER"
                            queryParams={{ tenantId: getCurrentOrganizationId() }}
                            selectedRows={purchaseSelectedRows}
                            changeSelectRows={this.changeSelectRows}
                          />
                        )}
                        {getFieldDecorator('purchaseAgentName', {
                          initialValue: !isEmpty(purchaseSelectedRows)
                            ? purchaseSelectedRows.map((item) => item.purchaseAgentName).join()
                            : '',
                        })}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: 10 }}>
                    <Col md={12} span={12}>
                      <FormItem
                        label={intl
                          .get('spfm.invitationRegister.model.invitation.categoryCode')
                          .d('准入品类')}
                        {...formLayOut}
                      >
                        {getFieldDecorator('categoryId')(
                          <LovMulti
                            textField="categoryName"
                            code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                            queryParams={{
                              hzeroUIFlag: 1,
                              tenantId: getCurrentOrganizationId(),
                              businessObjectCode: 'SRM_C_SRM_SPFM_PARTNER_INVITE',
                            }}
                            selectedRows={selectedCategoryRows}
                            changeSelectRows={this.onSaveRecord}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col md={12} span={12}>
                      <FormItem
                        label={intl
                          .get(`spfm.invitationRegister.model.invitation.lifeCycle`)
                          .d('生命周期')}
                        {...formLayOut}
                      >
                        {getFieldDecorator('toCycleStageId')(
                          <Select allowClear>
                            {lifeCycleList.map((item) => (
                              <Option value={item.value} key={item.value}>
                                {item.meaning}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              )}
            </p>
          </Modal>
        )}
        <MultiSelectModal {...purAgentModel} Key="new" />
        {this.state.agreeSupplierVisible && (
          <Modal
            title={intl.get(`spfm.disposeInvite.view.message.agree`).d('同意合作')}
            visible={this.state.agreeSupplierVisible}
            onCancel={() => this.handleAgreeSupplierModal(false)}
            onOk={() => this.handleApprovalApprove('SUPPLIER')}
            cancelText={intl.get(`hzero.common.button.cance`).d('取消')}
            okText={intl.get(`hzero.common.button.confrim`).d('确认')}
          >
            <Fragment>
              <div style={{ fontSize: 16, marginBottom: 8 }}>
                {intl
                  .get(`spfm.invitationList.view.message.agreeSupplierTips`)
                  .d('确认是否与所选邀请企业建立合作伙伴关系？')}
              </div>
              <PrivacyPolicy {...policyProps} />
            </Fragment>
          </Modal>
        )}
        {this.state.platformPolicyVisible && (
          <Modal
            title={policyText.title}
            visible={this.state.platformPolicyVisible}
            onCancel={() => this.handlePlatformPolicyModal(false)}
            footer={null}
            width={1200}
          >
            <Fragment>
              <div dangerouslySetInnerHTML={{ __html: policyText.text || '' }} />
              <div
                style={{
                  textAlign: 'right',
                  padding: '12px 24px',
                  margin: '0 -24px',
                  borderTop: 'solid 1px #e0e0e0',
                }}
              >
                <Button
                  style={{ marginRight: 8 }}
                  onClick={() => this.modalCallback(policyText, 0)}
                  loading={saveOperatorInfoLoading}
                >
                  {intl.get(`hzero.common.button.notAgree`).d('不同意')}
                </Button>
                <Button
                  type="primary"
                  onClick={() => this.modalCallback(policyText, 1)}
                  loading={saveOperatorInfoLoading}
                >
                  {intl.get(`hzero.common.button.agree`).d('同意')}
                </Button>
              </div>
            </Fragment>
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
