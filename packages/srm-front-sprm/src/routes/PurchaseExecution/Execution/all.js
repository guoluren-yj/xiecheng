import React, { Component } from 'react';
import { Tooltip, Modal, Lov, DataSet, Table, Button, Icon } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isFunction } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Tag } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import { getCurrentTenant, getResponse, getCurrentOrganizationId } from 'utils/utils';

// import { fetchOperationRecordList } from '@/services/purchaseRequisitionPoolService.js';
import { fetchExecutionLink } from '@/services/purchaseRequisitionAssignmentService';
import notification from 'utils/notification';
import SupplierModal from '../components/SupplierModal';

import OperationNewRecord from '@/routes/components/OperationHistory';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import ReferPrice from '@/routes/components/ReferPrice';
import ReferPriceProduct from '@/routes/components/ReferPriceProduct';
import ViewFilter from '@/routes/components/ViewFilter';
import ChangeOrderCodeRender from '@/routes/components/ChangeOrderCodeRender';
import { thousandBitSeparator } from '@/routes/utils.js';
// import urgentImg from '@/assets/icon-expedited.svg';
import { updateExecutionStrategy } from '@/services/purchaseExecutionService';
import PromptModal from './../components/PromptModal';
import { promptModalDs } from './../Assign/assignDs';
import { orderPriceDs } from './executionDs/allDs';
import OutsourcingBom from '../../NewPurchaseDetail/components/OutsourcingBom';

const commonPrompt = 'sprm.common.model.common';
const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: ['sprm.common', 'smdm.common', 'sodr.common'],
})
export default class TransferAll extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) props.onRef(this);
    this.state = {
      tableDisplay: 'flat',
      isOldUser: false,
    };
  }

  componentDidMount() {
    this.getExecutionLink();
    const { initDsEvents } = this.props?.remote?.props?.process || {};
    if (isFunction(initDsEvents)) {
      initDsEvents({ dataSet: this.props?.allDs });
    }
  }

  queryDs = new DataSet({
    fields: [
      {
        name: 'displayPrNumList',
        trim: true,
      },
    ],
  });

  // 渲染状态列
  @Bind()
  isEnabledRender({ value }) {
    const btns = [];
    btns.push(yesOrNoRender(Number(value)));
    return btns;
  }

  @Bind()
  async handleExecutionStrategy() {
    const {
      allDs,
      customizeForm,
      setting,
      isOldUser,
      isShowNewBid,
      oldAssignLovSetting,
      remote,
    } = this.props;
    const selectedRows = allDs.selected?.map((ele) => ele.toData());
    const { queryDefaultValue = undefined } = remote?.props?.process || {};
    // 是否转单标识 transferFlag
    const allTranferList = selectedRows?.filter((ele) => ele.transferFlag === 1);
    const purchaseAgentFlag = selectedRows.every(
      (ele) => ele.purchaseAgentId === selectedRows[0]?.purchaseAgentId
    );
    const executionStrategyCode = selectedRows.every(
      (item) => item.executionStrategyCode === 'ORDER'
    )
      ? 'ORDER'
      : selectedRows.every((item) => item.executionStrategyCode === 'SOURCE')
      ? 'SOURCE'
      : selectedRows.every((item) => item.executionStrategyCode === 'SOURCE_AND_ORDER')
      ? 'SOURCE_AND_ORDER'
      : selectedRows.every((item) => item.executionStrategyCode === 'BEFORE_SOURCE_AFTER_ORDER')
      ? 'BEFORE_SOURCE_AFTER_ORDER'
      : undefined;
    const secondLevelStrategyCodeList = Array.from(
      new Set(selectedRows?.map((ele) => ele.secondLevelStrategyCode))
    );
    const secondLevelStrategyCode =
      executionStrategyCode === 'ORDER'
        ? 'NO_ACCESS'
        : secondLevelStrategyCodeList?.length > 1
        ? 'ALL'
        : secondLevelStrategyCodeList[0];
    const orderSecondLevelStrategyCodeList = Array.from(
      new Set(selectedRows?.map((ele) => ele.orderSecondLevelStrategyCode))
    );
    const orderSecondLevelStrategyCode =
      executionStrategyCode === 'SOURCE'
        ? 'NO_ACCESS'
        : orderSecondLevelStrategyCodeList?.length > 1
        ? 'ALL'
        : orderSecondLevelStrategyCodeList[0];

    const config = {
      allTransferFlag: allTranferList.length > 0,
      orderTransferFlag: allTranferList.some((ele) => ele.orderOccupiedQuantity),
      sourceTransferFlag: allTranferList.some(
        (ele) => ele.sourceOccupiedQuantity || ele.pcFrameworkOccupyFlag
      ),
      setting,
      oldAssignLovSetting,
      executionStrategyCode,
      secondLevelStrategyCode,
      orderSecondLevelStrategyCode,
    };
    const promptDs = new DataSet(promptModalDs(config));
    if (isFunction(queryDefaultValue)) {
      Object.assign(promptDs, { status: 'loading' });
      const data = await queryDefaultValue({
        selectedRows,
        allDs,
        type: 'all',
        purchaseAgentFlag,
        executionStrategyCode,
        secondLevelStrategyCode,
        orderSecondLevelStrategyCode,
      });
      if (data) {
        promptDs.current.init({
          executionStrategyCode,
          secondLevelStrategyCode,
          orderSecondLevelStrategyCode,
          // 采购员，需求执行人默认值设置
          ...data,
        });
      }
    } else {
      promptDs.current.init({
        currentPurchaseAgent: purchaseAgentFlag
          ? {
              purchaseAgentId: selectedRows[0]?.purchaseAgentId,
              purchaseAgentName: selectedRows[0]?.purchaseAgentName,
            }
          : {},
        executionStrategyCode,
        secondLevelStrategyCode,
        orderSecondLevelStrategyCode,
      });
    }
    if (
      allTranferList?.length &&
      allTranferList.length !== selectedRows.length &&
      setting === '1'
    ) {
      const errorLine = allTranferList
        ?.map((ele) => `${ele.displayPrNum}-${ele.displayLineNum}`)
        .join(',');
      notification.warning({
        message: intl
          .get(`sprm.common.model.common.reMaintainEcecutionSelect`, { errorLine })
          .d(
            `采购申请行【${errorLine}】已被执行，其余申请行未被执行，无法同时执行此操作，请重新勾选。`
          ),
      });
    } else {
      Modal.open({
        key: Modal.key(),
        title: intl.get(`sprm.purchaseRequisitionAssign.view.title.applyAssign`).d('需求分配'),
        children: (
          <PromptModal
            ds={promptDs}
            setting={setting}
            listDs={allDs}
            customizeForm={customizeForm}
            oldAssignLovSetting={oldAssignLovSetting}
            isOldUser={isOldUser}
            pageForm="allPage"
            isShowNewBid={isShowNewBid}
          />
        ),
        drawer: true,
        closable: true,
        maskClosable: true,
        onOk: () => this.assignItem(promptDs),
        style: { width: '380px' },
        onCancel: () => {},
      });
    }
  }

  @Bind()
  async assignItem(promptDs) {
    const { allDs } = this.props;
    const validateFlag = await promptDs.validate();
    const selectedRows = allDs.selected;
    if (validateFlag) {
      const data = promptDs.toData()[0] ? promptDs.toData()[0] : {};
      const {
        executedBys = [],
        purchaseAgentId,
        currentPurchaseAgent,
        executionStrategyCode,
        secondLevelStrategyCode,
        assignedRemark,
        ...attributeObj
      } = data;
      const prLineVOS = selectedRows
        ?.map((ele) => ele.toData())
        ?.map((item) => {
          return {
            ...item,
            ...attributeObj,
            executionStrategyCode,
            // executionStrategyMeaning: data.executionStrategyMeaning,
          };
        });

      updateExecutionStrategy({
        prLineVOS,
        values: {
          currentPurchaseAgent,
          executionStrategyCode,
          secondLevelStrategyCode,
          assignedRemark,
          ...data,
          customizeUnitCode: 'SPRM.PURCHASE_EXECUTION.NOTASSIGN.MODAL',
          executedBys: (isArray(executedBys) ? executedBys : [])?.map((ele) => ele.userId),
          executedByName: (isArray(executedBys) ? executedBys : [])?.map((ele) => ele.userName),
        },
      }).then((result) => {
        if (result && result.failed) {
          notification.error({ message: result.message });
        } else {
          allDs.unSelectAll();
          allDs.clearCachedSelected();
          allDs.query();
          notification.success();
        }
      });
    } else {
      return false;
    }
  }

  @Bind()
  setDisplayStatus(tableDisplay) {
    this.setState({
      tableDisplay,
    });
  }

  @Bind()
  getExecutionLink() {
    fetchExecutionLink({ tenantNum: getCurrentTenant().tenantNum }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result.content)) {
        this.setState({
          isOldUser: true,
        });
      }
    });
  }

  // 打开操作记录
  handleActHistory = (record) => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationNewRecord prHeaderId={record.get('prHeaderId')} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  /**
   * 控制弹窗的显示和隐藏
   * @param {String} modalVisible
   * @param {Boolean} flag
   * @memberof Detail
   */
  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  @Bind()
  handleQuery({ params = {} }) {
    const { allDs, location = {} } = this.props;
    const { _back } = location?.state || {};
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = allDs.queryDataSet?.current?.toData() || {};
    const { customizeOrderField = undefined } = params;

    if (dataObj) {
      for (const key in dataObj) {
        if (
          ![
            'multiSelectHeaderNums',
            'multiSelectHeaderAndLineNums',
            'supplierCompanyId',
            'supplierId',
            'localSupplierIds',
            'platformSupplierIds',
          ].includes(key)
        ) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    allDs.setQueryParameter('customizeOrderField', customizeOrderField);

    // eslint-disable-next-line no-unused-expressions
    allDs.queryDataSet.current
      ? allDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : allDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);

    if (_back === -1) {
      allDs.query(allDs.currentPage);
    } else {
      allDs.query();
    }
  }

  @Bind()
  onChangeField({ name, value, record }) {
    const { allDs } = this.props;
    if (name === 'tempKey') {
      if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
        // eslint-disable-next-line no-unused-expressions
        allDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyIds,
          supplierId: value?.extSupplierIds,
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        allDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyId,
          supplierId: value?.supplierId,
        });
      }
    } else if (name === 'supplierList') {
      if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
        const localSupplierIds = [];
        const platformSupplierIds = [];
        (value || []).forEach((ele) => {
          const { supplierCompanyIds, extSupplierIds } = ele;
          if (extSupplierIds) {
            localSupplierIds.push(extSupplierIds);
          } else {
            platformSupplierIds.push(supplierCompanyIds);
          }
        });
        // eslint-disable-next-line no-unused-expressions
        allDs.queryDataSet?.current?.set({
          localSupplierIds: isEmpty(localSupplierIds) ? undefined : localSupplierIds.join(','),
          platformSupplierIds: isEmpty(platformSupplierIds)
            ? undefined
            : platformSupplierIds.join(','),
        });
      } else {
        const localSupplierIds = [];
        const platformSupplierIds = [];
        (value || []).forEach((ele) => {
          const { supplierCompanyId, supplierId } = ele;
          if (supplierId) {
            localSupplierIds.push(supplierId);
          } else {
            platformSupplierIds.push(supplierCompanyId);
          }
        });
        // eslint-disable-next-line no-unused-expressions
        allDs.queryDataSet?.current?.set({
          localSupplierIds: isEmpty(localSupplierIds) ? undefined : localSupplierIds.join(','),
          platformSupplierIds: isEmpty(platformSupplierIds)
            ? undefined
            : platformSupplierIds.join(','),
        });
      }
    } else if (!value) {
      // eslint-disable-next-line no-unused-expressions
      allDs.queryDataSet?.current?.set({ [name]: undefined });
    }
  }

  @Bind()
  resetQueryDs() {
    const { allDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    allDs.queryDataSet?.current?.reset();
  }

  @Bind()
  handleOrderPrice(record) {
    const recordPriceDs = new DataSet(orderPriceDs());
    const { customizeTable } = this.props;
    recordPriceDs.loadData([record.get('prReferencePriceLibraryVO')]);
    const cols = [
      { name: 'unitPrice', width: 150 },
      { name: 'taxIncludedPrice', width: 150 },
      { name: 'uomName', width: 140 },
      { name: 'currencyCode', width: 140 },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('sprm.common.model.executeBill.orderPriceInfo').d('订单价格信息'),
      children: customizeTable(
        {
          code: 'SPRM.PURCHASE_EXECUTION_ALL.ORDER_CACHE_LIST',
        },
        <Table dataSet={recordPriceDs} columns={cols} />
      ),
      drawer: true,
      closable: true,
      maskClosable: true,
      style: { width: '742px' },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  }

  render() {
    const { tableDisplay, isOldUser } = this.state;
    const {
      allDs,
      customizeTable,
      isShowNewBid,
      uomControl,
      remote,
      productPlaceConfig,
    } = this.props;
    const {
      cuxSupplierModalCols = undefined,
      updateSupplierCb = undefined,
      CuxAllSummary,
      cuxDisplayNumStyle = {},
      cuxShowLink = undefined,
    } = remote?.props?.process || {};
    const colorStatus = (value) =>
      value === 'NOT_STARTED'
        ? 'c7n-tag-yellow'
        : value === 'FINISHED'
        ? 'c7n-tag-green'
        : value === 'CLOSED'
        ? 'c7n-tag-red'
        : 'c7n-tag-yellow';
    const columns = [
      {
        name: 'docInfoGroup',
        header: intl.get(`sprm.common.model.common.docInfoGroup`).d('采购申请单号信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'displayPrNum',
            width: 180,
            renderer: ({ value, record }) => (
              <div
                className="row-agent-column"
                style={record.get('urgentFlag') === 1 ? cuxDisplayNumStyle || {} : {}}
              >
                {`${value}-${record.get('displayLineNum')}`}
                {record.get('urgentFlag') === 1 ? (
                  <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                    <Icon
                      type="priority"
                      style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }}
                    />
                  </Tooltip>
                ) : null}
              </div>
            ),
          },
          {
            name: 'prNumLink',
            width: 180,
            title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
            renderer: ({ record }) => {
              const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
              const disabledBtnFlag = menuLeafNodes.findIndex(
                (node) => node.functionMenuCode === 'hzero.srm.requirement.prm.pr-platform'
              );
              const { dispatch } = this.props;
              return (
                <Button
                  onClick={() => {
                    dispatch(
                      routerRedux.push({
                        pathname: `/sprm/purchase-platform/noerp-detail/${record.get(
                          'prHeaderId'
                        )}`,
                      })
                    );
                  }}
                  funcType="link"
                  color="primary"
                  disabled={disabledBtnFlag === -1}
                >
                  {`${record.get('displayPrNum')}`}
                </Button>
              );
            },
          },
          {
            name: 'title',
            width: 150,
          },
          {
            name: 'prTypeName',
            width: 120,
          },
          {
            width: 120,
            name: 'prSourcePlatformMeaning',
          },
        ],
      },
      {
        name: 'purInfoGroup',
        header: intl.get(`sprm.common.model.common.purInfoGroup`).d('采买组织信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'companyName',
            width: 150,
          },
          {
            width: 120,
            name: 'ouName',
          },
          {
            name: 'purchaseOrgName',
            width: 120,
          },
          {
            name: 'invOrganizationName',
            width: 120,
          },
        ],
      },
      {
        name: 'createInfoGroup',
        header: intl.get(`sprm.common.model.common.createInfoGroup`).d('创建信息'),
        aggregation: true,
        width: 180,
        align: 'left',
        children: [
          {
            width: 120,
            name: 'creatorName',
          },
          {
            name: 'prRequestedName',
            width: 120,
            renderer: ({ value, record }) =>
              record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
          },
          {
            width: 120,
            name: 'unitName',
          },
          {
            width: 150,
            name: 'creationDate',
          },
          {
            name: 'requestDate',
            width: 150,
          },
        ],
      },
      {
        name: 'orderExecuteStatus',
        lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
        hidden: isOldUser,
        renderer: ({ value, record }) => {
          return record && record?.get('orderExecuteStatusMeaning') ? (
            <Tag
              className={classnames('c7n-tag-has-color', colorStatus(value))}
              style={{ border: 'none' }}
            >
              {record.get('orderExecuteStatusMeaning')}
            </Tag>
          ) : null;
        },
      },
      {
        name: 'sourceExecuteStatus',
        lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
        hidden: isOldUser,
        renderer: ({ value, record }) => {
          return record && record?.get('sourceExecuteStatusMeaning') ? (
            <Tag
              className={classnames('c7n-tag-has-color', colorStatus(value))}
              style={{ border: 'none' }}
            >
              {record.get('sourceExecuteStatusMeaning')}
            </Tag>
          ) : null;
        },
      },
      {
        name: 'sourceOccupiedQuantity',
        hidden: isOldUser,
        width: 100,
      },
      {
        name: 'orderOccupiedQuantity',
        hidden: isOldUser,
        width: 100,
      },
      {
        name: 'restSourceQuantity',
        hidden: isOldUser,
        width: 100,
      },
      {
        name: 'defaultOrderingAddress',
        width: 120,
      },
      {
        name: 'restPoQuantity',
        hidden: isOldUser,
        width: 100,
      },
      {
        name: 'downsStreamQuantity',
        width: 100,
      },
      {
        name: 'sourceDownsStreamQuantity',
        width: 100,
      },
      {
        name: 'lineInfoGroup',
        header: intl.get(`sprm.common.model.common.lineInfoGroup`).d('行信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            width: 100,
            name: 'displayLineNum',
          },
          {
            name: 'quantity',
            // renderer: ({ value, record }) => {
            //   return isNumber(record.get('uomPrecision'))
            //     ? (value.toString().split('.')[1]?.length ?? 0) <= record.get('uomPrecision')
            //       ? value
            //       : value.toFixed(record.get('uomPrecision'))
            //     : value;
            // },
            width: 120,
          },
          {
            name: 'uomCodeAndName',
            width: 120,
          },

          {
            name: 'neededDate',
            width: 150,
          },
          {
            name: 'supplierLov',
          },
        ],
      },
      {
        name: 'productInfoGroup',
        header: intl.get(`sprm.common.model.common.productInfoGroup`).d('物料/商品信息'),
        aggregation: true,
        width: 180,
        align: 'left',
        children: [
          { width: 140, name: 'itemCode' },
          { width: 120, name: 'itemName' },
          {
            name: 'categoryName',
            width: 120,
          },
          { name: 'itemModel', width: 120 },
          { name: 'itemSpecs', width: 120 },
          { name: 'supplierItemCode', width: 120 },
          { name: 'supplierItemName', width: 120 },
          { name: 'productBrand' },
          { name: 'productModel' },
          { name: 'packingList' },
        ],
      },
      {
        name: 'amountInfoGroup',
        header: intl.get(`sprm.common.model.common.amountInfoGroup`).d('单价/金额信息'),
        aggregation: true,
        width: 180,
        align: 'left',
        children: [
          {
            width: 120,
            name: 'currencyCode',
          },

          {
            name: 'taxIncludedUnitPrice',
            width: 150,
            renderer: ({ text, record }) => {
              return record.get('linePriceHiddenFlag') === 1
                ? record.get('taxIncludedUnitPriceMeaning')
                : text;
            },
          },
          {
            width: 100,
            name: 'unitPriceBatch',
            renderer: ({ value }) => thousandBitSeparator(value),
          },
          {
            name: 'taxIncludedLineAmount',
            renderer: ({ text, record }) =>
              record.get('linePriceHiddenFlag') === 1
                ? record.get('taxIncludedLineAmountMeaning')
                : text,
            width: 100,
          },
          {
            name: 'referencePriceDisplayFlag',
            width: 120,
            renderer: ({ value, record }) => {
              if (
                Number(value) === 1 &&
                productPlaceConfig &&
                ['ERP', 'SRM'].includes(record?.get('prSourcePlatform'))
              ) {
                return (
                  <ReferPriceProduct
                    currentRecord={record}
                    customizeTable={customizeTable}
                    cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
                  />
                );
              } else if (Number(value) === 1 || isFunction(cuxShowLink)) {
                return (
                  <ReferPrice
                    currentRecord={record}
                    customizeTable={customizeTable}
                    cuxShowLink={cuxShowLink}
                    cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
                  />
                );
              } else {
                return null;
              }
            },
          },
          {
            width: 120,
            name: 'taxIncludedBudgetUnitPrice',
            renderer: ({ text, record }) => {
              return record.get('linePriceHiddenFlag') === 1
                ? record.get('taxIncludedBudgetUnitPriceMeaning')
                : text;
            },
          },
          {
            name: 'budgetIoFlag',
            width: 120,
            renderer: this.isEnabledRender,
          },
        ],
      },
      {
        name: 'assignInfoGroup',
        header: intl.get(`sprm.common.model.common.assignInfoGroup`).d('分配信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'purchaseAgentName',
            width: 120,
          },
          {
            width: 200,
            name: 'executorName',
          },
          {
            width: 150,
            name: 'assignedDate',
          },
        ],
      },
      {
        name: 'orderInfoGroup',
        header: intl.get(`sprm.common.model.common.orderInfoGroup`).d('下单信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'orderSupplierLov',
            width: 180,
            editor: (record) => {
              const prSourcePlatformFlag = ['SRM', 'ERP', 'SHOP'].includes(
                record.get('prSourcePlatform')
              );
              const contractFlag = record
                .get('transferredDocumentTypeVOList')
                ?.some((e) =>
                  [
                    'TRANSFERABLE_CONTRACT_SIMPLE',
                    'TRANSFERABLE_CONTRACT_FRAMEWORK',
                    'TRANSFERABLE_CONTRACT',
                  ].includes(e.typeCode)
                );
              // srm，erp 的单据，开商品价格不能选lov，能转订单的单据=》只能选弹窗供应商
              if (
                productPlaceConfig &&
                ['SRM', 'ERP'].includes(record.get('prSourcePlatform')) &&
                record.get('prTransferredOrderFlag')
              ) {
                return false;
              } else if (
                prSourcePlatformFlag &&
                (record.get('prTransferredOrderFlag') ||
                  record.get('prTransferredOrderFlag') ||
                  contractFlag) &&
                allDs.selected.includes(record)
              ) {
                // 电商，目录化单据，不能选lov,不转订单不转协议的单据也不能选lov
                return (
                  <Lov
                    name="orderSupplierLov"
                    onChange={(dataList) => {
                      if (isFunction(updateSupplierCb)) {
                        updateSupplierCb(record, dataList || {}, 'allSingleGetSupplier');
                      }
                    }}
                  />
                );
              } else {
                return false;
              }
            },
            renderer: ({ record }) =>
              ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))
                ? record.get('selectDisplaySupplierCompanyName')
                : null,
          },
          {
            name: 'prReferencePriceLibraryVO',
            width: 180,
            renderer: ({ record }) =>
              !isEmpty(record.get('prReferencePriceLibraryVO')) ? (
                <a onClick={() => this.handleOrderPrice(record)}>
                  {intl.get('sprm.common.model.executeBill.orderPriceInfo').d('订单价格信息')}
                </a>
              ) : null,
          },
          {
            name: 'thisOrderQuantity',
            width: 120,
            editor: (record) => {
              return !!(allDs.selected.includes(record) && record.get('prTransferredOrderFlag'));
            },
          },
          {
            name: 'ecLimitQuantity',
            width: 120,
          },
          {
            name: 'restPoQuantity',
            width: 120,
          },
          {
            name: 'noUnitPrice',
            width: 120,
          },
        ],
      },
      {
        name: 'executionInfoGroup',
        header: intl.get(`sprm.common.model.common.executionInfoGroup`).d('执行信息'),
        aggregation: true,
        align: 'left',
        width: 210,
        children: [
          {
            width: 210,
            name: 'transferredDocumentTypeVOList',
            renderer: ({ value = [] }) => {
              return !isEmpty(value) ? (
                <Tooltip>
                  {value?.map((item) => (
                    <Tag
                      className={classnames('c7n-tag-has-color', 'c7n-tag-yellow')}
                      style={{ border: 'none' }}
                    >
                      {item.typeCodeMeaning}
                    </Tag>
                  ))}
                </Tooltip>
              ) : null;
            },
          },
          { name: 'secondLevelStrategyCode' },
          { name: 'orderSecondLevelStrategyCode' },
          {
            width: 150,
            name: 'executionStrategyMeaning',
          },
          {
            name: 'executionStatusMeaning',
            width: 120,
          },
          {
            width: 120,
            name: 'executionHeaderBillNum',
          },
          {
            width: 120,
            name: 'changeOrderCode',
            renderer: ({ value, record }) => ChangeOrderCodeRender({ record, value }),
          },
          {
            name: 'erpEditStatus',
            width: 120,
          },
        ],
      },
      {
        name: 'projectInfoGroup',
        header: intl.get(`sprm.common.model.common.projectInfoGroup`).d('项目信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          { width: 120, name: 'projectCategoryMeaning' },
          { name: 'projectNum', width: 120 },
          { name: 'projectName', width: 120 },
        ],
      },
      {
        name: 'otherInfoGroup',
        header: intl.get(`sprm.common.model.common.otherInfoGroup`).d('其他信息'),
        aggregation: true,
        align: 'left',
        children: [
          // {
          //   name: 'prLineStatusCodeMeaning',
          //   width: 100,
          // },
          // {
          //   name: 'accountAssignTypeCode',
          //   width: 120,
          // },
          // {
          //   name: 'itemAbcClass',
          //   width: 180,
          // },
          // {
          //   name: 'inventoryName',
          //   width: 120,
          // },
          { width: 120, name: 'wbs', type: 'string' },
          {
            width: 120,
            name: 'remark',
          },
          {
            width: 120,
            name: 'attachmentUuid',
          },
          {
            width: 100,
            name: 'operatorRecord',
            renderer: ({ record }) => (
              <a onClick={() => this.handleActHistory(record)}>
                {intl.get(`hzero.common.button.operating`).d('操作记录')}
              </a>
            ),
          },
        ],
      },
      {
        name: 'secondaryTaxInUnitPrice',
        width: 150,
        renderer: ({ text, record }) => {
          return record.get('linePriceHiddenFlag') === 1
            ? record.get('taxIncludedUnitPriceMeaning')
            : text;
        },
      },
      { name: 'secondaryQuantity', width: 120 },
      {
        name: 'secondaryUomName',
        width: 120,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      {
        width: 120,
        name: 'projectTaskId',
      },
      {
        width: 120,
        name: 'priceSource',
      },
      {
        width: 120,
        name: 'priceEcPlatformCode',
      },
      {
        name: 'outsourcingBomFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'outsourcingBom',
        width: 150,
        renderer: ({ record }) =>
          record?.get('outsourcingBomFlag') ? (
            <OutsourcingBom
              record={record}
              readOnly
              customizeTable={customizeTable}
              custCode="SPRM.PURCHASE_PLAFORM_QUERY.OUTSOURCINGBOM"
            />
          ) : null,
      },
      {
        name: 'chooseSupplier',
        width: 120,
        editor: false,
        renderer: ({ record }) => {
          if (
            ['SRM', 'ERP'].includes(record.get('prSourcePlatform')) &&
            productPlaceConfig &&
            record.get('prTransferredOrderFlag')
          ) {
            return (
              <SupplierModal
                currentRecord={record}
                sourceType="all"
                updateSupplierCb={updateSupplierCb}
                cuxSupplierModalCols={cuxSupplierModalCols}
              />
            );
          } else {
            return null;
          }
        },
      },
    ];

    const { SPRM, SODR, SPCM, RFX } = uomControl || {};

    const baseUomInfo =
      SPRM === 1 || SODR === 1 || SPCM === 1 || RFX === 1
        ? []
        : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
    const productPriceList = productPlaceConfig
      ? []
      : ['defaultOrderingAddress', 'chooseSupplier', 'prPriceSource', 'productEcSourceFrom'];

    const { initCuxPageSize = ['10', '20', '50', '100', '200'] } = remote?.props?.process || {};

    const cuxColumns = remote
      ? remote.process('SPRM_PURCHASE_EXECUTION_ALL.COLUMNS', columns, { dataSet: allDs })
      : columns;
    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_EXECUTION_ALL.PURCHASE_LIST',
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            aggregation={tableDisplay !== 'flat'}
            searchCode="SPRM.PURCHASE_EXECUTION_ALL.FILTER"
            dataSet={allDs}
            columns={cuxColumns.filter(
              (ele) => ![...baseUomInfo, ...productPriceList].includes(ele.name)
            )}
            queryFieldsLimit={3}
            cacheState
            virtual
            virtualCell
            virtualSpin
            pagination={{
              pageSizeOptions: initCuxPageSize || ['10', '20', '50', '100', '200'],
            }}
            searchBarConfig={{
              right: {
                render: () => (
                  <ViewFilter
                    tableDisplay={tableDisplay}
                    setDisplayStatus={this.setDisplayStatus}
                  />
                ),
              },
              left: {
                render: () => (
                  <div>
                    {CuxAllSummary && <CuxAllSummary dataSet={allDs} />}
                    <MutlTextFieldSearch
                      name="multiSelectHeaderAndLineNums"
                      dataSet={allDs}
                      placeholder={intl
                        .get('sprm.common.modal.enterPrNumOrLineNum')
                        .d('请输入采购申请单号-行号')}
                    />
                  </div>
                ),
              },
              editorProps: {
                executionStrategyCode: {
                  optionsFilter: (options) =>
                    isOldUser
                      ? options.data.value !== 'BEFORE_SOURCE_AFTER_ORDER' &&
                        options.data.value !== 'SOURCE_AND_ORDER'
                      : true,
                },
                secondLevelStrategyCode: {
                  optionsFilter: (options) => {
                    return isShowNewBid ? true : options.data.value !== 'SOURCE_BID_NEW';
                  },
                },
              },
              fieldProps: {
                executorBys: { lovPara: { tenantId: organizationId } },
                tempKey: { lovPara: { tenantId: organizationId } },
                supplierList: { lovPara: { tenantId: organizationId } },
              },
              onFieldChange: this.onChangeField,
              onQuery: this.handleQuery,
              onClear: this.resetQueryDs,
              onReset: this.resetQueryDs,
            }}
            onAggregationChange={(_aggregation) => this.setDisplayStatus(_aggregation)}
          />
        )}
      </div>
    );
  }
}
