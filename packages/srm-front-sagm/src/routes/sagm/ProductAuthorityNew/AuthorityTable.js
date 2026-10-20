import React, { Component } from 'react';
import { Table, Dropdown, Menu, Icon, Button, Spin } from 'choerodon-ui/pro';
import { Record } from 'choerodon-ui/dataset';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import qs from 'qs';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject, getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import c7nModal, { confirm } from '@/utils/c7nModal';
import EnableTag from '@/components/EnableTag';
import { AgreeAuthorityContext } from '@/routes/sagm/ProtocolWorkbench/context';

import { viewAuthActionRecord } from '../SagmWorkbench/Drawers/record';
import HistoryPop from '../../../components/HistoryPop';
import { enableAuthority, upgradeAuthority, publishAuthority } from '../ProductAuthority/api';
import { fetchSubAuthority, fetchAuthorityHisVersion } from './api';
import ModalWrapper from './Detail/ModalWrapper';
import { renderAuthorityStatus } from './render';

import styles from './styles.less';

/**
 * 采买权限管理-列表
 * 商城协议工作台 - 采买权限列表
 * 销售协议管理-采买权限列表
 * interface IStrategyConfig {
 * push：标识路由页面（仅采买权限管理详情是路由）
 *  readOnly: boolean // 商城协议、 销售协议引入组件所传, 默认 false
 *  tableDs: 筛选器数据源
 *  searchBarCode：筛选器编码
 *  customizedCode： 列表个性化编码
 *  searchBarTable： 显示Table || SearchBarTable
 *  deleteFlag: 协议采买权限props - 是否是已删除状态的协议(权限详情查询参数)
 *  agreementHeaderId：商城协议、 销售协议引入组件所传
 *  agreementType： 商城协议、 销售协议引入组件所传
 *  agreementHeaderNum： 商城协议、 销售协议引入组件所传
 *  style: 商城协议、 销售协议引入组件所传
 *  viewSkuBackPath： 商品详情返回路径
 *  path: 来源页面路由
 *
 * }
 */
@withRouter
export default class AuthorityTable extends Component {
  static contextType = AgreeAuthorityContext;

  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    onRef(this);
    const { searchBarCode, tableDs, customizedCode } = props;
    tableDs.setQueryParameter('customizeUnitCode', `${searchBarCode},${customizedCode}`);
  }

  @Bind
  fetchList(type = 'create') {
    const { tableDs } = this.props;
    if (type === 'create') {
      tableDs.query();
    } else {
      tableDs.query(tableDs.currentPage);
    }
  }

  @Bind
  async handleUpadteStatus(record, type) {
    const { tableDs } = this.props;
    const param = record.toData();
    const asyncMap = {
      enable: [enableAuthority, { ...param, enableFlag: 1 }],
      disable: [enableAuthority, { ...param, enableFlag: 0 }],
      // upgrade: [upgradeAuthority, param],
      publish: [publishAuthority, param],
    };
    const asyncRes = asyncMap[type];
    if (asyncRes) {
      const [fn, params] = asyncRes;
      tableDs.status = 'submitting';
      const res = getResponse(await fn(params));
      tableDs.status = 'ready';
      if (res) {
        notification.success({
          description:
            type === 'publish'
              ? intl
                  .get('sagm.common.view.publishHelp')
                  .d('当数据量较大时执行可能耗时数个小时，请耐心等待')
              : null,
        });
        tableDs.query(tableDs.currentPage);
      }
    }
  }

  @Bind
  handlePublish(record) {
    confirm({
      content: intl
        .get('sagm.productAuthority.view.confirm.publishInfoTip')
        .d(
          '权限发布可能占用大量系统资源并持续数小时，请务必在夜间或休息日发布。若发布报错请联系管理员处理。是否继续？'
        ),
      onOk: async () => {
        const { tableDs } = this.props;
        const confirmFlag = record.get('publishConfirmFlag');
        if (confirmFlag) {
          const param = record.toData();
          tableDs.status = 'submitting';
          const res = getResponse(await publishAuthority(param));
          tableDs.status = 'ready';
          if (res) {
            notification.success({
              description: intl
                .get('sagm.common.view.publishHelp')
                .d('当数据量较大时执行可能耗时数个小时，请耐心等待'),
            });
            tableDs.query(tableDs.currentPage);
          }
        } else {
          this.handleUpadteStatus(record, 'publish');
        }
      },
    });
  }

  // 变更 - 已发布的策略点击变更后生成新版本并直接进入新版本的编辑页面
  @Bind
  async handleUpgrade(record) {
    const { tableDs } = this.props;
    const param = record.toData();
    tableDs.status = 'submitting';
    const res = getResponse(await upgradeAuthority(param));
    tableDs.status = 'ready';
    if (res) {
      const authorityListId = record.get('authorityListId');
      // 查询变更出的子版本
      const _res = getResponse(await fetchSubAuthority(authorityListId));
      if (_res) {
        const childRecord = new Record(_res || {});
        // 父级为禁用, 子节点启用且为未发布状态
        const publishConfirmFlag = !record.get('enableFlag');
        childRecord.set('publishConfirmFlag', publishConfirmFlag);
        this.handleEdit({ record: childRecord });
      }
    }
  }

  // 包括历史版本查看
  @Bind
  handleEdit({ record, readOnly = false, isCreate = false, versionFlag = 0 }) {
    const {
      channel,
      controlRange = 'PUR',
      viewSkuBackPath,
      push,
      agreementType,
      agreementHeaderId,
      agreementHeaderNum,
      agreementHeaderType,
    } = this.props;
    const { __sourceFrom } = this.context;
    const init = { channel, agreementType, agreementHeaderId, agreementHeaderNum, controlRange };
    if ('deleteFlag' in this.props) {
      init.deleteFlag = this.props.deleteFlag;
    }
    let authorityListId = null;
    if (!isCreate) {
      authorityListId = record.get('authorityListId');
      init.channel = record.get('channel');
      init.controlRange = record.get('controlRange');
      init.agreementType = record.get('agreementType');
      init.agreementHeaderId = record.get('agreementHeaderId');
      init.agreementHeaderNum = record.get('agreementHeaderNum');
    }

    // 路由页面
    if (push && isFunction(push)) {
      const agmType = record.get('agreementHeaderType') || agreementHeaderType;
      push({
        pathname: `/s2-mall/sagm/product-authority/detail/${readOnly ? 'read' : 'edit'}`,
        search: qs.stringify({
          authorityListId: record.get('authorityListId'),
          agreementHeaderType: agmType,
          statusCode: record.get('statusCode'),
          versionFlag,
        }),
        state: {
          init,
          versionNum: record.get('versionNum'), // 历史本本显示
          authorityListCode: record.get('authorityListCode'), // 历史版本参数
          publishConfirmFlag: record.get('publishConfirmFlag'),
          isChildNode: record.get('parentPrimaryKey'),
        },
      });
    }
    // 弹窗
    else {
      const title = isCreate
        ? intl.get('sagm.productAuthority.view.title.new').d('新建采买权限')
        : !readOnly
        ? intl.get('sagm.productAuthority.view.title.edit').d('编辑采买权限')
        : intl.get('sagm.productAuthority.view.title.new.view').d('查看采买权限详情');
      c7nModal({
        title,
        style: { width: 1090 },
        bodyStyle: {
          paddingRight: authorityListId ? 0 : 20,
          paddingTop: !authorityListId ? 0 : 20,
        }, // tab 右外侧滚动, 顶部滚动不留白
        children: (
          <ModalWrapper
            authorityListId={authorityListId}
            readOnly={readOnly}
            init={init}
            onFetchList={this.fetchList}
            viewSkuBackPath={viewSkuBackPath}
            path={viewSkuBackPath}
            __sourceFrom={__sourceFrom}
            isCreate={isCreate}
            publishConfirmFlag={record ? record.get('publishConfirmFlag') : false}
          />
        ),
      });
    }
  }

  @Bind
  handleDelete(record) {
    this.props.tableDs.delete([record]);
  }

  expandIcon = ({ prefixCls, expanded, expandable, record, onExpand }) => {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (record.getState('loading') === true) {
      // 自定义状态渲染
      return <Spin delay={200} size="small" />;
    }
    return (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        style={{ visibility: record.get('childFlag') ? 'visible' : 'hidden' }}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    );
  };

  handleLoadData = ({ record, dataSet }) => {
    const parentUnitId = record.get('authorityListId');
    if (!record.children) {
      record.setState('loading', true);
      fetchSubAuthority(parentUnitId)
        .then((res) => {
          if (res) {
            let resData = [{ ...res, parentPrimaryKey: record.get('primaryKey') }] || [];
            resData = resData.map((m) => ({
              ...m,
              // 父级为禁用, 子节点启用且为未发布状态
              publishConfirmFlag:
                !record.get('enableFlag') &&
                m.enableFlag &&
                !['PUBLISHED', 'EXECUTING'].includes(m.statusCode),
            }));
            dataSet.appendData(resData);
          }
        })
        .finally(() => {
          record.setState('loading', false);
        });
    }
  };

  @Bind
  renderOptions({ record }) {
    const { readOnly = false, optionsFilter = [], deleteFlag } = this.props;
    const {
      enableFlag,
      childFlag,
      statusCode,
      authorityListCode,
      automaticallyFlag,
      versionNum,
    } = record.toData(); // PUBLISHED
    const isChildNode = record.get('parentPrimaryKey');
    const isEdit = !['PUBLISHED', 'EXECUTING'].includes(statusCode); // 显示编辑、发布
    const enabledFlag = statusCode !== 'EXECUTING';

    // 商城协议、销售协议按钮
    const readOnlyOptions = [
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        event: () => viewAuthActionRecord(record),
        show: true,
      },
      {
        text: intl.get('sagm.common.model.historyVersion').d('历史版本'),
        show: !isChildNode && versionNum > 1,
        comp: HistoryPop,
        type: 'drop',
        compProps: {
          currentVersionNum: versionNum,
          funcType: 'link',
          onItemClick: (data) => {
            const record = new Record(data);
            this.handleEdit({ record, readOnly: true, versionFlag: 1 });
          },
          fetchApi: fetchAuthorityHisVersion,
          params: filterNullValueObject({
            authorityListCode,
            deleteFlag: 'deleteFlag' in this.props ? deleteFlag : null,
            page: 0,
            size: 100, // 之前接口是有分页的，pop模式无， 100模拟全部页数据，足够用
          }),
        },
      },
    ];

    // 系统自动创建
    // 未发布的不能禁用
    //  针对于父级为已禁用时，发布子级未发布版本时需弹出二次确认提示
    // 已发布版本被禁用后任支持变更出新的未发布版本
    const autoOptions = [
      {
        text: intl.get('hzero.common.button.enable').d('启用'),
        show: enableFlag === 0 && enabledFlag,
        event: () => this.handleUpadteStatus(record, 'enable'),
      },
      {
        text: intl.get('hzero.common.button.disable').d('禁用'), // 未发布的不能禁用
        show: enableFlag === 1 && !isEdit,
        event: () => this.handleUpadteStatus(record, 'disable'),
      },
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        event: () => viewAuthActionRecord(record),
        show: true,
      },
    ];
    const options = [
      {
        text: intl.get('sagm.common.model.publish').d('发布'),
        show: isEdit && enableFlag,
        event: () => this.handlePublish(record),
      },
      {
        text: intl.get('hzero.common.edit').d('编辑'),
        show: isEdit,
        event: () => this.handleEdit({ record }),
      },
      {
        text: intl.get('sagm.common.model.upgrade').d('变更'),
        show: statusCode === 'PUBLISHED' && !childFlag,
        event: () => this.handleUpgrade(record),
      },
      {
        text: intl.get('hzero.common.button.enable').d('启用'),
        show: enableFlag === 0 && enabledFlag,
        event: () => this.handleUpadteStatus(record, 'enable'),
      },
      {
        text: intl.get('hzero.common.button.disable').d('禁用'),
        show: enableFlag === 1 && !isEdit,
        event: () => this.handleUpadteStatus(record, 'disable'),
        disabled: statusCode === 'EXECUTING',
      },
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        event: () => viewAuthActionRecord(record),
        show: !isChildNode,
      },
      {
        text: intl.get('sagm.common.model.historyVersion').d('历史版本'),
        show: !isChildNode && versionNum > 1,
        comp: HistoryPop,
        type: 'drop',
        compProps: {
          funcType: 'link',
          currentVersionNum: versionNum,
          onItemClick: (data) => {
            const record = new Record(data);
            this.handleEdit({ record, readOnly: true, versionFlag: 1 });
          },
          fetchApi: fetchAuthorityHisVersion,
          params: {
            authorityListCode,
            page: 0,
            size: 100, // 之前接口是有分页的，pop模式无， 100模拟全部页数据，足够用
          },
        },
      },
    ];

    const resOpts = readOnly ? readOnlyOptions : automaticallyFlag ? autoOptions : options;

    const filterOpts = (optionsFilter?.length
      ? optionsFilter?.map((m) => resOpts.find((f) => f.name === m))
      : resOpts
    ).filter((f) => f.show);

    const optsStand = filterOpts.slice(0, filterOpts.length > 3 ? 2 : 3);
    const optsMore = filterOpts.length > 3 ? filterOpts.slice(2) : [];
    const menu = (
      <Menu style={{ width: 96 }} className={styles['operate-column-drop']}>
        {optsMore.map((m) => {
          return m.type !== 'drop' ? (
            <Menu.Item key={m.text}>
              <Button funcType="link" onClick={m.event} disabled={m.disabled}>
                {m.text}
              </Button>
            </Menu.Item>
          ) : (
            <Menu.SubMenu title={m.text}>
              <HistoryPop {...m.compProps} isSubMenu />
            </Menu.SubMenu>
          );
        })}
      </Menu>
    );
    return (
      <span className="action-link-btns">
        {optsStand.map((m) => {
          if (m.comp) {
            const Com = m.comp;
            return <Com btnText={m.text} {...m.compProps} />;
          }
          return (
            <Button
              funcType="link"
              onClick={m.event}
              style={m.style || {}}
              disabled={m.disabled}
              help={m.help}
            >
              {m.text}
            </Button>
          );
        })}
        {optsMore.length > 0 && (
          <Dropdown overlay={menu}>
            <Button funcType="link">
              {intl.get('hzero.common.button.more').d('更多')}
              <Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />
            </Button>
          </Dropdown>
        )}
      </span>
    );
  }

  getColumns = () => {
    const { columns = [] } = this.props;
    const _columns = [
      { name: 'authorityListCode', width: 120 },
      { name: 'authorityListName', minWidth: 140 },
      { name: 'agreementTypeMeaning', width: 90 },
      { name: 'agreementHeaderNum', width: 160 },
      { name: 'controlWayCodeMeaning', width: 90 },
      { name: 'controlRangeMeaning', width: 90 },
      {
        name: 'operationAuthMeaning',
      },
      {
        name: 'remark',
        minWidth: 220,
        renderer: ({ value, record }) => record.get('remarkMeaning') || value,
      },
      { name: 'realName', width: 90 },
      { name: 'creationDate', width: 200 },
      { name: 'effectiveDate', width: 170 },
      { name: 'versionNum', width: 80 },
      {
        name: 'enableFlag',
        width: 90,
        align: 'left',
        renderer: ({ record }) => <EnableTag enabledFlag={record.get('enableFlag')} />,
      },
      { name: 'options', width: 220, lock: 'right', renderer: this.renderOptions },
    ];
    if (!('columns' in this.props)) return _columns;
    return columns.map((m) => {
      const findCols = _columns.find((f) => f.name === m.name) || {};
      return { ...findCols, ...m };
    });
  };

  getSearchBarColumns = () => {
    const { columns = [] } = this.props;
    const { __sourceFrom } = this.context;
    const _columns = [
      {
        name: 'statusCodeMeaning',
        title: intl.get('hzero.common.status').d('状态'),
        width: 110,
        align: 'left',
        tooltip: 'none',
        renderer: renderAuthorityStatus,
      },
      {
        name: 'options',
        align: 'left',
        tooltip: 'none',
        width: 200,
        renderer: this.renderOptions,
        lock: __sourceFrom === 'agreement' ? 'right' : null,
      },
      {
        name: 'authorityListCode',
        width: 120,
        renderer: ({ value, record }) => {
          return <a onClick={() => this.handleEdit({ record, readOnly: true })}>{value}</a>;
        },
      },
      { name: 'authorityListName', minWidth: 140 },
      { name: 'versionNum', width: 80, align: 'right' },
      { name: 'controlWayCodeMeaning', width: 90 },
      { name: 'controlRangeMeaning', width: 90 },
      {
        name: 'operationAuthMeaning',
      },
      { name: 'creationDate', width: 200 },
      { name: 'effectiveDate', width: 170 },
      { name: 'realName', width: 90 },
      {
        name: 'remark',
        minWidth: 220,
        renderer: ({ value, record }) => record.get('remarkMeaning') || value,
      },
    ];
    if (!('columns' in this.props)) return _columns;
    return columns.map((m) => {
      const findCols = _columns.find((f) => f.name === m.name) || {};
      return { ...findCols, ...m };
    });
  };

  render() {
    const {
      tableDs,
      readOnly,
      style = {},
      agreementHeaderId,
      customizedCode,
      searchBarTable,
      searchBarCode,
    } = this.props;
    const { __sourceFrom } = this.context;
    let buttons = [];
    if (!readOnly && agreementHeaderId) {
      buttons = [
        <Button
          color="primary"
          funcType="flat"
          icon="playlist_add"
          disabled={!agreementHeaderId}
          onClick={() => this.handleEdit({ isCreate: true })}
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
      ];
    }
    return (
      <>
        {/* 作为其他页面权限子组件时 */}
        {__sourceFrom && !readOnly && (
          <div className={styles['authority-update-tip']}>
            {intl
              .get('sagm.common.view.editAfterDelayMsg')
              .d('编辑权限后商品更新会存在一定延迟，可能会短暂影响搜索结果')}
          </div>
        )}
        {!searchBarTable && (
          <Table
            style={style}
            className={styles['authority-manage-table']}
            dataSet={tableDs}
            mode="tree"
            expandIcon={this.expandIcon}
            treeLoadData={this.handleLoadData}
            columns={this.getColumns()}
            buttons={buttons}
            customizedCode={customizedCode}
          />
        )}
        {searchBarTable && (
          <SearchBarTable
            className={styles['authority-manage-table']}
            style={{ maxHeight: 'calc(100vh - 192px)', ...style }}
            cacheState
            dataSet={tableDs}
            columns={this.getSearchBarColumns()}
            searchCode={searchBarCode}
            customizedCode={customizedCode}
            buttons={buttons}
            mode="tree"
            expandIcon={this.expandIcon}
            treeLoadData={this.handleLoadData}
            searchBarConfig={{
              closeFilterSelector: 'readOnly' in this.props,
              expandable: 'readOnly' in this.props ? !readOnly : true,
            }}
          />
        )}
      </>
    );
  }
}
