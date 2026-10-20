/**
 * index.js 收货管理配置
 * @date: 2020-09-06
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
/* eslint-disable no-return-assign */
import React, { Fragment, Component } from 'react';
import { isEmpty } from 'lodash';
import { Icon, Tooltip, Tabs } from 'choerodon-ui';
import { DataSet, Button, Table, Modal, Select } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import UploadModal from '_components/Upload';
import {
  handleDelete,
  handleSave,
  handleReferenceRecommend,
  queryDeliveryWorkbench,
} from '@/services/receiptManageConfigService';
import { mainTableDS, systemDS, reverseDS, strTableDS, lineDS, returnDS } from './store/lineDS';
import style from './index.less';
import DetailModal from './DetailModal';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['sinv.receiptManage', 'hzero.common'] })
export default class ReceiptManageConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabType: 'node',
      updateFlag: false,
      workFlag: false,
    };
  }

  tableDs = new DataSet(mainTableDS());

  systemDs = new DataSet(systemDS());

  returnDs = new DataSet(returnDS());

  reverseDs = new DataSet(reverseDS());

  strTableDs = new DataSet(strTableDS());

  lineDs = new DataSet(lineDS());

  componentDidMount() {
    this.queryWorkbench();
  }

  async queryWorkbench() {
    const res = await queryDeliveryWorkbench();
    this.setState({
      workFlag: res,
    });
    this.strTableDs = new DataSet(strTableDS(res));
    this.tableDs.query().then(() => {
      this.tableDs.forEach((record) => {
        Object.assign(record, { workFlag: res });
      });
    });
    this.strTableDs.query();
  }

  nodeColumns = [
    {
      name: 'nodeConfigCode',
      width: 100,
      editor: (record) =>
        record.get('nodeConfigId')
          ? !(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'
          : true,
    },
    {
      name: 'nodeConfigName',
      width: 160,
      editor: (record) =>
        record.get('nodeConfigId')
          ? !(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'
          : true,
    },
    {
      name: 'nodeOrderType',
      width: 140,
      editor: (record) =>
        record.get('nodeConfigId')
          ? !(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'
          : true,
    },
    {
      name: 'nodeCodeRuleLov',
      width: 200,
      editor: (record) =>
        record.get('nodeOrderType') === 'RCV' && !(record.get('trxLineCount') > 0),
      renderer: ({ value, record }) =>
        record.get('nodeOrderType') === 'RCV' && value ? value.ruleName : '',
    },
    {
      name: 'refRcvTypeCodeLov',
      width: 200,
      editor: (record) =>
        record.get('nodeOrderType') === 'RCV' && !(record.get('trxLineCount') > 0),
    },
    {
      name: 'rcvTypeName',
      width: 160,
    },
    {
      name: 'associateExternal',
      width: 140,
      renderer: ({ record }) =>
        record.get('nodeConfigId') ? (
          <a
            disabled={record.get('nodeOrderType') !== 'RCV'}
            onClick={() => this.openSysCodeModal(record, true)}
          >
            {intl.get('sinv.receiptManage.model.receipt.maintain').d('维护')}
          </a>
        ) : null,
    },
    {
      name: 'reverseEnable',
      editor: true,
    },
    {
      name: 'reversalMain',
      width: 150,
      renderer: ({ record }) =>
        record.get('nodeConfigId') ? (
          <a
            disabled={record.get('nodeOrderType') !== 'RCV' || record.get('reverseEnable') === 0}
            onClick={() => this.openReversalModal(record)}
          >
            {intl.get('sinv.receiptManage.model.receipt.maintain').d('维护')}
          </a>
        ) : null,
    },
  ];

  strColumns = [
    {
      name: 'strategyCode',
      width: 200,
      editor: true,
    },
    {
      name: 'strategyName',
      width: 300,
      editor: true,
    },
    {
      name: 'sourceOrderType',
      width: 200,
      editor: true,
      // renderer: ({ record }) => record?.get('sourceOrderTypeMeaning'),
    },
    {
      name: 'scheduledDeliveryFlag',
      editor: true,
    },
    {
      name: 'detailMaintain',
      renderer: ({ record }) =>
        record.get('nodeStrategyId') ? (
          <a onClick={() => this.openStrategyModal(record)}>
            {intl.get('sinv.receiptManage.model.receipt.detailMaintain').d('明细维护')}
          </a>
        ) : null,
    },
    {
      name: 'enabledFlag',
      editor: true,
    },
  ];

  // formatZero = (num, len) => {
  //   if (String(num).length > len) {
  //     // record.set('lineSeq', num);
  //     return num;
  //   } else {
  //     const seq = (Array(len).join(0) + num).slice(-len);
  //     // record.set('lineSeq', seq);
  //     return seq;
  //   }
  // };

  // 业务策略配置维护明细
  @Bind()
  openStrategyModal(records) {
    const { workFlag } = this.state;
    const lineColumns = [
      {
        name: 'lineSeq',
        width: 80,
        // renderer: ({ record }) => this.formatZero(record.index + 1, 2, record),
        renderer: ({ record }) => {
          const num = record.index + 1;
          if (String(num).length > 2) {
            return num;
          } else {
            const seq = (Array(2).join(0) + num).slice(-2);
            return seq;
          }
        },
      },
      {
        name: 'nodeConfigNameLov',
        width: 140,
        editor: (record) => !(record.get('trxLineCount') > 0),
        // record.get('strategyLineId')
        //   ? !(record.get('trxLineCount') > 0) && record.get('nodeOrderType') !== 'ASN'
        //   : true,
      },
      {
        name: 'srmEnable',
        width: 140,
        editor: (record) => !(record.get('trxLineCount') > 0),
        // record.get('strategyLineId')
        //   ? !(record.get('trxLineCount') > 0) && record.get('nodeOrderType') !== 'ASN'
        //   : true,
      },
      {
        name: 'subjectType',
        width: 120,
        editor: (record) => !(record.get('trxLineCount') > 0),
        // record.get('strategyLineId')
        //   ? !(record.get('trxLineCount') > 0) && record.get('nodeOrderType') !== 'ASN'
        //   : true,
      },
      {
        name: 'updateRoleIdsLov',
        width: 200,
        editor: true,
      },
      {
        name: 'queryRoleIdsLov',
        width: 200,
        editor: true,
      },
      {
        name: 'autoReceiveRule',
        width: 150,
        editor: true,
      },
      {
        name: 'approveRuleCode',
        width: 150,
        editor: true,
      },
      {
        name: 'returnedApproveRule',
        width: 150,
        editor: true,
      },
      {
        name: 'financeReverseCode',
        width: 150,
        editor: true,
      },
      {
        name: 'exportExtEnable',
        editor: (record) =>
          !(
            record.get('srmEnable') === '0' ||
            record.get('nodeOrderType') === 'ASN' ||
            record.get('nodeOrderType') === 'PLAN'
          ),
        width: 150,
      },
      {
        name: 'settleFlag',
        width: 150,
        editor: true,
      },
      {
        name: 'poReceiveRule',
        width: 150,
        editor: (record) => (
          <Select
            onOption={({ record: r }) => {
              const poReceiveRule = record.get('poReceiveRule') || [];
              const disabled = r.get('value') !== 'NONE' && poReceiveRule.some((s) => s === 'NONE');
              return { disabled };
            }}
            onChange={(value) => {
              if (value && value.includes('NONE')) {
                record.set('poReceiveRule', ['NONE']);
              }
            }}
          />
        ),
      },
      workFlag && {
        name: 'slodReceiveRule',
        width: 150,
        editor: (record) => (
          <Select
            onOption={({ record: r }) => {
              const slodReceiveRule = record.get('slodReceiveRule') || [];
              const disabled =
                r.get('value') !== 'NONE' && slodReceiveRule.some((s) => s === 'NONE');
              return { disabled };
            }}
            onChange={(value) => {
              if (value && value.includes('NONE')) {
                record.set('slodReceiveRule', ['NONE']);
              }
            }}
          />
        ),
      },
      !workFlag && {
        name: 'asnReceiveRule',
        width: 150,
        editor: true,
      },
      {
        name: 'asnMatchRule',
        width: 200,
        className: style['asnMatchRule-col'],
        editor: true,
      },
      {
        name: 'returnAsnMatchRule',
        width: 180,
        editor: true,
      },
      {
        name: 'overReceiveFlag',
        width: 150,
        editor: true,
      },
      {
        name: 'strategyLov',
        width: 200,
        editor: true,
      },
    ];
    const key = Modal.key();
    const params = {
      currentDs: this.lineDs,
      type: 'line',
      id: records.get('nodeStrategyId'),
      name: 'strategyHeaderId',
    };
    const nodeCode =
      records.get('sourceOrderType') === 'PC'
        ? 'SINV.NODE_CONFIG_STRATEGY_PC'
        : 'SINV.NODE_CONFIG_STRATEGY';
    const _modal = Modal.open({
      key,
      closable: true,
      movable: false,
      title: intl
        .get('sinv.receiptManage.model.receipt.strategyMaintain')
        .d('业务策略配置明细维护'),
      style: {
        width: 1200,
      },
      afterClose: () => {
        if (this.state.updateFlag) {
          this.strTableDs.query(this.strTableDs.currentPage).then(() => {
            this.strTableDs.forEach((record) => {
              Object.assign(record, { workFlag: this.state.workFlag });
            });
          });
          this.setState({ updateFlag: false });
        }
        this.lineDs.loadData([]);
      },
      footer: null,
      children: (
        <div>
          {this.renderBtn(params)}
          {/* <Table
            ref={(ref) => (this.tableRef = ref)}
            pagination={false}
            dataSet={this.lineDs}
            columns={lineColumns}
          /> */}
          <DetailModal dataSet={this.lineDs} columns={lineColumns} />
        </div>
      ),
    });
    this.lineDs.setQueryParameter('nodeStrategyId', records.get('nodeStrategyId'));
    this.lineDs.getField('nodeConfigNameLov').set('lovCode', nodeCode);
    this.lineDs.setState('sourceOrderType', records.get('sourceOrderType'));
    this.lineDs.query().then((res) => {
      // if (this.tableRef) {
      //   this.tableRef.tableStore.width = 1152;
      // }
      if (res && !res.failed) {
        const editFlag = res.findIndex((i) => i.trxLineCount > 0) === -1;
        _modal.update({
          children: (
            <div>
              {this.renderBtn({ ...params, editFlag })}
              {/* <Table
                ref={(ref) => (this.tableRef = ref)}
                pagination={false}
                dataSet={this.lineDs}
                columns={lineColumns}
              /> */}
              <DetailModal dataSet={this.lineDs} columns={lineColumns} />
            </div>
          ),
        });
      }
    });
  }

  @Bind()
  getDs(type) {
    let Ds = '';
    switch (type) {
      case 'system':
        Ds = this.systemDs;
        break;
      case 'reversal':
        Ds = this.reverseDs;
        break;
      case 'node':
        Ds = this.tableDs;
        break;
      case 'strategy':
        Ds = this.strTableDs;
        break;
      default:
        break;
    }
    return Ds;
  }

  @Bind()
  renderBtn(params) {
    const { currentDs, type, editFlag = true } = params;
    const CommonBtn = observer(({ dataSet }) => {
      return (
        <div className={style['operate-handler']}>
          <Button disabled={!editFlag} onClick={() => this.handleCreate(dataSet)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            disabled={dataSet.selected.length === 0}
            onClick={() => this.handleDelete(dataSet, type)}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
          <Button
            // disabled={type === 'line' ? false : !editFlag}
            color="primary"
            funcType="raised"
            onClick={() => this.handleModalSave(params)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      );
    });
    return <CommonBtn dataSet={currentDs} />;
  }

  // 关联外部系统编码维护
  @Bind()
  openSysCodeModal(records, returnFlag) {
    const name = returnFlag ? 'nodeConfigId' : 'reverseConfigId';
    // const { trxLineCount } = data;
    // const editFlag = returnFlag ? trxLineCount < 1 : flag;
    const currentDs = returnFlag ? this.systemDs : this.returnDs;
    const params = {
      currentDs,
      type: returnFlag ? 'system' : 'return',
      id: records.get(name),
      name,
      returnFlag,
    };
    const sysColumns = [
      {
        name: 'externalSystemCode',
        width: 160,
        editor: (record) => !(record.get('trxLineCount') > 0),
      },
      {
        name: 'rcvTypeCode',
        width: 160,
        editor: (record) => !(record.get('trxLineCount') > 0),
      },
      {
        name: 'rcvTypeName',
        editor: true,
      },
      {
        name: 'attachmentUuid',
        editor: false,
        renderer: ({ record }) => {
          const uploadModalProps = {
            showFilesNumber: false,
            icon: false,
            attachmentUUID: record.get('attachmentUuid'),
            bucketName: 'private-bucket',
            bucketDirectory: 'sodr-order',
            afterOpenUploadModal: (attUuid) => {
              record.set('attachmentUuid', attUuid);
            },
          };
          return <UploadModal {...uploadModalProps} />;
        },
      },
    ];
    currentDs.setQueryParameter('params', {
      [name]: records.get(name),
      name,
      nodeConfigType: Number(returnFlag),
    });
    currentDs.query();
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      title: returnFlag
        ? intl.get('sinv.receiptManage.model.receipt.receiptTypeFix').d('收货类型维护')
        : intl.get('sinv.receiptManage.model.receipt.returnTypeFix').d('退货类型维护'),
      style: {
        width: 680,
      },
      footer: null,
      afterClose: () => {
        currentDs.loadData([]);
      },
      children: (
        <div>
          {this.renderBtn(params)}
          <Table pagination={false} dataSet={currentDs} columns={sysColumns} />
        </div>
      ),
    });
  }

  // 冲销事务维护
  @Bind()
  openReversalModal(records) {
    const nodeConfigId = records.get('nodeConfigId');
    const nodeConfigCode = records.get('nodeConfigCode');
    const params = {
      currentDs: this.reverseDs,
      type: 'reverse',
      id: nodeConfigId,
      name: 'nodeConfigId',
    };
    this.reverseDs.setQueryParameter('nodeConfigId', nodeConfigId);
    this.reverseDs.query();
    this.reverseDs
      .getField('reverseNodeConfigLov')
      .set('lovPara', { nodeConfigId, nodeConfigCode, tenantId: organizationId });
    const columns = [
      {
        name: 'reverseNodeConfigLov',
        width: 160,
        editor: true,
      },
      {
        name: 'refRcvTypeCodeLov',
        width: 200,
        help: intl
          .get('sinv.receiptManage.model.receipt.receipReturnTypCodeHelp')
          .d(
            '单据不显示此类型，仅用于系统判断是否需将退货数据匹配到订单/送货单；请在【租户退货类型】中维护明细用于单据展示或者体现业务数据分类'
          ),
        editor: true,
      },
      {
        name: 'rcvTypeName',
        width: 160,
      },
      {
        name: 'associateExternalSystemCode',
        width: 160,
        help: intl
          .get('sinv.receiptManage.model.receipt.receipReturnTypeHelp')
          .d(
            '支持维护不同系统来源的退货类型编码及描述，如果没有退货，则无需维护，如有，则至少维护一个退货类型'
          ),
        renderer: ({ record }) =>
          record.get('reverseConfigId') ? (
            <a onClick={() => this.openSysCodeModal(record, false)}>
              {intl.get('sinv.receiptManage.model.receipt.maintain').d('维护')}
            </a>
          ) : null,
      },
    ];
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      title: intl.get('sinv.receiptManage.model.receipt.reversaReturnTypeFix').d('退货类型维护'),
      style: {
        width: 800,
      },
      footer: null,
      afterClose: () => {
        this.reverseDs.loadData([]);
      },
      children: (
        <div>
          {this.renderBtn(params)}
          <Table pagination={false} dataSet={this.reverseDs} columns={columns} />
        </div>
      ),
    });
  }

  /**
   * 公用新建方法
   */
  @Bind()
  handleCreate(dataSet, tabType) {
    if (tabType === 'node') {
      dataSet.create(
        {
          nodeOrderType: 'RCV',
          workFlag: this.state.workFlag,
        },
        dataSet.length
      );
    } else {
      dataSet.create(
        {
          workFlag: this.state.workFlag,
        },
        dataSet.length
      );
    }
  }

  /**
   * 公用删除方法
   * @param {*} dataSet - 当前ds
   * @param {*} type
   */
  @Bind()
  handleDelete(dataSet, type) {
    const selectedRecords = dataSet.selected;
    dataSet.remove(selectedRecords.filter((i) => i.status === 'add'));
    const lines = selectedRecords.filter((i) => i.status !== 'add').map((i) => i.toData()) || [];
    if (!isEmpty(lines)) {
      Modal.confirm({
        children: intl.get('sinv.receiptManage.view.message.delete').d('确认删除选中行？'),
        onOk: async () => {
          const res = getResponse(await handleDelete(lines, type));
          if (res) {
            notification.success();
            dataSet.query(dataSet.currentPage).then(() => {
              dataSet.forEach((record) => {
                Object.assign(record, { workFlag: this.state.workFlag });
              });
            });
            if (type === 'line') {
              this.setState({ updateFlag: true });
            }
          }
        },
      });
    }
  }

  /**
   * Modal公用保存
   * @param {*} dataSet - Ds
   * @param {*} type - 根据type判断url
   * @param {*} id - 节点id
   * @param {*} name - 节点名称
   * @param {*} returnFlag - 是否退货节点
   */
  @Bind()
  async handleModalSave({ currentDs, type, id, name, returnFlag = true }) {
    let list = [];
    if (type === 'system' || type === 'return') {
      list = currentDs
        .toData()
        .filter((i) => !isEmpty(i))
        .map((i) => ({
          ...i,
          nodeConfigId: id,
          nodeConfigType: returnFlag ? 1 : 0,
          tenantId: organizationId,
        }));
    } else {
      list = currentDs.toData().map((i) => ({
        ...i,
        [name]: id,
        tenantId: organizationId,
        overReceiveFlag: i.overReceiveFlag || 0,
        asnMatchRule: i.asnMatchRule || 'FUZZY',
      }));
    }
    const asnMatchWarning = `${intl
      .get('sinv.receiptManage.view.message.asnMatchError')
      .d('所有事务节点的匹配送货单规则必须一致')}`;
    const flag = await currentDs.validate();
    if (flag && list.length > 0) {
      const asnMatchflag = list
        .filter((i) => i.nodeOrderType === 'RCV')
        .some((i, idx, arr) => arr[0]?.asnMatchRule !== i?.asnMatchRule);
      if (asnMatchflag) {
        notification.error({ message: asnMatchWarning });
        return false;
      }
      const res = getResponse(await handleSave(list, type));
      if (res) {
        currentDs.query();
        if (type === 'line') {
          this.setState({ updateFlag: true });
        }
      }
    }
  }

  /**
   * 节点/策略配置保存
   */
  @Bind()
  async handleSave(dataSet, type) {
    // const {workFlag} = this.state;
    const list = dataSet.toData().map((i) => {
      return {
        ...i,
        tenantId: organizationId,
        // nodeOrderType: type === 'node' ? (workFlag ? 'RCV' : i.nodeOrderType) : null,
      };
    });
    const flag = await dataSet.validate();
    if (flag && list.length > 0) {
      const res = getResponse(await handleSave(list, type));
      if (res) {
        notification.success();
        dataSet.query(dataSet.currentPage).then(() => {
          dataSet.forEach((record) => {
            Object.assign(record, { workFlag: this.state.workFlag });
          });
        });
      }
    }
  }

  /**
   * 选择送货单匹配规则
   */
  @Bind()
  handleAsnMatchRule(record, value) {
    // 同步设置当前所有事务单匹配规则
    // this.lineDs
    //   .filter(i => i.get('nodeOrderType') === 'RCV')
    //   .map(t => t.set('asnMatchRule', value));
    record.set('asnMatchRule', value);
  }

  @Bind()
  asnMatchRuleDisabled(record) {
    if (record.get('nodeOrderType') === 'RCV') {
      return false;
    } else {
      return true;
    }
  }

  /**
   * 节点引用推荐配置
   */
  async handleReferenceRecommend(dataSet) {
    const res = getResponse(await handleReferenceRecommend());
    if (res) {
      notification.success();
      dataSet.query(dataSet.currentPage);
      this.strTableDs.query(this.strTableDs.currentPage);
      // if (type === 'node') {  // 传过来的
      //   this.setState({ display: true });
      // }
    }
  }

  @Bind()
  onTabChange(key) {
    this.setState({ tabType: key });
  }

  nodeList = (columns) => {
    const { workFlag, tabType } = this.state;
    const tab = tabType === 'node' ? 'nodeOrderType' : 'scheduledDeliveryFlag';
    const list = [];
    columns.forEach((item) => {
      if (workFlag) {
        const node = [];
        if (item.name !== tab) {
          node.push(item);
        }
        return list.push(...node);
      } else {
        list.push(item);
      }
    });
    return list;
  };

  render() {
    const { tabType } = this.state;
    const OperateBtn = observer(({ dataSet }) => {
      return (
        <div className="operate-btn">
          {tabType === 'node' && (
            <Button
              icon="application_allocation"
              funcType="raised"
              wait={30}
              waitType="debounce"
              onClick={() => this.handleReferenceRecommend(dataSet, tabType)}
            >
              <span className={style.recommend}>
                {intl.get('hzero.common.button.recommend').d('引用推荐配置')}
              </span>
              <Tooltip
                placement="bottom"
                title={intl
                  .get('hzero.common.button.recommendTip')
                  .d(
                    '引用推荐配置会清空当前界面的所有配置，且走在策略中的订单或者事务不允许该操作，谨慎使用'
                  )}
              >
                <Icon
                  // style={{ color: '#29bece', margin: '0 0 1px 2px' }}
                  className={style.helpOutline}
                  type="help_outline"
                  width={16}
                  height={16}
                />
              </Tooltip>
            </Button>
          )}
          <Button icon="add" funcType="raised" onClick={() => this.handleCreate(dataSet, tabType)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="delete"
            funcType="raised"
            disabled={dataSet.selected.length === 0}
            onClick={() => this.handleDelete(dataSet, tabType)}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>

          <Button
            icon="save"
            color="primary"
            funcType="raised"
            onClick={() => this.handleSave(dataSet, tabType)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      );
    });
    return (
      <Fragment>
        <Header title={intl.get('sinv.receiptManage.view.title.receiptManage').d('收货管理配置')}>
          {tabType === 'node' && <OperateBtn dataSet={this.tableDs} type="node" />}
          {tabType === 'strategy' && <OperateBtn dataSet={this.strTableDs} type="strategy" />}
        </Header>
        <Content>
          {/* <Collapse className={style['collapse-title']} defaultActiveKey={['node', 'strategy']}>
            <Panel
              key="node"
              header={intl.get('sinv.receiptManage.view.title.node').d('业务节点配置')}
            >
              <Table dataSet={this.tableDs} columns={this.nodeColumns} />
            </Panel>
            {display && (
              <Panel
                key="strategy"
                header={intl.get('sinv.receiptManage.view.title.strategy').d('业务策略配置')}
              >
                <OperateBtn dataSet={this.strTableDs} type="strategy" />
                <Table dataSet={this.strTableDs} columns={this.strColumns} />
              </Panel>
            )}
          </Collapse> */}
          <Tabs onChange={(key) => this.onTabChange(key)} defaultActiveKey="node">
            <TabPane
              tab={intl.get('sinv.receiptManage.view.title.node').d('业务节点配置')}
              key="node"
            >
              <Table dataSet={this.tableDs} columns={this.nodeList(this.nodeColumns)} />
            </TabPane>
            <TabPane
              tab={intl.get('sinv.receiptManage.view.title.strategy').d('业务策略配置')}
              key="strategy"
            >
              <Table dataSet={this.strTableDs} columns={this.nodeList(this.strColumns)} />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
