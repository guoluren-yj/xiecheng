import React, { useMemo, useState, useContext, useEffect } from 'react';
import { Form, Table, TextField, DataSet, Button, Output, Select } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';

import ImgIcon from '@/utils/ImgIcon';
import { observer } from 'mobx-react-lite';
import { Content } from 'components/Page';
import notification from 'utils/notification';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import {
  TableColumnTooltip,
  ColumnAlign,
  TableQueryBarType,
} from 'choerodon-ui/pro/lib/table/enum';

import { searchMatcher } from '@/utils/common';
import Modal from '@/components/LowcodeModal';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import MethodIcon from '@/routes/Modeler/component/MethodIcon';
import LowcodeTip from '@/components/LowcodeTip';
import { javaFieldList, positionList, entryExitList } from '@/utils/config';
import { synchronizeService } from '@/services/modelBaseService';

import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';
import FormDs from './FormDs';
import TableDs from './TableDs';
import styles from './index.less';

const { Option } = Select;

export default observer(function index() {
  const {
    storeData: { apiId, editApiFlag },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const [editForm, setEditForm] = useState<boolean>(false);
  const [isEditAll, setIsEditAll] = useState<boolean>(false);
  const formDs: DataSet = useMemo(() => new DataSet(FormDs(apiId) as DataSetProps), [apiId]);
  const searchFormDs: DataSet = useMemo(() => new DataSet(FormDs(apiId) as DataSetProps), [apiId]);
  const tableDs: DataSet = useMemo(() => new DataSet(TableDs(apiId) as DataSetProps), [apiId]);

  useEffect(() => {
    if (apiId) {
      setEditForm(false);
      setIsEditAll(false);
      formDs.query();
      tableDs.query();
    }
  }, [apiId]);

  const thisColumns = [
    {
      tooltip: TableColumnTooltip.overflow,
      name: 'parameterName',
      align: ColumnAlign.left,
      editor: isEditAll,
    },
    {
      tooltip: TableColumnTooltip.overflow,
      name: 'description',
      align: ColumnAlign.left,
      editor: isEditAll,
    },
    {
      tooltip: TableColumnTooltip.overflow,
      name: 'parameterType',
      align: ColumnAlign.left,
      editor: () =>
        isEditAll && (
          <Select searchable clearButton={false} searchMatcher={searchMatcher} name="dataType">
            {(javaFieldList || []).map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        ),
    },
    {
      tooltip: TableColumnTooltip.overflow,
      name: 'parameterLocationList',
      align: ColumnAlign.left,
      width: 320,
      editor: () =>
        isEditAll && (
          <Select
            multiple
            searchable
            clearButton={false}
            name="indexField"
            searchMatcher={searchMatcher}
          >
            {(positionList || []).map((item) => (
              <Option value={item} key={item}>
                {item}
              </Option>
            ))}
          </Select>
        ),
    },
    {
      tooltip: TableColumnTooltip.overflow,
      name: 'parameterDirectionList',
      align: ColumnAlign.left,
      width: 220,
      editor: () =>
        isEditAll && (
          <Select
            multiple
            searchable
            clearButton={false}
            name="indexField"
            searchMatcher={searchMatcher}
          >
            {entryExitList.map((value) => (
              <Option value={value} key={value}>
                {value}
              </Option>
            ))}
          </Select>
        ),
    },
  ];

  /**
   * 同步功能
   */
  const synchronize = async () => {
    Modal.warning({
      lowcodeSize: 'small',
      title: (
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.647058823529412)',
            fontWeight: 700,
          }}
        >
          同步警告
        </span>
      ),
      children: (
        <div>
          <p>
            同步将会覆盖原先的信息，<span style={{ color: '#1890FF' }}>您确定要继续同步吗？</span>
          </p>
        </div>
      ),
      onOk: async () => {
        const res = await synchronizeService(apiId);
        if (res && !res.failed) {
          notification.success({ message: '同步成功' });
          tableDs.query();
          searchFormDs.query().then((res1) => {
            if (res1 && !res1.failed) {
              // eslint-disable-next-line no-unused-expressions
              formDs.current?.set('objectVersionNumber', res1.objectVersionNumber); // 解决同步后表单 记录版本不一致的问题
            }
          });
        } else {
          notification.error({ message: '错误', description: res.message });
        }
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          {okBtn}
        </div>
      ),
    });
  };

  const seeButtons = [
    <Button
      hidden={!editApiFlag}
      onClick={() => {
        if (!isEditAll) {
          setIsEditAll(true);
        }
        tableDs.create({}, 0);
      }}
      key="edit"
    >
      <ImgIcon name="create-new@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
      新增
    </Button>,
    <Button
      hidden={!editApiFlag}
      disabled={tableDs.selected.length === 0}
      onClick={() => tableDs.delete(tableDs.selected)}
      key="delete"
    >
      <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
      批量删除
    </Button>,
    <Button onClick={() => batchEdit()} key="poEdit" hidden={!editApiFlag}>
      <ImgIcon name="edit@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
      {isEditAll ? '取消' : '批量编辑'}
    </Button>,
    <Button onClick={synchronize} key="poEdit" hidden={!editApiFlag}>
      <ImgIcon name="tongbu.svg" size={16} style={{ marginRight: '5px' }} />
      同步
    </Button>,
  ];

  const editButtons = [
    <Button
      hidden={!editApiFlag}
      onClick={() => {
        if (!isEditAll) {
          setIsEditAll(true);
        }
        tableDs.create({}, 0);
      }}
      key="edit"
    >
      <ImgIcon name="create-new@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
      新增
    </Button>,
    <Button
      hidden={!editApiFlag}
      disabled={tableDs.selected.length === 0}
      onClick={() => tableDs.delete(tableDs.selected)}
      key="delete"
    >
      <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
      批量删除
    </Button>,
    <Button onClick={() => batchEdit()} key="poEdit">
      <ImgIcon name="edit@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
      {isEditAll ? '取消' : '批量编辑'}
    </Button>,
    <Button
      icon="save"
      onClick={async () => {
        const flag = await tableDs.validate();
        if (flag) {
          const res = await tableDs.submit();
          if (res && res.failed) {
            return false;
          }
          setIsEditAll(false);
        }
      }}
      key="save"
    >
      保存
    </Button>,
    <Button onClick={synchronize} key="poEdit" hidden={!editApiFlag}>
      <ImgIcon name="tongbu.svg" size={16} style={{ marginRight: '5px' }} />
      同步
    </Button>,
  ];

  /**
   * 批量编辑
   */
  const batchEdit = () => {
    setIsEditAll(!isEditAll);
    if (isEditAll) {
      tableDs.reset();
    }
  };
  return (
    <Content className={`${styles['api-table-detail']}`}>
      {/* form表单 */}
      <div className={styles['form-wrapper']}>
        <div className={styles['api-title']}>
          <span className={styles['pre-icon']}>
            {/* 请求方式小图标样式组件 */}
            <MethodIcon method={formDs?.current?.get('apiMethod')} />
          </span>
          <Tooltip title={formDs?.current?.get('apiPath')}>
            <span className={styles['api-title-text']}>{formDs?.current?.get('apiPath')}</span>
          </Tooltip>
        </div>
        {editForm ? (
          <div className={styles['edit-form-wrapper']}>
            <Form dataSet={formDs} columns={4}>
              <TextField name="apiName" />
              <TextField name="description" colSpan={2} />
            </Form>
            <span className={styles['button-wrapper']}>
              <Button
                onClick={() => {
                  formDs.reset();
                  setEditForm(false);
                }}
              >
                取消
              </Button>
              <Button onClick={() => formDs.reset()}>重置</Button>
              <Button
                onClick={async () => {
                  const flag = await formDs?.current?.validate(true);
                  if (flag) {
                    formDs.submit();
                    setEditForm(false);
                  }
                }}
              >
                保存
              </Button>
            </span>
          </div>
        ) : (
          <div className={styles['read-form-wrapper']}>
            <Form dataSet={formDs} columns={4}>
              <Output name="apiName" />
              <Output name="description" colSpan={2} />
            </Form>
            {editApiFlag ? <Button onClick={() => setEditForm(!editForm)}>编辑</Button> : ''}
          </div>
        )}
      </div>
      {/* 参数信息table */}
      <div className={styles['table-wrapper']}>
        <div
          className={styles['table-title']}
          style={{ position: editApiFlag ? 'absolute' : 'relative' }}
        >
          {/* <span>参数信息</span> */}
          <LowcodeTip text="仅支持单模型的数据操作，不支持如一对多的头行结构数据操作" />
        </div>
        <Table
          // autoHeight
          queryBar={TableQueryBarType.none}
          rowHeight={28}
          buttons={isEditAll ? editButtons : seeButtons}
          className={`${styles.btnFloatRight} ${globalStyles['table-style']}`}
          dataSet={tableDs}
          columns={thisColumns}
        />
      </div>
    </Content>
  );
});
