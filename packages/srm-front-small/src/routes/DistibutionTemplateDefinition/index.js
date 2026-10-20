/* eslint-disable camelcase */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import qs from 'qs';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { uniqWith, isEqual, isUndefined } from 'lodash';
import { connect } from 'dva';
import { Tabs, Tag, Alert } from 'choerodon-ui';
import { Badge } from 'choerodon-ui';
import { DataSet, Modal, Button, Dropdown, Menu, Icon, Spin } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';
import { Observer } from 'mobx-react';
import { computed } from 'mobx';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { fetchLovViewInfo, fetchUseCustDim, fetchInvalidDim, fetchTemplateFieldConfig } from '@/services/templateDetail';
import { getTemplateStyle } from '@/utils/utils';
import { enabledService, publishStatus, unlockStatus } from '@/services/cartTemplateDefinitionService';

import HistoryVersion from '../CartTemplateDefinition/HistoryVersion';
import TemplateModal from './TemplateModal';
import {baseInfoDS, createDS, detailDS, mappingDs } from './tableDS';
import { flagNames, lovFieldSet } from './utils';
import BaseInfo from './BaseInfo';
import styles from './index.less';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['small.common', 'small.cartTemplate', 'hpfm.customize'],
})
@connect(({ templateDetailInfo }) => ({
  templateDetailInfo,
}))
@withProps(
  () => ({
    headerTableDs: new DataSet(createDS()),
    lineTableDs: new DataSet(createDS()),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class DistributionTemplateDefinition extends Component {
  // 基础信息
  baseInfoDs = new DataSet(baseInfoDS());

  // // 行ds
  // lineTableDs = new DataSet(createDS());

  // // 头ds
  // headerTableDs = new DataSet(createDS());

  // templateType = qs.parse(window.location.search.substr(1)).templateType;

  /* 模板id */
  // templateId;

  // readOnly = +qs.parse(window.location.search.substr(1)).readOnly;

  /* 分配头、行 */
  dimensionType = organizationId === 0 ? 'LINE_FIXED' : 'LINE_CUSTOMIZE';

  /* 编辑表单ds */
  editTemplateDS = new DataSet(detailDS());

  /** 映射关系表格 */
  mappingTableDs = new DataSet(mappingDs());

  @computed
  get headerBtns() {
    const { readOnly } = this.state;
    const { noChild } = qs.parse(window.location.search.substring(1)) || {};
    const { status, version, templateStyle, templateType } =
      this.baseInfoDs?.current?.get(['status', 'version', 'templateStyle', 'templateType']) || {};
    return [
      {
        name: intl.get('small.common.button.handle.publish').d('发布'),
        icon: 'publish2',
        color: 'primary',
        onClick: () => this.handlePublish(),
        show: !readOnly,
      },
      {
        name: intl.get('small.common.button.save').d('保存'),
        icon: 'save',
        funcType: 'flat',
        onClick: () => this.handleBaseInfoSave(),
        show: !readOnly,
      },
      {
        name: intl.get('small.common.button.edit').d('编辑'),
        icon: 'mode_edit',
        funcType: 'flat',
        onClick: () => this.handleHeaderEdit(),
        show: readOnly && templateType !== "PREDEFINED" && (status === 'UNPUBLISHED' || ['PUBLISHED', 'DISABLED'].includes(status) && +noChild),
      },
      {
        children: (
          <HistoryVersion
            beforeIconType="schedule"
            history={this.props.history}
            buttonProps={{ funcType: 'flat' }}
            templateStyle={templateStyle}
            dropdownProps={{placement: 'bottomRight'}}
          />
        ),
        show: version > 1 && ['PUBLISHED', 'DISABLED', 'INVALID'].includes(status),
      },
    ].filter(n => n.show || isUndefined(n.show));
  }

  constructor(props) {
    super(props);
    const { match } = props;
    const { params } = match;
    this.state = {
      // columns: this.originColumns.filter(n => (n.show || isUndefined(n.show))),
      currentTab: 'LINE',
      errorMsg: '',
      templateFieldConfigList: [],
      readOnly: +qs.parse(window.location.search.substr(1)).readOnly,
      templateId: params.templateId,
    };
  }

  componentDidMount() {
    this.initLoad();
  }

  componentWillReceiveProps(nextProps) {
    const { params } = nextProps.match;
    this.setState(params, () => {
      this.initLoad();
      this.props.lineTableDs.query();
      this.props.headerTableDs.query();
    });
  }

  initLoad() {
    const { templateId } = this.state;
    this.baseInfoDs.setQueryParameter('templateId', templateId);
    this.baseInfoDs.query();
    this.props.lineTableDs.setQueryParameter('templateId', templateId);
    this.props.lineTableDs.setQueryParameter('tabType', 'LINE');

    this.props.headerTableDs.setQueryParameter('templateId', templateId);
    this.props.headerTableDs.setQueryParameter('tabType', 'HEADER');

    if (organizationId === 0) return;
    this.getInvalidDims();
    this.getTemplateFieldConfig();
  }

  renderBadge({ record, name, text }) {
    const flagName = name.split('Meaning')[0];
    const flag = record.get(flagName);
    return <Badge color={flag ? '#3AB344' : '#f05434'} text={text} />;
  }

  getTableDs = _tabKey => {
    const tabKey = _tabKey || this.state.currentTab;
    return tabKey === 'LINE' ? this.props.lineTableDs : this.props.headerTableDs;
  };

  /* 切换tab栏 */
  switchTab(tabKey) {
    const tableDs = this.getTableDs(tabKey);
    tableDs.query(tableDs.currentPage);
    if (tabKey === 'LINE') {
      this.dimensionType = organizationId === 0 ? 'LINE_FIXED' : 'LINE_CUSTOMIZE';
      // this.setState({
      //   columns: this.originColumns.filter(n => !['colSeq', 'rowSeq'].includes(n.name)),
      // });
    } else {
      // this.originColumns.splice(
      //   14,
      //   2,
      //   {
      //     name: 'colSeq',
      //     width: 60,
      //   },
      //   {
      //     name: 'rowSeq',
      //     width: 60,
      //   }
      // );
      // this.setState({
      //   columns: this.originColumns,
      // });
      this.dimensionType = organizationId === 0 ? 'HEADER_FIXED' : 'HEADER_CUSTOMIZE';
    }
    this.setState({
      currentTab: tabKey,
    });
  }

  /* 编辑维度信息保存 */
  @Bind()
  async saveDimensionData(params, origin = {}) {
    const isValid = await this.editTemplateDS.validate();
    const isMappingValid = await this.mappingTableDs.validate();
    const {
      lovCode,
      componentType,
      componentTypeMeaning,
      colSeq,
      splitFlag,
      budgetFlag,
      rowSeq,
      conditionList,
      defaultCondition,
      dimensionCode,
      dimensionId,
      dimensionName,
      dimensionType,
      dimensionParameterList,
      dimensionFieldRelationList,
      displayFlag,
      editFlag,
      enabledFlag,
      necessaryFlag,
      orderSeq,
      templateId,
      width,
      fieldBinding,
      defaultValue_LOV = {},
      defaultType, // 特殊默认
      defaultValue_component = null,
      specialDefaultValue, // 适配器
      encryptFlag,
      productDimensionFlag,
      defaultValue_componentMeaning = null,
      mergeFlag,
      treeSelectFlag,
      translateFlag,
      batchFlag,
      _tls,
      annotation,
      fieldLengthObj,
      ...other
    } = params[0];
    // 特殊默认取适配器
    let defaultValue = defaultValue_component || null;
    let defaultValueMeaning = defaultValue_componentMeaning || null;
    window.smallCartLovViewInfoCache = window.smallCartLovViewInfoCache || {};
    if (componentType === 'LOV') {
      let viewInfo = {};
      if (lovCode && !window.smallCartLovViewInfoCache?.[lovCode]) {
        viewInfo = getResponse(await fetchLovViewInfo(lovCode)) || {};
        window.smallCartLovViewInfoCache[lovCode] = viewInfo;
      } else {
        viewInfo = window.smallCartLovViewInfoCache[lovCode] || {};
      }
      defaultValue = defaultValue_LOV?.[viewInfo.valueField] || null;
      defaultValueMeaning = defaultValue_LOV?.[viewInfo.displayField] || null;
    }
    if (componentType === 'SWITCH') {
      defaultValue = defaultValue_component || '0';
      defaultValueMeaning =
        defaultValue_component === '1'
          ? intl.get('hzero.common.status.yes').d('是')
          : intl.get('hzero.common.status.no').d('否');
    }
    const { dimension, dimensionComponent } = origin;
    const neededParams = {
      templateId: templateId || this.state.templateId,
      dimension: {
        ...dimension,
        dimensionType: dimensionType || this.dimensionType,
        dimensionCode,
        dimensionId,
        dimensionName,
        editFlag,
        displayFlag,
        enabledFlag,
        necessaryFlag,
        orderSeq,
        splitFlag,
        budgetFlag,
        width,
        colSeq,
        rowSeq,
        fieldBinding,
        mergeFlag,
        encryptFlag,
        productDimensionFlag,
        treeSelectFlag,
        translateFlag,
        batchFlag,
        _tls,
        annotation,
        ...(fieldLengthObj || {}),
      },
      dimensionComponent: {
        ...dimensionComponent,
        componentTypeMeaning,
        componentType,
        lovCode,
        defaultValue,
        defaultValueMeaning,
        defaultType,
        specialDefaultValue,
        importCheckFlag: defaultValue_LOV?.[flagNames.importCheckFlag] || 0,
      },
      defaultCondition,
      conditionList: uniqWith(conditionList, isEqual) || [],
      dimensionMappingList: this.mappingTableDs.toData(),
      dimensionParameterList,
      dimensionFieldRelationList,
      ...other,
    };
    const { dispatch } = this.props;
    if (isValid && isMappingValid) {
      const res = await dispatch({
        type: 'templateDetailInfo/saveDimensionData',
        payload: neededParams,
      });
      if (res && !res.failed) {
        notification.success();
        this.editTemplateDS.loadData([]);
        this.getTableDs().query();
        if (this.state.errorMsg) {
          this.getInvalidDims();
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /* 编辑购物车分配模板 */
  handleEdit(record, editEnable, isCreate) {
    const { dispatch } = this.props;
    const { templateId } = this.state;
    const templateType = this.baseInfoDs.current?.get('templateType');
    const fieldConfig =
      this.state.templateFieldConfigList.find(
        n =>
          n.dimensionCode === record.get('dimensionCode') &&
          n.dimensionType === record.get('dimensionType')
      ) || {};
    dispatch({
      type: 'templateDetailInfo/queryDetail',
      payload: record?.get('dimensionId'),
    }).then(async res => {
      if (!res) return;
      const {
        conditionList,
        defaultCondition,
        dimension,
        dimensionComponent,
        dimensionMapping,
        dimensionParameterList,
        dimensionFieldRelationList,
        dimensionMappingList = [],
        formulaCondition,
        formulaConditionFx,
      } = res || {};
      const {
        fieldBinding,
        splitFlag,
        budgetFlag,
        dimensionCode,
        dimensionName,
        enabledFlag,
        necessaryFlag,
        editFlag,
        displayFlag,
        orderSeq,
        width,
        dimensionId,
        dimensionType,
        rowSeq,
        colSeq,
        mergeFlag,
        encryptFlag,
        minLength,
        maxLength,
      } = dimension;
      const {
        componentTypeMeaning,
        lovCode,
        componentType,
        defaultValue,
        defaultValueMeaning,
        defaultType,
        specialDefaultValue,
        importCheckFlag,
      } = dimensionComponent;
      window.smallCartLovViewInfoCache = window.smallCartLovViewInfoCache || {};
      let viewInfo = {};
      if (componentType === 'LOV') {
        if (lovCode && !window.smallCartLovViewInfoCache?.[lovCode]) {
          viewInfo = getResponse(await fetchLovViewInfo(lovCode)) || {};
          window.smallCartLovViewInfoCache[lovCode] = viewInfo;
        } else {
          viewInfo = window.smallCartLovViewInfoCache[lovCode] || {};
        }
      }
      const currentDetail = {
        ...dimension,
        splitFlag,
        budgetFlag,
        fieldBinding,
        rowSeq,
        colSeq,
        mergeFlag,
        lovCode,
        dimensionParameterList,
        dimensionFieldRelationList,
        conditionList,
        defaultCondition,
        dimensionId,
        dimensionCode,
        dimensionName,
        enabledFlag,
        necessaryFlag,
        editFlag,
        displayFlag,
        orderSeq,
        width,
        componentType,
        defaultType,
        defaultValue,
        defaultValueMeaning,
        specialDefaultValue,
        encryptFlag,
        componentTypeMeaning,
        targetSystem: dimensionMapping?.targetSystem,
        targetFieldName: dimensionMapping?.targetFieldName,
        targetFieldCode: dimensionMapping?.targetFieldCode,
        templateId,
        lovCodeLov: lovCode
          ? {
              lovId: lovCode,
              lovCode,
              viewCode: lovCode,
            }
          : null,
        fieldLengthObj: { minLength, maxLength },
        formulaCondition,
        formulaConditionFx,
      };
      // lov的时候
      if (componentType === 'LOV') {
        currentDetail.defaultValue_LOV = {
          [viewInfo?.valueField]: defaultValue,
          [viewInfo?.displayField]: defaultValueMeaning,
          [flagNames.importCheckFlag]: importCheckFlag,
        };
      } else {
        currentDetail.defaultValue_component = defaultValue;
      }

      this.editTemplateDS.loadData([currentDetail]);

      if (importCheckFlag === 1) {
        lovFieldSet({
          record: this.editTemplateDS,
          lovViewInfo: viewInfo,
        });
        this.editTemplateDS.validate();
      }

      this.mappingTableDs.loadData(dimensionMappingList);
      this.mappingTableDs.setState('templateId', templateId);
      const detaiProps = {
        templateType,
        templateId,
        dimensionId,
        dimensionCode,
        conditionList,
        defaultCondition,
        dimensionParameterList,
        dimensionType,
        dataSet: this.editTemplateDS,
        mappingTableDs: this.mappingTableDs,
        editEnable,
        isCreate,
        fieldConfig,
        readOnly: this.state.readOnly,
      };
      const modal = Modal.open({
        // title: editEnable
        //   ? intl.get('small.common.button.dimensionEdit').d('维度管理')
        //   : intl.get('small.common.button.dimensionView').d('维度查看'),
        title: dimension.dimensionName,
        destroyOnClose: true,
        drawer: true,
        style: { width: 742 },
        key: 'editTemplate',
        okText: intl.get('small.common.modal.button.save').d('保存'),
        onOk: () => this.saveDimensionData(this.editTemplateDS.toData(), res),
        children: <TemplateModal {...detaiProps} />,
        afterClose: () => this.editTemplateDS.reset(),
        footer:
          !editEnable && !isCreate ? (
            <Button color="primary" onClick={() => modal.close()}>
              {intl.get('small.common.modal.buttom.button.close').d('关闭')}
            </Button>
          ) : (
            (okBtn, cancelBtn) => (
              <div>
                {okBtn}
                {cancelBtn}
              </div>
            )
          ),
      });
    });
  }

  /* 新建modal */
  @Bind()
  showCreateModal() {
    const { templateId } = this.state;
    this.editTemplateDS.loadData([]);
    this.mappingTableDs.loadData([]);
    this.mappingTableDs.setState('templateId', templateId);
    const detail = {
      dimensionType: this.dimensionType,
      dataSet: this.editTemplateDS,
      mappingTableDs: this.mappingTableDs,
      isCreate: true,
      templateId,
      readOnly: this.state.readOnly,
    };
    Modal.open({
      title: intl.get('small.common.modal.titile.createDimension').d('新建维度'),
      drawer: true,
      style: { width: 742 },
      key: 'editTemplate',
      okText: intl.get('small.common.modal.button.save').d('保存'),
      onOk: () => this.saveDimensionData(this.editTemplateDS.toData()),
      children: <TemplateModal {...detail} />,
    });
  }

  useCustDim = async () => {
    const res = getResponse(await fetchUseCustDim({ templateId: this.state.templateId }));
    if (res) {
      this.getTableDs().query();
      notification.success();
    }
  };

  getInvalidDims = async () => {
    const res = getResponse(await fetchInvalidDim({ templateId: this.state.templateId }));
    if (res) {
      const headerDims = [];
      const lineDims = [];
      res.forEach(f => {
        if (f.dimensionType.startsWith('LINE')) {
          lineDims.push(`【${f.dimensionName}】`);
        } else {
          headerDims.push(`【${f.dimensionName}】`);
        }
      });
      const headerMsg = headerDims.join('、');
      const lineMsg = lineDims.join('、');
      const errorMsg =
        headerMsg && lineMsg
          ? intl
              .get('small.cartTemplate.view.invalidDimMsg', { value1: headerMsg, value2: lineMsg })
              .d(
                `分配头维度${headerMsg}，以及分配行维度${lineMsg}存在无效的字段，请点击「维度名称」，对有报错的字段重新维护。`
              )
          : headerMsg
          ? intl
              .get('small.cartTemplate.view.invalidHeaderDimMsg', { value: headerMsg })
              .d(
                `分配头维度${headerMsg}存在无效的字段，请点击「维度名称」，对有报错的字段重新维护。`
              )
          : lineMsg
          ? intl
              .get('small.cartTemplate.view.invalidLineDimMsg', { value: lineMsg })
              .d(`分配行维度${lineMsg}存在无效的字段，请点击「维度名称」，对有报错的字段重新维护。`)
          : '';
      this.setState({
        errorMsg,
      });
    }
  };

  // 获取模板字段配置
  getTemplateFieldConfig = async () => {
    const res = getResponse(await fetchTemplateFieldConfig(getTemplateStyle()));
    if (res) {
      this.setState({
        templateFieldConfigList: res,
      });
    }
  };

  // 头上的编辑
  async handleHeaderEdit() {
    const { templateId, status } = this.baseInfoDs.current.get(["templateId", "status"]);
    if(['PUBLISHED', 'DISABLED'].includes(status)) {
      const res = getResponse(await unlockStatus(templateId));
      const params = qs.stringify({
        noChild: 0,
        readOnly: 0,
        parentDisabled: status === 'DISABLED' ? 1 : 0,
      });
      this.setState({
        readOnly: 0,
        templateId: res?.templateId,
      }, () => this.initLoad());
      this.props.history.push(
        `/small/cart-template-definition/distribution/${res?.templateId}/?${params}`
      );
    } else {
      this.setState({
        readOnly: 0,
      });
    }
  }

  // 启用禁用
  async handleEnabled({ record, dataSet }) {
    const params = {
      ...record.toData(),
      enabledFlag: Number(!record.get('enabledFlag')),
    };
    const res = getResponse(await enabledService(params));
    if(res) {
      dataSet.query(dataSet.currentPage);
    }
  }

  // 保存
  async handleBaseInfoSave(type) {
    if(!this.baseInfoDs.dirty){
      if(type !== 'submit'){
        notification.success();
      }
      return true;
    }
    const flag = await this.baseInfoDs.validate();
    if(flag) {
      return this.baseInfoDs.submit();
    } else {
      return false;
    }
  }

  // 发布
  handlePublish() {
    const { parentDisabled } = qs.parse(window.location.search.substring(1)) || {};
    const { templateId, templateStyle } = this.baseInfoDs.current?.get(["templateId", "templateStyle"]);
    const publish = async () => {
      const flag = await this.handleBaseInfoSave('submit');
      if(!flag) return;
      const res = getResponse(await publishStatus(templateId));
      if(res) {
        this.props.history.push(`/small/cart-template-definition/list?templateStyle=${templateStyle}`)
      }
    }
    if(+parentDisabled) {
      Modal.confirm({
        title: intl.get('small.common.view.tips').d('提示'),
        children: intl
          .get('small.common.view.enabled.confirm')
          .d('当前策略为禁用状态，发布后策略会变更为已发布状态，确认发布新版本吗？'),
        onOk: () => publish(),
      });
    } else {
      publish()
    }
  }

  render() {
    const { currentTab, errorMsg, readOnly } = this.state;
    const columns = [
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => {
          return (
            <Tag border={false} color={value ? 'green' : 'red'}>
              {value
                ? intl.get('small.common.tag.enable').d('已启用')
                : intl.get('small.common.tag.disable').d('已禁用')}
            </Tag>
          );
        },
      },
      {
        name: 'dimensionName',
        width: 150,
        renderer: ({ record, value }) => {
          return (
            <Button funcType='link' onClick={() => this.handleEdit(record, !readOnly, false)}>
              {value}
            </Button>
          );
        },
      },
      { name: 'dimensionCode', width: 150 },
      {
        name: 'dimensionTypeMeaning',
        align: 'left',
        width: 100,
        renderer: ({ record }) => {
          const customFlag = record.get('dimensionType').endsWith('CUSTOMIZE');
          return (
            <Tag border={false} color={customFlag ? 'blue' : 'gray'}>
              {customFlag
                ? intl.get(`small.common.model.custom`).d('自定义')
                : intl.get(`small.common.model.predefine`).d('预定义')}
            </Tag>
          );
        },
      },
      { name: 'componentTypeName', width: 100 },
      {
        name: 'displayFlagMeaning',
        align: 'left',
        width: 100,
        renderer: this.renderBadge,
      },
      {
        name: 'necessaryFlagMeaning',
        width: 100,
        renderer: this.renderBadge,
      },
      {
        name: 'editFlagMeaning',
        width: 100,
        renderer: this.renderBadge,
      },
      // {
      //   name: 'enabledFlagMeaning',
      //   width: 100,
      //   renderer: this.renderBadge,
      // },
      { name: 'splitFlagMeaning', width: 100, renderer: this.renderBadge },
      { name: 'budgetFlagMeaning', width: 100, renderer: this.renderBadge },
      {
        name: 'mergeFlagMeaning',
        width: 100,
        renderer: this.renderBadge,
      },
      {
        name: 'encryptFlagMeaning',
        width: 100,
        renderer: this.renderBadge,
      },
      {
        name: 'productDimensionFlagMeaning',
        width: 100,
        renderer: this.renderBadge,
      },
      {
        name: 'batchFlagMeaning',
        width: 100,
        renderer: this.renderBadge,
      },
      {
        name: 'colSeq',
        width: 60,
        show: currentTab === 'LINE',
      },
      {
        name: 'rowSeq',
        width: 60,
        show: currentTab === 'LINE',
      },
      {
        name: 'operation',
        header: intl.get('small.common.model.operation').d('操作'),
        width: 60,
        align: 'left',
        lock: 'right',
        show: !readOnly,
        command: ({ record, dataSet }) => {
          const { dimensionType, enabledFlag } = record.get(['dimensionType', 'enabledFlag']);
          const customFlag = dimensionType.endsWith('CUSTOMIZE');
          return customFlag
            ? [
                <Button onClick={() => this.handleEnabled({ record, dataSet })}>
                  {enabledFlag
                    ? intl.get('hzero.common.button.disabled').d('禁用')
                    : intl.get('hzero.common.enable').d('启用')}
                </Button>,
              ]
            : [];
        },
      },
    ].filter(n => (n.show || isUndefined(n.show)));
   
    const height = errorMsg ? 229 : 205;
    const title = !readOnly
      ? intl.get(`small.common.cart.view.dimensionManageView`).d('编辑购物车分配模板')
      : intl.get(`small.common.cart.view.dimensionManageEdit`).d('查看购物车分配模板');
    return (
      <>
        <Observer>
          {() => (
            <Header
              title={title}
              backPath={`/small/cart-template-definition/list?templateStyle=${this.baseInfoDs.current?.get('templateStyle')}`}
            >
              {this.headerBtns.map(btn => btn.children || <Button {...btn}>{btn.name}</Button>)}
            </Header>
          )}
        </Observer>
        {errorMsg && <Alert banner showIcon iconType="error" type="error" message={errorMsg} />}
        <Content className="template-list-content">
          <Tabs
            tabPosition="left"
            animated={false}
            defaultActiveKey="baseInfo"
            onChange={this.switchTab.bind(this)}
            className="template-list-content-tabs"
          >
            <TabPane
              tab={intl.get('small.common.view.title.baseInfo').d('基础信息')}
              key="baseInfo"
            >
              <BaseInfo dataSet={this.baseInfoDs} readOnly={readOnly} />
            </TabPane>
            <TabPane tab={intl.get('small.common.col.dimension').d('分配头维度')} key="HEADER">
              <SearchBarTable
                spin="true"
                searchCode={
                  organizationId === 0
                    ? 'TEMPLATE_DETAIL.FILTER_BAR'
                    : 'SMALL_TEMPLATE_DISTRIBUTE.SEARCH_BAR'
                }
                columns={columns}
                dataSet={this.props.headerTableDs}
                border={null}
                customizedCode="SMALL.CART.TEMPLDATE.DEFINITION_HEADER"
                style={{ maxHeight: `calc(100vh - ${height}px)` }}
                searchBarConfig={{
                  closeFilterSelector: true,
                  expandable: !readOnly,
                }}
                buttons={
                  readOnly
                    ? []
                    : [
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item onClick={() => this.showCreateModal()}>
                                {intl
                                  .get('small.cartTemplate.button.createCustDim')
                                  .d('新建自定义维度')}
                              </Menu.Item>
                              <Menu.Item onClick={() => this.useCustDim()}>
                                {intl
                                  .get('small.cartTemplate.button.useCustDim')
                                  .d('引用自定义采买维度')}
                              </Menu.Item>
                            </Menu>
                          }
                        >
                          <Button icon="playlist_add" funcType="flat">
                            {intl.get('small.common.button.create').d('新建')}
                            <Icon
                              type="expand_more"
                              style={{
                                marginLeft: 4,
                                marginTop: -2,
                                fontSize: '16px',
                              }}
                            />
                          </Button>
                        </Dropdown>,
                      ]
                }
              />
            </TabPane>
            <TabPane tab={intl.get('small.common.row.dimension').d('分配行维度')} key="LINE">
              <SearchBarTable
                spin="true"
                searchCode={
                  organizationId === 0
                    ? 'TEMPLATE_DETAIL.FILTER_BAR'
                    : 'SMALL_TEMPLATE_DISTRIBUTE.SEARCH_BAR'
                }
                columns={columns}
                dataSet={this.props.lineTableDs}
                border={null}
                customizedCode="SMALL.CART.TEMPLDATE.DEFINITION_LINE"
                style={{ maxHeight: `calc(100vh - ${height}px)` }}
                searchBarConfig={{
                  closeFilterSelector: true,
                  expandable: true,
                }}
                buttons={
                  readOnly
                    ? []
                    : [
                        <Button
                          icon="playlist_add"
                          funcType="flat"
                          onClick={() => this.showCreateModal()}
                          primary
                        >
                          {intl.get('small.common.button.create').d('新建')}
                        </Button>,
                      ]
                }
              />
            </TabPane>
          </Tabs>
          {/* </div> */}
        </Content>
      </>
    );
  }
}
