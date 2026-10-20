import { Button, DataSet, Modal, Lov } from 'choerodon-ui/pro';
import React, { Fragment, useImperativeHandle, useState, useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import uuid from 'uuid/v4';
import notification from 'utils/notification';
import { isEmpty, isFunction } from 'lodash';
// import CommonImport from 'hzero-front/lib/components/Import';
import CommonImport from 'hzero-front/lib/components/Import';
// import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  fetchAutoGetCompany,
  fetchCategory,
  deleteLines,
  fetchDoExecute,
  queryDetail,
} from '@/services/RequisitionPlanServices';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { lineDs, batchEditDs } from '../indexDS';
import BatchModal from './BatchModal';

let proxyDsCreate;
let batchMaintainInfo = {}; // 批量维护点确定后,暂存批量维护的数据
// const commonPrompt = 'srpm.common.model.common';
const organizationId = getCurrentOrganizationId();
const Index = (
  {
    remote,
    rpHeaderId,
    handleDetailField,
    commonUpdate,
    customizeTable,
    customizeForm,
    updateHeaderDate,
    getHeaderInfo,
    sourcePlatformObj,
    handleLineDsUpdate,
    headerDs,
    handleSave,
    purchaseOrgInfoRef,
  },
  ref
) => {
  const [init, setInit] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [itemLimitRule, setItemLimitRule] = useState([]);
  const [allready, setAllready] = useState(false);
  const baseInfo = headerDs?.toData();

  // const itemLimitRule = [];

  const lineTableDs = useMemo(() => {
    const config = {
      ...lineDs({
        rpHeaderId,
        getHeaderInfo,
        handleDetailField,
        itemLimitRule,
        editAble: true,
        customizeUnitCode: 'SRPM.RP_PLATFORM_CREATE.LINEINFO,SRPM.RP_PLATFORM_CREATE.LINE_SEARCH',
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
        load: ({ dataSet }) => {
          dataSet.forEach((record) => {
            const { fieldMapValues = [] } = batchMaintainInfo;
            fieldMapValues.forEach(([key, value]) => {
              const field = record.getField(key);
              if (!field.disabled && value) {
                record.set({ [key]: value });
                record.setState({ batchFlag: true });
              }
            });
          });
        },
      },
    };
    const cuxConfig = remote
      ? remote.process('SRPM_CREATER_REQUISITION_PLAN_LINE_DS_CONFIG', config, {})
      : config;
    return new DataSet(cuxConfig);
  }, [itemLimitRule, remote]);

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
        editor: true,
        width: 180,
      },
      {
        name: 'itemCode',
        editor: true,
        width: 150,
      },
      {
        name: 'itemName',
        editor: true,
        width: 180,
      },
      {
        name: 'categoryId',
        // editor: true,
        width: 150,
        editor: (record) => (
          <Lov
            editor
            dataSet={lineTableDs}
            name="categoryId"
            tableProps={{
              mode: 'tree',
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
                        categoryId: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
              selectionMode: 'rowbox',
              virtual: true,
              style: { maxHeight: '500px' },
            }}
          />
        ),
      },
      {
        name: 'itemModel',
        width: 100,
        editor: true,
      },
      {
        name: 'itemSpecs',
        width: 100,
        editor: true,
      },
      {
        name: 'uomId',
        editor: true,
        width: 120,
      },
      {
        name: 'neededDate',
        editor: true,
        width: 150,
      },
      {
        name: 'quantity',
        editor: true,
        width: 100,
      },
      {
        name: 'taxId',
        editor: true,
        width: 100,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'taxIncludedUnitPrice',
        editor: true,
        width: 120,
      },
      {
        name: 'unitPrice',
        // editor: true,
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
        editor: true,
        width: 180,
      },
      {
        name: 'attachmentUuid',
        width: 120,
        editor: true,
      },
    ];
    const { cuxColsFc } = remote?.props?.process ?? {};
    const cuxColsList = isFunction(cuxColsFc) ? cuxColsFc({ columns, pageForm: 'edit' }) : columns;
    return cuxColsList;
  };
  // 函数组件调用到子组件的函数
  useImperativeHandle(ref, () => ({
    loadLineDate,
    saveCurrentData,
    ref: ref.current,
    ds: lineTableDs,
  }));

  const saveCurrentData = () => {
    return lineTableDs;
  };

  const loadLineDate = async (currentId) => {
    batchMaintainInfo = {};
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
  const handleLineDelete = async () => {
    const { selected } = lineTableDs;
    const deleUpdateArr = selected.filter((ele) => ele.get('rpLineId'));
    if (deleUpdateArr.length > 0) {
      setDelLoading(true);
      const confirmPro = await new Promise((resolve) => {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <p>{intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？')}</p>
          ),
          onOk: () => {
            resolve(true);
          },
          onCancel: () => {
            setDelLoading(false);
            resolve(false);
          },
        });
      });
      if (!confirmPro) return;
      const deleteLine = deleUpdateArr.map((ele) => ele.toJSONData());
      deleteLines({ prLines: deleteLine })
        .then(async (res) => {
          if (getResponse(res)) {
            if (remote) {
              await remote.event.fireEvent('cuxAfterDelete', { handleSave });
            }
            commonUpdate();
            notification.success();
          }
        })
        .finally(() => {
          setDelLoading(false);
        });
    } else {
      lineTableDs.remove(selected);
    }
  };

  const handleBatchModal = () => {
    const initLineData = {
      ouId: handleDetailField('purchaseOrgInfoRef', 'ouId')?.ouId,
      companyId: handleDetailField('purchaseOrgInfoRef', 'companyId')?.companyId,
      purchaseAgentId: handleDetailField('purchaseOrgInfoRef', 'purchaseAgentId')?.purchaseAgentId,
      purchaseAgentName: handleDetailField('purchaseOrgInfoRef', 'purchaseAgentName'),
      requestedBy: handleDetailField('baseRef', 'requestedBy')?.requestedBy,
      prRequestedNum: handleDetailField('baseRef', 'prRequestedNum'),
      prRequestedName: handleDetailField('baseRef', 'prRequestedName'),
      originalCurrency: handleDetailField('baseRef', 'originalCurrency')?.originalCurrency,
      financialPrecision: handleDetailField('baseRef', 'financialPrecision'),
      defaultPrecision: handleDetailField('baseRef', 'defaultPrecision'),
    };
    const batchMaintainDs = new DataSet(batchEditDs(initLineData));
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: '380px' },
      destroyOnClose: true,
      title: intl.get('sprm.purchaseReqCreation.view.button.batchMaintain').d('批量维护'),
      children: (
        <BatchModal
          ds={batchMaintainDs}
          length={lineTableDs.selected.length}
          customizeForm={customizeForm}
        />
      ),
      onOk: () => handleBatchOk(batchMaintainDs),
    });
  };

  // 批量维护
  const handleBatchOk = (batchMaintain) => {
    const [listData] = batchMaintain.toJSONData();
    const {
      itemId,
      itemName,
      categoryId,
      uomId,
      quantity,
      taxIncludedUnitPrice,
      invOrganizationName,
      __id,
      _status,
      ...batchEditedData
    } = listData;

    const batchRecord = batchMaintain.current;
    // const value = fields[i].getValue(batchRecord);

    const fieldMapValues = [];
    const fields = batchMaintain.fields.toJSON();

    for (const i in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, i) && fields[i]) {
        const value = fields[i].getValue(batchRecord);
        const bind = fields[i].get('bind');
        if (value && !bind) {
          fieldMapValues.push([i, value]);
        }
      }
    }

    const { selected, cachedModified } = lineTableDs;
    if (isEmpty(selected)) {
      updateHeaderDate({
        batchEditFieldMap: {
          ...batchEditedData,
          unitCode: 'SRPM.RP_PLATFORM_CREATE.BATCH_EDIT',
        },
      });
      const oldMapValues = lineTableDs.getState('fieldMapValues') || [];
      lineTableDs.setState({
        fieldMapValues: [...oldMapValues, ...fieldMapValues],
      });
      batchEditedData.fieldMapValues = fieldMapValues;
    }

    cachedModified.forEach((i) => {
      fieldMapValues.forEach(([key, value]) => {
        const field = i.getField(key);
        if (!field.disabled && value) {
          i.set({ [key]: value });
          i.setState({ batchFlag: true });
        }
      });
    });

    (isEmpty(selected) ? lineTableDs : selected).forEach((i) => {
      fieldMapValues.forEach(([key, value]) => {
        const field = i.getField(key);
        if (!field.disabled && value) {
          i.set({ [key]: value });
          i.setState({ batchFlag: true });
        }
      });
    });
  };

  const handleCreate = () => {
    const initLineData = {
      ouId: handleDetailField('purchaseOrgInfoRef', 'ouId')?.ouId,
      companyId: handleDetailField('purchaseOrgInfoRef', 'companyId')?.companyId,
      purchaseAgentId: handleDetailField('purchaseOrgInfoRef', 'purchaseAgentId')?.purchaseAgentId,
      purchaseAgentName: handleDetailField('purchaseOrgInfoRef', 'purchaseAgentName'),
      requestedBy: handleDetailField('baseRef', 'requestedBy')?.requestedBy,
      prRequestedNum: handleDetailField('baseRef', 'prRequestedNum'),
      prRequestedName: handleDetailField('baseRef', 'prRequestedName'),
      originalCurrency: handleDetailField('baseRef', 'originalCurrency')?.originalCurrency,
      financialPrecision: handleDetailField('baseRef', 'financialPrecision'),
      defaultPrecision: handleDetailField('baseRef', 'defaultPrecision'),
      localFinancialPrecision: handleDetailField('baseRef', 'localFinancialPrecision'),
      localDefaultPrecision: handleDetailField('baseRef', 'localDefaultPrecision'),
    };

    fetchAutoGetCompany({ ouId: initLineData.ouId }).then((res) => {
      // const result = getResponse(res);
      // 防止拿不到数据 无法新建行
      if (!res.failed) {
        const { organizationId: invOrganizationId, organizationName: invOrganizationName } = res;
        const newRecord = {
          currencyCode: initLineData.originalCurrency,
          ...initLineData,
          rpHeaderId,
          _status: 'create',
          invOrganizationId,
          invOrganizationName,
          attachmentUuId: uuid(),
          // prRequestedNumAndName: initLineData.prRequestedNum
          //   ? `${initLineData.prRequestedNum}-${initLineData.prRequestedName}`
          //   : null,
        };
        lineTableDs.create(newRecord, 0);
      }
    });
  };

  const buttons = useMemo(() => {
    const normalBtns = [
      <Button key="create" funcType="flat" icon="playlist_add" onClick={() => handleCreate()}>
        {intl.get('hzero.common.btn.add').d('新增')}
      </Button>,
      <CommonImport
        key="import"
        prefixPatch="/srpm"
        args={{
          tenantId: organizationId,
          // templateCode: '',
          rpHeaderId,
        }}
        businessObjectTemplateCode="SRPM_REQUEST_PLAN_LINE_IMPORT"
        buttonText={intl.get('hzero.common.button.requisitionBatchImport').d('提报单行导入')}
        buttonProps={{
          color: 'primary',
          funcType: 'flat',
          disabled: !rpHeaderId,
          permissionList: [
            {
              code: 'hzero.srm.requirement.requisition.plan.rp-platform.ps.line.import',
              type: 'button',
            },
          ],
        }}
        successCallBack={() => {
          notification.success();
          commonUpdate();
        }}
      />,
      <Button
        key="batchDelete"
        funcType="flat"
        icon="delete_sweep"
        color="primary"
        onClick={() => handleLineDelete()}
        loading={delLoading}
        disabled={lineTableDs.selected.length === 0}
      >
        {intl.get('hzero.common.button.batchdelete').d('批量删除')}
      </Button>,
      <Button
        key="batchEdit"
        funcType="flat"
        icon="mode_edit"
        color="primary"
        onClick={() => handleBatchModal()}
      >
        {isEmpty(lineTableDs.selected)
          ? intl.get('sprm.purchaseReqCreation.view.button.batchMaintain').d('批量维护')
          : intl.get('sprm.common.view.tooltip.batchTickMaintain').d('勾选批量编辑')}
      </Button>,
    ];
    const processBtns = remote
      ? remote.process('SRPM_CREATER_REQUISITION_PLAN.LINE_BTNS', normalBtns, {
          lineTableDs,
          itemLimitRule,
          handleDetailField,
          headerDs,
          delLoading,
          queryDetail,
          purchaseOrgInfoRef,
          setDelLoading,
        })
      : normalBtns;

    return processBtns;
  }, [
    remote,
    delLoading,
    rpHeaderId,
    lineTableDs,
    commonUpdate,
    handleCreate,
    itemLimitRule,
    handleBatchModal,
    handleLineDelete,
    handleDetailField,
    baseInfo,
  ]);

  useEffect(() => {
    fetchDoExecute([{ fullPathCode: 'SITE.SRPM.RP_CREATION_ITEM_LIMIT' }]).then((res) => {
      setAllready(true);
      if (res && !res.failed) {
        // this.setState({ canSelectParentRows: res?.[0] && res?.[0] !== '1' });
        setItemLimitRule(JSON.parse(res).map((rule) => rule));
      } else {
        notification.error({ message: res?.message });
      }
    });
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

  const listAttributes = remote?.process(
    'SRPM_CREATER_REQUISITION_PLAN.LINE_Attributes',
    {},
    { currentPage: 'edit', lineTableDs }
  );

  return (
    <Fragment>
      {customizeTable(
        {
          code: 'SRPM.RP_PLATFORM_CREATE.LINEINFO', // 必传，和unitCode一一对应
          dataSet: lineTableDs,
          custLoading: false,
          lovIgnore: false,
          proxyDsCreate,
        },
        <SearchBarTable
          searchCode="SRPM.RP_PLATFORM_CREATE.LINE_SEARCH"
          style={{ maxHeight: '450px' }}
          dataSet={lineTableDs}
          columns={lineColumns()}
          buttons={buttons}
          searchBarConfig={{
            autoQuery: false,
            closeFilterSelector: true,
          }}
          {...(listAttributes || {})}
        />
      )}
    </Fragment>
  );
};

export default observer(Index, { forwardRef: true });
