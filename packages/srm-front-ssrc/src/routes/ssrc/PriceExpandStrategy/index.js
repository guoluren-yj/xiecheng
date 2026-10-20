/**
 * 价格拓展策略
 * @date: 2020-07-14
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Button, Spin, Dropdown, Icon, Menu } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { saveDetail, releaseDetail, enableDetail } from '@/services/priceExpandStrategyService';
import { listLineDS } from './lineDS';
import { operationDS } from './operationDS';
import { StatusRender, showOperation } from './utils';
import styles from './index.less';

@formatterCollections({
  code: ['ssrc.priceExpandStrategy', 'ssrc.inquiryHall', 'ssrc.priceLibDimension'],
})
@withCustomize()
@withProps(
  () => {
    const tableDs = new DataSet(listLineDS());
    return {
      tableDs,
    };
  },
  { cacheState: true }
)
export default class PriceExpandStrategy extends Component {
  state = {
    editLoading: false,
  };

  operationDs = new DataSet(operationDS());

  componentDidMount() {
    this.props.tableDs.setQueryParameter('newFlag', 1);
    this.props.tableDs.query(this.props.tableDs.currentPage);
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.props.history.push(`/ssrc/price-expand-strategy/create`);
  }

  /**
   * 跳转编辑页面
   */
  @Bind()
  handleEdit(record) {
    const {
      data: { expandId },
    } = record;
    this.props.history.push(`/ssrc/price-expand-strategy/update/${expandId}`);
  }

  /**
   * 跳转详情页面
   */
  @Bind()
  handleDetail(record) {
    const {
      data: { expandId },
    } = record;
    this.props.history.push(`/ssrc/price-expand-strategy/detail/${expandId}`);
  }

  /**
   * 解锁
   */
  @Bind()
  async handleUnlock(record) {
    this.setState({ editLoading: true });
    const result = getResponse(
      await saveDetail(record.toData()).finally(() => {
        this.setState({ editLoading: false });
      })
    );
    if (result) {
      this.handleEdit({ data: result });
    }
  }

  /**
   * 发布
   */
  @Bind()
  async handleRelease(record) {
    this.setState({ editLoading: true });
    const res = getResponse(
      await releaseDetail(record.toData()).finally(() => {
        this.setState({ editLoading: false });
      })
    );
    if (res) {
      notification.success();
      this.props.tableDs.query(this.props.tableDs.currentPage);
    }
  }

  /**
   * 启用
   */
  @Bind()
  async handleEnable(record) {
    this.setState({ editLoading: true });
    const res = getResponse(
      await enableDetail(record.toData()).finally(() => {
        this.setState({ editLoading: false });
      })
    );
    if (res) {
      notification.success();
      this.props.tableDs.query(this.props.tableDs.currentPage);
    }
  }

  /**
   * 渲染编辑列
   */
  @Bind()
  editOperations({ record }) {
    const { expandStatus, latestFlag, enabledFlag } = record.get([
      'expandStatus',
      'latestFlag',
      'enabledFlag',
    ]);
    const menu = (
      <Menu className={styles['operation-menu']}>
        <Menu.Item>
          <a onClick={() => showOperation(record)}>
            {intl.get('ssrc.priceExpandStrategy.view.button.operation').d('操作记录')}
          </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={() => this.handleEnable(record)}>
            {!enabledFlag
              ? intl.get('hzero.common.status.enable').d('启用')
              : intl.get('hzero.common.status.disable').d('禁用')}
          </a>
        </Menu.Item>
      </Menu>
    );
    const operate = (
      <span className="action-link">
        {expandStatus === 'PENDING' && (
          <>
            <a onClick={() => this.handleEdit(record)}>{intl.get('hzero.common.edit').d('编辑')}</a>
            <a onClick={() => this.handleRelease(record)}>
              {intl.get('hzero.common.button.release').d('发布')}
            </a>
            <Dropdown overlay={menu}>
              <a>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
                <Icon type="expand_more" />
              </a>
            </Dropdown>
          </>
        )}
        {expandStatus === 'RELEASED' && (
          <>
            {latestFlag !== 'Y' && (
              <a onClick={() => this.handleUnlock(record)}>
                {intl.get('hzero.common.edit').d('编辑')}
              </a>
            )}
            <a onClick={() => this.handleEnable(record)}>
              {!enabledFlag
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')}
            </a>
            <a onClick={() => showOperation(record)}>
              {intl.get('ssrc.priceExpandStrategy.view.button.operation').d('操作记录')}
            </a>
          </>
        )}
      </span>
    );
    return operate;
  }

  render() {
    const { editLoading } = this.state;
    const listColumns = [
      {
        headerStyle: { paddingLeft: '36px' },
        style: { paddingLeft: 0 },
        name: 'expandStatus',
        width: 120,
        renderer: ({ value, record }) => {
          return StatusRender(value, record.get('expandStatusMeaning'));
        },
      },
      {
        name: 'edit',
        width: 200,
        renderer: this.editOperations,
      },
      {
        name: 'expandCode',
        width: 120,
        renderer: ({ record, value }) => <a onClick={() => this.handleDetail(record)}>{value}</a>,
      },
      {
        name: 'expandName',
        width: 150,
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'versionNum',
        width: 100,
      },
      {
        name: 'priorityLevel',
      },
      {
        name: 'priceLibExpandCodes',
        width: 180,
      },
      {
        name: 'templateIdMeaning',
        width: 180,
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'realName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 180,
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl
            .get('ssrc.priceExpandStrategy.view.title.priceExpandStrategy')
            .d('价格拓展策略')}
        >
          <Button icon="add" color="primary" funcType="raised" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={editLoading}>
            <SearchBarTable
              customizedCode="SPC.PRICE_EXPAND_STRATEGY"
              searchCode="SSRC.PRICE_EXPAND_STRATEGY.LIST.FILTER"
              cacheState
              style={{ maxHeight: 'calc(100vh - 190px)' }}
              mode="tree"
              dataSet={this.props.tableDs}
              columns={listColumns}
              searchBarConfig={{
                checkDataSetStatus: false, // 解决操作行展开收起后点击查询，出现【当前操作将会清空变更过的数据，是否继续？】弹框提示
              }}
            />
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
