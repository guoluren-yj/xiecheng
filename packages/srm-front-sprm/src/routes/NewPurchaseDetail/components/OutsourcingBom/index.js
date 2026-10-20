/*
 * @Descripttion: 参考价格
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-01 17:45:26
 */

import React, { useCallback } from 'react';
import intl from 'utils/intl';
import { Modal, useDataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { outsourcingBomDs } from './store.js';
import OutsourcingModal from './OutsourcingModal.js';

const ReferencePrice = function ReferencePrice(props) {
  const {
    record: lineRecord,
    headerDs,
    readOnly,
    type,
    custCode,
    customizeTable,
    ...others
  } = props;
  const { prLineId, itemId, quantity, prHeaderId, cancelledFlag, closedFlag } = lineRecord.get([
    'prHeaderId',
    'closedFlag',
    'cancelledFlag',
    'itemId',
    'itemName',
    'itemCode',
    'prLineId',
    'quantity',
  ]);
  const tableDs = useDataSet(
    () =>
      outsourcingBomDs({
        headerDs,
        readOnly,
        type,
        ...others,
        lineRecord,
        prHeaderId,
        prLineId,
        prLineItemId: itemId,
        prLineQuantity: quantity,
        custCode,
      }),
    [prLineId, itemId, quantity]
  );
  const editFlag = lineRecord?.getField('outsourcingBom')?.disabled;

  const handleLadderPrice = useCallback(() => {
    if (
      (type === 'change' && [null, undefined].includes(lineRecord?.get('quantity'))) ||
      lineRecord?.get('quantity') <= 0
    ) {
      notification.error({
        message: intl
          .get('sprm.common.model.common.outsourcingBomQuantityCheck')
          .d('请输入大于0的申请数量信息。'),
      });
    } else if (!prLineId && type !== 'change') {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('sprm.common.bom.editWarning.tag')
          .d('该申请行未保存，bom信息不能填写，请先保存。'),
        onOk: () => {},
        okText: intl.get('hzero.common.status.closed').d('关闭'),
        footer: (okBtn) => okBtn,
      });
    } else {
      const readOnlyReCheck =
        props?.readOnly ||
        headerDs?.current.get('prSourcePlatform') === 'ERP' ||
        cancelledFlag ||
        closedFlag ||
        editFlag;
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: '1090px' },
        bodyStyle: { paddingTop: '20px' },
        title: intl.get(`sprm.common.model.common.outsourcingBom`).d('外协BOM'),
        children: (
          <OutsourcingModal
            lineRecord={lineRecord}
            tableDs={tableDs}
            {...props}
            readOnly={readOnlyReCheck}
          />
        ),
        closable: true,
        movable: false,
        destroyOnClose: true,
        onOk: async () => {
          const flag = await tableDs.validate();
          if (!tableDs.dirty) {
            lineRecord.set({ prLineBomList: null });
          } else if (type === 'change' && flag) {
            lineRecord.set({ prLineBomList: tableDs.toData() });
          } else if (readOnlyReCheck) {
            return true;
          } else {
            if (!tableDs.dirty) {
              return true;
            }
            if (flag && type !== 'change') {
              const res = getResponse(await tableDs.submit());
              if (!res) {
                return false;
              }
            } else {
              return false;
            }
          }
        },
        okText: readOnlyReCheck
          ? intl.get('hzero.common.status.closed').d('关闭')
          : intl.get('hzero.common.button.ok').d('确定'),
        footer: (okBtn, cancelBtn) =>
          readOnlyReCheck ? (
            <div>{okBtn}</div>
          ) : (
            <div>
              {okBtn}
              {cancelBtn}
            </div>
          ),
        onCancel: () => {
          if (!tableDs.dirty) {
            lineRecord.set({ prLineBomList: null });
          }
        },
      });
    }
  }, [quantity]);

  const flag =
    (lineRecord &&
      lineRecord.get('outsourcingBomFlag') &&
      ['SRM', 'ERP', undefined, null].includes(headerDs?.current.get('prSourcePlatform'))) ||
    editFlag;

  return flag ? (
    <a onClick={() => handleLadderPrice()}>
      {readOnly ||
      editFlag ||
      closedFlag ||
      cancelledFlag ||
      headerDs?.current.get('prSourcePlatform') === 'ERP'
        ? intl.get(`sprm.common.model.common.referDetail`).d('查看详细')
        : intl.get('hzero.common.button.edit').d('编辑')}
    </a>
  ) : null;
};

export default ReferencePrice;
