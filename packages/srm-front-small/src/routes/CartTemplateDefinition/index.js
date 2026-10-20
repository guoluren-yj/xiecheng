import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import {
  DataSet,
  Modal,
  Form,
  TextField,
  Dropdown,
  Button,
  IntlField,
  Table
} from 'choerodon-ui/pro';
import { Tag, Icon, Menu, Spin, Tabs, Tooltip, Alert } from 'choerodon-ui';
import { connect } from 'dva';
import qs from 'qs';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import { useModal } from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import { openUnitTree } from '@/components/UnitTreeModal';
import notification from 'utils/notification';
import request from 'utils/request';
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'utils/utils';
import { getTemplateStyle } from '@/utils/utils';
import { operationRender } from '@/utils/renderer';

import { tableDs, editDS, recordDS, cloneDS, createDS } from './tableDS';
import HistoryModal from './HistoryModal';
import HistoryVersion from './HistoryVersion';
import './index.less';

const { TabPane } = Tabs;

const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: ['small.common', 'small.CartTemplate'],
})
@connect(({ cartDefinition, loading }) => ({
  cartDefinition,
  loading,
}))
@withProps(
  () => ({
    standardDs: new DataSet(tableDs("STANDARD")),
    punchoutDs: new DataSet(tableDs("PUNCHOUT")),
    opencartDs: new DataSet(tableDs("OPENCART")),
    receivedDs: new DataSet(tableDs("RECEIVED")),
  }),
  {
    cacheState: true,
  },
)
export default class CartTemplateDefinition extends Component {
  /* 表格ds */
  tableDS;

  /* 编辑ds */
  changeDS = new DataSet(editDS());

  /* 操作记录ds */
  handleDS = new DataSet(recordDS());

  /* 新建模板ds */
  addDS = new DataSet(createDS());

  state = {
    visiable: true,
    activeKey: 'STANDARD',
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'cartDefinition/updateState',
      payload: { templateStyle: getTemplateStyle() },
    });
    if (isTenantRoleLevel()) {
      this.props.dispatch({
        type: 'cartDefinition/checkCommonConfig',
      });
    } else {
      this.props.dispatch({
        type: 'cartDefinition/updateState',
        payload: {
          showOpenCart: true,
        },
      });
    }
    this.handleTabChange(getTemplateStyle());
  }

  handleTabChange(key) {
    const { standardDs, punchoutDs, opencartDs, receivedDs } = this.props;
    this.setState({
      activeKey: key,
    });
    switch (key) {
      case 'STANDARD':
        this.tableDS = standardDs;
        break;
      case 'PUNCHOUT':
        this.tableDS = punchoutDs;
        break;
      case 'OPENCART':
        this.tableDS = opencartDs;
        break;
      case 'RECEIVED':
        this.tableDS = receivedDs;
        break;
      default:
        this.tableDS = standardDs;
        break;
    }
    this.tableDS.query();
  }

  /* 创建模板 */
  showCreateModal() {
    this.addDS.reset();
    Modal.open({
      title: intl.get('small.common.create.cart.modal').d('新建购物车分配模板'),
      drawer: true,
      size: 'small',
      okText: intl.get('small.common.button.save').d('保存'),
      children: (
        <Form dataSet={this.addDS} labelWidth="auto" labelLayout="float">
          <TextField name="templateCode" />
          <IntlField name="templateName" />
          <IntlField name="remark" />
        </Form>
      ),
      onOk: () => this.saveCreateTemplateData(),
    });
  }

  @Bind()
  async saveCreateTemplateData() {
    const flag = await this.addDS.validate();
    if (flag) {
      this.addDS.submit();
      this.tableDS.query();
    } else {
      return false;
    }
  }

  @Bind()
  async saveEditTemplateData() {
    const flag = await this.changeDS.validate();
    if (flag) {
      this.changeDS.submit().then(() => {
        this.tableDS.query();
      });
    } else {
      return false;
    }
  }

  /* 编辑模板 */
  showEditModal(record) {
    this.changeDS.loadData([record.data]);
    Modal.open({
      title: intl.get('small.common.edit.modal').d('编辑购物车分配模板'),
      drawer: true,
      size: 'small',
      okText: intl.get('small.common.button.save').d('保存'),
      children: (
        <Form dataSet={this.changeDS} labelWidth="auto" labelLayout="float">
          <TextField name="templateCode" disabled />
          <IntlField name="templateName" />
          <IntlField name="remark" />
        </Form>
      ),
      onOk: () => this.saveEditTemplateData(),
      onCancel: () => this.changeDS.loadData([]),
    });
  }

  /* 启用、禁用 */
  handleEnableAction(record = {}) {
    const { dispatch } = this.props;
    const { templateId, enabledFlag } = record.get(['templateId', 'enabledFlag']);
    dispatch({
      type: 'cartDefinition/handleEnabled',
      payload: { templateId, enabledFlag: Number(!enabledFlag) },
    }).then(res => {
      if (res) {
        notification.success();
        this.tableDS.query();
      }
    });
  }

  /* 操作记录的icon */
  showStatusIcon(icon) {
    switch (icon.operationType) {
      case 'CREATE':
        return <Icon type="add" style={{ fontSize: 14 }} />;
      case 'UNLOCK':
        return <Icon type="unlock" style={{ fontSize: 14 }} />;
      case 'PUBLISH':
        return <Icon type="send" style={{ fontSize: 14 }} />;
      case 'UPDATE':
        return <Icon type="mode_edit" style={{ fontSize: 14 }} />;
      default:
        return <Icon type="mode_edit" style={{ fontSize: 14 }} />;
    }
  }

  /* 操作记录展示 */
  handleEditRecord(record) {
    const templateCode = record.get('templateCode');
    this.handleDS.setQueryParameter('templateCode', templateCode);
    const { dispatch } = this.props;
    dispatch({
      type: 'cartDefinition/queryOperationRecord',
      payload: {
        templateCode,
        size: 0,
      },
    }).then(res => {
      const { content } = res;
      Modal.open({
        title: intl.get('small.common.edit.handle.record').d('操作记录'),
        drawer: true,
        style: { width: 742 },
        okText: intl.get('small.common.modal.buttom.button.close').d('关闭'),
        okCancel: false,
        children: <HistoryModal content={content} />,
      });
    });
  }

  /* 解锁模板 */
  unlock(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'cartDefinition/unlockLine',
      payload: record.get('templateId'),
    }).then(res => {
      if (res) {
        notification.success();
        this.tableDS.query();
      }
    });
  }

  /* 发布模板 */
  publish(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'cartDefinition/publishLine',
      payload: record.get('templateId'),
    }).then(res => {
      if (res) {
        notification.success();
        this.tableDS.query();
      }
    });
  }

  handlePublish(record) {
    if (record.parent && record.parent.get('status') === 'DISABLED') {
      Modal.confirm({
        title: intl.get('small.common.view.tips').d('提示'),
        children: intl
          .get('small.common.view.enabled.confirm')
          .d('当前策略为禁用状态，发布后策略会变更为已发布状态，确认发布新版本吗？'),
        onOk: () => this.publish(record),
      });
    } else {
      this.publish(record);
    }
  }

  @Bind()
  async saveCopyData(copyDS, params) {
    const flag = await copyDS.validate();
    if (flag) {
      const { dispatch } = this.props;
      dispatch({
        type: 'cartDefinition/copyRecordValue',
        payload: { ...copyDS.toData()[0], templateId: params.templateId },
      }).then(() => {
        this.tableDS.query(this.props.templateStyle);
      });
    } else {
      return false;
    }
  }

  /* 租户层-复制模板 */
  copyTemplate(record) {
    const { templateId, _token } = record.get(['templateId', '_token']);
    const copyDS = new DataSet(cloneDS(templateId));
    copyDS.create({ _token });
    Modal.open({
      title: intl.get('small.common.copy.cart.modal').d('复制购物车分配模板'),
      drawer: true,
      size: 'small',
      okText: intl.get('small.common.button.save').d('保存'),
      children: (
        <Form dataSet={copyDS} labelWidth="auto" labelLayout="float">
          <TextField name="templateCode" />
          <IntlField name="templateName" />
          <IntlField name="remark" />
        </Form>
      ),
      onOk: () => this.saveCopyData(copyDS, record.toData()),
    });
  }

  saveCheckedData(isAll, checkData, templateId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'cartDefinition/saveCheckedNode',
      payload: {
        allUnitFlag: isEmpty(isAll) ? 0 : 1,
        unitList: isEmpty(isAll) ? checkData : undefined,
        templateId,
      },
    }).then(() => {
      notification.success();
      this.tableDS.query();
    });
  }

  handleOrgnization(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'cartDefinition/fetchChildNode',
      payload: {
        templateId: record.get('templateId'),
      },
    }).then(res => {
      const allUnit = {
        unitId: 'ALL',
        unitName: intl.get('small.common.model.allOrg').d('所有组织'),
      };
      record.init('units', isEmpty(res) ? allUnit : res);
      openUnitTree({
        readOnly: !!(organizationId !== 0 && record.get('status') === 'PUBLISHED'),
        record,
        name: 'units',
        title: intl.get('small.common.filter.orgnization').d('适用组织'),
        allText: intl.get('small.common.model.allOrg').d('所有组织'),
        okCallBack: ({ isAll, checkData }) => {
          this.saveCheckedData(isAll, checkData, record.get('templateId'));
        },
        expands: record.get('units')?.map(p => p.unitId) || [],
        okText: intl.get('small.common.button.save').d('保存'),
        cancelText: intl.get('small.common.modal.buttom.button.close').d('关闭'),
        placeholder: intl.get('small.common.modal.orgnization.name').d('请输入组织名称'),
      });
    });
  }

  showStatusTag(status, statusMeaning) {
    let color;
    switch (status) {
      case 'PUBLISHED':
        color = 'green';
        break;
      case 'UNPUBLISHED':
        color = 'yellow';
        break;
      case 'DISABLED':
        color = 'red';
        break;
      default:
        break;
    }
    return (
      <Tag
        color={color}
        style={{
          border: 'none',
        }}
      >
        {statusMeaning}
      </Tag>
    );
  }

  async handleEdit(record) {
    const { status, templateId } = record.get(['status', 'templateId']);
    let id = templateId;
    const parentDisabled = record.parent ? +(record.parent.get('status') === 'DISABLED') : +(record.get('status') === 'DISABLED') ;
    if(['PUBLISHED', 'DISABLED'].includes(status)) {
      const { dispatch } = this.props;
      const res = await dispatch({
        type: 'cartDefinition/unlockLine',
        payload: templateId,
      });
      id = res?.templateId;
    }
    const params = qs.stringify({
      readOnly: 0,
      parentDisabled,
    })
    this.props.history.push(
      `/small/cart-template-definition/distribution/${id}/?${params}`
    );
  }

  editRender = ({ record, dataSet }) => {
    const { status, templateType, templateStyle, templateId, version } = record.get([
      'status',
      'templateType',
      'templateStyle',
      'templateId',
      'version',
    ]);

    const exportFileName = {
      STANDARD: intl
        .get('small.CartTemplate.view.standardExportFileName')
        .d('购物车模板导出-标准分配'),
      PUNCHOUT: intl
        .get('small.CartTemplate.view.punchoutExportFileName')
        .d('购物车模板导出-punchout'),
      OPENCART: intl
        .get('small.CartTemplate.view.manualExportFileName')
        .d('购物车模板导出-手工提需'),
      RECEIVED: intl
        .get('small.CartTemplate.view.receiveExportFileName')
        .d('购物车模板导出-商品领用'),
    };

    const ALL_BUTTON_LIST = [
      {
        key: 'edit',
        name: intl.get('small.common.button.edit').d('编辑'),
        // onClick: () => this.showEditModal(record),
        onClick: () => this.handleEdit(record),
      },
      {
        key: 'publish',
        name: intl.get('small.common.button.handle.publish').d('发布'),
        onClick: () => this.handlePublish(record),
      },
      {
        key: 'enable',
        name: intl.get('small.common.enable').d('启用'),
        onClick: () => this.handleEnableAction(record),
      },
      {
        key: 'disabled',
        name: intl.get('small.common.button.disabled').d('禁用'),
        onClick: () => this.handleEnableAction(record),
      },
      {
        key: 'copy',
        name: intl.get('small.common.button.copy').d('复制'),
        disabled: dataSet.length > 1,
        tooltipTitle:
          dataSet.length > 1
            ? intl.get('small.common.view.copyTip').d('已有自定义策略，不可复制')
            : null,
        onClick: () => this.copyTemplate(record),
      },
      {
        key: 'unlock',
        name: intl.get('small.common.button.unlock').d('解锁'),
        onClick: () => this.unlock(record),
      },
      {
        key: 'history',
        name: intl.get('small.common.model.handle.record').d('操作记录'),
        onClick: () => this.handleEditRecord(record),
      },
      {
        key: 'export',
        children: (
          <ExcelExportPro
            templateCode="SMCT.CART_TEMPLATE_MIGRATE_EXPORT"
            requestUrl={`/smct/v1/${getCurrentOrganizationId()}/dimensiontemplates/export`}
            exportAsync
            queryParams={{
              templateId,
              templateStyle,
            }}
            formData={{ fileName: exportFileName[templateStyle] }}
            buttonText={<span className="cart-export-template">{intl.get('small.common.button.exportTemplate').d('导出模板')}</span>}
            otherButtonProps={{
              funcType: 'link',
              icon: '',
              color: version > 1 ? 'dark' : 'primary',
            }}
          />
        ),
      },
      {
        key: 'historyVersion',
        type: 'subMenu',
        subTitle: intl.get('hzero.common.button.historyVersion').d('历史版本'),
        children: (
          <HistoryVersion
            history={this.props.history}
            buttonProps={{ funcType: 'link', color: status === 'DISABLED' && record.children ? 'primary' : 'dark' }}
            templateStyle={templateStyle}
            isSubMenu={!(status === 'DISABLED' && !isEmpty(record.children))}
          />
        ),
      },
    ];
    let renderBtnList = [];
    switch (status) {
      // 已发布
      case 'PUBLISHED':
        // 模板类型-预定义
        if (templateType === 'PREDEFINED') {
          renderBtnList = organizationId === 0 ? ['unlock'] : ['copy'];
        } else {
          // 模板类型-复制
          renderBtnList = [isEmpty(record.children) && 'edit', 'disabled', 'history', 'export', version > 1 && 'historyVersion'];
        }
        break;
      // 未发布
      case 'UNPUBLISHED':
        renderBtnList = ['publish', 'edit'];
        break;
      // 已禁用
      case 'DISABLED':
        renderBtnList = ['enable', isEmpty(record.children) && 'edit', 'history', version > 1 && 'historyVersion'];
        break;
      // 已失效
      case 'INVALID':
        renderBtnList = ['publish', 'history'];
        break;
      default:
        break;
    }
    const buttonList = renderBtnList.filter(n => n).map(n => {
      return ALL_BUTTON_LIST.find(m => m.key === n) || {};
    });
    return operationRender({
      buttonList,
    });
  };

  /* 表头 */
  getColumns = () => {
    return [
      {
        header: (
          <div>
            {intl.get(`small.common.cartTemplateDefinition.model.status`).d('状态')}
          </div>
        ),
        headerStyle: { paddingLeft: 52 },
        name: 'statusMeaning',
        align: 'left',
        width: 120,
        renderer: ({ record }) => {
          const { status, statusMeaning } = record.data;
          return this.showStatusTag(status, statusMeaning);
        },
      },
      {
        name: 'edit',
        width: 180,
        renderer: this.editRender,
      },
      {
        name: 'templateCode',
        renderer: ({record}) => {
          const {templateCode, templateId} = record.get(["templateCode", "templateId"]);
          const noChild = isEmpty(record.children) ? 1 : 0;
          const parentDisabled = record.parent && +(record.parent.get('status') === 'DISABLED');
          const params = qs.stringify({
            noChild,
            readOnly: 1,
            parentDisabled,
          });
          return (
            <Button
              funcType='link'
              onClick={() => {
                this.props.history.push(
                  `/small/cart-template-definition/distribution/${templateId}/?${params}`
                );
              }}
            >
              {templateCode}
            </Button>
          );
        },
      },
      {
        name: 'templateName',
      },
      {
        name: 'version',
        align: 'right',
        width: 80,
      },
      {
        name: 'remark',
      },
      {
        name: 'templateTypeMeaning',
        align: 'left',
        width: 80,
        renderer: ({record}) => (
          <Tag
            color={record.get('templateType') === 'PREDEFINED' ? 'gray' : 'blue'}
            style={{border: 'none'}}
          >
            {record.get('templateTypeMeaning')}
          </Tag>
        ),
      },
      // {
      //   name: 'templateManage',
      //   width: 80,
      //   renderer: ({ record }) => {
      //     const status = record.get('status');
      //     const templateType = record.get('templateType');
      //     const templateId = record.get('templateId');

      //     return (
      //       <a
      //         onClick={() =>
      //           this.props.history.push(
      //             `/small/cart-template-definition/distribution/${templateId}?status=${status}&templateType=${templateType}&templateId=${templateId}&templateStyle=${this.state.activeKey}`
      //           )
      //         }
      //       >
      //         {['PUBLISHED', 'DISABLED', 'INVALID'].includes(status)
      //           ? intl.get('small.common.button.dimensionView').d('维度查看')
      //           : intl.get('small.common.button.dimensionEdit').d('维度管理')}
      //       </a>
      //     );
      //   },
      // },
    ];
  };

  handleLoadData({ record, dataSet }) {
    const isAddChild = !record.children;
    if (isAddChild) {
      record.setState('loading', true);
      request(`/smct/v1/${organizationId}/dimensiontemplates/history/${record.get('templateId')}`, {
        method: 'GET',
      })
        .then(resp => {
          const res = getResponse(resp);
          if (!res) return;
          const newList = (res?.content || res).map(r => ({
            ...r,
            parentTemplateId: record.get('templateId'),
          }));
          if (newList.length) {
            dataSet.appendData(newList);
          }
        })
        .finally(() => {
          record.setState('loading', false);
        });
    }
  }

  expandicon = ({ prefixCls, expanded, expandable, record, onExpand }) => {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (record.getState('loading') === true) {
      // 自定义状态渲染
      return <Spin tip="loading" delay={200} size="small" />;
    }
    return +record.get('hasChild') ? (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    ) : (
      <span style={{ display: 'inline-block', width: 20 }} />
    );
  };

  handleClose = () => {
    this.setState({ visiable: false });
  };

  importMenu = () => {
    const importList = [
      {
        key: 'STANDARD',
        name: intl.get('small.common.button.importStandTemplate').d('导入标准分配模板'),
      },
      {
        key: 'PUNCHOUT',
        name: intl.get('small.common.button.importPuncTemplate').d('导入punchout模板'),
      },
      {
        key: 'OPENCART',
        name: intl.get('small.common.button.importOpenTemplate').d('导入手工提需模板'),
        visiable: !!this.props.cartDefinition.showOpenCart,
      },
      {
        key: 'RECEIVED',
        name: intl.get('small.common.button.importReceTemplate').d('导入商品领用模板'),
      },
    ].filter(n => n.visiable !== false);
    return (
      <Menu>
        {importList.map(n => (
          <Menu.Item
            onClick={() => {
              const modal = useModal().openModal({
                businessObjectTemplateCode: 'SMCT.CART_TEMPLATE_MIGRATE_IMPORT',
                refreshButton: true,
                buttonText: n.name,
                args: {
                  templateStyle: n.key,
                  tenantId: organizationId,
                },
                prefixPatch: '/smct',
                successCallBack: () => {
                  this.tableDS.query();
                  modal.close();
                },
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                  type: 'text',
                },
              });
            }}
          >
            {n.name}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  render() {
    const { standardDs, punchoutDs, opencartDs, receivedDs } = this.props;
    const spinning = Object.values(this.props.loading.effects).some(n => n);
    return (
      <>
        <Header
          title={intl.get(`small.common.cart.view.template.definition`).d('购物车分配模板定义')}
        >
          {organizationId === 0 && (
            <Button
              style={{ background: '#1e3255', color: '#fff' }}
              icon="add"
              onClick={() => this.showCreateModal()}
            >
              {intl.get('small.common.button.create').d('新建')}
            </Button>
          )}
          <Dropdown overlay={this.importMenu()} placement="bottomLeft">
            <Button funcType="flat" icon="archive">
              {intl.get('small.common.button.importTemplate').d('导入模板')}
              <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginBottom: 2 }} />
            </Button>
          </Dropdown>
        </Header>
        <Content className="cart-template-wrapper">
          {this.state.visiable ? (
            <Alert
              className="change-tips"
              message={intl
                .get('small.CartTemplate.view.tips')
                .d(
                  '无个性化需求，请勿做任何操作直接使用预定义模板；反之可复制预定义模板并在复制的模板自定义维度及其属性。复制模板发布后，预定义模板失效。'
                )}
              type="info"
              showIcon
              closable
              banner
              afterClose={this.handleClose}
            />
          ) : null}

          <Tabs
            className="punchout-tab"
            defaultActiveKey={getTemplateStyle()}
            onChange={key => {
              this.handleTabChange(key);
              const { dispatch, location, history } = this.props;
              // // dispatch({
              // //   type: 'cartDefinition/updateState',
              // //   payload: { templateStyle: e },
              // // });
              // this.setState({
              //   activeKey: e,
              // }, () => {
              //   this.tableDS.query();
              // })
              history.push(`${location.pathname}?templateStyle=${key}`);
              // this.tableDS.setQueryParameter('templateStyle', e);
            }}
          >
            <TabPane
              tab={intl.get('small.CartTemplate.view.tab.allocation').d('企业购-标准分配')}
              key="STANDARD"
            >
              <div
                style={{
                  height: this.state.visiable ? 'calc(100vh - 290px)' : 'calc(100vh - 260px)',
                }}
              >
                <Table
                  mode="tree"
                  spin={{
                    spinning,
                  }}
                  searchCode={
                    organizationId === 0
                      ? 'CART-TEMPLATE_DEFINITION.SEARCH_BAR'
                      : 'SMALL_TEMPLATE-LIST.SEARCH_BAR'
                  }
                  showCachedTips={false}
                  columns={this.getColumns()}
                  dataSet={standardDs}
                  customizedCode="SMALL.TEMPLATE.DEFINITION.LIST"
                  border={null}
                  tooltip="none"
                  // treeLoadData={this.handleLoadData}
                  // expandIcon={this.expandicon}
                  style={{ maxHeight: `calc(100% - 22px)` }}
                />
              </div>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <Tooltip
                    title={intl
                      .get('small.CartTemplate.view.tab.punchOutHelp')
                      .d(
                        '采买人通过甄云商城checkin到电商商城，电商商城内完成选买和加购，通过购物车checkout提交后跳转回甄云购物车，并生成报价单(不可修改)。 后续下单流程如正常电商商品一致。'
                      )}
                  >
                    {intl.get('small.CartTemplate.view.tab.punchOut').d('企业购-punch out')}
                    <Icon type="help" className="cart-template-definition-icon-punchout" />
                  </Tooltip>
                </span>
              }
              key="PUNCHOUT"
            >
              <div
                style={{
                  height: this.state.visiable ? 'calc(100vh - 290px)' : 'calc(100vh - 260px)',
                }}
              >
                <Table
                  mode="tree"
                  spin={{
                    spinning,
                  }}
                  searchCode={
                    organizationId === 0
                      ? 'CART-TEMPLATE_DEFINITION.SEARCH_BAR'
                      : 'SMALL_TEMPLATE-LIST.SEARCH_BAR'
                  }
                  columns={this.getColumns()}
                  dataSet={punchoutDs}
                  customizedCode="SMALL.TEMPLATE.DEFINITION.LIST"
                  border={null}
                  tooltip="none"
                  // treeLoadData={this.handleLoadData}
                  // expandIcon={this.expandicon}
                  style={{ maxHeight: `calc(100% - 22px)` }}
                />
              </div>
            </TabPane>
            {this.props.cartDefinition.showOpenCart && (
              <TabPane
                tab={intl
                  .get('small.CartTemplate.view.tab.openCart.allocation')
                  .d('企业购-手工提需')}
                key="OPENCART"
              >
                <div
                  style={{
                    height: this.state.visiable ? 'calc(100vh - 290px)' : 'calc(100vh - 260px)',
                  }}
                >
                  <Table
                    mode="tree"
                    spin={{
                      spinning,
                    }}
                    searchCode={
                      organizationId === 0
                        ? 'CART-TEMPLATE_DEFINITION.SEARCH_BAR'
                        : 'SMALL_TEMPLATE-LIST.SEARCH_BAR'
                    }
                    columns={this.getColumns()}
                    dataSet={opencartDs}
                    customizedCode="SMALL.TEMPLATE.DEFINITION.LIST"
                    border={null}
                    tooltip="none"
                    // treeLoadData={this.handleLoadData}
                    // expandIcon={this.expandicon}
                    style={{ maxHeight: `calc(100% - 22px)` }}
                  />
                </div>
              </TabPane>
            )}
            <TabPane
              tab={intl.get('small.CartTemplate.view.tab.lingyong.allocation').d('企业购-商品领用')}
              key="RECEIVED"
            >
              <div
                style={{
                  height: this.state.visiable ? 'calc(100vh - 290px)' : 'calc(100vh - 260px)',
                }}
              >
                <Table
                  mode="tree"
                  spin={{
                    spinning,
                  }}
                  searchCode={
                    organizationId === 0
                      ? 'CART-TEMPLATE_DEFINITION.SEARCH_BAR'
                      : 'SMALL_TEMPLATE-LIST.SEARCH_BAR'
                  }
                  columns={this.getColumns()}
                  dataSet={receivedDs}
                  customizedCode="SMALL.TEMPLATE.DEFINITION.LIST"
                  border={null}
                  tooltip="none"
                  // treeLoadData={this.handleLoadData}
                  // expandIcon={this.expandicon}
                  style={{ maxHeight: `calc(100% - 22px)` }}
                />
              </div>
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
