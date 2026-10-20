import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import type { Record } from 'choerodon-ui/dataset';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { DataSet, Button, Modal, Spin } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnLock, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { observer } from 'mobx-react-lite';
import { isString } from 'lodash';
import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getResponse, getCurrentUser } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { HZERO_FILE } from 'hzero-front/lib/utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import { listDS, headerFormDS, lineListDS } from '../../stores/translateWorkbenchConfigDs';
import { deleteDataConfig, importDataConfig, exportDataConfig } from '../../services/translateWorkbenchConfigService';
import { isJSON } from '../../utils/utils';
import EditModal from './EditModal';
import styles from './index.less';

function TranslateWorkench() {
  const [state, setState] = useState<{
    loading: boolean,
  }>({
    loading: false,
  });
  const editModalRef = useRef<any>({});
  const listDs = useMemo(() => new DataSet(listDS()), []);
  const headerFormDs = useMemo(() => new DataSet(headerFormDS()), []);
  const lineListDs = useMemo(() => new DataSet(lineListDS()), []);
  const isAdmin = useMemo(() => {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.loginName === 'admin';
  }, []);
  const refreshList = useCallback(() => {
    listDs.query();
  }, [listDs]);
  const handleCloseModal = useCallback(() => {
    if (editModalRef.current) {
      headerFormDs.loadData([]);
      lineListDs.loadData([]);
      editModalRef.current.close();
    }
  }, []);

  const handleExport = async () => {
    const res = await exportDataConfig();
    if (res && isString(res)) {
      if (isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
      } else {
        const api = `${HZERO_FILE}/v1/files/download`;
        const queryParams = [
          { name: 'url', value: encodeURIComponent(res) },
          { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
        ];
        downloadFileByAxios({ requestUrl: api, queryParams, method: 'GET' })
          .then(resp => {
            if (getResponse(resp)) {
              return true;
            }
          });
      }
    }
    return false;
  };

  const handleImport = async(file) => {
    setState({
      ...state,
      loading: true,
    });
    const formData = new FormData();
    formData.append('file', file, file.name);
    const res = await importDataConfig(formData);
    setState({
      ...state,
      loading: false,
    });
    if (getResponse(res) && res) {
      notification.success({});
      refreshList();
    }
  };
  const handleEdit = useCallback((editRecord?: Record) => {
    lineListDs.loadData([]);
    const id = editRecord ? editRecord.get('translateObjectId') : undefined;
    editModalRef.current = Modal.open({
      title:
        editRecord ?
          intl.get('hpfm.translateWorkbenchConfig.view.title.editDataConfig').d('编辑数据配置') :
          intl.get('hpfm.translateWorkbenchConfig.view.title.createDataConfig').d('新建数据配置'),
      drawer: true,
      style: { width: '1090px' },
      className: styles['edit-modal'],
      children: <EditModal id={id} formDs={headerFormDs} tableDs={lineListDs} onClose={handleCloseModal} refreshList={refreshList} />,
      footer: null,
    });
  }, [headerFormDs, lineListDs, handleCloseModal, refreshList]);
  const handleDelete = useCallback((records: Record[]) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: async () => {
        setState({
          ...state,
          loading: true,
        });
        const res = await deleteDataConfig(records[0].get('translateObjectId'));
        if (getResponse(res)) {
          notification.success({});
          refreshList();
        }
        setState({
          ...state,
          loading: false,
        });
      },
    });
  }, [refreshList]);
  const listColumns = useMemo(() => [
    { name: 'objectTypeMeaning', width: 200 },
    { name: 'objectName' },
    { name: 'tableName' },
    { name: 'primaryKey', width: 200 },
    { name: 'dataRangeTypeMeaning', width: 240 },
    { name: 'tenantEnabledFlag', width: 200, renderer: ({ value }) => yesOrNoRender(value || 0) },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      width: 120,
      lock: ColumnLock.right,
      renderer: ({ record }) => {
        if (!record) {
          return;
        }
        return (
          <>
            <Button
              funcType={FuncType.link}
              onClick={() => handleEdit(record)}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            <Button
              funcType={FuncType.link}
              onClick={() => handleDelete([record])}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </>
        );
      },
    },
  ] as ColumnProps[], [handleEdit, handleDelete]);
  return (
    <>
      <Header
        title={intl.get('hpfm.translateWorkbenchConfig.view.title.translateWorkbenchConfig').d('翻译工作台配置')}
      >
        <Button
          color={ButtonColor.primary}
          icon='add'
          onClick={() => handleEdit()}
          loading={state.loading}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        {isAdmin && (
          <Button
            icon='unarchive'
            onClick={handleExport}
            loading={state.loading}
          >
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
        )}
        {isAdmin && (
          <Upload
            accept=".json"
            beforeUpload={(file) => {
              handleImport(file);
              return false;
            }}
            style={{
              position: 'relative',
              top: '-1px',
              display: 'inline-block',
              height: '32px',
              lineHeight: '32px',
              marginLeft: '8px',
            }}
            showUploadList={false}
          >
            <Button icon='archive' loading={state.loading}>
              {intl.get('hzero.common.button.import').d('导入')}
            </Button>
          </Upload>
        )}
      </Header>
      <Content>
        <Spin spinning={state.loading}>
          <div style={{ height: 'calc(100vh - 200px)' }}>
            <FilterBarTable
              dataSet={listDs}
              columns={listColumns}
              autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 0 }}
            />
          </div>
        </Spin>
      </Content>
    </>
  );
}

export default formatterCollections({ code: ['hpfm.translateWorkbenchConfig'] })(observer(TranslateWorkench));
