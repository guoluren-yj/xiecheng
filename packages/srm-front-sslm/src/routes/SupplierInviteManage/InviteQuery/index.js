/*
 * InviteQuery - 邀约进度查询
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { isNil } from 'lodash';
import { DataSet, Modal, Table, TextField } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import SearchBarTable from '_components/SearchBarTable';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';

import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { urge, reInvitationCheck, reInvitation } from '@/services/supplierInviteManageServices';
import { getNotPermissionBtns } from '@/routes/components/utils/utils';

import InviteInfo from '../components/InviteInfo';

import { inviteDetailDS, cooperationInfoDS } from '../stores/indexDS';
import { inviteInfoDS } from './stores/indexDS';

import styles from '../index.less';

/**
 * 邀约进度查询
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class InviteQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewType: 'supplier',
      showSupplierTab: true,
      showInviteRecordTab: false,
    };
  }

  inviteDetailDs = new DataSet({
    ...inviteDetailDS(),
  });

  cooperationInfoDs = new DataSet({
    ...cooperationInfoDS(),
  });

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
    this.handleBtnPermissionBtn();
  }

  // 处理按钮权限集
  @Bind()
  async handleBtnPermissionBtn() {
    const { viewType } = this.state;
    const codeList = [
      // 按供应商维度
      {
        code: 'srm.partner.my-partner.supplier-invite.button.supplier-query',
        name: 'supplier',
      },
      // 按邀约编码
      {
        code: 'srm.partner.my-partner.supplier-invite.button.invitecode-query',
        name: 'inviteRecord',
      },
    ];
    const notPermissionBtnList = await getNotPermissionBtns(codeList);
    if (notPermissionBtnList) {
      const showSupplierTab = !notPermissionBtnList.includes('supplier');
      const showInviteRecordTab = !notPermissionBtnList.includes('inviteRecord');
      // 当前激活的tab
      const currentViewType = showSupplierTab ? viewType : 'inviteRecord';
      this.handleChangeStatus(currentViewType);
      this.setState({ showSupplierTab, showInviteRecordTab });
    }
  }

  // 查询权限集

  // 详细情况
  @Debounce(200)
  @Bind()
  handleDetailModal(record = {}) {
    const { companyId, companyName } = record.get(['companyId', 'companyName']);
    this.inviteDetailDs.setQueryParameter('companyId', companyId);
    this.inviteDetailDs.setQueryParameter('companyName', companyName);
    this.inviteDetailDs.query();
    Modal.open({
      title: intl.get('sslm.supplierInvite.model.invite.detailInfo').d('邀约情况'),
      drawer: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      closable: false,
      okCancel: false,
      destroyOnClose: true,
      style: { width: 742 },
      className: styles['invite-manage-inner-model'],
      maskStyle: {
        backgroundColor: 'rgb(0, 0, 0, 0)',
      },
      children: <Table dataSet={this.inviteDetailDs} columns={this.getDetailColumns()} />,
    });
  }

  // 详细情况表格列
  @Bind()
  getDetailColumns() {
    const columns = [
      {
        name: 'displayInviteId',
      },
      {
        name: 'salesPersonName',
      },
      {
        name: 'salesPersonPhone',
      },
      {
        name: 'salesPersonEmail',
      },
      {
        name: 'registrationStatusMeaning',
        renderer: ({ value, name, record }) => {
          return renderStatus({ value, name, record });
        },
      },
      {
        name: 'registrationDate',
      },
    ];
    return columns;
  }

  /**
   * 供应商维度
   */
  @Bind()
  getInviteSupplierColumns() {
    const columns = [
      {
        name: 'companyName',
      },
      {
        name: 'companyNum',
      },
      {
        name: 'inviteRegister',
        renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(Number(value))),
      },
      {
        name: 'registrationDate',
      },
      {
        name: 'registrationStatusMeaning',
        tooltip: 'none',
        renderer: ({ value, name, record }) => {
          return renderStatus({ value, name, record });
        },
      },
      {
        name: 'detailInfo',
        renderer: ({ record }) => {
          return (
            <React.Fragment>
              <a
                onClick={() => {
                  // 详细情况
                  this.handleDetailModal(record);
                }}
                style={{
                  marginRight: 8,
                }}
              >
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </React.Fragment>
          );
        },
      },
      {
        name: 'levelTypeFlagMeaning',
        renderer: ({ record }) => {
          // 注册状态隐藏集团级合作标识
          const { levelTypeFlag } = record.get(['levelTypeFlag']);
          return isNil(levelTypeFlag) ? '-' : yesOrNoRender(Number(levelTypeFlag) === 1 ? 0 : 1);
        },
      },
      {
        name: 'cooperationInfo',
        renderer: ({ record }) => {
          return (
            <React.Fragment>
              <a
                onClick={() => {
                  // 合作情况
                  this.handleCooperationModal(record);
                }}
                style={{
                  marginRight: 8,
                }}
              >
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </React.Fragment>
          );
        },
      },
    ];
    return columns;
  }

  /**
   * 催办回调
   */
  @Bind()
  handlEurge(record) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.supplierInvite.view.leftContent.eurgeProcessMsg')
        .d('向供应商发送催办消息，是否确认？'),
      onOk: () => {
        const params = record.toData();
        urge(params).then(res => {
          const result = getResponse(res);
          if (result) {
            notification.success();
          }
        });
      },
    });
  }

  /**
   * 补发邀约回调
   */
  @Bind()
  async handlReissueInvitation(record) {
    const inviteId = record.get('inviteId');
    const { inviteRecordDs } = this.props;
    const response = getResponse(await reInvitationCheck({ inviteId }));
    if (response) {
      const { loginName, realName } = response;
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.supplierInvite.view.leftContent.reissueInvitationMsg', {
            loginName,
            realName,
          })
          .d(
            `将为邀请的销售员【${loginName}-${realName}】补充发送邀约、调查表和分类等其他信息，请确认。`
          ),
        onOk: () => {
          reInvitation({ inviteId, ...response }).then(res => {
            const result = getResponse(res);
            if (result) {
              inviteRecordDs.query();
              notification.success();
            }
          });
        },
      });
    }
  }

  /**
   * 邀约记录表格列
   */
  @Bind()
  getInviteRecordColumns() {
    const columns = [
      {
        name: 'processStatusInviteMeaning',
        renderer: ({ value, name, record }) => {
          return renderStatus({ value, name, record });
        },
      },
      {
        name: 'action',
        renderer: ({ record }) => {
          // REGISTER：邀请注册
          // 未注册（UNREGISTERED）、认证中（CERTIFICATION）、审批拒绝（REG_REJECT）
          const { purchaseInviteType, processStatusInvite } = record.get([
            'purchaseInviteType',
            'processStatusInvite',
          ]);
          const editFlag =
            ['REGISTER'].includes(purchaseInviteType) &&
            ['UNREGISTERED', 'CERTIFICATION', 'REG_REJECT'].includes(processStatusInvite);
          return (
            <React.Fragment>
              {editFlag ? (
                <React.Fragment>
                  <a
                    onClick={() => {
                      // 催办
                      this.handlEurge(record);
                    }}
                    style={{
                      marginRight: 8,
                    }}
                  >
                    {intl.get('sslm.supplierInvite.view.button.urge').d('催办')}
                  </a>
                  {['UNREGISTERED'].includes(processStatusInvite) && (
                    <a
                      onClick={() => {
                        // 补发邀约
                        this.handlReissueInvitation(record);
                      }}
                      style={{
                        marginRight: 8,
                      }}
                    >
                      {intl.get('sslm.supplierInvite.view.button.reissueInvitation').d('补发邀约')}
                    </a>
                  )}
                </React.Fragment>
              ) : (
                <span>-</span>
              )}
            </React.Fragment>
          );
        },
      },
      {
        name: 'displayInviteId',
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleInviteModal(record)}>{value}</a>
        ),
      },
      {
        name: 'purchaseInviteTypeMeaning',
      },
      {
        name: 'supplierCompanyNum',
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'companyNum',
      },
      {
        name: 'companyName',
      },
      {
        name: 'levelTypeFlagMeaning',
      },
      {
        name: 'sendUserName',
      },
      {
        name: 'salesPersonName',
      },
      {
        name: 'creationDate',
      },
      {
        name: 'lastUpdateDate',
      },
    ];
    return columns;
  }

  /**
   * 邀约记录-邀约详情
   */
  @Debounce(200)
  @Bind()
  handleInviteModal(record) {
    const { customizeForm, showTagFlag } = this.props;
    const { inviteId, purchaseInviteType, zhimaLabels, supplierCompanyName } =
      record.get(['inviteId', 'purchaseInviteType', 'zhimaLabels', 'supplierCompanyName']) || {};
    // 这里查看区分3种场景，邀请注册，邀请供应商，邀请客户。
    // 其中邀请邀请注册弹窗字段单独展示，邀请供应商和邀请客户目前字段一样，只是没有邀请客户没有个性化单元
    const inviteSupplierFlag = purchaseInviteType !== 'REGISTER';
    const inviteInfoDs = new DataSet(inviteInfoDS({ inviteSupplierFlag }));
    inviteInfoDs.setState('inviteType', purchaseInviteType);
    Modal.open({
      title: intl.get('sslm.supplierInvite.view.invite.invitationInfo').d('邀约信息'),
      drawer: true,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <InviteInfo
          dataSet={inviteInfoDs}
          showTagFlag={showTagFlag}
          customizeForm={customizeForm}
          inviteType={purchaseInviteType}
          inviteId={inviteId}
          zhimaLabels={zhimaLabels}
          supplierCompanyName={supplierCompanyName}
        />
      ),
      style: { width: 742 },
    });
  }

  /**
   * 合作情况
   */
  @Debounce(200)
  @Bind()
  handleCooperationModal(record = {}) {
    const { companyId, levelTypeFlag, companyName } = record.get([
      'companyId',
      'levelTypeFlag',
      'companyName',
    ]);
    this.cooperationInfoDs.setQueryParameter('companyId', companyId);
    this.cooperationInfoDs.setQueryParameter('levelTypeFlag', levelTypeFlag);
    this.cooperationInfoDs.setQueryParameter('companyName', companyName);
    this.cooperationInfoDs.query();
    Modal.open({
      title: intl.get('sslm.supplierInvite.model.invite.details').d('详细情况'),
      drawer: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      closable: false,
      okCancel: false,
      destroyOnClose: true,
      style: { width: 742 },
      className: styles['invite-manage-inner-model'],
      maskStyle: {
        backgroundColor: 'rgb(0, 0, 0, 0)',
      },
      children: <Table dataSet={this.cooperationInfoDs} columns={this.getCooperationColumns()} />,
    });
  }

  // 合作情况表格列
  @Bind()
  getCooperationColumns() {
    const columns = [
      {
        name: 'companyNum',
      },
      {
        name: 'companyName',
      },
      {
        name: 'registrationStatusMeaning',
        renderer: ({ value, name, record }) => {
          return renderStatus({ value, name, record });
        },
      },
      {
        name: 'registrationDate',
      },
    ];
    return columns;
  }

  // 筛选器左侧渲染
  @Bind()
  renderLeftSearchBar() {
    const { inviteSupplierDs, inviteRecordDs } = this.props;
    const { viewType } = this.state;
    const dataSet = viewType === 'supplier' ? inviteSupplierDs : inviteRecordDs;
    return (
      <TextField
        clearButton
        style={{ width: 250 }}
        valueChangeAction="blur"
        onChange={value => {
          // eslint-disable-next-line no-unused-expressions
          dataSet.queryDataSet?.current?.set('searchCompanyName', value);
          dataSet.query();
        }}
        value={dataSet.queryDataSet?.current?.get('searchCompanyName')}
        placeholder={intl
          .get('sslm.supplierInvite.model.invite.supplierName')
          .d('请输入供应商名称查询')}
      />
    );
  }

  // 清空、重置回调
  @Bind()
  clearValues() {
    const { inviteSupplierDs, inviteRecordDs } = this.props;
    const { viewType } = this.state;
    const dataSet = viewType === 'supplier' ? inviteSupplierDs : inviteRecordDs;
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  }

  // 查询
  @Bind()
  handleQuery(queryProps = {}) {
    const { inviteSupplierDs, inviteRecordDs } = this.props;
    const { viewType } = this.state;
    const dataSet = viewType === 'supplier' ? inviteSupplierDs : inviteRecordDs;
    const { params } = queryProps;
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['searchCompanyName'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      dataSet.query();
    } else {
      dataSet.query();
    }
  }

  /**
   * 切换查看维度
   */
  @Bind()
  handleChangeStatus(type = '') {
    const { handleInviteQueryTabKey = () => {} } = this.props;
    this.setState({
      viewType: type,
    });
    handleInviteQueryTabKey(type);
  }

  render() {
    const { inviteSupplierDs, inviteRecordDs, customizeTable } = this.props;
    const { viewType, showSupplierTab = true, showInviteRecordTab = true } = this.state;
    const showTab = showSupplierTab || showInviteRecordTab;
    const showSupplier = viewType === 'supplier';

    return showTab ? (
      <div style={{ height: tableHeight.hasTab }}>
        {showSupplier &&
          customizeTable(
            {
              code: 'SSLM.INVITE_MANAGE_INVITE_QUERY.SUPPLIER_TABLE',
              readOnly: true,
            },
            <SearchBarTable
              cacheState
              dataSet={inviteSupplierDs}
              columns={this.getInviteSupplierColumns()}
              searchCode="SSLM.SUPPLIER_INVITE_MANAGE_LIST.INVITE_QUERY"
              style={{ maxHeight: tableMaxHeight.hasTab }}
              searchBarConfig={{
                left: {
                  render: () => this.renderLeftSearchBar(),
                },
                onQuery: queryProps => this.handleQuery(queryProps),
                onReset: () => this.clearValues(),
                onClear: () => this.clearValues(),
                right: {
                  render: () => (
                    <div className={styles['invite-query-search-right']}>
                      <div
                        className={showSupplier ? styles.active : ''}
                        onClick={() => this.handleChangeStatus('supplier')}
                      >
                        <span>
                          {intl.get('sslm.supplierInvite.model.invite.supplier').d('按供应商')}
                        </span>
                      </div>
                      {showInviteRecordTab && (
                        <div
                          className={!showSupplier ? styles.active : ''}
                          onClick={() => this.handleChangeStatus('inviteRecord')}
                        >
                          <span>
                            {intl
                              .get('sslm.supplierInvite.model.invite.inviteCode')
                              .d('按邀约编码')}
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                },
              }}
            />
          )}
        {!showSupplier &&
          customizeTable(
            {
              code: 'SSLM.INVITE_MANAGE_INVITE_QUERY.INVITE_TABLE',
              readOnly: true,
            },
            <SearchBarTable
              cacheState
              dataSet={inviteRecordDs}
              columns={this.getInviteRecordColumns()}
              searchCode="SSLM.INVITE_MANAGE_INVITE_QUERY.INVITE_RECORD"
              style={{ maxHeight: tableMaxHeight.hasTab }}
              searchBarConfig={{
                left: {
                  render: () => this.renderLeftSearchBar(),
                },
                onQuery: queryProps => this.handleQuery(queryProps),
                onReset: () => this.clearValues(),
                onClear: () => this.clearValues(),
                right: {
                  render: () => (
                    <div className={styles['invite-query-search-right']}>
                      {showSupplierTab && (
                        <div
                          className={showSupplier ? styles.active : ''}
                          onClick={() => this.handleChangeStatus('supplier')}
                        >
                          <span>
                            {intl.get('sslm.supplierInvite.model.invite.supplier').d('按供应商')}
                          </span>
                        </div>
                      )}
                      <div
                        className={!showSupplier ? styles.active : ''}
                        onClick={() => this.handleChangeStatus('inviteRecord')}
                      >
                        <span>
                          {intl.get('sslm.supplierInvite.model.invite.inviteCode').d('按邀约编码')}
                        </span>
                      </div>
                    </div>
                  ),
                },
              }}
            />
          )}
      </div>
    ) : null;
  }
}
