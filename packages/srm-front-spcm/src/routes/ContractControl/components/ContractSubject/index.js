import React, { Component, Fragment } from 'react';
import { Button, Table, Lov, Modal as c7nModal, Tooltip } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import querystring from 'querystring';
import { Bind, Throttle, debounce } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isNumber, isEmpty, compose, isNil } from 'lodash';
import { Modal } from 'hzero-ui'; // 暂时未用c7n的，因为该组件没有hzero处理得好
import moment from 'moment';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { useModal } from 'components/Import';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { renderThousandthNum, validateDoubleUom, getAttributeFields, handlePurchaseNeedDTOs } from '@/utils/util';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import CommonImport from 'hzero-front/lib/components/Import';

import DocFlow from '_components/DocFlow';
import { saveSubject, sourceCreate, verified } from '@/services/contractMaintainService';
import {
  fetchExchangeRate,
  getRelationDocControl,
  getImportTemplateCode,
} from '@/services/contractCommonService';
import { batchQueryPrice } from '@/services/newContractService';
import ApplicationScope from '@/routes/components/ContractSubject/ApplicationOrganization';
import { openC7nPriceModal } from '@/routes/components/C7nPriceModal';
import { getHeaderParams } from '@/routes/components/C7nPriceModal/util';
import ExecutiveOrderRecord from '@/routes/components/ExecutiveOrderRecord';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import showLadderQuote from './LadderQuote';
import styles from '../index.less';

import CreateModal from '../../../ContractMaintain/QuotePurchaseOrder/CreateModal';
import SubjectInfo from '../../../components/ContractSubject/SubjectInfo';

const tenantId = getCurrentOrganizationId();
class ContractSubject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      poVisible: false,
      visible: false,
      addLoading: false,
      relationDoc: {},
    };
  }

  componentDidMount() {
    this.fetchRelationDocControl();
  }

  @Bind()
  async fetchRelationDocControl() {
    const res = getResponse(await getRelationDocControl());
    if (res) {
      this.setState({ relationDoc: res });
    }
  }

  @Bind()
  onPreDelete() {
    const { checkModified } = this.props;
    if (checkModified()) {
      this.handleDelete();
    } else {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => {
          this.handleDelete();
        },
      });
    }
  }

  // 模态框显隐控制
  @Bind()
  handleControlModal(visibleKey) {
    const { [visibleKey]: visible } = this.state;
    this.setState({ [visibleKey]: !visible });
  }

  @Bind()
  handleGetCode() {
    const {
      location: { search },
      unitCodeList,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (routerParams.hasChanged === 'true') {
      return unitCodeList?.SUBJECT || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT';
    } else {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY';
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    const {
      // pcSubjectDs,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY' },
    } = this.props;
    this.props.pcSubjectDs.create(
      {
        currencyCode: supplierCurrencyCode || 'CNY',
        purchaseCurrencyCode: purchaseCurrencyCode || 'CNY',
        exchangeRate: 1,
      },
      0
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
      unitCodeList,
      remote,
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
      return total + (item.quantity * price) / (item.unitPriceBatch || 1);
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
      const params = {
        pcHeaderId,
        customizeUnitCode: unitCodeList?.SUBJECT || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        ...pcSubjectDetailDTOList,
      };
      const response = getResponse(await saveSubject(params));
      if (response) {
        notification.success();
        onFetchHeader().then(() => {
          if (remote?.event) {
            remote.event.fireEvent('handleCuxSaveSubject', {
              headerInfo: this.props?.headerInfo,
              current: this,
            });
          }
          onFetchTableList(
            pcSubjectDs,
            unitCodeList?.SUBJECT || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT'
          );
        });
      }
    }
  }

  /**
   * 删除
   */
  @Bind()
  async handleDelete() {
    const { pcSubjectDs, onFetchHeader, onFetchTableList, unitCodeList } = this.props;
    const selectedRows = pcSubjectDs.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    pcSubjectDs.remove(newAddRows);
    // 删除线上数据
    const res = await pcSubjectDs.delete(existedRows);
    if (res && !res.failed) {
      onFetchHeader();
      onFetchTableList(
        pcSubjectDs,
        unitCodeList?.SUBJECT || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT'
      );
    }
  }

  @Bind()
  handleChangeItem(lovRecord, record) {
    const {
      doubleUomFlag,
      pcHeaderId,
      dispatch,
      headerInfo: { priceType, pcSourceCode },
      pcSubjectDs,
    } = this.props;
    if (!lovRecord) {
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
    dispatch({
      type: 'contractCommon/fetchPriceLibValidPrice',
      payload: {
        ...record.toData(),
        priceLibId: null,
        pcHeaderId,
        itemId,
        itemCode,
        uomId,
        secondaryUomId,
        pcSourceCode,
        invOrganizationId: record.get('invOrganizationId'),
      },
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
      const fields = {
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
      if (compareCurrencyCode === currencyCode) {
        record.set({ exchangeRate: 1 });
      } else {
        fetchExchangeRate({
          tenantId,
          fromCurrencyCode: isCurrencyCode ? currencyCode : compareCurrencyCode,
          toCurrencyCode: isCurrencyCode ? compareCurrencyCode : currencyCode,
          rateDate: moment(new Date()).format(DEFAULT_DATE_FORMAT),
        }).then((res) => {
          let exchangeRate = null;
          let disableChangeRate = false;
          if (res && res?.length === 1) {
            exchangeRate = res[0]?.rate;
            disableChangeRate = res[0]?.rateMethodCode === 'FR';
          }
          record.set({ exchangeRate, disableChangeRate });
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
        backPath: `/spcm/contract-control/detail/${pcHeaderId}`,
        args: JSON.stringify({ pcHeaderId }),
      }),
    });
  }

  /**
   * 协议标的批量导入
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
          notification.success();
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
      movable: false,
      key: c7nModal.key(),
      title: intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据'),
      style: {
        width: 800,
      },
      children: <ExecutiveOrderRecord pcSubjectId={phId} />,
      footer: null,
    });
  }

  renderColumns() {
    const {
      editable,
      match: { path },
      headerInfo: {
        pcSourceCode,
        priceType = 'NONE',
        amountControlDimension,
        manuallyModifyAmount,
      },
      pcSubjectDs,
      remote,
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
    let columns = [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'itemCodeLov',
        width: 180,
        editor: (record) =>
          editable &&
          !onlyReadFlag && (
            <Lov onChange={(lovRecord) => this.handleChangeItem(lovRecord, record)} />
          ),
      },
      {
        name: 'itemName',
        width: 150,
        editor: editable && !onlyReadFlag,
      },
      {
        name: 'invOrganizationIdLov',
        width: 220,
        editor: editable && !onlyReadFlag,
      },
      {
        name: 'projectTaskId',
        width: 180,
        compareValue: 'projectTaskName',
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
        name: 'categoryIdLov',
        width: 150,
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
        editor: editable && !onlyReadFlag,
      },
      {
        name: 'model',
        width: 120,
        editor: editable && !onlyReadFlag,
      },
      {
        name: 'uomIdLov',
        width: 140,
        editor: editable && !onlyReadFlag && !doubleUnitEnabled,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 140,
        editor: editable && !onlyReadFlag,
      },
      {
        name: 'quantity',
        width: 120,
        editor: editable && !onlyReadFlag && !doubleUnitEnabled,
        renderer: ({ value }) => renderThousandthNum(value),
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 120,
        editor: editable && !onlyReadFlag,
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'taxIdLov',
        width: 150,
        editor: editable && !onlyReadFlag,
      },
      {
        name: 'taxRate',
        width: 120,
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
      },
      {
        name: 'exchangeRate',
        width: 160,
        editor: (record) =>
          editable &&
          !onlyReadFlag &&
          record.get('purchaseCurrencyCode') !== record.get('currencyCode'),
      },
      {
        name: 'priceType',
        width: 120,
        renderer: ({ record }) => record.get('priceTypeMeaning'),
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 140,
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
        width: 140,
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
        width: 120,
        renderer: ({ value }) => renderThousandthNum(value),
      },
      {
        name: 'unitPrice',
        width: 120,
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
        width: 120,
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
        editor: editable,
      },
      {
        name: 'priceEndDate',
        width: 200,
        editor: editable,
      },
      {
        name: 'ladderQuote',
        width: 100,
        renderer: ({ record }) =>
          record.status !== 'add' && (
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
      },
      {
        name: 'keeperUserIdLov',
        width: 180,
        editor: editable,
      },
      {
        name: 'accepterUserIdLov',
        width: 180,
        editor: editable,
      },
      {
        name: 'expBearDepIdLov',
        width: 180,
        editor: editable,
      },
      {
        name: 'address',
        width: 180,
        editor: editable,
      },
      {
        name: 'projectNumLov',
        width: 180,
        editor: (record) =>
          editable &&
          !onlyReadFlag && (
            <Lov onChange={(lovRecord) => this.handleChangeProjectNum(lovRecord, record)} />
          ),
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
      {
        name: 'documentFlow',
        hidden: ![1, '1'].includes(relationDoc?.displayDocFlow),
        width: 100,
        renderer: ({ record }) => {
          return (
            record.get('pcSubjectId') && (
              <DocFlow
                tableName="spcm_pc_subject"
                tablePk={record.get('pcSubjectId')}
                buttonType="button"
              />
            )
          );
        },
      },
      {
        name: 'lineMaxContractAmount',
        width: 160,
        hidden: !(amountControlDimension === 'LINE' && manuallyModifyAmount === '1'),
        editor: amountControlDimension === 'LINE' && manuallyModifyAmount === '1',
      },
      {
        name: 'taxIncludeLineOccupiedAmount',
        width: 170,
        hidden: amountControlDimension !== 'LINE',
      },
      {
        name: 'lineOccupiedAmount',
        width: 170,
        hidden: amountControlDimension !== 'LINE',
      },
      {
        name: 'orderOccupiedLineAmountRatio',
        width: 140,
        hidden: amountControlDimension !== 'LINE',
      },
    ];
    const sourceResultColumn = [
      {
        name: 'sourceAppScopeLineDTOs',
        width: 120,
        renderer: ({ record }) =>
          pcSourceCode === 'SEARCH_SOURCE_RESULT' && (
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
            disabled={!editable || onlyReadFlag}
            onClick={() => this.handleClickReferPrice(record)}
          >
            {intl.get('spcm.workspace.model.common.referPrice').d('参考价格')}
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
      },
      {
        name: 'sourceLineNum',
        width: 120,
        renderer: ({ value, record }) =>
          pcSourceCode === 'PURCHASE_NEED' ? record.get('sourceDisplayLineNum') : value,
      },
    ];
    if (!path.includes('contract-maintain')) {
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
            <a
              disabled={!record?.get('pcSubjectId')}
              onClick={() => this.handleControlDocumentModal(record.get('pcSubjectId'))}
            >
              {intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据')}
            </a>
          ),
        },
        {
          name: 'execteLineNum',
          width: 120,
        },
      ];
      maintainEditableAddColumn = maintainEditableAddColumn.concat(outOfMaintain);
    }
    columns = columns.concat(maintainEditableAddColumn);
    return remote
      ? remote.process('SPCM_CONTRACT_MAINTAIN_CONTROL_SUBJECT_COLUMN', columns, {
          current: this,
        })
      : columns;
  }

  /**
   *  点击参考价格
   */
  @Bind()
  handleClickReferPrice(record) {
    const { headerFormDs } = this.props;
    const headerParams = getHeaderParams(headerFormDs.current?.toJSONData() || {});
    const params = {
      // customizeTable,
      record,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.REFERENCE_PRICE',
      queryParams: {
        ...headerParams,
        ...record.toJSONData(),
      },
      onOk: (priceTableDs) => {
        this.handleChangePrice(priceTableDs);
      },
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

  @Bind()
  addSubject() {
    this.setState({
      visible: true,
    });
  }

  /**
   * closeSubjectInfoModal - 关闭弹窗
   */
  @Bind()
  closeSubjectInfoModal() {
    this.setState({
      visible: false,
    });
  }

  /**
   * onSubjectInfoModalOk - 新增信息行弹窗确定按钮事件
   */
  @Throttle(1000, {
    trailing: false,
    leading: true,
  })
  @Bind()
  async onInfoModalOk() {
    const {
      pcSubjectDs,
      _linkFlag = false,
      headerInfo: { pcSourceCode = '', pcHeaderId, priceType, acceptExecuteType },
      remote,
      headerInfo,
    } = this.props;
    const pcSubjectDataSource = pcSubjectDs?.toData();
    if (this.subjectInfo && !isEmpty((this.subjectInfo.state || {}).selectedListRows)) {
      const { selectedListRows } = this.subjectInfo.state;
      this.setState({
        addLoading: true,
      });
      const doubleUnitEnabled = pcSubjectDs.getState('doubleUnitEnabled');
      const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
      const priceField = hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice';
      // 采购申请没有【辅助单价不含税】secondaryUnitPrice，此处只是用来给benchmarkPrice一个undefined
      const secondField = hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice';
      if (['SEARCH_SOURCE_RESULT'].includes(pcSourceCode)) {
        sourceCreate({
          body: selectedListRows.concat(pcSubjectDataSource),
        })
          .then((res) => {
            if (getResponse(res)) {
              this.addSubjectLines(
                selectedListRows.map((row) => ({
                  ...row,
                  priceStartDate: row.quotationExpiryDateFrom,
                  priceEndDate: row.quotationExpiryDateTo,
                  benchmarkPrice: doubleUnitEnabled ? row[secondField] : row[priceField],
                }))
              );
              this.closeSubjectInfoModal();
            }
          })
          .finally(() => {
            this.setState({
              addLoading: false,
            });
          });
      } else if (['PURCHASE_NEED'].includes(pcSourceCode)) {
        verified({
          selectedPurchaseContracts: selectedListRows.concat(pcSubjectDataSource),
        })
          .then(async (res) => {
            if (getResponse(res)) {
              const data = [];
              selectedListRows
                .filter((i) => i.itemId)
                .map((item) => {
                  data.push({
                    pcHeaderId,
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
                  pcSourceCode,
                });
                // eslint-disable-next-line no-unused-expressions
                Array.isArray(itemList) &&
                  itemList.forEach((item) => {
                    itemObj[item.itemId] = item;
                  });
              }
              const refSelectedListRows = await handlePurchaseNeedDTOs(selectedListRows);
              let newData = (refSelectedListRows || []).map((item) => {
                let rest = {};
                let attributeFields = {};
                const unitPriceObj = {
                  benchmarkPrice: doubleUnitEnabled ? item[secondField] : item[priceField],
                };
                if (itemObj[item.itemId]) {
                  const { taxIncludedUnitPrice, unitPrice, unitPriceBatch, ...restObj } =
                    itemObj[item.itemId] || {};
                  rest = restObj;
                  const TaxIncludedUnitPrice = isNumber(item.taxIncludedUnitPrice)
                    ? item.taxIncludedUnitPrice
                    : taxIncludedUnitPrice;
                  const UnitPrice = isNumber(item.unitPrice) ? item.unitPrice : unitPrice;
                  unitPriceObj[priceField] = hasTaxInclude ? TaxIncludedUnitPrice : UnitPrice;
                  unitPriceObj.benchmarkPrice = hasTaxInclude ? TaxIncludedUnitPrice : UnitPrice;
                  if (
                    hasTaxInclude &&
                    ((!isNil(item.taxIncludedUnitPrice) && isNil(item.unitPriceBatch)) ||
                      (isNil(item.taxIncludedUnitPrice) && !isNil(taxIncludedUnitPrice)))
                  ) {
                    unitPriceObj.unitPriceBatch = unitPriceBatch;
                  } else if (
                    !hasTaxInclude &&
                    ((!isNil(item.unitPrice) && isNil(item.unitPriceBatch)) ||
                      (isNil(item.unitPrice) && !isNil(unitPrice)))
                  ) {
                    unitPriceObj.unitPriceBatch = unitPriceBatch;
                  }
                  if (doubleUnitEnabled) {
                    unitPriceObj[secondField] = isNumber(item[secondField])
                      ? item[secondField]
                      : restObj[secondField];
                    unitPriceObj.benchmarkPrice = isNumber(item[secondField])
                      ? item[secondField]
                      : restObj[secondField];
                  }
                  attributeFields = getAttributeFields(itemObj[item.itemId]);
                }
                return {
                  ...attributeFields,
                  ...item,
                  ...unitPriceObj,
                  occupiedQuantity: 0,
                  currencyCode: isNumber(item[priceField]) ? item.currencyCode : rest.currencyCode,
                  taxRate: isNumber(item[priceField]) ? item.taxRate : rest.taxRate,
                  taxId: isNumber(item[priceField]) ? item.taxId : rest.taxId,
                  taxCode: isNumber(item[priceField]) ? item.taxCode : rest.taxCode,
                  // 新链路框架协议取全部数量
                  quantity:
                    _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
                      ? item.quantity
                      : item.availableQuantity,
                  secondaryQuantity:
                    _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
                      ? item.secondaryQuantity
                      : item.secondaryAvailableQuantity,
                };
              });
              // 处理新建的采购申请的行标的信息, 支持异步
              const otherProps = {
                headerInfo,
              };
              newData = await remote.process(
                'SPCM_CONTRACT_CONTROL_DETAIL_TRANSFORM_CREATE_SUBJECT',
                newData,
                otherProps
              );
              this.addSubjectLines(newData);
              this.closeSubjectInfoModal();
            }
          })
          .finally(() => {
            this.setState({
              addLoading: false,
            });
          });
      } else {
        this.addSubjectLines(selectedListRows);
        this.closeSubjectInfoModal();
      }
      // this.closeSubjectInfoModal();
    }
  }

  @Bind()
  addSubjectLines(selectedListRows) {
    const {
      // pcSubjectDs,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY', pcSourceCode = '' },
    } = this.props;
    // const pcSubjectDataSource = pcSubjectDs.toData();
    selectedListRows.forEach((n) =>
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
  }

  /**
   * 采购订单新增标的行
   */
  @Bind()
  handleAddPurchaseOrder(selectedList = []) {
    const {
      pcSubjectDs,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY' },
    } = this.props;
    const pcSubjectDataSource = pcSubjectDs.toData();
    selectedList.forEach((n, index) =>
      this.props.pcSubjectDs.create(
        {
          ...n,
          sourceCode: n.displayPoNum,
          sourceLineNum: n.displayLineNum,
          deliverDate: n.deliverDate && moment(n.deliverDate).format(DEFAULT_DATE_FORMAT),
          neededDate: n.neededDate && moment(n.neededDate).format(DEFAULT_DATE_FORMAT),
          lineNum: '',
          currencyCode: n.currencyCode || supplierCurrencyCode,
          purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode, // 本币
          purchaseTaxLineAmount: n.taxIncludedLineAmount, // 本币含税行金额
          prLineNum: pcSubjectDataSource.length + index + 1,
          taxIncludedUnitPrice: n.enteredTaxIncludedPrice,
          taxAmount: n.taxPrice,
          resultId: n.poLineLocationId,
          exchangeRate: n.exchangeRate,
          uomCodeAndName: n.uomCodeAndName,
        },
        0
      )
    );
  }

  render() {
    const {
      editable,
      remote,
      pcSubjectDs,
      customizeTable,
      prLineImport,
      headerInfo: { pcSourceCode, supplierCompanyId, supplementFlag, pcHeaderId },
      fetchSubjectCreateList,
      quoteSourceFlag, // 判断是否为寻源单据
      customizeBtnGroup,
      headerFormDs,
    } = this.props;
    // 当为引用订单创建时
    const onlyReadFlag = pcSourceCode === 'PURCHASE_ORDER';
    const doubleUnitEnabled = pcSubjectDs.getState('doubleUnitEnabled');

    const { poVisible, visible, addLoading, importLoading } = this.state;

    const dataSource = pcSubjectDs.toData();
    const createProps = {
      supplierCompanyId,
      doubleUnitEnabled,
      resultId: isEmpty(dataSource) ? '' : dataSource[0].resultId,
      sourceLineNum: isEmpty(dataSource) ? '' : dataSource[0].sourceLineNum,
      sourceCode: isEmpty(dataSource) ? '' : dataSource[0].sourceCode,
      visible: poVisible,
      onCancel: () => this.handleControlModal('poVisible'),
      onAddPurchaseOrder: this.handleAddPurchaseOrder,
      dataSource,
    };

    const subjectInfoProps = {
      quoteSourceFlag,
      remote,
      lineList: dataSource,
      supplierCompanyId,
      width: 900,
      doubleUnitEnabled,
      onRef: (node) => {
        this.subjectInfo = node;
      },
      // loading: queryCreateListLoading,
      fetchCreateList: fetchSubjectCreateList,
    };

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

    const HeaderButtons = observer(() => {
      return (
        <Fragment>
          {customizeBtnGroup(
            {
              code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.BTN_GROUP',
            },
            [
              <PermissionButton
                type="c7n-pro"
                icon="archive"
                data-name="newSubjectImport"
                onClick={this.handleNewImport}
                disabled={pcSourceCode !== 'MANUALLY'}
                loading={importLoading}
                tooltip="none"
                permissionList={[
                  {
                    code: 'srm.pc-admin.pc-purchaser.maintain.ps.batch.import.subject.new',
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
                data-name="subjectImport"
                disabled={pcSourceCode !== 'MANUALLY'}
                onClick={this.handleImport}
              >
                {intl.get('spcm.contractSubject.button.subjectImport').d('导入标的')}
              </Button>,
              <Button
                color="primary"
                data-name="create"
                // onClick={this.handleCreate}
                onClick={
                  ['PURCHASE_NEED', 'SEARCH_SOURCE_RESULT', '采购申请', '寻源结果'].includes(
                    pcSourceCode
                  )
                    ? this.addSubject
                    : pcSourceCode === 'PURCHASE_ORDER' || pcSourceCode === '采购订单'
                    ? () => this.handleControlModal('poVisible')
                    : this.handleCreate
                }
                disabled={onlyReadFlag && supplementFlag}
              >
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>,
              <Button data-name="save" onClick={this.handleSave}>
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>,
              <Button
                data-name="delete"
                disabled={onlyReadFlag && supplementFlag}
                onClick={this.onPreDelete}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>,
              pcSourceCode === 'PURCHASE_NEED' && (
                <CommonImport
                  data-name="prLineImport"
                  businessObjectTemplateCode="SPCM.PR_LINE_IMPORT"
                  buttonText={intl.get('spcm.common.button.prLineImport').d('申请转协议导入')}
                  args={{
                    pcHeaderId,
                    customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.DEMAND',
                  }}
                  prefixPatch="/spcm"
                  buttonProps={{
                    disabled: prLineImport,
                  }}
                  successCallBack={() => {
                    notification.success();
                    pcSubjectDs.query();
                  }}
                />
              ),
            ]
          )}
        </Fragment>
      );
    });

    return (
      <Fragment>
        <HeaderAlert />
        {editable && (
          <div className={styles['btn-wrapper']}>
            <HeaderButtons dataSet={pcSubjectDs} />
          </div>
        )}
        {customizeTable(
          {
            code: this.handleGetCode(),
          },
          <Table dataSet={pcSubjectDs} columns={this.renderColumns()} />
        )}
        {poVisible && <CreateModal {...createProps} />}
        <Modal
          title={intl.get(`spcm.contractSubject.view.message.addSubjectLines`).d('新增标的行')}
          destroyOnClose
          width={1000}
          visible={visible}
          onCancel={this.closeSubjectInfoModal}
          footer={
            <Button type="primary" onClick={this.onInfoModalOk} loading={addLoading}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          }
        >
          <SubjectInfo {...subjectInfoProps} />
        </Modal>
      </Fragment>
    );
  }
}

const hocFuc = (com) => compose(withRouter)(com);

export { hocFuc, ContractSubject };
export default hocFuc(ContractSubject);
