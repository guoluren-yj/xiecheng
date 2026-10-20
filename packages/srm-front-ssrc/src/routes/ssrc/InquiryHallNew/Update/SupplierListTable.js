// 供应商列表table SupplierListTablePrepare

import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Modal, Icon, Tooltip } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, noop } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import notification from 'utils/notification';
import EmbedPage from '_components/EmbedPage';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import CommonImportNew from 'hzero-front/lib/components/Import';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import remote from 'hzero-front/lib/utils/remote';
import { riskLevelRender } from '@/utils/renderer';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import { fetchEnterpriceRiskControlConfig } from '@/services/commonService';
import warnIcon from '@/assets/warn-icon.svg';
import commonStyle from '@/routes/ssrc/common.less';

import { ContactPhone } from './Components';

class SupplierTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      enterpriceRiskControllerButtonsVisible: {
        RELATION_MINING: 0, // 关系图谱（关系挖掘）
        RISK_SCAN: 0, // 风险扫描
        QCC_FIND_RELATION_VARIOUS_V1: 0, // 找关系
      },
    };
  }

  componentDidMount() {
    this.initPage();
  }

  initPage = () => {
    this.enterpriceRiskControllerButtonConfig();
  };

  /** 查询企业是否开通 [ 风险扫描，关系图谱，找关系, ..., ]等服务
   *  RELATION_MINING：关系图谱（关系挖掘）
   *  RISK_SCAN：风险扫描
   *  QCC_FIND_RELATION_VARIOUS_V1
   */
  enterpriceRiskControllerButtonConfig = async () => {
    const { organizationId } = this.props;
    let result = null;

    const params = {
      organizationId,
      applicationCode: 'AP_CREDIT',
      serviceCode: 'RELATION_MINING,RISK_SCAN,QCC_FIND_RELATION_VARIOUS_V1', // 找关系，关系图谱（关系挖掘），风险扫描,
    };

    try {
      result = await fetchEnterpriceRiskControlConfig(params);
      result = getResponse(result || isEmpty(result));
      if (!result) {
        return;
      }

      this.setState({
        enterpriceRiskControllerButtonsVisible: result,
      });
    } catch (e) {
      throw e;
    }
  };

  /**
   * 批量导入
   */
  @Bind()
  handleBatchExport() {
    const { rfxId, organizationId } = this.props;
    if (!rfxId || rfxId === 'null') {
      return;
    }

    const Props = {
      code: 'SSRC.RFX_SUPPLIER.IMPORT',
      organizationId,
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: rfxId,
        templateCode: 'SSRC.RFX_SUPPLIER.IMPORT',
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_SUPPLIER.IMPORT',
      auto: true,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表'),
      children: <CommonImport {...Props} />,
      style: { width: '80%' },
      onOk: this.batchImportOk,
    });
  }

  @Bind
  batchImportOk() {
    const { supplierListTableDS, fetchQualificationWarnInfo } = this.props;
    supplierListTableDS.query();
    fetchQualificationWarnInfo();
    this.forceUpdate();
  }

  // line supplier lov props
  getSupplierLovProps = () => {
    const {
      rfxInfoDS,
      remote: supplierTableRemote,
      fetchSourceSupplierRelativeConfigData = () => {},
      getSupplierLovQueryData = noop,
      supplierLovProps: sourceSupplierLovProps = {},
    } = this.props;
    const { pageSource } = sourceSupplierLovProps || {};

    const { current } = rfxInfoDS || {};
    const { companyId } = current ? current.get(['companyId']) : {};

    const supplierLovQueryData = getSupplierLovQueryData() || {};

    const supplierLovProps = {
      clearButton: true,
      noCache: true,
      modalProps: {
        style: { maxWidth: '1500px', width: '1000px' },
        onOk: this.supplierLovOk,
      },
      onChange: this.supplierLovChange,
      disabled: !companyId,
      beforeQuery: fetchSourceSupplierRelativeConfigData,
    };

    // NEW SUPPLIER LOV PROPS
    let currentSupplierLovProps = {};
    currentSupplierLovProps = supplierTableRemote
      ? supplierTableRemote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SUPPLIERLOVPROPS',
          currentSupplierLovProps,
          {
            pageSource,
            that: this,
          }
        )
      : currentSupplierLovProps;
    currentSupplierLovProps = currentSupplierLovProps || {};

    return {
      pageSource,
      queryData: supplierLovQueryData,
      ...supplierLovProps,
      ...currentSupplierLovProps,
    };
  };

  supplierLovOk = (options = {}) => {
    const { supplierListTableDS } = this.props;
    const CurrentRecord = supplierListTableDS?.current;
    if (!CurrentRecord) {
      return;
    }

    const { currentField = 'selectSupplier' } = options || {};
    const supplierLovSelectedData = CurrentRecord?.get(currentField);
    if (isEmpty(supplierLovSelectedData)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    this.updateCurrentLineFields(supplierLovSelectedData, CurrentRecord);
  };

  // select lov update current line fields
  updateCurrentLineFields = (lovData = {}, CurrentRecord = {}) => {
    if (!CurrentRecord) {
      return;
    }

    const newLovData = lovData || {};
    const {
      supplierId = null,
      supplierNum = null,
      supplierName = null,
      supplierCompanyId = null,
      supplierCompanyName = null,
      supplierCompanyNum = null,
      name = null,
      mobilephone = null,
      mail = null,
      internationalTelCode = null,
      contactMail = null,
      contactPhone = null,
      supplierCategoryName = null,
      stageName = null,
      riskLevel = null,
      riskLevelMeaning = null,
      supplierContactId = null,
      supplierTenantId = null,
    } = newLovData || {};

    const ErrorFlag = !supplierCompanyId && !supplierId && !supplierCompanyName && !supplierName;
    if (ErrorFlag) {
      notification.warning({
        message: intl.get('hzero.common.notification.warn').d('操作异常'),
      });
      return false;
    }

    const newLineData = {
      selectSupplier: {
        ...newLovData,
        supplierCompanyNum: supplierCompanyNum || supplierNum,
        supplierCompanyId,
      },
      supplierLov: {
        ...newLovData,
        supplierCompanyNum: supplierCompanyNum || supplierNum,
        supplierCompanyId,
      },
      contactName: name,
      contactMail: mail || contactMail,
      contactMobilephone: mobilephone || contactPhone,
      mobilephone: mobilephone || contactPhone,
      supplierCompanyName: supplierCompanyName || supplierName,
      supplierCompanyNum: supplierCompanyNum || supplierNum,
      supplierNum,
      supplierId,
      internationalTelCode,
      supplierCategoryDescription: supplierCategoryName,
      stageDescription: stageName,
      supplierContactId,
      supplierTenantId,
      riskLevel,
      riskLevelMeaning,
      qualificationExpiredFlag: null,
      stageMismatchCnfFlag: null,
    };

    CurrentRecord.set(newLineData);
  };

  // supplier lov change value
  supplierLovChange = (value) => {
    const { supplierListTableDS } = this.props;
    const CurrentRecord = supplierListTableDS?.current;
    if (!CurrentRecord) {
      return;
    }

    if (!value) {
      CurrentRecord.set({
        selectSupplier: null,
        supplierLov: null,
        supplierId: null,
        supplierCompanyId: null,
        supplierName: null,
        supplierNum: null,
        supplierCompanyName: null,
        contactName: null,
        supplierContactId: null,
        contactMobilephone: null,
        // supplierType: null,
        contactMail: null,
        internationalTelCode: null,
        supplierTenantId: null,
        stageDescription: null,
        riskLevel: null,
        riskLevelMeaning: null,
        qualificationExpiredFlag: null, // 寻源的字段
        stageMismatchCnfFlag: null,
      });
    } else {
      const { supplierCompanyId, supplierCompanyName } = value || {};
      const newValue = value || {};
      if (supplierCompanyName && supplierCompanyName === supplierCompanyId) {
        newValue.supplierCompanyId = null;
      }
      newValue.qualificationExpiredFlag = null;
      newValue.stageMismatchCnfFlag = null;
      this.updateCurrentLineFields(newValue, CurrentRecord);
    }
  };

  // table columns
  getColumns() {
    const {
      rfx = {},
      header,
      rfxId,
      remoteBox,
      onLinkRiskScan = () => {},
      directionSupplierLifeManagerDetail,
      supplierLineAllotItem,
      supplierLineAllotSection,
      serviceChargeFlag = false,
      supplierListTableDS,
    } = this.props;
    const { quotationName } = rfx;
    const { enterpriceRiskControllerButtonsVisible = {} } = this.state;
    const { bidFlag = false } = rfx;
    const {
      // RELATION_MINING = 0, // 关系图谱（关系挖掘）
      RISK_SCAN = 0, // 风险扫描
      // QCC_FIND_RELATION_VARIOUS_V1 = 0, // 找关系
    } = enterpriceRiskControllerButtonsVisible || {};

    const columns = [
      {
        name: 'selectSupplier',
        width: 160,
        editor: () => {
          const { ...resetProps } = this.getSupplierLovProps() || {};
          return (
            <SupplierLov
              {...resetProps}
              dataSet={supplierListTableDS}
              valueChangeAction="input"
              restrict="\S"
            />
          );
        },
      },
      {
        name: 'supplierLov',
        width: 150,
        renderer: ({ record, text }) => {
          const supplierCompanyId = record.get('supplierCompanyId');
          return supplierCompanyId ? (
            <a onClick={() => directionSupplierLifeManagerDetail(record)}>{text}</a>
          ) : (
            text
          );
        },
      },
      {
        name: 'supplierCompanyName',
        width: 220,
        renderer: ({ text, record }) =>
          text ? (
            <Fragment>
              {record.get('qualificationExpiredFlag') === 1 && (
                <Tooltip
                  title={intl
                    .get(`ssrc.inquiryHall.view.tooltip.qualificationExpirationWarning`)
                    .d('资质到期')}
                >
                  <img src={warnIcon} alt="" style={{ marginRight: 8 }} />
                </Tooltip>
              )}
              {text}
            </Fragment>
          ) : null,
      },
      {
        name: 'supplierCategoryDescription',
      },
      {
        editor: true,
        name: 'priceCoefficient',
        width: 150,
        align: 'left',
      },
      {
        name: 'stageDescription',
        width: 150,
        renderer: ({ record, value }) => {
          const stageMismatchCnfFlag = record?.get('stageMismatchCnfFlag') || 0;
          return (
            <Tooltip
              title={
                stageMismatchCnfFlag
                  ? intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.notQuotationOrBidding`, {
                        name: quotationName,
                      })
                      .d('该供应商当前所在的生命周期阶段不可进行报价')
                  : ''
              }
            >
              <div style={{ color: stageMismatchCnfFlag === 1 && 'red' }}>{value || '-'}</div>
            </Tooltip>
          );
        },
      },
      {
        name: 'riskLevel',
        width: 120,
        renderer: ({ record, value }) => {
          return riskLevelRender(value, record.get('riskLevelMeaning'));
        },
      },
      RISK_SCAN
        ? {
            name: 'riskScan',
            width: 150,
            renderer: ({ record }) => {
              const { rfxLineSupplierId, supplierCompanyId } = record.get([
                'rfxLineSupplierId',
                'supplierCompanyId',
              ]);

              return rfxLineSupplierId ? (
                <a onClick={() => onLinkRiskScan(record)} disabled={!supplierCompanyId}>
                  {intl.get(`ssrc.inquiryHall.view.message.button.riskScan`).d('风险扫描')}
                </a>
              ) : null;
            },
          }
        : null,
      {
        name: 'contactNameLov',
        width: 150,
        editor: true,
      },
      {
        name: 'contactMobilephone',
        width: 300,
        renderer: ({ record }) => {
          return <ContactPhone name="contactMobilephone" record={record} />;
        },
      },
      {
        name: 'contactMail',
        width: 150,
        editor: true,
      },
      serviceChargeFlag && {
        name: 'bidFileExpensePaymentRule',
        width: 150,
        editor: true,
      },
      serviceChargeFlag && {
        name: 'depositPaymentRule',
        width: 150,
        editor: true,
      },
      {
        name: 'allotItem',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        lock: 'right',
        renderer: ({ record }) =>
          record.get('rfxLineSupplierId') ? (
            header.multiSectionFlag && ['RELEASE_REJECTED', 'NEW'].includes(header.rfxStatus) ? (
              <Button funcType="link" onClick={() => supplierLineAllotSection(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.allotSection`).d('分配标段')}
              </Button>
            ) : (
              <div>
                <Button funcType="link" onClick={() => supplierLineAllotItem(record)}>
                  {intl.get(`ssrc.inquiryHall.view.message.button.allotItem`).d('分配物料')}
                  &nbsp;({record.get('itemAllotCount')}/{record.get('itemTotalCount')})
                </Button>
                {record.get('itemAllotCount') === record.get('itemTotalCount') ? null : record.get(
                    'itemAllotCount'
                  ) === 0 ? (
                    <Icon type="brightness_o" style={{ color: 'gray', marginLeft: '5px' }} />
                ) : (
                  <Icon type="timelapse" style={{ color: 'gray', marginLeft: '5px' }} />
                )}
              </div>
            )
          ) : null,
      },
    ].filter(Boolean);

    return remoteBox
      ? remoteBox.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SUPPLIER_TABLE_COLUMN', columns, {
          bidFlag,
          rfxId,
          ...this.props,
        })
      : columns;
  }

  renderImportButton = (disableBtnFlag) => {
    const { organizationId, rfxId, match = {} } = this.props;
    // let allowChangeSupplyFlag = 1;
    // const IsNewInquiry = !rfxId || rfxId === 'null';
    // const ForbidAddedFlag = sourceMethod !== 'INVITE' || IsNewInquiry || allowChangeSupplyFlag || !companyId; // 禁止新增标识
    // if (rfxInfoDS.current) {
    //   allowChangeSupplyFlag =
    //     rfxInfoDS.current.get('allowChangeSupplyFlag') === 0 &&
    //     rfxInfoDS.current.get('sourceFrom') === 'PROJECT';
    // }

    const ImportProps = {
      businessObjectTemplateCode: 'SSRC.RFX_SUPPLIER.IMPORT',
      organizationId,
      prefixPatch: SRM_SSRC,
      args: {
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: rfxId,
        templateCode: 'SSRC.RFX_SUPPLIER.IMPORT',
      },
      buttonTooltip: disableBtnFlag
        ? intl.get('ssrc.common.view.message.company.save.tip').d('请先维护公司')
        : null,
      buttonProps: {
        icon: 'archive',
        funcType: 'flat',
        color: 'primary',
        disabled: disableBtnFlag,
        permissionList: [
          {
            code: `${match.path}.button.supplier-import`.toLowerCase(),
            type: 'button',
            meaning:
              intl.get(`ssrc.inquiryHall.view.message.title.RFXMaintenance`).d('编辑RFX') -
              `${intl
                .get('ssrc.inquiryHall.view.message.button.supplierImport')
                .d('供应商导入')}(New)`,
          },
        ],
      },
      buttonText: intl.get('ssrc.inquiryHall.view.message.button.supplierImport').d('供应商导入'),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      auto: true,
      successCallBack: this.batchImportOk,
      name: 'supplierImportNew',
    };

    return <CommonImportNew {...ImportProps} />;
  };

  handleSaveItem = async (ds) => {
    const res = await ds.submit();
    if (res) {
      ds.query();
    }
  };

  handleDeleteItem = async () => {
    const {
      supplierListTableDS,
      fetchQualificationWarnInfo,
      remote: supplierTableRemote,
    } = this.props;
    const data = supplierListTableDS.selected;

    let deleteSupplierConfirmMessageProps = {};
    deleteSupplierConfirmMessageProps = supplierTableRemote
      ? supplierTableRemote.process(
          'UPDATE_SUPPLIER_TABLE_DELETESUPPLIER_CONFIRMMESSAGEPROPS',
          deleteSupplierConfirmMessageProps,
          {
            that: this,
          }
        )
      : deleteSupplierConfirmMessageProps;
    deleteSupplierConfirmMessageProps = deleteSupplierConfirmMessageProps || {};

    const res = await supplierListTableDS.delete(data, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
      ...deleteSupplierConfirmMessageProps,
    });
    if (res) {
      // 获取资质到期提示
      fetchQualificationWarnInfo();
    }
  };

  // 展示风险提示
  renderRiskRelation = () => {
    const { rfxInfoDS, _timestamp = '', remote: supplierTableRemote } = this.props;
    const { current } = rfxInfoDS || {};
    const { rfxNum, secondarySourceCategory } = current?.get(['rfxNum', 'secondarySourceCategory']);

    let dom = '';
    if (current && rfxNum) {
      dom = (
        <div style={{ marginTop: '20px' }}>
          <EmbedPage
            href="/public/sdat/relation-troubleshoot"
            location={{
              search: `?businessNumber=${rfxNum}&businessType=${secondarySourceCategory}&organizationId=${getCurrentOrganizationId()}&_timestamp=${_timestamp}`,
            }}
          />
        </div>
      );
    }

    dom = supplierTableRemote
      ? supplierTableRemote.process(
          'UPDATE_SUPPLIER_TABLE_PROCESS_SUPPLIER_RENDERRISKRELATIONN_DOM',
          dom,
          {
            that: this,
            rfxInfoDS,
          }
        )
      : dom;

    return dom || null;
  };

  @Debounce(500)
  createLine = () => {
    const { rfxInfoDS, supplierListTableDS, organizationId } = this.props;

    const { current } = rfxInfoDS || {};
    if (!current) {
      return;
    }

    const { companyId, rfxHeaderId } = current ? current.get(['companyId', 'rfxHeaderId']) : {};

    const data = {
      companyId,
      rfxHeaderId,
      sourceFrom: 'RFX',
      tenantId: organizationId,
    };

    supplierListTableDS.create(data, 0);
  };

  // 虎牙--二开了
  getTableButtons() {
    const {
      organizationId,
      header,
      sourceMethod = null,
      onBulkAddSupplier,
      supplierRelationMap = () => {},
      handleBatchAllotItem,
      introducingSuppliers,
      rfxId = null,
      rfxInfoDS,
      supplierConfigOldFlag = true,
      supplierLovProps = {},
      // eslint-disable-next-line no-shadow
      remote = false,
      supplierListTableDS,
      rfx,
      itemLineTableDS,
      supplierRelationSearch = () => {},
      match,
      fetchInquiryHeader = noop,
      history,
    } = this.props;
    const { enterpriceRiskControllerButtonsVisible = {} } = this.state;
    const {
      RELATION_MINING = 0, // 关系图谱（关系挖掘）
      QCC_FIND_RELATION_VARIOUS_V1 = 0, // 找关系
    } = enterpriceRiskControllerButtonsVisible || {};
    let allowChangeSupplyFlag = 1;
    let sourceProjectId = '';
    const IsNewInquiry = !rfxId || rfxId === 'null';
    const _supplierLovQueryData = {};
    let companyId = null;
    if (rfxInfoDS.current) {
      companyId = rfxInfoDS.current.get('companyId');
      allowChangeSupplyFlag =
        rfxInfoDS.current.get('allowChangeSupplyFlag') === 0 &&
        rfxInfoDS.current.get('sourceFrom') === 'PROJECT';
      sourceProjectId = rfxInfoDS.current.get('sourceProjectId');

      _supplierLovQueryData.companyId = companyId;
    }

    const supplierLovQueryData = remote
      ? remote.process(
          'UPDATE_SUPPLIER_TABLE_PROCESS_SUPPLIER_LOV_QUERY_DATA',
          _supplierLovQueryData,
          { rfxInfoDS }
        )
      : _supplierLovQueryData;

    const ForbidAddedFlag =
      sourceMethod !== 'INVITE' || IsNewInquiry || allowChangeSupplyFlag || !companyId; // 禁止新增标识
    const CommonDisabledFlag = sourceMethod !== 'INVITE' || allowChangeSupplyFlag || IsNewInquiry;
    const { sourceKey, bidFlag } = rfx || {};

    const otherProps = {
      rfxHeaderId: rfxId,
      templateId: rfxInfoDS.current.get('templateId'),
      supplierListTableDS,
      sourceKey,
      ForbidAddedFlag,
      itemLineTableDS,
      organizationId,
      sourceMethod,
      match,
      batchImportOk: this.batchImportOk,
      rfxInfoDS,
      fetchInquiryHeader,
      IsNewInquiry,
      bidFlag,
      companyId,
      history,
      that: this,
    };

    /**
     *  RELATION_MINING：关系图谱（关系挖掘）
        RISK_SCAN：风险扫描
        QCC_FIND_RELATION_VARIOUS_V1
     *
    */

    const buttons = [
      <TooltipButtonPro
        name="add"
        icon="playlist_add"
        onClick={() => this.createLine()}
        disabled={ForbidAddedFlag}
        help={intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        name="save"
        icon="save"
        onClick={() => this.handleSaveItem(supplierListTableDS)}
        disabled={sourceMethod !== 'INVITE' || IsNewInquiry}
        help={intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')}
      >
        {intl.get(`hzero.common.button.save`).d('保存')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        name="delete"
        icon="delete_sweep"
        onClick={() => this.handleDeleteItem()}
        disabled={allowChangeSupplyFlag || isEmpty(supplierListTableDS.selected)}
        help={intl.get('ssrc.common.view.message.supplier-line.select.tip').d('请先勾选供应商行')}
      >
        {intl.get('hzero.common.button.batchdelete').d('批量删除')}
      </TooltipButtonPro>,
      supplierConfigOldFlag ? (
        <TooltipButtonPro
          name="supplierLovList"
          onClick={onBulkAddSupplier}
          icon="playlist_add"
          disabled={ForbidAddedFlag}
          help={intl.get('ssrc.common.view.message.company.save.tip').d('请先维护公司')}
        >
          {intl
            .get('ssrc.inquiryHall.model.inquiryHall.button.batchAddSupplier')
            .d('批量新增供应商')}
        </TooltipButtonPro>
      ) : (
        <TooltipButtonPro
          {...supplierLovProps}
          tooltipProps={{
            btnType: 'supplierLov',
            disabled: ForbidAddedFlag,
            help: intl.get('ssrc.common.view.message.company.save.tip').d('请先维护公司'),
          }}
          queryData={supplierLovQueryData}
          disabled={ForbidAddedFlag}
        >
          {intl
            .get('ssrc.inquiryHall.model.inquiryHall.button.batchAddSupplier')
            .d('批量新增供应商')}
        </TooltipButtonPro>
      ),
      RELATION_MINING ? (
        <TooltipButtonPro
          onClick={supplierRelationMap}
          icon="supervisor_account-o"
          disabled={CommonDisabledFlag}
          name="relationMap"
          help={intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')}
        >
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.button.RelationMap`).d('供应商关系图谱')}
        </TooltipButtonPro>
      ) : null,
      QCC_FIND_RELATION_VARIOUS_V1 ? (
        <TooltipButtonPro
          onClick={supplierRelationSearch}
          icon="relation"
          disabled={CommonDisabledFlag || supplierListTableDS.selected.length < 2}
          help={intl.get('ssrc.common.view.message.supplier.select2.tip').d('请先勾选两个供应商')}
          name="relationSearch"
        >
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.button.relationSearch`).d('找关系')}
        </TooltipButtonPro>
      ) : null,
      <TooltipButtonPro
        disabled={ForbidAddedFlag}
        onClick={this.handleBatchExport}
        icon="archive"
        name="supplierImport"
        help={intl.get('ssrc.common.view.message.company.save.tip').d('请先维护公司')}
      >
        {intl.get('ssrc.inquiryHall.view.message.button.supplierImport').d('供应商导入')}
      </TooltipButtonPro>,
      this.renderImportButton(ForbidAddedFlag),
      sourceProjectId && (
        <Button
          disabled={sourceMethod !== 'INVITE' || allowChangeSupplyFlag}
          onClick={introducingSuppliers}
          icon="root"
          name="introducingSuppliers"
        >
          {intl.get('ssrc.inquiryHall.view.message.button.introducingSuppliers').d('引入供应商')}
        </Button>
      ),
      !rfxInfoDS?.current?.get('matchRestrictFlag') ? (
        <TooltipButtonPro
          icon="auto_complete"
          onClick={handleBatchAllotItem}
          disabled={
            sourceMethod !== 'INVITE' ||
            allowChangeSupplyFlag ||
            supplierListTableDS.selected.length === 0
          }
          name="batchAllotItem"
          help={intl.get('ssrc.common.view.message.supplier-line.select.tip').d('请先勾选供应商行')}
        >
          {header.multiSectionFlag && ['RELEASE_REJECTED', 'NEW'].includes(header.rfxStatus)
            ? intl
                .get(`ssrc.inquiryHall.view.inquiryHall.button.batchAllotSection`)
                .d('批量分配标段')
            : intl.get(`ssrc.inquiryHall.view.inquiryHall.button.batchAllotItem`).d('批量分配物料')}
        </TooltipButtonPro>
      ) : null,
    ].filter(Boolean);
    return remote ? remote.process('UPDATE_SUPPLIER_TABLE_BUTTONS', buttons, otherProps) : buttons;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      customizeTable,
      custLoading,
      supplierListTableDS,
      rfx = {},
      supplierLoading = false,
      qualificationWarnInfo,
      remote: remoteFunc,
    } = this.props;
    const { supplierCompanyName, expiredCount } = qualificationWarnInfo || {};
    const { sourceKey } = rfx;

    let tableProps = {
      style: { maxHeight: 450 },
    };
    tableProps = remoteFunc
      ? remoteFunc.process('UPDATE_SUPPLIER_TABLE_PROPS', tableProps, { that: this })
      : tableProps;
    tableProps = tableProps || {};

    return (
      <React.Fragment>
        {this.renderRiskRelation()}
        {!!supplierCompanyName && (
          <Alert
            showIcon
            message={intl
              .get(`ssrc.inquiryHall.view.message.qualificationWarnInfo`, {
                supplierCompanyName,
                expiredCount,
              })
              .d(
                '{supplierCompanyName}等{expiredCount}家供应商在供应商360资质认证已到期，请确认是否邀请！'
              )}
            type="error"
            className={commonStyle['ssrc-alert-error']}
            style={{ margin: '20px 0 0 0' }}
          />
        )}
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.LINE_SUPPLIER`,
            buttonCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.LINE_SUPPLIER_BUTTONS`,
          },
          <Table
            bordered
            buttons={this.getTableButtons()}
            custLoading={custLoading || supplierLoading}
            dataSet={supplierListTableDS}
            rowKey="rfxLineSupplierId"
            columns={this.getColumns()}
            className={classnames(styles['m-t-m'])}
            {...tableProps}
          />
        )}
      </React.Fragment>
    );
  }
}
const hocSupplierTable = (NewComponent) => {
  return remote({
    code: 'UPDATE_SUPPLIER_TABLE',
    name: 'remote',
  })(observer(NewComponent));
};
const SupplierListTable = hocSupplierTable(SupplierTable);

export default SupplierListTable;

export { hocSupplierTable, SupplierTable };
