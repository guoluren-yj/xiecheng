import React, { useMemo, useCallback } from 'react';
import { Table, Lov, Modal, TextArea, Tooltip } from 'choerodon-ui/pro';
import { observer, useComputed } from 'mobx-react-lite';
import { isEmpty, noop } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import notification from 'utils/notification';
import { FilterAttribute } from '@/utils/SsrcRegx';

import { isClearMaterial, updateExpandInvOrganizationFiled } from '../utils/utils';
import { useStore } from '../store/index';
import styles from '../common.less';
import BatchMaintainItemForm from '../Modal/BatchMaintainItemForm';
import LadderLevelModal from '../Modal/LadderLevelModal';
import PurchaseRequest from '../Modal/PurchaseRequest';

export default observer(function ItemLine() {
  const {
    routerParams: { rfqHeaderId = '' } = {},
    commonDs: { itemLineDs, basicFormDs, supplierTableDs } = {},
    customizeTable = noop,
    isNewInquiry = false,
    doubleUnitFlag = false,
    customizeForm = noop,
    customizeCollapseForm = noop,
    clearProperties,
    getStoreData = noop,
  } = useStore();

  const emptySelectedFlag = useComputed(() => !itemLineDs || isEmpty(itemLineDs.selected), [
    itemLineDs,
  ]);

  const emptyItemLineTableDS = useComputed(
    () => !itemLineDs.length && !itemLineDs?.cachedRecords?.length,
    [itemLineDs]
  );

  // 查询
  const fetchItemLine = () => {
    itemLineDs.query();
    itemLineDs.unSelectAll();
    itemLineDs.clearCachedSelected();
  };

  // 物料 - 删除
  const handleDeleteItem = async () => {
    // 1.不勾选时，点击批量删除认为删除全部数据。
    // 2.勾选/跨页勾选，点击批量删除，删除勾选的行数据。
    const selectedRows =
      (itemLineDs?.selected?.length > 0 ? itemLineDs?.selected : itemLineDs?.records) || [];
    const newAddRows = selectedRows?.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows?.filter((s) => ['sync', 'update'].includes(s.status)) || [];

    // 删除本地数据
    itemLineDs.remove(newAddRows);

    if (!isEmpty(existedRows)) {
      // 删除线上数据
      itemLineDs
        .delete(existedRows, {
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        })
        .then(async (res) => {
          if (getResponse(res)) {
            // 查询供应商表格 刷新分配物料数据
            // 保留缓存的变更记录
            supplierTableDs.query(undefined, undefined, true);
          }
        });
    }
  };

  // 改变公司
  const changeCompanyId = (value = {}, record = {}) => {
    // 是否清空物料
    isClearMaterial({ record, basicFormDs });

    // 选择公司后带出公司对应的缺省币种，清空公司时清空行上币种
    record.set('currencyCode', {
      currencyCode: value?.currencyCode,
    });
  };

  // 切换业务实体lov
  const changeOuId = (record = {}) => {
    // 是否清空物料
    isClearMaterial({ record, basicFormDs });
  };

  // // 切换库存组织lov
  const changeInvOrganizationId = (record) => {
    // 是否清空物料
    isClearMaterial({ record, basicFormDs });
  };

  // 切换物料编码lov
  const changeItemId = (value = {}, record) => {
    const currentValue = value ?? {};
    record.set({
      itemName: currentValue.itemName,
      itemCategoryId: {
        categoryId: currentValue.categoryId,
        categoryName: currentValue.categoryName,
      },
      brand: currentValue.brand,
      specs: currentValue.specifications,

      biUomId: currentValue.biUomId,
      biUomName: currentValue.biUomName,
    });
    if (isEmpty(currentValue)) {
      record.set({
        secondaryUomId: {
          uomId: null,
          uomName: null,
        },
        uomId: {
          uomId: null,
          uomName: null,
        },
      });
      return;
    }

    const { itemId } = record.get(['itemId']) || {};
    if (!isEmpty(currentValue)) {
      if (doubleUnitFlag && itemId?.itemId) {
        record.set({
          uomId: {
            uomId: currentValue.uomId,
            uomName: currentValue.uomName,
          },
          secondaryUomId: {
            uomId: currentValue.secondaryUomId || currentValue.uomId,
            uomName: currentValue.secondaryUomName || currentValue.uomName,
          },
        });
      } else {
        // 没有物料直接选择单位lov赋值给基本单位
        // 有物料但是未开启双单位，基本单位跟着单位走
        record.set({
          uomId: {
            uomId: currentValue.orderUomId || currentValue.primaryUomId,
            uomName: currentValue.orderUomName || currentValue.uomName,
          },
          secondaryUomId: {
            uomId: currentValue.orderUomId || currentValue.primaryUomId,
            uomName: currentValue.orderUomName || currentValue.uomName,
          },
        });
      }
    }
  };

  // 改变辅助单位lov
  const changeSecondaryUomId = (value = {}, record) => {
    const currentValue = value ?? {};
    const { itemId } = record.get(['itemId']) || {};
    if (doubleUnitFlag && itemId?.itemId) {
      if (currentValue) {
        record.set({
          secondaryUomId: {
            uomId: currentValue.uomId || null,
            uomName: currentValue.uomCodeAndName || currentValue.uomName || null,
          },
        });
      }
    } else {
      // 没有物料直接选择单位lov赋值给基本单位
      // 有物料但是未开启双单位，基本单位跟着单位走
      record.set({
        uomId: {
          uomId: currentValue.uomId || null,
          uomName: currentValue.uomCodeAndName || null,
        },
        secondaryUomId: {
          uomId: currentValue.uomId || null,
          uomName: currentValue.uomCodeAndName || null,
        },
      });
    }
  };

  // 批量维护物品行
  const handleBatchMaintain = useCallback(() => {
    const batchMaintainItemFormProps = {
      itemLineDs,
      customizeForm,
      clearProperties,
    };
    return Modal.open({
      destroyOnClose: true,
      closable: true,
      key: 'batch-edit-itemLine',
      drawer: true,
      title: intl.get('ssrc.quickInquiry.model.quickInquiry.batchMaintenance').d('批量维护'),
      children: <BatchMaintainItemForm {...batchMaintainItemFormProps} />,
      style: { width: '380px' },
    });
  }, [itemLineDs, customizeForm, clearProperties]);

  // 阶梯报价
  const viewLadderLevelModal = useCallback(
    (record = {}) => {
      const { itemCode, secondaryUomId, uomId } =
        record.get(['itemCode', 'secondaryUomId', 'uomId']) || {};
      if (itemCode && doubleUnitFlag) {
        if (!secondaryUomId?.uomId || !uomId?.uomId) {
          notification.warning({
            message: intl.get(`ssrc.common.model.inquiryHall.chooseUnit`).d('请先填写单位！'),
          });
          return;
        }
      }
      const ladderLevelModalProps = {
        customizeTable,
        customizeCollapseForm,
        doubleUnitFlag,
      };
      return Modal.open({
        key: 'quick-inquiry-ladder-quote',
        title: intl.get('ssrc.quickInquiry.view.message.ladderQuotation').d('阶梯报价'),
        destroyOnClose: true,
        style: {
          width: 742,
        },
        drawer: true,
        className: styles['quick-ladder-quotation-modal-wrapper'],
        okText: intl.get('ssrc.common.button.save').d('保存'),
        children: <LadderLevelModal {...ladderLevelModalProps} itemRecord={record} />,
      });
    },
    [doubleUnitFlag, customizeTable, customizeCollapseForm]
  );

  const handlePurchaseRequest = useCallback(() => {
    if (isNewInquiry) {
      return;
    }

    const purchaseRequestProps = {
      rfqHeaderId,
      itemLineDs,
      supplierTableDs,
      customizeTable,
    };
    return Modal.open({
      destroyOnClose: true,
      key: 'quick-inquiry-purchase-request',
      drawer: true,
      title: intl.get('ssrc.quickInquiry.model.quickInquiry.purchaseRequest').d('引用采购申请'),
      children: <PurchaseRequest {...purchaseRequestProps} />,
      style: { width: 1090 },
    });
  }, [isNewInquiry, rfqHeaderId, itemLineDs, supplierTableDs, customizeTable, doubleUnitFlag]);

  // 新增
  const handleAdd = () => {
    // 默认值 新建单子 来源头公司lov里currencyCode 编辑单子 来源头数据data currencyCode
    const obj = {
      currencyCode: isNewInquiry
        ? basicFormDs?.current?.get('companyId')?.currencyCode
        : basicFormDs?.current?.get('currencyCode'),
    };
    itemLineDs.create(obj, 0);
  };

  // 筛选attribute field
  const filterAttributeFields = (data = {}) => {
    const newData = {};
    if (isEmpty(data)) {
      return newData;
    }

    Object.keys(data).forEach((key = {}) => {
      if (!key) {
        return;
      }
      const isAttributeField = !!key.match(FilterAttribute);
      const value = data[key];

      if (isAttributeField) {
        return;
      }

      newData[key] = value;
    });

    return newData;
  };

  // 复制
  // 点击按钮时对所有勾选行执行复制，复制内容不包含个性化字段，包含启用阶梯报价标识，不包含阶梯报价弹框内容，不包含行附件，不包含行号
  // 注：对于采购申请行，申请单号、申请行号不执行复制
  const copyItemLine = () => {
    const selects = itemLineDs.selected;
    if (isEmpty(selects)) {
      notification.warning({
        message: intl.get('ssrc.common.pleaseSelectItemLinesToCopy').d('请勾选要复制的行!'),
      });
      return;
    }

    const itemLines = selects.map((select) => select.toJSONData()) || [];
    itemLines.forEach((itemLine) => {
      // 筛选attribute field
      const newLine = filterAttributeFields(itemLine) || {};
      const newItemLine = {
        ...(newLine || {}),
        attachmentUuid: null,
        rfqItemId: null,
        rfqItemNum: null,
        prNum: null,
        prLineNum: null,
        prHeaderId: null,
        prLineId: null,
        prDisplayLineNum: null,
        creationDate: null,
        organizationId: getCurrentOrganizationId(),
        tenantId: getCurrentOrganizationId(),
        lastUpdateDate: null,
        copyRfqItemId: null,
        _status: 'create',
        status: 'add',
      };
      itemLineDs.create(newItemLine, 0);
    });
    itemLineDs.unSelectAll();
    itemLineDs.clearCachedSelected();
  };

  // 获取拓展公司显示条件
  const getExpandCompanyVisible = useComputed(() => {
    if (basicFormDs && basicFormDs.current) {
      const { expandResultsFlag, resultsExpandingDimensions } =
        basicFormDs.current.get(['expandResultsFlag', 'resultsExpandingDimensions']) || {};
      // 显示 拓展结果+拓展维度为【整单】
      return [1, '1'].includes(expandResultsFlag) && resultsExpandingDimensions === 'ITEM_LINE';
    }
    return false;
  }, [basicFormDs?.current]);

  // 获取拓展组织显示条件
  const getExpandInvOrganizationVisible = useComputed(() => {
    if (basicFormDs && basicFormDs.current) {
      const { expandResultsFlag, resultsExpandingDimensions, resultsExpandingHierarchy } =
        basicFormDs.current.get([
          'expandResultsFlag',
          'resultsExpandingDimensions',
          'resultsExpandingHierarchy',
        ]) || {};
      // 显示 拓展结果+ 拓展维度为【整单】+ 拓展层级为【库存组织】
      return (
        [1, '1'].includes(expandResultsFlag) &&
        resultsExpandingDimensions === 'ITEM_LINE' &&
        resultsExpandingHierarchy === 'INV_ORGANIZATION'
      );
    }
    return false;
  }, [basicFormDs?.current]);

  // 改变拓展公司
  const changeExpandCompany = (value = [], oldValue = [], record) => {
    // 清除对应公司下的库存组织
    if (!record) return;
    const deleteFlag = value?.length < oldValue?.length || value === null;
    if (!deleteFlag) return;
    const sourceResultsData = getStoreData('companyInvOrganizationRelationShipData');
    updateExpandInvOrganizationFiled({ value, oldValue, record, sourceResultsData });
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'rfqItemNum',
          width: 80,
          align: 'left',
        },
        {
          name: 'companyId',
          width: 180,
          editor: (record) => {
            return (
              <Lov
                record={record}
                name="companyId"
                onChange={(value) => changeCompanyId(value, record)}
              />
            );
          },
        },
        {
          name: 'ouId',
          width: 180,
          editor: (record) => {
            return <Lov record={record} name="ouId" onChange={() => changeOuId(record)} />;
          },
        },
        {
          name: 'invOrganizationId',
          width: 180,
          editor: (record) => {
            return (
              <Lov
                record={record}
                name="invOrganizationId"
                onChange={() => changeInvOrganizationId(record)}
              />
            );
          },
        },
        {
          name: 'itemId',
          width: 180,
          editor: (record) => {
            return (
              <Lov
                record={record}
                name="itemId"
                onChange={(value) => changeItemId(value, record)}
              />
            );
          },
        },
        {
          name: 'itemName',
          editor: true,
          width: 180,
        },
        {
          name: 'itemCategoryId',
          editor: (record) => {
            const otherProps = {
              onRow: (row) => {
                const handleSelect = ({ dataSet, record: _record }) => {
                  if (dataSet && _record) {
                    dataSet.select(_record);
                  }
                };
                return {
                  virtual: true,
                  style: {
                    maxHeight: '500px',
                  },
                  onClick: () => handleSelect(row),
                  onDoubleClick: () => {
                    if (row?.record?.selectable) {
                      handleSelect(row);
                      record.set({
                        itemCategoryId: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
            };
            return (
              <Lov
                record={record}
                name="itemCategoryId"
                tableProps={{
                  selectionMode: 'rowbox',
                  ...otherProps,
                }}
              />
            );
          },
          width: 180,
        },
        {
          name: 'secondaryUomId',
          width: 130,
          editor: (record) => {
            return (
              <Lov
                record={record}
                name="secondaryUomId"
                onChange={(value) => changeSecondaryUomId(value, record)}
              />
            );
          },
        },
        {
          name: 'uomId',
          width: 130,
          hidden: !doubleUnitFlag,
        },
        {
          name: 'currencyCode',
          editor: true,
          width: 110,
        },
        {
          name: 'targetPriceType',
          width: 120,
        },
        {
          name: 'secondaryTargetPrice',
          width: 130,
          align: 'right',
          editor: (record) => {
            return (
              <C7nPrecisionInputNumber
                name="secondaryTargetPrice"
                record={record}
                currency="currencyCode"
              />
            );
          },
          renderer: ({ record, value }) =>
            numberSeparatorRender(
              value,
              record.getState('currency_precision') ?? record.get('defaultPrecision') ?? 10
            ),
        },
        {
          name: 'targetPrice',
          width: 130,
          align: 'right',
          hidden: !doubleUnitFlag,
          renderer: ({ record, value }) =>
            numberSeparatorRender(
              value,
              record.getState('currency_precision') ?? record.get('defaultPrecision') ?? 10
            ),
        },
        {
          width: 120,
          name: 'taxId',
          align: 'right',
          editor: true,
        },
        {
          width: 120,
          name: 'ladderInquiryFlag',
          align: 'left',
          editor: true,
        },
        {
          name: 'ladderOffer',
          width: 100,
          renderer: ({ record }) => {
            return record.get('ladderInquiryFlag') && record.get('rfqItemId') ? (
              <a onClick={() => viewLadderLevelModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            ) : null;
          },
        },
        {
          name: 'brand',
          editor: true,
          width: 150,
        },
        {
          name: 'specs',
          editor: true,
          width: 150,
        },
        {
          name: 'validDateFrom',
          editor: true,
          width: 150,
        },
        {
          name: 'validDateTo',
          editor: true,
          width: 150,
        },
        {
          name: 'minLimitPrice',
          editor: true,
          width: 150,
          align: 'right',
        },
        {
          name: 'maxLimitPrice',
          editor: true,
          width: 150,
          align: 'right',
        },
        {
          name: 'prNum',
          width: 150,
        },
        {
          name: 'prLineNum',
          width: 150,
        },
        {
          name: 'remark',
          width: 200,
          renderer: ({ record }) => (
            <TextArea
              record={record}
              name="remark"
              resize="both"
              autoSize={{ maxRows: 5 }}
              className={styles['remark-textArea']}
            />
          ),
        },
        {
          name: 'attachmentUuid',
          width: 100,
          editor: true,
        },
        {
          name: 'expandCompany',
          width: 200,
          hidden: !getExpandCompanyVisible,
          editor: (record) => {
            return (
              <Lov
                record={record}
                name="expandCompany"
                onChange={(value, oldValue) => changeExpandCompany(value, oldValue, record)}
              />
            );
          },
        },
        {
          name: 'expandInvOrganization',
          width: 200,
          editor: true,
          hidden: !getExpandInvOrganizationVisible,
        },
      ].filter(Boolean),
    [basicFormDs?.current, doubleUnitFlag, getExpandCompanyVisible, getExpandInvOrganizationVisible]
  );

  const buttons = useMemo(
    () => [
      ['add', { name: 'add', onClick: handleAdd }],
      <TooltipButtonPro
        name="delete"
        icon="delete_sweep"
        disabled={isEmpty(itemLineDs.selected)}
        onClick={() => handleDeleteItem()}
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        onClick={copyItemLine}
        disabled={emptyItemLineTableDS || emptySelectedFlag}
        icon="content_copy"
        name="copy"
        color="primary"
        funcType="flat"
        help={intl.get('ssrc.common.view.message.item-line.select.tip').d('请先勾选物料行')}
      >
        {intl.get('hzero.common.button.copy').d('复制')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        disabled={emptyItemLineTableDS}
        onClick={handleBatchMaintain}
        icon="mode_edit"
        name="batchMaintain"
        funcType="flat"
        help={intl.get('ssrc.common.view.message.item-line.add.tip').d('请先新增物料行')}
      >
        <Tooltip
          title={
            emptySelectedFlag
              ? intl
                  .get('ssrc.quickInquiry.model.quickInquiry.batchAllPageDataToEdit')
                  .d('针对全部数据进行批量编辑')
              : ''
          }
        >
          {emptySelectedFlag
            ? intl.get('ssrc.quickInquiry.view.button.batchEdit').d('批量编辑')
            : intl.get('ssrc.quickInquiry.model.quickInquiry.batchCheckData').d('勾选批量编辑')}
        </Tooltip>
      </TooltipButtonPro>,
      <TooltipButtonPro
        disabled={isNewInquiry}
        onClick={handlePurchaseRequest}
        icon="root"
        name="purchaseRequest"
        funcType="flat"
        help={intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')}
      >
        {intl.get('ssrc.quickInquiry.model.quickInquiry.purchaseRequest').d('引用采购申请')}
      </TooltipButtonPro>,
      <CommonImportNew
        auto
        buttonProps={{
          disabled: isNewInquiry,
          type: 'c7n-pro',
          funcType: 'flat',
          templateCode: 'SSRC.QUICK_RFQ_ITEMS_IMPORT',
        }}
        buttonTooltip={
          isNewInquiry
            ? intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')
            : null
        }
        icon="archive"
        name="itemImport"
        businessObjectTemplateCode="SSRC.QUICK_RFQ_ITEMS_IMPORT"
        prefixPatch={SRM_SSRC}
        args={{
          rfqHeaderId,
        }}
        buttonText={intl.get('ssrc.quickInquiry.model.quickInquiry.itemImport').d('物料导入')}
        tenantId={getCurrentOrganizationId()}
        successCallBack={fetchItemLine}
      />,
    ],
    [itemLineDs, rfqHeaderId, emptyItemLineTableDS, emptySelectedFlag, isNewInquiry, basicFormDs]
  );

  return customizeTable(
    {
      code: `SSRC.QUICK_INQUIRY.EDIT.LINE_ITEM`,
      buttonCode: `SSRC.QUICK_INQUIRY.EDIT.LINE_ITEM_BUTTONS`,
    },
    <Table
      dataSet={itemLineDs}
      columns={columns}
      buttons={buttons}
      // rowHeight="auto"
      style={{ maxHeight: 420 }}
    />
  );
});
