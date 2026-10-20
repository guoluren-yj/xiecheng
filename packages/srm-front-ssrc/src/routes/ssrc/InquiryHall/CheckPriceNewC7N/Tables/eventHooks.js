/**
 * 非等价于 react hooks useEvent
 */
import { useCallback } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { action } from 'mobx';

import intl from 'utils/intl';

const promptCode = 'ssrc.inquiryHall';

/**
 * 点击表格分组头CheckBox 勾选事件
 * @param {*} options - 非依赖性配置项
 * @param {*} deps - 依赖项
 */
const useEventChangeGroupHeaderCheckBox = ({ shareDs }, deps) => {
  return useCallback(
    action(({ totalRecords, groups, value, dimensionCode }) => {
      const callback = () => {
        if (dimensionCode === 'ITEM') {
          totalRecords.forEach((r) => r.setState('cellSelected', !!value));
        } else {
          // 获取供应商分组records
          groups.forEach((group) => {
            group.setState('colAllSelected', !!value);
          });
        }
        // 全选全不选通过allSelectFlag可以传值，其他清空不需要
        shareDs.setState('allSelectFlag', !!value);
        shareDs.setState('quotationHeaderIds', []);
        shareDs.setState('rfxLineItemIds', []);
        shareDs.setState('editQuotationLines', []);
        shareDs.setState('editQuotationLinesKeys', []);
        shareDs.setState('removeQuotationHeaderIds', []);
        shareDs.setState('removeRfxLineItemIds', []);
      };
      if (!value) {
        callback();
        return;
      }
      Modal.confirm({
        title: intl.get(`ssrc.common.message.tips`).d('提示'),
        children: intl
          .get(`${promptCode}.message.confirm.batchSelectAll`)
          .d('是否要对所有报价进行批量维护?'),
        onOk: () => {
          callback();
        },
      });
    }),
    deps
  );
};

/**
 * 点击供应商列分组头CheckBox 勾选事件 - 供应商分组
 * @param {*} options - 非依赖性配置项
 * @param {*} deps - 依赖项
 */
const useEventChangeColumnHeaderCheckBox = ({ shareDs }, deps) => {
  return useCallback(
    action(({ totalRecords, headerGroup, value, record: curRecord, dimensionCode }) => {
      const curQuotationHeaderId = curRecord.get('quotationHeaderId');
      const cancelSelect = () => {
        // 全选下，取消勾选的放到removeList，否则就是单独取消勾选，从quotationHeaderIds中移除
        if (shareDs.getState('allSelectFlag')) {
          shareDs.setState('removeQuotationHeaderIds', [
            ...(shareDs.getState('removeQuotationHeaderIds') || []),
            curQuotationHeaderId,
          ]);
        } else {
          const quotationHeaderIds = shareDs.getState('quotationHeaderIds') || [];
          quotationHeaderIds.splice(
            quotationHeaderIds.findIndex((id) => id === curQuotationHeaderId),
            1
          );
          shareDs.setState('quotationHeaderIds', quotationHeaderIds);
        }
      };
      const confirmSelect = () => {
        // 全选，勾选的从remove中移除，否则就是单独勾选，增加到quotationHeaderIds中
        if (shareDs.getState('allSelectFlag')) {
          const removeQuotationHeaderIds = shareDs.getState('removeQuotationHeaderIds') || [];
          removeQuotationHeaderIds.splice(
            removeQuotationHeaderIds.findIndex((id) => id === curQuotationHeaderId),
            1
          );
          shareDs.setState('removeQuotationHeaderIds', removeQuotationHeaderIds);
        } else {
          shareDs.setState('quotationHeaderIds', [
            ...(shareDs.getState('quotationHeaderIds') || []),
            curQuotationHeaderId,
          ]);
        }
      };

      if (dimensionCode === 'ITEM') {
        if (totalRecords) {
          if (!value) {
            totalRecords.forEach((record) => record.setState('cellSelected', !!value));
            cancelSelect();
            return;
          }
          Modal.confirm({
            title: intl.get(`ssrc.common.message.tips`).d('提示'),
            children: intl
              .get(`${promptCode}.message.confirm.selectItemsWithinSupplier`, {
                supplierName: totalRecords[0]?.get('supplierCompanyName'),
              })
              .d('是否要对供应商【{supplierName}】下所有物料进行批量维护?'),
            onOk: () => {
              totalRecords.forEach((record) => record.setState('cellSelected', !!value));
              confirmSelect();
            },
          });
        }
      } else {
        if (value) {
          confirmSelect();
        } else {
          cancelSelect();
        }
        headerGroup.setState('colAllSelected', !!value);
      }
    }),
    deps
  );
};

/**
 * 点击物料行分组头CheckBox 勾选事件 - 物料分组
 * @param {*} options - 非依赖性配置项
 * @param {*} deps - 依赖项
 */
const useEventChangeRowHeaderCheckBox = ({ shareDs }, deps) => {
  return useCallback(
    action(({ totalRecords, value, record: curRecord, itemName = '' }) => {
      const curRfxLineItemId = curRecord.get('rfxLineItemId');
      if (totalRecords) {
        if (!value) {
          totalRecords.forEach((record) => record.setState('cellSelected', !!value));
          // 全选下，取消勾选的放到removeList。否则就是单独取消勾选，从rfxLineItemIds中移除
          if (shareDs.getState('allSelectFlag')) {
            shareDs.setState('removeRfxLineItemIds', [
              ...(shareDs.getState('removeRfxLineItemIds') || []),
              curRfxLineItemId,
            ]);
          } else {
            const rfxLineItemIds = shareDs.getState('rfxLineItemIds') || [];
            rfxLineItemIds.splice(
              rfxLineItemIds.findIndex((id) => id === curRfxLineItemId),
              1
            );
            shareDs.setState('rfxLineItemIds', rfxLineItemIds);
          }
          return;
        }
        Modal.confirm({
          title: intl.get(`ssrc.common.message.tips`).d('提示'),
          children: intl
            .get(`${promptCode}.message.confirm.selectSuppliersWithinItem`, {
              itemName: totalRecords[0]?.get('itemName') || itemName,
            })
            .d('是否要对物料【{itemName}】的所有报价进行批量维护?'),
          onOk: () => {
            totalRecords.forEach((record) => record.setState('cellSelected', !!value));
            // 全选，勾选的从remove中移除，否则就是单独勾选，增加到rfxLineItemIds中
            if (shareDs.getState('allSelectFlag')) {
              // 肯定有长度，以防万一，加判空
              const removeRfxLineItemIds = shareDs.getState('removeRfxLineItemIds') || [];
              removeRfxLineItemIds.splice(
                removeRfxLineItemIds.findIndex((id) => id === curRfxLineItemId),
                1
              );
              shareDs.setState('removeRfxLineItemIds', removeRfxLineItemIds);
            } else {
              shareDs.setState('rfxLineItemIds', [
                ...(shareDs.getState('rfxLineItemIds') || []),
                curRfxLineItemId,
              ]);
            }
          },
        });
      }
    }),
    deps
  );
};

/**
 * 点击单元格CheckBox 勾选事件
 * @param {*} options - 非依赖性配置项
 * @param {*} deps - 依赖项
 */
const useEventChangeCellCheckBox = ({ shareDs }, deps) => {
  return useCallback(
    action(({ record, value }) => {
      if (!record) {
        return;
      }
      record.setState('cellSelected', !!value);
      const combineKey = record.get('combineKey');
      const editQuotationLines = shareDs.getState('editQuotationLines') || [];
      const editQuotationLinesKeys = shareDs.getState('editQuotationLinesKeys') || [];
      // 之前单独编辑过则推出，否则push
      if (editQuotationLinesKeys.includes(combineKey)) {
        editQuotationLines.splice(
          editQuotationLines.findIndex((line) => line.combineKey === combineKey),
          1
        );
        editQuotationLinesKeys.splice(
          editQuotationLinesKeys.findIndex((id) => id === combineKey),
          1
        );
        shareDs.setState('editQuotationLines', editQuotationLines);
        shareDs.setState('editQuotationLinesKeys', editQuotationLinesKeys);
      } else {
        shareDs.setState('editQuotationLines', [
          ...editQuotationLines,
          {
            ...record.toData(),
            allottedRatio:
              shareDs.getState('checkWay') === 'ratio' ? record.get('allottedRatio') : null,
            allottedQuantity:
              shareDs.getState('checkWay') === 'quantity' ? record.get('allottedQuantity') : null,
            allottedSecondaryQuantity:
              shareDs.getState('checkWay') === 'quantity'
                ? record.get('allottedSecondaryQuantity')
                : null,
            batchSelectFlag: value ? 1 : 0,
          },
        ]); // 单独编辑过勾选的单元格行数据
        shareDs.setState('editQuotationLinesKeys', [...editQuotationLinesKeys, combineKey]); // 单独编辑过勾选的单元格ids
      }
    }),
    deps
  );
};

export {
  useEventChangeCellCheckBox,
  useEventChangeGroupHeaderCheckBox,
  useEventChangeColumnHeaderCheckBox,
  useEventChangeRowHeaderCheckBox,
};
