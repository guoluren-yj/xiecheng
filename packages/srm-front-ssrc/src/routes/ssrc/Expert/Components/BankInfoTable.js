import React, {
  useMemo,
  useRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { DataSet, Table, TextArea, Button as C7NButton } from 'choerodon-ui/pro';
import { Form, Button } from 'hzero-ui';
import { noop } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

import { bankInfoTableDS } from './store/bankInfoTableDS';

import styles from './index.less';

const promptCode = 'ssrc.expert';

const BankInfoTable = observer((props = {}) => {
  const {
    isEdit = true,
    isReq = true, // 是否是专家注册申请tab
    bankInfoTableCode,
    bankInfoList = [],
    onRef = noop,
    customizeTable = noop,
  } = props;
  const ref = useRef(null);
  const [disabled, setDisabled] = useState(false);
  const tableDS = useMemo(
    () => new DataSet(bankInfoTableDS({ isReq, isEdit, customizeUnitCode: bankInfoTableCode })),
    []
  );

  useImperativeHandle(onRef, () => ({
    bankInfoTableDS: tableDS,
  }));

  useEffect(() => {
    tableDS.loadData(bankInfoList ?? []);
    tableDS.addEventListener('batchSelect', handleBatchSelect);
    tableDS.addEventListener('batchUnSelect', handleBatchUnSelect);
    return () => {
      tableDS.removeEventListener('batchSelect', handleBatchSelect);
      tableDS.removeEventListener('batchUnSelect', handleBatchUnSelect);
    };
  }, [bankInfoList]);

  // 勾选
  const handleBatchSelect = useCallback(() => {
    setDisabled(!!tableDS.selected.length);
  }, [tableDS]);

  // 取消勾选
  const handleBatchUnSelect = useCallback(() => {
    setDisabled(!!tableDS.selected.length);
  }, [tableDS]);

  // 行上操作按钮
  const commands = ({ record }) => {
    const { expertBankId, expertBankReqId } = record.get(['expertBankId', 'expertBankReqId']) || {};
    // 专家注册申请id为expertBankReqId，其他tab为expertBankId
    const id = isReq ? expertBankReqId : expertBankId;
    return (
      <span className="action-link">
        {id && record.getState('editing') && (
          <C7NButton
            funcType="link"
            onClick={() => {
              record.reset();
              record.setState('editing', false);
            }}
          >
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </C7NButton>
        )}
        {!id && (
          <C7NButton funcType="link" onClick={() => deleteLine(record)}>
            {intl.get('hzero.common.button.clean').d('清除')}
          </C7NButton>
        )}
        {id && !record.getState('editing') && (
          <C7NButton funcType="link" onClick={() => record.setState('editing', true)}>
            {intl.get('hzero.common.button.editor').d('编辑')}
          </C7NButton>
        )}
      </span>
    );
  };

  // clear line
  const deleteLine = (record) => {
    const { expertBankId, expertBankReqId } = record.get(['expertBankId', 'expertBankReqId']) || {};

    // 专家注册申请id为expertBankReqId，其他tab为expertBankId
    const id = isReq ? expertBankReqId : expertBankId;
    if (!id) {
      tableDS.remove(record, 1);
      return;
    }

    tableDS.delete(record);
  };

  // 控制是否可编辑
  const editingFlag = (record) => {
    return record.getState('editing');
  };

  const columns = useMemo(() => {
    return [
      { name: 'bankCode' },
      { name: 'bankName' },
      isEdit
        ? {
            name: 'bankId',
            minWidth: 200,
            editor: editingFlag,
          }
        : {
            name: 'bankFirm',
            minWidth: 200,
          },
      {
        name: 'bankBranchName',
        width: 200,
      },
      {
        name: 'bankAccountName',
        width: 200,
        editor: editingFlag,
      },
      {
        name: 'bankAccountNum',
        width: 200,
        editor: editingFlag,
      },
      {
        name: 'masterFlag',
        editor: editingFlag,
      },
      {
        name: 'enabledFlag',
        editor: editingFlag,
      },
      {
        name: 'remark',
        editor: (record) => (isEdit ? <TextArea /> : record.get('remark')),
      },
      isEdit
        ? {
            name: 'operate',
            renderer: commands,
            lock: 'right',
          }
        : null,
    ];
  }, []);

  // 新增
  const handleAdd = useCallback(() => {
    const record = tableDS.create({}, 0);
    record.selectable = false;
    record.setState('editing', true);
  }, [tableDS]);

  // 删除
  const handleDelete = useCallback(() => {
    const selectedData = tableDS.selected;
    const addData = selectedData.filter((newItem) => !newItem.get('expertBankReqId'));
    const oldData = selectedData.filter((newItem) => newItem.get('expertBankReqId'));
    if (addData.length) {
      tableDS.remove(addData, 1);
    }
    if (oldData.length) {
      tableDS.delete(oldData, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  }, [tableDS]);

  return (
    <>
      {isEdit && (
        <div className={styles['item-list-search']}>
          <Form layout="inline">
            <Button type="primary" icon="plus" style={{ marginRight: 8 }} onClick={handleAdd}>
              {intl.get(`${promptCode}.view.button.newBankInformation`).d('新建银行信息')}
            </Button>
            {isReq ? (
              <Button
                icon="delete"
                // loading={deleting}
                style={{ marginRight: 8 }}
                disabled={!disabled}
                onClick={handleDelete}
              >
                {intl.get(`${promptCode}.view.button.deleteBankInformation`).d('删除银行信息')}
              </Button>
            ) : null}
          </Form>
        </div>
      )}
      {customizeTable(
        {
          code: bankInfoTableCode,
        },
        <Table
          key={isReq ? 'expertBankReqId' : 'expertBankId'}
          ref={ref}
          dataSet={tableDS}
          columns={columns}
        />
      )}
    </>
  );
});

export default BankInfoTable;
