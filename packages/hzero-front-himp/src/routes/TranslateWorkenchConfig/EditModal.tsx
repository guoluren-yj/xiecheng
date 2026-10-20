import type { DataSet } from 'choerodon-ui/pro';
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Spin, Form, TextField, IntlField, Select, TextArea, Table, Button, Switch, Modal } from 'choerodon-ui/pro';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { observer } from 'mobx-react-lite';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { omit } from 'lodash';

import { queryDataConfigById, saveDataConfig } from '../../services/translateWorkbenchConfigService';
import styles from './index.less';

interface IProps {
  id: undefined | string;
  formDs: DataSet;
  tableDs: DataSet;
  onClose: () => void;
  refreshList: () => void;
}

function EditModal({
  id,
  formDs,
  tableDs,
  onClose,
  refreshList,
}: IProps) {
  const [state, setState] = useState<{
    queryLoading: boolean;
  }>({
    queryLoading: false,
  });

  const fetchData = useCallback(async (id) => {
    setState({
      ...state,
      queryLoading: true,
    });
    const res = await queryDataConfigById(id);
    setState({
      ...state,
      queryLoading: false,
    });
    if (getResponse(res)) {
      formDs.loadData([res]);
      if (res && res.translateFieldList && res.translateFieldList.length > 0) {
        tableDs.loadData(res.translateFieldList);
      }
    }
  }, [formDs, tableDs]);

  useEffect(() => {
    if (id) {
      fetchData(id);
    } else {
      formDs.loadData([{}]);
      tableDs.loadData([{}]);
    }
  }, [id, fetchData]);

  useEffect(() => {
    tableDs.selection = tableDs.length > 1 ? DataSetSelection.multiple : false;
  }, [tableDs.length]);

  const handleSave = useCallback(async () => {
    const formDsValid = await formDs.validate();
    const tableDsValid = await tableDs.validate();
    if (!formDsValid || !tableDsValid) {
      return;
    }
    const data: any = formDs.toData()[0];
    const translateFieldList = tableDs.toData().map((i: any) => ({
      ...omit(i, ['translateField', 'indexField']),
      fieldType:
        i.masterUniqueField === 1 ? 'MASTER_UNIQUE'
          : i.translateField === 1 ? 'TRANSLATE'
            : i.indexField === 1 ? 'UNIQUE' : 'EXPORT',
    }));
    data.translateFieldList = translateFieldList.length > 0 ? translateFieldList : null;
    const res = await saveDataConfig(data);
    if (getResponse(res)) {
      notification.success({});
      onClose();
      refreshList();
    }
  }, [formDs, tableDs, refreshList]);

  const handleDelete = useCallback(() => {
    if (tableDs.length === tableDs.selected.length) {
      notification.warning({
        message: intl.get('hpfm.translateWorkbenchConfig.view.message.cannotDeleteAll').d('不能删除所有字段！'),
      });
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hpfm.translateWorkbenchConfig.view.message.confirmDelete').d('确定删除选中字段吗?'),
      onOk: () => {
        const data: any = [];
        tableDs.selected.forEach(record => {
          tableDs.delete(record, false);
        });
      },
    });
  }, [tableDs.length, tableDs.selected]);

  const tableButton = useMemo(() => {
    const btns: any = [
      TableButtonType.add,
    ];
    if (tableDs.length > 1) {
      btns.push(
        <Button
          funcType={FuncType.flat}
          icon='delete'
          onClick={handleDelete}
          disabled={!tableDs.selected.length}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
    }
    return btns;
  }, [
    tableDs.length,
    tableDs.selected,
    handleDelete,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Spin spinning={state.queryLoading}>
          <div className={styles.card}>
            <div className={styles['card-title']}>
              {intl.get('hpfm.translateWorkbenchConfig.view.title.object').d('对象')}
            </div>
            <Form columns={3} labelLayout={LabelLayout.float} dataSet={formDs}>
              <Select name='objectType' clearButton={false} />
              <IntlField name='objectName' />
              <TextField name='tableName' />
              <TextField name='primaryKey' />
              <Select name='dataRangeType' clearButton={false} />
              <TextField name='tableSchema' />
              <Switch name='tenantEnabledFlag' showHelp={ShowHelp.tooltip} />
              <TextArea
                name='countAllSql'
                newLine
                colSpan={3}
                rows={6}
                resize={ResizeType.vertical}
              />
              <TextArea
                name='countLangSql'
                colSpan={3}
                rows={6}
                resize={ResizeType.vertical}
              />
              <TextArea
                name='exportSql'
                colSpan={3}
                rows={6}
                resize={ResizeType.vertical}
              />
            </Form>
          </div>
          <div className={styles.card}>
            <div className={styles['card-title']}>
              {intl.get('hpfm.translateWorkbenchConfig.view.title.exportFieldConfig').d('导出字段配置')}
            </div>
            <Table dataSet={tableDs} buttons={tableButton} className={styles.list}>
              <Table.Column name='fieldCode' editor />
              <Table.Column name='fieldName' editor />
              <Table.Column
                name='translateField'
                width={120}
                editor={<Switch />}
              />
              <Table.Column
                name='indexField'
                width={120}
                editor={<Switch />}
              />
              <Table.Column
                name='masterUniqueField'
                width={120}
                editor={<Switch />}
              />
            </Table>
          </div>
        </Spin>
      </div>
      <div className={styles.footer}>
        <Button
          color={ButtonColor.primary}
          disabled={state.queryLoading}
          onClick={handleSave}
        >
          {intl.get('hzero.common.button.ok').d('确定')}
        </Button>
        <Button onClick={onClose}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </div>
  );
}

export default observer(EditModal);