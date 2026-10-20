// 对供应商要求form

import React, { Component } from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, uniqWith } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentTenant } from 'utils/utils';

import { PageSourceSymbol } from '@/utils/constants.js';

import BulkAddSupplierModal from '@/routes/ssrc/InquiryHallNew/Update/BulkAddSupplierModal';
import {
  saveDistributionItems,
  bathAddSupplierAndValidate,
  bathAddSupplier,
  fetchConfigSheet,
  fetchSourceSupplierRelativeConfig,
} from '@/services/inquiryHallNewService';
import {
  BulkAddSupplierDS,
  SupplierBulkExpiredModalDS,
  SupplierFilterItemDS,
} from './BulkAddSupplierDS';
import SupplierListTable from './SupplierListTable';

import SupplierBatchAddExpiredModal from './SupplierBatchAddExpiredModal';
import SupplierFilterItemForm from './SupplierFilterItemForm';
import SupplierListTableDS, { SupplierLovDS } from './SupplierListTableDS';
import ApplyToOtherSection from './ApplyToOtherSection';

export default class Supplier extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    const { remote, bidFlag = false } = props;

    this.state = {
      supplierQualificationData: [],
      supplierConfigOldFlag: true, // 配置表“新建供应商”老ui
      supplierConfigOldUserFlag: true, // 采购方租户是否在配置表中
    };
    this.supplierListTableDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SUPPLIER_TABLE_DS',
            SupplierListTableDS(),
            { bidFlag }
          )
        : SupplierListTableDS()
    );
  }

  BulkAddSupplierDS = new DataSet(BulkAddSupplierDS());

  SupplierBulkExpiredModalDS = new DataSet(SupplierBulkExpiredModalDS());

  SupplierFilterItemDS = new DataSet(SupplierFilterItemDS());

  SupplierLovDS = new DataSet(SupplierLovDS());

  componentDidMount() {
    this.initPage();
  }

  initPage = () => {
    this.initSupplierDS();
    this.fetchSupplierLovConfig();
    this.fetchSupplierOldUserConfig();
  };

  initSupplierDS() {
    const { rfxId, organizationId, header, custKey } = this.props;
    const { companyId } = header.rfxHeaderBaseInfoAdjustDTO;
    this.supplierListTableDS.setQueryParameter('commonProps', {
      adjustRecordId: rfxId,
      organizationId,
      customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER`,
    });
    this.supplierListTableDS.setQueryParameter('company', {
      companyId,
    });
  }

  // 查询新建供应商新老弹窗配置
  fetchSupplierLovConfig = async () => {
    const { isNewRfx = false, organizationId } = this.props;
    if (isNewRfx) {
      return;
    }

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

  initBulkAddSupplierDS() {
    const { rfxId, userId, organizationId, header = {}, custKey } = this.props;
    const {
      rfxHeaderBaseInfoAdjustDTO: { companyId, templateId, rfxHeaderId },
    } = header;

    this.BulkAddSupplierDS.setQueryParameter('commonProps', {
      sourceHeaderId: rfxHeaderId,
      userId,
      templateId,
      companyId,
      organizationId,
      adjustRecordId: rfxId,
      sourceFrom: 'RFX',
      customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER`,
    });
  }

  initSupplierFilterItemDS(record) {
    const { rfxId, organizationId, custKey } = this.props;
    this.SupplierFilterItemDS.setQueryParameter('commonProps', {
      adjustRecordId: rfxId,
      organizationId,
      rfxLineSupplierAdjustId: record.get('rfxLineSupplierAdjustId'),
      customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM`,
    });
  }

  /**
   * 铺平供应商资质到期提醒数据
   */
  @Bind()
  renderDataSource(dataSource) {
    const arrayItem = [];
    const attachmentsItem = dataSource.map(item => {
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
    attachmentsItem.forEach(item => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    return arrayItem;
  }

  // 分配物料保存调用
  @Bind()
  async allotItemLine(param = {}) {
    const { supplierListTableDS } = this;

    try {
      let result = await saveDistributionItems(param);
      result = getResponse(result);
      if (!result) {
        return;
      }
      this.SupplierFilterItemDS.loadData();
      this.SupplierFilterItemDS.reset();
      supplierListTableDS.query();
      Modal.destroyAll();
    } catch (e) {
      throw e;
    }
  }

  // 供应商行分配物料
  @Bind()
  saveSingleAllotItem(rfxLineSupplierId) {
    const { organizationId, custKey } = this.props;
    const ids = [];
    // 寻源控制-特殊状态下放开保存限制
    if(this.SupplierFilterItemDS.getState('showItemAssignFlag') !== 1 && rfxLineSupplierId) {
      return;
    }
    ids.push(rfxLineSupplierId);

    let afterDealData = [];
    let selectAllPageFlag;
    if (this.SupplierFilterItemDS) {
      // selectAllPageFlag - 是否跨页全选标识 1-是 0|null|undefined-否
      selectAllPageFlag = this.SupplierFilterItemDS.getState('selectAllManually');
      // 选中的数据
      const selectedData = this.SupplierFilterItemDS.selected.map(item => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: 1,
        };
      });
      // 操作过的未选中的数据
      const unSelectedData = (
        this.SupplierFilterItemDS.getState('cacheUnSelectedRecords') || []
      ).map(item => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: 0,
        };
      });
      // 当前页未选中数据
      const currentUnSelected = (this.SupplierFilterItemDS.unSelected || []).map(item => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: 0,
        };
      });
      const cachedModifiedData = (this.SupplierFilterItemDS.cachedModified || []).map(item => {
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

    return this.allotItemLine({
      organizationId,
      rfxItemSupAssinAdjust: afterDealData,
      customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM`,
    });
  }

  // 供应商查看分配物料modal
  @Debounce(200)
  @Bind()
  async supplierLineAllotItem(record = {}) {
    const { customizeTable, custKey } = this.props;
    this.initSupplierFilterItemDS(record);
    const data = record.toData() || {};
    const { rfxLineSupplierId } = data;
    // 添加过程控制中可编辑标识，但会对跨页和勾选操作进行限制
    this.SupplierFilterItemDS.setState('showItemAssignFlag', record.get('showItemAssignFlag'));
    const allotIteResult = await this.SupplierFilterItemDS.query();
    if (!isEmpty(allotIteResult) && !isEmpty(allotIteResult.content)) {
      const firstRecord = allotIteResult.content.length >= 1 && allotIteResult.content[0];
      if (firstRecord) {
        const { selectAllPageFlag } = firstRecord;
        // 设置初始勾选情况
        if (selectAllPageFlag === 0) {
          // 跨页全不选
          this.SupplierFilterItemDS.setAllPageSelection(false);
        } else if (selectAllPageFlag === 1) {
          // 跨页全选
          this.SupplierFilterItemDS.setAllPageSelection(true);
        }
      }
    }

    const Props = {
      supplierRecord: record,
      SupplierFilterItemDS: this.SupplierFilterItemDS,
      saved: () => this.saveSingleAllotItem(rfxLineSupplierId),
      customizeTable,
      custKey,
    };
    const modalKey = Modal.key();
    Modal.open({
      drawer: true,
      closable: true,
      destroyOnClose: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.title.viewAllotItemLine`).d('查看分配物料'),
      children: <SupplierFilterItemForm {...Props} />,
      style: { width: '800px' },
      onOk: () => this.saveSingleAllotItem(rfxLineSupplierId),
      onClose: () => {
        this.SupplierFilterItemDS.loadData([]);
        this.SupplierFilterItemDS.clearCachedRecords();
        this.SupplierFilterItemDS.clearCachedSelected();
        this.SupplierFilterItemDS.setState('showItemAssignFlag', undefined);
        this.SupplierFilterItemDS.reset();
      },
      onCancel: () => {
        this.SupplierFilterItemDS.loadData([]);
        this.SupplierFilterItemDS.clearCachedRecords();
        this.SupplierFilterItemDS.clearCachedSelected();
        this.SupplierFilterItemDS.setState('showItemAssignFlag', undefined);
        this.SupplierFilterItemDS.reset();
      },
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
      onOk: () => this.handleBulkAddSupplier(),
      onCancel: () => this.cancelBulkAddSupplier(),
    });
  }

  // 批量添加供应商
  @Bind()
  handleBulkAddSupplier() {
    const {
      organizationId,
      header,
      toggleLoading = () => {},
      toggleSectionLoading = () => {},
      fetchQualificationWarnController,
    } = this.props;
    const {
      rfxHeaderBaseInfoAdjustDTO: { companyId, rfxHeaderId, adjustRecordId, rfxHeaderAdjustId },
    } = header;

    const selects = this.BulkAddSupplierDS.selected;
    if (!selects || isEmpty(selects)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const selectLines = selects.map(select => select.toJSONData());

    const newParams = selectLines.map(item => {
      const { mail, mobilephone } = item || {};
      return {
        ...item,
        rfxHeaderId,
        adjustRecordId,
        tenantId: organizationId,
        contactMail: mail,
        sourceFrom: 'RFX',
        contactMobilephone: mobilephone,
      };
    });
    toggleLoading(true);
    toggleSectionLoading(true);
    bathAddSupplierAndValidate({
      sourceLineSupplierDTOS: newParams,
      organizationId,
      companyId,
      rfxHeaderId,
      adjustRecordId,
      rfxHeaderAdjustId,
    })
      .then((res = []) => {
        if (res && res.failed) {
          notification.warning({
            message: res.message,
          });
          return;
        }

        const supplierAttachments = res.filter(item => item.expirAttachmentsDtosLen);
        if (!isEmpty(supplierAttachments)) {
          this.cancelBulkAddSupplier();
          const flatData = this.renderDataSource(res);
          this.setState({
            supplierQualificationData: res,
          });
          this.openSupplierQualification(flatData);
        }

        this.supplierListTableDS.query();
        fetchQualificationWarnController();
        this.cancelBulkAddSupplier();
        this.forceUpdate();
      })
      .finally(() => {
        toggleLoading(false);
        toggleSectionLoading(false);
      });
  }

  // 供应商存在资质过期时
  openSupplierQualification(data = []) {
    const { organizationId, remote } = this.props;
    this.SupplierBulkExpiredModalDS.loadData(data);
    this.SupplierBulkExpiredModalDS.selectAll();

    const Props = {
      remote,
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
    const { organizationId, rfxId, header = {} } = this.props;
    const { supplierQualificationData = [] } = this.state;
    const {
      rfxHeaderBaseInfoAdjustDTO: { companyId, rfxHeaderId, adjustRecordId, rfxHeaderAdjustId },
    } = header;
    const selectedRows = this.SupplierBulkExpiredModalDS.toJSONData();
    let newParams = [];

    const companyArray = [...new Set(selectedRows.map(item => item.supplierCompanyId))];
    companyArray.forEach(companyItemId => {
      const supplierQualificationList = supplierQualificationData.filter(
        element => element.supplierCompanyId === companyItemId
      );
      const newSupplierQualificationList = supplierQualificationList.map(supplierItem => {
        return {
          ...supplierItem,
          rfxHeaderId,
          adjustRecordId: rfxId,
          tenantId: organizationId,
          contactMail: supplierItem.mail,
          contactMobilephone: supplierItem.mobilephone,
        };
      });
      newParams = [...newParams, ...newSupplierQualificationList];
    });

    try {
      const result = await bathAddSupplier({
        sourceLineSupplierDTOS: newParams,
        organizationId,
        companyId,
        rfxHeaderId,
        adjustRecordId,
        rfxHeaderAdjustId,
      });
      const res = getResponse(result);
      if (res && res.failed) {
        return;
      }
      this.cancelAddExpires();
      this.supplierListTableDS.query();
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

  /**
   * 配置表使用新供应商lov, 在打开之前
   * 查询寻源和系统供应商数据,给SupplierLov组件查询接口传递
   */
  fetchSourceSupplierRelativeConfigData = async () => {
    const { organizationId, header = {}, bidFlag, remote, isSection } = this.props;
    const {
      rfxHeaderBaseInfoAdjustDTO: { adjustRecordId, rfxHeaderId },
    } = header;
    if (!rfxHeaderId) {
      return;
    }

    const params = {
      organizationId,
      sourceHeaderId: rfxHeaderId,
      adjustRecordId,
      sourceFrom: 'RFX_ADJUST',
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
        erpFlag = null,
        stageIdList = null,
        stageAllMismatchFlag = 0,
        itemAndCategoryDTOS = null,
        expandObject = null, // 扩展对象
        queryItemIds = null,
      } = result;

      if (stageAllMismatchFlag === 1) {
        notification.warning({
          message: bidFlag
            ? intl
                .get(`ssrc.inquiryHall.model.inquiryHall.batchAddBIDSupplierMsg`)
                .d(
                  '操作失败，失败原因是业务规则定义"可参与投标（新）供应商设置"导致没有供应商可参与，请检查'
                )
            : intl
                .get(`ssrc.inquiryHall.model.inquiryHall.batchAddRFQSupplierMsg`)
                .d(
                  '操作失败，失败原因是业务规则定义"可参与询价供应商设置"导致没有供应商可参与，请检查'
                ),
        });
      }

      let nonLocalSupplierList = [];
      if (!isEmpty(existSuppliers)) {
        nonLocalSupplierList = existSuppliers.filter(
          (supplier = {}) => supplier.supplierCompanyId || supplier.supplierId
        );
      }

      result = {
        defaultQueryItemCategoryIds: this.formatListToString(itemCategoryIds),
        supplyReviewStatus: this.formatListToString(reviewStatusList),
        itemAndCategoryDTOS,
        sourceCode,
        erpFlag,
        excludeSupplierDetailDTOS: nonLocalSupplierList, // 维护，过程控制-反选供应商，线下正选供应商
        stageIdList,
        queryItemIds,
        ...(expandObject || {}),
        pageSource: PageSourceSymbol.quotationController,
      };
    } catch (e) {
      throw e;
    }

    return remote
    ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SUPPLIER_LOV_PARAMS', result || {}, { header, isSection })
    : result || {};
  };

  formatListToString = (list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  };

  // new ui supplier lov add supplier
  newBulkAddSupplier = async () => {
    const {
      organizationId,
      header,
      toggleLoading = () => {},
      toggleSectionLoading = () => {},
      fetchQualificationWarnController,
    } = this.props;
    const {
      rfxHeaderBaseInfoAdjustDTO: { companyId, rfxHeaderId, adjustRecordId, rfxHeaderAdjustId },
    } = header;
    const data = this.SupplierLovDS?.toData();
    const { supplierLovList = [] } = data?.[0] || {};

    if (isEmpty(supplierLovList)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const selectLines = supplierLovList;

    const newParams = selectLines.map(item => {
      const {
        mail,
        mobilephone,
        name,
        supplierName,
        supplierCompanyName,
        supplierNum,
        supplierCompanyNum,
        internationalTelCode = null,
        supplierCategoryName,
      } = item || {};
      return {
        ...item,
        rfxHeaderId,
        adjustRecordId,
        tenantId: organizationId,
        contactMail: mail,
        sourceFrom: 'RFX',
        contactMobilephone: mobilephone,
        contactName: name,
        supplierCompanyName: supplierCompanyName || supplierName,
        supplierCompanyNum: supplierCompanyNum || supplierNum,
        internationalTelCode,
        supplierCategoryDescription: supplierCategoryName,
      };
    });
    toggleLoading(true);
    toggleSectionLoading(true);
    bathAddSupplierAndValidate({
      sourceLineSupplierDTOS: newParams,
      organizationId,
      companyId,
      rfxHeaderId,
      adjustRecordId,
      rfxHeaderAdjustId,
    })
      .then((res = []) => {
        this.SupplierLovDS.loadData();
        if (res && res.failed) {
          notification.warning({
            message: res.message,
          });
          return;
        }

        const supplierAttachments = res.filter(item => item.expirAttachmentsDtosLen);
        if (!isEmpty(supplierAttachments)) {
          this.cancelBulkAddSupplier();
          const flatData = this.renderDataSource(res);
          this.setState({
            supplierQualificationData: res,
          });
          this.openSupplierQualification(flatData);
        }

        this.supplierListTableDS.query();
        fetchQualificationWarnController();
        this.cancelBulkAddSupplier();
        this.forceUpdate();
      })
      .finally(() => {
        toggleLoading(false);
        toggleSectionLoading(false);
      });
  };

  render() {
    const {
      header,
      remote,
      custLoading = null,
      customizeTable,
      rfxId,
      organizationId,
      handleSave,
      isSection,
      custKey,
      bidFlag,
      checkPermissionObject = {},
      location = {},
      fetchQualificationWarnController,
      qualificationWarnInfo,
      history,
    } = this.props;
    const { supplierConfigOldFlag = true } = this.state;
    const { sourceMethod } = header;

    const applyToOtherSectionProps = {
      rfxId,
      handleSave,
      organizationId,
      adjustType: 'SUPPLIER_REQUIRE',
    };

    const supplierListTableProps = {
      rfxId,
      remote,
      organizationId,
      header,
      bidFlag,
      sourceMethod,
      supplierListTableDS: this.supplierListTableDS,
      customizeTable,
      custLoading,
      onBulkAddSupplier: this.onBulkAddSupplier,
      supplierLineAllotItem: this.supplierLineAllotItem,
      custKey,
      supplierConfigOldFlag,
      checkPermissionObject,
      supplierLovProps: {
        dataSet: this.SupplierLovDS,
        name: 'supplierLovList',
        mode: 'button',
        clearButton: false,
        icon: 'auto_complete',
        placeholder: intl
          .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
          .d('批量添加供应商'),
        modalProps: {
          style: { maxWidth: '1500px', width: '1000px' },
          onOk: () => this.newBulkAddSupplier(),
          onCancel: () => {
            this.SupplierLovDS.loadData();
          },
        },
        beforeQuery: this.fetchSourceSupplierRelativeConfigData,
      },
      location,
      fetchQualificationWarnController,
      qualificationWarnInfo,
      history,
    };

    return (
      <div>
        {header.rfxHeaderBaseInfoAdjustDTO.sourceMethod === 'INVITE' ? (
          <SupplierListTable {...supplierListTableProps} />
        ) : null}
        {isSection && <ApplyToOtherSection {...applyToOtherSectionProps} />}
      </div>
    );
  }
}
