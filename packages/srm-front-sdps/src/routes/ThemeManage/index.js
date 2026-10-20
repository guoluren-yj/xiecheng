/* eslint-disable no-param-reassign */
/**
 * 主题配置
 */
import React, { useState, useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import { Popconfirm } from 'choerodon-ui';
import { DataSet, Button, Table } from 'choerodon-ui/pro';

import { fetchChangeEnabled, fetchRemoveData } from '@/services/themeConfigService';

import { ThemeListDS, ThemeFormDS } from './stores/themeConfigDS';

import Editor from './Editor';
import styles from './index.less';

let clickLock = 1;

const ThemeConfig = (props) => {
  const { listDS, themeFormDS } = props;

  const [recordCreateFlag, setRecordCreateFlag] = useState(false); // 标识是否是行上新建
  const [editorVisible, setVisible] = useState(false);
  const [currentRowData, setCurrentRowData] = useState({});
  const [editFlag, setEditFlag] = useState(true);

  useEffect(() => {
    listDS.query();
    return () => {
      clickLock = 1;
    };
  }, []);

  const handleCreate = (record = {}, flag = false) => {
    const data = record && record.toData ? record.toData() : {};
    const { themeId, code, themeLevel } = data;
    const initData =
      themeId !== undefined
        ? {
            themeLevel,
            code,
            parentThemeId: themeId,
            parentName: record.themeName,
          }
        : {};

    setRecordCreateFlag(flag);
    setVisible(true);
    setEditFlag(true);
    setCurrentRowData(initData);
  };

  /**
   * 启用禁用操作
   * @param {*} record
   */
  const handleEnabled = (record) => {
    if (clickLock === 1) {
      clickLock = 0;
      const enableFlag = record?.get('enableFlag') ?? '0';
      const flag = enableFlag === '1' ? '0' : '1';
      const data = record?.toData() ?? '';

      data.enableFlag = flag;

      const loopChange = (arr = [], status) => {
        if (arr.length) {
          arr.forEach((item) => {
            item.enableFlag = status;
            if (item.childList && item.childList.length) {
              loopChange(item.childList, status);
            }
          });
        }
      };

      loopChange(data.childList, flag);

      fetchChangeEnabled({
        ...data,
      }).then((res) => {
        clickLock = 1;
        if (getResponse(res)) {
          listDS.query();
        }
      });
    }
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

  const handleEdit = (record) => {
    const themeId = record?.get('themeId') ?? '';

    themeFormDS.setQueryParameter('themeId', themeId);
    themeFormDS.query();
    setVisible(true);
    setEditFlag(false);
  };

  const handleClose = () => {
    setVisible(false);
    listDS.query();
  };

  const columns = () => {
    return [
      { name: 'themeName', width: 200 },
      { name: 'themeCode' },
      { name: 'sort', width: 80 },
      { name: 'themeLevel', width: 120 },
      {
        name: 'enableFlag',
        width: 120,
        renderer: ({ text, value }) => {
          const color = value === '1' ? '#179454' : '#E64322';
          const bkg = value === '1' ? 'rgba(71,184,131,0.15)' : 'rgba(242,85,53,0.15)';
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
        width: 250,
        header: intl.get('hzero.common.title.operator').d('操作'),
        renderer: ({ record }) => {
          const themeLevel = record.get('themeLevel');
          return (
            <span className="action-link">
              <a disabled={themeLevel >= 3} onClick={() => handleCreate(record, true)}>
                {intl.get('sdps.themeConfig.view.button.createNextLevel').d('新建下级目录')}
              </a>
              <a onClick={() => handleEnabled(record)}>
                {record.get('enableFlag') === '1'
                  ? intl.get('hzero.common.button.disabled').d('禁用')
                  : intl.get('hzero.common.button.enabled').d('启用')}
              </a>
              <Popconfirm
                title={intl.get('sdps.themeConfig.view.message.deleteConfirm').d('是否确认移除')}
                onConfirm={() => handleRemove(record)}
              >
                <a>{intl.get('hzero.common.button.remove').d('移除')}</a>
              </Popconfirm>
              <a onClick={() => handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  const handleSave = async () => {
    const isValid = await themeFormDS.validate();
    if (isValid) {
      themeFormDS.submit().then((res) => {
        if (getResponse(res)) {
          setVisible(false);
          listDS.query();
        }
      });
    }
  };

  const editorProps = {
    visible: editorVisible,
    dataSet: themeFormDS,
    rowData: currentRowData,
    createFlag: recordCreateFlag,
    editFlag,
    onCancel: handleClose,
    onCreate: handleSave,
  };

  return (
    <div className={styles['sdps-theme-manage-container-style']}>
      <Header title={intl.get('sdps.themeConfig.view.title.themeManage').d('主题管理')}>
        <Button icon="add" color="primary" onClick={() => handleCreate(null, false)}>
          {intl.get('sdps.themeConfig.button.createSuperTheme').d('新建顶级主题')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={listDS} columns={columns()} mode="tree" defaultRowExpanded={false} />
      </Content>
      <div id="sdps-theme-manage-container">{editorVisible && <Editor {...editorProps} />}</div>
    </div>
  );
};

export default connect((state) => state)(
  formatterCollections({
    code: ['sdps.themeConfig'],
  })(
    withProps(
      () => {
        const listDS = new DataSet(ThemeListDS());
        const themeFormDS = new DataSet(ThemeFormDS());
        return { listDS, themeFormDS };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(ThemeConfig)
  )
);
