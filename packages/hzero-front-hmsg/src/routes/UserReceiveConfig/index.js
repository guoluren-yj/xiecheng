/**
 * UserReceiveConfig - 用户消息接收配置
 * @date: 2018-11-22
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 *
 * @notice components/* and index.less is copy from hiam, if you update these, please update there too
 * @notice 有数据转化
 */

import React, { Component } from 'react';
import { Checkbox, Table } from 'choerodon-ui';
import { Button, CheckBox, Spin, Tooltip } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { findIndex, forEach, indexOf, isArray, isEmpty, remove } from 'lodash';
import request from "hzero-front/lib/utils/request";
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableScrollWidth, getResponse } from 'utils/utils';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';

import styles from './index.less';

const btnStyle = { marginLeft: 8 };

const msgTypeKeyMap = {
  EMAIL: "mailLocked",
  SMS: "smsLocked",
  WEB: "webLocked",
};
const headerConfigKeyMap = {
  GLOBAL: "headerConfigData",
  TENANT: "tenantConfigData",
  REL_TABLE: "otherConfigData",
};
/**
 * 判断节点是不是 中间状态
 * 1. 当前节点肯定是未选中的
 * 2. checkedList 认为是有序的
 * @param {number} curId - 当前的节点 receiveCode
 * @param {object[]} checkedList - 选中信息
 * @param {string} receiveType - 当前信息类型
 */
function isReceiveTypeIsIndeterminate(receiveType, curId, checkedList = []) {
  // 如果checkedList 不是有序的; 让 checkedList 排好序
  const parentIds = [curId];
  for (let index = 0; index < checkedList.length; index++) {
    if (parentIds.includes(checkedList[index].parentId)) {
      parentIds.push(checkedList[index].receiveCode);
      const { receiveTypeList = [] } = checkedList[index];
      if (receiveTypeList.includes(receiveType)) {
        return true;
      }
    }
  }
  return false;
}

@connect(({ userReceiveConfig, user }) => ({
  userReceiveConfig,
  currentUser: user.currentUser || {},
}))
@formatterCollections({ code: ['hiam.userReceiveConfig'] })
export default class UserReceiveConfig extends Component {
  form;

  /**
   * state初始化
   * @param {object} props 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
      searchLoading: true,
      expandedRowKeys: [], // 当前展开的树
      checkedList: [],
      // 全局配置的数据对象
      headerConfigData: {},
      // 租户配置的数据对象
      tenantConfigData: {},
      // 其它消息配置
      otherConfigData: {},
      // rel配置表数据
      relTableData: [],
      webReminderFlag: undefined,
    };

    this.mountButton = false;
  }

  /**
   * componentDidMount 生命周期函数
   * render执行后获取页面数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    Promise.all([
      this.handleSearch(),
      dispatch({
        type: 'userReceiveConfig/fetchMessageType',
      }),
      ...this.queryGlobalConfig(),
    ]).then(() => {
      this.setState({ searchLoading: false, webReminderFlag: this.props.webReminderFlag });
    });
  }

  componentDidUpdate(prevState, prevProps) {
    const { activeKey, updateHeaderButton, webReminderFlag } = this.props;
    // eslint-disable-next-line react/no-did-update-set-state
    if (prevProps.webReminderFlag !== webReminderFlag) this.setState({ webReminderFlag });
    if (
      !this.mountButton ||
      prevState.saveLoading !== this.state.saveLoading ||
      prevProps.activeKey !== activeKey
    ) {
      updateHeaderButton(
        activeKey === "receive" ? (
          <>
            <Button icon="save" color="primary" onClick={this.handleSave} loading={this.state.saveLoading} funcType='raised'>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button icon="replay" style={btnStyle} onClick={this.handleSearch} funcType='flat'>
              {intl.get('hzero.common.button.refresh').d('刷新')}
            </Button>
          </>
        ) : null
      );
      this.mountButton = true;
    }
  }

  queryGlobalConfig = () => {
    return [
      request(`${getEnvConfig().HZERO_MSG}/v1/messages/user/config/global/batch`, { method: "GET" }).then(res => {
        if (getResponse(res)) {
          const newState = {};
          (res || []).forEach(data => {
            newState[headerConfigKeyMap[data.type] || "__no_match__"] = data || {};
          });
          this.setState({
            ...newState,
          });
        }
      }),
      request(`${getEnvConfig().HZERO_MSG}/v1/messages/user/config/global/rel/table/filter`, { method: "GET" }).then(res => {
        if (getResponse(res)) {
          this.setState({
            relTableData: res || [],
          });
        }
      }),
    ];
  }

  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    this.setState({ searchLoading: true });
    return dispatch({
      type: 'userReceiveConfig/fetchReceiveConfig',
    }).then((res) => {
      if (res) {
        this.builderFlags(res);
      }
    }).finally(() => { this.setState({ searchLoading: false }); });
  }

  @Bind()
  builderFlags(dataSource = []) {
    const checkedList = [];
    const flatKeys = (item, parentId) => {
      const flagParam = {
        receiveId: item.receiveId,
        receiveTypeList: (item && item.receiveTypeList) || [],
        defaultReceiveTypeList: item.defaultReceiveTypeList,
        receiveCode: item.receiveCode,
        userReceiveId: item.userReceiveId ? item.userReceiveId : null,
        objectVersionNumber: item.objectVersionNumber,
        _token: item._token,
      };
      flagParam.parentId = item.receiveCode === parentId ? '' : parentId;
      checkedList.push(flagParam);
      if (isArray(item.children) && !isEmpty(item.children)) {
        forEach(item.children, (v) => flatKeys(v, item.receiveCode));
      }
    };

    forEach(dataSource, (item) => flatKeys(item, item.receiveCode));

    this.setState({ checkedList });
  }

  /**
   * 保存
   * 凑活用吧，硬要把接口的数据做到一个保存中
   */
  @Bind(500)
  handleSave() {
    const { dispatch, userReceiveConfig } = this.props;
    const { checkedList } = this.state;
    const { configList = [] } = userReceiveConfig;
    const { defaultReceiveTypeList = [] } = configList[0] || {};
    const paramList = [];
    /** 原handleSave逻辑 */
    forEach(checkedList, (checkedItem) => {
      const { receiveTypeList = [] } = checkedItem;
      const newReceiveTypeList = defaultReceiveTypeList.filter(
        (tItem) => !receiveTypeList.includes(tItem)
      );
      const item = {
        userReceiveId: checkedItem.userReceiveId,
        receiveCode: checkedItem.receiveCode,
        receiveType: newReceiveTypeList.join(','),
        objectVersionNumber: checkedItem.objectVersionNumber,
        _token: checkedItem._token,
      };
      if (checkedItem.userReceiveId) {
        item.userReceiveId = checkedItem.userReceiveId;
      }
      paramList.push(item);
    });

    this.setState({ saveLoading: true });
    Promise.all([
      /** 原handleSave逻辑 */
      dispatch({
        type: 'userReceiveConfig/saveConfig',
        payload: paramList,
      }),
      /** 站内信弹窗提醒方式保存 */
      this.props.onWebReminderFlagUpdate(this.state.webReminderFlag),
      /** 三种来源的头保存 */
      ...this.batchSaveHeader(),
      // eslint-disable-next-line no-unused-vars
    ]).then(([res1, _, res3, res4, res5]) => {
      if (res1) {
        this.builderFlags(res1);
      }
      // res2是undefined。不检验
      if (res1 && getResponse(res3) && getResponse(res4) && getResponse(res5)) {
        return Promise.all([
          this.handleSearch(),
          dispatch({
            type: 'userReceiveConfig/fetchMessageType',
          }),
          ...this.queryGlobalConfig(),
        ]);
      }
    }).finally(() => {
      this.setState({ saveLoading: false, searchLoading: false });
    });
  }

  // 取消
  @Bind()
  handleCancel() {
    this.handleSearch();
  }

  /**
   * 树形结构点击展开收起时的回调
   */
  @Bind()
  onExpand(expanded, record) {
    const { receiveCode } = record;
    const { expandedRowKeys } = this.state;

    if (expanded) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, receiveCode],
      });
    } else {
      const newExpandRowKeys = expandedRowKeys.filter((item) => item !== receiveCode);
      this.setState({
        expandedRowKeys: newExpandRowKeys,
      });
    }
  }

  @Bind()
  onCheckboxChange(params) {
    const { receiveCode, type, flag } = params;
    const { checkedList } = this.state;
    const index = findIndex(checkedList, (v) => v.receiveCode === receiveCode);
    const checkItem = checkedList[index];

    const addOrRemove = (item) => {
      // flag为true，代表当前已经被勾选，需要去除勾选
      if (flag) {
        remove(item && item.receiveTypeList, (v) => v === type);
      } else if (
        indexOf(item && item.receiveTypeList, type) < 0 &&
        indexOf(item.defaultReceiveTypeList, type) > -1
      ) {
        (item.receiveTypeList || []).push(type);
      }
    };
    addOrRemove(checkItem);

    /**
     * 根据父节点，选择所有的子节点
     *
     * @param {*} parentId
     */
    const iterator = (parentId) => {
      const subList = [];
      forEach(checkedList, (v) => {
        if (v.parentId === parentId) {
          addOrRemove(v);
          subList.push(v);
        }
      });
      if (subList && subList.length > 0) {
        forEach(subList, (v) => iterator(v.receiveCode));
      }
    };
    iterator(checkItem.receiveCode);

    /**
     * 反向勾选，即根据子节点反向勾选父节点
     *
     * @param {*} parentId 父节点的receiveCode
     */
    const reverseCheck = (parentId) => {
      if (!parentId) {
        return;
      }
      const sameParents = checkedList.filter((v) => v.parentId === parentId) || [];
      const temp = sameParents.filter((v) => {
        if (indexOf(v.defaultReceiveTypeList, type) < 0) {
          return true;
        }
        const idx = indexOf(v && v.receiveTypeList, type);
        return flag ? idx < 0 : idx > -1;
      });
      if (sameParents.length === temp.length || (sameParents.length !== temp.length && flag)) {
        const parentIndex = findIndex(checkedList, (v) => v.receiveCode === parentId);
        const parent = checkedList[parentIndex];
        addOrRemove(parent);

        reverseCheck(parent.parentId);
      }
    };

    reverseCheck(checkItem.parentId);

    this.setState({ checkedList });
  }

  @Bind()
  changeFlag(value) {
    this.setState({ webReminderFlag: !value });
  }

  updateHeaderOptiosn = (value, oldValue, type, configType) => {
    this.setState({
      [headerConfigKeyMap[configType]]: {
        ...(this.state[headerConfigKeyMap[configType]] || {}),
        [msgTypeKeyMap[type]]: !value,
      },
    });
  }

  batchSaveHeader() {
    return ['GLOBAL', 'TENANT', 'REL_TABLE'].map(configType => (
      request(`${getEnvConfig().HZERO_MSG}/v1/messages/user/config/global`, {
        method: "POST",
        query: {
          type: configType,
        },
        body: this.state[headerConfigKeyMap[configType]] || {},
      })
    ));
  }

  relTableColumns = [
    {
      title: intl.get('hiam.userReceiveConfig.view.title.msgCode').d('消息编码'),
      dataIndex: 'messageTemplateCode',
    },
    {
      title: intl.get('hiam.userReceiveConfig.view.title.msgName').d('消息名称'),
      dataIndex: 'messageName',
    },
  ]

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      userReceiveConfig,
      currentUser,
    } = this.props;
    const { configList = [], messageTypeList = [] } = userReceiveConfig;
    const {
      searchLoading, saveLoading, webReminderFlag,
      expandedRowKeys = [], checkedList, headerConfigData = {},
      tenantConfigData = {}, otherConfigData = {}, relTableData = [],
    } = this.state;

    let newList = messageTypeList;
    if (configList[0]) {
      const { defaultReceiveTypeList = [] } = configList[0];
      newList = messageTypeList.filter((item) => defaultReceiveTypeList.includes(item.value));
    }
    const columns = [
      {
        title: intl.get('hiam.userReceiveConfig.model.userReceiveConfig.type').d('消息类型'),
        dataIndex: 'receiveName',
      },
    ];

    forEach(newList, (item) => {
      columns.push({
        title: intl
          .get('hiam.userReceiveConfig.model.userReceiveConfig', {
            typeName: item.meaning,
          })
          .d(`${item.meaning}`),
        dataIndex: item.value,
        width: 150,
        render: (val, record) => {
          let checkboxElement = '';
          const { receiveCode } = record;
          if (isArray(checkedList) && !isEmpty(checkedList)) {
            const index = findIndex(checkedList, (v) => v.receiveCode === record.receiveCode);
            const flagParam = checkedList[index] || {};
            const { receiveTypeList = [] } = flagParam;
            const flag = indexOf(receiveTypeList, item.value) > -1;
            if (indexOf(record.defaultReceiveTypeList, item.value) > -1) {
              checkboxElement = (
                <Tooltip
                  title={
                    tenantConfigData[msgTypeKeyMap[item.value]]
                      ? intl.get('hiam.userReceiveConfig.view.tooltip.localGlobal', {
                        controlType: intl.get('hiam.userReceiveConfig.view.title.tenantReceivedFlag', { tenantName: currentUser.tenantName }).d('“{tenantName}”租户消息通知接收'),
                      }).d('受控于“{controlType}”下相关配置')
                      : null
                  }
                >
                  <Checkbox
                    disabled={tenantConfigData[msgTypeKeyMap[item.value]]}
                    indeterminate={
                      !flag && isReceiveTypeIsIndeterminate(item.value, receiveCode, checkedList)
                    }
                    checked={flag}
                    onChange={() => this.onCheckboxChange({ receiveCode, flag, type: item.value })}
                  >
                    {intl.get('hzero.common.status.enable').d('启用')}
                  </Checkbox>
                </Tooltip>
              );
            }
          }
          return checkboxElement;
        },
      });
    });

    const editTableProps = {
      filterBar: false,
      expandedRowKeys,
      columns,
      scroll: { x: tableScrollWidth(columns) },
      rowKey: 'receiveCode',
      pagination: false,
      bordered: true,
      dataSource: configList,
      loading: searchLoading,
      onExpand: this.onExpand,
    };

    return (
      <div className={styles.receive}>
        <Spin spinning={searchLoading || saveLoading}>
          <div className='msg-options'>
            <div className='msg-options-title'>
              {intl.get('hiam.userReceiveConfig.view.title.filterMessageFlag').d('站内信弹窗提醒方式')}
            </div>
            <div className='msg-options-help'>
              {intl.get('hiam.userReceiveConfig.view.help.filterMessageFlag').d('启用后，在用户登录状态下，站内信将以右下角弹窗方式提醒，关闭弹窗将不影响站内信消息接收。查看消息可点击系统顶部导航右侧消息图标，或通过工作台消息卡片查看')}
            </div>
            <div className='msg-options-row'>
              <div className='msg-option'>
                <CheckBox checked={!webReminderFlag} onChange={this.changeFlag}>
                  {intl.get('hiam.userReceiveConfig.model.checkbox.option.enableMsgPopup').d('启用站内信弹窗提醒')}
                </CheckBox>
              </div>
            </div>
          </div>
          <div className='msg-options'>
            <div className='msg-options-title'>
              {intl.get('hiam.userReceiveConfig.view.title.receivedMethodFlag').d('全局接收方式')}
            </div>
            <div className='msg-options-help'>
              {intl.get('hiam.userReceiveConfig.view.help.receivedMethodFlag').d('配置是否接收SRM消息。以下任意类型关闭后，除登录等消息以外，不再接收SRM其他所有消息')}
            </div>
            <div className='msg-options-row'>
              {newList.map(item => {
                return (
                  <div className='msg-option'>
                    <CheckBox checked={!headerConfigData[msgTypeKeyMap[item.value]]} onChange={(value, oldValue) => this.updateHeaderOptiosn(value, oldValue, item.value, "GLOBAL")}>
                      {item.meaning}
                    </CheckBox>
                  </div>
                );
              })}
            </div>
          </div>
          <div className='msg-options' style={{ marginBottom: '16px' }}>
            <div className='msg-options-title'>
              {intl.get('hiam.userReceiveConfig.view.title.tenantReceivedFlag', { tenantName: currentUser.tenantName }).d('“{tenantName}”租户消息通知接收')}
            </div>
            <div className='msg-options-help'>
              {intl.get('hiam.userReceiveConfig.view.help.tenantReceivedFlag').d('配置是否接收当前租户消息。以下任意类型关闭后，除登录等消息以外，不再接收当前租户发送的所有消息')}
            </div>
            <div className='msg-options-row'>
              {newList.map(item => {
                return (
                  <Tooltip
                    title={
                      headerConfigData[msgTypeKeyMap[item.value]]
                        ? intl.get('hiam.userReceiveConfig.view.tooltip.localGlobal', {
                          controlType: intl.get('hiam.userReceiveConfig.view.title.receivedMethodFlag').d('全局接收方式'),
                        }).d('受控于“{controlType}”下相关配置')
                        : null
                    }
                  >
                    <div className='msg-option'>
                      <CheckBox disabled={headerConfigData[msgTypeKeyMap[item.value]]} checked={!tenantConfigData[msgTypeKeyMap[item.value]]} onChange={(value, oldValue) => this.updateHeaderOptiosn(value, oldValue, item.value, 'TENANT')}>
                        {item.meaning}
                      </CheckBox>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
          <div className="table-title">
            {intl.get('hiam.userReceiveConfig.view.title.msgStrategyDetail').d('消息接收策略明细')}
          </div>
          <Table {...editTableProps} />
          <div className='msg-options' style={{ marginBottom: '16px', marginTop: '32px' }}>
            <div className='msg-options-title'>
              {intl.get('hiam.userReceiveConfig.view.title.otherMsgInform').d('其他消息通知')}
            </div>
            <div className='msg-options-help'>
              {intl.get('hiam.userReceiveConfig.view.help.otherMsgInform').d('对于非当前角色权限相关的功能消息，可关闭对应消息提醒')}
            </div>
            <div className='msg-options-row'>
              {newList.map(item => {
                return (
                  <Tooltip
                    title={
                      headerConfigData[msgTypeKeyMap[item.value]]
                        ? intl.get('hiam.userReceiveConfig.view.tooltip.localGlobal', {
                          controlType: intl.get('hiam.userReceiveConfig.view.title.receivedMethodFlag').d('全局接收方式'),
                        }).d('受控于“{controlType}”下相关配置')
                        : null
                    }
                  >
                    <div className='msg-option'>
                      <CheckBox disabled={headerConfigData[msgTypeKeyMap[item.value]]} checked={!otherConfigData[msgTypeKeyMap[item.value]]} onChange={(value, oldValue) => this.updateHeaderOptiosn(value, oldValue, item.value, "REL_TABLE")}>
                        {item.meaning}
                      </CheckBox>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          <div className="table-title">
            {intl.get('hiam.userReceiveConfig.view.title.msgControlList').d('受控的消息通知列表')}
          </div>
          <Table
            filterBar={false}
            dataSource={relTableData}
            columns={this.relTableColumns}
            pagination={false}
          />
        </Spin>
      </div>
    );
  }
}
