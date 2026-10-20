/**
 * index - 订单变更明细页面
 * @date: 2020-03-04
 * @author: maojaiqi <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin, Collapse, Icon, Modal, Form } from 'hzero-ui';
// import { DataSet, Modal as C7NModal } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { differenceBy } from 'lodash';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import remoteConfig from './remote';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  addItemToPagination,
  delItemsToPagination,
  getCurrentOrganizationId,
  createPagination,
  getEditTableData,
  // filterNullValueObject,
} from 'utils/utils';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import OrderHeaderInfo from './OrderHeaderInfo';
import OrderLineInfo from './OrderLineInfo';
// import OrderLineInfoC7N from './OrderLineInfoC7N';
// import { orderLineInfoDS, searchDS, BOMTableDS } from './OrderLineInfoDS';
import OperationRecord from './OperationRecord';
import WrapperBOMModal from '../BOMModal';
import {
  formatAumont,
  handleOldBudgetVerification,
  queryCommonDoubleUomConfig,
} from '@/routes/components/utils';
import {
  BUCKET_NAME,
  THROTTLE_TIME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';

const { Panel } = Collapse;
let enableSetCache = false; // 组件卸载时关闭cache的修改，抵消cacheComponent进行setFieldsValue触发onFieldsChange
let cacheFields = {}; // 缓存变更字段

@withCustomize({
  unitCode: [
    'SODR.ORDER_CANCEL_CHANGE.HEADER',
    'SODR.ORDER_CANCEL_CHANGE.LIST',
    'SODR.ORDER_CANCEL_CHANGE.BUTTONS',
    'SODR.ORDER_CANCEL_CHANGE.LIST_BUTTONS',
  ],
})
@formatterCollections({
  code: [
    'sodr.quotePurchase',
    'sodr.ordercancel',
    'sodr.common',
    'entity.company',
    'entity.organization',
    'entity.item',
    'sodr.orderType',
    'sodr.quotePurchaseRequisition',
    'sprm.common',
    'entity.purchaser',
    'sodr.receivedOrder',
    'entity.supplier',
    'hpfm.employee',
    'sodr.orderChange',
    'sodr.workspace',
  ],
})
@Form.create({
  fieldNameProp: null,
  onFieldsChange: (props, fields) => {
    if (enableSetCache) {
      cacheFields = { ...cacheFields, ...fields };
    }
  },
})
@connect(({ orderCancel, loading }) => ({
  orderCancel,
  fetchOperationRecordListLoading: loading.effects['orderCancel/fetchOperationRecordList'],
  fetchChangeHeaderLoading: loading.effects['orderCancel/fetchChangeHeader'],
  fetchLineLoading: loading.effects['orderCancel/fetchChangeLines'],
  submitChangeOrderLoading: loading.effects['orderCancel/submitChangeOrder'],
  queryPoItemBOMLoading: loading.effects['orderCancel/queryPoItemBOM'],
  oldBudgetVerificationLoading: loading.effects['orderCancel/oldBudgetVerification'],
  calculateDoubleUomLoading: loading.effects['quotePurchaseRequisition/calculateDoubleUom'],
  addNewSubmitDetailLoading: loading.effects['orderCancel/addNewSubmitDetail'],
}))
@remotes(...remoteConfig)
export default class OrderChange extends Component {
  constructor(props) {
    super(props);
    const {
      params: { id },
    } = props.match;
    this.state = {
      headerInfo: {},
      changeFields: [],
      dataSource: [],
      poHeaderId: id,
      fetchHeaderFlag: false, // 头查询标识
      // updateFlag: false, // 行信息是否编辑
      match: props.match,
      operationRecordModalVisible: false,
      organizationId: getCurrentOrganizationId(),
      collapseKeys: ['orderHeaderInfo', 'orderLineInfo'],
      wrapperBOMModalVisible: false, // BOM状态
      actionListRowData: {},
      selectedListRows: [],
      purchaserInnerAttachmentCanModify: true,
      attachmentCanModify: true,
      // lovRecord: {},
      // purchaserInnerAttachmentFlag: true,
      // attachmentFlag: true,
      changeFlag: false,
      doubleUnitEnabled: 0,
    };
  }

  componentDidMount() {
    this.init();
    this.fetchHeader();
    this.fetchLine();
    this.fetchChangeFields();
    this.queryDoubleUomConfig();
    // 组件挂载后允许设置缓存
    enableSetCache = true;
  }

  componentWillUnmount() {
    // 组件卸载后禁止设置缓存
    enableSetCache = false;
    cacheFields = {};
  }

  /**
   * 查询双单位配置
   */
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig();
    this.setState({
      doubleUnitEnabled: result || 0,
    });
  }

  // 初始化值集
  @Bind()
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderCancel/init',
    });
  }

  // 订单头信息查询
  @Bind()
  fetchHeader() {
    const { poHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'orderCancel/fetchChangeHeader',
      payload: {
        poHeaderId,
        customizeUnitCode: 'SODR.ORDER_CANCEL_CHANGE.HEADER',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
          fetchHeaderFlag: true,
        });
      }
    });
  }

  // 订单行查询
  @Bind()
  fetchLine(page = {}) {
    const { poHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'orderCancel/fetchChangeLines',
      payload: {
        poHeaderId,
        page,
        customizeUnitCode: 'SODR.ORDER_CANCEL_CHANGE.LIST',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content.map((item) => ({ ...item, _status: 'update' })),
          pagination: createPagination(res),
        });
      }
    });
  }

  // 行可修改字段查询
  @Bind()
  fetchChangeFields() {
    const { dispatch } = this.props;
    const subStr = (str) => {
      const re = /_(\w)/g;
      return str.replace(re, ($0, $1) => {
        return $1.toUpperCase();
      });
    };
    dispatch({
      type: 'orderCancel/fetchChangeFields',
    }).then((res) => {
      if (res) {
        const canChangeFields = res.filter((item) => item.canModifyFlag === 1);
        const changeFields = canChangeFields.map((item) => {
          const { fieldName = '', tableName = '' } = item;
          if (tableName === 'SODR_PO_HEADER' && fieldName === 'remark') {
            return 'headerRemark';
          } else if (tableName === 'SODR_PO_LINE' && fieldName === 'attachment_uuid') {
            return 'lineAttachmentUuid';
          } else {
            return subStr(item.fieldName);
          }
        });
        for (const item of changeFields) {
          if (item === 'attachmentUuid') {
            this.setState({ attachmentCanModify: false });
          }
          if (item === 'purchaserInnerAttachmentUuid') {
            this.setState({ purchaserInnerAttachmentCanModify: false });
          }
        }
        this.setState({ changeFields });
      }
    });
  }

  /**
   * 账户分配类别选择后，在提交前筛选出必输字段
   * 后端无法返回前端对应字段提示（提示信息不友好），因此提交异常提示在前端处理
   */
  @Bind()
  handleRequiredFieldNames(values) {
    let requiredFieldNamesArray = [];
    requiredFieldNamesArray = values.map((n) => {
      const {
        requiredFieldNames = [],
        accountAssignTypeId,
        projectCategory,
        costId,
        accountSubjectId,
        wbsCode,
        freeFlag,
      } = n;
      let requiredFieldNamesFiltered = requiredFieldNames;
      if (accountAssignTypeId) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter(
          (n1) => n1 !== 'accountAssignTypeId'
        );
      }
      if (projectCategory) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter(
          (n1) => n1 !== 'projectCategory'
        );
      }
      if (costId) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter((n1) => n1 !== 'costId');
      }
      if (accountSubjectId) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter(
          (n1) => n1 !== 'accountSubjectId'
        );
      }
      if (wbsCode) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter((n1) => n1 !== 'wbsCode');
      }
      if (freeFlag) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter((n1) => n1 !== 'freeFlag');
      }
      return requiredFieldNamesFiltered;
    });
    // 合并订单行必输字段
    const allRequiredFieldNames = requiredFieldNamesArray.reduce((a, b) => a.concat(b), []);
    // 去重
    const newRequiredFieldNames = Array.from(new Set(allRequiredFieldNames));
    let notice = '';
    for (let i = 0; i < newRequiredFieldNames.length; i++) {
      if (newRequiredFieldNames[i] === 'accountAssignTypeId') {
        notice = notice.concat(
          `【 ${intl
            .get('sodr.quotePurchaseRequisition.view.message.accountAssignType')
            .d('账户分配类别')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'projectCategory') {
        notice = notice.concat(
          `【${intl
            .get('sodr.quotePurchaseRequisition.view.message.projectCategory')
            .d('项目类别')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'costId') {
        notice = notice.concat(
          `【${intl.get('sodr.common.model.common.costName').d('成本中心')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'accountSubjectId') {
        notice = notice.concat(
          `【${intl.get('sodr.workspace.model.common.accountSubjectId').d('总账科目')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'wbsCode') {
        notice = notice.concat(
          `【${intl.get('sodr.quotePurchase.model.quotePurchase.wbs').d('WBS元素')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'freeFlag') {
        notice = notice.concat(
          `【${intl.get('sodr.common.model.common.freeFlag').d('是否免费')}】、`
        );
      }
    }
    const newNotice = notice.substring(0, notice.length - 1);
    return newNotice;
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleSubmit() {
    const { dataSource = [], headerInfo = {}, poHeaderId, changeFlag } = this.state;
    const { dispatch, form, remote } = this.props;
    // const headerValues = form.getFieldsValue();
    // if (!updateFlag) {
    if (
      !this.lineInfo?.current.dataHasChange &&
      Object.keys(cacheFields).length === 0 &&
      !changeFlag
    ) {
      notification.warning({
        message: intl.get(`sodr.orderChange.view.message.noModifyData`).d('未修改任何数据'),
      });
    } else {
      form.validateFieldsAndScroll((err, headerValues) => {
        if (err) return;
        const values = getEditTableData(dataSource, ['_status']);
        const newNotice = this.handleRequiredFieldNames(values);
        const poLineDetailDTOs = values.map((item) => {
          const { poLineLocationId, _status, needByDate } = item;
          return {
            ...item,
            poLineLocationId: _status ? poLineLocationId : null,
            needByDate: needByDate ? moment(needByDate).format(DEFAULT_DATETIME_FORMAT) : undefined,
            viewCode: 'CHANGE_VIEW',
            remark: item.remark || '',
            wbsCode: item.wbsCode || '',
          };
        });
        dispatch({
          type: 'orderCancel/addNewSubmitDetail',
          payload: {
            poHeaderDetailDTO: {
              ...headerInfo,
              ...headerValues,
              changSubmitFlag: 1,
              remark: headerValues.remark || '',
            },
            poLineDetailDTOs,
          },
        }).then((ras) => {
          const submitTo = () =>
            Modal.confirm({
              title: intl.get(`hzero.common.message.confirm.submit`).d('是否确认提交'),
              okText: intl.get('hzero.common.button.sure').d('确定'),
              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
              onOk: () => {
                if (newNotice) {
                  notification.warning({
                    message:
                      newNotice +
                      intl
                        .get(`sodr.ordercancel.view.message.warn.requiredWarning`)
                        .d(
                          '必输，请前往配置中心修改该字段为允许变更或前往采购类型维护页面修改字段必输设置。'
                        ),
                  });
                } else if (
                  dataSource.leng === 0 ||
                  (dataSource.length !== 0 && values.length !== 0)
                ) {
                  const poHeaderDetailDTO = {
                    ...headerInfo,
                    ...headerValues,
                    remark: headerValues.remark || '',
                  };
                  const budgetVerificationData = [
                    {
                      ...poHeaderDetailDTO,
                      displayPoNum: headerInfo.displayPoNum,
                      poLineExpVOList: poLineDetailDTOs,
                    },
                  ];
                  const submit = () => {
                    dispatch({
                      type: 'orderCancel/submitChangeOrder',
                      payload: {
                        poHeaderId,
                        poHeaderDetailDTO,
                        poLineDetailDTOs,
                        customizeUnitCode:
                          'SODR.ORDER_CANCEL_CHANGE.HEADER,SODR.ORDER_CANCEL_CHANGE.LIST',
                      },
                    }).then((res) => {
                      if (res) {
                        notification.success();
                        dispatch(
                          routerRedux.push({
                            pathname: '/sodr/order-cancel/list',
                          })
                        );
                      }
                    });
                  };
                  handleOldBudgetVerification(
                    dispatch,
                    {
                      type: 'orderCancel/oldBudgetVerification',
                      payload: budgetVerificationData,
                    },
                    submit
                  );
                }
                // }
              },
            });
          const confirmModalProps = remote.process('getConfirmModalProps', {
            data: ras,
            type: 'change-h0',
            basicInfo: { ...headerInfo, ...headerValues },
          });
          if (ras.value) {
            Modal.confirm({
              title: ras.message,
              okText: intl.get('hzero.common.button.sure').d('确定'),
              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
              onOk: () => {
                submitTo();
              },
              ...confirmModalProps,
            });
          } else {
            submitTo();
          }
        });
      });
    }
  }

  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({ collapseKeys });
  }

  /**
   * changeOperationRecord - 操作记录弹窗
   */
  @Bind()
  changeOperationRecord(visible) {
    this.setState({ operationRecordModalVisible: visible });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { headerInfo = {} } = this.state;
    this.handleSetChangeFlag();
    if (!headerInfo.attachmentUuid) {
      this.getHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const { poHeaderId } = this.state;
    dispatch({
      type: 'orderCancel/saveAttachmentUUID',
      payload: { poHeaderId, uuid: attachmentUuid, uuidType: 1 },
    }).then((res) => {
      if (res) {
        this.fetchHeader();
      }
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModalLoad(getHeaderAttachmentUuidLoad) {
    const { headerInfo = {} } = this.state;
    this.handleSetChangeFlag();
    if (!headerInfo.purchaserInnerAttachmentUuid) {
      this.getHeaderAttachmentUuidLoad(getHeaderAttachmentUuidLoad);
    }
  }

  /**
   * getHeaderAttachmentUuidLoad - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuidLoad(getHeaderAttachmentUuidLoad) {
    const { dispatch } = this.props;
    const { poHeaderId } = this.state;
    if (!poHeaderId || !getHeaderAttachmentUuidLoad) return;
    dispatch({
      type: 'orderCancel/saveAttachmentUUID',
      payload: { poHeaderId, uuid: getHeaderAttachmentUuidLoad, uuidType: 3 },
    }).then((res) => {
      if (res) {
        this.fetchHeader();
      }
    });
  }

  // @Bind()
  // handleChangeItem() {
  //   this.setState({ updateFlag: true });
  // }

  // @Bind()
  // handleChangeItemList(e, record) {
  //   const { dataSource } = this.state;
  //   dataSource.forEach(item => {
  //     if (item.poLineLocationId === record.poLineLocationId) {
  //       if (record.quantity === e) {
  //         this.setState({ updateFlag: false });
  //       } else {
  //         this.setState({ updateFlag: true });
  //       }
  //     }
  //   });
  // }

  /**
   * 调整金额精度
   * @param {number} amount
   * @param {number} financialPrecision
   */
  @Bind()
  amountFinancialPrecision(amount, financialPrecision, poSourcePlatform) {
    if (poSourcePlatform === 'ERP') {
      return formatAumont(amount);
    } else {
      return formatAumont(amount, financialPrecision, true);
    }
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  @Bind()
  openBOMModal(actionListRowData = {}) {
    this.setState({
      wrapperBOMModalVisible: true,
      actionListRowData,
    });
  }

  /**
   * closeBOMModal - 关闭BOM Modal 清空当前操作行数据
   */
  @Bind()
  closeBOMModal() {
    this.setState({
      wrapperBOMModalVisible: false,
      actionListRowData: {},
    });
  }

  /**
   * fetchMessage - 查询BOM数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  fetchBOM(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { actionListRowData = {} } = this.state;
    const { poLineId, poLineLocationId } = actionListRowData;
    dispatch({
      type: 'orderCancel/queryPoItemBOM',
      params: {
        poHeaderId: match.params.id,
        poLineId,
        poLineLocationId,
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  @Bind()
  async validateItemAndInv(invOrganizationId) {
    const { dispatch } = this.props;
    const { dataSource = [], headerInfo = {} } = this.state;
    const list = dataSource.map((i) => {
      const { prLineId, ...others } = i;
      return {
        ...(i.uuidFlag ? others : i),
        ...(i.$form ? i.$form.getFieldsValue() : {}),
        poLineId: i._status === 'create' ? null : i.poLineId,
      };
    });
    const response = await dispatch({
      type: 'orderCancel/checkInvOrganization',
      payload: {
        list: { poHeaderDetailDTO: headerInfo, poLineDetailDTOs: list },
        invOrganizationId,
      },
    });
    return response !== 'SUCCESS';
  }

  /**
   * 修改Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  handleChangeLov(lovRecord) {
    const {
      form: { registerField, setFieldsValue },
    } = this.props;

    //  this.setState({ lovRecord });
    const { supplierId, supplierCompanyId } = lovRecord;
    registerField('supplierId');
    setFieldsValue({ supplierId });
    const { priceModal } = this.state;
    this.setState({
      priceModal: { ...priceModal, supplierCompanyId: supplierCompanyId || supplierId },
    });
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedListRows: selectedRows });
  }

  /**
   * 拆分
   */
  @Bind()
  handleTranslate(record) {
    const { dataSource = [], pagination = {} } = this.state;
    const newItem = {
      ...record,
      ...(record.$form ? record.$form.getFieldsValue() : {}),
      poLineId: null,
      displayLineNum: null,
      poLineLocationId: uuid(),
      splitFromLineNum: record.displayLineNum,
      _status: 'create',
    };
    const indexList = dataSource.findIndex((e) => e.poLineId === record.poLineId);
    const newPagaination = addItemToPagination(dataSource.length, pagination);
    dataSource.splice(indexList + 1, 0, newItem);
    this.handleSetChangeFlag();
    this.setState({
      dataSource,
      pagination: newPagaination,
    });
  }

  @Bind()
  handleDeleteLines() {
    const onOk = () => {
      const { dataSource = [], pagination = {}, selectedListRows = [] } = this.state;
      const newDataSource = differenceBy(dataSource, selectedListRows, 'poLineLocationId');
      const newPagaination = delItemsToPagination(
        selectedListRows.length,
        dataSource.length,
        pagination
      );
      this.setState({
        dataSource: newDataSource,
        pagination: newPagaination,
        selectedListRows: [],
      });
    };
    Modal.confirm({
      title: intl.get('sodr.common.model.common.deltetLists').d('是否删除数据？'),
      onOk,
    });
  }

  @Bind()
  handleSetChangeFlag() {
    const { changeFlag } = this.state;
    if (!changeFlag) {
      this.setState({ changeFlag: true });
    }
  }

  render() {
    const {
      form,
      dispatch,
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      orderCancel = {},
      fetchLineLoading,
      calculateDoubleUomLoading,
      fetchChangeHeaderLoading,
      submitChangeOrderLoading,
      fetchOperationRecordListLoading,
      queryPoItemBOMLoading,
      oldBudgetVerificationLoading,
      addNewSubmitDetailLoading,
      remote,
    } = this.props;
    const {
      detailOperationQuery,
      operationRecordList,
      operationRecordPagination,
      enumMap = {},
    } = orderCancel;
    const { freeFlag = [] } = enumMap;
    const {
      match,
      // poHeaderId,
      headerInfo,
      dataSource,
      pagination,
      changeFields,
      organizationId,
      fetchHeaderFlag,
      collapseKeys = [],
      operationRecordModalVisible,
      wrapperBOMModalVisible,
      actionListRowData = {},
      selectedListRows,
      purchaserInnerAttachmentCanModify,
      attachmentCanModify,
      doubleUnitEnabled,
    } = this.state;
    const { itemCode, itemName, poHeaderId, poLineId } = actionListRowData;
    const { ouId, companyId, statusCode } = headerInfo;
    const orderHeaderInfoProps = {
      form,
      customizeForm,
      headerInfo,
      changeFields,
      amountFinancialPrecision: this.amountFinancialPrecision,
    };
    const orderLineInfoProps = {
      dispatch,
      onRef: (node) => {
        this.lineInfo = node;
      },
      customizeTable,
      customizeBtnGroup,
      dataSource,
      pagination,
      ouId,
      companyId,
      changeFields,
      fetchLineLoading,
      calculateDoubleUomLoading,
      freeFlag,
      orderLineInfoDs: this.orderLineInfoDs,
      // onHandleChangeItem: this.handleChangeItem,
      // handleChangeItemList: this.handleChangeItemList,
      fetchLine: this.fetchLine,
      openBOMModal: this.openBOMModal,
      amountFinancialPrecision: this.amountFinancialPrecision,
      onChangeListData: this.handleChangeLov,
      handleRowSelectedChange: this.handleRowSelectedChange,
      selectedListRows,
      headerInfo,
      enumMap,
      form,
      doubleUnitEnabled,
      validateItemAndInv: this.validateItemAndInv,
      handleTranslate: this.handleTranslate,
      handleDeleteLines: this.handleDeleteLines,
      handleSetChangeFlag: this.handleSetChangeFlag,
    };
    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      detailOperationQuery,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      hideModal: () => this.changeOperationRecord(false),
    };
    const { attachmentUuid, purchaserInnerAttachmentUuid } = headerInfo;
    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal,
      fetchBOM: this.fetchBOM,
      actionkey: poLineId,
      processing: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
    };
    const headerBtnsRender = [
      {
        name: 'submit',
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          icon: 'check',
          type: 'primary',
          onClick: this.handleSubmit,
          disabled:
            !fetchHeaderFlag ||
            !['APPROVED', 'REJECTED', 'PUBLISHED', 'CONFIRMED', 'PART_FEED_BACK'].includes(
              statusCode
            ),
          loading:
            submitChangeOrderLoading ||
            oldBudgetVerificationLoading ||
            addNewSubmitDetailLoading ||
            fetchChangeHeaderLoading ||
            fetchLineLoading,
        },
      },
      {
        name: 'outUuid',
        btnComp: UploadModal,
        childFor: 'btnText',
        child: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled: !fetchHeaderFlag,
          },
          showFilesNumber: true,
          attachmentUUID: attachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
          viewOnly: attachmentCanModify,
          afterOpenUploadModal: this.afterOpenHeaderUploadModal,
        },
      },
      {
        name: 'innerUuid',
        btnComp: UploadModal,
        childFor: 'btnText',
        child: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled: !fetchHeaderFlag,
          },
          showFilesNumber: true,
          attachmentUUID: purchaserInnerAttachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
          viewOnly: purchaserInnerAttachmentCanModify,
          afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
        },
      },
      {
        name: 'operation',
        btnComp: Button,
        btnType: 'h0',
        child: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          onClick: () => this.changeOperationRecord(true),
        },
      },
    ];
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.ordercancel.view.message.titleChange`).d('订单变更')}
          backPath="/sodr/order-cancel/list"
        >
          {customizeBtnGroup(
            { code: 'SODR.ORDER_CANCEL_CHANGE.BUTTONS', pro: true },
            <DynamicButtons
              buttons={remote.process('processHeaderBtnsRender', headerBtnsRender, {
                form,
                headerInfo,
                dataSource,
              })}
            />
          )}
        </Header>
        <Content>
          <Spin spinning={fetchChangeHeaderLoading} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
            <Collapse
              defaultActiveKey={collapseKeys}
              className="form-collapse"
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`sodr.common.view.message.orderHeaderInfo`).d('订单头信息')}</h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfo"
              >
                <OrderHeaderInfo {...orderHeaderInfoProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`sodr.common.view.message.orderLineInfo`).d('订单行信息')}</h3>
                    <a>
                      {collapseKeys.includes('orderLineInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderLineInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderLineInfo"
              >
                <OrderLineInfo {...orderLineInfoProps} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        <WrapperBOMModal {...wrapperBOMModalProps} />
      </Fragment>
    );
  }
}
