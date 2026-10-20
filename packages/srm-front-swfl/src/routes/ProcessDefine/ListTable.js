import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Icon, Popconfirm, Table, Tag, Dropdown, Menu } from 'hzero-ui';
import { Debounce, Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import {
  getAccessToken,
  isTenantRoleLevel,
  listenDownloadError,
  tableScrollWidth,
  getCurrentLanguage,
} from 'utils/utils';
import { API_HOST } from 'utils/config';
import { enableRender } from 'utils/renderer';
import { downloadFile } from 'hzero-front/lib/services/api';

import AutoRestHeight from '@/components/AutoRestHeight';

listenDownloadError(
  'modelExportError',
  intl.get('hzero.common.notification.download.error').d('下载异常')
);

/**
 * 流程定义数据列表
 * @extends {Component} - React.Component
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends Component {
  constructor(props) {
    super(props);
    const language = getCurrentLanguage();
    this.observer = null;
    this.tableRef = null;
    this.frame = 0;
    this.state = {
      currentRecord: null,
      currentLanguage: ['zh_CN', 'en_US', 'ja_JP'].includes(language) ? language : 'en_US',
      resizeStyle: {},
    };
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.handler);
    this.resizeTableHeight();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.handler);
  }

  @Bind()
  handler() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(this.resize);
  }

  @Bind()
  resizeTableHeight() {
    if (this.tableRef) {
      this.observer = new MutationObserver(this.resize);
      this.observer.observe(document.querySelector('#swfl-process-define-list-filter'), {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
  }

  @Bind()
  resize() {
    const diff = 80;
    // eslint-disable-next-line react/no-find-dom-node
    const childrenRefDom = ReactDOM.findDOMNode(this.tableRef);
    if (childrenRefDom) {
      const { top: offsetTop } = childrenRefDom.getBoundingClientRect();
      const height = window.innerHeight - offsetTop - diff;
      const newScroll = {
        y: height - 60,
      };
      if (this.tableRef.handleResize) {
        this.tableRef.handleResize();
      }
      this.setState({
        resizeStyle: {
          style: {
            maxHeight: height,
          },
          bodyStyle: {
            maxHeight: height - 40,
          },
          scroll: newScroll,
        },
      });
    }
  }

  /**
   * 编辑
   * @param {object} record - 流程对象
   */
  editOption(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除
   * @param {object} record - 流程对象
   */
  deleteOption(record) {
    this.props.onDelete(record);
  }

  /**
   * 部署记录
   * @param {object} record - 流程对象
   */
  deployOption(record) {
    this.props.onDeploy(record);
  }

  /**
   * 发布
   * @param {object} record - 流程对象
   */
  @Debounce(200)
  releaseOption(record) {
    this.setState({ currentRecord: record });
    this.props.onVerifyRelease(record);
  }

  /**
   * 下载
   * @param {object} record - 流程对象
   */
  exportOption(record) {
    const { currentTenantId } = this.props;
    const prefix = isTenantRoleLevel()
      ? `${API_HOST}/hwfp/v1/${currentTenantId}`
      : `${API_HOST}/hwfp/v1`;
    const api = `${prefix}/process/models/${record.id}/download`;
    // 预定义额外传参defaultTenantId
    const queryParams =
      currentTenantId.toString() === record.tenantId.toString()
        ? [{ name: 'type', value: 'bpmn20' }]
        : [
            { name: 'type', value: 'bpmn20' },
            { name: 'defaultTenantId', value: 0 },
          ];
    downloadFile({ requestUrl: api, queryParams });
  }

  /**
   * 下拉列表菜单
   */
  getDropdownMenu(record = {}) {
    const {
      isSiteFlag,
      currentTenantId,
      // onMaintainProcess = () => {},
      onCopyProcess = (e) => e,
      onSettingProcess = (e) => e,
    } = this.props;
    const { currentLanguage } = this.state;
    const isPreDefined = currentTenantId.toString() !== record.tenantId.toString();
    // const { id } = record;
    return (
      <Menu>
        <Menu.Item key="edit">
          <a
            href={`${API_HOST}/hwfp/index.html?modelId=${
              record.id
            }&tenant_id=${currentTenantId}&isPreDefined=${
              isSiteFlag ? false : isPreDefined
            }&language=${currentLanguage}&access_token=${getAccessToken()}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {!isTenantRoleLevel() || !isPreDefined
              ? intl.get('hzero.common.button.edit').d('编辑')
              : intl.get('hzero.common.button.view').d('查看')}
          </a>
        </Menu.Item>
        {/* <Menu.Item key="editProcess">
          <a onClick={() => onMaintainProcess(id)}>
            {intl.get('hwfp.processDefine.view.message.button.maintainProcess').d('维护审批链')}
          </a>
        </Menu.Item> */}
        <Menu.Item key="download">
          <a onClick={() => this.exportOption(record)}>
            {intl.get('hzero.common.button.download').d('下载')}
          </a>
        </Menu.Item>
        {isTenantRoleLevel() && !isPreDefined && (
          <Menu.Item key="download">
            <a onClick={() => onSettingProcess(record)}>
              {intl.get('hzero.common.button.setting').d('设置')}
            </a>
          </Menu.Item>
        )}
        {(isSiteFlag || !isPreDefined) && (
          <Menu.Item key="delete">
            <Popconfirm
              placement="topRight"
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
              onConfirm={() => this.deleteOption(record)}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </Menu.Item>
        )}
        {isTenantRoleLevel() && (
          <Menu.Item key="copy">
            <a onClick={() => onCopyProcess(record)}>
              {intl.get('hzero.common.button.copy').d('复制')}
            </a>
          </Menu.Item>
        )}
      </Menu>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { currentRecord, resizeStyle } = this.state;
    const {
      dataSource,
      pagination,
      processing,
      onChange,
      releasing,
      verifyReleasing,
      isSiteFlag,
      currentTenantId,
      onRef,
      customizeTable,
    } = this.props;
    const { scroll, ...otherStyle } = resizeStyle;
    const columns = [
      isSiteFlag && {
        title: intl.get('hzero.common.model.tenantName').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('hwfp.common.model.process.class').d('流程分类'),
        dataIndex: 'categoryDescription',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.model.process.code').d('流程编码'),
        dataIndex: 'key',
        width: 200,
      },
      {
        title: intl.get('hwfp.common.model.process.name').d('流程名称'),
        dataIndex: 'name',
        width: 200,
      },
      {
        title: intl.get('hwfp.common.view.message.title.document').d('流程单据'),
        dataIndex: 'documentDescription',
        width: 200,
      },
      !isSiteFlag && {
        title: intl.get('hwfp.processDefine.model.processDefine.fireMsgFlag').d('消息推送状态'),
        width: 120,
        align: 'center',
        dataIndex: 'fireMsgFlag',
        render: (text) => enableRender(text || 0),
      },
      !isSiteFlag && {
        title: intl.get('hwfp.processDefine.model.processDefine.batchFlag').d('批量审批'),
        width: 120,
        align: 'center',
        dataIndex: 'batchFlag',
        render: (text) => enableRender(text === 0 ? 0 : 1),
      },
      !isSiteFlag && {
        title: intl.get('hwfp.processDefine.model.processDefine.mobileFlag').d('启用移动端审批'),
        width: 120,
        align: 'center',
        dataIndex: 'mobileMsgFlag',
        render: (text) => enableRender(text === 0 ? 0 : 1),
      },
      !isSiteFlag && {
        title: intl.get('hzero.common.source').d('来源'),
        width: 100,
        align: 'center',
        dataIndex: 'custom-flag',
        render: (_, record) =>
          currentTenantId.toString() === record.tenantId.toString() ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          ),
      },
      {
        title: intl.get('hwfp.processDefine.model.processDefine.lastVision').d('当前版本'),
        dataIndex: 'latestVersion',
        width: 110,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        fixed: 'right',
        width: !isSiteFlag ? 290 : 100,
        render: (val, record) => (
          <>
            <Dropdown overlay={this.getDropdownMenu(record)} trigger={['click']}>
              <a>
                {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
              </a>
            </Dropdown>
            {!isSiteFlag && currentTenantId.toString() === record.tenantId.toString() && (
              <>
                <a onClick={() => this.deployOption(record)} style={{ marginLeft: 20 }}>
                  {intl.get('hzero.common.button.deploy').d('部署记录')}
                </a>
                {
                  // eslint-disable-next-line
                  record.deploymentId ? (
                    <span style={{ color: '#666', marginLeft: 20 }}>
                      {intl.get('hwfp.common.view.button.deployed').d('已部署')}
                    </span>
                  ) : (releasing || verifyReleasing) && record.id === currentRecord.id ? (
                    <Icon type="loading" style={{ marginLeft: 20 }} />
                  ) : (
                    <a onClick={() => this.releaseOption(record)} style={{ marginLeft: 20 }}>
                      {intl.get('hwfp.common.view.button.deploy').d('部署')}
                    </a>
                  )
                }
              </>
            )}
          </>
        ),
      },
    ].filter(Boolean);
    if (isSiteFlag) {
      return (
        <AutoRestHeight topSelector=".ant-spin-container" type="hzero-ui" onRef={onRef}>
          <Table
            bordered
            rowKey="id"
            loading={processing.list}
            dataSource={dataSource}
            pagination={pagination}
            onChange={onChange}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
          />
        </AutoRestHeight>
      );
    }
    return customizeTable(
      { code: 'HWFP.PROCESS_DEFINITION.GRID' },
      <Table
        bordered
        rowKey="id"
        ref={(ref) => {
          this.tableRef = ref;
        }}
        loading={processing.list}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns), ...scroll }}
        {...otherStyle}
      />
    );
  }
}
