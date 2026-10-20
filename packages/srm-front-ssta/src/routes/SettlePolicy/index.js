/*
 * @Description: 结算策略列表页
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useMemo, useCallback } from 'react';
import { flow, isNil } from 'lodash';
import { DataSet, Button, Modal, Dropdown, Icon, Menu } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react';
import { SRM_SSTA } from '_utils/config';

import ImportRecord from './ImportRecord';
import PlatStrategyModal from './PlatStrategyModal';
import { statusTagRender } from '../Components/StatusTag';
import { formatColumnCommand } from '../Components/ColumnBtnGroup';
import { tableDS } from '@/stores/SettleStrategyDS';
import VersionRecord from '@/components/HistoryRecord/VersionRecord';
import {
  copySettleStrategy,
  editSettleStrategy,
  exportSettleConfig,
  exportExcelSettleConfig,
  deleteSettleStrategy,
} from '@/services/settleStrategyServices';
import { getAttachmentUrlWithToken } from '@/utils/utils';
import StylesCommon from '@/routes/common.less';
import styles from './index.less';

const isTenant = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();
const platPrefix = `${SRM_SSTA}/v1/site`;
const tenantPrefix = `${SRM_SSTA}/v1/${organizationId}`;
// 平台级结算策略需要调用的接口前缀为site
const prefix = !isTenant ? platPrefix : tenantPrefix;

/**
 * @description: 结算策略列表页组件
 * @param {Object} props
 * @return {ReactNode}
 */
const SettleStrategy = (props) => {
  const { tableDs, history } = props;

  /**
   * @description: 跳转详情页面
   * @param {String} 详情页id参数（结算策略id/create）
   * @param {String} 详情页操作类型参数
   * @return {*}
   */
  const handleToDetail = useCallback(
    (settleConfigId, operate) => {
      history.push({
        pathname: `/ssta/settle-strategy/${operate}/${settleConfigId}`,
      });
    },
    [history]
  );

  /**
   * @description: 跳转详情页面
   * @param {String} 行主键
   */
  const handleEdit = useCallback(
    async (settleConfigId) => {
      const res = getResponse(await editSettleStrategy(settleConfigId));
      if (res?.settleConfigId) {
        handleToDetail(res.settleConfigId, 'edit');
      }
    },
    [handleToDetail]
  );

  const handleSwitch = useCallback(
    async (record) => {
      const enableFlag = record.get('enableFlag');
      record.set('enableFlag', Number(enableFlag) === 1 ? 0 : 1);
      const res = await tableDs.submit();
      if (!res) return;
      tableDs.query(tableDs.currentPage);
    },
    [tableDs]
  );

  /**
   * @description: 跳转详情页面
   * @param {String} 行主键
   */
  const handleCopy = useCallback(
    async (settleConfigId) => {
      const feedback = await Modal.confirm({
        title: intl.get('ssta.common.view.title.tip').d('提示'),
        children: intl
          .get('ssta.settleStrategy.view.message.copyStrategyConfirmTip')
          .d('复制策略无法删除，请确认是否复制'),
      });
      if (feedback !== 'ok') return;
      const res = getResponse(await copySettleStrategy({ settleConfigId }));
      if (res) {
        handleToDetail(res.settleConfigId, 'edit');
      }
    },
    [handleToDetail]
  );

  /**
   * @description: 删除未发布版本
   * @param {String} settleConfigId 策略id
   */
  const handleDelete = useCallback(
    async (settleConfigId) => {
      const feedback = await Modal.confirm({
        title: intl.get('ssta.common.view.title.tip').d('提示'),
        children: intl
          .get('ssta.settleStrategy.view.message.deleteStrategyConfirmTip')
          .d('删除后将无法恢复，确认删除当前策略版本？'),
      });
      if (feedback !== 'ok') return;
      const res = getResponse(await deleteSettleStrategy({ settleConfigId }));
      if (res) {
        tableDs.query(tableDs.currentPage);
      }
    },
    [tableDs]
  );

  /**
   * @description: 引用平台策略
   * @return {*}
   */
  const handQuotePlatStrategy = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: styles['quote-plat-strategy'],
      title: intl
        .get(`ssta.settleStrategy.view.settleStrategy.PlatformLevelStrategy`)
        .d('引用平台级策略'),
      children: <PlatStrategyModal onToDetail={handleToDetail} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [handleToDetail]);

  const handleExportJsonFile = useCallback(async (settleConfigId) => {
    const res = getResponse(await exportSettleConfig([settleConfigId]));
    if (res) {
      getAttachmentUrlWithToken(res.fileUrl);
    }
  }, []);

  const handleExportExcelFile = useCallback(async (settleConfigId) => {
    await exportExcelSettleConfig({ settleConfigId });
  }, []);

  const handleOpenRecord = useCallback(() => {
    Modal.open({
      title: intl
        .get('ssta.settleStrategy.view.settleStrategy.checkExportRecord')
        .d('查看导入记录'),
      drawer: true,
      destroyOnClose: true,
      className: StylesCommon['ssta-medium-modal'],
      children: <ImportRecord />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const uploadProps = useMemo(() => {
    return {
      accept: '.json,.JSON',
      fileList: [],
      name: 'file',
      action: `${prefix}/settle-config/import`,
      // onChange: handleImportJsonFile,
    };
  }, []);

  const handleQuery = useCallback(
    ({ params, currentPage }) => {
      tableDs.queryDataSet.loadData([params]);
      tableDs.query(currentPage);
    },
    [tableDs]
  );

  const getActionCommand = useCallback(
    ({ record }) => {
      const {
        snapshotFlag,
        configStatus,
        displayStatus,
        versionNumber,
        settleConfigId,
        settleConfigNum,
        parentSettleConfigId,
      } =
        record?.get([
          'snapshotFlag',
          'configStatus',
          'displayStatus',
          'versionNumber',
          'settleConfigId',
          'settleConfigNum',
          'parentSettleConfigId',
        ]) || {};
      const buttons = [
        {
          name: 'edit',
          text: intl.get('hzero.common.button.edit').d('编辑'),
          onClick: () => handleEdit(settleConfigId),
          showFlag: Number(snapshotFlag) === 1,
        },
        {
          name: 'enable',
          text: intl.get('hzero.common.status.enable').d('启用'),
          onClick: () => handleSwitch(record),
          showFlag: displayStatus === 'DISABLE',
        },
        {
          name: 'disable',
          text: intl.get('hzero.common.status.disabled').d('禁用'),
          onClick: () => handleSwitch(record),
          showFlag: displayStatus === 'PUBLISHED',
        },
        {
          name: 'copy',
          text: intl.get('hzero.common.button.copy').d('复制'),
          onClick: () => handleCopy(settleConfigId),
          showFlag: isNil(parentSettleConfigId) || parentSettleConfigId === -1,
        },
        {
          name: 'delete',
          text: intl.get('hzero.common.button.delete').d('删除'),
          onClick: () => handleDelete(settleConfigId),
          showFlag: configStatus === 'UNPUBLISH',
        },
        {
          name: 'exportJson',
          text: intl
            .get(`ssta.settleStrategy.view.settleStrategy.exportJsonFile`)
            .d('导出JSON文件'),
          onClick: () => handleExportJsonFile(settleConfigId),
        },
        {
          name: 'exportExcel',
          text: intl
            .get(`ssta.settleStrategy.view.settleStrategy.exportExcelFile`)
            .d('导出EXCEL文件'),
          onClick: () => handleExportExcelFile(settleConfigId),
          showFlag: isTenant,
        },
        {
          name: 'historyVersion',
          group: true,
          text: intl.get('hzero.common.button.historyVersion').d('历史版本'),
          children: (
            <VersionRecord
              primaryKey="settleConfigId"
              onClick={({ record: versionRecord }) =>
                handleToDetail(versionRecord?.get('settleConfigId'), 'history')
              }
              fieldsConfig={{
                userName: { alias: 'publishedByName' },
                time: { alias: 'publishedDate' },
              }}
              readTransport={{
                url: `${SRM_SSTA}/v1/${
                  isTenantRoleLevel() ? getCurrentOrganizationId() : 'site'
                }/settle-config/history/page`,
                method: 'GET',
                params: { settleConfigNum },
              }}
            />
          ),
          // 历史版本无需考虑显示状态是否为禁用
          showFlag: configStatus === 'PUBLISHED' && Number(versionNumber) > 1,
        },
      ];
      return formatColumnCommand({ buttons });
    },
    [
      handleEdit,
      handleCopy,
      handleDelete,
      handleSwitch,
      handleToDetail,
      handleExportJsonFile,
      handleExportExcelFile,
    ]
  );

  const columns = useMemo(() => {
    return [
      {
        name: 'displayStatus',
        width: 120,
        renderer: statusTagRender,
        headerStyle: { paddingLeft: 45 },
      },
      {
        name: 'action',
        width: 250,
        align: 'left',
        command: getActionCommand,
      },
      {
        name: 'settleConfigNum',
        width: 200,
        renderer: ({ record, value }) => (
          <a onClick={() => handleToDetail(record.get('settleConfigId'), 'all')}>{value}</a>
        ),
      },
      {
        name: 'settleConfigName',
        width: 350,
      },
      {
        name: 'versionNumber',
        width: 120,
      },
      !isTenant && {
        name: 'tenantInitFlag',
        width: 140,
      },
    ];
  }, [handleToDetail, getActionCommand]);

  return (
    <Fragment>
      <Header title={intl.get(`ssta.settleStrategy.view.settleStrategy`).d('结算策略')}>
        {!isTenant ? (
          <Button color="primary" icon="add" onClick={() => handleToDetail('create', 'edit')}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        ) : (
          <Button color="primary" icon="filter_none" onClick={handQuotePlatStrategy}>
            {intl
              .get(`ssta.settleStrategy.view.settleStrategy.PlatformLevelStrategy`)
              .d('引用平台级策略')}
          </Button>
        )}
        <Dropdown
          overlay={
            <Menu selectable={false} className={styles['ssta-menu-upload']}>
              <Menu.Item>
                <Upload {...uploadProps}>
                  {intl
                    .get(`ssta.settleStrategy.view.settleStrategy.importJsonFile`)
                    .d('导入JSON文件')}
                </Upload>
              </Menu.Item>
              <Menu.Item onClick={() => handleOpenRecord()}>
                {intl
                  .get('ssta.settleStrategy.view.settleStrategy.checkExportRecord')
                  .d('查看导入记录')}
              </Menu.Item>
            </Menu>
          }
        >
          <Button funcType="flat" icon="archive">
            {intl.get(`hzero.common.view.button.import`).d('导入')}
            <Icon style={{ margin: '-3px 0 0 4px' }} type="expand_more" />
          </Button>
        </Dropdown>
      </Header>
      <Content>
        <SearchBarTable
          cacheState
          mode="tree"
          columns={columns}
          dataSet={tableDs}
          style={{ maxHeight: 'calc(100vh - 190px)' }}
          searchCode={
            !isTenant
              ? 'SSTA.SETTLE_STRATEGY_LIST_PLAT.SEARCH_BAR'
              : 'SSTA.SETTLE_STRATEGY_LIST.SEARCH_BAR'
          }
          customizedCode="SSTA.SETTLE_STRATEGY_LIST.GRID"
          searchBarConfig={{
            onQuery: handleQuery,
            editorProps: {
              configStatus: {
                optionsFilter: (record) => record.get('value') !== 'INVALID',
              },
            },
          }}
        />
      </Content>
    </Fragment>
  );
};

export default flow(
  observer,
  withProps(
    () => {
      const tableDs = new DataSet(tableDS());
      return { tableDs };
    },
    { cacheState: true }
  ),
  formatterCollections({
    code: [
      'ssta.settleStrategy',
      'hzero.c7nProU',
      'sbud.budgeting',
      'ssta.settlePool',
      'ssta.common',
    ],
  })
)(SettleStrategy);
