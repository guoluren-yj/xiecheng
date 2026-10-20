import { DataSet } from 'choerodon-ui/pro';
import React, { Fragment, useImperativeHandle, useState, useEffect, useMemo } from 'react';
// import intl from 'utils/intl';
// import { observer } from 'mobx-react-lite';
// import uuid from 'uuid/v4';
// import notification from 'utils/notification';
// import CommonImport from 'hzero-front/lib/components/Import';
// import { PRIVATE_BUCKET } from '_utils/config';
// import {
//   getCurrentOrganizationId,
//   getResponse
// } from 'utils/utils';
import {
  // fetchAutoGetCompany,
  fetchCategory,
  // deleteLines,
  fetchDoExecute,
} from '@/services/RequisitionPlanServices';
import notification from 'utils/notification';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { lineDs } from '../indexDS';

let proxyDsCreate;
// const commonPrompt = 'srpm.common.model.common';
// const organizationId = getCurrentOrganizationId();
const Index = React.forwardRef(
  (
    {
      rpHeaderId,
      handleDetailField, // commonUpdate,
      customizeTable, // updateHeaderDate,
      getHeaderInfo,
      sourcePlatformObj,
      handleLineDsUpdate,
      handleNotRpItemCodeChange,
    },
    ref
  ) => {
    const [init, setInit] = useState(false);
    // const [delLoading, setDelLoading] = useState(false);
    const [itemLimitRule, setItemLimitRule] = useState([]);
    const [allready, setAllready] = useState(false);

    // const itemLimitRule = [];

    const lineTableDs = useMemo(
      () =>
        new DataSet({
          ...lineDs({
            rpHeaderId,
            getHeaderInfo,
            handleDetailField,
            itemLimitRule,
            customizeUnitCode:
              'SRPM.RP_PLATFORM_ERP_CREATE.LINEINFO,SRPM.RP_PLATFORM_ERP_CREATE.LINE_SEARCH',
          }),
          events: {
            update: ({ name, record, value }) => {
              const { rpSourcePlatform = 'REQUEST_PLAN' } = sourcePlatformObj;
              if (name === 'invOrganizationId') {
                if (itemLimitRule?.find((rule) => rule === 'invOrganizationId')) {
                  if (record.get('itemId')) {
                    record.set({
                      itemCode: null,
                      itemModel: undefined,
                      itemSpecs: undefined,
                      uomId: null,
                      categoryId: null,
                      taxId: null,
                      taxCode: null,
                      taxRate: null,
                    });
                  }
                }
              }
              if (name === 'itemCode') {
                if (value) {
                  const {
                    chartCode,
                    drawingVersion,
                    partnerItemId,
                    itemName,
                    model,
                    itemId,
                    primaryUomId,
                    specifications,
                    lastPurchasePrice,
                    uomCode,
                    uomId,
                    poLineId,
                    customMadeFlag,
                    uomName,
                    taxId,
                    taxCode,
                    taxRate,
                    uomPrecision,
                  } = value || {};
                  if (!rpSourcePlatform || rpSourcePlatform === 'REQUEST_PLAN') {
                    record.set({
                      itemName,
                      poLineId,
                      chartCode,
                      drawingVersion,
                      itemModel: model,
                      primaryUomId,
                      customMadeFlag,
                      itemSpecs: specifications,
                      taxId: {
                        taxId,
                        taxCode,
                        taxRate,
                      },
                      lastPurchasePrice,
                      uomId: {
                        uomCode,
                        uomId,
                        uomName,
                        uomPrecision,
                        // uomCodeAndName: `${uomCode}/${uomName}`,
                        // uomCodeAndName: uomCodeAndNameRule ? `${uomCode}/${uomName}` : uomName,
                      },
                      categoryId: null,
                    });
                  } else {
                    record.set({
                      itemName,
                      chartCode,
                      drawingVersion,
                      primaryUomId,
                      categoryId: null,
                    });
                    if (typeof handleNotRpItemCodeChange === 'function') {
                      handleNotRpItemCodeChange({ value, record, rpSourcePlatform });
                    }
                  }
                  if (itemId) {
                    fetchCategory({
                      itemId: partnerItemId || itemId,
                      enabledFlag: 1,
                      defaultFlag: 1,
                    }).then((res) => {
                      if (res && res.length === 1) {
                        const [{ categoryId, categoryCode, categoryName }] = res;
                        record.set({
                          categoryId: { categoryId, categoryCode, categoryName },
                        });
                      }
                    });
                  }
                } else if (!rpSourcePlatform || rpSourcePlatform === 'REQUEST_PLAN') {
                  record.set({
                    itemName: undefined,
                    poLineId: undefined,
                    lastPurchasePrice: undefined,
                    chartCode: undefined,
                    drawingVersion: undefined,
                    itemModel: undefined,
                    primaryUomId: undefined,
                    itemSpecs: undefined,
                    customMadeFlag: undefined,
                    customAttributeList: undefined,
                    categoryId: null,
                    taxId: null,
                    taxCode: null,
                    taxRate: null,
                    uomId: null,
                  });
                }
              }
            },
          },
        }),
      [itemLimitRule]
    );

    useEffect(() => {
      if (handleLineDsUpdate && typeof handleLineDsUpdate === 'function' && lineTableDs) {
        lineTableDs.addEventListener('update', handleLineDsUpdate);
        return () => {
          lineTableDs.removeEventListener('update', handleLineDsUpdate);
        };
      }
    }, [lineTableDs]);

    const lineColumns = () => {
      const columns = [
        {
          name: 'displayLineNum',
          width: 100,
        },
        {
          name: 'invOrganizationId',
          width: 180,
        },
        {
          name: 'itemCode',
          width: 150,
        },
        {
          name: 'itemName',
          width: 180,
        },
        {
          name: 'categoryId',
          width: 150,
        },
        {
          name: 'itemModel',
          width: 100,
        },
        {
          name: 'itemSpecs',
          width: 100,
        },
        {
          name: 'uomId',
          width: 120,
        },
        {
          name: 'neededDate',
          width: 150,
        },
        {
          name: 'quantity',
          width: 100,
        },
        {
          name: 'taxId',
          width: 100,
        },
        {
          name: 'taxRate',
          width: 100,
        },
        {
          name: 'taxIncludedUnitPrice',
          width: 120,
        },
        {
          name: 'unitPrice',
          width: 120,
        },
        {
          name: 'taxIncludedLineAmount',
          width: 120,
        },
        {
          name: 'lineAmount',
          width: 120,
        },
        {
          name: 'localCurrencyNoTaxSum',
          width: 120,
        },
        {
          name: 'localCurrencyNoTaxUnit',
          width: 120,
        },
        {
          name: 'localCurrencyTaxSum',
          width: 120,
        },
        {
          name: 'localCurrencyTaxUnit',
          width: 120,
        },
        {
          name: 'remark',
          width: 180,
        },
        {
          name: 'attachmentUuid',
          width: 120,
        },
      ];
      return columns;
    };
    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadLineDate,
      saveCurrentData,
      ref: ref.current,
    }));

    const saveCurrentData = () => {
      return lineTableDs;
    };

    const loadLineDate = async (currentId) => {
      if (!init) {
        proxyDsCreate = {
          createNow: true,
          proxyQuery: () => loadLinesData(currentId),
        };
        setInit(true);
      } else {
        await loadLinesData(currentId);
      }
    };

    const loadLinesData = async (currentId) => {
      if (allready) {
        lineTableDs.setQueryParameter('currentId', currentId);
        await lineTableDs.query();
      }
    };

    // 删除采购申请行
    // const handleLineDelete = () => {
    //   const { selected } = lineTableDs;
    //   const deleUpdateArr = selected.filter((ele) => ele.get('rpLineId'));
    //   if (deleUpdateArr.length > 0) {
    //     setDelLoading(true);
    //     const deleteLine = deleUpdateArr.map((ele) => ele.toJSONData());
    //     deleteLines({ prLines: deleteLine })
    //       .then((res) => {
    //         if (getResponse(res)) {
    //           commonUpdate();
    //           notification.success();
    //         }
    //       })
    //       .finally(() => {
    //         setDelLoading(false);
    //       });
    //   } else {
    //     lineTableDs.remove(selected);
    //   }
    // };

    // const handleCreate = () => {
    //   const initLineData = {
    //     ouId: handleDetailField('purchaseOrgInfoRef', 'ouId')?.ouId,
    //     companyId: handleDetailField('purchaseOrgInfoRef', 'companyId')?.companyId,
    //     purchaseAgentId: handleDetailField('purchaseOrgInfoRef', 'purchaseAgentId')
    //       ?.purchaseAgentId,
    //     purchaseAgentName: handleDetailField('purchaseOrgInfoRef', 'purchaseAgentName'),
    //     requestedBy: handleDetailField('baseRef', 'requestedBy')?.requestedBy,
    //     prRequestedNum: handleDetailField('baseRef', 'prRequestedNum'),
    //     prRequestedName: handleDetailField('baseRef', 'prRequestedName'),
    //     originalCurrency: handleDetailField('baseRef', 'originalCurrency')?.originalCurrency,
    //     financialPrecision: handleDetailField('baseRef', 'financialPrecision'),
    //     defaultPrecision: handleDetailField('baseRef', 'defaultPrecision'),
    //     localFinancialPrecision: handleDetailField('baseRef', 'localFinancialPrecision'),
    //     localDefaultPrecision: handleDetailField('baseRef', 'localDefaultPrecision'),
    //   };

    //   fetchAutoGetCompany({ ouId: initLineData.ouId }).then(
    //     (res) => {
    //       const result = getResponse(res);
    //       if (result) {
    //         const {
    //           organizationId: invOrganizationId,
    //           organizationName: invOrganizationName,
    //         } = res;
    //         const newRecord = {
    //           currencyCode: initLineData.originalCurrency,
    //           ...initLineData,
    //           rpHeaderId,
    //           _status: 'create',
    //           invOrganizationId,
    //           invOrganizationName,
    //           attachmentUuId: uuid(),
    //           // prRequestedNumAndName: initLineData.prRequestedNum
    //           //   ? `${initLineData.prRequestedNum}-${initLineData.prRequestedName}`
    //           //   : null,
    //         };
    //         lineTableDs.create(newRecord, 0);
    //       }
    //     }
    //   );
    // };

    // const DeleteBtn = observer(() => (
    //   <Button
    //     funcType="flat"
    //     icon="delete"
    //     color="primary"
    //     onClick={() => handleLineDelete()}
    //     loading={delLoading}
    //     disabled={lineTableDs.selected.length === 0}
    //   >
    //     {intl.get('hzero.common.btn.delete').d('删除')}
    //   </Button>
    // ));

    const buttons = [
      // <Button funcType="flat" icon="playlist_add" onClick={() => handleCreate()}>
      //   {intl.get('hzero.common.btn.add').d('新增')}
      // </Button>,
      // <CommonImport
      //   prefixPatch="/srpm"
      //   args={{
      //     tenantId: organizationId,
      //     templateCode: '',
      //     rpHeaderId,
      //   }}
      //   businessObjectTemplateCode=""
      //   buttonText={intl.get('hzero.common.button.batchImport').d('批量导入')}
      //   buttonProps={{
      //     color: 'primary',
      //     funcType: 'flat',
      //     disabled: !rpHeaderId,
      //   }}
      //   successCallBack={() => {
      //     notification.success();
      //     commonUpdate();
      //   }}
      // />,
      // <DeleteBtn />,
    ];

    useEffect(() => {
      // fetchgetItemLimitRule();
      // Promise.all([
      //   // fetchSettings(),
      //   fetchDoExecute([{ fullPathCode: 'SITE.SMDM.UOM_DISPLAY_CONFIGURATION' }]),
      // ]).then((res) => {
      //   if (res) {
      //     const [result3] = res;
      //     setUomCodeAndNameRule(result3[0] ? JSON.parse(result3[0]) : 0);
      //   }
      // });
      // // 查询批量维护字段;
      // queryMapIdpValue({
      //   batchMaintains: 'SPUC.PR_LINE_BATCH_MAINTAIN',
      //   telCodeList: 'HPFM.IDD',
      // }).then((res) => {
      //   if (res) {
      //     const { batchMaintains = [], telCodeList = [] } = res;
      //     setBatchMaintains(batchMaintains);
      //     setTelCodeList(telCodeList);
      //   }
      // });
      fetchDoExecute([{ fullPathCode: 'SITE.SRPM.RP_CREATION_ITEM_LIMIT' }]).then((res) => {
        setAllready(true);
        if (res && !res.failed) {
          // this.setState({ canSelectParentRows: res?.[0] && res?.[0] !== '1' });
          setItemLimitRule(JSON.parse(res).map((rule) => rule));
        } else {
          notification.error({ message: res?.message });
        }
      });
    }, [rpHeaderId]);

    useEffect(() => {
      proxyDsCreate = undefined;
      return () => {
        proxyDsCreate = undefined;
      };
    }, []);

    useEffect(() => {
      if (allready && rpHeaderId) {
        loadLinesData(rpHeaderId);
      }
    }, [itemLimitRule, rpHeaderId]);

    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SRPM.RP_PLATFORM_ERP_CREATE.LINEINFO', // 必传，和unitCode一一对应
            dataSet: lineTableDs,
            custLoading: false,
            lovIgnore: false,
            proxyDsCreate,
          },
          <SearchBarTable
            searchCode="SRPM.RP_PLATFORM_ERP_CREATE.LINE_SEARCH"
            style={{ maxHeight: '450px' }}
            dataSet={lineTableDs}
            columns={lineColumns()}
            buttons={buttons}
            searchBarConfig={{
              autoQuery: false,
              closeFilterSelector: true,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default Index;
