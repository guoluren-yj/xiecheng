/**
 * 价格库维度管理-租户
 * @date: 2020-06-08
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { Badge } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { isEmpty, isArray } from 'lodash';
import querystring from 'querystring';
// import { observer } from 'mobx-react-lite';
import { observer } from 'mobx-react';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { refreshTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import {
  savePriceLibDimensionOrg,
  referenceTemplateOrg,
  resetDimensionOrg,
  releasePriceLibOrg,
  enabledDimensionOrg,
  editPriceLibOrg,
} from '@/services/priceLibDimensionService';
import BasicDrawer from './BasicDrawer';
import ComputeDrawer from './ComputeDrawer';
import {
  queryFormDS,
  basicTableDS,
  computeTableDS,
  basicDrawerFormDS,
  basicDrawerMapDS,
  basicDrawerLinkDS,
  basicDrawerLovMapDS,
  basicDrawerLovParamDS,
  computeDrawerFormDS,
  computeDrawerRuleDS,
  referenceTemplateDS,
} from './lineDS';
import { operationDS } from '../operationDS';
import { viewConfigDS, warningDS, menuDS } from '../lineDS';

import {
  StatusRender,
  handleShowWarningModal,
  showViewConfig,
  showOperation,
  handleGenerateMenu,
  jumpPriceLibrary,
  handleJumpPriceLib,
} from '../utils';
import BasicInfoDS from './BasicInfo/store';
import BasicInfo from './BasicInfo';
import styles from './index.less';

// const { TabPane } = Tabs;

@formatterCollections({ code: ['ssrc.priceLibDimension', 'ssrc.common'] })
export default class Update extends Component {
  constructor(props) {
    super(props);
    const { templateId } = props.match.params;
    this.state = {
      templateId,
      // activityKey: 'BASIC', // 基础维度
      basicDrawerVisible: false, // 基础维度侧弹框显隐
      computeDrawerVisible: false, // 高阶维度侧弹框显隐
      editor: false, // 表格行编辑记录
      saveLoading: false, // 保存弹框loading
      releaseLoading: false, // 发布按钮loading
      viewOnly: false, // 查看行
    };
  }

  /**
   * @remember
   * 动态设置ds 是否可以勾选, 类属性初始化会在构造函数之前先执行
   * 控制是否可以编辑 case: `PENDING` - 未发布状态
   */
  enabledEdit =
    querystring.parse(this.props.location.search.substr(1)).templateStatus === 'PENDING';

  basicInfoDs = new DataSet(BasicInfoDS(this.enabledEdit));

  operationDs = new DataSet(operationDS());

  viewConfigDs = new DataSet(viewConfigDS());

  warningDS = new DataSet(warningDS());

  menuDs = new DataSet(menuDS());

  filterFormDs = new DataSet(queryFormDS());

  basicTableDs = new DataSet(basicTableDS());

  computeTableDs = new DataSet(computeTableDS());

  basicDrawerFormDs = new DataSet(basicDrawerFormDS());

  basicDrawerMapDs = new DataSet(basicDrawerMapDS(this.enabledEdit));

  basicDrawerLinkDs = new DataSet(basicDrawerLinkDS(this.enabledEdit));

  basicDrawerLovMapDs = new DataSet(basicDrawerLovMapDS(this.enabledEdit));

  basicDrawerLovParamDs = new DataSet(basicDrawerLovParamDS(this.enabledEdit));

  computeDrawerFormDs = new DataSet(computeDrawerFormDS());

  computeDrawerRuleDs = new DataSet(
    computeDrawerRuleDS(this.computeDrawerFormDs, this.enabledEdit)
  );

  operationDs = new DataSet(operationDS());

  referenceTemplateDs = new DataSet(referenceTemplateDS());

  componentDidMount() {
    const { templateId } = this.state;
    if (templateId) {
      this.basicInfoDs.setQueryParameter('templateId', templateId);
      this.basicTableDs.setQueryParameter('templateId', templateId);
      this.computeTableDs.setQueryParameter('templateId', templateId);
      this.basicDrawerLinkDs.setQueryParameter('templateId', templateId);
      this.basicDrawerLovMapDs.setQueryParameter('templateId', templateId);
      this.basicDrawerLovParamDs.setQueryParameter('templateId', templateId);
      this.basicInfoDs.query();
      this.basicTableDs.query();
      this.computeTableDs.query();
    }
  }

  /**
   * 查询
   */
  // @Bind()
  // search() {
  //   const queryParams = this.filterFormDs.toData()[0];
  //   this.basicTableDs.setQueryParameter('queryParams', queryParams);
  //   this.computeTableDs.setQueryParameter('queryParams', queryParams);
  //   this.basicTableDs.query();
  //   this.computeTableDs.query();
  // }

  /**
   *价格库弹框保存
   */
  @Bind()
  async handleOkDrawer(activityKey) {
    /**
     * @remember
     * 当状态不为 `PENDING` 即非可编辑状态, 直接return
     */
    if (!this.enabledEdit) {
      this.handleCancelDrawer(activityKey);
      return;
    }

    const { templateId } = this.state;
    let flag = false;
    let params = {};
    if (activityKey === 'BASIC') {
      flag =
        (await this.basicDrawerFormDs.validate()) &&
        (await this.basicDrawerMapDs.validate()) &&
        (await this.basicDrawerLinkDs.validate()) &&
        (await this.basicDrawerLovMapDs.validate()) &&
        (await this.basicDrawerLovParamDs.validate());
      const data = this.basicDrawerFormDs.toData()[0] || {};
      params = {
        templateId,
        dimensionType: 'BASIC',
        ...data,
        defaultValue: data.defaultValue,
        priceLibTmplDimRelList: this.basicDrawerMapDs.toData(),
        priceLibDimLinkList: data.fieldWidget === 'LINK' ? this.basicDrawerLinkDs.toData() : [],
        priceLibDimMapList: data.fieldWidget === 'LOV' ? this.basicDrawerLovMapDs.toData() : [],
        priceLibLovParamList:
          data.fieldWidget === 'LOV' || data.fieldWidget === 'SELECT'
            ? this.basicDrawerLovParamDs.toData()
            : [],
      };
    } else {
      flag =
        (await this.computeDrawerFormDs.validate()) && (await this.computeDrawerRuleDs.validate());
      const data = this.computeDrawerFormDs.toData()[0] || {};
      const priceLibRuleLinkList = this.computeDrawerRuleDs.toData().map((item) => {
        return {
          ...item,
          sourceFrom: 'DIMENSION',
          sourceFromId: data.dimensionId,
          appointValueLov: item.appointType === 'SCOPE' ? item.appointValueLov : null,
        };
      });
      params = {
        templateId,
        dimensionType: 'COMPUTE',
        ...data,
        priceLibRuleLineList: data.triggerType === 'LINK' ? priceLibRuleLinkList : [],
      };
    }

    if (flag) {
      this.setState({
        saveLoading: true,
      });
      const result = getResponse(await savePriceLibDimensionOrg(params));
      this.setState({
        saveLoading: false,
      });
      if (result) {
        notification.success();
        this.handleCancelDrawer(activityKey);
        if (activityKey === 'BASIC') {
          this.basicTableDs.query(this.basicTableDs.currentPage);
        } else {
          this.computeTableDs.query(this.computeTableDs.currentPage);
        }
      }
    }
  }

  /**
   * 重置维度
   */
  @Bind()
  async resetDimension(record, activityKey) {
    // const { activityKey } = this.state;
    const params = { dimensionId: record.toData().dimensionId };
    const result = getResponse(await resetDimensionOrg(params));
    if (result) {
      notification.success();
      if (activityKey === 'BASIC') {
        this.basicTableDs.query(this.basicTableDs.currentPage);
      } else {
        this.computeTableDs.query(this.computeTableDs.currentPage);
      }
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate(activityKey) {
    // 新建状态下，create
    if (activityKey === 'BASIC') {
      this.setState({
        basicDrawerVisible: true,
      });
      this.basicDrawerFormDs.loadData(); // fix: 修复缓存编辑的行数据
      this.basicDrawerFormDs.create({});
    } else {
      this.setState({
        computeDrawerVisible: true,
      });
      this.computeDrawerFormDs.loadData(); // fix: 修复缓存编辑的行数据
      this.computeDrawerFormDs.create({});
    }
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
      this.jumpTemplateDetail(result[0]);
      // 路由是一样的，只有参数不同，直接刷新Tab
      refreshTab();
    }
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.basicInfoDs.validate();
    if (flag) {
      this.setState({
        releaseLoading: true,
      });
      const res = getResponse(
        await this.basicInfoDs.submit().finally(() => {
          this.setState({
            releaseLoading: false,
          });
        })
      );
      if (res) {
        const { content } = res;
        const { templateId } = this.state;
        // 未保存且返回有值
        if (!templateId && isArray(content) && content[0]) {
          this.jumpTemplateDetail(content[0]);
        } else {
          this.basicInfoDs.query();
        }
      }
    }
  }

  /**
   * 跳转模板明细页面
   */
  @Bind()
  jumpTemplateDetail(data) {
    const { history } = this.props;
    if (data) {
      const { templateId, templateStatus } = data;
      history.push({
        pathname: `/ssrc/price-lib-dimension-org/update/${templateId}`,
        search: querystring.stringify({
          templateStatus,
        }),
      });
    } else {
      history.push({
        pathname: `/ssrc/price-lib-dimension-org/list`,
      });
    }
  }

  /**
   * 关闭
   */
  @Bind()
  handleCancelDrawer(activityKey) {
    if (activityKey === 'BASIC') {
      this.setState({
        basicDrawerVisible: false,
        editor: false,
        viewOnly: false,
      });
      this.basicDrawerFormDs.reset();
      // 重置Field动态属性!!!
      this.basicDrawerFormDs.getField('defaultValueLov').reset();
      this.basicDrawerFormDs.getField('defaultValueMeaning').reset();
      this.basicDrawerFormDs.getField('defaultValueCode').reset();
      this.basicDrawerMapDs.loadData([]);
      this.basicDrawerLinkDs.loadData([]);
      this.basicDrawerLovMapDs.loadData([]);
      this.basicDrawerLovParamDs.loadData([]);
    } else {
      this.setState({
        computeDrawerVisible: false,
        editor: false,
        viewOnly: false,
      });
      this.computeDrawerFormDs.loadData([]);
      this.computeDrawerRuleDs.loadData([]);
    }
  }

  /**
   * 编辑
   */
  @Bind()
  async handleEdit(record, viewOnly, activityKey) {
    const selection = viewOnly ? false : 'multiple';
    const data = record.toData();
    if (activityKey === 'BASIC') {
      this.setState({
        viewOnly,
        basicDrawerVisible: true,
        editor: true,
      });
      this.basicDrawerMapDs.selection = selection;
      this.basicDrawerLinkDs.selection = selection;
      this.basicDrawerLovMapDs.selection = selection;
      this.basicDrawerLovParamDs.selection = selection;

      this.basicDrawerFormDs.setQueryParameter('dimensionId', data.dimensionId);
      this.basicDrawerFormDs.query();
      this.basicDrawerMapDs.setQueryParameter('dimensionId', data.dimensionId);
      this.basicDrawerMapDs.query();
      if (data.fieldWidget === 'LINK') {
        this.basicDrawerLinkDs.setQueryParameter('dimensionId', data.dimensionId);
        this.basicDrawerLinkDs.query();
      } else if (data.fieldWidget === 'LOV') {
        this.basicDrawerLovMapDs.setQueryParameter('dimensionId', data.dimensionId);
        this.basicDrawerLovMapDs.query();
        this.basicDrawerLovParamDs.setQueryParameter('dimensionId', data.dimensionId);
        this.basicDrawerLovParamDs.query();
      } else if (data.fieldWidget === 'SELECT') {
        this.basicDrawerLovParamDs.setQueryParameter('dimensionId', data.dimensionId);
        this.basicDrawerLovParamDs.query();
      }
      // 设置组件类型的值
      this.drawerRef.setState({
        fieldWidgetValue: data.fieldWidget,
      });
    } else {
      this.setState({
        viewOnly,
        computeDrawerVisible: true,
        editor: true,
      });
      this.computeDrawerRuleDs.selection = selection;

      this.computeDrawerFormDs.setQueryParameter('dimensionId', data.dimensionId);
      const queryFlag = await this.computeDrawerFormDs.query();
      if (data.dimensionCode === 'relevantPrice' && data.triggerType === 'LINK' && queryFlag) {
        // 相关价格，计算逻辑不用后端赋值，前端遍历产生
        this.computeDrawerRuleDs.setQueryParameter('sourceFromId', data.dimensionId);
        this.computeDrawerRuleDs.setQueryParameter('templateId', this.state.templateId);
        this.computeDrawerRuleDs.query();
      }
    }
  }

  /**
   * 引用预置模板 - 确定
   */
  @Bind()
  async handleOkReference() {
    const { templateId } = this.state;
    if (isEmpty(this.referenceTemplateDs.selected)) {
      notification.warning({
        message: intl.get('ssrc.priceLibDimension.view.notification.template').d('请选择一条模板'),
      });
      return false;
    }

    const result = getResponse(
      await referenceTemplateOrg({
        ...this.referenceTemplateDs.selected[0].toData(),
        orgParentTemplateId: templateId,
      })
    );
    if (result) {
      notification.success();
      this.referenceTemplateDs.unSelect(this.referenceTemplateDs.selected[0]);
      this.basicTableDs.query();
      this.computeTableDs.query();
    } else {
      return false;
    }
  }

  /**
   * 引用预置模板
   */
  @Bind()
  handleReference() {
    this.referenceTemplateDs.query();

    const templateColumns = [
      {
        name: 'templateCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'templateName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'templateType',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'remark',
        width: 120,
        tooltip: 'overflow',
      },
    ];
    Modal.open({
      destroyOnClose: true,
      key: Modal.key(),
      title: intl.get('ssrc.priceLibDimension.view.message.referPresetTemplates').d('引用预置模板'),
      style: {
        width: 680,
      },
      children: (
        <Table dataSet={this.referenceTemplateDs} columns={templateColumns} queryFieldsLimit={2} />
      ),
      onOk: this.handleOkReference,
      onCancel: () => {},
      afterClose: () => this.referenceTemplateDs.props.queryDataSet.reset(),
    });
  }

  /**
   * 改变tab标签
   */
  // @Bind()
  // changeTabs(activityKey) {
  //   this.setState({
  //     activityKey,
  //   });
  // }

  /**
   * 操作记录
   */
  // @Bind()
  // showOperation(record) {
  //   this.operationDs.setQueryParameter('queryParams', {
  //     docType: 'DIMENSION',
  //     docId: record.toData().dimensionId,
  //   });

  //   this.operationDs.query();

  //   const operateColumns = [
  //     {
  //       name: 'actionName',
  //       width: 100,
  //     },
  //     {
  //       name: 'actionDetail',
  //       width: 250,
  //       tooltip: 'overflow',
  //     },
  //     {
  //       name: 'realName',
  //       width: 100,
  //     },
  //     {
  //       name: 'creationDate',
  //       width: 120,
  //     },
  //   ];
  //   Modal.open({
  //     key: Modal.key(),
  //     title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
  //     style: {
  //       width: 680,
  //     },
  //     children: <Table dataSet={this.operationDs} columns={operateColumns} />,
  //     onOk: () => { },
  //     onCancel: () => { },
  //   });
  // }

  @Bind
  handleReset(record, activityKey) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('ssrc.priceLibDimension.view.confirm.reset').d('是否确认重置？'),
      onOk: () => this.resetDimension(record, activityKey),
    });
  }

  @Bind()
  async handleEnable(record, activityKey) {
    // const { activityKey } = this.state;
    const params = record.toData();
    const result = getResponse(await enabledDimensionOrg(params));
    if (result) {
      notification.success();
      if (activityKey === 'BASIC') {
        this.basicTableDs.query(this.basicTableDs.currentPage);
      } else {
        this.computeTableDs.query(this.computeTableDs.currentPage);
      }
    }
  }

  @Bind
  renderAction({ record }, activityKey) {
    return (
      <span className="action-link">
        {this.enabledEdit && (
          <>
            <a onClick={() => this.handleEdit(record, false, activityKey)}>
              {intl.get('hzero.common.button.editor').d('编辑')}
            </a>
            <a>
              <Button
                type="c7n-pro"
                funcType="link"
                color="primary"
                style={{ verticalAlign: 'baseline' }}
                disabled={
                  activityKey === 'BASIC' &&
                  (record.get('alwayEnabledFlag') === 1 ||
                    record.get('sameGroupFlag') ||
                    record.get('dimensionCode') === 'priceLibNumber' ||
                    record.get('dimensionCode') === 'benchmarkPriceType' ||
                    (record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE' &&
                      record.get('dimensionCode') === 'taxIncludedPrice') ||
                    (record.get('benchmarkPriceType') === 'NET_PRICE' &&
                      record.get('dimensionCode') === 'netPrice'))
                }
                onClick={() => this.handleEnable(record, activityKey)}
              >
                {record.get('enabledFlag') === 0
                  ? intl.get('hzero.common.status.enable').d('启用')
                  : intl.get('hzero.common.status.disable').d('禁用')}
              </Button>
            </a>
            {record.toData().changedFlag && record.toData().dimensionFrom === 'FIXED' ? (
              <a onClick={() => this.handleReset(record, activityKey)}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </a>
            ) : null}
          </>
        )}
        {record.status !== 'add' && (
          <a onClick={() => showOperation(record, 'DIMENSION')}>
            {intl.get('ssrc.priceLibDimension.model.dimension.operation').d('操作记录')}
          </a>
        )}
      </span>
    );
  }

  get listColumns() {
    return [
      {
        name: 'enabledFlag',
        width: 80,
        renderer: ({ value }) => StatusRender(value),
      },
      {
        name: 'dimensionCode',
        width: 120,
        renderer: ({ record, value }) => (
          <a onClick={() => this.handleEdit(record, true, 'BASIC')}>{value}</a>
        ),
      },
      {
        name: 'dimensionFromMeaning',
        width: 80,
      },
      {
        name: 'dimensionCategoryMeaning',
        width: 120,
      },
      {
        name: 'dimensionName',
        width: 150,
        renderer: ({ value, record }) => {
          if (record.toData().changedFlag) {
            return <Badge status="error" text={value} />;
          } else {
            return value;
          }
        },
      },
      {
        name: 'sameGroupFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldRequired',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldEditable',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldBatchEditable',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldVisible',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'queryFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'preDisplayFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'autoScopeFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'mobileShowFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'priceDistributionFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'gridSeq',
        width: 100,
      },
      {
        name: 'gridWidth',
        width: 100,
      },
      {
        name: 'fieldWidgetMeaning',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'sourceCode',
        width: 250,
        tooltip: 'overflow',
      },
      {
        name: 'textMaxLength',
        width: 100,
      },
      {
        name: 'textMinLength',
        width: 100,
      },
      {
        name: 'customCheck',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'action',
        width: this.enabledEdit ? 220 : 80,
        lock: 'right',
        renderer: (param) => this.renderAction(param, 'BASIC'),
      },
    ];
  }

  get comListColumns() {
    return [
      {
        name: 'enabledFlag',
        width: 80,
        renderer: ({ value }) => StatusRender(value),
      },
      {
        name: 'dimensionCode',
        width: 120,
        renderer: ({ record, value }) => (
          <a onClick={() => this.handleEdit(record, true)}>{value}</a>
        ),
      },
      {
        name: 'dimensionFromMeaning',
        width: 80,
      },
      {
        name: 'dimensionCategoryMeaning',
        width: 120,
      },
      {
        name: 'dimensionName',
        width: 150,
        renderer: ({ value, record }) => {
          if (record.toData().changedFlag) {
            return <Badge status="error" text={value} />;
          } else {
            return value;
          }
        },
      },
      {
        name: 'computeLogic',
        width: 120,
      },
      {
        name: 'triggerTypeMeaning',
        width: 120,
      },
      {
        name: 'computeFunction',
        width: 120,
      },
      {
        name: 'gridSeq',
        width: 100,
      },
      {
        name: 'gridWidth',
        width: 100,
      },
      {
        name: 'fieldRequired',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldVisible',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'queryFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'action',
        width: this.enabledEdit ? 220 : 80,
        lock: 'right',
        renderer: this.renderAction,
      },
    ];
  }

  /**
   * 发布
   */
  @Bind()
  async handleRelease(record) {
    const { templateId } = this.state;
    const flag = await this.basicInfoDs.validate();
    if (flag) {
      this.setState({ releaseLoading: true });
      const params = [{ ...record.toData() }];
      releasePriceLibOrg(params)
        .then((res) => {
          const result = getResponse(res);
          if (result) {
            notification.success();
            const { menuId } = params[0];
            // 已经生成过菜单，返回列表页面
            if (menuId) {
              this.jumpTemplateDetail();
            } else {
              // 未生成过菜单，刷新页面即可
              this.jumpTemplateDetail({
                templateId,
                templateStatus: 'RELEASED',
              });
              refreshTab();
            }
          }
        })
        .finally(() => {
          this.setState({
            releaseLoading: false,
          });
        });
    }
  }

  @Bind()
  okCallback() {
    this.basicInfoDs.query();
  }

  @Bind
  renderHeaderButtons() {
    const { templateId, releaseLoading } = this.state;
    let Buttons = <></>;

    if (!templateId) {
      Buttons = () => (
        <Button
          icon="save"
          color="primary"
          funcType="raised"
          loading={releaseLoading}
          onClick={this.handleSave}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      );
    } else {
      Buttons = observer(({ dataSet }) => {
        const currentRecord = dataSet.current;
        const { templateStatus, menuId, latestFlag, versionNum } =
          currentRecord?.get(['templateStatus', 'menuId', 'latestFlag', 'versionNum']) || {};
        const buttons = [
          this.enabledEdit && {
            name: 'release',
            btnType: 'c7n-pro',
            btnProps: {
              loading: releaseLoading,
              funcType: 'raised',
              icon: 'publish2',
              color: 'primary',
              onClick: () => this.handleRelease(currentRecord),
            },
            child: intl.get('hzero.common.button.publish').d('发布'),
          },
          this.enabledEdit && {
            name: 'save',
            btnType: 'c7n-pro',
            btnProps: {
              loading: releaseLoading,
              funcType: 'flat',
              icon: 'save',
              onClick: this.handleSave,
            },
            child: intl.get('hzero.common.button.save').d('保存'),
          },
          this.enabledEdit &&
            versionNum === 1 && {
              name: 'reference',
              btnType: 'c7n-pro',
              btnProps: {
                loading: releaseLoading,
                funcType: 'flat',
                icon: 'application_allocation',
                onClick: this.handleReference,
              },
              child: intl
                .get('ssrc.priceLibDimension.view.button.referPresetTemplates')
                .d('引用预置模板'),
            },
          templateStatus === 'RELEASED' &&
            latestFlag !== 'Y' && {
              name: 'edit',
              btnType: 'c7n-pro',
              btnProps: {
                funcType: 'flat',
                icon: 'mode_edit',
                onClick: () => this.handleUnlock(currentRecord),
              },
              child: intl.get('hzero.common.button.edit').d('编辑'),
            },
          templateStatus === 'RELEASED' &&
            !menuId && {
              name: 'generateMenu',
              btnType: 'c7n-pro',
              btnProps: {
                funcType: 'raised',
                icon: 'publish2',
                color: 'primary',
                onClick: () =>
                  handleGenerateMenu(currentRecord, this.menuDs, this.jumpTemplateDetail),
              },
              child: intl.get('ssrc.priceLibDimension.view.button.generateMenu').d('生成菜单'),
            },
          {
            name: 'generateMenu',
            btnType: 'c7n-pro',
            btnProps: {
              funcType: 'flat',
              icon: 'settings_applications',
              onClick: () =>
                showViewConfig(
                  currentRecord,
                  this.viewConfigDs,
                  this.okCallback,
                  !this.enabledEdit
                ),
            },
            child: this.enabledEdit
              ? intl.get('ssrc.priceLibDimension.view.button.viewConfiguration').d('价格视图配置')
              : intl
                  .get('ssrc.priceLibDimension.view.button.lookViewConfiguration')
                  .d('查看视图配置'),
          },
          {
            name: 'expirationWarning',
            btnType: 'c7n-pro',
            btnProps: {
              funcType: 'flat',
              icon: 'error',
              onClick: () =>
                handleShowWarningModal(
                  currentRecord,
                  this.warningDS,
                  this.okCallback,
                  !this.enabledEdit
                ),
            },
            child: intl.get('ssrc.priceLibDimension.view.button.expirationWarning').d('到期预警'),
          },
          templateStatus === 'RELEASED' &&
            menuId && {
              name: 'jumpPriceLibrary',
              btnType: 'c7n-pro',
              btnProps: {
                funcType: 'flat',
                icon: 'redo',
                onClick: () => handleJumpPriceLib(currentRecord),
              },
              child: intl
                .get('ssrc.priceLibDimension.view.button.jumpPriceLibrary')
                .d('跳转价格库'),
            },
          ((templateStatus === 'PENDING' && menuId) || templateStatus === 'DISABLE') && {
            name: 'jumpPriceLibrary',
            btnType: 'c7n-pro',
            btnProps: {
              funcType: 'flat',
              icon: 'find_in_page',
              onClick: () => jumpPriceLibrary(currentRecord),
            },
            child: intl
              .get('ssrc.priceLibDimension.view.button.priceLibraryPreview')
              .d('价格库预览'),
          },
          {
            name: 'operation',
            btnType: 'c7n-pro',
            btnProps: {
              funcType: 'flat',
              icon: 'operation_service_request',
              onClick: () => showOperation(currentRecord),
            },
            child: intl.get('ssrc.priceLibDimension.view.button.operation').d('操作记录'),
          },
        ].filter(Boolean);
        return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
      });
    }
    return <Buttons dataSet={this.basicInfoDs} />;
  }

  getTableButtons(activityKey) {
    return this.enabledEdit ? [['add', { onClick: () => this.handleCreate(activityKey) }]] : [];
  }

  // @Bind
  // renderFilterForm() {
  //   return (
  //     <div style={{ display: 'flex', marginBottom: '16px', alignItems: 'flex-start' }}>
  //       <Form
  //         dataSet={this.filterFormDs}
  //         columns={3}
  //         onKeyDown={(e) => {
  //           if (e.keyCode === 13) return this.search();
  //         }}
  //         labelLayout="float"
  //         style={{ flex: '1 1 auto' }}
  //       >
  //         <Select name="dimensionCategory" />
  //         <TextField name="dimensionCodeOrName" />
  //         <Select name="enabledFlag" />
  //       </Form>
  //       <div style={{ marginLeft: '16px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
  //         <Button onClick={() => this.filterFormDs.current.reset()}>
  //           {intl.get('hzero.common.button.reset').d('重置')}
  //         </Button>
  //         <Button dataSet={null} color="primary" onClick={this.search}>
  //           {intl.get('hzero.common.button.search').d('查询')}
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  render() {
    const {
      // activityKey = 'BASIC',
      basicDrawerVisible = false,
      computeDrawerVisible = false,
      editor = false,
      saveLoading = false,
      templateId,
      viewOnly,
    } = this.state;

    const basicDrawerProps = {
      editor,
      saveLoading,
      templateId: this.state.templateId,
      visible: basicDrawerVisible,
      enabledEdit: this.enabledEdit && !viewOnly,
      basicDrawerFormDs: this.basicDrawerFormDs,
      basicDrawerMapDs: this.basicDrawerMapDs,
      basicDrawerLinkDs: this.basicDrawerLinkDs,
      basicDrawerLovMapDs: this.basicDrawerLovMapDs,
      basicDrawerLovParamDs: this.basicDrawerLovParamDs,
      onOk: () => this.handleOkDrawer('BASIC'),
      onCancel: () => this.handleCancelDrawer('BASIC'),
      onRef: (node) => {
        this.drawerRef = node;
      },
    };

    const computeDrawerProps = {
      editor,
      saveLoading,
      visible: computeDrawerVisible,
      enabledEdit: this.enabledEdit && !viewOnly,
      computeDrawerFormDs: this.computeDrawerFormDs,
      computeDrawerRuleDs: this.computeDrawerRuleDs,
      onOk: this.handleOkDrawer,
      onCancel: this.handleCancelDrawer,
    };

    const basicInfoProps = {
      templateId,
      isEdit: this.enabledEdit,
      dataSet: this.basicInfoDs,
    };

    const title = !templateId
      ? intl.get('ssrc.priceLibDimension.view.title.createPriceLib').d('新建价格库')
      : this.enabledEdit
      ? intl.get('ssrc.priceLibDimension.view.title.editPriceLib').d('编辑价格库')
      : intl.get('ssrc.priceLibDimension.view.title.viewPriceLib').d('查看价格库');

    return (
      <Fragment>
        <Header title={title} backPath="/ssrc/price-lib-dimension-org/list">
          {this.renderHeaderButtons()}
        </Header>
        {!templateId && (
          <Content style={{ padding: '20px' }}>
            <h3 id="rfxBasicInfo" className={styles['create-base']}>
              {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
            </h3>
            <BasicInfo {...basicInfoProps} />
          </Content>
        )}
        {templateId && (
          <Content className={classnames('ued-detail-wrapper', styles['update-container'])}>
            <div className={styles['rfx-detail-list-card']}>
              <div className={styles['custom-page-content']}>
                <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                  {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
                </h3>
                <BasicInfo {...basicInfoProps} />
              </div>
              <div className={styles['custom-page-content']}>
                <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                  {intl.get('ssrc.priceLibDimension.view.tab.basicDimension').d('基础维度')}
                </h3>
                <FilterBarTable
                  style={{ maxHeight: 'calc(100vh - 190px)' }}
                  customizable
                  customizedCode="SSRC.PRICE_LIB_DIMENSION.UPDATE.BASIC_TABLE"
                  dataSet={this.basicTableDs}
                  buttons={this.getTableButtons('BASIC')}
                  columns={this.listColumns}
                  filterBarConfig={{
                    autoQuery: false,
                    // collpaseble: !!this.enabledEdit,
                    sortFieldName: 'orderField',
                    defaultSortedField: 'gridSeq',
                    defaultSortedOrder: 'asc',
                  }}
                />
              </div>
              <div className={styles['custom-page-content']}>
                <h3 id="rfxBasicInfo" className={styles['rfx-card-item-title']}>
                  {intl.get('ssrc.priceLibDimension.view.tab.higherDimension').d('高阶维度')}
                </h3>
                <FilterBarTable
                  style={{ maxHeight: 'calc(100vh - 190px)' }}
                  customizable
                  customizedCode="SSRC.PRICE_LIB_DIMENSION.UPDATE.HIGHER_TABLE"
                  dataSet={this.computeTableDs}
                  buttons={this.getTableButtons()}
                  columns={this.comListColumns}
                  filterBarConfig={{
                    autoQuery: false,
                    // collpaseble: !!this.enabledEdit,
                    sortFieldName: 'orderField',
                    defaultSortedField: 'gridSeq',
                    defaultSortedOrder: 'asc',
                  }}
                />
              </div>
            </div>
          </Content>
        )}
        <BasicDrawer {...basicDrawerProps} />
        <ComputeDrawer {...computeDrawerProps} />
      </Fragment>
    );
  }
}
