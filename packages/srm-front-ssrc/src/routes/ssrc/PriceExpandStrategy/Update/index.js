/**
 * 价格拓展策略编辑
 * @date: 2020-07-14
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import {
  DataSet,
  Button,
  Form,
  TextField,
  NumberField,
  Switch,
  Select,
  Lov,
  Table,
  DateTimePicker,
  Spin,
  TextArea,
  Output,
  Modal,
  CheckBox,
} from 'choerodon-ui/pro';
import classnames from 'classnames';
import { Tabs, Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { uniqWith, isEqual, differenceWith, intersectionWith, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  fetchDetail,
  saveDetail,
  releaseDetail,
  fetchScopeTabs,
  fetchLovConfig,
  saveAppoint,
  fetchAppointCheckedData,
} from '@/services/priceExpandStrategyService';
import { showOperation } from '../utils';
import ScopeChild from './ScopeChild';
import {
  basicFormDS,
  policySettingRuleDS,
  ruleLovConfigDS,
  selectConfigDS,
  policySettingScopeDS,
  policySettingScopeTableDS,
  policySettingScopeAddTabDS,
} from './lineDS';
import style from '../index.less';

// const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Column } = Table;
const modalKey = Modal.key();
let _modal;

@formatterCollections({ code: ['ssrc.priceExpandStrategy', 'hzero.common', 'ssrc.priceLibDimension'] })
export default class PriceExpandStrategy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headerData: {}, // 页面数据
      expandScopeIds: {}, // 展开范围
      scopeTabs: {}, // 范围侧边tab
      fetchDetailLoading: {},
      appointCheckedData: [], // 目标值已勾选值
    };
    this.scopeChild = {};
    this.scopeTableDs = {};
    this.addTabDs = {};
  }

  basicFormDs = new DataSet(basicFormDS());

  policySettingRuleDs = new DataSet(policySettingRuleDS());

  lovConfigDs = new DataSet(ruleLovConfigDS());

  selectConfigDs = new DataSet(selectConfigDS());

  policySettingScopeDs = new DataSet(policySettingScopeDS());

  componentDidMount() {
    this.fetchDetail();

    // 增加选中记录的事件监听
    this.lovConfigDs.addEventListener('select', this.handleSelect);
    // 增加撤销选择记录的事件监听
    this.lovConfigDs.addEventListener('unSelect', this.handleUnSelect);
    // 增加全选记录的事件监听
    this.lovConfigDs.addEventListener('selectAll', this.handleSelectAll);
    // 增加撤销全选记录的事件监听
    this.lovConfigDs.addEventListener('unSelectAll', this.handleUnSelectAll);
    // 增加数据加载完后监听
    this.lovConfigDs.addEventListener('load', this.handleLoad);

    // 增加选中记录的事件监听
    this.selectConfigDs.addEventListener('select', this.handleSelect);
    // 增加撤销选择记录的事件监听
    this.selectConfigDs.addEventListener('unSelect', this.handleUnSelect);
    // 增加全选记录的事件监听
    this.selectConfigDs.addEventListener('selectAll', this.handleSelectAll);
    // 增加撤销全选记录的事件监听
    this.selectConfigDs.addEventListener('unSelectAll', this.handleUnSelectAll);
    // 增加数据加载完后监听
    this.selectConfigDs.addEventListener('load', this.handleLoad);
  }

  // 选中数据
  @Bind()
  handleSelect({ record }) {
    this.setState({
      appointCheckedData: [...this.state.appointCheckedData, record.toData()],
    });
  }

  // 取消选择数据
  @Bind()
  handleUnSelect({ record }) {
    const { appointCheckedData = [] } = this.state;
    let newData = [];
    // 数据库已存在的数据，取消选择
    if (record.toData().ruleLnDataId) {
      newData = appointCheckedData.filter(
        (item) => item.ruleLnDataId !== record.toData().ruleLnDataId
      );
    } else {
      // appointCheckedData临时数据，取消选择
      newData = differenceWith(appointCheckedData, [record.toData()], isEqual);
    }
    this.setState({
      appointCheckedData: newData,
    });
  }

  // 全选
  @Bind()
  handleSelectAll({ dataSet }) {
    // 去除数据库中已存在的数据
    const data = dataSet
      .filter((record) => !record.toData().ruleLnDataId)
      .map((record) => record.toData());
    // 去除重复数据
    const newData = uniqWith([...this.state.appointCheckedData, ...data], isEqual);
    this.setState({
      appointCheckedData: newData,
    });
  }

  // 撤销全选
  @Bind()
  handleUnSelectAll({ dataSet }) {
    const { appointCheckedData = [] } = this.state;
    let newData = appointCheckedData;
    dataSet.forEach((record) => {
      if (record.toData().ruleLnDataId) {
        newData = newData.filter((item) => item.ruleLnDataId !== record.toData().ruleLnDataId);
      } else {
        newData = differenceWith(newData, [record.toData()], isEqual);
      }
    });
    this.setState({
      appointCheckedData: newData,
    });
  }

  /**
   * 数据加载完后事件
   */
  @Bind()
  handleLoad({ dataSet }) {
    const { appointCheckedData = [] } = this.state;
    const realData = [];
    // 已勾选的真实数据
    appointCheckedData.forEach((item) => {
      if (item.ruleLnDataId) {
        realData.push(item.ruleLnDataId);
      }
    });
    dataSet.forEach((record) => {
      if (realData.includes(record.data.ruleLnDataId)) {
        Object.assign(record, { isSelected: true });
      } else if (!isEmpty(intersectionWith(appointCheckedData, [record.toData()], isEqual))) {
        Object.assign(record, { isSelected: true });
      }
    });
  }

  /**
   * 查询详情
   */
  @Bind()
  async fetchDetail() {
    const {
      match: { params },
    } = this.props;
    const result = getResponse(
      await fetchDetail({
        expandId: params.expandId,
      })
    );
    if (result && !result.failed) {
      const { priceLibRuleHeader = {}, ...others } = result;
      this.basicFormDs.loadData([{ ...others }]);
      this.policySettingRuleDs.loadData(priceLibRuleHeader.priceLibRuleLineList || []);
      // 设置维度lov查询参数
      this.policySettingRuleDs.setQueryParameter('expandId', params.expandId);
      this.policySettingRuleDs.setQueryParameter('ruleHeaderId', priceLibRuleHeader.ruleHeaderId);
      this.policySettingScopeDs.loadData(priceLibRuleHeader.priceLibRuleCombList || []);
      // 产生多个范围表格ds
      if (priceLibRuleHeader.priceLibRuleCombList) {
        priceLibRuleHeader.priceLibRuleCombList.forEach((item) => {
          this.scopeTableDs = {
            ...this.scopeTableDs,
            [item.ruleCombId]: new DataSet(policySettingScopeTableDS()),
          };
          this.addTabDs = {
            ...this.addTabDs,
            [item.ruleCombId]: new DataSet(policySettingScopeAddTabDS()),
          };
        });
      }
      this.setState({
        headerData: result,
      });
      // 默认展开第一个范围, 查询第一条
      if (
        priceLibRuleHeader.priceLibRuleCombList[0] &&
        priceLibRuleHeader.priceLibRuleCombList[0].ruleCombId
      ) {
        this.setState({
          expandScopeIds: {
            [priceLibRuleHeader.priceLibRuleCombList[0].ruleCombId]: true,
          },
        });
        this.fetchScopeTabs(priceLibRuleHeader.priceLibRuleCombList[0].ruleCombId);
      }
    }
  }

  /**
   * 查询适用范围侧边栏
   */
  @Bind()
  async fetchScopeTabs(ruleCombId, dimensionCode) {
    const params = {
      ruleCombId,
    };
    const result = getResponse(await fetchScopeTabs(params));
    if (result && !result.failed) {
      // 设置tab的activeKey
      if (this.scopeChild[ruleCombId] && !this.scopeChild[ruleCombId].state.activeKey) {
        this.scopeChild[ruleCombId].setState({
          activeKey: result[0].dimensionCode,
        });
      }

      // 查询第一个tab对应表格的数据
      this.scopeTableDs[ruleCombId].setQueryParameter('params', {
        ...params,
        dimensionCode: dimensionCode || (result[0] && result[0].dimensionCode),
      });
      this.scopeTableDs[ruleCombId].query();

      // 设置addTabDs查询参数
      this.addTabDs[ruleCombId].setQueryParameter('expandId', this.props.match.params.expandId);
      this.addTabDs[ruleCombId].setQueryParameter(
        'shieldDimCodes',
        result.map((item) => item.dimensionCode).toString()
      );

      // 设置范围数据
      this.setState({
        fetchDetailLoading: {
          ...this.state.fetchDetailLoading,
          [ruleCombId]: false,
        },
        scopeTabs: {
          ...this.state.scopeTabs,
          [ruleCombId]: result,
        },
      });
      return result;
    }
  }

  /**
   * 点击范围tab标签页，查询右侧列表数据
   */
  @Bind()
  fetchScopeTabData(params) {
    // 清空上一次查询条件数据
    this.scopeTableDs[params.ruleCombId].queryDataSet.current.reset();
    // 查询表格数据
    this.scopeTableDs[params.ruleCombId].setQueryParameter('params', params);
    this.scopeTableDs[params.ruleCombId].query();
  }

  /**
   * 指定范围 - 选择目标字段值 - LOV
   */
  @Bind()
  async handleClickAppointLov(record) {
    const item = record.toData();
    const params = { dimensionCode: item.dimensionCode, ruleLineId: item.ruleLineId };

    // 打开弹框
    _modal = Modal.open({
      key: modalKey,
      title: item.dimensionName,
      style: {
        width: 680,
      },
      children: <Table dataSet={this.lovConfigDs} columns={[]} queryFieldsLimit={2} />,
      onOk: () => {},
      onCancel: () => true,
      afterClose: () => {
        this.lovConfigDs.loadData([]);
        this.setState({
          appointCheckedData: [],
        });
      },
    });

    // 查询头
    const res = getResponse(await fetchLovConfig({ viewCode: item.sourceCode }));
    if (res && !res.failed) {
      const queryFromDs = new DataSet();
      const columns = [];
      res.tableFields.forEach((n) => {
        this.lovConfigDs.addField(n.dataIndex, {
          name: n.dataIndex,
          label: n.title,
        });
        columns.push({
          name: n.dataIndex,
          label: n.title,
          width: n.width,
        });
      });
      res.queryFields.forEach((n) => {
        queryFromDs.addField(n.field, {
          name: n.field,
          label: n.label,
        });
      });
      Object.assign(this.lovConfigDs, { queryDataSet: queryFromDs });

      // 查询所有已数据，为了做跨页勾选
      const appointCheckedData = getResponse(await fetchAppointCheckedData(params));
      if (appointCheckedData && !appointCheckedData.failed) {
        this.setState(
          {
            appointCheckedData,
          },
          () => {
            // 查询行
            this.lovConfigDs.setQueryParameter('params', params);
            this.lovConfigDs.query();

            _modal.update({
              children: <Table dataSet={this.lovConfigDs} columns={columns} queryFieldsLimit={2} />,
              onOk: async () => {
                const saveRes = getResponse(
                  await saveAppoint({
                    data: this.state.appointCheckedData,
                    ruleLineId: item.ruleLineId,
                  })
                );
                if (saveRes && !saveRes.failed) {
                  notification.success();
                  this.fetchDetail();
                  return true;
                } else {
                  return false;
                }
              },
            });
          }
        );
      }
    }
  }

  /**
   * 指定范围 - 选择目标字段值 - 下拉框
   */
  @Bind()
  async handleClickAppointSelect(record) {
    const item = record.toData();

    const params = { dimensionCode: item.dimensionCode, ruleLineId: item.ruleLineId };

    // 查询所有已数据，为了做跨页勾选
    const appointCheckedData = getResponse(await fetchAppointCheckedData(params));
    if (appointCheckedData && !appointCheckedData.failed) {
      this.setState(
        {
          appointCheckedData,
        },
        () => {
          this.selectConfigDs.setQueryParameter('params', params);
          this.selectConfigDs.query();

          // 打开弹框
          Modal.open({
            key: modalKey,
            title: item.dimensionName,
            style: {
              width: 680,
            },
            children: (
              <Table mode="tree" dataSet={this.selectConfigDs} queryFieldsLimit={2}>
                <Column name="dataName" />
                <Column name="dataCode" />
              </Table>
            ),
            onOk: async () => {
              const saveRes = getResponse(
                await saveAppoint({
                  data: this.state.appointCheckedData,
                  ruleLineId: item.ruleLineId,
                })
              );
              if (saveRes && !saveRes.failed) {
                notification.success();
                this.fetchDetail();
                return true;
              } else {
                return false;
              }
            },
            onCancel: () => true,
            afterClose: () => {
              this.selectConfigDs.loadData([]);
              this.setState({
                appointCheckedData: [],
              });
            },
          });
        }
      );
    }
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const { headerData = {} } = this.state;
    const {
      priceLibRuleHeader: { priceLibRuleCombList, priceLibRuleLineList, ...otherHeaders } = {},
      ...other
    } = headerData;
    const basicFormFlag = await this.basicFormDs.validate();
    const ruleFlag = await this.policySettingRuleDs.validate();
    const scopeFlag = await this.policySettingScopeDs.validate();
    if (basicFormFlag && ruleFlag && scopeFlag) {
      const params = {
        ...other,
        ...this.basicFormDs.toData()[0],
        priceLibRuleHeader: {
          ...otherHeaders,
          priceLibRuleLineList: this.policySettingRuleDs.toData(),
          priceLibRuleCombList: this.policySettingScopeDs.toData(),
        },
      };
      const res = getResponse(await saveDetail(params));
      if (res && !res.failed) {
        notification.success();
        this.fetchDetail();
      }
    }
  }

  /**
   * 发布
   */
  @Bind()
  async handleRelease() {
    const { headerData = {} } = this.state;
    const {
      priceLibRuleHeader: { priceLibRuleCombList, priceLibRuleLineList, ...otherHeaders } = {},
      ...other
    } = headerData;
    const basicFormFlag = await this.basicFormDs.validate();
    const ruleFlag = await this.policySettingRuleDs.validate();
    const scopeFlag = await this.policySettingScopeDs.validate();
    if (basicFormFlag && ruleFlag && scopeFlag) {
      const params = {
        ...other,
        ...this.basicFormDs.toData()[0],
        priceLibRuleHeader: {
          ...otherHeaders,
          priceLibRuleLineList: this.policySettingRuleDs.toData(),
          priceLibRuleCombList: this.policySettingScopeDs.toData(),
        },
      };
      const res = getResponse(await releaseDetail(params));
      if (res && !res.failed) {
        notification.success();
        this.props.history.push(`/ssrc/price-expand-strategy/list`);
      }
    }
  }

  /**
   * 新增
   * @memberof PriceLibDimension
   */
  @Bind()
  handleAdd(ds) {
    const record = ds.create({}, 0);
    record.setState('_status', 'create');
  }

  /**
   * 编辑
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelEdit(record) {
    record.setState('_status', 'update');
  }

  /**
   * 取消
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handleCancel(record) {
    record.reset();
    record.setState('_status', '');
  }

  /**
   * 新增范围
   */
  @Bind()
  handleAddScope() {
    this.policySettingScopeDs.create({}, 0);
    this.forceUpdate();
  }

  /**
   * 展开/收起范围
   */
  @Bind()
  expandScope(record, expandFlag) {
    this.setState({
      expandScopeIds: {
        ...this.state.expandScopeIds,
        [record.data.ruleCombId]: expandFlag,
      },
    });
    if (expandFlag) {
      this.setState({
        fetchDetailLoading: {
          ...this.state.fetchDetailLoading,
          [record.data.ruleCombId]: true,
        },
      });
      this.fetchScopeTabs(record.data.ruleCombId);
    }
  }

  /**
   * 点击折叠面板新增按钮-停止折叠面板冒泡行为
   */
  @Bind()
  clickPanelHeader(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   * 删除-拓展范围
   */
  @Bind()
  async handleDeleteComb(record) {
    if (record.data.ruleCombId) {
      const res = getResponse(await this.policySettingScopeDs.delete(record));
      if (res && !res.failed) {
        notification.success();
        this.forceUpdate();
      }
    } else {
      this.policySettingScopeDs.remove(record);
      notification.success();
      this.forceUpdate();
    }
  }

  /**
   * 筛选运算符
   * 目标价格维度类型为下拉框或lov或目标价格维度为相关价格，可以选择表达式包含于不包含
   */
  @Bind()
  ruleExpressionOptionsFilter(option, record) {
    if (record.get('dimensionCodeLOV')) {
      if (
        record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
        record.get('dimensionCodeLOV').fieldWidget === 'SELECT'
      ) {
        return option.get('value') !== 'EQUAL' && option.get('value') !== 'NOT_EQUAL';
      } else {
        return option.get('value') !== 'BE_CONTAIN' && option.get('value') !== 'NOT_CONTAIN';
      }
    } else {
      return option.get('value');
    }
  }

  /**
   * 筛选匹配类型
   * 目标价格维度类型为下拉框或lov，运算符是包含于不包含，匹配类型是指定范围；其他，运算符是等于不等于，只能是指定值
   */
  @Bind()
  appointTypeOptionsFilter(option, record) {
    if (record.get('dimensionCodeLOV')) {
      if (
        record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
        record.get('dimensionCodeLOV').fieldWidget === 'SELECT'
      ) {
        return option.get('value') === 'SCOPE';
      } else if (
        record.get('dimensionCodeLOV').fieldWidget !== 'LOV' &&
        record.get('dimensionCodeLOV').fieldWidget !== 'SELECT'
      ) {
        return option.get('value') === 'VALUE';
      }
    } else {
      return option.get('value') !== 'CURRENT_DIMENSION';
    }
  }

  @Bind
  handleOpenExpandScope(record) {
    const { scopeTabs = {} } = this.state;

    const scopeChildProps = {
      fetchScopeTabs: this.fetchScopeTabs,
      fetchScopeTabData: this.fetchScopeTabData,
      onRef: (callKey, node) => {
        this.scopeChild[callKey] = node;
      },
    };
    // this.setState({
    //   fetchDetailLoading: {
    //     ...this.state.fetchDetailLoading,
    //     [record.data.ruleCombId]: true,
    //   },
    // });
    this.fetchScopeTabs(record.data.ruleCombId);
    Modal.open({
      key: Modal.key(),
      title: intl
        .get('ssrc.priceExpandStrategy.view.message.panel.editExpandScope')
        .d('编辑拓展范围'),
      drawer: true,
      style: {
        width: '742px',
      },
      children: (
        <ScopeChild
          ruleCombId={record.data.ruleCombId}
          scopeTabsData={scopeTabs[record.data.ruleCombId]}
          tableDs={this.scopeTableDs[record.data.ruleCombId]}
          addTabDs={this.addTabDs[record.data.ruleCombId]}
          {...scopeChildProps}
        />
      ),
      bodyStyle: { padding: 0 },
    });
  }

  render() {
    const { headerData = {} } = this.state;
    const ruleListColumns = [
      {
        name: 'lineNum',
        width: 100,
        renderer: ({ record }) => record.index + 1,
      },
      {
        name: 'dimensionCodeLOV',
        // width: 200,
        editor: (record) => ['create'].includes(record.getState('_status')),
      },
      {
        name: 'ruleExpression',
        width: 200,
        editor: (record) => {
          // if (['update', 'create'].includes(record.getState('_status'))) {
          return (
            <Select
              name="sourceFrom"
              optionsFilter={(option) => this.ruleExpressionOptionsFilter(option, record)}
            />
          );
          // } else {
          //   return false;
          // }
        },
      },
      {
        name: 'appointType',
        width: 200,
        editor: (record) => {
          // if (['update', 'create'].includes(record.getState('_status'))) {
          return (
            <Select
              name="appointType"
              optionsFilter={(option) => this.appointTypeOptionsFilter(option, record)}
            />
          );
          // } else {
          //   return false;
          // }
        },
      },
      {
        name: 'appointValue',
        header: intl.get('ssrc.priceExpandStrategy.model.strategy.appointValue').d('维度值'),
        // width: 200,
        // tooltip: 'overflow',
        editor: (record) => {
          // if (['update', 'create'].includes(record.getState('_status'))) {
          if (
            record.get('dimensionCodeLOV') &&
            record.get('dimensionCodeLOV').fieldWidget === 'LOV' &&
            record.get('ruleExpression') !== 'IS_NULL' &&
            record.get('ruleExpression') !== 'NOT_NULL' &&
            record.get('appointType') === 'SCOPE'
          ) {
            return <Lov record={record} name="appointValueLov" style={{ width: '100%' }} />;
          } else if (
            record.get('dimensionCodeLOV') &&
            record.get('dimensionCodeLOV').fieldWidget === 'SELECT' &&
            record.get('ruleExpression') !== 'IS_NULL' &&
            record.get('ruleExpression') !== 'NOT_NULL' &&
            record.get('appointType') === 'SCOPE'
          ) {
            return <Select record={record} name="appointValue" style={{ width: '100%' }} />;
          } else {
            return <TextField record={record} name="appointValue" style={{ width: '100%' }} />;
          }
        },
      },
    ];

    const expandScopeColumns = [
      {
        name: 'lineNum',
        width: 100,
        renderer: ({ record }) => record.index + 1,
      },
      {
        name: 'combExpression',
        width: 400,
        editor: true,
      },
      {
        name: 'expandScope',
        width: 200,
        renderer: ({ record }) => (
          <a
            disabled={!record.get('ruleCombId')}
            onClick={() => this.handleOpenExpandScope(record)}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];

    // const scopeChildProps = {
    //   fetchScopeTabs: this.fetchScopeTabs,
    //   fetchScopeTabData: this.fetchScopeTabData,
    //   onRef: (callKey, node) => {
    //     this.scopeChild[callKey] = node;
    //   },
    // };

    return (
      <Fragment>
        <Header
          title={intl
            .get('ssrc.priceExpandStrategy.view.title.editExpandStrategySettings')
            .d('编辑拓展策略')}
          backPath="/ssrc/price-expand-strategy/list"
        >
          <Button
            name="release"
            icon="publish2"
            color="primary"
            funcType="raised"
            onClick={this.handleRelease}
            disabled={headerData.expandStatus === 'RELEASED'}
          >
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
          <Button
            name="save"
            icon="save"
            funcType="flat"
            onClick={this.handleSave}
            wait={1000}
            waitType="debounce"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            name="operation"
            icon="operation_service_request"
            funcType="flat"
            onClick={() => showOperation(this.basicFormDs?.current)}
          >
            {intl.get('ssrc.priceExpandStrategy.view.button.operation').d('操作记录')}
          </Button>
        </Header>
        <Content className={classnames('ued-detail-wrapper', style['update-container'])}>
          {/* <Tabs defaultActiveKey="policySettings" animated={false}>
            <TabPane
              tab={intl.get('ssrc.priceExpandStrategy.view.tab.basicInfos').d('基础信息')}
              key="basicInfos"
            > */}
          <div className={style['rfx-detail-list-card']}>
            <div className={style['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={style['rfx-card-item-title']}>
                {intl.get('ssrc.priceExpandStrategy.view.tab.basicInfos').d('基础信息')}
              </h3>
              <Form
                useWidthPercent
                labelLayout="float"
                dataSet={this.basicFormDs}
                columns={3}
                // className={style['c7n-form-label-required']}
              >
                <TextField name="expandCode" />
                <TextField name="expandName" />
                <NumberField name="priorityLevel" />
                <Select
                  name="priceLibExpandByCodes"
                  maxTagCount={2}
                  maxTagTextLength={2}
                  maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
                />
                <Lov
                  name="templateIdsLov"
                  maxTagCount={2}
                  maxTagTextLength={2}
                  maxTagPlaceholder={(restValues) => `+${restValues.length}...`}
                />
                <TextField name="realName" />
                <DateTimePicker name="creationDate" />
                {/* <CheckBox name="enabledFlag" /> */}
                <TextField name="versionNum" disabled />
                <TextArea name="remark" colSpan={2} newLine resize="vertical" rows={6} />
              </Form>
            </div>
            <div className={style['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={style['rfx-card-item-title']}>
                {intl
                  .get(`ssrc.priceExpandStrategy.view.message.panel.conditionSetting`)
                  .d('条件设置')}
              </h3>
              <Table
                // className={style['draw-table']}
                customizedCode="SSRC.PRICE_EXPAND_STRATEGY.DETAIL.CONDITION_SETTING_TABLE"
                buttons={[
                  ['add', { onClick: () => this.handleAdd(this.policySettingRuleDs) }],
                  [
                    'delete',
                    {
                      icon: 'delete_sweep',
                      children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
                    },
                  ],
                ]}
                dataSet={this.policySettingRuleDs}
                columns={ruleListColumns}
                style={{
                  maxHeight: 420,
                }}
              />
            </div>
            <div className={style['custom-page-content']}>
              <h3 id="rfxBasicInfo" className={style['rfx-card-item-title']}>
                {intl.get(`ssrc.priceExpandStrategy.view.message.panel.expandScope`).d('拓展范围')}
              </h3>
              <Table
                customizedCode="SSRC.PRICE_EXPAND_STRATEGY.DETAIL.EXPAND_SCOPE_TABLE"
                buttons={[
                  ['add', { onClick: () => this.handleAddScope() }],
                  [
                    'delete',
                    {
                      icon: 'delete_sweep',
                      children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
                    },
                  ],
                ]}
                dataSet={this.policySettingScopeDs}
                columns={expandScopeColumns}
                style={{
                  maxHeight: 420,
                }}
              />
            </div>
          </div>
        </Content>
      </Fragment>
    );
  }
}
