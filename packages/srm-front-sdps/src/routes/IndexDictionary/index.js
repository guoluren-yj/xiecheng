/**
 * 指标字典
 */
import React, { useEffect, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import { Content, Header } from 'components/Page';
import { Popconfirm } from 'choerodon-ui';
import { DataSet, Table, Button, Dropdown, Menu } from 'choerodon-ui/pro';

import { fetchChangeEnabled, fetchRemoveData } from '@/services/IndexDictionaryService';

import { IndexListDS, IndexFormDS, PlatformFormDS } from './stores/indexDictionaryDS';
import Editor from './Editor';
import PlatformEditor from './PlatformEditor';

let clickLock = 1;

const IndexDictionary = (props) => {
  const { listDS, indexFormDS, platformFormDS } = props;

  const [visible, setVisible] = useState(false);
  const [platVisible, setPlatVisible] = useState(false);
  const [localRecord, setLocalRecord] = useState(null);

  useEffect(() => {
    listDS.query();
    return () => {
      clickLock = 1;
    };
  }, []);

  const handleCreate = (rec) => {
    setLocalRecord(rec);
    if (!rec) {
      indexFormDS.create(
        {
          indexSource: 'MANUAL',
          status: 'ENABLE',
          tenantId: 0,
          dimensionCode: 'SUPPLIER_COMPANY',
        },
        0
      );
    }
    setVisible(true);
  };

  const handleCreatePlatform = (rec) => {
    setLocalRecord(rec);
    if (!rec) {
      platformFormDS.create(
        {
          indexSource: 'PLATFORM',
          status: 'ENABLE',
          tenantId: 0,
          dimensionCode: 'SUPPLIER_COMPANY',
        },
        0
      );
    }
    setPlatVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
    setPlatVisible(false);
  };

  /**
   * 启用禁用操作
   * @param {*} record
   */
  const handleEnabled = (record) => {
    if (clickLock === 1) {
      clickLock = 0;
      const data = record?.toData() ?? {};
      fetchChangeEnabled({
        ...data,
        status: data.status === 'ENABLE' ? 'DISABLED' : 'ENABLE',
      }).then((res) => {
        clickLock = 1;
        if (getResponse(res)) {
          listDS.query();
        }
      });
    }
  };

  const columns = () => {
    return [
      { name: 'indexName' },
      { name: 'indexCode' },
      { name: 'indexType' },
      { name: 'dataType' },
      { name: 'indexSource' },
      {
        name: 'status',
        width: 120,
        renderer: ({ text, value }) => {
          const color = value === 'ENABLE' ? '#179454' : '#E64322';
          const bkg = value === 'ENABLE' ? 'rgba(71,184,131,0.15)' : 'rgba(242,85,53,0.15)';
          return (
            <span
              style={{
                background: bkg,
                padding: '1px 5px',
                color,
                borderRadius: '2px',
              }}
            >
              {text}
            </span>
          );
        },
      },
      {
        name: 'operation',
        width: 180,
        header: intl.get('hzero.common.title.operator').d('操作'),
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => handleEnabled(record)}>
                {record.get('status') === 'ENABLE'
                  ? intl.get('hzero.common.button.disabled').d('禁用')
                  : intl.get('hzero.common.button.enabled').d('启用')}
              </a>
              <a onClick={() => handleCreate(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl
                  .get('sdps.indexDictionary.view.message.deleteConfirm')
                  .d('是否确认移除')}
                onConfirm={() => handleRemove(record)}
              >
                <a>{intl.get('hzero.common.button.remove').d('移除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
  };

  /**
   * 移除
   */
  const handleRemove = (record) => {
    if (clickLock === 1) {
      clickLock = 0;
      fetchRemoveData({
        ...record.toData(),
      }).then((res) => {
        clickLock = 1;
        if (getResponse(res)) {
          notification.success();
          listDS.query();
        }
      });
    }
  };

  const handleSave = async () => {
    const isValid = await indexFormDS.validate();
    if (isValid && clickLock === 1) {
      clickLock = 0;
      indexFormDS.submit().then((res) => {
        clickLock = 1;
        if (getResponse(res)) {
          setVisible(false);
          listDS.query();
        }
      });
    }
  };

  const handleSavePlatform = async () => {
    const isValid = await platformFormDS.validate();
    if (isValid && clickLock === 1) {
      clickLock = 0;
      platformFormDS.submit().then((res) => {
        clickLock = 1;
        if (getResponse(res)) {
          setPlatVisible(false);
          listDS.query();
        }
      });
    }
  };

  const menu = () => {
    return (
      <Menu>
        <Menu.Item>
          <span onClick={() => handleCreate(null)}>
            {intl.get('sdps.indexDictionary.view.button.manualNew').d('手工新建')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span onClick={() => handleCreatePlatform(null)}>
            {intl.get('sdps.indexDictionary.view.button.platformData').d('平台数据')}
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  const editorProps = {
    visible,
    rowData: localRecord,
    dataSet: indexFormDS,
    onCancel: handleClose,
    onCreate: handleSave,
  };

  const platformProps = {
    visible: platVisible,
    rowData: localRecord,
    dataSet: platformFormDS,
    onCancel: handleClose,
    onCreate: handleSavePlatform,
  };

  return (
    <>
      <Header title={intl.get('sdps.indexDictionary.view.title.indexDictionary').d('指标字典')}>
        <Dropdown overlay={menu()}>
          <Button icon="add" color="primary">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Dropdown>
      </Header>
      <Content>
        <Table dataSet={listDS} columns={columns()} />
      </Content>
      {visible && <Editor {...editorProps} />}
      {platVisible && <PlatformEditor {...platformProps} />}
    </>
  );
};

export default connect((state) => state)(
  formatterCollections({
    code: ['sdps.indexDictionary'],
  })(
    withProps(
      () => {
        const listDS = new DataSet(IndexListDS());
        const indexFormDS = new DataSet(IndexFormDS());
        const platformFormDS = new DataSet(PlatformFormDS());
        return { listDS, indexFormDS, platformFormDS };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(IndexDictionary)
  )
);
