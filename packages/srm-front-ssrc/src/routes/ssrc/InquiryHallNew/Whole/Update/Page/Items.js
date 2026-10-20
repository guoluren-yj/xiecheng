import React, { useCallback, useEffect, useMemo } from 'react';
import { Table, Button, Tooltip, Lov, Attachment, useModal, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, throttle, isEmpty, isNaN, isNil } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import CommonImportNew from 'hzero-front/lib/components/Import';

// import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import { calculateBasicQty } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { CheckBoxWithLinkRender } from '@/routes/ssrc/InquiryHallNew/Update/utils/renderer';

import { wholeBatchDeleteItemLinesValid } from '@/services/inquiryHallNewService';

import { batchCreateItemDS } from '../Stores/batchCreateDS';
import BatchCreateItemForm from '../Modals/BatchCreateForm';

import Styles from '../index.less';

const Items = (props = {}) => {
  const {
    // contentRef,
    lineDS,
    basicFormDS,
    doubleUnitFlag,
    organizationId,
    templateId,
    rfxHeaderId,
    customizeForm,
    customizeUnitCode,
    btnCustomizeUnitCode,
    applyToInquiryNewFlag,
    itemLineDS,
    customizeTable = noop,
    custLoading,
    purchaseTurnFlag,
    linktoPrNumDetail = noop,
    viewApplicationOrgModal = noop,
    companyId,
    offlineEntryRemote,
    batchCreateCustomizaUnitCode, // 批量新建个性化编码
    // maintainCustomizaUnitCode, // 批量维护个性化编码
    taxChangeFlag,
    // settings = {}, // 配置表单位控制
    getDefaultValueFormUserConfig = null,
  } = props;

  const uModal = useModal();

  let doubleFetchDataCurrentFlag = 0; // 双单位获取数量值,防止接口过慢

  let newBatchCreateItemDS = null; // 批量创建ds

  // 暴露子组件的api给父组件使用
  // useImperativeHandle(contentRef, () => ({
  //   saveItemLine,
  // }));

  useEffect(() => {
    queryItemLine();
  }, []);

  // item line
  const queryItemLine = useCallback(() => {
    if (!itemLineDS) {
      return;
    }

    itemLineDS.query(undefined, undefined, true);
  });

  // ou_id
  const changeOuId = useCallback((value, record) => {
    record.set({
      ouId: {
        ouId: value?.ouId,
        ouName: value?.ouName,
      },
      invOrganizationId: null,
    });
  }, []);

  // itemCategoryId
  const changeItemCategory = useCallback((value, record) => {
    record.set('itemCategoryId', {
      categoryId: value?.categoryId,
      categoryName: value?.categoryName,
      itemCategoryId: value?.categoryId,
      itemCategoryName: value?.categoryName,
    });
  }, []);

  // change item_id lov
  const changeItemId = useCallback(
    (value = null, oldValue, record) => {
      if (!record) {
        return;
      }

      const currentItemIdValue = value?.partnerItemId || value?.itemId;
      const pristineItemIdValue = oldValue?.itemId;

      if (!pristineItemIdValue && !currentItemIdValue) {
        clearQuotationLineFieldsValue(record);
        return;
      }

      record.set('itemId', {
        ...(value || {}),
        itemId: currentItemIdValue,
        itemCode: value?.itemCode,
      });
      record.set('itemCategoryId', {
        categoryId: value?.categoryId,
        categoryName: value?.categoryName,
        itemCategoryId: value?.categoryId,
        itemCategoryName: value?.categoryName,
      });
      record.set('itemName', value?.itemName);
      record.set('referencePrice', value?.referencePrice);
      record.set('specs', value?.specifications);
      record.set('model', value?.model);

      const uom = {
        uomId: value?.orderUomId || value?.primaryUomId || value?.uomId,
        uomName: value?.uomName || value?.orderUomName,
      };
      const secondaryUom = {
        secondaryUomId: value?.secondaryUomId || value?.uomId,
        secondaryUomName: value?.secondaryUomName || value?.uomName,
      };

      record.set('uomId', uom);
      record.set('secondaryUomId', secondaryUom);
      calculateAllBasicQuantity(record);

      if (pristineItemIdValue && !currentItemIdValue) {
        clearQuotationLineFieldsValue(record);
      }
    },
    [doubleUnitFlag, itemLineDS?.current, calculateAllBasicQuantity, clearQuotationLineFieldsValue]
  );

  // 清空物料时，信息清空
  const clearQuotationLineFieldsValue = useCallback(
    (record) => {
      record.set({
        taxIncludedFlag: 0,
        taxId: null,
        taxRate: null,
        origin: null,
        model: null,
      });
    },
    [
      // doubleUnitFlag,
    ]
  );

  // 行字段变更触发所有数量数量计算 - 物料lov和单位lov任意一个变动都重新计算基本数量
  const calculateAllBasicQuantity = useCallback(
    throttle((record) => {
      const { itemId, secondaryUomId, uomId } = record?.get(['itemId', 'secondaryUomId', 'uomId']);
      const currentItemIdValue = itemId?.itemId;
      const currentSecondaryUomId = secondaryUomId?.secondaryUomId;

      if (!doubleUnitFlag) {
        return;
      }

      if (!currentItemIdValue) {
        const secondaryQuantity = record.get('secondaryQuantity');
        record.set('rfxQuantity', secondaryQuantity);
      }

      const currentUomId = uomId?.uomId;

      if (currentSecondaryUomId !== currentUomId) {
        record.set('batchPrice', 1);
      }

      if (!currentItemIdValue) {
        // item_id 为空不能查询
        return;
      }

      // 双单位数量
      const QuantityMap = {
        secondaryQuantity: 'rfxQuantity',
      };
      const commonParams = {
        doublePrimaryUomId: currentUomId,
        secondaryUomId: currentSecondaryUomId,
        itemId: currentItemIdValue,
        tenantId: organizationId,
      }; // 掉用批量操作通用参数

      const newData = [];
      Object.keys(QuantityMap).forEach((secondaryField) => {
        const secondaryFieldValue = record.get(secondaryField); // secondary quanity value
        const field = QuantityMap[secondaryField];

        if (isNil(secondaryFieldValue) || !currentSecondaryUomId) {
          record.set(field, secondaryFieldValue ?? null);
          return;
        }

        newData.push({
          ...commonParams,
          secondaryQuantity: secondaryFieldValue,
          businessKey: secondaryField || record?.id,
        });
      });

      if (isEmpty(newData)) {
        return;
      }

      calculateBasicQty(newData).then((result) => {
        if (!result || !result?.length) {
          return;
        }

        result.forEach((obj) => {
          const { businessKey, primaryQuantity } = obj || {};
          if (!QuantityMap[businessKey]) {
            return;
          }
          record.set(QuantityMap[businessKey], primaryQuantity);
        });
      });
    }, 500),
    [doubleUnitFlag, organizationId]
  );

  // 双单位 数量换算
  const changeQuantity = useCallback(
    async (value = null, record = null, currentField = '', changeField = '') => {
      if (!record || !currentField || !changeField) {
        return;
      }

      record.set(currentField, value);
      const { itemId, secondaryUomId, uomId } = record.get(['itemId', 'secondaryUomId', 'uomId']);
      const itemIdValue = itemId?.itemId;
      const uomIdValue = uomId?.uomId;
      const secondaryUomIdValue = secondaryUomId?.secondaryUomId;

      if (!itemIdValue || !secondaryUomIdValue || !doubleUnitFlag) {
        record.set(changeField, value); // 两个数量做相同赋值
        return;
      }

      if (doubleFetchDataCurrentFlag) {
        notification.warning({
          message: intl.get('hzero.common.status.pending').d('请求中'),
        });
        return;
      }
      if (secondaryUomIdValue) {
        doubleFetchDataCurrentFlag = 1;
        const res = await calculateBasicQty({
          secondaryQuantity: value,
          itemId: itemIdValue,
          businessKey: currentField || record?.id,
          doublePrimaryUomId: uomIdValue,
          secondaryUomId: secondaryUomIdValue,
        });
        doubleFetchDataCurrentFlag = 0;
        if (isNil(res)) {
          return;
        }
        record.set(changeField, res ?? null);
      }
    },
    [doubleUnitFlag, itemLineDS?.current]
  );

  // 双单位
  const changeSecondaryUomId = useCallback(
    (value, record) => {
      if (!record) {
        return;
      }

      const id = value?.uomId;
      const nameUom = value?.uomCodeAndName || value?.uomName;

      record.set('secondaryUomId', {
        secondaryUomId: id,
        secondaryUomName: nameUom,
      });

      const itemId = record.get('itemId');
      const currentItemIdValue = itemId?.itemId;
      if (!currentItemIdValue) {
        const uom = {
          uomId: id,
          uomName: nameUom,
        };
        record.set('uomId', uom);
      }
      calculateAllBasicQuantity(record);
    },
    [calculateAllBasicQuantity, doubleUnitFlag]
  );

  // 价格批量变更
  const batchPriceChange = useCallback(
    (e = null, record) => {
      const currentValue = e?.target?.value;
      const currentBatchPrice =
        currentValue === 0 || Number(currentValue) === 0 ? null : currentValue;
      record.set('batchPrice', currentBatchPrice);
    },
    [rfxHeaderId, itemLineDS]
  );

  // 适用范围勾选
  const changeApplicationScopeFlag = useCallback((checked = 0, record) => {
    record.set('applicationScopeFlag', checked ? 1 : 0);
  });

  // 适用范围
  const viewItemLineApplicationOrgModal = (record = {}) => {
    const { rfxLineItemId, applicationScopeFlag = 0 } = record?.get([
      'rfxLineItemId',
      'applicationScopeFlag',
    ]);
    viewApplicationOrgModal(
      {
        sourceLineItemId: rfxLineItemId,
        applicationScopeFlag,
      },
      {
        handleAfterSaveApplicationScope: () => {
          queryItemLine();
        },
      }
    );
  };

  // create
  const createItemLine = useCallback(
    throttle(() => {
      const defaultValue = getDefaultValueFormUserConfig() || {};

      itemLineDS.create(
        {
          ...defaultValue,
          rfxHeaderId,
          rfxLineItemNum: null,
          tenantId: organizationId,
        },
        0
      );
    }, 500),
    [itemLineDS, rfxHeaderId, organizationId]
  );

  // 批量新建确认
  const handleOkBatchCreate = useCallback(
    throttle(async (newBatchCreateItemLineDS = {}) => {
      if (isEmpty(newBatchCreateItemLineDS)) {
        return;
      }

      const validateFlag = await newBatchCreateItemLineDS?.validate();
      if (!validateFlag) {
        return false;
      }

      // 提交数据
      const result = getResponse(await newBatchCreateItemLineDS?.submit());
      if (result) {
        queryItemLine();
        newBatchCreateItemLineDS.reset();
        return true;
      }
      return false;
    }),
    [newBatchCreateItemDS, queryItemLine]
  );

  // handleBatchCreate
  const handleBatchCreate = useCallback(
    throttle(() => {
      const batchProps = {
        customizeUnitCode: batchCreateCustomizaUnitCode,
        companyId,
        customizeForm,
        organizationId,
        doubleUnitFlag,
        taxChangeFlag,
        rfxHeaderId,
      };

      newBatchCreateItemDS = new DataSet(batchCreateItemDS(batchProps));
      // newBatchCreateItemDS.setState('settings', settings);

      uModal.open({
        closable: true,
        drawer: true,
        destroyOnClose: true,
        title: intl.get(`ssrc.inquiryHall.view.message.title.batchCreate`).d('批量创建'),
        style: { width: '380px' },
        children: <BatchCreateItemForm {...batchProps} dataSet={newBatchCreateItemDS} />,
        onOk: () => handleOkBatchCreate(newBatchCreateItemDS),
        onClose: () => {
          newBatchCreateItemDS.reset();
        },
      });
    }, 500),
    [
      taxChangeFlag,
      doubleUnitFlag,
      companyId,
      rfxHeaderId,
      itemLineDS,
      newBatchCreateItemDS,
      handleOkBatchCreate,
      batchCreateCustomizaUnitCode,
    ]
  );

  // item clear selected
  const itemDSClearSelected = useCallback(() => {
    itemLineDS.unSelectAll();
    itemLineDS.clearCachedSelected();
  }, [itemLineDS]);

  // copyItemLine
  const copyItemLine = useCallback(
    throttle(() => {
      const { selected } = itemLineDS || {};
      if (isEmpty(selected)) {
        notification.warning({
          message: intl.get('ssrc.common.pleaseSelectItemLinesToCopy').d('请勾选要复制的行!'),
        });
        return;
      }

      const lines = selected.map((select) => select.toData());
      lines.forEach((line = {}) => {
        const newItemLine = {
          ...line,
          attachmentUuid: null,
          rfxLineItemId: null,
          rfxLineItemNum: null,
          prNum: null,
          prLineNum: null,
          prHeaderId: null,
          prLineId: null,
          prDisplayLineNum: null,
          prData: null,
          creationDate: null,
          organizationId,
          tenantId: organizationId,
          lastUpdateDate: null,
          sampleRequestedFlag: 0,
          _status: 'create',
        };
        itemLineDS.create(newItemLine, 0);
      });

      itemDSClearSelected();
    }, 500),
    [itemLineDS, itemLineDS?.selected, rfxHeaderId, itemDSClearSelected]
  );

  // delete item line 先调用校验接口校验要删除的数据是否生成了报价
  const destroyItemLine = useCallback(
    throttle(async () => {
      const selectedData = itemLineDS.selected;
      if (!selectedData?.length) {
        return;
      }

      const addData = []; // 新建record
      const oldData = []; // 保存 record
      const oldValidateData = []; // 保存过数据
      selectedData.forEach((itemRecord = {}) => {
        const rfxLineItemId = itemRecord.get('rfxLineItemId');

        if (!rfxLineItemId) {
          addData.push(itemRecord);
        }

        if (rfxLineItemId) {
          oldData.push(itemRecord);
          const data = itemRecord.toData();
          oldValidateData.push(data);
        }
      });

      if (addData.length) {
        itemLineDS.remove(addData, 1);
      }

      if (!oldData.length) {
        return;
      }

      let result = null;

      try {
        result = await wholeBatchDeleteItemLinesValid({
          data: oldValidateData,
          organizationId,
        });
        if (!result || (result && result?.field)) {
          notification.error();
          return;
        }

        let deleteMessage = intl
          .get('ssrc.common.view.delete_selected_row_confirm')
          .d('确认删除选中行？');
        if (Array.isArray(result) && !isEmpty(result)) {
          const items = [];
          result.forEach((item = {}) => {
            const { itemName } = item || {};
            if (itemName) {
              items.push(itemName);
            }
          });
          const itemNames = items.join();
          deleteMessage = intl
            .get('ssrc.inquiryHall.view.confirm.deleteItemsHasQuotated', { itemNames })
            .d(`需要删除的物料${itemNames}已经生成供应商的报价数据，是否确认进行删除`);
        }

        itemLineDS.delete(oldData, {
          title: intl.get('ssrc.common.message.tip').d('提示'),
          contentStyle: {
            minWidth: '600px',
            wordBreak: 'break-all',
          },
          children: deleteMessage,
          onCancel: itemDSClearSelected,
        });
      } catch (e) {
        throw e;
      }
    }, 800),
    [itemLineDS, itemDSClearSelected]
  );

  // saveItemLine
  const saveItemLine = useCallback(
    throttle(async () => {
      let saveResultFlag = false;

      try {
        itemLineDS.forEach((itemLine) => {
          // eslint-disable-next-line no-param-reassign
          itemLine.status = 'update';
        });

        const validateFlag = await itemLineDS.validate();
        if (!validateFlag) {
          return saveResultFlag;
        }
        let result = await itemLineDS.submit();
        result = getResponse(result);
        if (!result || !result.success) {
          return saveResultFlag;
        }

        saveResultFlag = true;
        queryItemLine();
      } catch (e) {
        throw e;
      }
      return saveResultFlag;
    }, 500),
    [itemLineDS, queryItemLine]
  );

  // handleBatchMaintain
  const handleBatchMaintain = useCallback(
    throttle(() => {}, 500), // 后期和维护页面一同重构
    [itemLineDS]
  );

  // 物料行勾选数据为空 标识
  const EmptySelectedFlag = useMemo(
    () => !itemLineDS || isEmpty(itemLineDS.selected),
    [itemLineDS, itemLineDS?.selected]
  );

  // 导入
  const ImportProps = {
    bindTemplateCode: 'SSRC.RFX_QUOTATION.ITEM',
    businessObjectTemplateCode: 'SSRC_OFFLINE_WHOLE_QUOTATION.ITEM',
    downloadTemplateCode: 'SSRC_OFFLINE_WHOLE_QUOTATION.ITEM',
    prefixPatch: SRM_SSRC,
    refreshButton: true,
    args: {
      tenantId: organizationId,
      organizationId,
      rfxHeaderId,
      templateCode: 'SSRC_OFFLINE_WHOLE_QUOTATION.ITEM',
      templateId,
    },
    buttonProps: {
      funcType: 'flat',
      icon: 'archive',
      color: 'primary',
      disabled: !companyId || !applyToInquiryNewFlag,
    },
    buttonText: intl.get(`ssrc.inquiryHall.view.message.button.itemImport`).d('物料导入'),
    autoRefreshInterval: 5000,
    tenantId: organizationId,
    action: 'hzero.common.title.batchImport',
    auto: true,
    successCallBack: queryItemLine,
  };

  // table buttons
  const getButtons = useCallback(() => {
    const buttonCommonProps = {
      // color: 'primary',
      funcType: 'flat',
    };

    const buttons = [
      <Button
        icon="playlist_add"
        onClick={createItemLine}
        name="create"
        {...buttonCommonProps}
        disabled={!applyToInquiryNewFlag}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        icon="playlist_add"
        onClick={handleBatchCreate}
        name="batchCreate"
        disabled={!applyToInquiryNewFlag}
        {...buttonCommonProps}
      >
        {intl.get(`ssrc.inquiryHall.view.message.button.batchCreate`).d('批量新建')}
      </Button>,
      <TooltipButtonPro
        onClick={destroyItemLine}
        disabled={EmptySelectedFlag}
        icon="delete_sweep"
        name="delete"
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        onClick={copyItemLine}
        disabled={EmptySelectedFlag || !applyToInquiryNewFlag}
        icon="content_copy"
        name="copy"
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.button.copy').d('复制')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        icon="save"
        disabled={!itemLineDS?.length && !itemLineDS?.cachedRecords?.length}
        onClick={saveItemLine}
        name="save"
        help={intl.get('ssrc.common.view.message.item-line.add.tip').d('请先新增物料行')}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </TooltipButtonPro>,
      <Button
        onClick={handleBatchMaintain}
        icon="mode_edit"
        name="batchMaintain"
        disabled={!applyToInquiryNewFlag}
        {...buttonCommonProps}
      >
        <Tooltip
          title={
            EmptySelectedFlag
              ? intl
                  .get('ssrc.inquiryHall.model.inquiryHall.batchCurrentPageDataToEdit')
                  .d('针对当前页全部数据进行批量编辑')
              : ''
          }
        >
          {EmptySelectedFlag
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.batchCheckData').d('勾选批量编辑')}
        </Tooltip>
      </Button>,
      <Button name="import" funcType="link">
        <CommonImportNew {...ImportProps} />
      </Button>,
    ].filter(Boolean);
    const otherProps = { lineDS, basicFormDS, itemLineDS };
    return offlineEntryRemote
      ? offlineEntryRemote.process(
          'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_QUOTATION_LINE_ITEM_TABLE_BUTTONS',
          buttons,
          otherProps
        )
      : buttons;
  }, [itemLineDS, ImportProps, EmptySelectedFlag, destroyItemLine, applyToInquiryNewFlag]);

  const getItemColumns = useCallback(() => {
    return [
      {
        name: 'rfxLineItemNum',
        width: 80,
        lock: 'left',
      },
      {
        name: 'ouId',
        width: 150,
        editor: (record) => {
          return <Lov name="ouId" record={record} onChange={(val) => changeOuId(val, record)} />;
        },
      },
      {
        editor: true,
        name: 'invOrganizationId',
        width: 150,
      },
      {
        name: 'itemId',
        width: 150,
        editor: (record) => {
          return (
            <Lov
              name="itemId"
              record={record}
              onChange={(val, oldVal) => changeItemId(val, oldVal, record)}
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
        name: 'itemCategoryId',
        editor: (record) => {
          return (
            <Lov
              editor
              dataSet={itemLineDS}
              name="itemCategoryId"
              tableProps={{
                selectionMode: 'rowbox',
              }}
              onChange={(value) => changeItemCategory(value, record)}
            />
          );
        },
        width: 150,
      },
      {
        name: 'rfxQuantity',
        width: 140,
        editor: (record) => {
          return <C7nPrecisionInputNumber name="rfxQuantity" record={record} uom="uomId" />;
        },
        renderer: ({ record, value }) =>
          doubleUnitFlag && record.get('itemId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, record.getState('uom_precision')),
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 140,
            editor: (record, name) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryQuantity"
                  record={record}
                  uom="secondaryUomId"
                  onChange={(val) => changeQuantity(val, record, name, 'rfxQuantity')}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      {
        name: 'taxIncludedFlag',
        width: 140,
        editor: true,
      },
      {
        name: 'taxId',
        width: 140,
        align: 'right',
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="taxId"
              paramMatcher={({ text }) => {
                return !isNaN(text) ? { taxRate: text } : { taxCode: text };
              }}
            />
          );
        },
      },
      {
        editor: true,
        name: 'uomId',
        width: 150,
      },
      doubleUnitFlag
        ? {
            editor: (record) => {
              return (
                <Lov
                  name="secondaryUomId"
                  record={record}
                  onChange={(val) => changeSecondaryUomId(val, record)}
                />
              );
            },
            name: 'secondaryUomId',
            width: 150,
          }
        : null,
      {
        editor: true,
        width: 150,
        name: 'demandDate',
      },
      {
        name: 'batchPrice',
        width: 150,
        align: 'right',
        editor: (record = {}) => {
          return (
            <C7nPrecisionInputNumber
              type="c7n-pro"
              name="batchPrice"
              record={record}
              currency="currencyCode"
              onBlur={(e) => batchPriceChange(e, record)}
            />
          );
        },
        renderer: ({ record, value }) => {
          if (isNil(value) || value === 0 || value === '0') {
            return intl.get('ssrc.common.pleaseEnterGreatThanZeroNumber').d('请输入大于0的数值');
          }
          return numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true, // 不补零标识
          });
        },
      },
      {
        name: 'specs',
        editor: true,
        width: 150,
      },
      purchaseTurnFlag // 是否申请转询价
        ? {
            name: 'prNum',
            width: 150,
            renderer: ({ record, value }) => {
              const { prData, prHeaderId } = record.get(['prData', 'prHeaderId']);

              if (prHeaderId) {
                if (prData) {
                  return JSON.parse(prData).map((prItem) => {
                    return (
                      <a onClick={() => linktoPrNumDetail(record, prItem?.prHeaderId)}>
                        {`${prItem?.displayPrNum}|${prItem?.displayLineNum}`}{' '}
                      </a>
                    );
                  });
                } else {
                  return <a onClick={() => linktoPrNumDetail(record, prHeaderId)}>{value}</a>;
                }
              } else {
                return value;
              }
            },
          }
        : null,
      purchaseTurnFlag
        ? {
            name: 'prDisplayLineNum',
            width: 150,
          }
        : null,
      {
        name: 'applicationScopeFlag',
        width: 140,
        renderer: ({ value, record }) => {
          const { rfxLineItemId = null } = record?.get(['rfxLineItemId', 'applicationScopeFlag']);

          const currentProps = {
            name: 'applicationScopeFlag',
            checkboxProps: {
              disabled: !rfxLineItemId,
              onChange: (checked) => changeApplicationScopeFlag(checked, record),
              defaultChecked: value,
              checked: value,
            },
          };

          return (
            <CheckBoxWithLinkRender {...currentProps}>
              <a
                disabled={!value || !rfxLineItemId}
                style={{ marginLeft: '8px' }}
                onClick={() => viewItemLineApplicationOrgModal(record)}
              >
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
                  .d('适用其他组织')}
              </a>
            </CheckBoxWithLinkRender>
          );
        },
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: true,
        renderer: ({ record }) => (
          <Attachment name="attachmentUuid" record={record} viewMode="popup" />
        ),
      },
    ].filter(Boolean);
  }, [
    doubleUnitFlag,
    changeApplicationScopeFlag,
    viewItemLineApplicationOrgModal,
    batchPriceChange,
    changeSecondaryUomId,
    changeOuId,
    changeItemId,
  ]);

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <div className={Styles['ssrc-border-left-line']} />
        {intl.get('ssrc.inquiryHall.view.title.itemMaterials').d('物料')}
      </h3>

      {customizeTable(
        { code: customizeUnitCode, buttonCode: btnCustomizeUnitCode },
        <Table
          bordered
          custLoading={custLoading}
          dataSet={itemLineDS}
          rowKey="rfxLineItemId"
          columns={getItemColumns()}
          buttons={getButtons()}
          style={{ maxHeight: '40vh' }}
        />
      )}
    </div>
  );
};

export default observer(Items);
