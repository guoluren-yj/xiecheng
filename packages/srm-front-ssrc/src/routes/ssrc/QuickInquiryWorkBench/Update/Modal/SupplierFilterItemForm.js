// 供应商分配物料弹窗form
import React, { useMemo, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { isEmpty, uniqWith, noop } from 'lodash';
import { observer } from 'mobx-react-lite';

import { saveAllotItem } from '@/services/quickInquiryService';
import { supplierFilterItemDS } from '../store/supplierLineDS';

export default observer(function SupplierFilterItemForm(props) {
  const { modal, supplierRecord = {}, supplierTableDs, rfqHeaderId, customizeTable = noop } =
    props || {};

  const { rfqSupplierId } = supplierRecord?.get(['rfqSupplierId']) || {};

  const supplierFilterItemDs = useDataSet(() => supplierFilterItemDS(), []);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    supplierFilterItemDs.setQueryParameter('commonProps', {
      rfqHeaderId,
      rfqSupplierId,
    });

    const allotIteResult = await supplierFilterItemDs.query();
    if (!isEmpty(allotIteResult) && !isEmpty(allotIteResult.content)) {
      const firstRecord = allotIteResult.content.length >= 1 && allotIteResult.content[0];
      if (firstRecord) {
        const { selectAllPageFlag } = firstRecord;
        // 设置初始勾选情况
        if (selectAllPageFlag === 0) {
          // 跨页全不选
          supplierFilterItemDs.setState('selectAllManually', 0);
        } else if (selectAllPageFlag === 1) {
          // 跨页全选
          supplierFilterItemDs.setAllPageSelection(true);
        }
      }
    }
  };

  /**
   * 整合分配物料提交需要的数据
   */
  const getAllocateItemData = () => {
    let afterDealData = [];
    let selectAllPageFlag;
    if (supplierFilterItemDs) {
      // selectAllPageFlag - 是否跨页全选标识 1-是 0|null|undefined-否
      selectAllPageFlag = supplierFilterItemDs.getState('selectAllManually');
      // 选中的数据
      const selectedData = supplierFilterItemDs.selected.map((item) => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: 1,
        };
      });
      // 操作的未选中的数据
      const unSelectedData = (supplierFilterItemDs.getState('cacheUnSelectedRecords') || []).map(
        (item) => {
          return {
            ...item.toData(),
            selectAllPageFlag,
            inviteFlag: 0,
          };
        }
      );
      // 当前页未选中数据
      const currentUnSelected = (supplierFilterItemDs.unSelected || []).map((item) => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: 0,
        };
      });
      const cachedModifiedData = (supplierFilterItemDs.cachedModified || []).map((item) => {
        return {
          ...item.toData(),
          selectAllPageFlag,
          inviteFlag: Number(item.isSelected),
        };
      });
      const currentData = [
        ...selectedData,
        ...unSelectedData,
        ...currentUnSelected,
        ...cachedModifiedData,
      ];
      afterDealData = uniqWith(
        currentData,
        (arrVal, othVal) => arrVal.rfqItemId === othVal.rfqItemId
      );
    }
    return { afterDealData, selectAllPageFlag };
  };

  modal.handleOk(async () => {
    const ids = [];
    if (!rfqSupplierId || supplierFilterItemDs?.length === 0) {
      return;
    }

    ids.push(rfqSupplierId);

    const { afterDealData = [], selectAllPageFlag } = getAllocateItemData();

    const param = {
      rfqHeaderId,
      selectAllPageFlag, // 是否跨页全选标识 undefined 没有操作过 0 取消跨页全选 1 跨页全选
      rfqSupItemAssignList: afterDealData,
      rfqSupplierIds: ids,
      customizeUnitCode: `SSRC.QUICK_INQUIRY.EDIT.ITEM_SUP_ASSIGN`,
    };

    const result = await saveAllotItem(param);
    if (getResponse(result)) {
      // 分配物料成功后 供应商表格查询
      // 保留分页+缓存的变更记录
      supplierTableDs.query(supplierTableDs.currentPage, undefined, true);
      return true;
    }
    return false;
  });

  const columns = useMemo(
    () => [
      {
        name: 'rfqItemNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
      },
    ],
    []
  );

  return customizeTable(
    { code: `SSRC.QUICK_INQUIRY.EDIT.ITEM_SUP_ASSIGN` },
    <Table
      bordered
      style={{
        maxHeight: 'calc(100vh - 200px)',
      }}
      showAllPageSelectionButton
      dataSet={supplierFilterItemDs}
      columns={columns}
    />
  );
});
