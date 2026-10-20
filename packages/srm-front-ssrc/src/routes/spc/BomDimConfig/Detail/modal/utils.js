import React, { useState } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { batchValidateData } from '@/routes/spc/FormulaManage/utils';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';

export const commonDelete = async (tableDs) => {
  const selectedRows = tableDs.selected;
  const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
  const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
  // 删除本地数据
  tableDs.remove(newAddRows);

  if (!isEmpty(existedRows)) {
    // 删除线上数据
    await tableDs.delete(existedRows, {
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
    tableDs.query();
  }
};

export const FooterBtns = observer(({ tableDs, submitDs, modal, isEdit }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const validateFlag = await batchValidateData([tableDs]);
    if (!validateFlag) return;
    setLoading(true);
    const res = getResponse(
      // 处理头行结构时，调用头的submit方法
      await (submitDs || tableDs).submit().finally(() => {
        setLoading(false);
      })
    );
    if (res || res === undefined) {
      modal.close();
    }
  };
  return (
    <>
      {isEdit && (
        <Button
          loading={loading}
          color="primary"
          disabled={(tableDs?.length || 0) === 0}
          onClick={handleConfirm}
        >
          {intl.get('hzero.common.button.confirm').d('确认')}
        </Button>
      )}
      <Button onClick={() => modal.close()} {...(!isEdit ? { color: 'primary' } : {})}>
        {isEdit
          ? intl.get('hzero.common.button.cancel').d('取消')
          : intl.get('hzero.common.button.close').d('关闭')}
      </Button>
    </>
  );
});
