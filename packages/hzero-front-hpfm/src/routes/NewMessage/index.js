import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { connect } from 'dva';
import { compose, omit, isUndefined } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { DataSet, Button, ModalProvider } from 'choerodon-ui/pro';
import { Popconfirm, Upload } from 'choerodon-ui';
import { HZERO_PLATFORM } from 'utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getAccessToken,
  filterNullValueObject,
} from 'utils/utils';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';

import { listTableDs, detailFormDs } from '@/stores/messageDs';
import AddButton from './AddButton';
import List from './List';
import LeftList from './LeftList';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();

const MessageContent = (props) => {
  const {
    message: { languageList = [] },
    match,
    tableDs,
    dispatch,
  } = props;

  const [deleteFlag, setDeleteFlag] = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [exportPending, setExportPending] = useState(false);
  const [count, setCount] = useState(0);
  const searchBarRef = useRef();

  const formDs = useMemo(() => new DataSet(detailFormDs()), []);
  /**
   * 获取初始化数据：语言列表和消息类型
   * 监听表格select事件
   */
  useEffect(() => {
    tableDs.addEventListener('select', handleMessageSelect);
    tableDs.addEventListener('unSelect', handleMessageSelect);
    tableDs.addEventListener('selectAll', handleMessageSelect);
    tableDs.addEventListener('unSelectAll', handleMessageSelect);
    tableDs.addEventListener('load', handleMessageLoad);
    dispatch({ type: 'message/init' }).then((res) => {
      // 新增/编辑弹窗添加多种语言对于的描述
      res.forEach((item) => {
        formDs.addField(`description_${item.value}`, {
          label: intl.get('hpfm.message.model.message.description').d('消息描述'),
          maxLength: 1000,
          dynamicProps: {
            required: ({ record }) => {
              // 只读
              if (isTenant && record.get('tenantId') === 0) {
                return false;
              }
              return item.langRequiredFlag;
            },
          },
        });
      });
    });
    return () => {
      tableDs.removeEventListener('select', handleMessageSelect);
      tableDs.removeEventListener('unSelect', handleMessageSelect);
      tableDs.removeEventListener('selectAll', handleMessageSelect);
      tableDs.removeEventListener('unSelectAll', handleMessageSelect);
      tableDs.removeEventListener('load', handleMessageLoad);
    };
  }, [tableDs, formDs]);

  /**
   * 表格数据选择
   */
  const handleMessageSelect = ({ dataSet }) => {
    const selectedRows = dataSet.selected;
    setCount(selectedRows.length);
    const preDefine = selectedRows.find((item) => item.get('tenantId') === 0);
    setDeleteFlag(!(selectedRows.length === 0 || (preDefine && isTenant)));
  };

  /**
   * 表格数据加载
   */
  const handleMessageLoad = ({ dataSet }) => {
    setCount(dataSet.selected.length);
    setDeleteFlag(false);
  };

  /**
   * 保存消息模态框
   */
  const handleSaveMessage = async (messageObj) => {
    const validate = await formDs.validate();
    let value = omit(formDs.current.toData(), ['tenantLov', '__dirty']);
    if (!validate) {
      return false;
    }
    const messageDescTlList = [];
    languageList.forEach((item) => {
      if (value[`description_${item.value}`]) {
        let oldTlList = {};
        if (messageObj && messageObj.messageDescTlList) {
          // 编辑保存时，处理messageDescTlList
          oldTlList = messageObj.messageDescTlList.find((i) => i.lang === item.value);
        }
        messageDescTlList.push({
          ...oldTlList,
          lang: item.value,
          description: value[`description_${item.value}`],
        });
      }
      value = omit(value, [`description_${item.value}`]);
    });
    dispatch({
      type: `message/${messageObj ? 'updateMessage' : 'createMessage'}`,
      payload: messageObj
        ? {
            ...messageObj,
            ...value,
            messageDescTlList,
            interfaceVersion: 2,
            messageId: messageDescTlList[0] ? messageDescTlList[0].messageId : '',
          }
        : { ...value, messageDescTlList, interfaceVersion: 2 },
    }).then((res) => {
      if (res) {
        notification.success();
        tableDs.query();
        // 请求最新列表数据
        if (listRef && listRef.current) {
          const { queryList } = listRef.current;
          if (queryList) {
            queryList();
          }
        }
      }
    });
  };

  /**
   * 删除
   */
  const handleDeleteMessage = () => {
    const deleteArr = [];
    tableDs.selected.forEach((item) => {
      const record = item.data;
      deleteArr.push({ ...record, messageId: record.messageId });
    });
    dispatch({
      type: 'message/batchDeleteMessage',
      payload: deleteArr,
    }).then((res) => {
      if (res) {
        notification.success();
        tableDs.query();
        // 请求左侧最新列表数据
        if (listRef && listRef.current) {
          const { queryList } = listRef.current;
          if (queryList) {
            queryList();
          }
        }
      }
    });
  };

  // 选中模块，查询表格
  const handleModule = useCallback(
    (value) => {
      tableDs.setQueryParameter('issueModule', value || '');
      tableDs.query();
    },
    [tableDs]
  );

  // 导入
  const handleImport = useCallback(({ file = {} }) => {
    const { status, response } = file;
    setImportLoading(true);
    if (status === 'done' && !response.failed) {
      notification.success({
        message: intl.get('hzero.common.upload.status.success').d('上传成功'),
      });
      setImportLoading(false);
      tableDs.query();
      // 请求左侧最新列表数据
      if (listRef && listRef.current) {
        const { queryList } = listRef.current;
        if (queryList) {
          queryList();
        }
      }
    } else if (status === 'done' && response.failed) {
      notification.error({ message: response.message });
      setImportLoading(false);
    } else if (status === 'error') {
      notification.error();
      setImportLoading(false);
    }
  }, []);

  // 导出
  const handleExport = useCallback(() => {
    const exportArr = [];
    tableDs.selected.forEach((item) => {
      const messageId =
        item.get('messageDescTlList') && item.get('messageDescTlList')[0]
          ? item.get('messageDescTlList')[0].messageId
          : '';
      exportArr.push(messageId);
    });
    setExportPending(true);
    const requestUrl = `${HZERO_PLATFORM}/v1/${
      isTenant ? `${tenantId}/response-messages` : 'response-messages'
    }/message-export`;
    const params = exportArr.length > 0 ? [{ name: 'messageIdString', value: exportArr }] : [];
    const filterValues = isUndefined(searchBarRef.current)
      ? {}
      : filterNullValueObject(
          omit(searchBarRef.current.getQueryParameter(), 'customizeFilterComparison')
        );
    if (filterValues) {
      for (const key of Object.keys(filterValues)) {
        if (filterValues[key] !== undefined) {
          params.push({ name: key, value: filterValues[key] });
        }
      }
    }
    if (listRef && listRef.current) {
      const { moduleCode } = listRef.current;
      if (moduleCode) {
        params.push({ name: 'issueModule', value: moduleCode });
      }
    }
    return new Promise((resolve, reject) => {
      downloadFileByAxios({ requestUrl, queryParams: params, method: 'POST' })
        .then((res) => {
          if (res) {
            resolve(res);
          }
        })
        .catch((err) => reject(err))
        .finally(() => {
          setExportPending(false);
        });
    });
  }, [tableDs, searchBarRef, listRef]);

  const listRef = useRef();
  const importOptions = {
    headers: { Authorization: `bearer ${getAccessToken()}` },
    onChange: handleImport,
    showUploadList: false,
    action: `${HZERO_PLATFORM}/v1/${
      isTenant ? `${tenantId}/` : ''
    }response-messages/message-import`,
    accept: '.xls,.xlsx',
    name: 'excel',
    style: { marginLeft: '8px' },
  };

  return (
    <div className={styles.message}>
      <ModalProvider>
        <Header title={intl.get('hpfm.message.view.message.title').d('返回消息管理')}>
          <AddButton match={match} formDs={formDs} onSaveMessage={handleSaveMessage} />
          <Popconfirm
            title={intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?')}
            onConfirm={handleDeleteMessage}
          >
            <Button
              style={{
                marginLeft: '0.08rem',
              }}
              funcType="flat"
              icon="delete"
              disabled={!deleteFlag}
            >
              {intl.get('hzero.common.button.toDelete').d('删除')}
            </Button>
          </Popconfirm>
          <Upload {...importOptions}>
            <Button funcType="flat" loading={importLoading} icon="archive">
              {intl.get('hzero.common.button.import').d('导入')}
            </Button>
          </Upload>
          <Button funcType="flat" onClick={handleExport} loading={exportPending} icon="unarchive">
            {count > 0
              ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
              : intl.get('hzero.common.button.export').d('导出')}
          </Button>
        </Header>
        <Content>
          <div className="message-content">
            <LeftList onModule={handleModule} childRef={listRef} />
            <List
              tableDs={tableDs}
              formDs={formDs}
              onSaveMessage={handleSaveMessage}
              searchBarRef={searchBarRef}
            />
          </div>
        </Content>
      </ModalProvider>
    </div>
  );
};

export default compose(
  connect(({ loading, message, user }) => ({
    message,
    user,
    saving: loading.effects['message/createMessage'],
    getMessageLoading: loading.effects['message/getMessageDetail'],
    updateMessageLoading: loading.effects['message/updateMessage'],
  })),
  formatterCollections({ code: ['hpfm.message', 'hzero.common', 'hpfm.common'] }),
  WithCustomize({
    unitCode: ['HPFM.MESSAGE_LIST.FILTER', 'HPFM.MESSAGE_USER_LIST.FILTER'],
  }),
  withProps(() => {
    const tableDs = new DataSet(listTableDs());
    return {
      tableDs,
    };
  }, {})
)(MessageContent);
