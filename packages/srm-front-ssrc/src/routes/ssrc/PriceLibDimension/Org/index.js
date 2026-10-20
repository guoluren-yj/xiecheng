/**
 * 价格库维度管理-租户
 * @date: 2020-06-15
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import {
  DataSet,
  // Table,
  Button,
  // Modal,
  Menu,
  Dropdown,
  Icon,
  Spin,
  // Form,
  // TextField,
  // Lov,
  // IntlField,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { isArray, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import notification from 'utils/notification';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
// import { openTab } from 'utils/menuTab';

import {
  enablePriceLibOrg,
  releasePriceLibOrg,
  // fetchUnlockPriceLibOrg,
  editPriceLibOrg,
} from '@/services/priceLibDimensionService';
import { listLineDS, viewConfigDS, warningDS, menuDS } from './lineDS';
import { operationDS } from './operationDS';
import { ImportButton, ExportButton } from '../components';
import {
  StatusRender,
  handleShowWarningModal,
  showViewConfig,
  showOperation,
  handleGenerateMenu,
  jumpPriceLibrary,
  handleJumpPriceLib,
} from './utils';
import styles from '../index.less';

@formatterCollections({
  code: [
    'ssrc.priceLibDimension',
    'ssrc.common',
    'ssrc.inquiryHall',
    'hzero.common',
    'hpfm.individual',
    'hpfm.customize',
    'hpfm.individuationUnit',
    'ssrc.operationRecord',
  ],
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
export default class PriceLibDimension extends Component {
  state = {
    releaseLoading: false,
  };

  operationDs = new DataSet(operationDS());

  viewConfigDs = new DataSet(viewConfigDS());

  warningDS = new DataSet(warningDS());

  menuDs = new DataSet(menuDS());

  componentDidMount() {
    this.props.tableDs.setQueryParameter('newFlag', 1);
    this.props.tableDs.query();
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.jumpTemplateDetail();
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.props.tableDs.validate();
    if (flag) {
      const res = await this.props.tableDs.submit();
      if (res && !res.failed) {
        this.props.tableDs.query();
      }
    }
  }

  /**
   * 发布
   */
  @Bind()
  async handleRelease(record) {
    // const flag = await this.props.tableDs.validate();
    // if (flag) {
    const data = record.toData();
    this.setState({ releaseLoading: true });
    const params = [{ ...data }];
    releasePriceLibOrg(params)
      .then((res) => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          this.props.tableDs.query();
        }
      })
      .finally(() => {
        this.props.tableDs.status = 'ready';
        this.setState({
          releaseLoading: false,
        });
      });
    // }
  }

  /**
   * 启用禁用
   */
  @Bind()
  async handleEnabled(record) {
    const data = record.toData();
    const params = {
      templateId: data.templateId,
      versionNum: data.versionNum,
      objectVersionNumber: data.objectVersionNumber,
      templateStatus: data.templateStatus === 'DISABLE' ? 'PENDING' : 'DISABLE',
      parentTemplateId: data.parentTemplateId,
    };
    this.setState({ releaseLoading: true });
    const result = getResponse(
      await enablePriceLibOrg(params).finally(() => {
        this.setState({ releaseLoading: false });
      })
    );
    if (result) {
      notification.success();
      this.props.tableDs.query();
    }
  }

  /**
   * 编辑
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelEdit(record) {
    this.jumpTemplateDetail(record);
    // record.setState('editAble', true);
  }

  /**
   * 取消
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelCancel(record) {
    record.reset();
    record.setState('editAble', false);
  }

  /**
   * 解锁
   * @param {Obejct} record - 行信息
   */
  @Bind()
  async handleUnlock(record = {}) {
    const data = record.toData();
    const params = [{ ...data }];
    this.setState({ releaseLoading: true });
    const result = getResponse(
      await editPriceLibOrg(params).finally(() => {
        this.setState({
          releaseLoading: false,
        });
      })
    );
    if (isArray(result) && !isEmpty(result)) {
      notification.success();
      this.jumpTemplateDetail({ data: result[0] });
      // this.props.tableDs.query();
    }
  }

  /**
   * 跳转模板明细页面
   */
  @Bind()
  jumpTemplateDetail(record, viewStatus) {
    const { history } = this.props;
    if (record) {
      const {
        data: { templateId, templateStatus },
      } = record;
      history.push({
        pathname: `/ssrc/price-lib-dimension-org/update/${templateId}`,
        search: querystring.stringify({
          templateStatus: viewStatus || templateStatus,
        }),
      });
    } else {
      history.push({
        pathname: `/ssrc/price-lib-dimension-org/create`,
        search: querystring.stringify({
          templateStatus: 'PENDING',
        }),
      });
    }
  }

  @Bind()
  okCallback() {
    this.props.tableDs.query();
  }

  /**
   * 渲染编辑列
   */
  @Bind()
  editOperations({ record }) {
    // const { releaseLoading } = this.state;
    let operate = '';
    const menu = (
      <Menu className={styles['operation-menu']}>
        {record.get('templateStatus') === 'PENDING' && record.data?.menuId && (
          <Menu.Item>
            <a onClick={() => jumpPriceLibrary(record)}>
              {intl.get('ssrc.priceLibDimension.view.button.priceLibraryPreview').d('价格库预览')}
            </a>
          </Menu.Item>
        )}
        {record.get('templateStatus') === 'RELEASED' && (
          <Menu.Item>
            <a onClick={() => this.handleEnabled(record)}>
              {intl.get('hzero.common.status.disable').d('禁用')}
            </a>
          </Menu.Item>
        )}
        <Menu.Item disabled={record.status === 'add'}>
          <a onClick={() => showOperation(record)}>
            {intl.get('ssrc.priceLibDimension.view.button.operation').d('操作记录')}
          </a>
        </Menu.Item>
        {record.get('templateStatus') === 'DISABLE' && (
          <Menu.Item disabled={record.status === 'add'}>
            <a onClick={() => jumpPriceLibrary(record)}>
              {intl.get('ssrc.priceLibDimension.view.button.priceLibraryPreview').d('价格库预览')}
            </a>
          </Menu.Item>
        )}
        <Menu.Item disabled={record.status === 'add'}>
          <a onClick={() => showViewConfig(record, this.viewConfigDs, this.okCallback)}>
            {record.get('templateStatus') === 'PENDING'
              ? intl.get('ssrc.priceLibDimension.view.button.viewConfiguration').d('价格视图配置')
              : intl
                  .get('ssrc.priceLibDimension.view.button.lookViewConfiguration')
                  .d('查看视图配置')}
          </a>
        </Menu.Item>
        <Menu.Item disabled={record.status === 'add'}>
          <a onClick={() => handleShowWarningModal(record, this.warningDS, this.okCallback)}>
            {intl.get('ssrc.priceLibDimension.view.button.expirationWarning').d('到期预警')}
          </a>
        </Menu.Item>
      </Menu>
    );

    if (record.status === 'add') {
      operate = (
        <span className="action-link">
          <a onClick={() => this.props.tableDs.remove(record)}>
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </a>
          <a
            // disabled={releaseLoading[record.toData().templateId]}
            onClick={() => this.handleRelease(record)}
          >
            {intl.get('hzero.common.button.publish').d('发布')}
          </a>
          <Dropdown overlay={menu}>
            <a>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
              <Icon type="expand_more" />
            </a>
          </Dropdown>
        </span>
      );
    } else {
      switch (record.get('templateStatus')) {
        case 'RELEASED':
          operate = record.data?.menuId ? (
            <span className="action-link">
              {record.get('latestFlag') !== 'Y' && (
                <a onClick={() => this.handleUnlock(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              <a onClick={() => handleJumpPriceLib(record)}>
                {intl.get('ssrc.priceLibDimension.view.button.jumpPriceLibrary').d('跳转价格库')}
              </a>
              <Dropdown overlay={menu}>
                <a>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
                  <Icon type="expand_more" />
                </a>
              </Dropdown>
            </span>
          ) : (
            <span className="action-link">
              {record.get('latestFlag') !== 'Y' && (
                <a onClick={() => this.handleUnlock(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              <a onClick={() => handleGenerateMenu(record, this.menuDs, this.okCallback)}>
                {intl.get('ssrc.priceLibDimension.view.button.generateMenu').d('生成菜单')}
              </a>
              <Dropdown overlay={menu}>
                <a>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
                  <Icon type="expand_more" />
                </a>
              </Dropdown>
            </span>
          );
          break;
        case 'PENDING':
          operate = record.data?.menuId ? (
            <span className="action-link">
              <a
                // disabled={releaseLoading[record.toData().templateId]}
                onClick={() => this.handleRelease(record)}
              >
                {intl.get('hzero.common.button.publish').d('发布')}
              </a>
              <a onClick={() => this.handelEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Dropdown overlay={menu}>
                <a>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
                  <Icon type="expand_more" />
                </a>
              </Dropdown>
            </span>
          ) : (
            <span className="action-link">
              {record.getState('editAble') ? (
                <a onClick={() => this.handelCancel(record)}>
                  {intl.get('hzero.common.view.button.cancel').d('取消')}
                </a>
              ) : (
                <a onClick={() => this.handelEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              <a
                // disabled={releaseLoading[record.toData().templateId]}
                onClick={() => this.handleRelease(record)}
              >
                {intl.get('hzero.common.button.publish').d('发布')}
              </a>
              <Dropdown overlay={menu}>
                <a>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
                  <Icon type="expand_more" />
                </a>
              </Dropdown>
            </span>
          );
          break;
        case 'DISABLE':
          operate = (
            <span className="action-link">
              <a onClick={() => this.handleEnabled(record)}>
                {intl.get('hzero.common.button.enable').d('启用')}
              </a>
              <Dropdown overlay={menu}>
                <a>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
                  <Icon type="expand_more" />
                </a>
              </Dropdown>
            </span>
          );
          break;
        default:
          break;
      }
    }
    return operate;
  }

  render() {
    const { releaseLoading } = this.state;
    const listColumns = [
      {
        headerStyle: { paddingLeft: '36px' },
        style: { paddingLeft: 0 },
        name: 'templateStatus',
        width: 130,
        renderer: ({ value, record }) => {
          return StatusRender(value, record.get('templateStatusMeaning'));
        },
      },
      {
        name: 'edit',
        width: 230,
        renderer: this.editOperations,
      },
      {
        name: 'templateCode',
        width: 150,
        renderer: ({ record, value }) =>
          record.status !== 'add' && (
            <a onClick={() => this.jumpTemplateDetail(record, 'RELEASED')}>{value}</a>
          ),
      },
      {
        name: 'templateName',
        width: 150,
        editor: (record) => record.status === 'add' || record.getState('editAble'),
      },
      {
        name: 'versionNum',
        width: 80,
      },
      {
        name: 'templateType',
        width: 150,
      },
      {
        name: 'remark',
        width: 150,
        editor: (record) => record.status === 'add' || record.getState('editAble'),
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
          title={intl.get('ssrc.priceLibDimension.view.title.priceLibConfig').d('价格库自定义配置')}
        >
          <Button icon="add" color="primary" funcType="raised" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {/* <Button icon="save" funcType="raised" onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button> */}
          <ExportButton />
          <ImportButton />
        </Header>
        <Content>
          <Spin spinning={releaseLoading}>
            <SearchBarTable
              cacheState
              customizedCode="SSRC.PRICE_LIB_DIMENSION"
              searchCode="SSRC.PRICE_LIBRARY_DIMENSION.LIST.FILTER"
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
