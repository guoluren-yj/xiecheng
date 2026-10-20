// 对供应商要求form

import React, { PureComponent } from 'react';
import {
  TextField,
  NumberField,
  Select,
  Output,
  Modal,
  DataSet,
  Icon,
  Attachment,
  Lov,
  CheckBox,
} from 'choerodon-ui/pro';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import { isEmpty, isArray, isObject, uniqWith, noop } from 'lodash';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import CollapseForm from '_components/CollapseForm';
// import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { PUBLIC_BUCKET } from '_utils/config';
import { getResponse, getCurrentTenant } from 'utils/utils';
import { INQUIRY, BID } from '@/utils/globalVariable';

import IntroducingSuppliers from '@/routes/ssrc/components/IntroducingSupplier';
import BulkAddSupplierModal from '@/routes/ssrc/InquiryHallNew/Update/BulkAddSupplierModal';
import { supplierAttachment, saveSupplierLine } from '@/services/inquiryHallService';
import {
  saveAllotItem,
  saveAllotSection,
  fetchConfigSheet,
  fetchSourceSupplierRelativeConfig,
} from '@/services/inquiryHallNewService';
import {
  fetchIndustyType,
  fetchIndustyCategory,
  querySupplierRelation,
} from '@/services/commonService';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import { PageSourceSymbol } from '@/utils/constants.js';
import { isText, getSupplierRelationUrl } from '@/utils/utils';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import {
  BulkAddSupplierDS,
  SupplierBulkExpiredModalDS,
  SupplierFilterItemDS,
  SupplierFilterSectionDS,
} from './BulkAddSupplierDS';
import SupplierListTable from './SupplierListTable';
import SupplierBatchAddExpiredModal from './SupplierBatchAddExpiredModal';
import SupplierFilterItemForm from './SupplierFilterItemForm';
import SupplierFilterSectionForm from './SupplierFilterSectionForm';
import { SupplierLovDS } from './SupplierListTableDS';

const { Option, OptGroup } = Select;

@observer
class SupplierComponent extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    this.timer = null;

    this.state = {
      supplierQualificationData: [],
      industry: [],
      industryCategory: [],
      supplierConfigOldFlag: true, // 配置表“新建供应商”老ui
      externalSupplierData: {}, // 外部供应商查询数据
      supplierLoading: false, // 供应商表格loading
      supplierConfigOldUserFlag: true, // 采购方租户是否在配置表中
    };

    this.SupplierLovDS = new DataSet(SupplierLovDS());
  }

  sourceKey = this.props.rfx.sourceKey;

  BulkAddSupplierDS = new DataSet(BulkAddSupplierDS());

  SupplierBulkExpiredModalDS = new DataSet(SupplierBulkExpiredModalDS());

  SupplierFilterItemDS = new DataSet(
    this.props?.remote
      ? this.props.remote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SUPPLIER_FILTERITEMDS',
          SupplierFilterItemDS({ sourceKey: this.sourceKey }),
          {
            that: this,
          }
        )
      : SupplierFilterItemDS({ sourceKey: this.sourceKey })
  );

  SupplierFilterSectionDS = new DataSet(SupplierFilterSectionDS({ sourceKey: this.sourceKey }));

  componentDidMount() {
    this.initPage();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  initPage = () => {
    // this.fetchIndustyType();
    this.fetchSupplierLovConfig();
    this.fetchSupplierOldUserConfig();
  };

  // 查询供应商新老弹窗-配置表
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

  initAndFetchInductryCategory = (industryData = []) => {
    if (isEmpty(industryData)) {
      return;
    }

    const ids = [];
    industryData.forEach((item = {}) => {
      let currentId = item;
      if (isObject(item)) {
        currentId = item?.industryId;
      }
      ids.push(currentId);
    });

    const stringIds = ids.join(',');
    this.fetchIndustyCategory({
      industryIdList: stringIds,
    });
  };

  // 查询行业类型
  fetchIndustyType = async (params = {}) => {
    let result = null;
    try {
      result = await fetchIndustyType({
        ...params,
        // domesticFlag: 1, // 国内/国外标识
      });
      result = getResponse(result);
      if (!result || isEmpty(result)) {
        return;
      }
      this.setState({
        industry: result,
      });
    } catch (e) {
      throw e;
    }
  };

  // 主营品类
  @Bind()
  async fetchIndustyCategory(params = {}) {
    let result = null;
    try {
      result = await fetchIndustyCategory({
        ...params,
        enabledFlag: 1,
      });
      result = getResponse(result);
      this.setState({
        industryCategory: result,
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 配置表使用新供应商lov, 在打开之前
   * 查询寻源和系统供应商数据,给SupplierLov组件查询接口传递
   *
   * //默认的 可供品类
    private String defaultQueryItemCategoryIds;
    //反选供应商   排除这些供应商
    private List<SupplierDetailDTO>  excludeSupplierDetailDTOS;
    //供货能力清单评审状态
    private String supplyReviewStatus;
    //供应商正选
    private List<SupplierDetailDTO> chooseDetailDTOS;
    erpFlag；
    srmFlag ；

    维护 控制
   */
  @Bind()
  fetchSourceSupplierRelativeConfigData = async () => {
    const { rfxId, organizationId, rfxInfoDS, remoteBox, itemLineTableDS } = this.props;
    if (!rfxId || rfxId === 'null') {
      return;
    }

    idValidation(rfxId);

    const params = {
      organizationId,
      sourceHeaderId: rfxId,
      sourceFrom: 'RFX',
    };
    let result = {};
    try {
      result = await fetchSourceSupplierRelativeConfig(params);
      result = getResponse(result);
      if (!result) {
        return;
      }

      const {
        reviewStatusList = null,
        existSuppliers = null,
        itemCategoryIds = null,
        sourceCode = null,
        stageIdList = null,
        stageAllMismatchFlag = 0,
        itemAndCategoryDTOS = null,
        queryItemIds = null,
        expandObject = null, // 扩展对象
      } = result;
      if (stageAllMismatchFlag === 1) {
        notification.warning({
          message:
            this.sourceKey === INQUIRY
              ? intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.batchAddRFQSupplierMsg`)
                  .d(
                    '操作失败，失败原因是业务规则定义"可参与询价供应商设置"导致没有供应商可参与，请检查'
                  )
              : intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.batchAddBIDSupplierMsg`)
                  .d(
                    '操作失败，失败原因是业务规则定义"可参与投标（新）供应商设置"导致没有供应商可参与，请检查'
                  ),
        });
      }
      const quotationType = rfxInfoDS?.current?.get('quotationType') || null;

      result = {
        defaultQueryItemCategoryIds: this.formatListToString(itemCategoryIds),
        supplyReviewStatus: this.formatListToString(reviewStatusList),
        itemAndCategoryDTOS,
        sourceCode,
        erpFlag: quotationType === 'ONLINE' ? 0 : null,
        excludeSupplierDetailDTOS: existSuppliers, // 维护，过程控制-反选供应商，线下正选供应商
        stageIdList,
        queryItemIds,
        ...(expandObject || {}),
        pageSource: PageSourceSymbol.inquiryHallUpdate,
      };
    } catch (e) {
      throw e;
    }

    return remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SUPPLIER_LOV_PARAMS', result, {
          rfxInfoDS,
          itemLineTableDS,
        })
      : result;
  };

  formatListToString = (list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  };

  initBulkAddSupplierDS() {
    const { rfxId, userId, organizationId, rfxInfoDS } = this.props;
    const companyId = rfxInfoDS.current.get('companyId');
    const templateId = rfxInfoDS.current.get('templateId');

    this.BulkAddSupplierDS.setQueryParameter('commonProps', {
      sourceHeaderId: rfxId,
      userId,
      templateId,
      companyId,
      organizationId,
      sourceFrom: 'RFX',
      customizeUnitCode: 'SSRC.QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER',
    });
  }

  initSupplierFilterItemDS() {
    const { rfxId, organizationId } = this.props;
    this.SupplierFilterItemDS.setQueryParameter('commonProps', {
      rfxHeaderId: rfxId,
      organizationId,
    });
  }

  initSupplierFilterSectionDS() {
    const { rfxId, organizationId, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    this.SupplierFilterSectionDS.setQueryParameter('commonProps', {
      rfxHeaderId: rfxId,
      organizationId,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION.LINE`,
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

  // 批量分配物料
  @Bind()
  handleBatchAllotItem() {
    const { supplierListTableDS, header, customizeTable, rfx = {} } = this.props;
    const selection = supplierListTableDS.selected;
    if (isEmpty(selection)) {
      notification.warning({
        message: intl.get('ssrc.common.view.pleaseSelectOneLine').d('请至少选择一行数据'),
      });
      return;
    }
    if (header.multiSectionFlag && ['RELEASE_REJECTED', 'NEW'].includes(header.rfxStatus)) {
      this.initSupplierFilterSectionDS();
      this.SupplierFilterSectionDS.query();
      const Props = {
        SupplierFilterSectionDS: this.SupplierFilterSectionDS,
        customizeTable,
        rfx,
        saved: () => this.saveBatchAllotSection(),
      };
      this.getAllotModal(Props);
    } else {
      this.initSupplierFilterItemDS();
      this.SupplierFilterItemDS.query();
      this.SupplierFilterItemDS.setAllPageSelection(true);
      const Props = {
        SupplierFilterItemDS: this.SupplierFilterItemDS,
        customizeTable,
        rfx,
        saved: () => this.saveBatchAllotItem(),
        canceled: () => {
          this.SupplierFilterItemDS.loadData([]);
          this.SupplierFilterItemDS.clearCachedRecords();
          this.SupplierFilterItemDS.clearCachedSelected();
          this.SupplierFilterItemDS.reset();
        },
      };
      this.getAllotModal(Props);
    }
  }

  // 分配物料弹窗
  getAllotModal(props = {}) {
    const { header } = this.props;
    const { saved, canceled = noop } = props;
    const isSectionFlag =
      header.multiSectionFlag && ['RELEASE_REJECTED', 'NEW'].includes(header.rfxStatus);
    Modal.open({
      closable: true,
      destroyOnClose: true,
      drawer: true,
      key: Modal.key(),
      title: isSectionFlag
        ? intl.get(`ssrc.inquiryHall.view.message.title.allotSectionLine`).d('分配标段')
        : intl.get(`ssrc.inquiryHall.view.message.title.allotItemLine`).d('分配物料'),
      children: isSectionFlag ? (
        <SupplierFilterSectionForm {...props} />
      ) : (
        <SupplierFilterItemForm {...props} />
      ),
      style: { width: '742px' },
      okText: intl.get(`hzero.common.button.confirm`).d('确认'),
      onOk: saved,
      onCancel: canceled,
      onClose: canceled,
    });
  }

  // 供应商分配物料保存
  @Bind()
  saveBatchAllotItem() {
    const { supplierListTableDS, rfxId, organizationId, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    const selection = supplierListTableDS.selected;
    const ids = selection.map((item) => (item.toData() || {}).rfxLineSupplierId).filter(Boolean);
    // const data = this.SupplierFilterItemDS.toData();
    const { afterDealData = [], selectAllPageFlag } = this.getAllocateItemData();

    this.allotItemLine({
      headerId: rfxId,
      organizationId,
      tenantId: organizationId,
      rfxItemSupAssignList: afterDealData,
      rfxLineSupplierIds: ids,
      selectAllPageFlag,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEM_SUP_ASSIGN`,
    });
  }

  // 分配物料保存调用
  @Bind()
  async allotItemLine(param = {}) {
    const { supplierListTableDS } = this.props;

    try {
      let result = await saveAllotItem(param);
      result = getResponse(result);
      if (!result) {
        return;
      }

      supplierListTableDS.unSelectAll();
      this.SupplierFilterItemDS.loadData();
      this.SupplierFilterItemDS.reset();
      supplierListTableDS.query();
      this.forceUpdate();
      Modal.destroyAll();
    } catch (e) {
      throw e;
    }
  }

  // 供应商找关系
  @Debounce(800)
  @Bind()
  async supplierRelationSearch() {
    const { supplierListTableDS = {}, organizationId } = this.props;
    const { selected = [] } = supplierListTableDS || {};

    if (selected?.length !== 2) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.message.mustSelectTwoSuppliersToRelationSearch')
          .d('只能勾选两家供应商进行找关系，请重新选择'),
      });
      return;
    }

    const supplierSelected = [];
    selected.forEach((select = {}) => {
      const recordData = select.toJSONData();
      supplierSelected.push(recordData);
    });

    const data = {
      organizationId,
      data: supplierSelected,
    };
    let res = null;

    try {
      res = await querySupplierRelation(data);

      supplierListTableDS.unSelectAll();
      supplierListTableDS.clearCachedSelected();

      if (isText(res)) {
        const url = getSupplierRelationUrl(res);
        window.open(url);
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 设置初始分配物料是否跨页全选
   */
  async setItemAllPageSelection() {
    const allotIteResult = await this.SupplierFilterItemDS.query();
    if (!isEmpty(allotIteResult) && !isEmpty(allotIteResult.content)) {
      const firstRecord = allotIteResult.content.length >= 1 && allotIteResult.content[0];
      if (firstRecord) {
        const { selectAllPageFlag } = firstRecord;
        // 设置初始勾选情况
        if (selectAllPageFlag === 0) {
          // 跨页全不选
          this.SupplierFilterItemDS.setState('selectAllManually', 0);
        } else if (selectAllPageFlag === 1) {
          // 跨页全选
          this.SupplierFilterItemDS.setAllPageSelection(true);
        }
      }
    }
  }

  /**
   * 整合分配物料提交需要的数据
   */
  getAllocateItemData() {
    let afterDealData = [];
    let selectAllPageFlag;
    if (this.SupplierFilterItemDS) {
      // selectAllPageFlag - 是否跨页全选标识 1-是 0|null|undefined-否
      selectAllPageFlag = this.SupplierFilterItemDS.getState('selectAllManually');
      // 选中的数据
      const selectedData = this.SupplierFilterItemDS.selected.map((item) => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: 1,
        };
      });
      // 操作的未选中的数据
      const unSelectedData = (
        this.SupplierFilterItemDS.getState('cacheUnSelectedRecords') || []
      ).map((item) => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: 0,
        };
      });
      // 当前页未选中数据
      const currentUnSelected = (this.SupplierFilterItemDS.unSelected || []).map((item) => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: 0,
        };
      });
      const cachedModifiedData = (this.SupplierFilterItemDS.cachedModified || []).map((item) => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: Number(item.isSelected),
        };
      });
      const currentData = [
        ...selectedData,
        ...unSelectedData,
        ...currentUnSelected,
        ...cachedModifiedData,
      ];
      afterDealData = uniqWith(
        currentData,
        (arrVal, othVal) => arrVal.rfxLineItemId === othVal.rfxLineItemId
      );
    }
    return { afterDealData, selectAllPageFlag };
  }

  // 供应商行分配物料
  @Throttle(1200)
  @Bind()
  supplierLineAllotItem(record = {}) {
    const { rfxId, organizationId, customizeTable, rfx = {}, pageSize = 20 } = this.props;
    const data = record.toData() || {};
    const { rfxLineSupplierId } = data;
    record.set('allotItem', 1);
    this.SupplierFilterItemDS.setQueryParameter('commonProps', {
      rfxHeaderId: rfxId,
      rfxLineSupplierId,
      organizationId,
    });
    this.setItemAllPageSelection();
    const Props = {
      customizeTable,
      SupplierFilterItemDS: this.SupplierFilterItemDS,
      saved: () => this.saveSingleAllotItem(rfxLineSupplierId),
      canceled: () => {
        this.SupplierFilterItemDS.loadData([]);
        this.SupplierFilterItemDS.clearCachedRecords();
        this.SupplierFilterItemDS.clearCachedSelected();
        this.SupplierFilterItemDS.reset();
      },
      rfx,
      pageSize,
    };
    this.getAllotModal(Props);
  }

  // 供应商行分配物料
  @Bind()
  saveSingleAllotItem(rfxLineSupplierId) {
    const { rfxId, organizationId, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    const ids = [];
    if (!rfxLineSupplierId || this.SupplierFilterItemDS?.length === 0) {
      return;
    }

    ids.push(rfxLineSupplierId);

    const { afterDealData = [], selectAllPageFlag } = this.getAllocateItemData();

    this.allotItemLine({
      headerId: rfxId,
      organizationId,
      tenantId: organizationId,
      // rfxItemSupAssignList: data,
      selectAllPageFlag, // 是否跨页全选标识 undefined 没有操作过 0 取消跨页全选 1 跨页全选
      rfxItemSupAssignList: afterDealData,
      rfxLineSupplierIds: ids,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEM_SUP_ASSIGN`,
    });
  }

  // 供应商分配标段保存
  @Bind()
  saveBatchAllotSection() {
    const { supplierListTableDS, rfxId, organizationId, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    const selection = supplierListTableDS.selected;
    const ids = selection.map((item) => (item.toData() || {}).rfxLineSupplierId).filter(Boolean);
    const data = this.SupplierFilterSectionDS.toData();
    this.allotSectionLine({
      headerId: rfxId,
      organizationId,
      tenantId: organizationId,
      rfxItemSupAssignList: data,
      rfxLineSupplierIds: ids,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION.LINE`,
    });
  }

  // 分配标段保存调用
  @Bind()
  async allotSectionLine(param = {}) {
    const { supplierListTableDS } = this.props;
    try {
      let result = await saveAllotSection(param);
      result = getResponse(result);
      if (!result) {
        return;
      }
      supplierListTableDS.unSelectAll();
      this.SupplierFilterSectionDS.loadData();
      this.SupplierFilterSectionDS.reset();
      supplierListTableDS.query();
      this.forceUpdate();
      Modal.destroyAll();
    } catch (e) {
      throw e;
    }
  }

  // 供应商行分配标段
  @Bind()
  supplierLineAllotSection(record = {}) {
    const { rfxId, organizationId, customizeTable, rfx = {} } = this.props;
    const data = record.toData() || {};
    const { rfxLineSupplierId } = data;
    record.set('allotItem', 1);
    this.SupplierFilterSectionDS.setQueryParameter('commonProps', {
      rfxHeaderId: rfxId,
      rfxLineSupplierId,
      organizationId,
    });
    this.SupplierFilterSectionDS.query();
    const Props = {
      SupplierFilterSectionDS: this.SupplierFilterSectionDS,
      customizeTable,
      saved: () => this.saveSingleAllotSection(rfxLineSupplierId),
      rfx,
    };
    this.getAllotModal(Props);
  }

  // 供应商行保存标段
  @Bind()
  saveSingleAllotSection(rfxLineSupplierId) {
    const { rfxId, organizationId, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    const ids = [];
    if (!rfxLineSupplierId) {
      return;
    }
    ids.push(rfxLineSupplierId);
    const data = this.SupplierFilterSectionDS.toData();

    this.allotSectionLine({
      headerId: rfxId,
      organizationId,
      tenantId: organizationId,
      rfxItemSupAssignList: data,
      rfxLineSupplierIds: ids,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION.LINE`,
    });
  }

  // 批量添加供应商modal
  @Bind()
  onBulkAddSupplier() {
    const { customizeTable } = this.props;
    this.initBulkAddSupplierDS();
    this.BulkAddSupplierDS.query();

    const Props = {
      bulkAddSupplierDS: this.BulkAddSupplierDS,
      customizeTable,
    };

    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.title.bulkAddSupplier`).d('批量添加供应商'),
      children: <BulkAddSupplierModal {...Props} />,
      style: { width: '800px' },
      bodyStyle: {
        maxHeight: 'calc(100vh - 2.5rem)',
      },
      onOk: () => this.handleBulkAddSupplier(),
      onCancel: () => this.cancelBulkAddSupplier(),
    });
  }

  // new ui supplier lov add supplier
  newBulkAddSupplier = async (supplierLovParams = {}) => {
    const {
      rfxId,
      organizationId,
      rfxInfoDS,
      supplierListTableDS,
      togglePageLoading = () => {},
      fetchQualificationWarnInfo,
      remoteBox,
    } = this.props;
    const data = this.SupplierLovDS?.toData();
    const { supplierLovList = [] } = data?.[0] || {};

    let supplierLinesValidateResult = isEmpty(supplierLovList);
    supplierLinesValidateResult = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_NEWSUPPLIERLOV_VALIDATESUPPLIERLINESRESULT',
          supplierLinesValidateResult,
          {
            pageSource: PageSourceSymbol.inquiryHallUpdate,
            that: this,
            supplierLovParams,
          }
        )
      : supplierLinesValidateResult;

    if (supplierLinesValidateResult) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const selectLines = supplierLovList;
    const companyId = rfxInfoDS && rfxInfoDS.current?.get('companyId');
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
        supplierCompanyNum,
        internationalTelCode = null,
        supplierCategoryName,
      } = item || {};
      return {
        ...item,
        contactName: name,
        rfxHeaderId: rfxId,
        tenantId: organizationId,
        contactMail: mail || contactMail,
        sourceFrom: 'RFX',
        contactMobilephone: mobilephone || contactPhone,
        mobilephone: mobilephone || contactPhone,
        supplierCompanyName: supplierCompanyName || supplierName,
        supplierCompanyNum: supplierCompanyNum || supplierNum,
        internationalTelCode,
        supplierCategoryDescription: supplierCategoryName,
      };
    });

    let cuxProcess = true;
    cuxProcess = remoteBox
      ? await remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_NEWBULKADDSUPPLIER_CUX_VALIDATE',
          cuxProcess,
          { newParams, rfxInfoDS, that: this, selectLines }
        )
      : cuxProcess;
    if (cuxProcess === false) {
      return false;
    }

    let paramsData = {
      newParams,
      organizationId,
      companyId,
      rfxHeaderId: rfxId,
      ...supplierLovParams,
    };

    paramsData = remoteBox
      ? await remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_NEWBULKADDSUPPLIER_PARAMS_DATA',
          paramsData,
          { newParams, rfxInfoDS, that: this, selectLines }
        )
      : paramsData;

    this.setState({ supplierLoading: true });
    togglePageLoading(true);
    supplierAttachment(paramsData)
      .then((res = []) => {
        this.SupplierLovDS.loadData();
        if (res && res.failed) {
          notification.warning({
            message: res.message,
          });
          return;
        }

        const supplierAttachments = res.filter((item) => item.expirAttachmentsDtosLen);
        if (!isEmpty(supplierAttachments)) {
          const flatData = this.renderDataSource(res);
          this.setState({
            supplierQualificationData: res,
          });
          this.openSupplierQualification(flatData);
        }

        supplierListTableDS.query();
        fetchQualificationWarnInfo();
        this.cancelBulkAddSupplier();
      })
      .finally(() => {
        this.setState({ supplierLoading: false });
        togglePageLoading(false);
      });
  };

  // 跳转供应商生命周期管理详情
  @Bind()
  directionSupplierLifeManagerDetail(record = {}) {
    const { history = {}, rfxInfoDS } = this.props;
    const { supplierConfigOldUserFlag } = this.state;
    const {
      location: { pathname = null, search },
    } = history || {};
    const recordData = record.toData() || {};
    const companyId = rfxInfoDS.current.get('companyId');
    const {
      tenantId,
      partnerCompanyId,
      partnerTenantId,
      spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    } = recordData;

    if (
      !companyId ||
      !partnerCompanyId ||
      !partnerTenantId ||
      !spfmSupplierCompanyId ||
      !supplierCompanyId
    ) {
      return;
    }

    const params = {
      tenantId,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId: spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    };
    const searchParams = querystring.stringify(params);
    if (supplierConfigOldUserFlag) {
      history.push({
        pathname: '/sslm/include/supplier-manager/supplier-detail',
        search: searchParams,
        state: {
          historyBack: pathname + search,
          ...params,
        },
      });
    } else {
      history.push({
        pathname: '/sslm/supplier-detail-new',
        search: searchParams,
        state: {
          historyBack: pathname + search,
          ...params,
        },
      });
    }
  }

  /**
   * 引入供应商
   */
  @Bind()
  introducingSuppliers() {
    const { rfxInfoDS } = this.props;
    const sourceProjectId = rfxInfoDS?.current?.get('sourceProjectId');
    const companyId = rfxInfoDS?.current?.get('companyId');
    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get('ssrc.inquiryHall.view.message.button.introducingSuppliers').d('引入供应商'),
      children: (
        <IntroducingSuppliers
          onRef={this.getIntroSupplier}
          sourceProjectId={sourceProjectId}
          targetSourceCategory="RFQ"
          companyId={companyId}
        />
      ),
      style: { width: '1000px' },
      onOk: () => this.handleBulkAddSupplier(true),
      drawer: true,
    });
  }

  @Bind()
  getIntroSupplier(ref) {
    this.introSupplier = ref || {};
  }

  introSupplier = {};

  /**
   * 批量添加供应商
   * @param {*} isIntroduceFlag 是否是引入供应商的添加供应商
   * @returns void
   */
  @Bind()
  handleBulkAddSupplier(isIntroduceFlag) {
    const {
      rfxId,
      organizationId,
      rfxInfoDS,
      supplierListTableDS,
      togglePageLoading = () => {},
      fetchQualificationWarnInfo,
    } = this.props;

    const selects = isIntroduceFlag
      ? this.introSupplier.tableDS.selected
      : this.BulkAddSupplierDS.selected;
    if (!selects || isEmpty(selects)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const selectLines = isIntroduceFlag
      ? selects.map((item) => item.toData()?.supplierDTOList).flat()
      : selects.map((select) => select.toJSONData());
    const companyId = rfxInfoDS && rfxInfoDS.current.get('companyId');
    if (!companyId || !organizationId) {
      return;
    }

    const newParams = selectLines.map((item) => {
      const { mail, mobilephone, contactMail, contactPhone } = item || {};
      return {
        ...item,
        rfxHeaderId: rfxId,
        tenantId: organizationId,
        contactMail: mail || contactMail,
        sourceFrom: 'RFX',
        contactMobilephone: mobilephone || contactPhone,
        mobilephone: mobilephone || contactPhone,
      };
    });
    this.setState({ supplierLoading: true });
    togglePageLoading(true);
    supplierAttachment({
      newParams,
      organizationId,
      companyId,
      rfxHeaderId: rfxId,
    })
      .then((res = []) => {
        const result = getResponse(res);
        if (!result) {
          return;
        } else {
          notification.success();
        }

        const supplierAttachments = res.filter((item) => item.expirAttachmentsDtosLen);
        if (!isEmpty(supplierAttachments)) {
          this.cancelBulkAddSupplier();
          const flatData = this.renderDataSource(res);
          this.setState({
            supplierQualificationData: res,
          });
          this.openSupplierQualification(flatData);
        }

        supplierListTableDS.query();
        fetchQualificationWarnInfo();
        this.cancelBulkAddSupplier();
        this.forceUpdate();
      })
      .finally(() => {
        this.setState({ supplierLoading: false });
        togglePageLoading(false);
      });
  }

  // 供应商存在资质过期时
  openSupplierQualification(data = []) {
    const { organizationId, remoteBox } = this.props;
    this.SupplierBulkExpiredModalDS.loadData(data);
    this.SupplierBulkExpiredModalDS.selectAll();

    const Props = {
      remoteBox,
      organizationId,
      supplierBulkExpiredModalDS: this.SupplierBulkExpiredModalDS,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      title: intl
        .get(`ssrc.inquiryHall.view.message.title.supplierQualification`)
        .d('供应商资质到期提醒'),
      children: <SupplierBatchAddExpiredModal {...Props} />,
      style: { width: '800px' },
      bodyStyle: { maxHeight: 400 },
      onOk: () => this.handleAddExpires(),
      onCancel: () => this.cancelAddExpires(),
    });
  }

  @Bind()
  async handleAddExpires() {
    const { organizationId, rfxId, supplierListTableDS } = this.props;
    const { supplierQualificationData = [] } = this.state;
    const selectedRows = this.SupplierBulkExpiredModalDS.toJSONData();
    let newParams = [];

    const companyArray = [...new Set(selectedRows.map((item) => item.supplierCompanyId))];
    companyArray.forEach((supplierCompanyId) => {
      const supplierQualificationList = supplierQualificationData.filter(
        (element) => element.supplierCompanyId === supplierCompanyId
      );
      const newSupplierQualificationList = supplierQualificationList.map((supplierItem) => {
        return {
          ...supplierItem,
          rfxHeaderId: rfxId,
          tenantId: organizationId,
          contactMail: supplierItem.mail || supplierItem.contactMail,
          contactMobilephone: supplierItem.mobilephone || supplierItem.contactPhone,
        };
      });
      newParams = [...newParams, ...newSupplierQualificationList];
    });

    try {
      const result = await saveSupplierLine({
        newParams,
        organizationId,
        rfxHeaderId: rfxId,
      });
      const res = getResponse(result);
      if (res && res.failed) {
        return;
      }
      this.cancelAddExpires();
      supplierListTableDS.query();
      this.forceUpdate();
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  cancelAddExpires() {
    this.SupplierBulkExpiredModalDS.reset();
  }

  /**
   * 取消-关闭批量添加供应商模态框
   */
  @Bind()
  cancelBulkAddSupplier() {
    this.BulkAddSupplierDS.clearCachedSelected();
    this.BulkAddSupplierDS.unSelectAll();
    this.BulkAddSupplierDS.reset();
  }

  // 行业类型-select-change
  handleChangeIndustry = (data = []) => {
    const { rfxInfoDS } = this.props;
    const record = rfxInfoDS.current;
    if (isEmpty(data)) {
      record.set('industryCategoryData', null);
      this.setState({ industryCategory: [] });
      return;
    }

    const { industryCategory = [] } = this.state;
    const industryCategoryData = record.get('industryCategoryData');
    // 所有的industryCategory选项
    let industryCategoryList = [];
    industryCategory.forEach((item) => {
      industryCategoryList = [...industryCategoryList, ...(item.children || [])];
    });
    // 获取industryCategoryData的每一项对象[{}]
    industryCategoryList = industryCategoryList.filter((i) =>
      industryCategoryData?.includes(i?.categoryId)
    );
    const newIndustryCategoryData = industryCategoryList.reduce((groups, item) => {
      if (data.includes(item?.industryId)) {
        groups.push(item?.categoryId);
      }
      return groups;
    }, []);
    // 设置最新的industryCategoryData
    record.set('industryCategoryData', newIndustryCategoryData);

    this.initAndFetchInductryCategory(data);
  };

  // 改变境内外关系
  handleChangeOrganizationType = (value) => {
    const { isDomesTic = () => {}, rfxInfoDS } = this.props;

    this.setState({
      industryCategory: [],
      industryData: [],
    });

    const record = rfxInfoDS.current;
    record.set('industryCategoryData', null);
    record.set('industryData', null);

    const domesticFlag = isDomesTic(value);
    this.fetchIndustyType({
      domesticFlag,
    });
  };

  // select-grouped-render
  buildGroupSelectOption(
    list = [],
    groupKey = 'id',
    groupLabel = 'name',
    keyName = groupKey,
    labelName = groupLabel
  ) {
    const options =
      isArray(list) &&
      list.map((item) => {
        const { children = [] } = item;
        return (
          <OptGroup key={item[groupKey]} label={item[groupLabel]}>
            {children &&
              children.map((child) => {
                return (
                  <Option key={child[keyName]} value={child[keyName]}>
                    {child[labelName]}
                  </Option>
                );
              })}
          </OptGroup>
        );
      });
    return options;
  }

  // 保证金
  rendererBidBond({ value = null }) {
    if (!value) {
      return intl.get('ssrc.common.view.gratis').d('免费');
    }

    return value;
  }

  /**
   * 过滤下拉选项
   */
  @Bind()
  handleOptionsFilter(record) {
    const { allOpenSelectable, isNewBiddingFlag = noop } = this.props;
    // 竞价大厅
    const newBiddingFlag = isNewBiddingFlag();
    // 配置表没有限制全平台公开 并且 不是新竞价；则可选择全平台公开
    return record.get('value') !== 'ALL_OPEN' || (allOpenSelectable && !newBiddingFlag);
  }

  getFields = () => {
    const { changeSourceMethod, rfxInfoDS, remoteBox, rfxId } = this.props;
    const { industryCategory = [], industry = [] } = this.state;
    const industryCategoryOptions = this.buildGroupSelectOption(
      industryCategory,
      'industryId',
      'industryName',
      'categoryId',
      'categoryName'
    );
    const sourceMethod = rfxInfoDS?.current?.get('sourceMethod');
    const industryVisible = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_INDUSTRYVISIBLE',
          sourceMethod && sourceMethod !== 'INVITE',
          { sourceMethod, rfxInfoDS }
        )
      : sourceMethod && sourceMethod !== 'INVITE';
    const industryOptions = this.buildGroupSelectOption(industry, 'industryId', 'industryName');

    const Fields = [
      <Select
        name="sourceMethod"
        onChange={changeSourceMethod}
        optionsFilter={this.handleOptionsFilter}
        showHelp="tooltip"
      />,
      sourceMethod === 'OPEN' && <Select name="expandScope" showHelp="tooltip" />,
      <div name="sourceMethod_1" fieldClassName="td-no-visible" />,
      <div name="sourceMethod_2" fieldClassName="td-no-visible" />,
      industryVisible ? (
        <Select name="organizationType" onChange={this.handleChangeOrganizationType} />
      ) : (
        false
      ),
      industryVisible ? (
        <Select
          name="industryData"
          searchable
          selectAllButton={false}
          onChange={this.handleChangeIndustry}
          notFoundContent={intl
            .get('ssrc.inquiryHall.view.message.selectOrgTypeDataFirst')
            .d('请先选择境内外关系')}
        >
          {industryOptions}
        </Select>
      ) : (
        false
      ),
      industryVisible ? (
        <Select
          name="industryCategoryData"
          searchable
          selectAllButton={false}
          notFoundContent={intl
            .get('ssrc.inquiryHall.view.message.selectIndustryDataFirst')
            .d('请先选择行业类型')}
        >
          {industryCategoryOptions}
        </Select>
      ) : (
        false
      ),
    ];
    const remoteFields = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SOURCE_METHOD_FIELDS', Fields, {
          rfxId,
          rfxInfoDS,
          bidFlag: this.sourceKey === BID,
          PageSourceSymbol,
        })
      : Fields;
    return remoteFields.filter(Boolean);
  };

  // 公告fields
  getNoticeFields() {
    const { previewNotice, ChunkUploadProps = {} } = this.props;
    // const noticeRecord = sourceNoticeDS.current || null;
    const Fields = [
      <TextField name="noticeTitle" clearButton />,
      <NumberField name="noticeDays" />,
      <Attachment
        name="noticeAttachmentUuid"
        {...ChunkUploadProps}
        label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
        bucketName={PUBLIC_BUCKET}
        bucketDirectory="ssrc-rfx-tender-notice"
        style={{ paddingLeft: '10px' }}
        newLine
      />,
      <Output
        name="noticePreview"
        labelLayout="none"
        renderer={() => (
          <a onClick={previewNotice} className={styles['p-l-m-10']}>
            <Icon type="find_in_page" style={{ paddingRight: '3px' }} />
            <span className={styles['uploda-title-text']}>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.noticePreview').d('公告预览')}
            </span>
          </a>
        )}
      />,
    ].filter(Boolean);

    return Fields;
  }

  getBusinessRequest = () => {
    const { rfxInfoDS, serviceChargeFlag = false } = this.props;
    const record = rfxInfoDS.current || null;
    const bidBond = record.get('bidBond') || 0;
    const bidBondFlag = record.get('bidBondFlag') || 0;
    const tenderFeeFlag = record.get('tenderFeeFlag') || 0;

    const Fields = [
      tenderFeeFlag && (
        <C7nPrecisionInputNumber
          name="bidFileExpense"
          record={rfxInfoDS?.current}
          dataSet={rfxInfoDS}
          precision={2}
          renderer={(value) => this.rendererBidBond(value)}
        />
      ),
      bidBondFlag && (
        <C7nPrecisionInputNumber
          name="bidBond"
          record={rfxInfoDS?.current}
          dataSet={rfxInfoDS}
          precision={2}
          renderer={(value) => this.rendererBidBond(value)}
        />
      ),
      serviceChargeFlag && bidBond && bidBond > 0 && <CheckBox name="serviceExpenseChargeFlag" />,
      <Lov name="paymentTypeLov" />,
      <Lov name="paymentTermLov" />,
      <div name="biddingBusinessRequestField_2_3" fieldClassName="td-no-visible" />,
    ];
    return Fields.filter(Boolean);
  };

  getSupplierStageFields() {
    const Fields = [<TextField name="allowSourceSupplierStages" colSpan={2} />];
    return Fields;
  }

  // 供应商table（虎牙二开）
  @Bind()
  renderSupplierTableComponent(supplierListTableProps) {
    return <SupplierListTable {...supplierListTableProps} />;
  }

  getSupplierLovQueryData = () => {
    const { rfxInfoDS, remoteBox } = this.props;

    const { current } = rfxInfoDS || {};
    const { companyId } = current ? current.get(['companyId']) : {};

    // NEW SUPPLIER LOV PROPS
    let currentSupplierLovProps = {};
    currentSupplierLovProps = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SUPPLIERLOVPROPS',
          currentSupplierLovProps,
          {
            pageSource: PageSourceSymbol.inquiryHallUpdate,
            that: this,
          }
        )
      : currentSupplierLovProps;
    currentSupplierLovProps = currentSupplierLovProps || {};

    return {
      companyId,
      ...currentSupplierLovProps,
    };
  };

  render() {
    const {
      header,
      rfxInfoDS = {},
      sourceNoticeDS = {},
      supplierListTableDS = {},
      custLoading = null,
      customizeTable,
      onLinkRiskScan,
      rfxId,
      remoteBox,
      organizationId,
      supplierRelationMap,
      customizeCollapseForm,
      proxyDsCreate = {},
      match,
      rfx = {},
      afterCustomizeDs,
      onFormRef,
      itemLineTableDS,
      riskScanFlag,
      serviceChargeFlag,
      businessFormRef,
      isNewBiddingFlag = noop, // 是否是新竞价
      fetchInquiryHeader = noop,
      proxyDsSourceNoticeCreate = {},
      afterCustomizeSourceNoticeDs,
      qualificationWarnInfo,
      fetchQualificationWarnInfo,
      _timestamp = '',
      history,
    } = this.props;
    const { supplierConfigOldFlag = true, supplierLoading = false } = this.state;
    const { sourceKey } = rfx;
    const record = rfxInfoDS.current || null;
    if (!record) {
      return [];
    }

    const sourceMethod = record.get('sourceMethod');

    const displayFormFlag = remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_DISPLAYFORMFLAG', false, {
          rfxInfoDS,
        })
      : false;

    // NEW SUPPLIER LOV PROPS
    let currentSupplierLovProps = {};
    currentSupplierLovProps = remoteBox
      ? remoteBox.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SUPPLIERLOVPROPS',
          currentSupplierLovProps,
          {
            pageSource: PageSourceSymbol.inquiryHallUpdate,
            that: this,
          }
        )
      : currentSupplierLovProps;

    const supplierListTableProps = {
      riskScanFlag,
      rfx,
      rfxId,
      remoteBox,
      organizationId,
      rfxInfoDS,
      header,
      sourceMethod,
      supplierListTableDS,
      customizeTable,
      custLoading,
      onLinkRiskScan,
      onBulkAddSupplier: this.onBulkAddSupplier,
      directionSupplierLifeManagerDetail: this.directionSupplierLifeManagerDetail,
      supplierRelationMap,
      introducingSuppliers: this.introducingSuppliers,
      handleBatchAllotItem: this.handleBatchAllotItem,
      supplierLineAllotItem: this.supplierLineAllotItem,
      supplierLineAllotSection: this.supplierLineAllotSection,
      match,
      supplierConfigOldFlag,
      getSupplierLovQueryData: this.getSupplierLovQueryData,
      fetchSourceSupplierRelativeConfigData: this.fetchSourceSupplierRelativeConfigData,
      supplierLovProps: {
        dataSet: this.SupplierLovDS,
        name: 'supplierLovList',
        mode: 'button',
        clearButton: false,
        icon: 'playlist_add',
        placeholder: intl
          .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
          .d('批量添加供应商'),
        modalProps: {
          style: { maxWidth: '1500px', width: '1000px' },
          onOk: (supplierLovParams) => this.newBulkAddSupplier(supplierLovParams),
          onCancel: () => {
            this.SupplierLovDS.loadData();
          },
        },
        beforeQuery: this.fetchSourceSupplierRelativeConfigData,
        pageSource: PageSourceSymbol.inquiryHallUpdate,
        ...(currentSupplierLovProps || {}),
      },
      itemLineTableDS,
      supplierRelationSearch: this.supplierRelationSearch,
      supplierLoading,
      serviceChargeFlag,
      fetchInquiryHeader,
      qualificationWarnInfo,
      fetchQualificationWarnInfo,
      _timestamp,
      history,
    };

    // 竞价大厅
    const newBiddingFlag = isNewBiddingFlag();

    return (
      <div>
        <h4 id="rfxDemandSide" className={styles['rfx-card-item-title-level-two']}>
          <div className={styles['rfx-card-item-title-line']} />
          {intl
            .get('ssrc.inquiryHall.view.inquiryHall.participateSupplierScope')
            .d('可参与供应商范围')}
        </h4>
        <div className={styles['rfx-card-common-form']}>
          {customizeCollapseForm(
            {
              code: `SSRC.${sourceKey}_HALL.NEW_EDIT.SOURCE_METHOD`,
              dataSet: rfxInfoDS,
              proxyDsCreate,
              afterCustomizeDs,
            },
            <CollapseForm
              dataSet={rfxInfoDS}
              labelLayout="float"
              columns={3}
              formRef={onFormRef}
              useWidthPercent
            >
              {this.getFields()}
            </CollapseForm>
          )}
          <div style={{ height: '16px' }} />
          {sourceMethod !== 'INVITE' || displayFormFlag
            ? customizeCollapseForm(
                {
                  code: `SSRC.${sourceKey}_HALL.NEW_EDIT.NOTICE`,
                  dataSet: sourceNoticeDS,
                  proxyDsCreate: proxyDsSourceNoticeCreate,
                  afterCustomizeDs: afterCustomizeSourceNoticeDs,
                },
              <CollapseForm
                dataSet={sourceNoticeDS}
                labelLayout="float"
                columns={3}
                useWidthPercent
              >
                {this.getNoticeFields()}
              </CollapseForm>
              )
            : null}
        </div>

        {sourceMethod === 'INVITE'
          ? this.renderSupplierTableComponent(supplierListTableProps)
          : null}

        {newBiddingFlag ? (
          <div className={styles['rfx-card-common-form']}>
            <h4
              id="rfxDemandSide"
              className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}
            >
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.businessRequest').d('商务要求')}
            </h4>
            {customizeCollapseForm(
              {
                code: `SSRC.${sourceKey}_HALL.NEW_EDIT.BUSINESS_REQUEST`,
                dataSet: rfxInfoDS,
                proxyDsCreate,
                afterCustomizeDs,
              },
              <CollapseForm
                dataSet={rfxInfoDS}
                labelLayout="float"
                showLines={3}
                columns={3}
                formRef={businessFormRef}
                useWidthPercent
              >
                {this.getBusinessRequest()}
              </CollapseForm>
            )}
          </div>
        ) : (
          ''
        )}

        <div className={classnames(styles['m-t-m'])}>
          <CollapseForm
            labelAlign="right"
            dataSet={rfxInfoDS}
            labelLayout="float"
            columns={3}
            useWidthPercent
          >
            {this.getSupplierStageFields()}
          </CollapseForm>
        </div>
      </div>
    );
  }
}

const hocSupplier = (NewComponent) => {
  return observer(NewComponent);
};
const SupplierWithRequestForm = hocSupplier(SupplierComponent);

export default SupplierWithRequestForm;

export { hocSupplier, SupplierComponent };
