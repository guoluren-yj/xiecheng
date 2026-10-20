import React, { Component } from 'react';
import { Table, Dropdown, Menu, Icon, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import c7nModal, { showRecordModal } from '@/utils/c7nModal';
import EnableTag from '@/components/EnableTag';
import { AgreeAuthorityContext } from '@/routes/sagm/ProtocolWorkbench/context';
import { viewAuthActionRecord } from '../SagmWorkbench/Drawers/record';
import { enableAuthority, upgradeAuthority, publishAuthority } from './api';
import Detail from './Detail';

const organizationId = getCurrentOrganizationId();
/**
 * 采买权限管理-列表
 * 销售协议管理-采买权限列表
 */
@withRouter
export default class StrategyConfig extends Component {
  static contextType = AgreeAuthorityContext;

  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    onRef(this);
  }

  getColumns = () => {
    // columns：销售协议采买权限所带props
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
    // 销售协议采买权限展示字段稍有不同
    return columns.map((m) => {
      const findCols = _columns.find((f) => f.name === m.name) || {};
      return { ...findCols, ...m };
    });
  };

  getSearchBarColumns = () => {
    const { columns = [] } = this.props;
    const _columns = [
      {
        name: 'enableFlag',
        width: 90,
        align: 'left',
        renderer: ({ record }) => <EnableTag enabledFlag={record.get('enableFlag')} />,
      },
      { name: 'authorityListCode', width: 120 },
      { name: 'authorityListName', minWidth: 140 },
      { name: 'controlWayCodeMeaning', width: 90 },
      { name: 'controlRangeMeaning', width: 90 },
      {
        name: 'operationAuthMeaning',
      },
      { name: 'creationDate', width: 200 },
      { name: 'effectiveDate', width: 170 },
      { name: 'versionNum', width: 80 },
      { name: 'realName', width: 90 },
      {
        name: 'remark',
        minWidth: 220,
        renderer: ({ value, record }) => record.get('remarkMeaning') || value,
      },
      { name: 'options', align: 'left', width: 220, lock: 'right', renderer: this.renderOptions },
    ];
    if (!('columns' in this.props)) return _columns;
    return columns.map((m) => {
      const findCols = _columns.find((f) => f.name === m.name) || {};
      return { ...findCols, ...m };
    });
  };

  @Bind
  renderOptions({ record }) {
    const { readOnly = false, optionsFilter = [] } = this.props;
    const { enableFlag, statusCode, authorityListCode, automaticallyFlag } = record.toData(); // PUBLISHED
    const isEdit = statusCode !== 'PUBLISHED' && statusCode !== 'EXECUTING'; // 除了已发布、执行中 显示编辑、发布

    const readOnlyOptions = [
      {
        name: 'view',
        text: intl.get('sagm.common.model.look').d('查看'),
        event: () => this.handleEdit({ record, readOnly: true }),
        show: true,
      },
      {
        text: intl.get('sagm.common.model.historyVersion').d('历史版本'),
        event: () => this.handleOpenHistory(authorityListCode),
        show: true,
      },
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        event: () => viewAuthActionRecord(record),
        show: true,
      },
    ];

    const autoOptions = [
      {
        name: 'view',
        text: intl.get('sagm.common.model.look').d('查看'),
        show: true,
        event: () => this.handleEdit({ record, readOnly: true }),
      },
      {
        text: intl.get('hzero.common.button.enable').d('启用'),
        show: enableFlag === 0,
        event: () => this.handleUpadteStatus(record, 'enable'),
        disabled: statusCode === 'EXECUTING',
        style: { minWidth: 36, display: 'inline-block', textAlign: 'center' },
      },
      {
        text: intl.get('hzero.common.button.disable').d('禁用'),
        show: enableFlag === 1,
        event: () => this.handleUpadteStatus(record, 'disable'),
        disabled: statusCode === 'EXECUTING',
        style: { minWidth: 36, display: 'inline-block', textAlign: 'center' },
      },
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        event: () => viewAuthActionRecord(record),
        show: true,
      },
    ];

    const options = [
      {
        text: intl.get('hzero.common.edit').d('编辑'),
        show: isEdit,
        event: () => this.handleEdit({ record }),
      },
      {
        name: 'view',
        text: intl.get('sagm.common.model.look').d('查看'),
        show: !isEdit,
        event: () => this.handleEdit({ record, readOnly: true }),
      },
      {
        text: intl.get('sagm.common.model.upgrade').d('变更'),
        show: statusCode === 'PUBLISHED',
        event: () => this.handleUpadteStatus(record, 'upgrade'),
        disabled: enableFlag === 0,
        style: { minWidth: 36, display: 'inline-block', textAlign: 'center' },
      },
      {
        text: intl.get('sagm.common.view.inSync').d('同步中'),
        show: statusCode === 'EXECUTING',
        disabled: true,
        style: { minWidth: 36, display: 'inline-block', textAlign: 'center' },
      },
      {
        text: intl.get('sagm.common.model.publish').d('发布'),
        show: isEdit,
        event: () => this.handleUpadteStatus(record, 'publish'),
        disabled: enableFlag === 0,
        style: { minWidth: 36, display: 'inline-block', textAlign: 'center' },
      },
      {
        text: intl.get('hzero.common.button.enable').d('启用'),
        show: enableFlag === 0,
        event: () => this.handleUpadteStatus(record, 'enable'),
        disabled: statusCode === 'EXECUTING',
        type: 'menu',
      },
      {
        text: intl.get('hzero.common.button.disable').d('禁用'),
        show: enableFlag === 1,
        event: () => this.handleUpadteStatus(record, 'disable'),
        disabled: statusCode === 'EXECUTING',
        type: 'menu',
      },
      {
        text: intl.get('sagm.common.model.historyVersion').d('历史版本'),
        type: 'menu',
        show: true,
        event: () => this.handleOpenHistory(authorityListCode),
      },
      {
        text: intl.get('hzero.common.button.operating').d('操作记录'),
        event: () => viewAuthActionRecord(record),
        type: 'menu',
        show: true,
      },
    ];

    const resOpts = readOnly ? readOnlyOptions : automaticallyFlag ? autoOptions : options;

    const filterOpts = optionsFilter?.length
      ? optionsFilter?.map((m) => resOpts.find((f) => f.name === m))
      : resOpts;

    const optsStand = filterOpts.filter((f) => f.show && f.type !== 'menu');
    const optsMore = filterOpts.filter((f) => f.show && f.type === 'menu');
    const menu = (
      <Menu>
        {optsMore.map((m) => (
          <Menu.Item key={m.text}>
            <a onClick={m.event} disabled={m.disabled}>
              {m.text}
            </a>
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
      <span className="action-link">
        {optsStand.map((m) => (
          <a onClick={m.event} style={m.style || {}} disabled={m.disabled}>
            {m.text}
          </a>
        ))}
        {optsMore.length > 0 && (
          <Dropdown overlay={menu}>
            <a>
              {intl.get('hzero.common.button.more').d('更多')}
              <Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />
            </a>
          </Dropdown>
        )}
      </span>
    );
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
      upgrade: [upgradeAuthority, param],
      publish: [publishAuthority, param],
    };
    const asyncRes = asyncMap[type];
    if (asyncRes) {
      const [fn, params] = asyncRes;
      this.props.tableDs.status = 'submitting';
      const res = getResponse(await fn(params));
      this.props.tableDs.status = 'ready';
      if (res) {
        notification.success();
        tableDs.query(tableDs.currentPage);
      }
    }
  }

  @Bind
  handleEdit({ record, readOnly = false, isCreate = false }) {
    const {
      channel, // 会员协议：PERSONAL， 其他ENTERPRISE
      controlRange = 'PUR',
      viewSkuBackPath,
      agreementType, // 协议类型 PUR_AGREEMENT | SALE_AGREEMENT
      agreementHeaderId, // 协议 | 销售协议头id
      agreementHeaderNum, // 协议 | 销售协议头编号
      agreementHeaderType, // 销售协议类型：领用 | 会员 | 以销定采 | 交易抽佣；控制用户、商品范围《导入按钮》相关 和 具体采买维度
    } = this.props; // 此处全是销售协议采买权限传的参数
    const { __sourceFrom } = this.context;
    console.log('__sourceFrom', __sourceFrom);
    const agmType = record?.get('agreementHeaderType') || agreementHeaderType;
    // 销售协议 新建 采买权限基本信息表单默认值
    const init = { channel, agreementType, agreementHeaderId, agreementHeaderNum, controlRange };
    // 编辑|查看
    if (!isCreate) {
      init.channel = record.get('channel');
      init.controlRange = record.get('controlRange');
      init.agreementType = record.get('agreementType');
      init.agreementHeaderId = record.get('agreementHeaderId');
      init.agreementHeaderNum = record.get('agreementHeaderNum');
    }

    c7nModal({
      style: { width: 742 },
      okCancel: !readOnly,
      okText: readOnly ? intl.get('hzero.common.button.close').d('关闭') : undefined,
      title: intl.get('sagm.common.view.authorityConfig').d('权限配置'),
      children: (
        <Detail
          init={init}
          readOnly={readOnly}
          onFetchList={this.fetchList}
          viewSkuBackPath={viewSkuBackPath}
          path={this.props.match.path}
          agreementHeaderType={agmType}
          type={isCreate ? 'create' : record.get('authorityListId')}
          __sourceFrom={__sourceFrom} // 维护权限入口：是否来自协议
        />
      ),
    });
  }

  @Bind
  handleDelete(record) {
    this.props.tableDs.delete([record]);
  }

  @Bind()
  handleOpenHistory(authorityListCode) {
    const fields = [
      { name: 'versionNum', label: intl.get('sagm.common.view.versionNumber').d('版本号') },
      { name: 'creationDate', label: intl.get('sagm.common.view.creationDate').d('创建时间') },
      { name: 'authorityListId', label: intl.get('sagm.common.view.detail').d('明细') },
    ];
    const columns = [
      { name: 'versionNum' },
      { name: 'creationDate' },
      {
        name: 'authorityListId',
        renderer: ({ record }) => (
          <a onClick={() => this.handleEdit({ record, readOnly: true })}>
            {intl.get('sagm.common.view.lookDetail').d('查看明细')}
          </a>
        ),
      },
    ];
    showRecordModal({
      fields,
      columns,
      width: 600,
      params: { authorityListCode },
      title: intl.get('sagm.common.view.historyVersion').d('历史版本'),
      url: `/sagm/v1/${organizationId}/authority-lists/history-version`,
    });
  }

  render() {
    const {
      tableDs,
      readOnly,
      style,
      agreementHeaderId,
      customizedCode,
      searchBarTable,
      searchBarCode,
    } = this.props;
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
        {!searchBarTable && (
          <Table
            style={style}
            dataSet={tableDs}
            columns={this.getColumns()}
            buttons={buttons}
            customizedCode={customizedCode}
          />
        )}
        {searchBarTable && (
          <SearchBarTable
            style={style}
            dataSet={tableDs}
            columns={this.getSearchBarColumns()}
            searchCode={searchBarCode}
            buttons={buttons}
            searchBarConfig={{
              defaultExpand: false,
              closeFilterSelector: true,
              // fieldProps: {
              //   catalogId: { lovPara: { tenantId: organizationId } },
              // },
            }}
          />
        )}
      </>
    );
  }
}
