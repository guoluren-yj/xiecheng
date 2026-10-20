/**
 * Recommend - 供应商生命周期配置 - 淘汰申请单查询界面
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import moment from 'moment';
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import qs from 'querystring';
import uuid from 'uuid/v4';
import {
  isEmpty,
  isString,
  isNull,
  concat,
  uniqBy,
  isFunction,
  isUndefined,
  isBoolean,
} from 'lodash';
import { Form, Tabs, Modal, Spin, Tag } from 'hzero-ui';
import Bind from 'lodash-decorators/bind';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { ExternalCustomizeContext } from 'srm-front-cuz/lib/utils';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import SupplierRelatedDocBtn from '@/routes/SupplierLife/SupplierRelatedDoc';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { checkSupLifesupplierCtgAlter } from '@/services/commonApplicationService';
import {
  querySupplierClassification,
  deleteClassify,
  queryPurchaseHistory,
  queryPurchaseHeader,
  queryPurchaseLines,
  stageSourceKey,
} from '@/routes/SupplierLife/utils';
import remote from 'hzero-front/lib/utils/remote';
import HeaderInfo from './HeaderInfo';
import HeaderBtns from './HeaderBtns';
import PurchaseInform from '../Components/PurchaseInform';
import SupplierClassificationTable from '../Components/Detail/SupplierClassificationTable';
import EnclosureTable from '../Components/Detail/EnclosureTable';
import OperationsRecordModal from '../Components/OperationsRecordModal';

const { confirm } = Modal;
const organizationId = getCurrentOrganizationId();

// 查询时所需的个性化code
const queryUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_SUP_CLASSIFY_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_ATT_LN',
];

// 保存时所需的个性化code
const saveUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_SUP_CLASSIFY_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
  'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_ATT_LN',
];

/**
 * 淘汰申请单
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} eliminateApplication - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ eliminateApplication, commonApplication, loading, user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      tabsPrimaryColor: componentsColor['tabs-primary-color'],
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    eliminateApplication,
    commonApplication,
    user,
    allLoading:
      loading.effects['eliminateApplication/saveEliminate'] ||
      loading.effects['commonApplication/queryLifecycleInfo'] ||
      loading.effects['eliminateApplication/submitEliminate'] ||
      loading.effects['eliminateApplication/deteleForm'] ||
      loading.effects['eliminateApplication/obsoletedEliminate'] ||
      loading.effects['eliminateApplication/queryEliminate'] ||
      loading.effects['commonApplication/querySupplierClassification'] ||
      loading.effects['eliminateApplication/handlePrint'],
    deleteClassifyLoading: loading.effects['commonApplication/deleteClassify'],
    ...themeConfig,
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sslm.commonApplication',
    'sslm.common',
    'sslm.supplierDetail',
    'sslm.supplierReview',
    'spfm.importErp',
    'sslm.supplierInform',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_TAB',
    'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_SUP_CLASSIFY_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.ELIMINATE_RELATED_BTN_FROUP',
    'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_CLASSIFY_BTN_GROUP', // 供应商分类按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_ATT_BTN_GROUP', // 附件按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER_BTNGROUP', // 头部按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_PUR_BTN_GROUP', // 采购财务按钮组'
    'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
    'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_ATT_LN',
  ],
})
@remote(
  {
    code: 'SSLM_SUPPlIERLIFE_ElIMINATE', // 德康src-26781 二开埋点
    name: 'elimInateRemote',
  },
  {
    events: {
      cuxHandleSave() {}, // 二开保存按钮逻辑
      cuxHandleSubmit() {}, // 二开提交审批按钮逻辑
      cuxHandleExtraEvents() {}, // 增加额外的二开事件
    },
  }
)
export default class EliminateCreate extends PureComponent {
  constructor(props) {
    super(props);
    const { location, match } = props;
    const readOnly = location.pathname.match('/eliminate-view');
    const isPub = props.location.pathname.includes('/pub/'); // 判断是否为pub页面
    const basePath = match.path.substring(0, match.path.indexOf('/eliminate'));
    const queryParams = qs.parse(location.search.substr(1)); // 是否从列表跳转
    const {
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
      pubEdit = 0,
      sourceType,
    } = queryParams;
    const returnPath = match.path.substring(0, match.path.indexOf('/eliminate-view'));
    const backPath = queryParams.gradeCode
      ? `${returnPath}/supplier-detail?${qs.stringify({
          tenantId,
          companyId,
          partnerCompanyId,
          partnerTenantId,
          supplierCompanyId,
          spfmCompanyId,
          spfmPartnerCompanyId,
          changeReqId,
        })}`
      : queryParams.requisitionId
      ? `${basePath}/stage/${queryParams.toStageId}`
      : basePath;
    this.state = {
      isPub,
      sourceType,
      isEdit: !readOnly,
      backPath,
      requisitionId: null,
      fileList: [],
      readOnly,
      operationsRecordVisible: false,
      tableList: [], // 用于配置表
      pubEditFlag: !!Number(pubEdit), // 判断工作流是否可编辑
      activeKey: 'supplierClassification',
      defaultActiveKey: 'supplierClassification',
      cuxLoading: false, // 二开按钮loading
    };
  }

  getCuzDataSource = []; // 缓存个性化页签数据

  queryCuzData = []; // 缓存个性化页签查询方法

  getSnapshotBeforeUpdate(prevProps) {
    const { supplierCompanyId, requisitionId } = qs.parse(prevProps.location.search.substr(1));
    const { supplierCompanyId: newSupplierCompanyId, requisitionId: newRequisitionId } = qs.parse(
      this.props.location.search.substr(1)
    );
    const changeFlag =
      supplierCompanyId !== newSupplierCompanyId || requisitionId !== newRequisitionId;
    return changeFlag;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.clearData();
      this.loadData();
    }
  }

  componentDidMount() {
    const { onLoad } = this.props;
    const { pubEditFlag } = this.state;
    this.init();
    this.loadData();
    // 查询配置表
    queryRelTableConfig('sslm_life_cycle_eliminate_req').then(res => {
      this.setState({
        tableList: res,
      });
    });

    // 处理工作流审批保存
    if (isFunction(onLoad) && pubEditFlag) {
      onLoad({
        submit: approveResult => {
          return new Promise((resolve, reject) => {
            if (approveResult === 'Approved') {
              this.saveOrSubmit('save', resolve, reject);
            } else {
              resolve();
            }
          });
        },
      });
    }
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    const lovCode = {
      categoryAlterOpsTypeList: 'SSLM.SUPPLIER_CTG_ALTER_TYPE',
      evaluationLevel: 'SSLM.EVALUATION_LEVEL',
      enabledList: 'HPFM.ENABLED_FLAG',
      tenantId: organizationId,
    };
    dispatch({
      type: 'commonApplication/init',
      payload: lovCode,
    });
  }

  /**
   * 组件注销时，清空model
   */
  componentWillUnmount() {
    this.clearData();
  }

  /**
   * 清空model
   */
  @Bind()
  clearData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'eliminateApplication/updateState',
      payload: {
        headerInfo: {},
        enclosureDataSource: [],
        supplierClassifyList: [], // 供应商分类列表
      },
    });
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        code: {}, // 值集集合
        lifecycleInfo: {}, // 供应商生命周期头信息
        supplierClassifyData: [], // 供应商列表信息
        purchaseHeadInfo: {}, // 头数据源
        purchaseList: [], // 行数据源
        purchaseListPagination: {}, // 行分页参数
      },
    });
  }

  /**
   * 查询页面初始数据
   * @param {Object} queryParams - 从路由上获取的查询对象
   */
  @Bind()
  loadData() {
    const { dispatch, location, elimInateRemote } = this.props;
    const queryParams = qs.parse(location.search.substr(1));
    const { requisitionId: reqId } = queryParams;
    if (reqId || reqId === 0) {
      this.setState({ requisitionId: reqId });
      this.queryDetail(reqId);
    } else {
      // 查询申请单所需供应商信息
      dispatch({
        type: 'commonApplication/queryLifecycleInfo',
        payload: {
          ...queryParams,
          customizeUnitCode: ['SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER'],
        },
      }).then(res => {
        if (!isEmpty(res)) {
          const { requisitionId, supplierCompanyId, supplierTenantId, companyId } = res;
          this.setState({ requisitionId });
          if (requisitionId || requisitionId === 0) {
            this.queryDetail(requisitionId);
          } else {
            // 查询供应商分类历史数据
            querySupplierClassification({ dispatch, supplierCompanyId, supplierTenantId });
            // 查询”采购/财务“历史数据
            queryPurchaseHistory({ dispatch, companyId, supplierCompanyId });
            // 埋点增加额外事件
            elimInateRemote.event.fireEvent('cuxHandleExtraEvents', {
              supplierCompanyId,
              toStageCode: res.toStageCode,
              stageCode: res.stageCode,
              updateAttachment: this.updateEnclosure,
              otherProps: this.props,
            });
          }
        }
      });
    }
  }

  /**
   * 查询申请单信息
   */
  @Bind()
  queryDetail(requisitionId) {
    const {
      dispatch,
      user: {
        currentUser: { id },
      },
      commonApplication: { purchaseListPagination },
    } = this.props;
    dispatch({
      type: 'eliminateApplication/queryEliminate',
      payload: {
        requisitionId,
        organizationId,
        customizeUnitCode: queryUnitCode.join(','),
      },
    }).then(data => {
      if (!isEmpty(data)) {
        const { degradeHeader = {} } = data;
        if (!isNull(degradeHeader)) {
          const { createdBy } = degradeHeader;
          if (createdBy !== id) {
            this.setState({ isEdit: false });
          }
        }
      }
    });
    // 查询”采购财务“头信息
    queryPurchaseHeader({ dispatch, requisitionId });
    // 查询”采购财务“行信息
    queryPurchaseLines({ dispatch, requisitionId, page: purchaseListPagination });
    // 刷新配置表数据
    this.fetchModelTableData(requisitionId);
  }

  /**
   * 更新附件表数据
   * @param {Array} data - 更新后的数据
   */
  @Bind()
  updateEnclosure(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'eliminateApplication/updateState',
      payload: {
        enclosureDataSource: data,
      },
    });
  }

  /**
   * 更新附件表数据
   * @param {Array} data - 更新后的数据
   */
  @Bind()
  deleteEnclosure(localRows, attachmentLineIdList) {
    // itemLineIdList
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (!isEmpty(attachmentLineIdList)) {
      dispatch({
        type: 'eliminateApplication/deleteEnclosureData',
        payload: {
          attachmentLineIdList,
          organizationId,
          requisitionId,
        },
      }).then(res => {
        if (res) {
          this.clearRows();
          notification.success();
        }
      });
    }
    dispatch({
      type: 'eliminateApplication/updateState',
      payload: {
        enclosureDataSource: localRows,
      },
    });
  }

  /**
   * 查询模型表数据
   */
  @Bind()
  fetchModelTableData(requisitionId) {
    const { tableList } = this.state;
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        this[n.tableCode].queryDynamicTable({}, requisitionId);
      }
    });
  }

  /**
   * 校验模型表数据
   */
  @Bind()
  checkModelTableData() {
    const { tableList } = this.state;
    let checkModelTableFlag = true;
    let modelDatas = [];
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        const tableData = this[n.tableCode].checkData();
        if (checkModelTableFlag) {
          checkModelTableFlag = tableData;
        }
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        }
      }
    });
    if (!checkModelTableFlag) {
      return false;
    } else {
      return modelDatas;
    }
  }

  /*
   * 获取保存所需参数
   * @param {*} standardFlag - 是否标准单据 用于后端区分标准/二开
   */
  @Bind()
  getParams() {
    const {
      commonApplication: { supplierClassifyData = [] },
      eliminateApplication: { enclosureDataSource = [], supplierClassifyList = [] },
    } = this.props;
    const { requisitionId } = this.state;
    // 存储需保存的数据
    const saveParams = {
      requisitionId,
      organizationId,
      tenantId: organizationId,
      customizeUnitCode: saveUnitCode,
    };
    // 校验标识
    let validateFlag = true;

    // 获取供应商分类
    const supplierClassify = requisitionId ? supplierClassifyList : supplierClassifyData;
    const classifyData = getEditTableData(supplierClassify, ['_status', 'categoryAlterLineId']);
    const isClassify = !!supplierClassify.find(
      n => n._status === 'update' || n._status === 'create'
    );
    if (isClassify && isEmpty(classifyData)) {
      validateFlag = false;
      notification.warning({
        message: intl
          .get('sslm.commonApplication.view.message.classifyWarnMsg')
          .d('请维护【供应商分类】信息'),
      });
      return;
    } else {
      // 保存/提交需全量传给后端
      const firstClassifyData = getEditTableData(supplierClassify);
      const firstCreateList = uniqBy(
        [...firstClassifyData, ...supplierClassify],
        'categoryAlterLineId'
      );
      const finallyList = firstCreateList.map(n => {
        const { _status, categoryAlterLineId, ...others } = n;
        if (requisitionId) {
          if (_status === 'create') {
            return others;
          } else {
            return { ...others, categoryAlterLineId };
          }
        } else {
          return others;
        }
      });
      saveParams.supplierCategoryAlterLines = finallyList;
    }

    // 获取附件
    const editAttachment = getEditTableData(enclosureDataSource, ['_status', 'attachmentLineId']);
    const isModify = !!enclosureDataSource.find(
      n => n._status === 'update' || n._status === 'create'
    );
    if (isModify && isEmpty(editAttachment)) {
      validateFlag = false;
      notification.warning({
        message: intl
          .get('sslm.commonApplication.view.message.attachmentWarnMsg')
          .d('请维护【附件】页签信息'),
      });
      return;
    } else {
      saveParams.degradeAttachmentLines = editAttachment;
    }

    // 校验校验模型表数据
    const modelDatas = this.checkModelTableData();
    if (!modelDatas) {
      validateFlag = false;
      return;
    }
    // 校验个性化页签数据
    const cuzData = this.checkCuzTabData();
    if (!cuzData) {
      validateFlag = false;
      return;
    }

    if (validateFlag) {
      saveParams.modelDatas = [...modelDatas, ...cuzData];
    }

    // 获取"采购/财务信息"
    const purseDate = isUndefined(this.purchaseInform) ? {} : this.purchaseInform.checkData();
    if (purseDate) {
      saveParams.lifeChangeSync = purseDate.lifeChangeSync;
      saveParams.lifeChangeSyncPfs = purseDate.lifeChangeSyncPfs;
    } else {
      validateFlag = false;
      notification.warning({
        message: intl
          .get('sslm.commonApplication.view.message.purchaseWarnMsg')
          .d('请维护【采购/财务信息】'),
      });
      return;
    }

    return { validateFlag, saveParams };
  }

  @Bind()
  setLoading(flag) {
    this.setState({ cuxLoading: flag });
  }

  @Bind()
  handleSubmit({ payload, backPath }) {
    const { dispatch, history } = this.props;
    dispatch({
      type: 'eliminateApplication/submitEliminate',
      payload,
    }).then(res => {
      if (res) {
        history.push(backPath);
        notification.success();
      }
    });
  }

  @Bind()
  handleSave({ payload, resolve, reject }) {
    const { dispatch } = this.props;
    dispatch({
      type: 'eliminateApplication/saveEliminate',
      payload,
    }).then(res => {
      if (res) {
        const { degradeHeader: { requisitionId: newRequisitionId } = {} } = res;
        this.loadData();
        this.queryCuzTabData({ requisitionId: newRequisitionId });
        // this.props.form.resetFields();
        notification.success();
        resolve();
      } else {
        reject(new Error(res));
      }
    });
  }

  /**
   * 保存或者提交所有数据
   * @param {Boolean} flag flag True-保存并提交
   */
  @Bind()
  saveOrSubmit(type, resolve = () => {}, reject = () => {}) {
    const {
      form,
      history,
      elimInateRemote,
      commonApplication: { lifecycleInfo = {} },
      eliminateApplication: { headerInfo = {} },
    } = this.props;
    const { backPath, requisitionId, pubEditFlag } = this.state;
    // 获取头信息
    form.validateFieldsAndScroll({ force: true }, async (err, fieldsValues) => {
      if (!err) {
        const values = fieldsValues;
        values.blacklistExpiryDate =
          values.blacklistExpiryDate &&
          moment(values.blacklistExpiryDate).format(DEFAULT_DATETIME_FORMAT);
        const degradeHeader = requisitionId
          ? {
              ...headerInfo,
              ...values,
              standardFlag: 1,
              pubEdit: Number(pubEditFlag),
            }
          : {
              ...lifecycleInfo,
              fromStageId: lifecycleInfo.stageId,
              ...values,
              standardFlag: 1,
              pubEdit: Number(pubEditFlag),
            };
        const { validateFlag, saveParams } = this.getParams() || {};
        const payload = {
          ...saveParams,
          degradeHeader,
          pubEdit: Number(pubEditFlag),
        };
        const saveEventProps = {
          payload,
          resolve,
          reject,
          onSave: this.handleSave,
          setLoading: this.setLoading,
        };
        const submitEventProps = {
          form,
          payload,
          history,
          backPath,
          setLoading: this.setLoading,
          onSubmit: this.handleSubmit,
        };
        if (validateFlag) {
          switch (type) {
            case 'save':
              if (elimInateRemote && elimInateRemote.event) {
                // 默认返回true,当返回false时走二开逻辑不走标准逻辑
                const res = await elimInateRemote.event.fireEvent('cuxHandleSave', saveEventProps);
                if (!res) {
                  return;
                }
              }
              this.handleSave({ payload, resolve, reject });
              break;
            default:
              checkSupLifesupplierCtgAlter(payload.supplierCategoryAlterLines).then(checked => {
                const isChecked = getResponse(checked);
                if (isBoolean(isChecked)) {
                  confirm({
                    title:
                      isChecked === false
                        ? intl
                            .get('sslm.commonApplication.view.message.supplierCtgCheckedTip')
                            .d('存在要启用的分类已在供应商分类定义被禁用，是否确认提交审批？')
                        : intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
                    onOk: async () => {
                      if (elimInateRemote && elimInateRemote.event) {
                        // 默认返回true,当返回false时走二开逻辑不走标准逻辑
                        const res = await elimInateRemote.event.fireEvent(
                          'cuxHandleSubmit',
                          submitEventProps
                        );
                        if (!res) {
                          return;
                        }
                      }
                      this.handleSubmit({ payload, backPath });
                    },
                  });
                }
              });
              break;
          }
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  }

  /**
   * 删除申请单
   */
  @Bind()
  handleDeteleForm() {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
      iconType: 'info-circle',
      onOk: () => {
        dispatch({
          type: 'eliminateApplication/deteleForm',
          payload: { requisitionId, organizationId },
        }).then(res => {
          if (res) {
            notification.success();
            this.props.history.push('/sslm/supplier-life-manage/manage');
          }
        });
      },
      onCancel() {},
    });
  }

  /**
   * 废弃申请单
   */
  @Bind()
  handleObsoleted() {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    confirm({
      title: intl.get('sslm.commonApplication.message.confirmCancel').d('是否确认废弃?'),
      onOk: () => {
        dispatch({
          type: 'eliminateApplication/obsoletedEliminate',
          payload: { requisitionId, organizationId },
        }).then(res => {
          if (res) {
            notification.success();
            this.props.history.push('/sslm/supplier-life-manage/manage');
          }
        });
      },
    });
  }

  /**
   * 清空附件列表
   */
  @Bind()
  clearFileList() {
    this.setState({
      fileList: [],
    });
  }

  /**
   * 上传modal确定按钮
   */
  @Bind()
  onOk() {
    const {
      dispatch,
      user: {
        currentUser: { id, loginName, realName },
      },
      eliminateApplication: { enclosureDataSource = [] },
    } = this.props;
    const { fileList = [] } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          loginName,
          realName,
          attachmentLineId: uuid(),
          attachmentDesc: file.name,
          attachmentSize: file.size,
          attachmentUrl: file.response,
          uploadUserId: id,
          remark: '',
          tenantId: organizationId,
          _status: 'create',
        }))
      : [];
    dispatch({
      type: 'eliminateApplication/updateState',
      payload: {
        enclosureDataSource: [...enclosureDataSource, ...fileData],
      },
    });
    this.setState({ fileList: [] });
  }

  /**
   * 将上传列表放到state
   * @param {Object} file - 上传的文件
   */
  @Bind()
  setFileList(file) {
    const { fileList = [] } = this.state;
    this.setState({
      fileList: [...fileList, file],
    });
  }

  /**
   * 删除文件回调函数
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'commonApplication/onDraggerUploadRemove',
        payload: {
          bucketName: PRIVATE_BUCKET,
          directory: 'sslm-supplier',
          urls: [file.response],
        },
      }).then(res => {
        if (res) {
          notification.success();
        }
      });
      this.setState({
        fileList: fileList.filter(o => o.uid !== file.uid),
      });
    }
  }

  /**
   * 更新供应商分类
   */
  @Bind()
  handleUpdatClassify(dataList) {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (requisitionId) {
      dispatch({
        type: 'eliminateApplication/updateState',
        payload: {
          supplierClassifyList: dataList,
        },
      });
    } else {
      dispatch({
        type: 'commonApplication/updateState',
        payload: {
          supplierClassifyData: dataList,
        },
      });
    }
  }

  /**
   * 删除供应商分类
   */
  @Bind()
  handleDeleteClassify(newList, remoteRows) {
    const { dispatch } = this.props;
    this.handleUpdatClassify(newList);
    if (!isEmpty(remoteRows)) {
      deleteClassify({ dispatch, remoteRows });
    }
  }

  /**
   * 打印
   */
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    dispatch({
      type: 'eliminateApplication/handlePrint',
      payload: {
        requisitionId,
      },
    }).then(res => {
      if (res) {
        if (res.type.indexOf('application/json') > -1) {
          notification.warning({
            description: intl
              .get(`sslm.common.view.printwarning.noTemplate`)
              .d('未设置打印模板，不可打印'),
          });
          return;
        }
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  @Bind()
  openOperationsRecordModal() {
    this.setState({ operationsRecordVisible: true });
  }

  /**
   * 校验个性化页签数据
   */
  @Bind()
  checkCuzTabData() {
    let checkCuzDataFlag = true;
    let cuzData = [];
    if (!isEmpty(this.getCuzDataSource)) {
      this.getCuzDataSource.forEach(getData => {
        if (isFunction(getData)) {
          const cuzDataSource = getData();
          if (checkCuzDataFlag) {
            checkCuzDataFlag = cuzDataSource;
          }
          if (cuzDataSource) {
            cuzData = concat(cuzData, cuzDataSource);
          }
        }
      });
    }
    if (!checkCuzDataFlag) {
      return false;
    } else {
      return cuzData;
    }
  }

  /**
   * 查询个性化页签数据
   */
  @Bind()
  queryCuzTabData(param = {}) {
    if (!isEmpty(this.queryCuzData)) {
      this.queryCuzData.forEach(queryData => {
        if (isFunction(queryData)) {
          queryData(param);
        }
      });
    }
  }

  @Bind()
  handleCuzDataSource(getDataSource) {
    this.getCuzDataSource.push(getDataSource);
  }

  @Bind()
  handleQueryCuzData(queryData) {
    this.queryCuzData.push(queryData);
  }

  // tab改变的回调
  @Bind()
  handleTabsChange = key => {
    this.setState({ activeKey: key });
  };

  @Bind()
  handleCustDefaultActive(key) {
    this.setState({ defaultActiveKey: key });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      isEdit,
      requisitionId,
      backPath,
      isPub,
      readOnly,
      operationsRecordVisible,
      pubEditFlag,
      tableList,
      cuxLoading,
      sourceType,
      defaultActiveKey,
    } = this.state;
    const {
      form,
      allLoading,
      deleteClassifyLoading,
      commonApplication: { lifecycleInfo = {}, code = {}, supplierClassifyData = [] },
      eliminateApplication: {
        enclosureDataSource = [],
        headerInfo = {},
        supplierClassifyList = [],
      },
      user: { currentUser = {} },
      customizeForm,
      customizeTabPane,
      custLoading,
      customizeTable,
      customizeBtnGroup,
      tabsPrimaryColor,
      elimInateRemote,
      history,
    } = this.props;
    const newLoading = allLoading || cuxLoading;
    const { toStageCode } = lifecycleInfo;
    const { targetStageCode, targetStageDescription } = headerInfo;
    const newHeaderInfo = isEmpty(headerInfo) ? lifecycleInfo : headerInfo;
    // 德康src-26781 二开埋点
    const reqId = elimInateRemote
      ? elimInateRemote.process('SSLM_SUPPLIERLIFE_ELIMINATE_OPTION', requisitionId, newHeaderInfo)
      : requisitionId;
    const dataSourceKey = isEmpty(headerInfo) ? 'oldEliminateData' : 'newEliminateData';
    const {
      companyId,
      supplierCompanyId,
      toStageId,
      processStatus,
      dimensionCode,
      requisitionId: newRequisitionId,
      supplierTenantId,
    } = newHeaderInfo;
    const supplierClassify = requisitionId ? supplierClassifyList : supplierClassifyData;
    const newEdit = isEdit && [undefined, 'NEW', 'REJECTED'].includes(processStatus);
    const editProps = { requisitionId, ...newHeaderInfo };
    // // 德康src-26781 二开埋点
    const editeRemote = elimInateRemote
      ? elimInateRemote.process('SSLM_SUPPLIERLIFE_ELIMINATE_EDIT', newEdit, editProps)
      : newEdit;
    const isEditRemote = elimInateRemote
      ? elimInateRemote.process('SSLM_SUPPLIERLIFE_ELIMINATE_ISEDIT', isEdit, editProps)
      : isEdit;

    const resultListRemoteProps = {
      supplierCompanyId,
      allLoading: newLoading,
      requisitionId,
      isEdit: editeRemote,
      targetStageDescription,
      targetStageCode, // 目标阶段
      history,
      handSaveOrSubmit: this.saveOrSubmit,
    };
    // 供应商分类
    const supplierClassificationTableProps = {
      code,
      isEdit: editeRemote,
      deleteLoading: deleteClassifyLoading,
      onDeleteRows: this.handleDeleteClassify,
      dataSource: supplierClassify,
      onUpdateData: this.handleUpdatClassify,
      customizeTable,
      custLoading,
      sourceKey: stageSourceKey.eliminate,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_SUP_CLASSIFY_TABLE',
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_CLASSIFY_BTN_GROUP',
    };
    // 附件
    const enclosureTableProps = {
      isEdit: editeRemote,
      currentUser,
      onOk: this.onOk,
      remote: elimInateRemote,
      dataSource: enclosureDataSource,
      onUpdateRow: this.updateEnclosure,
      onDeleteRows: this.deleteEnclosure,
      onClearRows: ref => {
        this.clearRows = ref;
      },
      setFileList: this.setFileList,
      clearFileList: this.clearFileList,
      onDraggerUploadRemove: this.onDraggerUploadRemove,
      customizeBtnGroup,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_ATT_LN',
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_ATT_BTN_GROUP',
      customizeTable,
      otherProps: this.props,
    };
    // 供应商相关业务单据
    const supplierRelatedDocBtnProps = {
      // isPub,
      companyId,
      toStageId,
      requisitionId,
      supplierCompanyId,
      sourceTarget: 'Eliminate',
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.ELIMINATE_RELATED_DOC',
      customizeUnitBtnCode: 'SSLM.SUPPLIER_LIFE_MANAGE.ELIMINATE_RELATED_BTN_FROUP',
      customizeBtnGroup,
      dimensionCode,
    };
    // 模型
    const modelTableProps = {
      tableList,
      interfaceChange: true,
      relationId: newRequisitionId,
      readOnly: !newEdit,
      readyQuery: !isEmpty(newHeaderInfo),
      queryParams: {
        companyId,
        supplierCompanyId,
        supplierTenantId,
      },
      parentRef: this,
    };

    let title;
    if (toStageCode === 'ELIMINATED' || targetStageCode === 'ELIMINATED') {
      const titleType = newHeaderInfo.toStageDescription || newHeaderInfo.targetStageDescription;
      title = newEdit
        ? requisitionId
          ? `${titleType}${intl
              .get(`sslm.commonApplication.view.title.applicationMaintain`)
              .d('申请单维护')}`
          : `${titleType}${intl
              .get(`sslm.commonApplication.view.title.applicationCreation`)
              .d('申请单创建')}`
        : `${titleType}${intl.get(`sslm.commonApplication.view.title.application`).d('申请单')}`;
    } else {
      title = newEdit
        ? requisitionId
          ? intl.get('sslm.commonApplication.view.message.title.degrade.edit').d('降级申请单维护')
          : intl.get('sslm.commonApplication.view.message.title.degrade.create').d('降级申请单创建')
        : intl.get('sslm.commonApplication.view.message.title.degrade').d('降级申请单');
    }

    return (
      <React.Fragment>
        <Header title={title} backPath={isPub ? '' : backPath}>
          <HeaderBtns
            loading={newLoading}
            readOnly={readOnly}
            sourceType={sourceType}
            requisitionId={requisitionId}
            customizeBtnGroup={customizeBtnGroup}
            onSave={this.saveOrSubmit}
            editeRemote={editeRemote}
            headerInfo={headerInfo}
            onPrint={this.handlePrint}
            onDetele={this.handleDeteleForm}
            onObsoleted={this.handleObsoleted}
            jump360={handleSupplierDetail}
            onOperat={this.openOperationsRecordModal}
          />
          {/* 宇培供应链埋点 */}
          {elimInateRemote &&
            elimInateRemote.render('ELIM_INATE_HEADER_BTN', <></>, {
              resultListRemoteProps,
            })}
        </Header>
        <Content>
          <Spin spinning={newLoading || false}>
            <div style={{ marginLeft: 16 }}>
              <HeaderInfo
                isEdit={editeRemote}
                form={form}
                headerInfo={newHeaderInfo}
                customizeForm={customizeForm}
                custLoading={custLoading}
                dataSourceKey={dataSourceKey}
                pubEditFlag={pubEditFlag}
              />
            </div>
            {/* 获取个性化页签数据 */}
            <ExternalCustomizeContext.Provider
              value={{
                getCuzDataSource: this.handleCuzDataSource,
                queryCuzData: this.handleQueryCuzData,
              }}
            >
              {customizeTabPane(
                {
                  code: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_TAB',
                  custDefaultActive: key => this.handleCustDefaultActive(key),
                },
                <Tabs
                  animated={false}
                  key={defaultActiveKey}
                  custLoading={custLoading}
                  defaultActiveKey={defaultActiveKey}
                  onChange={this.handleTabsChange}
                  tabBarExtraContent={<SupplierRelatedDocBtn {...supplierRelatedDocBtnProps} />}
                >
                  <Tabs.TabPane
                    tab={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                    key="supplierClassification"
                  >
                    <SupplierClassificationTable {...supplierClassificationTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={
                      <span>
                        {intl.get('sslm.commonApplication.view.message.tab.enclosure').d('附件')}
                        <Tag
                          color={tabsPrimaryColor || '#108ee9'}
                          style={{
                            height: 'auto',
                            lineHeight: '15px',
                            marginLeft: '4px',
                          }}
                        >
                          {enclosureDataSource && Array.isArray(enclosureDataSource)
                            ? enclosureDataSource.length
                            : 0}
                        </Tag>
                      </span>
                    }
                    key="enclosure"
                  >
                    <EnclosureTable {...enclosureTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    forceRender
                    key="purchaseInform"
                    tab={intl
                      .get('sslm.commonApplication.view.message.purchaseInform')
                      .d('采购/财务信息')}
                  >
                    <PurchaseInform
                      isEdit={isEditRemote}
                      custLoading={custLoading}
                      customizeForm={customizeForm}
                      customizeTable={customizeTable}
                      dimensionCode={dimensionCode}
                      requisitionId={requisitionId}
                      onRef={node => {
                        this.purchaseInform = node;
                      }}
                      customizeBtnGroup={customizeBtnGroup}
                      customizeBtnGroupCode="SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_PUR_BTN_GROUP"
                    />
                  </Tabs.TabPane>
                  {getDynamicTable(modelTableProps)}
                </Tabs>
              )}
            </ExternalCustomizeContext.Provider>
          </Spin>
        </Content>

        {/* 操作记录-抽屉 */}
        <OperationsRecordModal
          visible={operationsRecordVisible}
          onClose={() => this.setState({ operationsRecordVisible: false })}
          processType="degrade"
          requisitionId={reqId}
        />
      </React.Fragment>
    );
  }
}
