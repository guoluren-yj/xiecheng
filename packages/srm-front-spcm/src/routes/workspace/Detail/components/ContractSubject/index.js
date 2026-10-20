import React, { Component, Fragment } from 'react';
import { Button, Lov, Modal as c7nModal, DataSet, Tooltip } from 'choerodon-ui/pro';
import { Icon, Badge, Popover, Alert } from 'choerodon-ui';

import { withRouter } from 'react-router-dom';
import querystring from 'querystring';
import { Bind, Throttle, debounce } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isEmpty, isNumber, isNil } from 'lodash';
import moment from 'moment';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { useModal } from 'components/Import';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { renderThousandthNum, validateDoubleUom, getAttributeFields, handlePurchaseNeedDTOs } from '@/utils/util';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN } from 'utils/constants';
import CommonImport from 'hzero-front/lib/components/Import';
import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';
import DocFlow from '_components/DocFlow';
import FilterBarTable from '_components/FilterBarTable';

import {
  saveSubject,
  sourceCreate,
  verified,
  checkCreatePo,
} from '@/services/contractMaintainService';
import {
  queryExchangeRates,
  queryExchangeRateTypes,
  fetchPriceLibValidPrice,
  fetchExchangeRate,
  getRelationDocControl,
  getRecommendSupplierFlag,
  getImportTemplateCode,
} from '@/services/contractCommonService';
import { batchQueryPrice } from '@/services/newContractService';
import OccupyModal from '@/routes/workspace/Component/Modal/OccupyModal';
import { renderCompareColumns, extTextRender, renderStatus } from '@/utils/renderer';
import { openC7nPriceModal } from '@/routes/components/C7nPriceModal';
import { getHeaderParams } from '@/routes/components/C7nPriceModal/util';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import ApplicationScope from '@/routes/components/ContractSubject/ApplicationOrganization';
import ExecutiveOrderRecord from '@/routes/components/ExecutiveOrderRecord';
import showLadderQuote from './LadderQuote';
import BatchMaintainItemDS from './BatchMaintainItemDS';
import BatchMaintainItemForm from './BatchMaintainItemForm';

import SubjectInfo from './SubjectInfo';
import { handleUnitPrice } from '../../utils/utils';

import styles from '../../index.less';

const tenantId = getCurrentOrganizationId();

@withRouter
export default class ContractSubject extends Component {
  state = {
    relationDoc: {},
    prLineImport: false,
  };

  exchangeRateMap = new Map();

  componentDidMount() {
    this.fetchRelationDocControl();
    this.getRecommendSupplierFlag();
  }

  /**
   * 单据流、执行单据业务规则是否开启
   */
  @Bind()
  async fetchRelationDocControl() {
    const res = getResponse(await getRelationDocControl());
    if (res) {
      this.setState({ relationDoc: res });
    }
  }

  @Bind()
  async getRecommendSupplierFlag() {
    const {
      editable,
      headerInfo: { pcSourceCode },
    } = this.props;
    if (editable && pcSourceCode === 'PURCHASE_NEED') {
      const res = getResponse(await getRecommendSupplierFlag());
      this.setState({ prLineImport: res === 1 });
    }
  }

  @Bind()
  onPreDelete() {
    const { checkModified } = this.props;
    if (checkModified()) {
      this.handleDelete();
    } else {
      c7nModal.confirm({
        key: c7nModal.key(),
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get(`spcm.common.view.message.title.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => {
          this.handleDelete();
        },
      });
    }
  }

  @Bind()
  handleGetCode() {
    const {
      match: { path },
      location: { search },
      custCode,
      remoteWorkDetail,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    const cuxCustCode = remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_SUBJECT_CUSTCODE', custCode, {
          ...this.props,
        })
      : custCode;
    if (cuxCustCode) {
      return cuxCustCode;
    }
    if (
      path.includes('/spcm/contract-workspace/update') ||
      routerParams.hasChanged === 'true' ||
      path.includes('/spcm/contract-workspace/intelligent/')
    ) {
      return 'SPCM.WORKSPACE_DETAIL.SUBJECT';
    } else {
      return 'SPCM.WORKSPACE_DETAIL.SUBJECT.READONLY';
    }
  }

  /**
   * 新增行-手工新建
   */
  @Bind()
  async handleCreate() {
    const {
      headerInfo,
      headerInfo: {
        supplierCurrencyCode = 'CNY',
        purchaseCurrencyCode = 'CNY',
        signEffectFlag,
        priceType,
      },
      headerFormDs,
      remoteWorkDetail,
    } = this.props;
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxContractSubjectAdd', {
        headerInfo,
      });
      if (!res) {
        return;
      }
    }
    const currencyProps = {
      currencyCode: supplierCurrencyCode,
      supplierCurrencyCode,
      purchaseCurrencyCode,
      priceType,
    };
    const remoteCurrencyProps = remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_CURRENCY_PROPS', currencyProps, {
          headerInfo,
        })
      : currencyProps;
    if (signEffectFlag === 0) {
      remoteCurrencyProps.priceStartDate = headerFormDs.current.get('startDateActive');
      remoteCurrencyProps.priceEndDate = headerFormDs.current.get('endDateActive');
    }
    const originData = {
      currencyCode: 'CNY',
      purchaseCurrencyCode: 'CNY',
      ...remoteCurrencyProps,
    };
    const cuxOriginData = remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_SUBJECT_CREATE', originData, this.props)
      : {};
    this.props.pcSubjectDs.create(
      {
        ...originData,
        ...cuxOriginData,
      },
      0
    );
    this.handleChangeCurrencyCode(
      'currencyCode',
      {
        ...originData,
        ...cuxOriginData,
      },
      this.props.pcSubjectDs.get(0)
    );
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const {
      pcSubjectDs,
      pcHeaderId,
      onFetchHeader,
      onFetchTableList,
      headerInfo: { priceType },
      remoteWorkDetail,
      onSaveLineAfter,
    } = this.props;
    const flag = await pcSubjectDs.validate();
    const pcSubjectDetailDTOList = await pcSubjectDs.toData();

    /**
     * 由于数量这种decimal字段在数据库限制最大长度为10个整数+10个小数
     * 导致在压力测试下，不仅需要对单个字段做长度限制
     * 还要对累乘结果作判断；否则很容易超出数据库限制长度导致抛出异常信息
     */
    const maxMutiplyNum = pcSubjectDetailDTOList.reduce((total, item) => {
      const price = priceType === 'TAX_INCLUDED_PRICE' ? item.taxIncludedUnitPrice : item.unitPrice;
      return total + item.quantity * price;
    }, 0);
    if (maxMutiplyNum > 99999999999999999999.9999999999) {
      notification.warning({
        message: intl
          .get(`spcm.common.view.message.title.new.maxMutiplyNum`)
          .d('【数量*含税单价】计算得出结果超出数据库长度【99999999999999999999.9999999999】！'),
      });
      return;
    }
    if (flag) {
      let params = {
        pcHeaderId,
        customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.SUBJECT',
        ...pcSubjectDetailDTOList,
      };
      if (remoteWorkDetail) {
        params = await remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_SUBJECT_SAVE', params, {
          current: this,
        });
        if (!params) {
          return;
        }
      }
      const response = getResponse(await saveSubject(params));
      if (response) {
        notification.success();
        onFetchHeader().then(() => {
          onFetchTableList(pcSubjectDs, 'SPCM.WORKSPACE_DETAIL.SUBJECT');
          if (onSaveLineAfter) {
            onSaveLineAfter();
          }
        });
      }
    }
  }

  /**
   * 删除
   */
  @Bind()
  async handleDelete() {
    const { pcSubjectDs, onFetchHeader, remoteWorkDetail } = this.props;
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleBeforeDeleteSubjectLines', {
        current: this,
      });
      if (!res) return;
    }
    const selectedRows = pcSubjectDs.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    pcSubjectDs.remove(newAddRows);
    // 删除线上数据
    const res = await pcSubjectDs.delete(existedRows, {
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
    if (res && !res.failed) {
      onFetchHeader();
      // onFetchTableList(pcSubjectDs, 'SPCM.WORKSPACE_DETAIL.SUBJECT');
    }
  }

  @Bind()
  async handleChangeItem(lovRecord, record) {
    const {
      doubleUomFlag,
      pcHeaderId,
      headerInfo: { priceType, pcSourceCode },
      pcSubjectDs,
      remoteWorkDetail,
    } = this.props;
    if (!lovRecord) {
      if (remoteWorkDetail?.event) {
        const res = await remoteWorkDetail.event.fireEvent('handleChangeItemClear', {
          current: this,
        });
        console.log('handleChangeItemClear', res);
        if (!res) return;
      }
      record.set({
        [priceType === 'TAX_INCLUDED_PRICE' ? 'taxIncludedUnitPrice' : 'unitPrice']: '',
      });
      return;
    }
    const {
      itemName = null,
      primaryUomId = null,
      taxId = null,
      taxCode = null,
      taxRate = null,
      uomName = null,
      uomCode = null,
      uomId,
      partnerItemId = null,
      orderUomName = null,
      orderUomId = null,
      orderUomCode = null,
      specifications = null,
      model = null,
      categoryId = null,
      categoryCode = null,
      categoryName = null,
      brand = null,
      itemId,
      itemCode,
      uomCodeAndName,
      secondaryUomId,
    } = lovRecord;
    // 启用双单位配置了订单模块开启：如果返回的【单位】和订单行【基本单位】不一致,界面报错
    const doubleUnitEnabled = pcSubjectDs.getState('doubleUnitEnabled');
    fetchPriceLibValidPrice({
      ...record.toData(),
      priceLibId: null,
      pcHeaderId,
      itemId,
      itemCode,
      uomId,
      secondaryUomId,
      pcSourceCode,
      invOrganizationId: record.get('invOrganizationId'),
    }).then((res) => {
      const unitPriceObj = {};
      let attributeFields = {};
      if (res) {
        if (!validateDoubleUom({ doubleUnitEnabled, priceUomId: res?.uomId, uomId })) return;
        const {
          taxIncludedUnitPrice,
          unitPrice,
          taxIncludedSecondaryUnitPrice,
          secondaryUnitPrice,
          unitPriceBatch,
        } = res || {};
        const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
        unitPriceObj[hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice'] = hasTaxInclude
          ? taxIncludedUnitPrice
          : unitPrice;
        unitPriceObj.benchmarkPrice = hasTaxInclude ? taxIncludedUnitPrice : unitPrice;
        if (!isNil(unitPriceBatch)) {
          unitPriceObj.unitPriceBatch = unitPriceBatch;
        }
        if (doubleUnitEnabled) {
          unitPriceObj[
            hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice'
          ] = hasTaxInclude ? taxIncludedSecondaryUnitPrice : secondaryUnitPrice;
          unitPriceObj.benchmarkPrice = hasTaxInclude
            ? taxIncludedSecondaryUnitPrice
            : secondaryUnitPrice;
        }
        attributeFields = getAttributeFields(res);
      }
      let fields = {
        ...attributeFields,
        itemName,
        taxId,
        taxRate,
        taxCode,
        uomName: doubleUomFlag && orderUomName ? orderUomName : uomName,
        uomCodeAndName,
        uomCode: doubleUomFlag && orderUomCode ? orderUomCode : uomCode,
        uomId: doubleUomFlag && orderUomId ? orderUomId : primaryUomId,
        itemId: partnerItemId,
        specifications,
        model,
        categoryId,
        categoryCode,
        categoryName,
        brand,
        uomIdLov: {
          uomId: doubleUomFlag && orderUomId ? orderUomId : primaryUomId,
          uomName: doubleUomFlag && orderUomName ? orderUomName : uomName,
          uomCodeAndName,
          uomCode: doubleUomFlag && orderUomCode ? orderUomCode : uomCode,
        },
        ...unitPriceObj,
      };
      if (remoteWorkDetail?.process) {
        fields = remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_SUBJECT_CHANGE_ITEM_FIELDS',
          fields,
          {
            record,
            current: this,
          }
        );
      }
      if (!brand) delete fields.brand;
      Object.keys(fields).forEach((item) => {
        record.set(item, fields[item]);
      });
    });
  }

  /**
   * 修改项目编码回调
   */
  @Bind()
  handleChangeProjectNum(lovRecord, record) {
    if (lovRecord) {
      const { projectName } = lovRecord;
      const fields = {
        projectName,
      };
      record.set(fields);
    }
  }

  // 改变本币或原币时,修改汇率
  @Bind()
  handleChangeCurrencyCode(type, lovRecord, record) {
    const isCurrencyCode = type === 'currencyCode';
    const compareCurrencyCode =
      (isCurrencyCode && record.get('purchaseCurrencyCode')) || record.get('currencyCode');
    if (lovRecord) {
      const { currencyCode = null } = lovRecord;
      const fromCurrencyCode = isCurrencyCode ? currencyCode : compareCurrencyCode;
      const toCurrencyCode = isCurrencyCode ? compareCurrencyCode : currencyCode;
      const cacheExchangeRate = this.exchangeRateMap.get(`${fromCurrencyCode}-${toCurrencyCode}`);
      if (cacheExchangeRate) {
        record.set(cacheExchangeRate);
        return;
      }
      if (compareCurrencyCode === currencyCode) {
        record.set({ exchangeRate: 1 });
        this.exchangeRateMap.set(`${fromCurrencyCode}-${toCurrencyCode}`, { exchangeRate: 1 });
      } else {
        fetchExchangeRate({
          tenantId,
          fromCurrencyCode,
          toCurrencyCode,
          rateDate: moment(new Date()).format(DEFAULT_DATE_FORMAT),
        }).then((res) => {
          let exchangeRate = null;
          let disableChangeRate = false;
          if (res && res?.length === 1) {
            exchangeRate = res[0]?.rate;
            disableChangeRate = res[0]?.rateMethodCode === 'FR';
          }
          record.set({ exchangeRate, disableChangeRate });
          this.exchangeRateMap.set(`${fromCurrencyCode}-${toCurrencyCode}`, {
            exchangeRate,
            disableChangeRate,
          });
        });
      }
    }
  }

  /**
   * 协议标的批量导入
   */
  @Bind()
  handleImport() {
    const { pcHeaderId } = this.props;
    openTab({
      key: '/spcm/contract-subject/data-import/SPCM.PC_SUBJECT_IMPORT',
      path: '/spcm/contract-subject/data-import/SPCM.PC_SUBJECT_IMPORT',
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: querystring.stringify({
        sync: true,
        action: 'hzero.common.title.batchImport',
        backPath: `/spcm/contract-workspace/update/${pcHeaderId}`,
        args: JSON.stringify({ pcHeaderId, workbenchFlag: '1' }),
      }),
    });
  }

  /**
   * 标的批量导入
   */
  @Bind()
  async handleNewImport() {
    const { openModal } = useModal();
    const { headerFormDs, pcSubjectDs, pcHeaderId } = this.props;
    this.setState({ importLoading: true });
    const res = getResponse(await getImportTemplateCode(headerFormDs.current?.toJSONData() || {}));
    this.setState({ importLoading: false });
    if (res) {
      openModal({
        refreshButton: true,
        prefixPatch: '/spcm',
        businessObjectTemplateCode: res || 'SPCM.PC_SUBJECT_IMPORT',
        args: {
          pcHeaderId,
        },
        buttonProps: {
          type: 'c7n-pro',
          icon: 'archive',
        },
        successCallBack: () => {
          pcSubjectDs.query();
        },
      });
    }
  }

  // 查看适用范围
  @debounce(1500)
  viewApplicationOrgModal = (sourceAppScopeLineDTOs) => {
    const modalKey = c7nModal.key();
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScope sourceAppScopeLineDTOs={sourceAppScopeLineDTOs} />,
      footer: null,
      style: { width: '1000px' },
    });
  };

  /**
   * 行数据处理
   * @param {object} row 行属性
   * @param {object} record 行
   * @returns
   */
  @Bind()
  onRowHandle(row, record, name) {
    const { intelligent } = this.props;
    const handleSelect = ({ dataSet, record: _record }) => {
      if (dataSet && _record) {
        dataSet.select(_record);
      }
    };
    return {
      onClick: () => handleSelect(row),
      onDoubleClick: () => {
        if (row?.record?.selectable && !intelligent) {
          handleSelect(row);
          record.set({
            [name]: row?.record?.toData(),
          });
          c7nModal.destroyAll();
        }
      },
    };
  }

  /**
   * 显示执行单据模态框
   * @param phId 需要展示执行单据的标的行id
   */
  @Bind()
  handleControlDocumentModal(phId) {
    c7nModal.open({
      closable: true,
      drawer: true,
      movable: false,
      key: c7nModal.key(),
      title: intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据'),
      style: {
        width: 1090,
        // right: 0,
      },
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
      children: <ExecutiveOrderRecord pcSubjectId={phId} />,
    });
  }

  renderColumns() {
    const {
      editable,
      headerInfo: {
        pcSourceCode,
        priceType = 'NONE',
        amountControlDimension,
        manuallyModifyAmount,
      },
      currentMode = null,
      pcSubjectDs,
      docLinkFlag = 0,
      differeFlag,
      remoteWorkDetail,
      intelligent,
    } = this.props;
    const { relationDoc } = this.state;
    const doubleUnitEnabled = pcSubjectDs.getState('doubleUnitEnabled');
    // 当为引用订单创建时
    const onlyReadFlag = pcSourceCode === 'PURCHASE_ORDER' || pcSourceCode === '采购订单';
    // 当为true时价格批量不可编辑
    const unitPriceBatchFlag = [
      'SEARCH_SOURCE_RESULT',
      'PURCHASE_ORDER',
      '寻源结果',
      '采购订单',
    ].includes(pcSourceCode);
    const showDiff = currentMode === 'current' || currentMode === 'history';
    let columns = [
      differeFlag && {
        name: 'objectFlagMeaning',
        width: 120,
        renderer: ({ record, value }) => renderStatus(record.get('objectFlag'), value, 'change'),
      },
      {
        name: 'lineNum',
        width: 80,
        renderer: ({ record = {} }) => (
          <div>
            {showDiff && record.get('objectFlag') === 'CREATE' ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.newLine').d('新增行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('objectFlag') === 'DELETE' ? (
              <Popover
                content={intl.get('hzero.common.button.deleteLine').d('删除行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('objectFlag') === 'UPDATE' ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.infoChange').d('信息更改')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {record.get('lineNum')}
          </div>
        ),
      },
      {
        name: 'projectTaskId',
        width: 180,
        compareValue: 'projectTaskName',
        formType: 'Lov',
        editor: (record) =>
          editable && // 协议来源是手工创建或者协议来源是申请/寻源/订单/外部系统时，上游数据项目任务无值可编辑
          record.get('projectTaskEditFlag') !== 0 && (
            <Lov
              editor
              name="projectTaskId"
              dataSet={this.props.pcSubjectDs}
              tableProps={{
                mode: 'tree',
                selectionMode: 'rowbox',
                onRow: (row) => this.onRowHandle(row, record, 'projectTaskId'),
              }}
            />
          ),
      },
      {
        name: 'itemCodeLov',
        width: 180,
        formType: 'Lov',
        editor: (record) =>
          editable &&
          !onlyReadFlag && (
            <Lov onChange={(lovRecord) => this.handleChangeItem(lovRecord, record)} />
          ),
        compareValue: 'itemCode',
      },
      {
        name: 'itemName',
        width: 150,
        editor: editable && !onlyReadFlag,
        formType: 'TextField',
      },
      {
        name: 'invOrganizationIdLov',
        width: 220,
        editor: editable && !onlyReadFlag,
        compareValue: 'invOrganizationName',
        formType: 'Lov',
      },
      {
        name: 'categoryIdLov',
        width: 150,
        compareValue: 'categoryName',
        formType: 'Lov',
        editor: (record) =>
          editable &&
          !onlyReadFlag && (
            <Lov
              editor
              name="categoryIdLov"
              dataSet={this.props.pcSubjectDs}
              tableProps={{
                mode: 'tree',
                selectionMode: 'rowbox',
                onRow: (row) => this.onRowHandle(row, record, 'categoryIdLov'),
              }}
            />
          ),
      },
      {
        name: 'specifications',
        width: 120,
        formType: 'TextField',
        editor: editable && !onlyReadFlag,
      },
      {
        name: 'model',
        width: 120,
        formType: 'TextField',
        editor: editable && !onlyReadFlag,
      },
      {
        name: 'uomIdLov',
        width: 140,
        editor: editable && !onlyReadFlag && !doubleUnitEnabled,
        compareValue: 'uomName',
        aiIconFieldCode: 'uomName', // ai标展示标识编码
        formType: 'Lov',
        renderer: ({ value }) => value?.uomCodeAndName || value?.uomName,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 140,
        editor: editable && !onlyReadFlag,
        compareValue: 'secondaryUomCodeAndName',
        aiIconFieldCode: 'secondaryUomName', // ai标展示标识编码
        formType: 'Lov',
      },
      {
        name: 'quantity',
        width: 120,
        editor: editable && !onlyReadFlag && !doubleUnitEnabled,
        formType: 'NumberField',
        renderer: ({ value }) => renderThousandthNum(value),
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 120,
        editor: editable && !onlyReadFlag,
        renderer: ({ value }) => renderThousandthNum(value),
        formType: 'NumberField',
      },
      {
        name: 'taxIdLov',
        width: 150,
        editor: editable && !onlyReadFlag,
        compareValue: 'taxCode',
        formType: 'Lov',
        aiIconFieldCode: 'taxCode',
      },
      {
        name: 'taxRate',
        width: 120,
        formType: 'NumberField',
      },
      {
        name: 'unitPriceBatch',
        width: 130,
        editor: editable && !unitPriceBatchFlag && !doubleUnitEnabled,
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'currencyCodeLov',
        width: 120,
        editor: (record) =>
          editable &&
          !onlyReadFlag && (
            <Lov
              onChange={(lovRecord) =>
                this.handleChangeCurrencyCode('currencyCode', lovRecord, record)
              }
            />
          ),
        compareValue: 'currencyCode',
        formType: 'Lov',
      },
      {
        name: 'purchaseCurrencyCodeLov',
        width: 120,
        editor: (record) =>
          editable &&
          !onlyReadFlag && (
            <Lov
              onChange={(lovRecord) =>
                this.handleChangeCurrencyCode('purchaseCurrencyCode', lovRecord, record)
              }
            />
          ),
        compareValue: 'purchaseCurrencyCode',
      },
      {
        name: 'exchangeRate',
        width: 160,
        editor: (record) =>
          editable && record.get('purchaseCurrencyCode') !== record.get('currencyCode'),
      },
      {
        name: 'priceType',
        width: 120,
        renderer: ({ record }) => record.get('priceTypeMeaning'),
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 150,
        formType: 'NumberField',
        editor: (record) =>
          editable &&
          !onlyReadFlag &&
          !doubleUnitEnabled &&
          ['TAX_INCLUDED_PRICE', 'NONE'].includes(record.get('priceType') || priceType) && (
            <C7nPrecisionInputNumber
              name="taxIncludedUnitPrice"
              record={record}
              currency="currencyCode"
            />
          ),
        renderer: ({ value }) => renderThousandthNum(value),
      },
      doubleUnitEnabled && {
        name: 'taxIncludedSecondaryUnitPrice',
        width: 150,
        formType: 'NumberField',
        editor: (record) =>
          editable &&
          !onlyReadFlag &&
          ['TAX_INCLUDED_PRICE', 'NONE'].includes(record.get('priceType') || priceType) && (
            <C7nPrecisionInputNumber
              name="taxIncludedSecondaryUnitPrice"
              record={record}
              currency="currencyCode"
            />
          ),
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'purchaseTaxIncludedPrice',
        width: 150,
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'unitPrice',
        width: 150,
        formType: 'NumberField',
        editor: (record) =>
          editable &&
          !onlyReadFlag &&
          !doubleUnitEnabled &&
          ['NET_PRICE', 'NONE'].includes(record.get('priceType') || priceType) && (
            <C7nPrecisionInputNumber name="unitPrice" record={record} currency="currencyCode" />
          ),
        renderer: ({ value }) => renderThousandthNum(value),
      },
      doubleUnitEnabled && {
        name: 'secondaryUnitPrice',
        width: 150,
        formType: 'NumberField',
        editor: (record) =>
          editable &&
          !onlyReadFlag &&
          ['NET_PRICE', 'NONE'].includes(record.get('priceType') || priceType) && (
            <C7nPrecisionInputNumber
              name="secondaryUnitPrice"
              record={record}
              currency="currencyCode"
            />
          ),
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'taxIncludedLineAmount',
        width: 150,
        formType: 'NumberField',
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'purchaseTaxLineAmount',
        width: 150,
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'lineAmount',
        width: 160,
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'taxAmount',
        width: 120,
        formType: 'NumberField',
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'taxIncludedUnitPriceChinese',
        width: 150,
      },
      {
        name: 'purchaseTaxIncludedPriceChinese',
        width: 150,
      },
      {
        name: 'taxIncludedLineAmountChinese',
        width: 150,
      },
      {
        name: 'purchaseTaxLineAmountChinese',
        width: 150,
      },
      {
        name: 'taxAmountChinese',
        width: 150,
      },
      {
        name: 'unitPriceChinese',
        width: 150,
      },
      {
        name: 'lineAmountChinese',
        width: 150,
      },
      {
        name: 'priceStartDate',
        width: 200,
        formType: 'DatePicker',
        editor: editable,
      },
      {
        name: 'priceEndDate',
        width: 200,
        formType: 'DatePicker',
        editor: editable,
      },
      {
        name: 'ladderQuote',
        width: 100,
        renderer: ({ record }) =>
          record.status !== 'add' ? (
            <a
              onClick={() =>
                showLadderQuote({
                  editable,
                  doubleUnitEnabled,
                  quotePcSubject: record.toData(),
                  itemCode: record.get('itemCode'),
                  pcSubjectId: record.get('pcSubjectId'),
                  priceType: record.get('priceType'),
                  currencyCode: record.get('currencyCode'),
                })
              }
            >
              {intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格')}
            </a>
          ) : (
            '-'
          ),
      },
      {
        name: 'deliverDate',
        width: 200,
        editor: editable,
      },
      {
        name: 'guaranteePeriod',
        width: 150,
        editor: editable,
      },
      {
        name: 'packages',
        width: 150,
        editor: editable,
      },
      {
        name: 'manufacturer',
        width: 150,
        editor: editable,
      },
      {
        name: 'brand',
        width: 150,
        editor: editable,
      },
      {
        name: 'itemProperties',
        width: 180,
        editor: editable,
      },
      {
        name: 'agentIdLov',
        width: 180,
        editor: editable,
        formType: 'Lov',
        compareValue: 'agentName',
      },
      {
        name: 'keeperUserIdLov',
        width: 180,
        editor: editable,
        formType: 'Lov',
        compareValue: 'keeperUserName',
      },
      {
        name: 'accepterUserIdLov',
        width: 180,
        editor: editable,
        formType: 'Lov',
        compareValue: 'accepterUserName',
      },
      {
        name: 'expBearDepIdLov',
        width: 180,
        editor: editable,
        formType: 'Lov',
        compareValue: 'expBearDep',
      },
      {
        name: 'address',
        width: 180,
        editor: editable,
      },
      {
        name: 'projectNumLov',
        width: 180,
        formType: 'Lov',
        editor: (record) =>
          editable &&
          !onlyReadFlag && (
            <Lov onChange={(lovRecord) => this.handleChangeProjectNum(lovRecord, record)} />
          ),
        compareValue: 'projectNum',
      },
      {
        name: 'projectName',
        width: 180,
      },
      {
        name: 'contractActualSource',
        width: 120,
        renderer: ({ record }) => record.get('contractActualSourceMeaning'),
      },
      {
        name: 'remark',
        width: 180,
        editor: editable,
      },
      {
        name: 'benchmarkPrice',
        width: 150,
      },
      !Number(docLinkFlag) && {
        // 单据流中使用时不显示 单据流字段。
        name: 'documentFlow',
        hidden: ![1, '1'].includes(relationDoc?.displayDocFlow),
        width: 100,
        renderer: ({ record }) => {
          return record.get('pcSubjectId') ? (
            <DocFlow
              tableName="spcm_pc_subject"
              tablePk={record.get('pcSubjectId')}
              buttonType="button"
            />
          ) : (
            '-'
          );
        },
      },
      amountControlDimension === 'LINE' &&
        manuallyModifyAmount === '1' && {
          name: 'lineMaxContractAmount',
          width: 160,
          editor: editable && amountControlDimension === 'LINE' && manuallyModifyAmount === '1',
        },
      amountControlDimension === 'LINE' && {
        name: 'taxIncludeLineOccupiedAmount',
        width: 170,
      },
      amountControlDimension === 'LINE' && {
        name: 'lineOccupiedAmount',
        width: 170,
      },
      amountControlDimension === 'LINE' && {
        name: 'occupyRecords',
        width: 120,
        renderer: ({ record }) =>
          record.get('pcSubjectId') ? <OccupyModal record={record} /> : '-',
      },
      amountControlDimension === 'LINE' && {
        name: 'orderOccupiedLineAmountRatio',
        width: 200,
      },
    ].filter(Boolean);

    const sourceResultColumn = [
      {
        name: 'sourceAppScopeLineDTOs',
        width: 120,
        renderer: ({ record }) => (
          <a
            onClick={() => this.viewApplicationOrgModal(record.get('sourceAppScopeLineDTOs'))}
            disabled={!record.get('sourceAppScopeLineDTOs')}
          >
            {intl
              .get('ssrc.inquiryHall.model.inquiryHall.applicationOrganization')
              .d('适用其他组织')}
          </a>
        ),
      },
    ];
    const extraColumns = [
      {
        name: 'referPrice',
        width: 150,
        renderer: ({ record }) => (
          <a
            // disabled={!editable || onlyReadFlag}
            onClick={() => this.handleClickReferPrice(record, !editable || onlyReadFlag)}
          >
            {intl.get('spcm.common.model.common.referPrice').d('参考价格')}
          </a>
        ),
      },
    ];
    switch (pcSourceCode) {
      case 'SEARCH_SOURCE_RESULT':
        columns = columns.concat(sourceResultColumn);
        break;
      case 'PURCHASE_NEED':
      case 'MANUALLY':
        columns = columns.concat(extraColumns);
        break;
      default:
        break;
    }
    let maintainEditableAddColumn = [
      {
        name: 'sourceCode',
        width: 120,
        renderer: ({ record }) => {
          const { sourceCode, sourceLineNum, sourceDisplayLineNum } =
            record.get(['sourceCode', 'sourceLineNum', 'sourceDisplayLineNum', 'pcSourceCode']) ||
            {};
          const newSourceLineNum =
            pcSourceCode === 'PURCHASE_NEED' ? sourceDisplayLineNum : sourceLineNum;
          if (!sourceCode && !newSourceLineNum) {
            return null;
          }
          return `${sourceCode || ''}-${newSourceLineNum || ''}`;
        },
      },
      // {
      //   name: 'sourceLineNum',
      //   width: 120,
      // },
    ];
    if (!editable) {
      const outOfMaintain = [
        {
          name: 'receiptsStatusMeaning',
          width: 120,
        },
        {
          name: 'soureNum',
          hidden: ![1, '1'].includes(relationDoc?.displayDoc),
          width: 120,
          renderer: ({ record }) => (
            <a onClick={() => this.handleControlDocumentModal(record.get('pcSubjectId'))}>
              {intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据')}
            </a>
          ),
        },
        {
          name: 'execteLineNum',
          width: 120,
        },
        {
          name: 'occupancyRecords',
          width: 120,
          // 预算类型,1代表行生成预算，2代表头生成预算，0代表没有生成
          renderer: ({ record }) =>
            ['1', '2'].includes(record?.get('budgetType')) && (
              <BudgetModal
                documentType="PC"
                docLineId={
                  record?.get('budgetType') === '1'
                    ? record?.get('pcSubjectId')
                    : record?.get('pcHeaderId')
                }
              />
            ),
        },
      ];
      maintainEditableAddColumn = maintainEditableAddColumn.concat(outOfMaintain);
    }
    columns = columns.concat(maintainEditableAddColumn).filter(Boolean);

    const modeCoumns = renderCompareColumns(columns, { currentMode, differeFlag, intelligent });
    return remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_SUBJECT_RENDER_COLUMNS', modeCoumns, {
          current: this,
        })
      : modeCoumns;
  }

  /**
   *  点击参考价格
   */
  @Bind()
  handleClickReferPrice(record, viewOnlyFlag = false) {
    const { headerFormDs } = this.props;
    const headerParams = getHeaderParams(headerFormDs.current?.toJSONData() || {});
    const params = {
      // customizeTable,
      record,
      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.SUBJECT.REFERENCE_PRICE',
      queryParams: {
        ...headerParams,
        ...record.toJSONData(),
      },
      onOk: (priceTableDs) => {
        this.handleChangePrice(priceTableDs);
      },
      viewOnlyFlag,
    };
    openC7nPriceModal(params);
  }

  /**
   *  根据参考价格修改行上相关信息
   */
  @Bind()
  handleChangePrice(priceTableDs) {
    const { pcSubjectDs, headerInfo } = this.props;
    const { selected } = priceTableDs;
    const { priceType } = headerInfo;
    if (isEmpty(selected)) return;
    const data = selected[0].toJSONData();
    const record = pcSubjectDs.current;
    const doubleUnitEnabled = pcSubjectDs.getState('doubleUnitEnabled');
    const {
      taxRate,
      taxId,
      taxCode,
      currencyCode,
      uomId,
      uomCode,
      uomName,
      uomPrecision,
      uomCodeAndName,
      taxPrice,
      unitPrice,
    } = data;
    // 开启双单位
    if (!validateDoubleUom({ doubleUnitEnabled, priceUomId: uomId, uomId: record.get('uomId') })) {
      return false;
    }
    // 判断基准价
    const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
    let priceField = hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice';
    let uomField = 'uomIdLov';
    let uomObj = {
      uomId,
      uomCode,
      uomName,
      uomPrecision,
      uomCodeAndName,
    };

    if (doubleUnitEnabled) {
      priceField = hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice';
      uomField = 'secondaryUomId';
      uomObj = {
        ...uomObj,
        uomPrecision: undefined,
        secondaryUomPrecision: uomPrecision,
      };
    }

    record.set({
      taxIdLov: {
        taxRate,
        taxId,
        taxCode,
      },
      currencyCodeLov: {
        currencyCode,
      },
      [uomField]: uomObj,
      [priceField]: hasTaxInclude ? taxPrice : unitPrice,
    });
    // 修改币种触发事件
    this.handleChangeCurrencyCode('currencyCode', { currencyCode }, record);
  }

  /**
   *  获取当前日期下的汇率定义
   */
  @Bind()
  async getERateValues() {
    const params = {
      rateDate: moment(new Date()).format(DATETIME_MIN),
      enabledFlag: 1,
    };
    const res1 = getResponse(await queryExchangeRates(params));
    let exchangeRates = [];
    if (res1 && res1.content) {
      exchangeRates = res1.content;
    }
    const res2 = getResponse(await queryExchangeRateTypes(params));
    let exchangeRateTypes = [];
    if (res2 && res2.content) {
      exchangeRateTypes = res2.content;
    }
    exchangeRateTypes = new Map(exchangeRateTypes.map((type) => [type.typeCode, type]));
    console.log(exchangeRateTypes);
    console.log(exchangeRates);
    const rates = exchangeRates.reduce(
      (rats, { fromCurrencyCode, toCurrencyCode, rate, rateTypeCode }) => {
        return Object.assign(rats, {
          [fromCurrencyCode]: {
            ...rats[fromCurrencyCode],
            [toCurrencyCode]: {
              rate,
              rateMethodCode: exchangeRateTypes.get(rateTypeCode)?.rateMethodCode,
            },
          },
        });
      },
      {}
    );
    return rates;
  }

  // 标的批量维护
  @Bind()
  handleBatchMaintain() {
    const {
      pcSubjectDs,
      customizeForm,
      headerInfo: { pcSourceCode },
    } = this.props;
    // 当为引用订单创建时
    const onlyReadFlag = pcSourceCode === 'PURCHASE_ORDER';
    const batchMaintainItemDS = new DataSet(BatchMaintainItemDS(onlyReadFlag));

    // 批量操作ok
    const batchMaintain = async () => {
      const NewData = batchMaintainItemDS?.current?.toData() || {};
      const SelectedItems = isEmpty(pcSubjectDs.currentSelected)
        ? pcSubjectDs
        : pcSubjectDs.currentSelected;
      const keys = Object.keys(NewData);

      // 获取实时汇率表
      const isCurrencyCode = ['currencyCode', 'purchaseCurrencyCode'].some((item) => {
        return NewData[item];
      });
      let rateValues = {};
      if (isCurrencyCode) {
        rateValues = await this.getERateValues();
      }

      SelectedItems.forEach((record) => {
        keys.forEach((key) => {
          const value = NewData[key];
          if (!key || key === '__dirty') {
            return;
          }
          if (key === 'projectTaskId' && record.get('projectTaskEditFlag') !== 0) {
            record.set(key, value);
          }
          const fields = pcSubjectDs.getField(key);
          const lovCode = fields ? fields.get('lovCode') : null;
          if (fields && !lovCode) {
            record.set(key, value);
          } else if (fields && key.includes('attribute') && lovCode) {
            const valueField = fields.get('valueField');
            const textField = fields.get('textField');
            let valueObj = { [valueField]: value, [textField]: NewData[`${key}Meaning`] };
            if (fields.get('multiple')) {
              const meaningList = NewData?.[`${key}Meaning`]?.split(',');
              valueObj = value?.split(',').map((val, idx) => ({
                [valueField]: val,
                [textField]: isEmpty(meaningList) ? null : meaningList[idx],
              }));
            }
            record.set(key, valueObj);
          }
          // 根据原币币种和本币币种修改汇率
          if (key === 'currencyCode' || key === 'purchaseCurrencyCode') {
            let rateVal = null;
            let currencyCode = null;
            let isEquallity = false;
            if (key === 'currencyCode') {
              currencyCode = NewData?.purchaseCurrencyCode || record.get('purchaseCurrencyCode');
              rateVal = (rateValues[value] && rateValues[value][currencyCode]) || {};
              isEquallity = value === currencyCode;
            } else {
              currencyCode = NewData?.currencyCode || record.get('currencyCode');
              rateVal = (rateValues[currencyCode] && rateValues[currencyCode][value]) || {};
              isEquallity = value === currencyCode;
            }
            record.set('exchangeRate', isEquallity ? 1 : rateVal.rate);
            record.set('disableChangeRate', rateVal.rateMethodCode === 'FR');
          }
        });
      });

      pcSubjectDs.unSelectAll();
      pcSubjectDs.clearCachedSelected();
    };

    const Props = {
      BatchMaintainItemDS: batchMaintainItemDS,
      customizeForm,
      pcSubjectDs,
    };

    const modalKey = c7nModal.key();

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`spcm.common.model.common.batchMaintain`).d('批量维护'),
      children: <BatchMaintainItemForm {...Props} />,
      style: { width: '380px' },
      onOk: batchMaintain,
    });
  }

  // 新增行弹框
  @Bind()
  async addSubject() {
    const {
      pcSubjectDs,
      headerInfo,
      headerInfo: { supplierCompanyId, pcHeaderId },
      pcSourceKey,
      remoteWorkDetail,
      headerFormDs,
    } = this.props;
    const dataSource = pcSubjectDs.toData();
    const doubleUnitEnabled = pcSubjectDs.getState('doubleUnitEnabled');
    const subjectInfoProps = {
      headerFormDs,
      remoteWorkDetail,
      pcSourceKey,
      lineList: dataSource,
      supplierCompanyId,
      pcHeaderId,
      width: 900,
      doubleUnitEnabled,
      handleOk: ['quoteSource', 'quotePurchase'].includes(pcSourceKey)
        ? this.onInfoModalOk
        : this.handleAddPurchaseOrder,
    };
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxContractSubjectAdd', {
        headerInfo,
      });
      if (!res) {
        return;
      }
    }
    c7nModal.open({
      key: c7nModal.key(),
      drawer: true,
      title: intl.get(`spcm.contractSubject.view.message.addSubjectLines`).d('新增标的行'),
      children: <SubjectInfo {...subjectInfoProps} />,
      style: { width: '1090px' },
      // onOk: this.onInfoModalOk,
    });
  }

  /**
   * onSubjectInfoModalOk - 新增行-[寻源，申请]确定按钮事件
   */
  @Throttle(1000, {
    trailing: false,
    leading: true,
  })
  @Bind()
  async onInfoModalOk(ds) {
    const { selected } = ds;
    const {
      pcSubjectDs,
      _linkFlag = false,
      headerInfo: { pcSourceCode = '', pcHeaderId, priceType, acceptExecuteType },
      remoteWorkDetail,
    } = this.props;
    const pcSubjectDataSource = pcSubjectDs?.toData();
    if (selected.length) {
      let selectedListRows = selected.map((select) => select.toJSONData());
      const doubleUnitEnabled = pcSubjectDs.getState('doubleUnitEnabled');
      const pricePriority = pcSubjectDs.getState('pricePriority');
      const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
      const priceField = hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice';
      // 采购申请没有【辅助单价不含税】secondaryUnitPrice，此处只是用来给benchmarkPrice一个undefined
      const secondField = hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice';
      if (remoteWorkDetail) {
        selectedListRows = remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_SELECTED_LIST',
          selectedListRows,
          this.props
        );
      }
      if (['SEARCH_SOURCE_RESULT'].includes(pcSourceCode)) {
        sourceCreate({
          body: selectedListRows.concat(pcSubjectDataSource),
        }).then((res) => {
          if (getResponse(res)) {
            this.addSubjectLines(
              selectedListRows.map((row) => ({
                ...row,
                priceStartDate: row.quotationExpiryDateFrom,
                priceEndDate: row.quotationExpiryDateTo,
                benchmarkPrice: doubleUnitEnabled ? row[secondField] : row[priceField],
              }))
            );
          }
        });
      } else if (['PURCHASE_NEED'].includes(pcSourceCode)) {
        verified({
          selectedPurchaseContracts: selectedListRows.concat(pcSubjectDataSource),
        }).then(async (res) => {
          if (getResponse(res)) {
            const data = [];
            selectedListRows
              .filter((i) => i.itemId)
              .map((item) => {
                data.push({
                  pcHeaderId,
                  pcSourceCode,
                  itemId: item.itemId,
                  itemCode: item.itemCode,
                  invOrganizationId: item.invOrganizationId,
                  uomId: item.uomId,
                  secondaryUomId: item.secondaryUomId,
                });
                return data;
              });
            const itemObj = {};
            if (pcHeaderId) {
              const itemList = await batchQueryPrice({
                pcHeaderId,
                data,
              });
              // eslint-disable-next-line no-unused-expressions
              Array.isArray(itemList) &&
                itemList.forEach((item) => {
                  itemObj[item.itemId] = item;
                });
            }
            const refSelectedListRows = await handlePurchaseNeedDTOs(selectedListRows);
            const newData = (refSelectedListRows || []).map((item) => {
              const {
                recommendSupplierFlag,
                priceLibraryStatus,
                enteredTaxIncludedPrice,
                originalUnitPrice,
              } = item;
              let rest = {};
              let attributeFields = {};
              const unitPriceObj = {
                unitPrice: originalUnitPrice, // 申请预估价
                // 基准价格的取值和含税单价/不含税单价，辅助含税单价/辅助不含税单价保持一致
                benchmarkPrice: doubleUnitEnabled ? item[secondField] : item[priceField],
              };
              const recommendObj = pricePriority === 'ONE' ? { ...unitPriceObj } : {}; // 推荐供应商取价
              const sixElementsObj = {}; // 六要素取价
              // 开启了推荐供应商,价格有效，取推荐供应商对应价格
              if (recommendSupplierFlag === 1) {
                if (priceLibraryStatus === 'VALID') {
                  recommendObj.taxIncludedUnitPrice = enteredTaxIncludedPrice; // 推荐价格
                  recommendObj.unitPrice = item.unitPrice; // 推荐价格
                  recommendObj.benchmarkPrice = hasTaxInclude
                    ? enteredTaxIncludedPrice
                    : item.unitPrice;
                }
              }
              if (itemObj[item.itemId]) {
                const { taxIncludedUnitPrice, unitPrice, unitPriceBatch, ...restObj } =
                  itemObj[item.itemId] || {};
                rest = restObj;

                const sixElementsTaxIncluded = taxIncludedUnitPrice;
                const sixElementsUnitPrice = unitPrice;
                sixElementsObj[priceField] = hasTaxInclude
                  ? sixElementsTaxIncluded
                  : sixElementsUnitPrice;
                sixElementsObj.benchmarkPrice = hasTaxInclude
                  ? sixElementsTaxIncluded
                  : sixElementsUnitPrice;
                sixElementsObj.unitPriceBatch = unitPriceBatch;
                sixElementsObj.currencyCode = rest.currencyCode;
                sixElementsObj.taxRate = rest.taxRate;
                sixElementsObj.taxId = rest.taxId;
                sixElementsObj.taxCode = rest.taxCode;
                if (doubleUnitEnabled) {
                  sixElementsObj[secondField] = restObj[secondField];
                  sixElementsObj.benchmarkPrice = restObj[secondField];
                }
                attributeFields = getAttributeFields(itemObj[item.itemId]);
              }
              const allPriceObj = handleUnitPrice({
                purchaseNeedObj: item,
                recommendObj,
                sixElementsObj,
                pricePriority,
                doubleUnitField: secondField, // 双单位字段
                priceField, // 原单位字段
                recommendSupplierFlag, // 推荐供应商
                hasTaxInclude,
                unitPriceObj,
                doubleUnitEnabled,
              });
              return {
                ...attributeFields,
                ...item,
                ...allPriceObj,
                occupiedQuantity: 0,
                // currencyCode: pricePriority === 'THREE' ? rest.currencyCode : finalCurrencyCode,
                // taxRate:
                //   !isNumber(item[priceField]) || pricePriority === 'THREE'
                //     ? rest.taxRate
                //     : item.taxRate,
                // taxId:
                //   !isNumber(item[priceField]) || pricePriority === 'THREE'
                //     ? rest.taxId
                //     : item.taxId,
                // taxCode:
                //   !isNumber(item[priceField]) || pricePriority === 'THREE'
                //     ? rest.taxCode
                //     : item.taxCode,
                // 新链路框架协议取全部数量
                quantity:
                  _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
                    ? item.quantity
                    : item.availableQuantity,
                secondaryQuantity:
                  _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
                    ? item.secondaryQuantity
                    : item.secondaryAvailableQuantity,
                projectTaskEditFlag: item.projectTaskId ? 0 : 1,
              };
            });
            this.addSubjectLines(newData);
          }
        });
      } else {
        this.addSubjectLines(selectedListRows);
      }
    }
  }

  @Bind()
  addSubjectLines(selectedListRows) {
    const {
      // pcSubjectDs,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY', pcSourceCode = '' },
      remoteWorkDetail,
    } = this.props;
    // const pcSubjectDataSource = pcSubjectDs.toData();
    const batchCreateData = (selectedData) =>
      selectedData.forEach((n) =>
        this.props.pcSubjectDs.create(
          {
            ...n,
            sourceCode: n.sourceNum || n.prNum, // sourceCode取寻源或者是需求的号码
            deliverDate:
              (n.deliverDate && moment(n.deliverDate).format(DEFAULT_DATE_FORMAT)) ||
              (n.neededDate && moment(n.neededDate).format(DEFAULT_DATE_FORMAT)) ||
              null,
            neededDate: n.neededDate && moment(n.neededDate).format(DEFAULT_DATE_FORMAT),
            quantity: isNumber(n.availableQuantity) ? n.availableQuantity : n.quantity,
            secondaryQuantity: isNumber(n.secondaryAvailableQuantity)
              ? n.secondaryAvailableQuantity
              : n.secondaryQuantity,
            lineNum: '',
            sourceLineNum:
              pcSourceCode === 'SEARCH_SOURCE_RESULT' || pcSourceCode === '寻源结果'
                ? n.itemNum
                : n.itemNum || n.lineNum,
            currencyCode: n.currencyCode || supplierCurrencyCode,
            purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
            prLineNum: n.lineNum,
            unitPriceBatch: n.priceBatchQuantity || n.unitPriceBatch,
            exchangeRate: n.exchangeRate,
            uomCodeAndName: n.uomCodeAndName,
          },
          0
        )
      );
    const eventProps = {
      batchCreateData,
      selectedData: selectedListRows,
      current: this,
      from: 'contractSubject',
    };
    if (remoteWorkDetail?.event) {
      remoteWorkDetail.event.fireEvent('handleCreateSubjectLines', eventProps);
    } else {
      batchCreateData(selectedListRows);
    }
  }

  // 新增行-订单
  @Bind()
  handleAddPurchaseOrder(ds) {
    const { selected } = ds;
    const {
      pcSubjectDs,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY' },
      remoteWorkDetail,
    } = this.props;
    const dataSource = pcSubjectDs.toData();
    if (selected.length) {
      const selectedRows = selected.map((select) => select.toJSONData());
      checkCreatePo(dataSource.concat(selectedRows)).then((res) => {
        if (getResponse(res)) {
          const pcSubjectDataSource = pcSubjectDs.toData();
          const batchCreateData = (selectedData) =>
            selectedData.forEach((n, index) =>
              this.props.pcSubjectDs.create(
                {
                  ...n,
                  sourceCode: n.displayPoNum,
                  sourceLineNum: n.displayLineNum,
                  deliverDate: n.deliverDate && moment(n.deliverDate).format(DEFAULT_DATE_FORMAT),
                  neededDate: n.neededDate && moment(n.neededDate).format(DEFAULT_DATE_FORMAT),
                  lineNum: '',
                  currencyCode: n.currencyCode || supplierCurrencyCode,
                  purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
                  prLineNum: pcSubjectDataSource.length + index + 1,
                  taxIncludedUnitPrice: n.enteredTaxIncludedPrice,
                  purchaseTaxLineAmount: n.taxIncludedLineAmount,
                  taxAmount: n.taxPrice,
                  resultId: n.poLineLocationId,
                  exchangeRate: 1,
                  uomCodeAndName: n.uomCodeAndName,
                },
                0
              )
            );

          const eventProps = {
            batchCreateData,
            selectedData: selectedRows,
            current: this,
          };
          if (remoteWorkDetail?.event) {
            remoteWorkDetail.event.fireEvent('handleCreateSubjectLines', eventProps);
          } else {
            batchCreateData(selectedRows);
          }
        }
      });
    }
  }

  @Bind()
  onFieldChange({ name, value }) {
    const { pcSubjectDs } = this.props;
    if (name === 'itemCodeLov') {
      const { itemId, itemCode } = value || {};
      pcSubjectDs.setQueryParameter('itemId', itemId);
      pcSubjectDs.setQueryParameter('itemCode', itemCode);
    }
  }

  render() {
    const {
      editable,
      pcSubjectDs,
      customizeTable,
      pcHeaderId,
      headerInfo: { pcSourceCode, supplementFlag },
      currentMode,
      differeFlag,
      customizeBtnGroup,
      headerFormDs,
      intelligent,
      remoteWorkDetail,
    } = this.props;
    const { prLineImport, importLoading } = this.state;
    // 当为引用订单创建时
    const onlyReadFlag = pcSourceCode === 'PURCHASE_ORDER';
    const HeaderAlert = observer(() => {
      return (
        !!headerFormDs?.current?.get('checkOuInvRelFlag') && (
          <Alert
            message={intl
              .get('spcm.common.view.message.title.changeOuId')
              .d('您变更了公司/业务实体信息，请检查/重新维护所有协议标的行库存组织')}
            className={styles['alert-title']}
            type="info"
            showIcon
            closable
          />
        )
      );
    });

    const HeaderButtons = observer((props) => {
      const buttonCommonProps = {
        color: 'primary',
        funcType: 'flat',
      };
      const btns = [
        <Button
          icon="playlist_add"
          data-name="add"
          {...buttonCommonProps}
          // onClick={this.handleCreate}
          onClick={pcSourceCode === 'MANUALLY' ? this.handleCreate : this.addSubject}
          disabled={onlyReadFlag && supplementFlag}
        >
          {intl.get('hzero.common.btn.add').d('新增')}
        </Button>,
        <Button data-name="save" onClick={this.handleSave} {...buttonCommonProps} icon="save">
          {intl.get(`hzero.common.button.save`).d('保存')}
        </Button>,
        <Button
          data-name="delete"
          disabled={(onlyReadFlag && supplementFlag) || isEmpty(pcSubjectDs.selected)}
          onClick={this.handleDelete}
          icon="delete_sweep"
          {...buttonCommonProps}
        >
          {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
        </Button>,
        <Button
          data-name="subjectImport"
          disabled={pcSourceCode !== 'MANUALLY'}
          onClick={this.handleImport}
          {...buttonCommonProps}
        >
          <Icon
            type="archive"
            style={{ fontSize: '0.14rem', marginRight: '0.05rem', fontWeight: 400 }}
          />
          {intl.get('spcm.contractSubject.button.subjectImport').d('导入标的')}
        </Button>,
        <PermissionButton
          type="c7n-pro"
          icon="archive"
          data-name="newSubjectImport"
          onClick={this.handleNewImport}
          disabled={pcSourceCode !== 'MANUALLY'}
          loading={importLoading}
          tooltip="none"
          style={{
            marginTop: '1px',
          }}
          {...buttonCommonProps}
          permissionList={[
            {
              code: 'srm.pc-admin.pc-purchaser.workspace2.button.batch.import.subject.new',
              type: 'button',
              meaning: '新版导入标的',
            },
          ]}
        >
          <Tooltip
            title={intl.get('spcm.contractSubject.button.newSubjectImport').d('新版导入标的')}
          >
            {intl.get('spcm.contractSubject.button.newSubjectImport').d('新版导入标的')}
          </Tooltip>
          <span className="srm-common-import-button-tag">NEW</span>
        </PermissionButton>,
        <Button
          data-name="batchMaintain"
          disabled={pcSubjectDs.length === 0}
          onClick={this.handleBatchMaintain}
          {...buttonCommonProps}
          icon="mode_edit"
        >
          <Tooltip
            title={
              isEmpty(props.dataSet.selected)
                ? intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.batchCurrentPageDataToEdit`)
                    .d('针对当前页全部数据进行批量编辑')
                : ''
            }
          >
            {props.dataSet.selected.length > 0
              ? intl.get(`ssrc.inquiryHall.model.inquiryHall.batchCheckData`).d('勾选批量编辑')
              : intl.get(`spcm.common.model.common.batchMaintain`).d('批量维护')}
          </Tooltip>
        </Button>,
        pcSourceCode === 'PURCHASE_NEED' && (
          <CommonImport
            data-name="prLineImport"
            businessObjectTemplateCode="SPCM.PR_LINE_IMPORT"
            buttonText={intl.get('spcm.common.button.prLineImport').d('申请转协议导入')}
            args={{
              pcHeaderId,
              workbenchFlag: '1',
              customizeUnitCode: 'SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER',
            }}
            prefixPatch="/spcm"
            buttonProps={{
              // 当前业务规则-协议选用推荐供应商未开启时，可点击
              disabled: prLineImport,
              style: {
                marginTop: '1px',
              },
              ...buttonCommonProps,
            }}
            successCallBack={() => {
              pcSubjectDs.query();
            }}
          />
        ),
      ];
      const remoteBtns = remoteWorkDetail
        ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_SUBJECT_BTNS', btns, {
            current: this,
          })
        : btns;
      return customizeBtnGroup(
        {
          code: 'SPCM.WORKSPACE_DETAIL.SUBJECT.BTN_GROUP',
        },
        remoteBtns
      );
    });
    return (
      <Fragment>
        <HeaderAlert />
        {customizeTable(
          {
            code: this.handleGetCode(),
            extTextRenderIntercept:
              currentMode || differeFlag || intelligent
                ? (...extParam) => extTextRender(extParam, { currentMode, differeFlag })
                : null,
          },
          <FilterBarTable
            dataSet={pcSubjectDs}
            columns={this.renderColumns()}
            style={{ maxHeight: 430 }}
            buttons={editable && <HeaderButtons dataSet={pcSubjectDs} />}
            filterBarConfig={{
              autoQuery: false,
              collpaseble: !!editable,
              onFieldChange: this.onFieldChange,
            }}
          />
        )}
      </Fragment>
    );
  }
}
