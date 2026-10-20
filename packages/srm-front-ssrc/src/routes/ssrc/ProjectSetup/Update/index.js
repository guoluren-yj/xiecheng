/**
 * routes 寻源立项-维护／详情
 * @date: 2020-2-24
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Tabs, Modal, Spin, Collapse, Icon } from 'hzero-ui';
import { Modal as C7nModal, DataSet, Attachment } from 'choerodon-ui/pro';
import DynamicButtons from '_components/DynamicButtons';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, filter, isUndefined } from 'lodash';
import uuidv4 from 'uuid/v4';
import { routerRedux, withRouter } from 'dva/router';
import classnames from 'classnames';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import Upload from 'srm-front-boot/lib/components/Upload';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  addItemToPagination,
  getEditTableData,
  delItemToPagination,
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentUserId,
  delItemsToPagination,
  getCurrentUser,
  getResponse,
  getCurrentTenant,
  addItemsToPagination,
} from 'utils/utils';
import { getActiveTabKey } from 'utils/menuTab';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT, DATETIME_MAX } from 'utils/constants';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import remote from 'hzero-front/lib/utils/remote';
import { queryEnableDoubleUnit } from '@/services/commonService';

import { PageSourceSymbol } from '@/utils/constants.js';
import { dateFormate, isText } from '@/utils/utils';
import CommonImport from '@/routes/himp/CommonImportNew';
import {
  fetchUnit,
  changeCompany,
  createQuoteApprovalDetail,
  projectSetupSubmit,
  fetchQualificationInfo,
} from '@/services/projectSetupService';
import {
  fetchBidConfig,
  fetchConfigSheet,
  fetchSourceSupplierRelativeConfig,
} from '@/services/inquiryHallService';
import useOperationRecordModal from '@/routes/components/ProjectOperationRecord/useModal';
import common from '@/routes/ssrc/common.less';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import PurchaseRequestContent from '../../ProjectSetupNew/PurchaseRequestContent';
import PurchaseRequestDS from '../../ProjectSetupNew/PurchaseRequestDS';
import BasicInfo from './BasicInfo';
import ItemLineTable from './ItemLineTable';
import ItemLineImport from './ItemLineImport';
import AddMaterialModal from './AddMaterialModal';
import SupplierLineTable from './SupplierLineTable';
import BulkAddSupplier from './BulkAddSupplier';
import PlanLineTable from './PlanLineTable';
import SectionTable from './SectionTable';
import { SupplierBulkExpiredModalDS } from './SupplierExpireDS';
import SupplierBatchAddExpiredModal from './SupplierBatchAddExpiredModal';

// import UploadFile from '@/routes/components/UploadFile';

const { Panel } = Collapse;
// @withCustomize({
//   unitCode: [
//     'SSRC.PROJECT_SETUP_DETAIL.BASEINFOS',
//     'SSRC.PROJECT_SETUP_DETAIL.LINE_ITEM',
//     'SSRC.PROJECT_SETUP_DETAIL.LINE_SUPPLIER',
//     'SSRC.PROJECT_SETUP_EDIT.BASEINFOS',
//     'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
//     'SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER',
//     'SSRC.PROJECT_SETUP_EDIT.LINE_PLAN',
//     'SSRC.PROJECT_SETUP_DETAIL.LINE_PLAN',
//     'SSRC.PROJECT_SETUP_EDIT.LINE_TAB',
//   ],
// })
// @Form.create({ fieldNameProp: null })
// @formatterCollections({
//   code: [
//     'ssrc.inquiryHall',
//     'ssrc.projectSetup',
//     'ssrc.bidHall',
//     'ssrc.common',
//     'ssrc.sourceTemplate',
//     'ssrc.supplierQuotation',
//     'ssrc.bidEventQuery',
//   ],
// })
// @connect(({ projectSetup, loading }) => ({
//   projectSetup,
//   fetchProjectSetupHeaderLoading: loading.effects['projectSetup/fetchProjectSetupHeader'],
//   createProjectLoading: loading.effects['projectSetup/createProject'],
//   saveProjectSetupLoading: loading.effects['projectSetup/saveProjectSetup'],
//   projectSetupSubmitLoading: loading.effects['projectSetup/projectSetupSubmit'],
//   deleteProjectSetupLoading: loading.effects['projectSetup/deleteProjectSetup'],
//   cancelProjectSetupLoading: loading.effects['projectSetup/cancelProjectSetup'],
//   fetchBulkSupplierDataLoading: loading.effects['projectSetup/fetchBulkSupplierData'],
//   fetchSupplierLoading: loading.effects['projectSetup/fetchSupplier'],
//   saveSupplierLoading: loading.effects['projectSetup/saveSupplier'],
//   deleteSupplierLinesLoading: loading.effects['projectSetup/deleteSupplierLines'],
//   fetchItemLineLoading: loading.effects['projectSetup/fetchItemLine'],
//   deleteItemLinesLoading: loading.effects['projectSetup/deleteItemLines'],
//   fetchPlanLineLoading: loading.effects['projectSetup/fetchPlan'],
//   savePlanLineLoading: loading.effects['projectSetup/savePlanList'],
//   deletePlanLinesLoading: loading.effects['projectSetup/deletePlanLines'],
//   fetchSectionLoading: loading.effects['projectSetup/fetchSectionLine'],
//   saveSectionLoading: loading.effects['projectSetup/saveSectionList'],
//   deleteSectionLinesLoading: loading.effects['projectSetup/deleteSectionLines'],
//   addMaterialLoading: loading.effects['projectSetup/fetchAddMaterialData'],
//   saveMaterialLoading: loading.effects['projectSetup/saveSectionItemLine'],
//   deleteMaterialLoading: loading.effects['projectSetup/deleteSectionItemLine'],
//   fetchExistItemLoading: loading.effects['projectSetup/fetchExistItemLine'],
//   organizationId: getCurrentOrganizationId(),
//   userId: getCurrentUserId(),
// }))
// @withRouter // 防止二开没有传 location  ps: 不可加在此处, 会导致二开继承失败!! 统一移到高阶函数enhancer中
class Update extends Component {
  constructor(props) {
    super(props);

    const { location } = props;

    const routerParams = location ? querystring.parse(location.search.substr(1)) : {};
    const localPathName = location.pathname || '';
    const pathFalg = localPathName.indexOf('detail');
    const { sourceFrom = null, sourcePage = null, current } = routerParams || {};
    const detailFlag = !(pathFalg < 0);

    this.tabTitleMap = {
      sectionLine: intl
        .get(`ssrc.inquiryHall.view.message.tab.sectionInformation`)
        .d('标段/包信息'),
      itemLine: intl.get(`ssrc.inquiryHall.view.message.tab.itemDetails`).d('物品明细'),
      supplierLine: intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表'),
      planLine: intl.get(`ssrc.inquiryHall.view.message.tab.planList`).d('项目计划'),
    };

    this.state = {
      current, // 是否是新寻源大厅跳转回来
      sourcePage, // 页面跳转
      detailFlag, // 是否是详情页
      sourceFrom, // BID/RFX
      collapseKeys: ['baseInfos'], // 折叠面板
      itemLineSelectedRows: [], // item line selected rows
      itemLineSelectedRowKeys: [], // item line selected keys
      supplierLineSelectedRowKeys: [], // 供应商选择keys
      bulkAddSupplierSelectedRows: [], // 批量添加供应商选择rows
      bulkAddSupplierVisible: false,
      sourceProjectStatus: null,
      attachmentUUID: null, // 头上的附件id
      enableChangeFlag: null,
      sectionSelectedRows: [], // 标段/包信息选中行
      sectionSelectedRowKeys: [], // 标段/包信息选中行key
      activeKey: 'itemLine',
      addMaterialVisible: false, // 添加物料Modal
      addMaterialRecord: {},
      addMaterialSelectedRows: [], // 添加物料 rows
      addMaterialSelectedRowKeys: [], // 添加物料  keys
      existItemLineVisible: false, // 已有物料Modal 批量导入
      existItemSelectedRows: [], // 已有物料Modal 批量导入物料 rows
      existItemSelectedRowKeys: [], //  已有物料Modal 批量导入物料  keys
      supplierLinePage: {}, // 供应商列表当前分页信息
      routerParams,
      isBid: false,
      isAll: false,
      supplierConfigOldFlag: true, // 配置表“新建供应商”老ui
      configSheet: {},
      doubleUnitFlag: false, // 判断是否开启双单位
      sourceProject: {}, // 接收头接口返回对象
      qualificationInfo: {}, // 供应商资质信息
      submitLoading: false, // 自定义提交loading
      qualificationInfoLoading: false,
      supplierConfigOldUserFlag: true, // 采购方租户是否在配置表中
    };
    this.SupplierLovDS = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'supplierLovList',
          type: 'object',
          lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
          multiple: true,
        },
      ],
    });
    this.SupplierBulkExpiredLineDS = new DataSet(SupplierBulkExpiredModalDS()); // 供应商资质到期行Ds
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.sourceProjectId || null;
    const id = params.sourceProjectId || null;
    return prevId !== id;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchProjectSetupHeader();
    }
  }

  componentDidMount() {
    console.log('didmount');
    this.queryDoubleUnit();
    this.fetchProjectSetupHeader();
    this.fetchBidConfig();
    this.fetchBatchCode();
    this.fetchSupplierLovConfig();
    this.fetchConfig();
    this.fetchSupplierOldUserConfig();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectSetup/updateState',
      payload: {
        header: {}, // 立项头信息
        itemLine: [],
        itemLinePagination: {},
        supplierLine: [], // supplier
        supplierLinePagination: {},
      },
    });
  }

  purchaseRequestDs = new DataSet(PurchaseRequestDS());

  @Bind()
  async fetchBidConfig() {
    const res = getResponse(await fetchBidConfig({ tenant: getCurrentTenant().tenantNum }));
    if (res) {
      this.setState({
        isBid: Number(res[0]?.newBid || 1),
        isAll: Number(res[0]?.newBid || 1) && Number(res[0]?.oldBid || 0),
      });
    }
  }

  // 查询供应商新老弹窗-配置表
  @Bind()
  fetchSupplierLovConfig = async () => {
    const { organizationId } = this.props;

    try {
      let result = await fetchConfigSheet({
        organizationId,
        configCode: 'source_supplier_lov_old_config',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      if (isEmpty(result)) {
        this.setState({
          supplierConfigOldFlag: false,
        });
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询供应商是否是老租户-配置表
  @Bind()
  fetchSupplierOldUserConfig = async () => {
    const { organizationId } = this.props;
    try {
      let result = await fetchConfigSheet({
        organizationId,
        configCode: 'sslm_life_cycle_new_360_bk',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      if (isEmpty(result)) {
        this.setState({
          supplierConfigOldUserFlag: false,
        });
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询值集
  fetchBatchCode() {
    const { dispatch, ssrcRemote } = this.props;
    const _lovCodes = {
      sourceMethods: 'SSRC.SOURCE_METHOD', // 寻源方式
      sourceCategorys: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      bidSourceCategorys: 'SSRC.SECONDARY_SOURCE_CATEGORY',
      allSourceCategorys: 'SSRC.SECONDARY_SOURCE_CATEGORY_WITH_BID',
      projectPlanStages: 'SSRC.PROJECT_PLAN_STAGE', // 项目阶段
      // sourceType: 'SSRC.SOURCE_TYPE', // 寻源类型
      subjectMater: 'SSRC.SUBJECT_MATTER_RULE', // 标的规则
      rfxConfig: 'SSRC.SOURCE_PROJECT_RFX_CONFIG', // rfxConfig
      idd: 'HPFM.IDD', // 国际冠码
      cuxCategoryTypeList: 'SXFXYFS',
    };
    const lovCodes = ssrcRemote
      ? ssrcRemote.process('SSRC_PROJECT_SETUP_UPDATE_PROCESS_FORM_BATCH_CODE', _lovCodes)
      : _lovCodes;
    dispatch({
      type: 'projectSetup/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * onRef获取子组件
   */
  @Bind()
  onRef(ref) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  fetchProjectSetupHeader(flag, otherProps = {}) {
    const {
      match: { params },
      dispatch,
      form,
      organizationId,
      ssrcRemote = null,
      onFormLoaded,
    } = this.props;
    const { itemLinePagination } = otherProps || {};
    const { sourceProjectId = null } = params;
    const { sourceFrom = null, detailFlag = false } = this.state;
    if (sourceProjectId === 'null') {
      // 给需求部门赋默认值
      fetchUnit().then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const fields = {
            unitId: result.unitId,
            unitName: result.unitName,
          };
          const fieldsDefaultValue = ssrcRemote
            ? ssrcRemote.process(
                'SSRC_PROJECT_SETUP_UPDATE_PROCESS_FORM_EXPAND_FIELDS_DEFAULT_VALUE',
                fields,
                {
                  result,
                }
              )
            : fields;
          form.setFieldsValue(fieldsDefaultValue);
        }
      });
      return;
    }

    dispatch({
      type: 'projectSetup/fetchProjectSetupHeader',
      payload: {
        organizationId,
        sourceFrom,
        sourceProjectId,
        customizeUnitCode: detailFlag
          ? 'SSRC.PROJECT_SETUP_DETAIL.BASEINFOS'
          : 'SSRC.PROJECT_SETUP_EDIT.BASEINFOS',
      },
    }).then((res) => {
      if (res) {
        const expandFields = ssrcRemote
          ? ssrcRemote.process(
              'SSRC_PROJECT_SETUP_UPDATE_PROCESS_HEADER_FORM_UPDATE_EXPAND_FIELDS',
              {},
              {
                headerData: res,
              }
            )
          : {};
        form.setFieldsValue({
          attributeDecimal1: res.attributeDecimal1,
          sourceProjectNum: res.sourceProjectNum, // 用于项目编号非必输情况下, 保存后手动设置
          sourceMember: res.sourceMember,
          totalEstimatedAmount: res.totalEstimatedAmount,
          budgetAmount: res.budgetAmount,
          ...(expandFields || {}),
        });
        this.setState({
          sourceProjectStatus: res.sourceProjectStatus,
          attachmentUUID: res.sourceProjectAttachmentUuid,
          enableChangeFlag: res.enableChangeFlag,
          activeKey: res.subjectMatterRule === 'PACK' && !flag ? 'sectionLine' : 'itemLine',
          sourceProject: res,
        });
        Promise.all([
          this.fetchItemLine(itemLinePagination || 0),
          this.fetchSupplierLine(),
          this.fetchPlanLine(),
          this.fetchSectionLine(),
        ]).finally(() => {
          if (onFormLoaded && typeof onFormLoaded === 'function') {
            onFormLoaded(true);
          }
        });
      }
    });
  }

  /**
   * 比如物料行删除或保存后 要单独查询头接口
   * 单独查询头接口 非整个页面接口信息
   */
  @Bind()
  fetchProjectSetupHeaderData(flag) {
    const {
      match: { params },
      dispatch,
      form,
      organizationId,
      ssrcRemote,
    } = this.props;
    const { sourceProjectId = null } = params;
    const { sourceFrom = null, detailFlag = false } = this.state;

    dispatch({
      type: 'projectSetup/fetchProjectSetupHeader',
      payload: {
        organizationId,
        sourceFrom,
        sourceProjectId,
        customizeUnitCode: detailFlag
          ? 'SSRC.PROJECT_SETUP_DETAIL.BASEINFOS'
          : 'SSRC.PROJECT_SETUP_EDIT.BASEINFOS',
      },
    }).then((res) => {
      if (res) {
        const expandFields = ssrcRemote
          ? ssrcRemote.process(
              'SSRC_PROJECT_SETUP_UPDATE_PROCESS_HEADER_FORM_UPDATE_EXPAND_FIELDS',
              {},
              {
                headerData: res,
              }
            )
          : {};
        form.setFieldsValue({
          attributeDecimal1: res.attributeDecimal1,
          sourceProjectNum: res.sourceProjectNum, // 用于项目编号非必输情况下, 保存后手动设置
          sourceMember: res.sourceMember,
          totalEstimatedAmount: res.totalEstimatedAmount,
          budgetAmount: res.budgetAmount,
          ...(expandFields || {}),
        });
        this.setState({
          sourceProjectStatus: res.sourceProjectStatus,
          attachmentUUID: res.sourceProjectAttachmentUuid,
          enableChangeFlag: res.enableChangeFlag,
          activeKey: res.subjectMatterRule === 'PACK' && !flag ? 'sectionLine' : 'itemLine',
          sourceProject: res,
        });
      }
    });
  }

  // 判断是否/pub 页面
  @Bind()
  isPubPage() {
    const {
      match: { path = null },
    } = this.props;
    let isPub = false;
    if (path) {
      isPub = path.includes('/pub');
    }
    return isPub;
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  /**
   * 物品明细 - 查询
   */
  @Bind()
  async fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      projectSetup: { header = {} },
      ssrcRemote,
    } = this.props;
    const { sourceProjectId = null } = params;
    const { sourceFrom = null, detailFlag = false } = this.state;
    if (sourceProjectId === 'null') {
      return;
    }
    const requestFormPayload = detailFlag
      ? {}
      : {
          // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
          requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
            ? 'change'
            : 'maintain',
        };
    const originRequestParams = {
      page,
      organizationId,
      sourceFrom,
      detailFlag,
      sourceProjectId,
      customizeUnitCode: detailFlag
        ? 'SSRC.PROJECT_SETUP_DETAIL.LINE_ITEM'
        : 'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
      ...requestFormPayload,
    };
    // 埋点处理后的参数
    const remoteFetchItemLineParams = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_PROJECT_SETUP_UPDATE_PROCESS_FETCHITEMLINE_PARAMS',
          originRequestParams,
          {
            header,
            isPubPage: () => {
              return this.isPubPage();
            },
          }
        )
      : originRequestParams;

    await dispatch({
      type: 'projectSetup/fetchItemLine',
      payload: remoteFetchItemLineParams,
    });
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  async fetchSupplierLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    const { sourceProjectId = null } = params;
    const { sourceFrom = null, detailFlag = false } = this.state;
    if (sourceProjectId === 'null') {
      return;
    }
    this.getQualificationInfo();
    await dispatch({
      type: 'projectSetup/fetchSupplier',
      payload: {
        page,
        organizationId,
        sourceFrom,
        detailFlag,
        sourceProjectId,
        customizeUnitCode: detailFlag
          ? 'SSRC.PROJECT_SETUP_DETAIL.LINE_SUPPLIER'
          : 'SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER',
      },
    });
  }

  /**
   * 新建寻源立项
   *
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  projectCreate() {
    const { dispatch, organizationId, form } = this.props;
    const { attachmentUUID, current, routerParams } = this.state;

    form.validateFields((err, values) => {
      const { sourceFrom = null } = this.state;

      const { estimatedDate = null, sourceDate = null } = values || {};
      const user = getCurrentUser();
      const { id } = user;
      const newParams = {
        ...values,
        estimatedDate: estimatedDate ? estimatedDate.format(DATETIME_MIN) : null,
        // creationDate: creationDate ? creationDate.format(DATETIME_MIN) : null,
        sourceDate: sourceDate ? sourceDate.format(DEFAULT_DATETIME_FORMAT) : null,
        createBy: id,
        tenantId: organizationId,
        referenceFlag: sourceFrom ? 1 : 0,
        sourceProjectStatus: 'NEW',
        sourceProjectAttachmentUuid: attachmentUUID, // 头附件ID
      };

      dispatch({
        type: 'projectSetup/createProject',
        payload: {
          organizationId,
          newParams,
          customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          const search = querystring.stringify({
            sourceFrom,
            ...routerParams,
          });
          dispatch(
            routerRedux.replace({
              pathname: `/ssrc/${
                current === 'newProjectSetup' ? 'new-project-setup' : 'project-setup'
              }/update/${res.sourceProjectId}`,
              search,
            })
          );
          this.fetchProjectSetupHeader();
        }
      });
    });
  }

  @Bind()
  changeTabsKey(key = '') {
    if (!key) {
      return;
    }

    this.setState({
      tabsActiveKey: key,
    });
  }

  // onCollapseChange - 折叠面板onChange
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  // 改变公司lov事件
  @Bind()
  async changeCompanyLov(companyId, companyName) {
    const {
      match: { params },
      organizationId,
      ssrcRemote = null,
      projectSetup: { itemLine = [] },
    } = this.props;
    const { sourceProjectId = null } = params;
    if (sourceProjectId && sourceProjectId !== 'null') {
      const res = await changeCompany({
        sourceProjectId,
        organizationId,
        companyId,
        companyName,
      });
      if (getResponse(res)) {
        if (ssrcRemote?.event) {
          ssrcRemote.event.fireEvent('remoteChangeCompanyEvent', {
            itemLine,
          });
        }

        this.fetchProjectSetupHeader();
        this.setState({
          itemLineSelectedRows: [],
          itemLineSelectedRowKeys: [],
          supplierLineSelectedRowKeys: [],
          planLineSelectedRowKeys: [],
          sectionSelectedRows: [], // 标段/包信息选中行
          sectionSelectedRowKeys: [], // 标段/包信息选中行key
        });
      }
    }
  }

  /**
   * 校验行信息
   */
  @Bind()
  validateLine() {
    const {
      form,
      projectSetup: { itemLine = [], supplierLine = [], planLine = [], sectionLine = [] },
    } = this.props;
    const { activeKey } = this.state;
    const newItemLineParams = getEditTableData(itemLine, ['projectLineItemId']);
    const supplierLineParams = getEditTableData(supplierLine, ['projectLineSupplierId']);
    const planLineParams = getEditTableData(planLine, ['projectLinePlanId']);
    const sectionLineParams = getEditTableData(sectionLine, ['projectLineSectionId']);
    // 标段/包信息
    const isSecError =
      form.getFieldValue('subjectMatterRule') === 'PACK'
        ? sectionLine.length && sectionLine.length !== sectionLineParams.length
        : false;
    // 物品明细
    const isItemError = itemLine.length && itemLine.length !== newItemLineParams.length;
    // 供应商列表
    const isSupError =
      form.getFieldValue('sourceMethod') === 'INVITE'
        ? supplierLine.length && supplierLine.length !== supplierLineParams.length
        : false;
    // 项目计划
    const isPlanError = planLine.length && planLine.length !== planLineParams.length;
    const isError = isSecError || isItemError || isSupError || isPlanError;
    const lineErrorMap = {
      sectionLine: isSecError,
      itemLine: isItemError,
      supplierLine: isSupError,
      planLine: isPlanError,
    };
    // 如果当前tab有必输信息，则不切换tab，否则按照定义tab的顺序切换tab
    const isCurrentUnValidate = lineErrorMap[activeKey];
    const changeOtherTabKey = isCurrentUnValidate
      ? false
      : Object.keys(lineErrorMap).find((key) => key !== activeKey && lineErrorMap[key]);

    if (isCurrentUnValidate || changeOtherTabKey) {
      const curUnvalidateTableKey = isCurrentUnValidate ? activeKey : changeOtherTabKey;
      if (changeOtherTabKey) this.changeTabs(changeOtherTabKey);
      //  解析报错信息
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.validateTableWarning`, {
            tabName: this.tabTitleMap[curUnvalidateTableKey],
          })
          .d('保存失败，失败原因是{tabName}的必填项未填写，请填写后保存！'),
      });
    }
    return isError;
  }

  /**
   * 询价大厅维护页面-保存
   */
  @Bind()
  @Debounce(10)
  saveProjectSetup() {
    const {
      dispatch,
      form,
      organizationId,
      projectSetup: {
        header = {},
        itemLine = [],
        supplierLine = [],
        planLine = [],
        sectionLine = [],
      },
    } = this.props;
    const { attachmentUUID } = this.state;
    // 不校验头，只校验行
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      const newParams = {
        ...values,
        estimatedDate: values.estimatedDate ? values.estimatedDate.format(DATETIME_MIN) : null,
        sourceDate: values.sourceDate ? values.sourceDate.format(DEFAULT_DATETIME_FORMAT) : null,
        tenantId: organizationId,
      };

      const newItemLineParams = getEditTableData(itemLine, ['projectLineItemId']);
      const supplierLineParams = getEditTableData(supplierLine, ['projectLineSupplierId']);
      const planLineParams = getEditTableData(planLine, ['projectLinePlanId']);
      const sectionLineParams = getEditTableData(sectionLine, ['projectLineSectionId']);

      const isLineErr = this.validateLine();

      if (isLineErr) return;

      const formatNewPlanLineParams = planLineParams.map((item) => {
        return {
          ...(item || {}),
          planCompleteDate: item.planCompleteDate
            ? item.planCompleteDate.format(DATETIME_MIN)
            : null,
        };
      });
      dispatch({
        type: 'projectSetup/saveProjectSetup',
        payload: {
          sourceProject: {
            ...header,
            ...values,
            ...newParams,
            sourceProjectAttachmentUuid: attachmentUUID, // 头附件ID
          },
          projectLineItems: newItemLineParams,
          projectLineSuppliers: supplierLineParams,
          projectLinePlans: formatNewPlanLineParams,
          projectLineSections: sectionLineParams,

          organizationId,
          customizeUnitCode:
            'SSRC.PROJECT_SETUP_EDIT.BASEINFOS,SSRC.PROJECT_SETUP_EDIT.LINE_ITEM,SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER,SSRC.PROJECT_SETUP_EDIT.LINE_PLAN,SSRC.PROJECT_SETUP_EDIT.LINE_SECTION',
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              itemLine: [],
            },
          });
          notification.success();
          this.fetchProjectSetupHeader();
          this.setState({
            itemLineSelectedRows: [],
            itemLineSelectedRowKeys: [],
            supplierLineSelectedRowKeys: [],
            planLineSelectedRowKeys: [],
            sectionSelectedRows: [], // 标段/包信息选中行
            sectionSelectedRowKeys: [], // 标段/包信息选中行key
          });
        }
      });
    });
  }

  /**
   * @protected
   * 水滴二开
   * @param {*} itemLineTableProps 物料行参数
   * @returns VNode
   */
  @Bind()
  renderItemLineTable(itemLineTableProps) {
    return <ItemLineTable {...itemLineTableProps} />;
  }

  /**
   * 维护界面取消
   */
  @Bind()
  cancelProjectSetup() {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;
    const { sourceProject = {} } = this.state;

    const cancelled = () => {
      dispatch({
        type: 'projectSetup/cancelProjectSetup',
        payload: {
          sourceProject,
          organizationId,
          sourceProjectId: params.sourceProjectId,
        },
      }).then((res) => {
        if (!res) {
          return;
        }
        this.directionListPage();
      });
    };

    Modal.confirm({
      content: intl
        .get('ssrc.projectSetup.view.message.confirmCancelProSet')
        .d('是否确认作废当前寻源立项'),
      onOk: () => cancelled(),
    });
  }

  /**
   * 项目立项－删除
   *
   * @memberof Update
   */
  @Bind()
  deleteProjectSetup() {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;
    const { sourceProject = {} } = this.state;

    const deleted = () => {
      dispatch({
        type: 'projectSetup/deleteProjectSetup',
        payload: {
          sourceProject,
          organizationId,
          sourceProjectId: params.sourceProjectId,
          customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
        },
      }).then((res) => {
        if (!res) {
          return;
        }
        this.directionListPage();
      });
    };

    Modal.confirm({
      content: intl
        .get('ssrc.projectSetup.view.message.confirmDeleteProSet')
        .d('是否确认删除当前寻源立项'),
      onOk: () => deleted(),
    });
  }

  /**
   * 路由跳转函数
   * 默认跳转 /ssrc/project-setup/list
   *
   * @memberof Update
   */
  @Bind()
  directionListPage() {
    const { dispatch } = this.props;
    const backPath = this.getBackPath();
    dispatch(
      routerRedux.push({
        pathname: backPath,
      })
    );
  }

  // 供应商资质过期删除（和供应商列表删除共用同一接口）
  @Bind()
  handleDeleteSupplierData(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectSetup/deleteSupplierLines',
      payload: { remoteDelete: data, organizationId: getCurrentOrganizationId() },
    }).then((res) => {
      if (res) {
        // 删除成功
        notification.success();
        this.fetchSupplierLine();
        this.setState({ supplierLineSelectedRowKeys: [] });
      }
    });
  }

  /**
   * 铺平供应商资质到期提醒数据
   */
  @Bind()
  renderDataSource(dataSource) {
    const arrayItem = [];
    const attachmentsItem = dataSource.map((item) => {
      const { expirAttachmentsDtos = [], ...otherItem } = item;
      if (expirAttachmentsDtos && expirAttachmentsDtos.length) {
        const attachmentsElement = expirAttachmentsDtos.map((element, index) => {
          return {
            index: `${otherItem.supplierCompanyId}#${index}`, // 用作唯一主键
            ...otherItem,
            ...element,
            supplierCompanyId: otherItem.supplierCompanyId,
          };
        });
        return attachmentsElement;
      } else {
        return otherItem;
      }
    });
    attachmentsItem.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    return arrayItem;
  }

  // 资质弹窗内容渲染
  @Bind()
  renderQualificationExpir(qualifyExpiredData) {
    const { ssrcRemote } = this.props;
    const { checkValue } = qualifyExpiredData || {};
    const { expired } = checkValue || {};
    if (!expired?.length) return false;
    // 解析数据
    let flatData = [];
    const supplierAttachments = expired.filter((item) => item.expirAttachmentsDtosLen);
    if (!isEmpty(supplierAttachments)) {
      flatData = this.renderDataSource(expired);
    }
    // 加载资质到期行数据
    this.SupplierBulkExpiredLineDS.loadData(flatData);
    const supplierExpiredProps = {
      ssrcRemote,
      organizationId: getCurrentOrganizationId(),
      supplierBulkExpiredModalDS: this.SupplierBulkExpiredLineDS,
      tip: intl
        .get('ssrc.inquiryHall.view.qualificationWarning')
        .d('以下供应商在供应商360资质认证已到期，无法邀请，是否删除以下供应商'),
      selectionMode: 'none',
    };
    // 待删除数据
    const deleteSupplierData = expired.map((item) => {
      const { sourceProjectId, projectLineSupplierId } = item;
      return {
        sourceProjectId,
        projectLineSupplierId,
      };
    });
    C7nModal.open({
      destroyOnClose: true,
      key: C7nModal.key(),
      title: intl.get('ssrc.inquiryHall.view.title.tips').d('提示'),
      children: <SupplierBatchAddExpiredModal {...supplierExpiredProps} />,
      style: { width: '800px' },
      bodyStyle: { maxHeight: 400 },
      onOk: () => this.handleDeleteSupplierData(deleteSupplierData),
    });
  }

  // 提交前供应商资质过期处理
  @Bind()
  handleSupplierQualification(response) {
    const validatorArrName = 'validateResults';
    if (!response) return;
    const qualifyExpiredData = (response[validatorArrName] || []).find(
      (item) => item.code === 'error.ssrc_supplier_qualification_expired'
    );
    const { checkValue } = qualifyExpiredData || {};
    const { expired } = checkValue || {};
    if (!expired?.length) return false;
    validatorConfirmModal({
      response,
      validatorArrName,
      onOk: () => this.handleDeleteSupplierData(),
      validatorType: 'highestValidatorType',
      openQualificationModal: this.renderQualificationExpir,
    });
    return true;
  }

  // 提交成功之后处理事件
  @Bind()
  afterSubmitSuccessEvent() {
    this.directionListPage();
    this.setState({
      itemLineSelectedRows: [],
      itemLineSelectedRowKeys: [],
      supplierLineSelectedRowKeys: [],
      planLineSelectedRowKeys: [],
      sectionSelectedRows: [], // 标段/包信息选中行
      sectionSelectedRowKeys: [], // 标段/包信息选中行key
    });
  }

  /**
   * submit
   */
  @Bind()
  @Debounce(300)
  async projectSetupSubmit() {
    const {
      form,
      organizationId,
      projectSetup: {
        header = {},
        itemLine = [],
        supplierLine = [],
        planLine = [],
        sectionLine = [],
      },
      ssrcRemote = null,
    } = this.props;
    const { attachmentUUID } = this.state;
    // 先验证头，再验证行
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      const newParams = {
        ...values,
        estimatedDate: values.estimatedDate ? values.estimatedDate.format(DATETIME_MIN) : null,
        sourceDate: values.sourceDate ? values.sourceDate.format(DEFAULT_DATETIME_FORMAT) : null,
        tenantId: organizationId,
      };

      if (!err) {
        // // 校验物品明细是否为空
        // if (isEmpty(itemLine)) {
        //   notification.warning({
        //     message: intl
        //       .get(`ssrc.inquiryHall.message.validation.submitItemLineNotNull`)
        //       .d('提交失败，物品明细不能为空'),
        //   });
        //   return;
        // }

        // // 寻源方式为【邀请】校验供应商列表是否为空
        // const { sourceMethod } = values;
        // if (sourceMethod === 'INVITE' && isEmpty(supplierLine)) {
        //   notification.warning({
        //     message: intl
        //       .get(`ssrc.inquiryHall.message.validation.listNoNullSubmit`)
        //       .d('提交失败，供应商列表不能为空'),
        //   });
        //   return;
        // }

        const newItemLineParams = getEditTableData(itemLine, ['projectLineItemId']);
        const supplierLineParams = getEditTableData(supplierLine, ['projectLineSupplierId']);
        const planLineParams = getEditTableData(planLine, ['projectLinePlanId']);
        const sectionLineParams = getEditTableData(sectionLine, ['projectLineSectionId']);

        const isLineErr = this.validateLine();

        if (isLineErr) return;

        const formatNewPlanLineParams = planLineParams.map((item) => {
          return {
            ...(item || {}),
            planCompleteDate: item.planCompleteDate
              ? item.planCompleteDate.format(DATETIME_MIN)
              : null,
          };
        });
        const data = {
          sourceProject: {
            ...header,
            ...values,
            ...newParams,
            sourceProjectAttachmentUuid: attachmentUUID, // 头附件ID
          },
          projectLineItems: newItemLineParams,
          projectLineSuppliers: supplierLineParams,
          projectLinePlans: formatNewPlanLineParams,
          projectLineSections: sectionLineParams,
          organizationId,
          customizeUnitCode:
            'SSRC.PROJECT_SETUP_EDIT.BASEINFOS,SSRC.PROJECT_SETUP_EDIT.LINE_ITEM,SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER,SSRC.PROJECT_SETUP_EDIT.LINE_PLAN,SSRC.PROJECT_SETUP_EDIT.LINE_SECTION',
        };
        const doSubmitEvent = async (submitData) => {
          try {
            this.setState({ submitLoading: true });
            let result = await projectSetupSubmit(submitData || data);
            const displayFlag = this.handleSupplierQualification(result); // 优先校验供应商资质过期,返回值为弹框是否展示
            this.setState({ submitLoading: false });
            if (displayFlag) return;
            result = getResponse(result);
            if (!result) {
              return;
            }
            notification.success();
            this.afterSubmitSuccessEvent();
          } catch (e) {
            throw e;
          }
        };
        if (ssrcRemote?.event) {
          ssrcRemote.event.fireEvent('doSubmit', {
            data,
            doSubmitEvent,
            projectSetupSubmit,
            directionListPage: this.directionListPage,
            afterSubmitSuccessEvent: this.afterSubmitSuccessEvent,
          });
        } else {
          doSubmitEvent();
        }
      } else {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.saveFailPrompt`)
            .d('保存失败，请填写未填写项'),
        });
      }
    });
  }

  /**
   * 物品明细-新增行
   */
  @Bind()
  createItemLine() {
    const {
      dispatch,
      organizationId,
      projectSetup: { itemLine = [], itemLinePagination = {}, header = {} },
      match: { params },
      ssrcRemote = null,
    } = this.props;

    const newItemLine = {
      sourceProjectId: params.sourceProjectId,
      projectLineItemId: uuidv4(),
      projectLineItemNum: null,
      tenantId: organizationId,
      ouId: undefined, // 业务实体
      itemRemark: null,
      quotationTemplateId: null, // 报价模板
      quotationDetail: null, // 报价明细
      itemCategoryId: undefined, // 物品分类
      rfxQuantity: undefined, // 需求数量
      uomId: null, // 单位
      secondaryUomId: null, // 基本单位
      costPrice: null,
      totalPrice: null,
      uomName: null,
      itemName: undefined, // 物品描述
      taxId: undefined,
      invOrganizationId: null,
      demandDate: null,
      itemId: null,
      requiredQuantity: null,
      secondaryQuantity: null,
      attachmentUUid: null,
      remark: null,
      prNum: null,
      prLineNum: null,
      prDisplayLineNum: null,
      requrestUserId: null,
      priceBatch: 1,
      _status: 'create',
    };

    const remoteProps = {
      header,
    };

    const _newItemLine = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_PROJECT_SETUP_UPDATE_PROCESS_CREATE_ITEM_LINE_DATA',
          newItemLine,
          remoteProps
        )
      : newItemLine;
    dispatch({
      type: 'projectSetup/updateState',
      payload: {
        itemLine: [_newItemLine, ...itemLine],
        itemLinePagination: addItemToPagination(itemLine.length, itemLinePagination),
      },
    });
  }

  /**
   * 物品明细保存整合
   *
   * @param {*} key
   * @param {*} [data=[]]
   * @returns
   * @memberof Update
   */
  getItemLineData(key = [], data = []) {
    if (isEmpty(data)) {
      return [];
    }

    const middleData = data.map((item) => {
      if (!item.quotationDetails || isEmpty(item.quotationDetails)) {
        return item;
      }
      const quotationList = item.quotationDetails.map((quotation) => {
        return {
          ...quotation,
          projectLineItemId:
            typeof quotation.projectLineItemId === 'string' ? null : quotation.projectLineItemId,
        };
      });
      return {
        ...item,
        quotationDetails: quotationList,
      };
    });

    return getEditTableData(middleData, key);
  }

  /**
   * 物品明细-保存
   */
  @Bind(500)
  @Debounce(500)
  saveItemLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { header = {}, itemLine = [], itemLinePagination = {} },
    } = this.props;
    const { itemLineSelectedRowKeys = [], detailFlag = false } = this.state;
    const newParameters = this.getItemLineData(['projectLineItemId'], itemLine);

    if (!isEmpty(newParameters)) {
      const requestFormPayload = detailFlag
        ? {}
        : {
            // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
            requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
              ? 'change'
              : 'maintain',
          };
      dispatch({
        type: 'projectSetup/saveItemLine',
        payload: {
          newParameters,
          organizationId,
          sourceProjectId: params.sourceProjectId,
          customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
          ...requestFormPayload,
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              itemLineChange: false,
              itemLineQuotationDetail: [],
              itemLine: [],
              header: {},
            },
          });
          notification.success();
          this.fetchProjectSetupHeader(true, { itemLinePagination }); // 此处加参数是为了更新tab
          if (!isEmpty(itemLineSelectedRowKeys)) {
            this.setState({
              itemLineSelectedRows: [],
              itemLineSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 物品明细-强制保存
   */
  @Bind()
  @Debounce(500)
  onForceSaveLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { itemLine = [], itemLinePagination = {} },
    } = this.props;
    const { itemLineSelectedRowKeys = [] } = this.state;
    const newParameters = itemLine.map((lineList) => {
      let obj = {};
      const { $form: lineForm = {} } = lineList;
      // eslint-disable-next-line no-unused-expressions
      lineForm.validateFields?.((err, values) => {
        obj = { ...values };
      });

      return {
        ...lineList,
        ...obj,
      };
    });
    dispatch({
      type: 'projectSetup/saveItemLine',
      payload: {
        newParameters,
        organizationId,
        sourceProjectId: params.sourceProjectId,
        customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'projectSetup/updateState',
          payload: {
            itemLineChange: false,
            itemLineQuotationDetail: [],
            itemLine: [],
            header: {},
          },
        });
        notification.success();
        this.fetchProjectSetupHeader(true, { itemLinePagination }); // 此处加参数是为了更新tab
        if (!isEmpty(itemLineSelectedRowKeys)) {
          this.setState({
            itemLineSelectedRows: [],
            itemLineSelectedRowKeys: [],
          });
        }
      }
    });
  }

  /**
   * 物品明细-复制
   */
  @Bind()
  onCopyLines() {
    const { itemLineSelectedRows = [] } = this.state;
    const {
      dispatch,
      projectSetup: { itemLine = [], itemLinePagination = {}, header = {} },
      ssrcRemote = null,
    } = this.props;
    const copyValues = itemLineSelectedRows.map((item) => {
      const formValue = item.$form.getFieldsValue();
      const itemLineProps = {
        ...item,
        ...formValue,
        projectLineItemNum: '',
        prNum: '',
        prLineNum: null,
        prDisplayLineNum: null,
        projectLineItemId: uuidv4(),
        objectVersionNumber: '',
        prHeaderId: null,
        prLineId: null,
        creationDate: null,
        lastUpdateDate: null,
        itemAttachmentUuid: null,
        _status: 'create',
      };
      const otherProps = { item, formValue, header };
      return ssrcRemote
        ? ssrcRemote.process('SSRC_PROJECT_SETUP_UPDATE_COPYBUTTON', itemLineProps, otherProps)
        : itemLineProps;
    });
    dispatch({
      type: 'projectSetup/updateState',
      payload: {
        itemLine: [...copyValues, ...itemLine],
        itemLinePagination: addItemsToPagination(
          copyValues.length,
          itemLine.length,
          itemLinePagination
        ),
      },
    });
    this.setState({
      itemLineSelectedRows: [],
      itemLineSelectedRowKeys: [],
    });
  }

  /**
   * 标段下添加物料---强制保存
   */
  @Bind()
  @Debounce(500)
  saveSectionForce(flag) {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { addMaterialData = [] },
    } = this.props;
    const newParameters = addMaterialData.map((lineList) => {
      let obj = {};
      const { $form: lineForm = {} } = lineList;
      // eslint-disable-next-line no-unused-expressions
      lineForm.validateFields?.((err, values) => {
        obj = { ...values };
      });

      return {
        ...lineList,
        ...obj,
      };
    });
    const formatNewParameters = newParameters.map((item) => {
      return {
        ...(item || {}),
        demandDate: dateFormate(item.demandDate, DATETIME_MIN),
        validExpiryDateFrom: dateFormate(item.validExpiryDateFrom, DATETIME_MIN),
        validExpiryDateTo: dateFormate(item.validExpiryDateTo, DATETIME_MAX),
        sourceProjectId: params.sourceProjectId,
      };
    });
    if (!isEmpty(newParameters)) {
      dispatch({
        type: 'projectSetup/saveSectionItemLine',
        payload: {
          newParameters: formatNewParameters,
          organizationId,
          sourceProjectId: params.sourceProjectId,
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              addMaterialData: [],
              addMaterialPagination: {},
            },
          });
          notification.success();
          this.fetchAddMaterialData();
          this.fetchProjectSetupHeaderData();
        }
        if (flag) {
          this.setState({
            addMaterialSelectedRows: [],
            addMaterialSelectedRowKeys: [],
            addMaterialVisible: false,
            addMaterialRecord: {},
          });
        }
      });
    }
  }

  /**
   * 物品明细 - 批量删除
   */
  @Bind()
  deleteItemLines() {
    const {
      dispatch,
      form,
      projectSetup: { header = {}, itemLine = [], itemLinePagination = {} },
      organizationId,
    } = this.props;
    const { itemLineSelectedRowKeys, detailFlag = false } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(itemLine, (item) => {
      return itemLineSelectedRowKeys.indexOf(item.projectLineItemId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newItemDetails = filter(itemLine, (item) => {
      return itemLineSelectedRowKeys.indexOf(item.projectLineItemId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              itemLine: newItemDetails,
              itemLinePagination: delItemsToPagination(
                newParameters.length,
                itemLine.length,
                itemLinePagination
              ),
            },
          });
          this.setState({ itemLineSelectedRowKeys: [], itemLineSelectedRows: [] });
        } else {
          const requestFormPayload = detailFlag
            ? {}
            : {
                // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
                requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
                  ? 'change'
                  : 'maintain',
              };
          dispatch({
            type: 'projectSetup/deleteItemLines',
            payload: {
              remoteDelete,
              organizationId,
              ...requestFormPayload,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'projectSetup/updateState',
                payload: {
                  itemLine: newItemDetails,
                  itemLinePagination: delItemsToPagination(
                    newParameters.length,
                    itemLine.length,
                    itemLinePagination
                  ),
                },
              });
              this.fetchItemLine();
              this.fetchSupplierLine();
              this.fetchProjectSetupHeaderData(true);
              this.setState({ itemLineSelectedRowKeys: [], itemLineSelectedRows: [] });
              if (form.getFieldValue('subjectMatterRule') === 'PACK') {
                this.fetchSectionLine();
              }
            }
          });
        }
      },
    });
  }

  /**
   * 物品明细--- 批量维护
   */
  @Bind()
  batchMainItemLine() {
    const { form } = this.props;
    const { itemLineSelectedRows = [] } = this.state;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    // eslint-disable-next-line array-callback-return
    itemLineSelectedRows.map((item) => {
      item.$form.setFieldsValue({
        sectionCode: fieldValues.sectionCode,
        sectionName: fieldValues.sectionName,
        projectLineSectionId: fieldValues.projectLineSectionId,
      });
    });
  }

  /**
   * 物品明细-改变分页
   */
  @Bind()
  changeItemLinePage(page) {
    const {
      dispatch,
      projectSetup: { itemLineChange = false },
    } = this.props;
    if (itemLineChange) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.changeDataPageTip`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchItemLine(page);
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              itemLineChange: false,
            },
          });
        },
      });
    } else {
      this.fetchItemLine(page);
    }
  }

  /**
   * 筛选供应商-修改保存
   */
  @Bind()
  saveSupplierRecordLine(itemIds) {
    const { itemLineSelectedRowKeys } = this.state;
    const {
      match: { params },
      dispatch,
      projectSetup: { supplierData = [], itemLinePagination = {} },
      organizationId,
    } = this.props;
    const rfxItemSupAssignList = getEditTableData(supplierData, ['itemSupAssignId']);
    const itemId = itemIds ? [itemIds] : itemLineSelectedRowKeys;
    dispatch({
      type: 'projectSetup/saveSupplierRecordLine',
      payload: {
        organizationId,
        rfxItemSupAssignList,
        itemIds: itemId,
        headerId: params.sourceProjectId,
        customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ itemLineSelectedRowKeys: [], itemLineSelectedRows: [] });
        this.fetchItemLine(itemLinePagination);
      }
    });
    this.ItemLineTable.hideOperationRecord();
  }

  /**
   * 计划列表 - 查询
   */
  @Bind()
  async fetchPlanLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    const { sourceProjectId = null } = params;
    const { sourceFrom = null, detailFlag = false } = this.state;
    if (sourceProjectId === 'null') {
      return;
    }

    await dispatch({
      type: 'projectSetup/fetchPlan',
      payload: {
        page,
        organizationId,
        sourceFrom,
        sourceProjectId,
        customizeUnitCode: detailFlag
          ? 'SSRC.PROJECT_SETUP_DETAIL.LINE_PLAN'
          : 'SSRC.PROJECT_SETUP_EDIT.LINE_PLAN',
      },
    });
  }

  /**
   * 标段/包列表--查询
   */
  @Bind()
  async fetchSectionLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      projectSetup: { header = {} },
      ssrcRemote,
    } = this.props;
    const { sourceProjectId = null } = params;
    const { sourceFrom = null, detailFlag = false } = this.state;
    if (sourceProjectId === 'null') {
      return;
    }
    const requestFormPayload = detailFlag
      ? {}
      : {
          // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
          requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
            ? 'change'
            : 'maintain',
        };

    const originRequestParams = {
      page,
      detailFlag,
      organizationId,
      sourceFrom,
      sourceProjectId,
      customizeUnitCode: detailFlag
        ? 'SSRC.PROJECT_SETUP_DETAIL.LINE_SECTION'
        : 'SSRC.PROJECT_SETUP_EDIT.LINE_SECTION',
      ...requestFormPayload,
    };

    // 埋点处理后的参数
    const remoteFetchSectionLineParams = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_PROJECT_SETUP_UPDATE_PROCESS_FETCHSECTIONLINE_PARAMS',
          originRequestParams,
          {
            header,
            isPubPage: () => {
              return this.isPubPage();
            },
          }
        )
      : originRequestParams;
    await dispatch({
      type: 'projectSetup/fetchSectionLine',
      payload: remoteFetchSectionLineParams,
    });
  }

  /**
   * 获取供应商资质信息
   */
  @Bind()
  getQualificationInfo() {
    const {
      match: { params },
    } = this.props;
    const { sourceProjectId = null } = params;
    if (sourceProjectId === 'null' || !sourceProjectId) return;
    this.setState({ qualificationInfoLoading: true });
    fetchQualificationInfo(sourceProjectId).then((res) => {
      if (getResponse(res)) {
        this.setState({ qualificationInfo: res, qualificationInfoLoading: false });
      }
    });
  }

  /**
   * 标段/包信息-改变分页
   */
  @Bind()
  changeSectionPage(page = {}) {
    const {
      dispatch,
      projectSetup: { itemLineChange = false },
    } = this.props;
    if (itemLineChange) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.changeDataPageTip`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchSectionLine(page);
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              itemLineChange: false,
            },
          });
        },
      });
    } else {
      this.fetchSectionLine(page);
    }
  }

  /**
   * 标段---包新增行
   */
  @Bind()
  createSectionLine() {
    const {
      dispatch,
      organizationId,
      projectSetup: { sectionLine = [], sectionPagination = {} },
      match: { params },
    } = this.props;
    dispatch({
      type: 'projectSetup/updateState',
      payload: {
        sectionLine: [
          {
            sourceProjectId: params.sourceProjectId,
            tenantId: organizationId,
            projectLineSectionId: uuidv4(),
            _status: 'create',
          },
          ...sectionLine,
        ],
        sectionPagination: addItemToPagination(sectionLine.length, sectionPagination),
      },
    });
  }

  /*
   * 标段/包信息---保存
   */
  @Bind()
  saveSectionLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { header = {}, sectionLine = [] },
    } = this.props;
    const { sectionSelectedRowKeys = [], detailFlag = false } = this.state;
    const newParams = getEditTableData(sectionLine, ['projectLineSectionId']);

    if (!isEmpty(newParams)) {
      const requestFormPayload = detailFlag
        ? {}
        : {
            // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
            requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
              ? 'change'
              : 'maintain',
          };
      dispatch({
        type: 'projectSetup/saveSectionList',
        payload: {
          newParams,
          organizationId,
          sourceProjectId: params.sourceProjectId,
          customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_SECTION',
          ...requestFormPayload,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchSectionLine();
          this.fetchItemLine();
          if (!isEmpty(sectionSelectedRowKeys)) {
            this.setState({
              sectionSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 标段/包信息 - 批量删除
   */
  @Bind()
  deleteSectionLines() {
    const {
      dispatch,
      projectSetup: { header = {}, sectionLine = [], sectionPagination = {} },
      organizationId,
    } = this.props;
    const { sectionSelectedRowKeys, detailFlag = false } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(sectionLine, (item) => {
      return sectionSelectedRowKeys.indexOf(item.projectLineSectionId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newItemDetails = filter(sectionLine, (item) => {
      return sectionSelectedRowKeys.indexOf(item.projectLineSectionId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              sectionLine: newItemDetails,
              sectionPagination: delItemsToPagination(
                newParameters.length,
                sectionLine.length,
                sectionPagination
              ),
            },
          });
          this.setState({ sectionSelectedRows: [], sectionSelectedRowKeys: [] });
        } else {
          const requestFormPayload = detailFlag
            ? {}
            : {
                // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
                requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
                  ? 'change'
                  : 'maintain',
              };
          dispatch({
            type: 'projectSetup/deleteSectionLines',
            payload: {
              remoteDelete,
              organizationId,
              ...requestFormPayload,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchSectionLine();
              this.fetchItemLine();
              dispatch({
                type: 'projectSetup/updateState',
                payload: {
                  sectionLine: newItemDetails,
                  sectionPagination: delItemsToPagination(
                    newParameters.length,
                    sectionLine.length,
                    sectionPagination
                  ),
                },
              });
              this.setState({ sectionSelectedRows: [], sectionSelectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 计划明细-新增行
   */
  @Bind()
  createPlanLine() {
    const {
      dispatch,
      organizationId,
      projectSetup: { planLine = [], planLinePagination = {} },
      match: { params },
    } = this.props;

    dispatch({
      type: 'projectSetup/updateState',
      payload: {
        planLine: [
          {
            sourceProjectId: params.sourceProjectId,
            tenantId: organizationId,
            projectLinePlanId: uuidv4(),
            projectLinePlanNum: null,
            _status: 'create',
          },
          ...planLine,
        ],
        planLinePagination: addItemToPagination(planLine.length, planLinePagination),
      },
    });
  }

  /**
   * 计划明细-保存
   */
  @Bind()
  savePlanLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { planLine = [] },
    } = this.props;

    const { planLineSelectedRowKeys = [] } = this.state;

    const newParams = getEditTableData(planLine, ['projectLinePlanId']); // 清空 projectLinePlanId
    const formatNewParameters = newParams.map((item) => {
      return {
        ...(item || {}),
        planCompleteDate: item.planCompleteDate ? item.planCompleteDate.format(DATETIME_MIN) : null,
      };
    });
    if (!isEmpty(formatNewParameters)) {
      dispatch({
        type: 'projectSetup/savePlanList',
        payload: {
          formatNewParameters,
          organizationId,
          sourceProjectId: params.sourceProjectId,
          customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_PLAN',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchPlanLine();
          if (!isEmpty(planLineSelectedRowKeys)) {
            this.setState({
              planLineSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 计划列表 - 批量删除
   */
  @Bind()
  deletePlanLines() {
    const {
      dispatch,
      organizationId,
      projectSetup: { planLine = [], planLinePagination = {} },
      match: { params },
    } = this.props;
    const { planLineSelectedRowKeys = [] } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(planLine, (item) => {
      return planLineSelectedRowKeys.indexOf(item.projectLinePlanId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newPlanList = filter(planLine, (item) => {
      return planLineSelectedRowKeys.indexOf(item.projectLinePlanId) < 0;
    });
    // 跨页远程删除数据组合
    const crossPageNewParams = [];
    planLineSelectedRowKeys.forEach((item) => {
      const planItem = { projectLinePlanId: item, sourceProjectId: params.sourceProjectId };
      crossPageNewParams.push(planItem);
    });

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              planLine: newPlanList,
              planLinePagination: delItemsToPagination(
                newParameters.length,
                planLine.length,
                planLinePagination
              ),
            },
          });
          this.setState({ planLineSelectedRowKeys: [] });
        } else {
          dispatch({
            type: 'projectSetup/deletePlanLines',
            payload: { remoteDelete: crossPageNewParams, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              this.fetchPlanLine();
              this.setState({ planLineSelectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 计划列表-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handlePlanLineRowSelectChange(selectedRowKeys = []) {
    this.setState({ planLineSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 标段/包信息行选择
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   * @memberof Update
   */
  @Bind()
  handleSectionRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ sectionSelectedRowKeys: selectedRowKeys, sectionSelectedRows: selectedRows });
  }

  /**
   * 计划列表-分页
   */
  @Bind()
  changePlanLinePage(page) {
    const {
      dispatch,
      projectSetup: { planLineChange = false },
    } = this.props;
    if (planLineChange) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.changeDataPageTip`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchPlanLine(page);
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              planLineChange: false,
            },
          });
        },
      });
    } else {
      this.fetchPlanLine(page);
    }
  }

  /**
   * 供应商列表-新增行
   */
  @Bind()
  createSupplierLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { supplierLine = [], supplierLinePagination = {} },
    } = this.props;
    dispatch({
      type: 'projectSetup/updateState',
      payload: {
        supplierLine: [
          {
            sourceProjectId: params.sourceProjectId,
            projectLineSupplierId: uuidv4(),
            supplierCompanyId: null,
            tenantId: organizationId,
            supplierCompanyNum: null,
            supplierCompanyName: null,
            supplierTenantId: null,
            _status: 'create',
          },
          ...supplierLine,
        ],
        supplierLinePagination: addItemToPagination(supplierLine.length, supplierLinePagination),
      },
    });
  }

  /**
   * 供应商列表-保存
   */
  @Bind()
  saveSupplierLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { supplierLine = [] },
    } = this.props;
    const { supplierLineSelectedRowKeys = [] } = this.state;

    const newParams = getEditTableData(supplierLine, ['projectLineSupplierId']);
    if (!isEmpty(newParams)) {
      dispatch({
        type: 'projectSetup/saveSupplier',
        payload: {
          newParams,
          organizationId,
          sourceProjectId: params.sourceProjectId,
          customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchSupplierLine();
          if (!isEmpty(supplierLineSelectedRowKeys)) {
            this.setState({
              supplierLineSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 供应商列表-清除
   */
  @Bind()
  cleanSupplierLine(record) {
    const {
      dispatch,
      projectSetup: { supplierLine = [], supplierLinePagination = {} },
    } = this.props;
    const newSupplierList = supplierLine.filter(
      (item) => item.projectLineSupplierId !== record.projectLineSupplierId
    );
    dispatch({
      type: 'projectSetup/updateState',
      payload: {
        supplierLine: [...newSupplierList],
        supplierLinePagination: delItemToPagination(supplierLine.length, supplierLinePagination),
      },
    });
  }

  /**
   * 查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearchSupplier(itemIds) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'projectSetup/supplierRecord',
      payload: {
        organizationId,
        itemIds,
        sourceProjectId: params.sourceProjectId,
      },
    });
  }

  /**
   * 供应商列表 - 批量删除
   */
  @Bind()
  deleteSupplierLines() {
    const {
      dispatch,
      organizationId,
      projectSetup: { supplierLine = [], supplierLinePagination = {} },
      match: { params },
    } = this.props;
    const { supplierLineSelectedRowKeys = [] } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(supplierLine, (item) => {
      return supplierLineSelectedRowKeys.indexOf(item.projectLineSupplierId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newSupplierList = filter(supplierLine, (item) => {
      return supplierLineSelectedRowKeys.indexOf(item.projectLineSupplierId) < 0;
    });
    // 跨页远程删除数据组合
    const crossPageNewParams = [];
    supplierLineSelectedRowKeys.forEach((item) => {
      const supplierItem = { projectLineSupplierId: item, sourceProjectId: params.sourceProjectId };
      crossPageNewParams.push(supplierItem);
    });

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              supplierLine: newSupplierList,
              supplierLinePagination: delItemsToPagination(
                newParameters.length,
                supplierLine.length,
                supplierLinePagination
              ),
            },
          });
          this.setState({ supplierLineSelectedRowKeys: [] });
        } else {
          dispatch({
            type: 'projectSetup/deleteSupplierLines',
            payload: { remoteDelete: crossPageNewParams, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              this.fetchSupplierLine();
              this.setState({ supplierLineSelectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 供应商列表-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleSupplierLineRowSelectChange(selectedRowKeys = []) {
    this.setState({ supplierLineSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 供应商列表-表格内容改变
   */
  @Bind()
  changeSupplierLineTableData() {
    const {
      dispatch,
      projectSetup: { supplierLineChange = false },
    } = this.props;
    if (!supplierLineChange) {
      dispatch({
        type: 'projectSetup/updateState',
        payload: {
          supplierLineChange: true,
        },
      });
    }
  }

  /**
   * 供应商列表-分页
   */
  @Bind()
  changeSupplierLinePage(page) {
    const {
      dispatch,
      projectSetup: { supplierLineChange = false },
    } = this.props;
    if (supplierLineChange) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.changeDataPageTip`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchSupplierLine(page);
          this.setState({
            supplierLinePage: page,
          });
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              supplierLineChange: false,
            },
          });
        },
      });
    } else {
      this.fetchSupplierLine(page);
    }
  }

  /**
   * 打开-批量添加供应商模态框，并且查询数据
   */
  @Bind()
  bulkAddSupplier() {
    this.setState({
      bulkAddSupplierVisible: true,
    });
    this.fetchBulkSupplierData();
  }

  form;

  /**
   * 设置Form
   * @param {object} ref - BulkAddSupplier组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询-批量添加供应商模态框数据
   */
  @Bind()
  fetchBulkSupplierData(page = {}, queryParam = {}) {
    const {
      dispatch,
      organizationId,
      userId,
      form: { getFieldValue },
      match: { params },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const companyId = getFieldValue('companyId');
    const templateId = getFieldValue('templateId');
    dispatch({
      type: 'projectSetup/fetchBulkSupplierData',
      payload: {
        page,
        ...queryParam,
        ...fieldValues,
        organizationId,
        userId,
        companyId,
        templateId,
        sourceProjectId: params.sourceProjectId,
        sourceFrom: 'PROJECT',
      },
    });
  }

  /**
   * 取消-关闭批量添加供应商模态框
   */
  @Bind()
  cancelBulkAddSupplier() {
    this.setState({
      bulkAddSupplierVisible: false,
      bulkAddSupplierSelectedRows: [],
    });
  }

  /**
   * 获取选中行-批量添加供应商模态框
   */
  @Bind()
  handleBulkAddSupplierRowSelectChange(_, selectedRows) {
    this.setState({
      bulkAddSupplierSelectedRows: selectedRows,
    });
  }

  /**
   * 批量添加供应商
   */
  @Bind()
  handleBulkAddSupplier() {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    const { bulkAddSupplierSelectedRows } = this.state;
    if (!isEmpty(bulkAddSupplierSelectedRows)) {
      const newParams = bulkAddSupplierSelectedRows.map((item) => {
        return {
          ...item,
          sourceProjectId: params.sourceProjectId,
          tenantId: organizationId,
          contactMail: item.mail,
          contactMobilephone: item.mobilephone,
        };
      });
      dispatch({
        type: 'projectSetup/saveSupplier',
        payload: {
          newParams,
          organizationId,
          sourceProjectId: params.sourceProjectId,
          customizeUnitCode: 'SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.cancelBulkAddSupplier();
          this.fetchSupplierLine();
        }
      });
    }
  }

  /**
   * 物品行选择
   *
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   * @memberof Update
   */
  @Bind()
  handleItemLineRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ itemLineSelectedRowKeys: selectedRowKeys, itemLineSelectedRows: selectedRows });
  }

  @Bind()
  changeSourceMethod(val = null) {
    const { dispatch } = this.props;
    if (val !== 'INVITE') {
      dispatch({
        type: 'projectSetup/updateState',
        payload: {
          supplierLine: [],
          supplierLinePagination: {},
        },
      });
      this.handleSupplierLineRowSelectChange();
      this.setState({
        activeKey: 'itemLine',
      });
    } else {
      this.fetchSupplierLine();
    }
  }

  /**
   * 修改标的规则
   */
  @Bind()
  changeSubjectMatterRule(e) {
    if (e.target.value === 'PACK') {
      this.setState({
        activeKey: 'sectionLine',
      });
    } else {
      this.setState({
        activeKey: 'itemLine',
      });
    }
  }

  @Bind()
  changeSourceCategory(value) {
    const { form } = this.props;
    if (form.getFieldValue('subjectMatterRule') === 'PACK') {
      if (value === 'NEW_BID') {
        // 如果切换至新招标且分标包，则设置为不分标包，因为目前新招标暂不支持分标包
        form.setFieldsValue({
          subjectMatterRule: 'NONE',
        });
        this.setState({
          activeKey: 'itemLine',
        });
        return;
      }
      this.setState({
        activeKey: 'sectionLine',
      });
    } else {
      form.setFieldsValue({
        subjectMatterRule: 'NONE',
      });
      this.setState({
        activeKey: 'itemLine',
      });
    }
  }

  // 查询配置表
  fetchConfig = async () => {
    const { organizationId } = this.props;
    const { configSheet = {} } = this.state;
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId,
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        configSheet: { ...configSheet, sprmOldUiConfig: !isEmpty(data) },
      });
    } catch (e) {
      throw e;
    }
  };

  // 采购申请行跳转
  @Bind()
  linktoPrNumDetail(record = {}) {
    const { configSheet = {} } = this.state;
    const { dispatch } = this.props;
    const { sprmOldUiConfig = false } = configSheet;
    const { prSourcePlatform, prHeaderId } = record;
    const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
    let pathUrl = null;

    if (!sprmOldUiConfig) {
      // 记录一个标识, 实现跳转的采购申请工作台明细后,点击返回按钮，返回采购申请工作台主页面的【整单-全部】页签
      // 需要去采购申请工作台去适配此方案
      // NOTE window.ssrc.directionToPurchasePlatform = 'inquiryHallNewUpdate,inquiryHallNewDetail';
      window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate';

      pathUrl = isErp
        ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
        : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
    } else {
      pathUrl = isErp
        ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
        : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
    }

    if (window.top !== window) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: pathUrl,
        }),
      });
    } else {
      dispatch(
        routerRedux.push({
          pathname: pathUrl,
        })
      );
    }
  }

  // back path
  getBackPath() {
    const backPath = `${getActiveTabKey()}/list`;
    return backPath;
  }

  /**
   * 上传文件成功后, 保存uuid至state中
   * @param {Object} params - 回传参数
   */
  @Bind()
  saveAttachmentUUID(params = {}) {
    this.setState({
      attachmentUUID: params,
    });
  }

  /**
   * 改变tab标签
   */
  @Bind()
  changeTabs(activeKey) {
    this.setState({
      activeKey,
    });
  }

  @Bind()
  fetchAddMaterialData(page = {}, record = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      projectSetup: { header = {} },
      ssrcRemote,
    } = this.props;
    const { addMaterialRecord = {}, detailFlag = false } = this.state;

    const requestFormPayload = detailFlag
      ? {}
      : {
          // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
          requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
            ? 'change'
            : 'maintain',
        };

    const originRequestParams = {
      page,
      tenantId: organizationId,
      organizationId,
      sourceProjectId: params.sourceProjectId,
      projectLineSectionId: addMaterialRecord?.projectLineSectionId || record?.projectLineSectionId,
      ...requestFormPayload,
    };

    const remoteRequestParams = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_PROJECT_SETUP_UPDATE_PROCESS_FETCH_ADD_MATERIAL_PARAMS',
          originRequestParams,
          {
            header,
            isPubPage: () => {
              return this.isPubPage();
            },
          }
        )
      : originRequestParams;

    dispatch({
      type: 'projectSetup/fetchAddMaterialData',
      payload: remoteRequestParams,
    });
  }

  @Bind()
  openAddMaterial(record) {
    this.setState({
      addMaterialVisible: true,
      addMaterialRecord: record,
    });
    this.fetchAddMaterialData({}, record);
  }

  @Bind()
  cancelAddMateria() {
    this.setState({
      addMaterialVisible: false,
      addMaterialRecord: {},
    });
    this.fetchSectionLine();
    this.fetchItemLine();
  }

  /**
   * 分标段下新建物料
   */
  @Bind()
  createSectionItem() {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { addMaterialData = [], addMaterialPagination = {}, header },
      ssrcRemote = null,
    } = this.props;
    const { addMaterialRecord } = this.state;

    const newLine = {
      sourceProjectId: params.sourceProjectId,
      projectLineItemId: uuidv4(),
      projectLineItemNum: null,
      tenantId: organizationId,
      ouId: undefined, // 业务实体
      itemRemark: null,
      itemCategoryId: undefined, // 物品分类
      rfxQuantity: undefined, // 需求数量
      uomId: null, // 基本单位
      secondaryUomId: null, // 单位
      costPrice: null,
      totalPrice: null,
      uomName: null,
      secondaryUomName: null,
      itemName: undefined, // 物品描述
      taxId: undefined,
      invOrganizationId: null,
      demandDate: null,
      itemId: null,
      requiredQuantity: null,
      secondaryQuantity: null,
      attachmentUUid: null,
      remark: null,
      prNum: null,
      prLineNum: null,
      requrestUserId: null,
      _status: 'create',
      projectLineSectionId: addMaterialRecord.projectLineSectionId,
      priceBatch: 1,
    };

    const remoteProps = {
      header,
    };

    const _newLine = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_PROJECT_SETUP_UPDATE_PROCESS_CREATE_SECTION_ITEM_LINE_DATA',
          newLine,
          remoteProps
        )
      : newLine;
    dispatch({
      type: 'projectSetup/updateState',
      payload: {
        addMaterialData: [_newLine, ...addMaterialData],
        addMaterialPagination: addItemToPagination(addMaterialData.length, addMaterialPagination),
      },
    });
  }

  /**
   * 标段下添加物料---保存
   */
  @Bind()
  saveSectionItemLine(flag) {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { header = {}, addMaterialData = [] },
      ssrcRemote,
    } = this.props;
    const { detailFlag = false, addMaterialRecord } = this.state;
    const newParameters = this.getItemLineData(['projectLineItemId'], addMaterialData);
    const formatNewParameters = newParameters.map((item) => {
      return {
        ...(item || {}),
        demandDate: dateFormate(item.demandDate, DATETIME_MIN),
        validExpiryDateFrom: dateFormate(item.validExpiryDateFrom, DATETIME_MIN),
        validExpiryDateTo: dateFormate(item.validExpiryDateTo, DATETIME_MAX),
        sourceProjectId: params.sourceProjectId,
      };
    });

    if (!isEmpty(newParameters)) {
      const requestFormPayload = detailFlag
        ? {}
        : {
            // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
            requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
              ? 'change'
              : 'maintain',
          };

      const originRequestParams = {
        newParameters: formatNewParameters,
        organizationId,
        sourceProjectId: params.sourceProjectId,
        ...requestFormPayload,
      };
      // 埋点处理后的参数
      const remoteSaveSecItemLinesParams = ssrcRemote
        ? ssrcRemote.process(
            'SSRC_PROJECT_SETUP_UPDATE_PROCESS_SAVE_SECITEMLINES_PARAMS',
            originRequestParams,
            {
              sectionRecord: addMaterialRecord,
              header,
              pageDetailFlag: detailFlag,
            }
          )
        : originRequestParams;
      dispatch({
        type: 'projectSetup/saveSectionItemLine',
        payload: {
          ...(remoteSaveSecItemLinesParams || {}),
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              addMaterialData: [],
              addMaterialPagination: {},
            },
          });
          notification.success();
          this.fetchAddMaterialData();
          this.fetchProjectSetupHeaderData();
        }
        if (flag) {
          this.setState({
            addMaterialSelectedRows: [],
            addMaterialSelectedRowKeys: [],
            addMaterialVisible: false,
            addMaterialRecord: {},
          });
        }
      });
    }
  }

  /**
   * 标段下添加物料--删除
   */
  @Bind()
  deleteSectionItemLine() {
    const {
      dispatch,
      projectSetup: { addMaterialData = [], addMaterialPagination = {} },
      organizationId,
    } = this.props;
    const { addMaterialSelectedRowKeys } = this.state;
    const newItemLine = addMaterialData.map((item) => {
      const newItem = item;
      delete newItem.$form;
      return newItem;
    });
    // 过滤出勾选数据
    const newParameters = filter(newItemLine, (item) => {
      return addMaterialSelectedRowKeys.indexOf(item.projectLineItemId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newItemDetails = filter(newItemLine, (item) => {
      return addMaterialSelectedRowKeys.indexOf(item.projectLineItemId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'projectSetup/updateState',
            payload: {
              addMaterialData: newItemDetails,
              addMaterialPagination: delItemsToPagination(
                newParameters.length,
                addMaterialData.length,
                addMaterialPagination
              ),
            },
          });
          this.setState({ addMaterialSelectedRowKeys: [], addMaterialSelectedRows: [] });
        } else {
          dispatch({
            type: 'projectSetup/deleteSectionItemLine',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'projectSetup/updateState',
                payload: {
                  addMaterialData: newItemDetails,
                  addMaterialPagination: delItemsToPagination(
                    newParameters.length,
                    addMaterialData.length,
                    addMaterialPagination
                  ),
                },
              });
              this.fetchAddMaterialData();
              this.fetchProjectSetupHeaderData();
              this.setState({ addMaterialSelectedRows: [], addMaterialSelectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 已有物料查询
   */
  @Bind()
  fetchExistItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      projectSetup: { header = {} },
    } = this.props;
    const { addMaterialRecord, detailFlag = false } = this.state;

    const requestFormPayload = detailFlag
      ? {}
      : {
          // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
          requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
            ? 'change'
            : 'maintain',
        };

    // 原有参数
    const originRequestParams = {
      page,
      tenantId: organizationId,
      organizationId,
      sourceProjectId: params.sourceProjectId,
      projectLineSectionId: addMaterialRecord.projectLineSectionId,
      ...requestFormPayload,
    };

    dispatch({
      type: 'projectSetup/fetchExistItemLine',
      payload: originRequestParams,
    });
  }

  /**
   * 物品行选择
   *
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   * @memberof Update
   */
  @Bind()
  handleAddMaterialRowKeys(selectedRowKeys, selectedRows) {
    this.setState({
      addMaterialSelectedRowKeys: selectedRowKeys,
      addMaterialSelectedRows: selectedRows,
    });
  }

  /**
   * 已有物料导入Modal 打开
   */
  @Bind()
  handleBatchExport() {
    this.setState({
      existItemLineVisible: true,
    });
    this.fetchExistItemLine();
  }

  // 已有物料导入Modal 关闭
  @Bind()
  cancelExistItemLine() {
    this.setState({
      existItemSelectedRows: [],
      existItemSelectedRowKeys: [],
      existItemLineVisible: false,
    });
  }

  /**
   * 分标段---批量导入物料--保存
   */
  @Bind()
  saveSecItemLines() {
    const {
      dispatch,
      organizationId,
      match: { params },
      projectSetup: { header = {} },
    } = this.props;
    const { existItemSelectedRows, addMaterialRecord, detailFlag = false } = this.state;
    if (!isEmpty(existItemSelectedRows)) {
      const requestFormPayload = detailFlag
        ? {}
        : {
            // 变更中、变更审批拒绝 代表进入变更页面，其他进入维护页面
            requestFrom: ['CHANGING', 'CHANGE_REFUSE'].includes(header?.sourceProjectStatus)
              ? 'change'
              : 'maintain',
          };
      const originRequestParams = {
        newParameters: existItemSelectedRows,
        organizationId,
        projectLineSectionId: addMaterialRecord.projectLineSectionId,
        sourceProjectId: params.sourceProjectId,
        ...requestFormPayload,
      };
      dispatch({
        type: 'projectSetup/saveSecItemLines',
        payload: originRequestParams,
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchAddMaterialData();
          this.setState({
            existItemSelectedRows: [],
            existItemSelectedRowKeys: [],
            existItemLineVisible: false,
          });
        }
      });
    }
  }

  /**
   * 批量导入物料行选择
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   * @memberof Update
   */
  @Bind()
  handleExistItemLineRowKeys(selectedRowKeys, selectedRows) {
    this.setState({
      existItemSelectedRowKeys: selectedRowKeys,
      existItemSelectedRows: selectedRows,
    });
  }

  // 刷新物料行
  @Bind()
  handleRefreshItemLine() {
    const { activeKey } = this.state;
    this.fetchItemLine();
    this.fetchSectionLine();
    // eslint-disable-next-line no-unused-expressions
    activeKey === 'sectionLine' && this.fetchAddMaterialData();
  }

  formatListToString = (list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  };

  // 新批量添加供应商参数
  @Bind()
  fetchSourceSupplierRelativeConfigData = async () => {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const { sourceProjectId } = params || {};
    if (!sourceProjectId) {
      return;
    }

    const param = {
      organizationId,
      sourceHeaderId: sourceProjectId,
    };
    let result = {};
    try {
      result = await fetchSourceSupplierRelativeConfig(param);
      result = getResponse(result);
      if (!result) {
        return;
      }

      if (result.stageAllMismatchFlag === 1) {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.batchAddSupplierMsg`)
            .d(
              '操作失败，失败原因是业务规则定义"可参与立项供应商设置"导致没有供应商可参与，请检查'
            ),
        });
      }

      const {
        supplyReviewStatusList = [],
        reviewStatusList = null,
        existSuppliers = null,
        itemCategoryIds = null,
        itemAndCategoryDTOS = null,
        sourceCode = null,
        stageIdList = null,
        erpFlag = null,
        srmFlag = null,
        queryItemIds = null,
        expandObject = null, // 扩展对象
      } = result;

      result = {
        defaultQueryItemCategoryIds: this.formatListToString(itemCategoryIds),
        supplyReviewStatus: this.formatListToString(reviewStatusList),
        sourceCode,
        erpFlag,
        srmFlag,
        stageIdList,
        itemAndCategoryDTOS,
        supplyReviewStatusList,
        excludeSupplierDetailDTOS: existSuppliers,
        queryItemIds,
        ...(expandObject || {}),
        pageSource: PageSourceSymbol.projectSetupUpdate,
      };
    } catch (e) {
      throw e;
    }

    return result || {};
  };

  // new ui supplier lov add supplier
  newBulkAddSupplier = () => {
    const {
      organizationId,
      form,
      projectSetup: { header },
      match: { params },
      dispatch,
    } = this.props;
    const { getFieldValue } = form;
    const data = this.SupplierLovDS?.toData();
    const { supplierLovList = [] } = data?.[0] || {};

    if (isEmpty(supplierLovList)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const selectLines = supplierLovList;
    const companyId = getFieldValue('companyId') || header.companyId || null;
    if (!companyId || !organizationId) {
      return;
    }

    const newParams = selectLines.map((item) => {
      const {
        mail,
        mobilephone,
        contactMail,
        contactPhone,
        name = null,
        supplierName,
        supplierCompanyName,
        supplierNum,
        supplierCompanyId,
        supplierCompanyNum,
        internationalTelCode = null,
      } = item || {};
      return {
        ...item,
        contactName: name,
        sourceProjectId: params.sourceProjectId,
        tenantId: organizationId,
        contactMail: mail || contactMail,
        contactMobilephone: mobilephone || contactPhone,
        mobilephone: mobilephone || contactPhone,
        supplierCompanyId,
        supplierCompanyName: supplierCompanyName || supplierName,
        supplierCompanyNum: supplierCompanyNum || supplierNum,
        internationalTelCode,
      };
    });

    dispatch({
      type: 'projectSetup/saveSupplier',
      payload: {
        newParams,
        organizationId,
        sourceProjectId: params.sourceProjectId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.SupplierLovDS.loadData([]);
        this.fetchSupplierLine();
      }
    });
  };

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport() {
    const {
      organizationId,
      projectSetup: {
        header: { sourceProjectId },
      },
    } = this.props;
    const { activeKey, addMaterialRecord } = this.state;
    const importProps = {
      code: 'SSRC.PROJECT_LINE_ITEM',
      prefixPatch: SRM_SSRC,
      args: JSON.stringify(
        Object.assign(
          {},
          {
            tenantId: organizationId,
            organizationId,
            sourceProjectId,
            templateCode: 'SSRC.PROJECT_LINE_ITEM',
          },
          activeKey === 'sectionLine' && {
            sectionCode: addMaterialRecord?.sectionCode,
          }
        )
      ),
      backPath: undefined,
      action: 'hzero.common.title.batchImport',
    };
    C7nModal.open({
      key: C7nModal.key(),
      closable: true,
      drawer: true,
      title: intl.get(`ssrc.projectSetup.view.message.title.projectSetup`).d('寻源立项'),
      style: { width: '80%', zIndex: 2000 },
      children: <CommonImport {...importProps} />,
      onOK: this.handleRefreshItemLine,
      onCancel: this.handleRefreshItemLine,
      onClose: this.handleRefreshItemLine,
    });
  }

  @Bind()
  getButtons() {
    const {
      match: { params = {} },
      createProjectLoading,
      saveProjectSetupLoading,
      projectSetupSubmitLoading,
      deleteProjectSetupLoading,
      cancelProjectSetupLoading,
      organizationId,
      saveItemLineLoading,
      fetchItemLineLoading,
      fetchSectionLoading,
      saveSectionLoading,
      ssrcRemote,
      history,
      form,
    } = this.props;
    const {
      submitLoading,
      attachmentUUID,
      detailFlag = false,
      sourceProjectStatus = null,
      enableChangeFlag = null,
    } = this.state;

    const { sourceProjectId = null } = params;
    const updateFlag = !detailFlag && sourceProjectId && sourceProjectStatus;

    const otherProps = {
      sourceProjectId,
      updateFlag,
      object: this,
      history,
      form,
      btnLoading:
        submitLoading ||
        projectSetupSubmitLoading ||
        saveProjectSetupLoading ||
        saveItemLineLoading ||
        fetchItemLineLoading ||
        saveSectionLoading ||
        fetchSectionLoading,
      sourceProjectStatus,
    };
    const buttons = [
      updateFlag &&
        (['NEW', 'REFUSE', 'CHANGING', 'CHANGE_REFUSE'].includes(sourceProjectStatus) ||
          enableChangeFlag === 1) && {
          name: 'submit',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.submit').d('提交'),
          btnProps: {
            onClick: this.projectSetupSubmit,
            icon: 'rocket',
            color: 'primary',
            loading:
              submitLoading ||
              projectSetupSubmitLoading ||
              saveProjectSetupLoading ||
              saveItemLineLoading ||
              fetchItemLineLoading ||
              saveSectionLoading ||
              fetchSectionLoading,
          },
        },
      updateFlag &&
        (['NEW', 'REFUSE', 'CHANGING', 'CHANGE_REFUSE'].includes(sourceProjectStatus) ||
          enableChangeFlag === 1) && {
          name: 'save',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: {
            onClick: this.saveProjectSetup,
            icon: 'save',
            loading:
              projectSetupSubmitLoading ||
              saveProjectSetupLoading ||
              saveItemLineLoading ||
              fetchItemLineLoading ||
              saveSectionLoading ||
              fetchSectionLoading,
          },
        },
      updateFlag &&
        sourceProjectStatus === 'NEW' && {
          name: 'delete',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.btn.delete').d('删除'),
          btnProps: {
            onClick: this.deleteProjectSetup,
            icon: 'delete',
            loading: deleteProjectSetupLoading,
          },
        },
      updateFlag &&
        (['REFUSE', 'CHANGING', 'CHANGE_REFUSE'].includes(sourceProjectStatus) ||
          enableChangeFlag === 1) && {
          name: 'rollback',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.invalid').d('作废'),
          btnProps: {
            onClick: this.cancelProjectSetup,
            icon: 'rollback',
            loading: cancelProjectSetupLoading,
          },
        },
      sourceProjectId === 'null' && {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          onClick: this.projectCreate,
          icon: 'save',
          loading: createProjectLoading,
        },
      },
      {
        name: detailFlag ? 'viewAttachment' : 'attachment',
        btnComp: Upload,
        childFor: 'btnText',
        btnProps: {
          filePreview: true,
          viewOnly: detailFlag,
          btnProps: {
            icon: detailFlag ? 'paper-clip' : 'upload',
          },
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-bid-projectsetup',
          attachmentUUID,
          tenantId: organizationId,
          afterOpenUploadModal: this.saveAttachmentUUID,
          fileSize: FIlESIZE,
        },
      },
    ];
    return ssrcRemote
      ? ssrcRemote.process('SSRC_PROJECT_SETUP_UPDATE_PROCESS_OPERATION', buttons, otherProps)
      : buttons;
  }

  @Bind()
  async purchaseRequestOk() {
    const {
      match: { params },
    } = this.props;
    const { selected } = this.purchaseRequestDs;
    const selectedRowKeys = selected.map((ele) => ele.toData().prLineId);
    if (selectedRowKeys.length === 0) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.message.pleaseSelectAtleastOneData')
          .d('请至少选择一条数据'),
      });
      return false;
    }

    const result = getResponse(
      await createQuoteApprovalDetail({
        prLineIdList: selectedRowKeys,
        configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
        sourceProject: {
          sourceProjectId: params.sourceProjectId,
        },
      })
    );

    if (result) {
      this.fetchProjectSetupHeader(true);
      this.clearDsCacheData(this.purchaseRequestDs);
    } else {
      return false;
    }
  }

  // 清除ds缓存
  clearDsCacheData(ds) {
    if (!ds) return;
    ds.reset();
    ds.loadData([]);
    ds.clearCachedSelected();
    ds.clearCachedModified();
    ds.clearCachedRecords();
  }

  // 引用申请立项
  @Bind()
  async handleQuoteApproval() {
    const {
      history,
      organizationId,
      match: { params },
    } = this.props;
    const { doubleUnitFlag, current, sourceFrom } = this.state;
    const search = querystring.stringify({
      routeFrom: 'projectSetupUpdate',
      sourceProjectId: params.sourceProjectId,
      backPath: `${getActiveTabKey()}/update/${
        params.sourceProjectId
      }?current=${current}&sourceFrom=${sourceFrom}`,
    });
    let data = null;
    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_execution_link_old_tenant',
        organizationId,
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      if (isEmpty(data)) {
        const modalKey = C7nModal.key();
        const Props = {
          organizationId,
          PurchaseRequestDS: this.purchaseRequestDs,
          doubleUnitFlag,
          executionLinkFlag: 1,
        };
        C7nModal.open({
          destroyOnClose: true,
          key: modalKey,
          drawer: true,
          title: intl.get('ssrc.projectSetup.view.button.quoteApproval').d('引用申请立项'),
          children: <PurchaseRequestContent {...Props} />,
          style: { width: '80%' },
          onOk: this.purchaseRequestOk,
          onClose: () => this.clearDsCacheData(this.purchaseRequestDs),
        });
      } else {
        history.push({
          pathname: `/ssrc/new-project-setup/quoteApproval`,
          search,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  // 打开操作记录
  @Bind()
  handleOperation() {
    const { match } = this.props;
    const { openModal } = useOperationRecordModal();
    openModal({
      sourceProjectId: match.params.sourceProjectId,
    });
  }

  @Bind()
  getDetailButtons() {
    const { organizationId } = this.props;
    const { attachmentUUID } = this.state;
    const buttons = [
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          onClick: this.handleOperation,
        },
      },
      {
        name: 'viewAttachment',
        btnComp: Attachment,
        btnProps: {
          readOnly: true,
          viewMode: 'popup',
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-bid-projectsetup',
          value: attachmentUUID,
          tenantId: organizationId,
          color: 'default',
        },
      },
    ];
    return buttons;
  }

  /**
   * supplier line table
   * @cux shuidi
   * */
  renderSupplierLineTable = (supplierLineTableProps = {}) => {
    return <SupplierLineTable {...supplierLineTableProps} />;
  };

  render() {
    const {
      form,
      userId,
      match: { params = {}, path },
      fetchProjectSetupHeaderLoading = false,
      customizeForm,
      customizeTable,
      customizeTabPane,
      customizeBtnGroup,
      custLoading = false,
      projectSetup,
      projectSetup: {
        header = {},
        code: {
          sourceMethods = [],
          sourceCategorys = [],
          bidSourceCategorys = [],
          allSourceCategorys = [],
          projectPlanStages = [],
          subjectMater = [],
          idd = [],
          rfxConfig = [],
        },
        itemLine = [],
        itemLinePagination = {},
        supplierLine = [],
        supplierLinePagination = {},
        planLine = [],
        planLinePagination = {},
        bulkSupplierList = [],
        bulkSupplierListPagination = {},
        sectionLine = [],
        sectionPagination = {},
        addMaterialData = [],
        addMaterialPagination = {},
        existItemLine = [],
        existItemLinePagination = {},
      },
      organizationId,
      fetchItemLineLoading,
      saveItemLineLoading,
      fetchPlanLineLoading,
      savePlanLineLoading,
      deletePlanLinesLoading,
      deleteSupplierLinesLoading,
      saveSupplierLoading,
      fetchSupplierLoading,
      deleteItemLinesLoading,
      fetchBulkSupplierDataLoading,
      fetchSectionLoading,
      saveSectionLoading,
      deleteSectionLinesLoading,
      addMaterialLoading,
      saveMaterialLoading,
      deleteMaterialLoading,
      fetchExistItemLoading,
      newDetailPageFlag = false, // 寻源项目改造后的新明细页项目发布节点
      history,
      ssrcRemote,
    } = this.props;
    const {
      isBid = false,
      isAll = false,
      doubleUnitFlag,
      detailFlag = false,
      sourceFrom = null,
      collapseKeys,
      itemLineSelectedRows = [],
      itemLineSelectedRowKeys = [],
      supplierLineSelectedRowKeys = [],
      planLineSelectedRows = [],
      planLineSelectedRowKeys = [],
      bulkAddSupplierVisible = false,
      bulkAddSupplierSelectedRows = [],
      sectionSelectedRowKeys = [],
      activeKey,
      addMaterialVisible,
      addMaterialRecord,
      addMaterialSelectedRowKeys = [],
      existItemLineVisible,
      supplierLinePage = {},
      existItemSelectedRowKeys = [],
      supplierConfigOldFlag = true,
      sourceProject,
      qualificationInfo,
      supplierConfigOldUserFlag = true,
    } = this.state;

    const { sourceProjectId = null } = params;
    const { getFieldValue } = form;
    const sourceMethod = getFieldValue('sourceMethod') || null;
    const companyId = getFieldValue('companyId') || header.companyId || null;

    // 判断是否是工作流嵌入的表单页面
    const isPubPage =
      path === '/pub/ssrc/new-project-setup/detail/:sourceProjectId' ||
      path === '/pub/ssrc/project-setup/detail/:sourceProjectId';

    // basic info props
    const BasicInfoProps = {
      history,
      isPubPage,
      sourceProjectId,
      ssrcRemote,
      form,
      header,
      detailFlag,
      sourceFrom,
      isBid,
      isAll,
      sourceCategorys,
      bidSourceCategorys,
      allSourceCategorys,
      sourceMethods,
      organizationId,
      customizeForm,
      custLoading,
      subjectMater,
      projectSetup,
      idd,
      rfxConfig,
      changeCompanyLov: this.changeCompanyLov,
      changeSourceMethod: this.changeSourceMethod,
      changeSubjectMatterRule: this.changeSubjectMatterRule,
      changeSourceCategory: this.changeSourceCategory,
    };

    const importProps = {
      businessObjectTemplateCode: 'SSRC.PROJECT_LINE_ITEM',
      prefixPatch: SRM_SSRC,
      args: Object.assign(
        {},
        {
          tenantId: organizationId,
          organizationId,
          sourceProjectId,
          templateCode: 'SSRC.PROJECT_LINE_ITEM',
        },
        activeKey === 'sectionLine' && {
          sectionCode: addMaterialRecord?.sectionCode,
        }
      ),
      icon: 'archive',
      tenantId: organizationId,
      successCallBack: this.handleRefreshItemLine,
    };

    // item line row  selection
    const itemLineRowSelection = {
      selectedRowKeys: itemLineSelectedRowKeys,
      onChange: this.handleItemLineRowSelectChange,
    };

    // itemLine
    const itemLineTableProps = {
      ssrcRemote,
      form,
      header,
      doubleUnitFlag,
      organizationId,
      detailFlag,
      itemLineSelectedRows,
      itemLineSelectedRowKeys,
      itemLineRowSelection,
      customizeTable,
      sourceProjectId,
      importProps,
      loading: fetchItemLineLoading,
      saveLoading: saveItemLineLoading || fetchItemLineLoading,
      deleteLoading: deleteItemLinesLoading,
      dataSource: itemLine,
      pagination: itemLinePagination,
      onSearch: this.changeItemLinePage,
      onCreateLine: this.createItemLine,
      onSaveLine: this.saveItemLine,
      fetchItemLine: this.fetchItemLine,
      onDeleteLines: this.deleteItemLines,
      batchMainItemLine: this.batchMainItemLine,
      linktoPrNumDetail: this.linktoPrNumDetail,
      onBatchImport: this.handleBatchImport,
      custLoading,
      customizeBtnGroup,
      onForceSaveLine: this.onForceSaveLine,
      onCopyLines: this.onCopyLines,
      handleQuoteApproval: this.handleQuoteApproval,
      fetchSectionLine: this.fetchSectionLine,
      handleItemLineRowSelectChange: this.handleItemLineRowSelectChange,
      sourceProject,
    };

    // plan line row  selection
    const planLineRowSelection = {
      selectedRowKeys: planLineSelectedRowKeys,
      onChange: this.handlePlanLineRowSelectChange,
    };

    // planLine
    const planLineTableProps = {
      ssrcRemote,
      form,
      organizationId,
      projectPlanStages,
      detailFlag,
      planLineSelectedRows,
      planLineSelectedRowKeys,
      planLineRowSelection,
      customizeTable,
      loading: fetchPlanLineLoading,
      saveLoading: savePlanLineLoading || fetchPlanLineLoading,
      deleteLoading: deletePlanLinesLoading,
      dataSource: planLine,
      pagination: planLinePagination,
      onSearch: this.changePlanLinePage,
      onCreateLine: this.createPlanLine,
      onSaveLine: this.savePlanLine,
      onDeleteLines: this.deletePlanLines,
    };

    const sectionRowSelection = {
      selectedRowKeys: sectionSelectedRowKeys,
      onChange: this.handleSectionRowSelectChange,
    };
    // sectionLine
    const sectionInformProps = {
      form,
      organizationId,
      projectPlanStages,
      detailFlag,
      sectionSelectedRowKeys,
      sectionRowSelection,
      customizeTable,
      loading: fetchSectionLoading,
      saveLoading: saveSectionLoading || fetchSectionLoading,
      deleteLoading: deleteSectionLinesLoading,
      dataSource: sectionLine,
      pagination: sectionPagination,
      openAddMaterial: this.openAddMaterial,
      onSearch: this.changeSectionPage,
      onCreateLine: this.createSectionLine,
      onSaveLine: this.saveSectionLine,
      onDeleteLines: this.deleteSectionLines,
      custLoading,
    };

    const supplierRowSelection = {
      selectedRowKeys: supplierLineSelectedRowKeys,
      onChange: this.handleSupplierLineRowSelectChange,
    };
    const bulkAddSupplierRowSelection = {
      selectedRowKeys:
        bulkAddSupplierSelectedRows && bulkAddSupplierSelectedRows.map((item) => item.companyId),
      onChange: this.handleBulkAddSupplierRowSelectChange,
    };

    const supplierLineTableProps = {
      header,
      history,
      idd,
      detailFlag,
      companyId,
      sourceProjectId,
      userId,
      organizationId,
      customizeTable,
      supplierLinePage,
      supplierRowSelection,
      supplierLineSelectedRowKeys,
      loading: fetchSupplierLoading,
      saveLoading: saveSupplierLoading || fetchSupplierLoading,
      dataSource: supplierLine,
      pagination: supplierLinePagination,
      onSearch: this.changeSupplierLinePage,
      onSaveLine: this.saveSupplierLine,
      onDeleteLines: this.deleteSupplierLines,
      deleteLoading: deleteSupplierLinesLoading,
      onChangeTableData: this.changeSupplierLineTableData,
      onBulkAddSupplier: this.bulkAddSupplier,
      createSupplierLine: this.createSupplierLine,
      fetchSupplierLine: this.fetchSupplierLine,
      subjectMatterRule: form.getFieldValue('subjectMatterRule') || header.subjectMatterRule,
      custLoading,
      qualificationInfo,
      supplierConfigOldFlag,
      supplierConfigOldUserFlag,
      supplierLovProps: {
        dataSet: this.SupplierLovDS,
        name: 'supplierLovList',
        mode: 'button',
        color: 'primary',
        clearButton: false,
        placeholder: intl
          .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
          .d('批量添加供应商'),
        modalProps: {
          style: { maxWidth: '1500px', width: '1000px' },
          onOk: () => this.newBulkAddSupplier(),
          onCancel: () => {
            this.SupplierLovDS.loadData([]);
          },
        },
        beforeQuery: this.fetchSourceSupplierRelativeConfigData,
        queryData: { companyId },
      },
    };

    const bulkAddSupplierProps = {
      rowSelection: bulkAddSupplierRowSelection,
      loading: fetchBulkSupplierDataLoading,
      pagination: bulkSupplierListPagination,
      dataSource: bulkSupplierList,
      visible: bulkAddSupplierVisible,
      onRef: this.handleBindRef,
      onSearch: this.fetchBulkSupplierData,
      onCancel: this.cancelBulkAddSupplier,
      onChange: this.fetchBulkSupplierData,
      onOk: this.handleBulkAddSupplier,
      customizeTable,
    };

    const addMaterialRowSelection = {
      selectedRowKeys: addMaterialSelectedRowKeys,
      onChange: this.handleAddMaterialRowKeys,
    };

    const existItemLineRowSelection = {
      selectedRowKeys: existItemSelectedRowKeys,
      onChange: this.handleExistItemLineRowKeys,
    };

    const addMaterialProps = {
      form,
      doubleUnitFlag,
      organizationId,
      companyId,
      header,
      params,
      detailFlag,
      importProps,
      visible: addMaterialVisible,
      addMaterialRecord,
      loading: addMaterialLoading,
      saveMaterialLoading,
      deleteMaterialLoading,
      pagination: addMaterialPagination,
      dataSource: addMaterialData,
      addMaterialSelectedRowKeys,
      rowSelection: addMaterialRowSelection,
      onSaveLadderLine: this.saveLadderLevel,
      onCreateLadderLine: this.createLadderLine,
      onDeleteLadderLines: this.deleteLadderLevel,
      onRef: this.handleBindRef,
      onCancel: this.cancelAddMateria,
      onChange: this.fetchAddMaterialData,
      createSectionItem: this.createSectionItem,
      saveSectionItemLine: this.saveSectionItemLine,
      deleteSectionItemLine: this.deleteSectionItemLine,
      handleBatchExport: this.handleBatchExport,
      oneBatchImport: this.handleBatchImport,
      customizeBtnGroup,
      saveSectionForce: this.saveSectionForce,
    };
    // 已有物料导入Modal
    const itemLineProps = {
      pagination: existItemLinePagination,
      dataSource: existItemLine,
      visible: existItemLineVisible,
      fetchExistItemLoading,
      onRef: this.handleBindRef,
      existItemSelectedRowKeys,
      onCancel: this.cancelExistItemLine,
      onChange: this.fetchExistItemLine,
      saveSecItemLines: this.saveSecItemLines,
      rowSelection: existItemLineRowSelection,
    };

    return (
      <React.Fragment className={classnames(common['page-content-wrapper-custome'])}>
        {isPubPage || newDetailPageFlag ? null : (
          <Header
            backPath={this.getBackPath()}
            title={
              sourceProjectId === 'null'
                ? intl
                    .get('ssrc.projectSetup.view.message.title.projectSetupCreate')
                    .d('新建寻源立项')
                : intl
                    .get('ssrc.projectSetup.view.message.title.projectSetupEdit')
                    .d('编辑寻源立项')
            }
          >
            {detailFlag
              ? customizeBtnGroup(
                  {
                    code: 'SSRC.PROJECT_SETUP_DETAIL.HEADER_BUTTONS',
                    pro: true,
                  },
                  <DynamicButtons buttons={this.getDetailButtons()} />
                )
              : customizeBtnGroup(
                  {
                    code: 'SSRC.PROJECT_SETUP_EDIT.HEAD_BUTTONS',
                    pro: true,
                  },
                  <DynamicButtons buttons={this.getButtons()} />
                )}
          </Header>
        )}
        {isPubPage ? (
          <Header>
            <Attachment
              readOnly
              viewMode="popup"
              color="default"
              value={
                header?.sourceProjectAttachmentUuid
                  ? header?.sourceProjectAttachmentUuid
                  : undefined
              }
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-bid-projectsetup"
              data={{
                tenantId: getCurrentOrganizationId(),
              }}
            />
          </Header>
        ) : null}
        <Content
          className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}
          style={newDetailPageFlag ? { margin: 0, padding: 0 } : null}
        >
          <Spin spinning={sourceProjectId === 'null' ? false : fetchProjectSetupHeaderLoading}>
            <Collapse
              className="form-collapse"
              onChange={this.onCollapseChange}
              defaultActiveKey={['baseInfos']}
            >
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>
                      {intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="baseInfos"
              >
                <BasicInfo {...BasicInfoProps} />
              </Panel>
            </Collapse>
            {sourceProjectId !== 'null'
              ? customizeTabPane(
                  {
                    code: 'SSRC.PROJECT_SETUP_EDIT.LINE_TAB',
                  },
                  <Tabs activeKey={activeKey} animated={false} onChange={this.changeTabs}>
                    {getFieldValue('subjectMatterRule') === 'PACK' ? (
                      <Tabs.TabPane
                        tab={this.tabTitleMap.sectionLine}
                        key="sectionLine"
                        forceRender
                      >
                        <SectionTable {...sectionInformProps} />
                      </Tabs.TabPane>
                    ) : null}

                    <Tabs.TabPane tab={this.tabTitleMap.itemLine} key="itemLine" forceRender>
                      {this.renderItemLineTable(itemLineTableProps)}
                    </Tabs.TabPane>
                    {sourceMethod === 'INVITE' && (
                      <Tabs.TabPane
                        tab={this.tabTitleMap.supplierLine}
                        key="supplierLine"
                        forceRender
                      >
                        {this.renderSupplierLineTable(supplierLineTableProps)}
                      </Tabs.TabPane>
                    )}
                    <Tabs.TabPane tab={this.tabTitleMap.planLine} key="planLine" forceRender>
                      <PlanLineTable {...planLineTableProps} />
                    </Tabs.TabPane>
                  </Tabs>
                )
              : null}
          </Spin>
        </Content>
        <BulkAddSupplier {...bulkAddSupplierProps} />
        <AddMaterialModal {...addMaterialProps} />
        <ItemLineImport {...itemLineProps} />
      </React.Fragment>
    );
  }
}

const HOCComponent = Form.create({ fieldNameProp: null })(
  withCustomize({
    unitCode: [
      'SSRC.PROJECT_SETUP_DETAIL.BASEINFOS',
      'SSRC.PROJECT_SETUP_DETAIL.LINE_ITEM',
      'SSRC.PROJECT_SETUP_DETAIL.LINE_SUPPLIER',
      'SSRC.PROJECT_SETUP_EDIT.BASEINFOS',
      'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
      'SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER',
      'SSRC.PROJECT_SETUP_EDIT.LINE_PLAN',
      'SSRC.PROJECT_SETUP_DETAIL.LINE_PLAN',
      'SSRC.PROJECT_SETUP_EDIT.LINE_TAB',
      'SSRC.PROJECT_SETUP_DETAIL.SUPPLIERBATCH',
      'SSRC.PROJECT_SETUP_EDIT.HEAD_BUTTONS', // 按钮组
      'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM_BUTTON', // 物料按钮组
      'SSRC.PROJECT_SETUP_EDIT.SECTION_LINE_ITEM_BUTTON', // 标段-添加物料按钮组
      'SSRC.PROJECT_SETUP_DETAIL.HEADER_BUTTONS', // 明细头部按钮
      'SSRC.PROJECT_SETUP_EDIT.LINE_SECTION', // 标段行
      'SSRC.PROJECT_SETUP_DETAIL.LINE_SECTION', // 标段行明细页
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.projectSetup',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.sourceTemplate',
        'ssrc.supplierQuotation',
        'ssrc.bidEventQuery',
        'scux.ssrc',
      ],
    })(
      connect(({ projectSetup, loading }) => ({
        projectSetup,
        fetchProjectSetupHeaderLoading: loading.effects['projectSetup/fetchProjectSetupHeader'],
        createProjectLoading: loading.effects['projectSetup/createProject'],
        saveProjectSetupLoading: loading.effects['projectSetup/saveProjectSetup'],
        projectSetupSubmitLoading: loading.effects['projectSetup/projectSetupSubmit'],
        deleteProjectSetupLoading: loading.effects['projectSetup/deleteProjectSetup'],
        cancelProjectSetupLoading: loading.effects['projectSetup/cancelProjectSetup'],
        fetchBulkSupplierDataLoading: loading.effects['projectSetup/fetchBulkSupplierData'],
        fetchSupplierLoading: loading.effects['projectSetup/fetchSupplier'],
        saveSupplierLoading: loading.effects['projectSetup/saveSupplier'],
        deleteSupplierLinesLoading: loading.effects['projectSetup/deleteSupplierLines'],
        fetchItemLineLoading: loading.effects['projectSetup/fetchItemLine'],
        deleteItemLinesLoading: loading.effects['projectSetup/deleteItemLines'],
        fetchPlanLineLoading: loading.effects['projectSetup/fetchPlan'],
        savePlanLineLoading: loading.effects['projectSetup/savePlanList'],
        deletePlanLinesLoading: loading.effects['projectSetup/deletePlanLines'],
        fetchSectionLoading: loading.effects['projectSetup/fetchSectionLine'],
        saveSectionLoading: loading.effects['projectSetup/saveSectionList'],
        deleteSectionLinesLoading: loading.effects['projectSetup/deleteSectionLines'],
        addMaterialLoading: loading.effects['projectSetup/fetchAddMaterialData'],
        saveMaterialLoading: loading.effects['projectSetup/saveSectionItemLine'],
        deleteMaterialLoading: loading.effects['projectSetup/deleteSectionItemLine'],
        fetchExistItemLoading: loading.effects['projectSetup/fetchExistItemLine'],
        organizationId: getCurrentOrganizationId(),
        userId: getCurrentUserId(),
      }))(
        formatterCollections({
          code: [
            'ssrc.inquiryHall',
            'ssrc.projectSetup',
            'ssrc.bidHall',
            'ssrc.common',
            'ssrc.sourceTemplate',
            'ssrc.supplierQuotation',
            'ssrc.bidEventQuery',
            'scux.ssrc',
          ],
        })(
          remote(
            {
              code: 'SSRC_PROJECT_SETUP_UPDATE',
              name: 'ssrcRemote',
            },
            {
              events: {
                // 改变公司之后的处理字段埋点方法
                remoteChangeCompanyEvent() {},
                // 发布二次弹框
                doSubmit(props) {
                  const { doSubmitEvent = () => {} } = props || {};
                  doSubmitEvent();
                },
                // 物料行上选择标段事件
                remoteHandleSectionCodeLov() {},
              },
            }
          )(Update)
        )
      )
    )
  )
);

const hocUpdate = (NewComponent) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.PROJECT_SETUP_DETAIL.BASEINFOS',
        'SSRC.PROJECT_SETUP_DETAIL.LINE_ITEM',
        'SSRC.PROJECT_SETUP_DETAIL.LINE_SUPPLIER',
        'SSRC.PROJECT_SETUP_EDIT.BASEINFOS',
        'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM',
        'SSRC.PROJECT_SETUP_EDIT.LINE_SUPPLIER',
        'SSRC.PROJECT_SETUP_EDIT.LINE_PLAN',
        'SSRC.PROJECT_SETUP_DETAIL.LINE_PLAN',
        'SSRC.PROJECT_SETUP_EDIT.LINE_TAB',
        'SSRC.PROJECT_SETUP_DETAIL.SUPPLIERBATCH',
        'SSRC.PROJECT_SETUP_EDIT.HEAD_BUTTONS', // 按钮组
        'SSRC.PROJECT_SETUP_EDIT.LINE_ITEM_BUTTON', // 物料按钮组
        'SSRC.PROJECT_SETUP_EDIT.SECTION_LINE_ITEM_BUTTON', // 标段-添加物料按钮组
        'SSRC.PROJECT_SETUP_DETAIL.HEADER_BUTTONS', // 明细头部按钮
        'SSRC.PROJECT_SETUP_EDIT.LINE_SECTION', // 标段行
        'SSRC.PROJECT_SETUP_DETAIL.LINE_SECTION', // 标段行明细页
      ],
    })(
      formatterCollections({
        code: [
          'ssrc.inquiryHall',
          'ssrc.projectSetup',
          'ssrc.bidHall',
          'ssrc.common',
          'ssrc.sourceTemplate',
          'ssrc.supplierQuotation',
          'ssrc.bidEventQuery',
          'component.docFlow',
          'scux.ssrc',
        ],
      })(
        connect(({ projectSetup, loading }) => ({
          projectSetup,
          fetchProjectSetupHeaderLoading: loading.effects['projectSetup/fetchProjectSetupHeader'],
          createProjectLoading: loading.effects['projectSetup/createProject'],
          saveProjectSetupLoading: loading.effects['projectSetup/saveProjectSetup'],
          projectSetupSubmitLoading: loading.effects['projectSetup/projectSetupSubmit'],
          deleteProjectSetupLoading: loading.effects['projectSetup/deleteProjectSetup'],
          cancelProjectSetupLoading: loading.effects['projectSetup/cancelProjectSetup'],
          fetchBulkSupplierDataLoading: loading.effects['projectSetup/fetchBulkSupplierData'],
          fetchSupplierLoading: loading.effects['projectSetup/fetchSupplier'],
          saveSupplierLoading: loading.effects['projectSetup/saveSupplier'],
          deleteSupplierLinesLoading: loading.effects['projectSetup/deleteSupplierLines'],
          fetchItemLineLoading: loading.effects['projectSetup/fetchItemLine'],
          deleteItemLinesLoading: loading.effects['projectSetup/deleteItemLines'],
          fetchPlanLineLoading: loading.effects['projectSetup/fetchPlan'],
          savePlanLineLoading: loading.effects['projectSetup/savePlanList'],
          deletePlanLinesLoading: loading.effects['projectSetup/deletePlanLines'],
          fetchSectionLoading: loading.effects['projectSetup/fetchSectionLine'],
          saveSectionLoading: loading.effects['projectSetup/saveSectionList'],
          deleteSectionLinesLoading: loading.effects['projectSetup/deleteSectionLines'],
          addMaterialLoading: loading.effects['projectSetup/fetchAddMaterialData'],
          saveMaterialLoading: loading.effects['projectSetup/saveSectionItemLine'],
          deleteMaterialLoading: loading.effects['projectSetup/deleteSectionItemLine'],
          fetchExistItemLoading: loading.effects['projectSetup/fetchExistItemLine'],
          organizationId: getCurrentOrganizationId(),
          userId: getCurrentUserId(),
        }))(
          remote(
            {
              code: 'SSRC_PROJECT_SETUP_UPDATE',
              name: 'ssrcRemote',
            },
            {
              events: {
                // 改变公司之后的处理字段埋点方法
                remoteChangeCompanyEvent() {},
                // 发布二次弹框
                doSubmit(props) {
                  const { doSubmitEvent = () => {} } = props || {};
                  doSubmitEvent();
                },
                // 物料行上选择标段事件
                remoteHandleSectionCodeLov() {},
              },
            }
          )(withRouter(NewComponent))
        )
      )
    )
  );
};

export default HOCComponent;
export { Update, HOCComponent as HOCUpdate, hocUpdate };
