import React, { Component } from 'react';
import { Tooltip, Button, Lov } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { isEmpty, cloneDeep, isNil } from 'lodash';
import { thousandBitSeparator } from '@/routes/utils.js';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { routerRedux } from 'dva/router';
import ReferPrice from '@/routes/components/ReferPrice';
import ReferPriceProduct from '@/routes/components/ReferPriceProduct';
import { createPcOrderVerified, updateSupplier } from '@/services/purchaseExecutionService';
import ViewFilter from '@/routes/components/ViewFilter';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import urgentImg from '@/assets/icon-expedited.svg';
import { Tag } from 'choerodon-ui';
import classnames from 'classnames';

import { getResponse } from 'utils/utils';

const commonPrompt = 'sprm.common.model.common';
@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
export default class TransferContract extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      tableDisplay: 'flat',
    };
  }

  @Bind()
  setDisplayStatus(tableDisplay) {
    this.setState({
      tableDisplay,
    });
  }

  // 渲染状态列
  @Bind()
  isEnabledRender({ value }) {
    const btns = [];
    btns.push(yesOrNoRender(Number(value)));
    return btns;
  }

  @Bind()
  async handleCreate() {
    const { contractDs, dispatch, clearSelectAll, visibleOldContractSheet, remote } = this.props;
    const selectedPurchaseContracts = contractDs?.selected?.map((ele) => ele.toData());
    if (isEmpty(selectedPurchaseContracts)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: contractDs,
        currentPage: 'contractCheck',
      });
      if (beforeCreateCheck === false) {
        return false;
      }
    }
    createPcOrderVerified(selectedPurchaseContracts).then((res) => {
      if (res && res.failed) {
        notification.error({ message: res.message });
      } else if (isEmpty(res)) {
        // 合并头信息
        const headerInfo = [
          'supplierTenantId',
          'supplierCompanyId',
          'supplierCompanyName',
          'supplierId',
          'supplierName',
          'ouId',
          'ouName',
          'purchaseOrgId',
          'purchaseOrgName',
          'purchaseAgentId',
          'purchaseAgentName',
          'companyOrgName',
          'companyOrgId',
          'costAnchDepId',
          'costAnchDepDesc',
          'overseasProcurement',
          'companyId',
          'companyName',
          'executionStrategyCode',
          'secondLevelStrategyCode',
          'orderSecondLevelStrategyCode',
          'transferredDocumentTypeVOList',
          'selectSupplierCompanyId',
          'selectSupplierCompanyName',
          'selectSupplierTenantId',
          'selectLocalSupplierId',
          'selectLocalSupplierName',
          'recommendSupplierFlag',
        ].reduce((obj, filedNames) => {
          const [filedName, targetFiledName] = [].concat(filedNames);
          const _headerInfo = obj;
          // 当前字段在选择项中不同值集合
          const diffValues = new Set(
            selectedPurchaseContracts?.map((purchaseContract) => {
              if (purchaseContract[filedName]) {
                return purchaseContract[filedName];
              } else {
                return null;
              }
            })
          );
          diffValues.delete(null);
          if (diffValues.size === 1) {
            [_headerInfo[targetFiledName || filedName]] = diffValues;
          }
          return _headerInfo;
        }, {});
        headerInfo.pcSourceCodeMeaning = intl.get(`spcm.common.model.purchaseDemand`).d('采购需求');
        headerInfo.pcSourceCode = 'PURCHASE_NEED';

        const {
          transferredDocumentTypeVOList,
          selectSupplierCompanyId,
          selectSupplierTenantId,
          selectSupplierCompanyName,
          selectLocalSupplierId,
          selectLocalSupplierName,
        } = headerInfo || {};
        if (headerInfo.recommendSupplierFlag === 1) {
          headerInfo.supplierTenantId = selectSupplierTenantId;
          headerInfo.supplierCompanyId = selectSupplierCompanyId;
          headerInfo.supplierCompanyName = selectSupplierCompanyName;
          headerInfo.supplierId = selectLocalSupplierId;
          headerInfo.supplierName = selectLocalSupplierName;
        }
        if (transferredDocumentTypeVOList?.length === 2) {
          headerInfo.acceptExecuteType = null;
        } else if (transferredDocumentTypeVOList?.typeCode === 'SIMPLE') {
          headerInfo.acceptExecuteType = 'CONTRACT_SIMPLE';
        } else if (transferredDocumentTypeVOList?.typeCode === 'FRAMEWORK') {
          headerInfo.acceptExecuteType = 'CONTRACT_FRAMEWORK';
        }
        // 合并协议标行
        const contractSubjects = cloneDeep(selectedPurchaseContracts)?.map((_subject) => {
          const subject = _subject;
          delete subject.$form;
          subject.deliverDate = subject.neededDate;
          subject.address = subject.location;
          subject.sourceCode = subject.prNum;
          subject.sourceLineNum = subject.lineNum;
          subject.prLineNum = subject.lineNum;
          // subject.quantity = subject.availableQuantity;
          subject.specifications = subject.itemSpecs;
          subject.model = subject.itemModel;
          return subject;
        });
        const contractMaintain = {
          headerInfo,
          pcSubjectDataSource: contractSubjects,
        };
        const itemKey = visibleOldContractSheet
          ? `spcm.contractMaintain.${Math.random()}`
          : `spcm.workSpace.${Math.random()}`;
        window.sessionStorage.setItem(itemKey, JSON.stringify(contractMaintain));
        if (!visibleOldContractSheet) {
          const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
          const linkRouteFlag = menuLeafNodes.some(
            (node) => node.functionMenuCode === 'srm.pc-admin.pc-purchaser.workspace2'
          );
          if (linkRouteFlag) {
            dispatch(
              routerRedux.push({
                pathname: '/spcm/contract-workspace/create',
                search: `?from=purchaseContract&itemKey=${itemKey}`,
              })
            );
          } else {
            notification.warning({
              message: intl
                .get('sprm.common.model.excute.link')
                .d('当前角色无对应菜单权限，请添加权限后再操作。'),
            });
          }
        } else {
          const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
          const linkRouteFlag = menuLeafNodes.some(
            (node) => node.functionMenuCode === 'srm.pc-admin.pc-purchaser.maintain'
          );
          if (linkRouteFlag) {
            dispatch(
              routerRedux.push({
                pathname: '/spcm/contract-maintain/detail',
                search: `?from=purchaseContract&itemKey=${itemKey}`,
              })
            );
          } else {
            notification.warning({
              message: intl
                .get('sprm.common.model.excute.link')
                .d('当前角色无对应菜单权限，请添加权限后再操作。'),
            });
          }
        }

        clearSelectAll(contractDs);
      }
    });
  }

  // 选值集
  @Bind()
  changeSupplier(dataList) {
    const { contractDs } = this.props;
    const currentDate = contractDs.current;
    if (dataList) {
      const {
        supplierCompanyId,
        supplierTenantId,
        supplierCompanyNum,
        supplierCompanyName,
        unitPrice,
        uomId,
        uomName,
        currencyCode,
        taxId,
        taxRate,
        enteredTaxIncludedPrice,
        netPrice,
        priceLibId,
        priceLibraryId,
        taxIncludedPrice,
        unitPriceBatch,
        holdPcHeaderId,
        holdPcLineId,
        contractNum,
        supplierName,
        supplierId,
        supplierNum,
        benchmarkPriceType,
        ladderPriceLibId,
        ladderQuotationFlag,
        priceLibraryStatus,
      } = dataList;
      // eslint-disable-next-line no-unused-expressions
      currentDate?.set({
        selectSupplierCompanyId: supplierCompanyId,
        selectSupplierTenantId: supplierTenantId,
        selectSupplierCode: supplierCompanyNum,
        selectSupplierCompanyName: supplierCompanyName,
        noUnitPrice: unitPrice,
        priceLibraryStatus,
        selectLocalSupplierCode: isNil(supplierCompanyId) ? null : supplierNum,
        selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
        selectLocalSupplierName: isNil(supplierCompanyId) ? null : supplierName,
      });
      if (priceLibId) {
        // eslint-disable-next-line no-unused-expressions
        currentDate?.set({
          uomId,
          uomName,
          currencyCode,
          taxId,
          taxRate,
          noUnitPrice: netPrice,
          unitPrice: netPrice,
          priceLibraryId,
          priceLibId,
          priceLibraryStatus: priceLibraryStatus || 'VALID',
          taxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
          unitPriceBatch,
          holdPcHeaderId,
          holdPcLineId,
          contractNum,
          benchmarkPriceType,
          ladderPriceLibId,
          ladderQuotationFlag,
          originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
          enteredTaxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
          selectLocalSupplierCode: isNil(supplierId) ? null : supplierNum,
          selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
          selectLocalSupplierName: isNil(supplierId) ? null : supplierName,
        });
      }
    } else {
      // eslint-disable-next-line no-unused-expressions
      currentDate?.set({
        selectSupplierCompanyId: null,
        selectSupplierCode: null,
        selectSupplierTenantId: null,
        selectSupplierCompanyName: null,
        noUnitPrice: null,
        selectLocalSupplierId: null,
        selectLocalSupplierCode: null,
        selectLocalSupplierName: null,
        priceLibraryId: null,
      });
    }
  }

  @Bind()
  handleQuery({ params = {} }) {
    const { contractDs, location = {} } = this.props;
    const { _back } = location?.state || {};
    const { customizeOrderField = undefined } = params;
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = contractDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (
          ![
            'multiSelectHeaderNums',
            'supplierCompanyId',
            'supplierId',
            'localSupplierIds',
            'platformSupplierIds',
            'multiSelectHeaderAndLineNums',
          ].includes(key)
        ) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    contractDs.setQueryParameter('customizeOrderField', customizeOrderField);
    // eslint-disable-next-line no-unused-expressions
    contractDs.queryDataSet.current
      ? contractDs.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : contractDs.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1) {
      contractDs.query(contractDs.currentPage);
    } else {
      contractDs.query();
    }
  }

  // 更新推荐供应商
  @Bind()
  async handleUpdateSupplier() {
    const { contractDs } = this.props;
    const data = contractDs.selected?.map((ele) => {
      const newDate = ele.toJSONData();
      return { ...newDate };
    });
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    const res = await updateSupplier(data);
    if (getResponse(res)) {
      contractDs.selected.forEach((i) => {
        const currentLine = res.find((t) => t.prLineId === i.get('prLineId'));
        const {
          uomId,
          uomName,
          currencyCode,
          taxId,
          taxRate,
          netPrice,
          priceLibId,
          priceLibraryId,
          taxIncludedPrice,
          unitPriceBatch,
          holdPcHeaderId,
          holdPcLineId,
          contractNum,
          benchmarkPriceType,
          ladderPriceLibId,
          priceLibraryStatus,
          ladderQuotationFlag,
          enteredTaxIncludedPrice,
          selectSupplierCompanyId,
          selectSupplierTenantId,
          selectSupplierCode,
          selectSupplierCompanyName,
          selectLocalSupplierId,
          selectLocalSupplierCode,
          selectLocalSupplierName,
          skuId,
          prPriceSource,
        } = currentLine || {};
        if (currentLine && prPriceSource === 'PRICE_LIBRARY') {
          i.set({
            uomId,
            uomName,
            currencyCode,
            taxId,
            taxRate,
            noUnitPrice: netPrice,
            unitPrice: netPrice,
            priceLibId,
            priceLibraryStatus: priceLibraryStatus || 'VALID',
            taxIncludedPrice: enteredTaxIncludedPrice,
            unitPriceBatch,
            holdPcHeaderId,
            holdPcLineId,
            contractNum,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
            enteredTaxIncludedPrice,
            selectSupplierCompanyId,
            selectSupplierTenantId,
            selectSupplierCode,
            selectSupplierCompanyName,
            selectLocalSupplierId,
            selectLocalSupplierCode,
            selectLocalSupplierName,
            supplierLov: {
              priceLibraryId,
              supplierCompanyId: selectSupplierCompanyId,
              supplierTenantId: selectSupplierTenantId,
              supplierCompanyNum: selectSupplierCode,
              supplierCompanyName: selectSupplierCompanyName,
              displaySupplierCompanyName: selectSupplierCompanyName || selectLocalSupplierName,
              selectLocalSupplierId,
              displaySupplierCompanyId: selectLocalSupplierId,
              displaySupplierCompanyNum: selectLocalSupplierCode,
              selectLocalSupplierName,
              netPrice,
            },
          });
        } else if (currentLine && skuId) {
          i.reset();
          i.set({
            supplierLov: null,
          });
        }
      });

      notification.success();
    }
  }

  @Bind()
  resetQueryDs() {
    const { contractDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    contractDs.queryDataSet?.current?.reset();
  }

  @Bind()
  onChangeField({ name, value, record }) {
    const { contractDs } = this.props;
    if (name === 'tempKey') {
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
        contractDs.queryDataSet?.current?.set({
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
        contractDs.queryDataSet?.current?.set({
          localSupplierIds: isEmpty(localSupplierIds) ? undefined : localSupplierIds.join(','),
          platformSupplierIds: isEmpty(platformSupplierIds)
            ? undefined
            : platformSupplierIds.join(','),
        });
      }
    } else if (!value) {
      // eslint-disable-next-line no-unused-expressions
      contractDs.queryDataSet?.current?.set({ [name]: undefined });
    }
  }

  render() {
    const { contractDs, customizeTable, uomControl, remote, productPlaceConfig } = this.props;
    const { cuxReferPriceLable = '' } = remote?.props?.process || {};
    const { tableDisplay } = this.state;
    const columns = [
      {
        name: 'docInfoGroup',
        header: intl.get(`sprm.common.model.common.docInfoGroup`).d('采购申请单号信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'prNum',
            width: 160,
            fixed: 'left',
            renderer: ({ value, record }) => (
              <div className="row-agent-column">
                {`${value}-${record.get('displayLineNum')}`}
                {record.get('urgentFlag') === 1 ? (
                  <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                    <img src={urgentImg} alt="img" />
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
                  {`${record.get('prNum')}`}
                </Button>
              );
            },
          },
          {
            name: 'reqTypeCode',
            width: 140,
          },
          {
            name: 'prRequestedName',
            width: 160,
            renderer: ({ value, record }) =>
              record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
          },
          {
            name: 'prSourcePlatformMeaning',
            width: 160,
          },
          {
            name: 'creationDate',
            width: 160,
          },
        ],
      },
      {
        name: 'purInfoGroup',
        header: intl.get(`sprm.common.model.common.purInfoGroup`).d('采买组织信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'ouName',
            width: 200,
          },
          {
            name: 'purchaseOrgName',
            width: 200,
          },
          {
            name: 'agentName',
            width: 160,
          },
          {
            name: 'invOrganizationName',
            width: 200,
          },
        ],
      },
      {
        name: 'lineInfoGroup',
        header: intl.get(`sprm.common.model.common.lineInfoGroup`).d('行信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'lineNum',
            width: 100,
            fixed: 'left',
            renderer: ({ record }) => record.get('displayLineNum'),
          },
          {
            name: 'uomCodeAndName',
            width: 120,
          },
          {
            name: 'quantity',
            width: 100,
          },

          {
            name: 'neededDate',
            width: 150,
          },
        ],
      },
      {
        name: 'productInfoGroup',
        header: intl.get(`sprm.common.model.common.productInfoGroup`).d('物料/商品信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'itemCode',
            fixed: 'left',
            width: 120,
          },
          {
            name: 'itemName',
            width: 120,
          },
          {
            name: 'categoryName',
            width: 120,
          },
          {
            name: 'productNum',
            width: 120,
          },
          {
            name: 'productName',
            width: 120,
          },
          {
            name: 'catalogName',
            width: 160,
          },
        ],
      },
      {
        name: 'amountInfoGroup',
        header: intl.get(`sprm.common.model.common.amountInfoGroup`).d('单价/金额信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'taxIncludedUnitPrice',
            width: 120,
            renderer: ({ value, record }) =>
              thousandBitSeparator(value, record.get('financialPrecision')),
          },
          {
            name: 'secondaryTaxInUnitPrice',
            width: 120,
            renderer: ({ value, record }) =>
              thousandBitSeparator(value, record.get('financialPrecision')),
          },
          {
            name: 'taxCode',
            width: 120,
          },
          {
            name: 'taxRate',
            width: 120,
          },
          {
            name: 'currencyCode',
            width: 120,
          },
        ],
      },
      {
        name: 'orderInfoGroup',
        header: intl.get(`sprm.common.model.common.orderInfoGroup`).d('下单信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'occupiedQuantity',
            renderer: ({ record }) => record.get('availableQuantity'),
            width: 140,
          },
          {
            name: 'supplierCode',
            width: 120,
          },
          {
            name: 'supplierName',
            width: 160,
          },
          {
            name: 'invoiceAddress',
            width: 160,
          },
          {
            name: 'locationMeaning',
            width: 160,
          },
          {
            name: 'contractDocType',
            width: 160,
            renderer: ({ record }) => {
              return record
                .get('transferredDocumentTypeVOList')
                ?.map((e) => (
                  <Tag className={classnames('c7n-tag-has-color', 'notice-tag')}>
                    {e?.typeCodeMeaning}
                  </Tag>
                ));
            },
          },
        ],
      },
      {
        name: 'executionInfoGroup',
        header: intl.get(`sprm.common.model.common.executionInfoGroup`).d('执行信息'),
        aggregation: true,
        align: 'left',
        width: 180,
        children: [
          {
            name: 'urgentFlag',
            renderer: this.isEnabledRender,
            width: 160,
          },
          {
            name: 'executorName',
            width: 100,
          },
          {
            name: 'supplierLov',
            width: 140,
            editor: (record) => {
              const renderFlag = ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'));
              // return renderFlag;
              return renderFlag ? (
                <Lov name="supplierLov" onChange={this.changeSupplier} />
              ) : (
                renderFlag
              );
            },
          },
          {
            name: 'referencePriceFlag',
            width: 120,
            renderer: ({ value, record }) => {
              if (
                value &&
                productPlaceConfig &&
                ['ERP', 'SRM'].includes(record?.get('prSourcePlatform'))
              ) {
                return (
                  <ReferPriceProduct
                    currentRecord={record}
                    cuxLable={cuxReferPriceLable}
                    customizeTable={customizeTable}
                    cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
                  />
                );
              } else if (value) {
                return (
                  <ReferPrice
                    currentRecord={record}
                    cuxLable={cuxReferPriceLable}
                    customizeTable={customizeTable}
                    cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
                  />
                );
              } else {
                return null;
              }
            },
            // renderer: ({ value, record }) => {
            //   return value ? (
            //     <ReferPrice
            //       currentRecord={record}
            //       cuxLable={cuxReferPriceLable}
            //       customizeTable={customizeTable}
            //       cusCode="SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL"
            //     />
            //   ) : null;
            // },
          },
          {
            name: 'urgentDate',
            width: 150,
          },
          {
            name: 'executionStatusCodeMeaning',
            width: 150,
          },
        ],
      },
      {
        name: 'projectInfoGroup',
        header: intl.get(`sprm.common.model.common.projectInfoGroup`).d('项目信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'projectNum',
            width: 160,
          },
          {
            name: 'projectName',
            width: 160,
          },
        ],
      },
      {
        name: 'expenseInfoGroup',
        header: intl.get(`sprm.common.model.common.expenseInfoGroup`).d('费用承担信息'),
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'costAnchDepDesc',
            width: 160,
          },
          // {
          //   name: 'expBearDep',
          //   width: 160,
          // },
          {
            name: 'expBearDep',
            renderer: ({ record }) => record.get('expBearDepName'),
          },
        ],
      },
      {
        name: 'secondaryUomName',
        renderer: ({ value, record }) => record.get('secondaryUomCodeAndName') || value,
      },
      {
        name: 'secondaryQuantity',
        width: 100,
      },
      {
        name: 'secondaryTaxInUnitPrice',
        width: 120,
        renderer: ({ value, record }) =>
          thousandBitSeparator(value, record.get('financialPrecision')),
      },
      {
        width: 120,
        name: 'projectTaskId',
      },
    ];

    const baseUomInfo =
      uomControl?.SPRM === 1 || uomControl?.SPCM === 1
        ? []
        : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
    const { initCuxPageSize = ['10', '20', '50', '100', '200'] } = remote?.props?.process || {};

    return (
      <div style={{ height: 'calc(100vh - 254px)' }}>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_EXECUTION_ALL.CONTRACT_LIST',
          },
          <SearchBarTable
            aggregation={tableDisplay !== 'flat'}
            searchCode="SPRM.PURCHASE_EXECUTION_ALL.CONTRACT_FILTER"
            dataSet={contractDs}
            columns={columns.filter((ele) => !baseUomInfo.includes(ele.name))}
            style={{ maxHeight: 'calc(100% - 22px)' }}
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
                  <MutlTextFieldSearch
                    name="multiSelectHeaderAndLineNums"
                    dataSet={contractDs}
                    placeholder={intl
                      .get('sprm.common.modal.enterPrNumOrLineNum')
                      .d('请输入采购申请单号-行号')}
                  />
                ),
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
