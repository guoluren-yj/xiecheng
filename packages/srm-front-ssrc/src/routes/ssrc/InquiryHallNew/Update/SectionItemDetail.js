import React, { PureComponent } from 'react';
import {
  Table,
  Button,
  Modal,
  ModalProvider,
  DataSet,
  Lov,
  Tooltip,
  CheckBox,
  Select,
} from 'choerodon-ui/pro';
// import { math } from 'choerodon-ui/dataset';
import { Badge } from 'choerodon-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, filter, isNil, noop, omit, isFunction } from 'lodash';
import { routerRedux } from 'dva/router';
import { Modal as ModalHzero } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { observer } from 'mobx-react';
// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import {
  getEditTableData,
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import CommonImportNew from 'hzero-front/lib/components/Import';
import request from 'utils/request';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import { SRM_SSRC } from '_utils/config';
import { calculateBasicQty, TooltipTitle } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Purchaser';
import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
import { handleFormDSFieldsValue } from '@/routes/components/Widget/Forms/handleFormDSFieldsValue';
import LadderLevelModalBid from './LadderLevelModalBid';
import LadderLevelModal from './LadderLevelModal';

import BatchMaintainItemForm from './BatchMaintainItemForm';
import ItemLineTableDS from './SectionItemDetailDS';
import BatchMaintainItemDS from './BatchMaintainItemDS';
import { QuotationRange } from './Components';

import {
  batchUpdateLines,
  isClearMaterial,
  updateOuIdFiled,
  updateInvOrganizationFiled,
  getBatchMainItemData,
  updateExpandInvOrganizationFiled,
} from './utils/utils';

import style from './index.less';

@connect(({ inquiryHall, bidHall, user }) => ({
  user,
  inquiryHall,
  bidHall,
}))
@observer
export default class SectionItemDetail extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      ladderLevelSelectedRowKeys: [], // 阶梯报价选中id
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      quotationDetailVisible: false, // 报价明细
      itemLineRecord: {}, // 物品行记录
      toggleModalLoading: false, // open modal loading
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
      itemChooseContent: {},
    };

    this.BatchMaintainItemDS = new DataSet(
      props.remote
        ? props.remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SECTION_BATCH_EDIT',
            BatchMaintainItemDS(),
            {
              bidFlag: props.rfx?.bidFlag,
            }
          )
        : BatchMaintainItemDS()
    );
    this.itemLineTableDS = new DataSet(
      props.remote
        ? props.remote.process(
            'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SECTION_ITEM_LINE',
            ItemLineTableDS({
              fetchInquiryHeader: props.fetchInquiryHeader,
              updateHeaderInfo: props.updateHeaderInfo,
              doubleUnitFlag: props.doubleUnitFlag,
              bidFlag: props.rfx?.bidFlag,
              rfxInfoDS: props.rfxInfoDS, // 头信息ds
              getBatchUpdateFlag: props.getBatchUpdateFlag, // 获取批量编辑中数据、状态、头数据等
            }),
            {
              bidFlag: props.rfx?.bidFlag,
            }
          )
        : ItemLineTableDS({
            fetchInquiryHeader: props.fetchInquiryHeader,
            updateHeaderInfo: props.updateHeaderInfo,
            doubleUnitFlag: props.doubleUnitFlag,
            bidFlag: props.rfx?.bidFlag,
            rfxInfoDS: props.rfxInfoDS, // 头信息ds
            getBatchUpdateFlag: props.getBatchUpdateFlag, // 获取批量编辑中数据、状态、头数据等
          })
    );
  }

  componentDidMount() {
    const {
      rfxId,
      record,
      rfx = {},
      header = {},
      rfxInfoDS = {},
      isNewBiddingFlag = noop,
    } = this.props;
    const { sourceKey } = rfx;
    const { organizationId = null, userId = null } = this.state;
    const common = {
      rfxHeaderId: rfxId,
      organizationId,
      tenantId: organizationId,
      projectLineSectionId: record.projectLineSectionId,
      userId,
    };
    const { allowChangeItemsFlag, sourceFrom } = header || {};

    this.itemLineTableDS.setQueryParameter('headers', {
      ...(header || {}),
      companyId: rfxInfoDS?.current?.get('companyId'),
      allowChangeItemsFlag: !allowChangeItemsFlag && sourceFrom === 'PROJECT',
    });
    this.BatchMaintainItemDS.setQueryParameter('headers', {
      ...(header || {}),
      companyId: rfxInfoDS?.current?.get('companyId'),
      allowChangeItemsFlag: !allowChangeItemsFlag && sourceFrom === 'PROJECT',
    });
    this.itemLineTableDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION_LINE_ITEM`,
    });
    this.itemLineTableDS.setState('newBiddingFlag', isNewBiddingFlag());
    this.itemLineTableDS.query();
  }

  componentWillUnmount() {
    const { clearProperties, rfx = {}, resetBatchMainItems = noop } = this.props;
    const { sourceKey } = rfx;
    clearProperties(function deleteCache() {
      this.cache[`SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION_LINE_ITEM`] = {};
    }, []);
    resetBatchMainItems();
  }

  @Bind()
  getAllowChangeItemsFlag() {
    const { rfxInfoDS } = this.props;
    const { current } = rfxInfoDS || {};
    if (current) {
      return (
        current?.get?.('allowChangeItemsFlag') === 0 && current?.get?.('sourceFrom') === 'PROJECT'
      );
    }
    return true;
  }

  // open modal loading toggle
  toggleModalLoading(loading = false) {
    this.setState({
      toggleModalLoading: loading,
    });
  }

  /**
   * 阶梯报价-新增行
   */
  @Throttle(500)
  @Bind()
  createLadderLine(rfxLineItemId = undefined) {
    const {
      dispatch,
      organizationId,
      inquiryHall: { ladderLevelData = [] },
    } = this.props;

    const newLine = {
      rfxLineItemId,
      ladderInquiryId: uuidv4(),
      rfxLadderLineNum: undefined,
      ladderFrom: undefined,
      ladderTo: undefined,
      tenantId: organizationId,
      remark: undefined,
      _status: 'create',
    };

    if (!isEmpty(ladderLevelData)) {
      const lastLine = ladderLevelData[ladderLevelData.length - 1] || {};
      newLine.ladderFrom = lastLine.$form ? lastLine.$form?.getFieldValue('ladderTo') : null;
      newLine.secondaryLadderFrom = lastLine.$form
        ? lastLine.$form.getFieldValue('secondaryLadderTo')
        : null;
    }

    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        ladderLevelData: [...ladderLevelData, newLine],
      },
    });
  }

  /**
   * 阶梯报价-保存
   */
  @Throttle(800)
  @Bind()
  saveLadderLevel(rfxLineItemId = undefined, afterSubmitCloseModalFlag = false) {
    const {
      dispatch,
      organizationId,
      rfx = {},
      inquiryHall: { ladderLevelData = [] },
    } = this.props;
    const { sourceKey } = rfx;
    const newParams = getEditTableData(ladderLevelData, ['ladderInquiryId']);

    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item, index) => {
        return {
          ...item,
          rfxLadderLineNum: index + 1,
        };
      });
      this.toggleModalLoading(true);
      dispatch({
        type: 'inquiryHall/saveLadderLevel',
        payload: {
          newParameters,
          organizationId,
          rfxLineItemId,
          customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEMLINE_LADDER_LEVEL`,
        },
      }).then((res) => {
        this.toggleModalLoading();
        if (res) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              LadderLevelChange: false,
            },
          });
          this.fetchLadderLevelyList({ rfxLineItemId });
          notification.success();
          this.handleLadderLevelRowSelectChange();

          if (afterSubmitCloseModalFlag) {
            this.hideLadderLevelModal();
          }
        }
      });
    }
  }

  // 查询阶梯报价列表
  fetchLadderLevelyList = (params = {}) => {
    const { dispatch, organizationId, rfx = {} } = this.props;
    const { rfxLineItemId } = params || {};
    const { sourceKey } = rfx;
    if (!rfxLineItemId) {
      return;
    }

    dispatch({
      type: 'inquiryHall/fetchLadderLevelyTable',
      payload: {
        rfxLineItemId,
        organizationId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEMLINE_LADDER_LEVEL`,
      },
    });
  };

  /**
   * 阶梯报价 - 批量删除
   */
  @Throttle(600)
  @Bind()
  deleteLadderLevel(rfxLineItemId) {
    const {
      dispatch,
      inquiryHall: { ladderLevelData = [] },
      organizationId,
    } = this.props;
    const { ladderLevelSelectedRowKeys = [] } = this.state;

    if (isEmpty(ladderLevelSelectedRowKeys)) {
      return;
    }

    const newParameters = []; // 过滤出勾选数据(非新建行)
    const newLadderLevel = []; // 过滤出数据(非新建行item._status !== 'create')
    const allUnselectLine = []; // all un selected line

    ladderLevelData.forEach((item) => {
      const { ladderInquiryId, _status } = item || {};
      if (_status !== 'create') {
        newLadderLevel.push(item);

        if (ladderLevelSelectedRowKeys.includes(ladderInquiryId)) {
          newParameters.push(item);
        }
      }

      if (!ladderLevelSelectedRowKeys.includes(ladderInquiryId)) {
        allUnselectLine.push(item);
      }
    });
    // 正常的最后几条
    const endLadderList = newLadderLevel.slice(newLadderLevel.length - newParameters.length);
    // 二者相同项
    const commonLadderList = filter(endLadderList, (item) => {
      return newParameters.find((param) => param.ladderInquiryId === item.ladderInquiryId);
    });

    const inValidLastLinesSelected =
      newParameters.length &&
      newParameters.length < newLadderLevel.length &&
      commonLadderList.length < newParameters.length;
    if (inValidLastLinesSelected) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
    } else {
      ModalHzero.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
        onOk: () => {
          if (isEmpty(newParameters)) {
            dispatch({
              type: 'inquiryHall/updateState',
              payload: {
                ladderLevelData: allUnselectLine,
              },
            });
            this.handleLadderLevelRowSelectChange();
          } else {
            dispatch({
              type: 'inquiryHall/deleteLadderLevelLines',
              payload: { remoteDelete: newParameters, organizationId, rfxLineItemId },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'inquiryHall/updateState',
                  payload: {
                    ladderLevelData: newLadderLevel,
                  },
                });
                this.handleLadderLevelRowSelectChange();
                this.fetchLadderLevelyList({ rfxLineItemId });
              }
            });
          }
        },
      });
    }
  }

  /**
   * 物品明细-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleLadderLevelRowSelectChange(selectedRowKeys = []) {
    this.setState({
      ladderLevelSelectedRowKeys: selectedRowKeys,
    });
  }

  /**
   * 阶梯报价-表格内容改变
   */
  @Bind()
  changeLadderLevelTableData() {
    const {
      dispatch,
      inquiryHall: { LadderLevelChange = false },
    } = this.props;
    if (!LadderLevelChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          LadderLevelChange: true,
        },
      });
    }
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const {
      itemCode,
      itemName,
      rfxLineItemId,
      supplierCompanyName,
      itemId,
      uomId,
      secondaryUomId,
    } = record.get([
      'itemCode',
      'itemName',
      'rfxLineItemId',
      'supplierCompanyName',
      'itemId',
      'uomId',
      'secondaryUomId',
    ]);

    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        itemId,
        uomId,
        rfxLineItemId,
        secondaryUomId,
        supplierCompanyName,
      },
      itemChooseContent: record,
    });
    const { dispatch, organizationId, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    dispatch({
      type: 'inquiryHall/fetchLadderLevelyTable',
      payload: {
        rfxLineItemId,
        organizationId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEMLINE_LADDER_LEVEL`,
      },
    });
  }

  /**
   * hideOperationRecord - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        ladderLevelData: [],
      },
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchExport() {
    const { rfxId, organizationId, record, rfxInfoDS = {} } = this.props;
    if (!rfxId || rfxId === 'null') {
      return;
    }

    const { templateId } = rfxInfoDS?.current ? rfxInfoDS.current?.get(['templateId']) : {};

    const Props = {
      code: 'SSRC.RFX_QUOTATION.ITEM',
      organizationId,
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: rfxId,
        templateCode: 'SSRC.RFX_QUOTATION.ITEM',
        templateId,
        projectLineSectionId: record.projectLineSectionId,
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_QUOTATION.ITEM',
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.tab.itemDetails`).d('物品明细'),
      children: <CommonImport {...Props} />,
      style: { width: '80%' },
      onOk: this.batchImportOk,
    });
  }

  @Bind()
  batchImportOk() {
    this.itemLineTableDS.query();
    this.forceUpdate();
  }

  // 批量维护物品行
  @Bind()
  handleBatchMaintain() {
    const {
      custLoading,
      customizeForm = () => {},
      rfx = {},
      header = {},
      rfxInfoDS,
      organizationId,
    } = this.props;
    const { sourceFrom } = header || {};

    this.BatchMaintainItemDS.setQueryParameter('headers', {
      ...header,
      organizationId,
      companyId: rfxInfoDS?.current?.get?.('companyId'),
      allowChangeItemsFlag: !this.getAllowChangeItemsFlag() && sourceFrom === 'PROJECT',
    });
    this.BatchMaintainItemDS.create({});

    const Props = {
      custLoading,
      customizeForm,
      BatchMaintainItemDS: this.BatchMaintainItemDS,
      tableDs: this.itemLineTableDS,
      rfx,
    };

    const modalKey = 'KEY_SECTION_ITEM_DETAIL_BATCH_UPDATE';
    Modal.open({
      destroyOnClose: true,
      drawer: true,
      closable: true,
      key: modalKey,
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护'),
      children: <BatchMaintainItemForm {...Props} />,
      style: { width: '380px' },
      onOk: this.batchMaintain,
      onCancel: this.cancelBatchMaintain,
    });
  }

  // 批量维护cancel
  @Bind()
  cancelBatchMaintain() {
    this.BatchMaintainItemDS.loadData();
  }

  // 批量操作ok
  @Bind()
  batchMaintain() {
    const { itemLineTableDS } = this;
    const { setBatchMainItems = noop } = this.props;
    // const NewData = this.BatchMaintainItemDS.current.toData() || {};
    let SelectedItems = itemLineTableDS.selected;
    let allEditFlag = 0;
    if (isEmpty(SelectedItems)) {
      SelectedItems = itemLineTableDS;
      allEditFlag = 1;
    }

    const currentData = handleFormDSFieldsValue({
      ds: this.BatchMaintainItemDS,
    });
    getBatchMainItemData({ batchMaintainItemDS: this.BatchMaintainItemDS }); // 处理批量编辑数据
    const data = omit(this.BatchMaintainItemDS?.current?.toData(), '__dirty');
    setBatchMainItems({
      // 存储值
      batchEditRfxLineItemData: data,
      batchEditRfxLineItemDTO: currentData,
      batchMaintainItemDS: this.BatchMaintainItemDS,
      allEditFlag,
    });
    batchUpdateLines({
      // 更新值
      batchEditRfxLineItemDTO: currentData,
      itemLineDS: itemLineTableDS,
      batchMaintainItemDS: this.BatchMaintainItemDS,
      allEditFlag,
    });

    this.BatchMaintainItemDS.loadData();
    itemLineTableDS.unSelectAll();
    itemLineTableDS.clearCachedSelected();
    this.forceUpdate();
  }

  // 采购申请行跳转
  @Bind()
  linktoPrNumDetail(record = {}) {
    const { dispatch, configSheet = {} } = this.props;
    const { sprmOldUiConfig = false } = configSheet;
    const prHeaderId = record.get('prHeaderId') || null;
    const prSourcePlatform = record.get('prSourcePlatform') || null;
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

    dispatch(
      routerRedux.push({
        pathname: pathUrl,
      })
    );
  }

  /**
   * 复制物品明细
   * */
  @Bind()
  copyItemLine() {
    const { organizationId } = this.props;
    const selects = this.itemLineTableDS.selected;
    if (isEmpty(selects)) {
      notification.warning({
        message: intl.get('ssrc.common.pleaseSelectItemLinesToCopy').d('请勾选要复制的行!'),
      });
      return;
    }

    const itemLines = selects.map((select) => select.toJSONData());
    itemLines.forEach((itemLine) => {
      const newItemLine = {
        ...itemLine,
        rfxLineItemId: null,
        rfxLineItemNum: null,
        prNum: null,
        prLineNum: null,
        prHeaderId: null,
        prLineId: null,
        prData: null,
        prDisplayLineNum: null,
        creationDate: null,
        organizationId,
        tenantId: organizationId,
        lastUpdateDate: null,
        sampleRequestedFlag: 0,
        projectLineSectionId: null,
        projectLineItemId: null,
        itemProjectNum: null,
        copyRfxLineItemId: null,
        rfLineItemId: null,
        rfHeaderId: null,
        _status: 'create',
        status: 'add',
      };
      this.itemLineTableDS.create(newItemLine, 0);
    });
    this.itemLineTableDS.unSelectAll();
    this.itemLineTableDS.clearCachedSelected();
  }

  // 物料行新建
  @Bind()
  createItemLine() {
    const { organizationId, rfxId, rfxInfoDS, isNewTemplateConfigFlag = false } = this.props;
    const header = rfxInfoDS.current.toData() || {};

    // 税率值集视图配置的显示字段
    const taxTextField = this.itemLineTableDS.getField('taxIdLov')?.get('textField');
    const {
      templateFreightIncludedFlag = 0,
      templateTaxIncludedFlag = 0,
      templateTaxId = null,
      templateTaxRate = null,
      ouId,
      ouName,
      invOrganizationId,
      invOrganizationName,
      taxIdMeaning,
    } = header;

    const itemLine = Object.assign(
      {
        rfxHeaderId: rfxId,
        rfxLineItemNum: undefined,
        tenantId: organizationId,
        ouId: !rfxId ? ouId : undefined, // 业务实体 新建时会给默认值
        ouName: !rfxId ? ouName : undefined,
        itemCategoryId: undefined, // 物品分类
        rfxQuantity: undefined, // 基本数量
        secondaryQuantity: undefined, // 需求数量
        uomId: undefined, // 基本单位
        secondaryUomId: undefined, // 单位
        itemName: undefined, // 物品描述
        sampleRequestedFlag: 0,
        roundFlag: 0,
        quotationDetailFlag: 0,
        itemLineQuotationDetail: [],
        currentRoundNumber: 1,
        finishedFlag: 0,
        ladderInquiryFlag: 0,
        // 后台暂时必传，因为没有改，先调通
        invOrganizationId: !rfxId ? invOrganizationId : undefined,
        invOrganizationName: !rfxId ? invOrganizationName : undefined,
        demandDate: null,
        validExpiryDateFrom: null,
        validExpiryDateTo: null,
        // 非必传
        itemId: undefined,
        itemRemark: undefined,
        deliveryAddress: undefined,
        quotationRange: undefined,
        minLimitPrice: undefined,
        maxLimitPrice: undefined,
        costPrice: undefined,
        quotationStartDate: undefined,
        quotationEndDate: undefined,
        // floatType: 'money',
        attachmentUuid: uuidv4(),
        estimatedPrice: 0,
        netEstimatedPrice: 0,
        _status: 'create',
      },
      // 新模板 (不从模板上取值 个性化配置默认值生效) 老模板逻辑保持不变
      isNewTemplateConfigFlag
        ? {}
        : {
            freightIncludedFlag: templateFreightIncludedFlag || 0,
            taxIncludedFlag: templateTaxIncludedFlag,
            taxId: templateTaxId,
            taxRate: templateTaxRate,
            ...(taxTextField && !['taxRate', 'taxId'].includes(taxTextField)
              ? {
                  [taxTextField]: taxIdMeaning,
                }
              : {}),
          }
    );

    const record = this.itemLineTableDS.create(itemLine, 0);
    record.setState('editing', true);
  }

  // 删除物料
  @Bind()
  deleteItemLine() {
    const { rfxId = null } = this.props;
    const selectedData = this.itemLineTableDS.selected;
    if (!rfxId || rfxId === 'null') {
      selectedData.forEach((itemLine) => {
        // eslint-disable-next-line no-param-reassign
        itemLine.status = 'add';
      });
    }
    const addData = selectedData.filter((newItem) => !newItem.get('rfxLineItemId'));
    const oldData = selectedData.filter((newItem) => newItem.get('rfxLineItemId'));
    if (addData.length) {
      this.itemLineTableDS.remove(addData, 1);
    }
    if (oldData.length) {
      this.itemLineTableDS.delete(selectedData, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  }

  // 保存物料
  @Bind()
  async saveItemLine() {
    const { rfxInfoDS, resetBatchMainItems = noop, handleSetHeaderData = noop } = this.props;
    try {
      this.itemLineTableDS.forEach((itemLine) => {
        // eslint-disable-next-line no-param-reassign
        itemLine.status = 'update';
      });
      const validateFlag = await this.itemLineTableDS.validate();
      if (!validateFlag) {
        this.itemLineTableDS.forEach((itemLine) => {
          if (!itemLine.get('rfxLineItemId')) {
            // eslint-disable-next-line no-param-reassign
            itemLine.status = 'add ';
          }
        });
        return false;
      }
      const itemData = this.itemLineTableDS.toData();
      if (!isEmpty(itemData)) {
        let result = await this.itemLineTableDS.submit();
        result = getResponse(result);
        if (!result || !result.success) {
          this.itemLineTableDS.query();
          return false;
        }
      } else {
        this.itemLineTableDS.query();
      }
      resetBatchMainItems();

      const header = await this.props.fetchInquiryHeader();
      if (isEmpty(header)) {
        return;
      }
      this.itemLineTableDS.query();
      this.props.updateHeaderInfo(header.projectLineSections);
      const { objectVersionNumber = null, budgetAmount = null } = header;
      rfxInfoDS.current.set('objectVersionNumber', objectVersionNumber);
      rfxInfoDS.current.set('budgetAmount', budgetAmount);
      if (isFunction(handleSetHeaderData)) {
        handleSetHeaderData({ header, rfxInfoDS });
      }
    } catch (e) {
      throw e;
    }
  }

  // 保存物料
  @Bind()
  async onForceSubmit() {
    const { rfxInfoDS } = this.props;
    try {
      this.itemLineTableDS.forEach((itemLine) => {
        // eslint-disable-next-line no-param-reassign
        itemLine.status = 'update';
      });
      let result = await this.itemLineTableDS.submit();
      result = getResponse(result);
      if (!result || !result.success) {
        this.itemLineTableDS.query();
        return false;
      }

      const header = await this.props.fetchInquiryHeader();
      if (isEmpty(header)) {
        return;
      }
      this.itemLineTableDS.query();
      this.props.updateHeaderInfo(header.projectLineSections);
      const { objectVersionNumber = null, budgetAmount = null } = header;
      rfxInfoDS.current.set('objectVersionNumber', objectVersionNumber);
      rfxInfoDS.current.set('budgetAmount', budgetAmount);
    } catch (e) {
      throw e;
    }
  }

  // 计算标段行预估金额
  @Bind()
  async changeSectionAmount(value, record, res) {
    const { doubleUnitFlag = false } = this.props;
    const { itemId, secondaryQuantity, secondaryUomId, rfxLineItemId, uomId } = record.get([
      'itemId',
      'secondaryQuantity',
      'secondaryUomId',
      'rfxLineItemId',
      'uomId',
    ]);
    // if (res === 'estimatedPrice') {
    //   record.set(
    //     'estimatedAmount',
    //     math.multipliedBy(record.get('secondaryQuantity'), value) || null
    //   );
    // } else
    if (res === 'secondaryQuantity') {
      // record.set('estimatedAmount', math.multipliedBy(record.get('estimatedPrice'), value) || null);
      // record.set(
      //   'netEstimatedAmount',
      //   math.multipliedBy(record.get('netEstimatedPrice'), value) || null
      // );
      // 在这个地方单独计算数量是因为精度组件会触发两次ds的update
      if (itemId && doubleUnitFlag) {
        if (secondaryUomId) {
          const result = await calculateBasicQty({
            secondaryQuantity,
            itemId,
            businessKey: rfxLineItemId || record.id,
            doublePrimaryUomId: uomId,
            secondaryUomId,
          });
          record.set('rfxQuantity', result ?? '');
        }
      } else {
        record.set('rfxQuantity', value);
      }
    }
    // else if (res === 'netEstimatedPrice') {
    //   record.set(
    //     'netEstimatedAmount',
    //     math.multipliedBy(record.get('secondaryQuantity'), value) || null
    //   );
    // }
    // const { header, onUpdateSectionInfo } = this.props;
    // const data = this.itemLineTableDS.toData();
    // let totalNetEstimatedAmount = 0;
    // let totalEstimatedAmount = 0;
    // data.forEach((item) => {
    //   const { estimatedAmount = 0, netEstimatedAmount = 0 } = item;
    //   totalEstimatedAmount = math.plus(totalEstimatedAmount, estimatedAmount);
    //   totalNetEstimatedAmount = math.plus(totalNetEstimatedAmount, netEstimatedAmount);
    // });
    // if (header.priceTypeCode === 'TAX_INCLUDED_PRICE') {
    //   onUpdateSectionInfo(totalEstimatedAmount);
    // } else {
    //   onUpdateSectionInfo(totalNetEstimatedAmount);
    // }
  }

  // 价格批量变更
  batchPriceChange = (e = null, record) => {
    const currentValue = e?.target?.value;
    const currentBatchPrice =
      currentValue === 0 || Number(currentValue) === '0' ? null : currentValue;
    record.set('batchPrice', currentBatchPrice);
  };

  // 切换业务实体lov
  changeOuIdLov = (value = {}, record) => {
    const { rfxInfoDS, remote } = this.props;
    const currentValue = value;
    isClearMaterial({ isInvOrgId: false, record, rfxInfoDS, value: currentValue });
    updateOuIdFiled({ currentValue, record });
    if (remote?.event) {
      remote.event.fireEvent('remoteHandleSectionOuIdChangeEvent', {
        record,
        currentValue,
        bidFlag: this.props.rfx?.bidFlag,
      });
    }
  };

  // 切换库存组织lov
  changeInvOrganizationIdLov = (value = {}, record) => {
    const { rfxInfoDS } = this.props;
    const currentValue = value ?? {};
    isClearMaterial({ isInvOrgId: true, record, rfxInfoDS, value: currentValue });
    updateInvOrganizationFiled({ currentValue: currentValue || {}, record });
  };

  // 切换物料编码lov
  changeItemIdLov = (value = {}, record) => {
    const { doubleUnitFlag } = this.props;
    const currentValue = value ?? {};
    record.set({
      itemId: currentValue.partnerItemId,
      itemCode: currentValue.itemCode,
      itemName: currentValue.itemName,
      biUomId: currentValue.biUomId,
      biUomName: currentValue.biUomName,
      uomConversionRate: currentValue.uomConversionRate,
      drawingNum: currentValue.drawingNum,
      drawingVersionNumber: currentValue.drawingVersionNumber,
      commonName: currentValue.commonName,
      referencePrice: currentValue.referencePrice,
      specs: currentValue.specifications,
      supplierItemNumDesc: currentValue.supplierItemNumDesc,
      itemCategoryId: currentValue.categoryId,
      itemCategoryName: currentValue.categoryName,
      model: currentValue.model,
    });
    if (isEmpty(currentValue)) {
      record.set({
        secondaryUomId: null,
        secondaryUomName: null,
        uomId: null,
        uomName: null,
        uomIdLov: null,
        secondaryUomIdLov: null,
      });
      return;
    }

    const { itemId, secondaryQuantity } = record.get(['itemId', 'secondaryQuantity']) || {};
    if (!isEmpty(currentValue)) {
      if (doubleUnitFlag && itemId) {
        // 物料lov和单位lov任意一个变动都重新计算基本数量
        record.set({
          secondaryUomId: currentValue.secondaryUomId || currentValue.uomId,
          secondaryUomName: currentValue.secondaryUomName || currentValue.uomName,
          uomId: currentValue.uomId,
          uomName: currentValue.uomName,
        });
        this.calculateQtyAfterItemOrSecUomChange({ record });
      } else {
        // 开启双单位没有物料 直接将数量给到基本数量
        if (doubleUnitFlag && !itemId) {
          record.set('rfxQuantity', secondaryQuantity);
        }
        // 没有物料直接选择单位lov赋值给基本单位
        // 有物料但是未开启双单位，基本单位跟着单位走
        record.set({
          secondaryUomId: currentValue.orderUomId || currentValue.primaryUomId,
          secondaryUomName: currentValue.orderUomName || currentValue.uomName,
          uomId: currentValue.orderUomId || currentValue.primaryUomId,
          uomName: currentValue.orderUomName || currentValue.uomName,
        });
      }
    }
  };

  // 改变辅助单位lov
  changeSecondaryUomIdLov = (value = {}, record) => {
    const currentValue = value ?? {};
    const { doubleUnitFlag } = this.props;
    const { itemId, secondaryQuantity } = record.get(['itemId', 'secondaryQuantity']) || {};
    if (doubleUnitFlag && itemId) {
      // 物料lov和单位lov任意一个变动都重新计算基本数量
      if (currentValue) {
        record.set('secondaryUomId', currentValue.uomId || null);
        record.set('secondaryUomName', currentValue.uomCodeAndName || currentValue.uomName || null);
      }
      this.calculateQtyAfterItemOrSecUomChange({ record });
    } else {
      // 开启双单位没有物料 直接将数量给到基本数量
      if (doubleUnitFlag && !itemId) {
        record.set('rfxQuantity', secondaryQuantity);
      }
      // 没有物料直接选择单位lov赋值给基本单位
      // 有物料但是未开启双单位，基本单位跟着单位走
      record.set({
        secondaryUomId: currentValue.uomId || null,
        secondaryUomName: currentValue.uomCodeAndName || null,
        uomId: currentValue.uomId || null,
        uomName: currentValue.uomCodeAndName || null,
      });
    }
  };

  // 物料lov和单位lov任意一个变动都重新计算基本数量
  calculateQtyAfterItemOrSecUomChange = ({ record }) => {
    const { secondaryUomId, uomId, secondaryQuantity, rfxLineItemId, itemId } = record.get([
      'secondaryUomId',
      'uomId',
      'secondaryQuantity',
      'rfxLineItemId',
      'itemId',
    ]);
    if (secondaryUomId !== uomId) {
      record.set('batchPrice', 1);
    }
    if (secondaryQuantity && secondaryUomId) {
      calculateBasicQty({
        secondaryQuantity,
        itemId,
        businessKey: rfxLineItemId || record.id,
        doublePrimaryUomId: uomId,
        secondaryUomId,
      }).then((res) => {
        record.set('rfxQuantity', res ?? '');
      });
    } else if (secondaryQuantity === 0) {
      record.set('rfxQuantity', secondaryQuantity);
    }
  };

  renderLadderLevelModal = (ladderProps) => {
    return !this.props.rfx?.bidFlag ? (
      <LadderLevelModal {...ladderProps} />
    ) : (
      <LadderLevelModalBid {...ladderProps} />
    );
  };

  // 改变拓展公司
  @Bind()
  changeExpandCompany = (value = [], oldValue = [], record) => {
    // 清除对应公司下的库存组织
    const { sourceResultsData = [] } = this.props;
    if (!record) return;
    // 判断是否为删除操作
    const deleteFlag = value?.length < oldValue?.length || value === null;
    if (!deleteFlag) return;
    updateExpandInvOrganizationFiled({ value, oldValue, record, sourceResultsData });
  };

  // table columns
  getColumns() {
    const {
      header = {},
      rfxInfoDS,
      rfxId,
      doubleUnitFlag = false,
      remote,
      rfx = {},
      biddingUnitPrice = false,
      isNewBiddingFlag = noop,
    } = this.props;
    const { itemLineTableDS } = this;
    let allowChangeItemsFlag = true;
    if (rfxInfoDS.current) {
      allowChangeItemsFlag =
        rfxInfoDS.current.get('allowChangeItemsFlag') === 0 &&
        rfxInfoDS.current.get('sourceFrom') === 'PROJECT';
    }

    const {
      expandResultsFlag = 0,
      resultsExpandingDimensions = '',
      resultsExpandingHierarchy = '',
      isBritishBidTrafficLight,
      biddingTrialBiddingFlag,
      biddingMode,
      biddingTarget,
    } =
      rfxInfoDS?.current?.get([
        'expandResultsFlag', // 拓展寻源结果
        'resultsExpandingDimensions', // 拓展寻源结果维度
        'resultsExpandingHierarchy', // 拓展寻源结果层级
        'isBritishBidTrafficLight',
        'biddingTrialBiddingFlag',
        'biddingMode',
        'biddingTarget',
      ]) || {};

    // 单据来源为采购申请转立项转寻源
    const purchaseRequestFlag = itemLineTableDS?.some((item) => item && item?.get('prLineId'));

    // 显示 拓展寻源结果+寻源拓展维度为【整单】
    const expandCompanyVisible =
      [1, '1'].includes(expandResultsFlag) && resultsExpandingDimensions === 'ITEM_LINE';
    // 显示 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
    const expandInvOrganizationVisible =
      [1, '1'].includes(expandResultsFlag) &&
      resultsExpandingDimensions === 'ITEM_LINE' &&
      resultsExpandingHierarchy === 'INV_ORGANIZATION';

    const newBiddingFlag = isNewBiddingFlag();

    // 起竞价显示标识 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
    const startingBiddingPriceFlag =
      newBiddingFlag && biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'UNIT_PRICE';

    // 单价竞价-启用红绿灯
    const unitPriceTrafficLight = startingBiddingPriceFlag && isBritishBidTrafficLight;

    // 单价竞价 - 试竞价 - 启用红绿灯
    const trialUnitPriceTrafficLight = unitPriceTrafficLight && biddingTrialBiddingFlag;

    console.log(unitPriceTrafficLight, newBiddingFlag, trialUnitPriceTrafficLight);

    const columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
        align: 'left',
      },
      {
        name: 'ouIdLov',
        width: 150,
        // editor: true,
        editor: (record) => {
          return (
            <Lov
              editor
              dataSet={itemLineTableDS}
              name="ouIdLov"
              onChange={(value) => this.changeOuIdLov(value, record)}
            />
          );
        },
      },
      {
        name: 'invOrganizationIdLov',
        width: 150,
        hidden: expandInvOrganizationVisible, // 隐藏 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
        editor: (record) => {
          return (
            <Lov
              editor
              dataSet={itemLineTableDS}
              name="invOrganizationIdLov"
              onChange={(value) => this.changeInvOrganizationIdLov(value, record)}
            />
          );
        },
      },
      {
        // editor: true,
        name: 'itemIdLov',
        width: 150,
        editor: (record) => {
          return (
            <Lov
              editor
              dataSet={itemLineTableDS}
              name="itemIdLov"
              onChange={(value) => this.changeItemIdLov(value, record)}
            />
          );
        },
      },
      {
        name: 'itemName',
        editor: true,
        width: 150,
      },
      {
        name: 'specs',
        editor: true,
        width: 150,
      },
      {
        name: 'itemCategoryIdLov',
        editor: (record) => {
          const lovCode = itemLineTableDS.getField('itemCategoryIdLov')?.get('lovCode');
          let otherProps = {
            virtual: true,
            style: {
              maxHeight: '500px',
            },
          };
          if (lovCode === 'SSRC.ITEM_TREE_CATEGORY') {
            otherProps = {
              treeLoadData: ({ record: lovRecord, dataSet }) => {
                const { categoryId } = lovRecord.get(['hasChild', 'categoryId']);
                const {
                  performance: { url },
                  pageSize,
                  currentPage,
                } = dataSet;
                return new Promise((resolve) => {
                  request(url, {
                    method: 'GET',
                    query: {
                      companyId: rfxInfoDS?.current?.get('companyId'),
                      parentCategoryId: categoryId,
                      page: currentPage - 1,
                      size: pageSize,
                    },
                  })
                    .then((res) => {
                      const result = getResponse(res);
                      if (result && result?.content.length) {
                        dataSet.appendData(result.content, lovRecord);
                      }
                      resolve();
                    })
                    .catch(() => {
                      resolve();
                    });
                });
              },
            };
          } else if (lovCode === 'SMDM.TREE_ITEM_CATEGORY_TILED_NEW') {
            otherProps = {
              onRow: (row) => {
                const handleSelect = ({ dataSet, record: _record }) => {
                  if (dataSet && _record) {
                    dataSet.select(_record);
                  }
                };
                return {
                  onClick: () => handleSelect(row),
                  onDoubleClick: () => {
                    if (row?.record?.selectable) {
                      handleSelect(row);
                      record.set({
                        itemCategoryIdLov: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
            };
          }
          return (
            <Lov
              editor
              dataSet={itemLineTableDS}
              name="itemCategoryIdLov"
              tableProps={{
                selectionMode: [
                  'SMDM.TREE_ITEM_CATEGORY_TILED_NEW',
                  'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
                ].includes(lovCode)
                  ? 'rowbox'
                  : '',
                ...otherProps,
              }}
            />
          );
        },
        width: 150,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            align: 'left',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryQuantity"
                  record={record}
                  uom="secondaryUomId"
                  onChange={(value) => this.changeSectionAmount(value, record, 'secondaryQuantity')}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      doubleUnitFlag
        ? {
            // editor: true,
            name: 'secondaryUomIdLov',
            width: 150,
            ignore: 'always',
            editor: (record) => {
              return (
                <Lov
                  editor
                  dataSet={itemLineTableDS}
                  name="secondaryUomIdLov"
                  onChange={(value) => this.changeSecondaryUomIdLov(value, record)}
                />
              );
            },
          }
        : null,
      {
        name: 'rfxQuantity',
        width: 120,
        align: 'left',
        editor: (record) => {
          return <C7nPrecisionInputNumber name="rfxQuantity" record={record} uom="uomId" />;
        },
        renderer: ({ record, value }) =>
          doubleUnitFlag && record.get('itemId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        editor: true,
        name: 'uomIdLov',
        width: 150,
      },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedPrice',
            width: 150,
            header: (
              <TooltipTitle
                tipValue={intl
                  .get(`ssrc.common.model.offlineEntry.secondaryEstimatedPrice`)
                  .d('辅助单位对应的预估单价(含税)')}
                title={intl
                  .get(`ssrc.inquiryHall.model.offlineEntry.estimatedPrice`)
                  .d('预估单价(含税)')}
                doubleUnitFlag={doubleUnitFlag}
              />
            ),
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="estimatedPrice"
                  record={record}
                  headerRecord={rfxInfoDS.current}
                  dataSet={this.itemLineTableDS}
                  currency="currencyCode"
                  // onChange={(value) => this.changeSectionAmount(value, record, 'estimatedPrice')}
                />
              );
            },
            renderer: ({ dataSet, value }) =>
              numberSeparatorRender(value, dataSet.getState('precision')),
          }
        : {
            name: 'netEstimatedPrice',
            header: (
              <TooltipTitle
                tipValue={intl
                  .get(`ssrc.common.model.offlineEntry.secondaryEetEstimatedPrice`)
                  .d('辅助单位对应的预估单价(不含税)')}
                title={intl
                  .get(`ssrc.inquiryHall.model.offlineEntry.netEstimatedPrice`)
                  .d('预估单价(不含税)')}
                doubleUnitFlag={doubleUnitFlag}
              />
            ),
            width: 150,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="netEstimatedPrice"
                  record={record}
                  headerRecord={rfxInfoDS.current}
                  dataSet={this.itemLineTableDS}
                  currency="currencyCode"
                  // onChange={(value) => this.changeSectionAmount(value, record, 'netEstimatedPrice')}
                />
              );
            },
            renderer: ({ dataSet, value }) =>
              numberSeparatorRender(value, dataSet.getState('precision')),
          },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedAmount',
            width: 150,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'netEstimatedAmount',
            width: 150,
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      {
        // editor: true,
        name: 'batchPrice',
        width: 150,
        align: 'left',
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              type="c7n-pro"
              name="batchPrice"
              record={record}
              currency="currencyCode"
              onBlur={(e) => this.batchPriceChange(e, record)}
            />
          );
        },
        renderer: ({ record, value }) => {
          if (isNil(value) || value === 0 || value === '0') {
            return intl.get('ssrc.common.pleaseEnterGreatThanZeroNumber').d('请输入大于0的数值');
          }
          return numberSeparatorRender(value, record.getState('currency_precision'));
        },
      },
      {
        // editor: true,
        name: 'taxIncludedFlag',
        width: 100,
        align: 'left',
        editor: (record) => (
          <CheckBox
            onChange={(value) => {
              if (!value) {
                record.set('taxId', null);
                record.set('taxRate', null);
              }
            }}
          />
        ),
      },
      {
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="taxIdLov"
              paramMatcher={({ text }) => {
                return !isNaN(text) ? { taxRate: text } : { taxCode: text };
              }}
            />
          );
        },
        width: 150,
        name: 'taxIdLov',
        // renderer: ({ record }) => {
        //   return record.toData().taxRate === 0 ? '0' : record.toData().taxRate;
        // },
      },
      {
        editor: true,
        width: 150,
        name: 'demandDate',
      },
      !newBiddingFlag
        ? {
            editor: true,
            width: 120,
            name: 'ladderInquiryFlag',
            align: 'left',
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'ladderOffer',
            width: 100,
            renderer: ({ record, name, dataSet }) => {
              return record.get('ladderInquiryFlag') && record.get('rfxLineItemId') ? (
                <a
                  onClick={() => this.viewLadderLevelModal(record)}
                  disabled={dataSet.getField(name).get('disabled')}
                >
                  {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
                </a>
              ) : null;
            },
          }
        : null,
      !newBiddingFlag
        ? {
            editor: true,
            width: 150,
            name: 'quotationTemplateIdLov',
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'quotationDetail',
            width: 100,
            renderer: ({ record }) =>
              (record.get('itemCategoryId') ||
                record.get('itemId') ||
                record.get('quotationTemplateId')) &&
              rfxId &&
              rfxId !== 'null' &&
              record.get('rfxLineItemId') ? (
                <>
                  <QuotationDetail
                    rowData={record}
                    uiType="c7n"
                    sourceFrom="RFX"
                    onOk={this.onForceSubmit}
                    bidFlag={rfx?.bidFlag}
                    buttonText={intl.get('hzero.common.button.edit').d('编辑')}
                  />
                  {record.get('quotationDetailRequire') === 1 && (
                    <Badge style={{ marginLeft: '2px' }} status="error" />
                  )}
                </>
              ) : (
                <QuotationDetail
                  rowData={record}
                  uiType="c7n"
                  sourceFrom="RFX"
                  buttonText={intl.get('hzero.common.button.edit').d('编辑')}
                />
              ),
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'floatType',
            width: 140,
            hidden: newBiddingFlag,
            // editor: true,
            editor: (record) => (
              <Select
                name="floatType"
                onChange={(value) => {
                  record.set('floatType', value || null);
                  if (!value) {
                    record.set('quotationRange', null);
                  }
                }}
              />
            ),
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'quotationRange',
            width: 140,
            hidden: newBiddingFlag,
            editor: true,
          }
        : null,
      header.sourceFrom === 'DEMAND_POOL' || purchaseRequestFlag // 是否申请转询价
        ? {
            name: 'prNum',
            width: 150,
            renderer: ({ record, value }) => (
              <a onClick={() => this.linktoPrNumDetail(record)}> {value}</a>
            ),
          }
        : null,
      header.sourceFrom === 'DEMAND_POOL' || purchaseRequestFlag
        ? {
            name: 'prDisplayLineNum',
            width: 150,
          }
        : null,
      {
        name: 'projectTaskId',
        width: 150,
        editor: (record) => {
          const otherProps = {
            virtual: true,
            style: {
              maxHeight: '500px',
            },
          };
          return (
            <Lov
              editor
              record={record}
              name="projectTaskId"
              tableProps={{
                selectionMode: 'rowbox',
                ...otherProps,
              }}
            />
          );
        },
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: !allowChangeItemsFlag,
      },
      {
        name: 'expandCompany',
        width: 250,
        hidden: !expandCompanyVisible,
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="expandCompany"
              onChange={(value, oldValue) => this.changeExpandCompany(value, oldValue, record)}
            />
          );
        },
      },
      {
        name: 'expandInvOrganization',
        width: 250,
        hidden: !expandInvOrganizationVisible,
        editor: true,
      },
      biddingUnitPrice && isBritishBidTrafficLight !== 1
        ? {
            // 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
            // 红绿灯模式 不显示
            width: 150,
            name: 'startingBiddingPrice',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="startingBiddingPrice"
                  record={record}
                  currency="currencyCode"
                  headerRecord={rfxInfoDS?.current}
                  omitZeroFlag
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision'), {
                omitZeroFlag: true,
              }),
          }
        : null,
      biddingUnitPrice
        ? {
            name: 'biddingQuotationRange',
            width: 240,
            minWidth: 240,
            className: 'inquiry-update-itemLine-biddingQuotationRange',
            tooltip: 'none',
            renderer: ({ record }) => {
              return (
                <QuotationRange
                  name="biddingQuotationRange"
                  record={record}
                  rfxInfoDS={rfxInfoDS}
                  type="unitPrice"
                />
              );
            },
          }
        : null,
      biddingUnitPrice
        ? {
            // 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
            name: 'safePrice',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="safePrice"
                  record={record}
                  currency="currencyCode"
                  headerRecord={rfxInfoDS?.current}
                  omitZeroFlag
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('currency_precision'), {
                omitZeroFlag: true,
              }),
          }
        : null,
      unitPriceTrafficLight
        ? {
            name: 'targetPriceLowerLimit',
            width: 180,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="targetPriceLowerLimit"
                  record={record}
                  headerRecord={rfxInfoDS?.current}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
          }
        : null,
      unitPriceTrafficLight
        ? {
            name: 'targetPriceUpperLimit',
            width: 180,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="targetPriceUpperLimit"
                  record={record}
                  headerRecord={rfxInfoDS?.current}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
          }
        : null,
      trialUnitPriceTrafficLight
        ? {
            name: 'trialTargetPriceLowerLimit',
            width: 180,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="trialTargetPriceLowerLimit"
                  record={record}
                  headerRecord={rfxInfoDS?.current}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
          }
        : null,
      trialUnitPriceTrafficLight
        ? {
            name: 'trialTargetPriceUpperLimit',
            width: 180,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="trialTargetPriceUpperLimit"
                  record={record}
                  headerRecord={rfxInfoDS?.current}
                  currency="currencyCode"
                />
              );
            },
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
          }
        : null,
    ].filter(Boolean);
    return remote
      ? remote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SECTION_ITEMLINETABLE_COLUMNS',
          columns,
          {
            bidFlag: rfx?.bidFlag,
            rfxInfoDS,
            itemLineTableDS,
          }
        )
      : columns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      remote,
      match: { path },
      inquiryHall: { ladderLevelData = [] },
      customizeTable,
      custLoading,
      rfxInfoDS = {},
      rfxId = null,
      applyToInquiryNewFlag,
      organizationId,
      rfx = {},
      record,
      doubleUnitFlag,
      isNewBiddingFlag = noop,
    } = this.props;
    const {
      ladderLevelSelectedRowKeys = [], // 阶梯报价选中id
      viewLadderLevelVisible = false, // 阶梯报价模态框
      LadderLevelHeaderData = {}, // 阶梯报价头部数据
      toggleModalLoading = false,
      itemChooseContent = {},
    } = this.state;

    const { sourceKey } = rfx;
    const IsNewInquiry = !rfxId || rfxId === 'null';
    let allowChangeItemsFlag = 1;

    const newBiddingFlag = isNewBiddingFlag();

    const { templateId, importTemplateCode } = rfxInfoDS?.current
      ? rfxInfoDS.current?.get(['templateId', 'importTemplateCode'])
      : {};

    if (rfxInfoDS.current) {
      allowChangeItemsFlag =
        rfxInfoDS.current.get('allowChangeItemsFlag') === 0 &&
        rfxInfoDS.current.get('sourceFrom') === 'PROJECT';
    }

    const ladderLevelRowSelection = {
      selectedRowKeys: ladderLevelSelectedRowKeys,
      onChange: this.handleLadderLevelRowSelectChange,
    };

    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      ladderLevelData,
      saveLadderLevelLoading: toggleModalLoading,
      onSaveLadderLine: this.saveLadderLevel,
      onCreateLadderLine: this.createLadderLine,
      onDeleteLadderLines: this.deleteLadderLevel,
      LadderLevelHeaderData,
      onChangeLadderTableData: this.changeLadderLevelTableData,
      ladderLevelRowSelection,
      ladderLevelSelectedRowKeys,
      record: itemChooseContent,
      doubleUnitFlag,
      sourceKey,
    };

    const templateCode = importTemplateCode || 'SSRC.RFX_QUOTATION.ITEM';
    // 导入
    const ImportProps = {
      businessObjectTemplateCode: templateCode,
      prefixPatch: SRM_SSRC,
      refreshButton: true,
      args: {
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: rfxId,
        templateCode,
        projectLineSectionId: record.projectLineSectionId,
        templateId,
      },
      buttonProps: {
        funcType: 'flat',
        color: 'primary',
        icon: 'archive',
        disabled: IsNewInquiry || allowChangeItemsFlag || !applyToInquiryNewFlag,
        permissionList: [
          {
            code: `${path}.button.itemSectionimport`.toLowerCase(),
            type: 'button',
            meaning:
              intl.get(`ssrc.inquiryHall.view.message.title.RFXMaintenance`).d('编辑RFX') -
              `${intl
                .get(`ssrc.inquiryHall.view.message.button.itemSectionImport`)
                .d('物料导入')}(New)`,
          },
        ],
      },
      buttonText: `${intl
        .get(`ssrc.inquiryHall.view.message.button.itemImport`)
        .d('物料导入')}(New)`,
      autoRefreshInterval: 5000,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      auto: true,
      successCallBack: this.batchImportOk,
      name: 'itemImportNew',
    };

    const EmptySelectedFlag = !this.itemLineTableDS || isEmpty(this.itemLineTableDS.selected);

    const buttons = [
      <Button
        disabled={allowChangeItemsFlag || !applyToInquiryNewFlag}
        icon="playlist_add"
        onClick={this.createItemLine}
      >
        {intl.get('hzero.common.button.increase').d('新增')}
      </Button>,
      <TooltipButtonPro
        onClick={this.deleteItemLine}
        disabled={EmptySelectedFlag}
        icon="delete_sweep"
        name="delete"
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
      >
        {intl.get('hzero.common.button.batchdelete').d('批量删除')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        onClick={this.copyItemLine}
        disabled={allowChangeItemsFlag || EmptySelectedFlag || !applyToInquiryNewFlag}
        icon="content_copy"
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
      >
        {intl.get('hzero.common.button.copy').d('复制')}
      </TooltipButtonPro>,
      <Button
        icon="save"
        onClick={this.saveItemLine}
        disabled={
          this.itemLineTableDS?.length === 0 && this.itemLineTableDS?.cachedRecords?.length === 0
        }
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <Button
        disabled={
          IsNewInquiry ||
          (!this.itemLineTableDS.length && !this.itemLineTableDS?.cachedRecords?.length)
        }
        onClick={this.handleBatchMaintain}
        icon="mode_edit"
      >
        <Tooltip
          title={
            isEmpty(this.itemLineTableDS.selected)
              ? intl
                  .get('ssrc.inquiryHall.model.inquiryHall.batchAllPageDataToEdit')
                  .d('针对全部数据进行批量编辑')
              : ''
          }
        >
          {isEmpty(this.itemLineTableDS.selected)
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.batchCheckData').d('勾选批量编辑')}
        </Tooltip>
      </Button>,
      <Button
        disabled={IsNewInquiry || allowChangeItemsFlag || !applyToInquiryNewFlag}
        onClick={this.handleBatchExport}
        icon="archive"
      >
        {intl.get(`ssrc.inquiryHall.view.message.button.itemImport`).d('物料导入')}
      </Button>,
      <CommonImportNew {...ImportProps} />,
      this.itemLineTableDS?.get?.(0)?.get?.('quotationTemplateFlag') === 1 && !newBiddingFlag && (
        <QuotationDetailImport
          sourceHeaderId={rfxId}
          projectLineSectionId={record.projectLineSectionId}
          templateCode="SSRC.PROJECT_QUO_DETAIL"
          sourceFrom="RFX"
          buttonProps={{
            color: 'primary',
            funcType: 'flat',
          }}
          onOk={this.batchImportOk}
          onClose={this.batchImportOk}
        />
      ),
    ];

    const Buttons = remote
      ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SECTION_TABLE_BUTTONS', buttons, {
          rfxInfoDS,
          that: this,
          itemLineTableDS: this.itemLineTableDS,
        })
      : buttons;

    return (
      <ModalProvider>
        <div className={style['inquiry-update-itemLine-section']}>
          {customizeTable(
            { code: `SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION_LINE_ITEM` },
            <Table
              bordered
              buttons={Buttons}
              custLoading={custLoading}
              dataSet={this.itemLineTableDS}
              rowKey="rfxLineItemId"
              columns={this.getColumns()}
              style={{ maxHeight: 450 }}
            />
          )}
        </div>

        {viewLadderLevelVisible && this.renderLadderLevelModal(ladderLevelModalProps)}
      </ModalProvider>
    );
  }
}
