/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2020/5/9
 * @copyright HAND ® 2020
 */
import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Table, DataSet, Modal, Form, TextField, Select, Switch, TextArea } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { operatorRender, enableRender, TagRender } from 'hzero-front/lib/utils/renderer';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { routerRedux } from 'dva/router';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { isEmpty } from 'lodash';
import getLang from '@/langs/dynamicMqConfigLang';
import { tableDS, formDS } from '@/stores/DynamicMqConfig/DynamicMqConfigDS';
import { DYNAMIC_MQ_OPTION_CLASS, BINDER_TYPE_STATUS } from '@/constants/constants';
import { batchActivateBinder, batchDeactivateBinder } from '@/services/dynamicMqConfigService';
import ParamOptionModal from '../common/ParamOptionModal';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class DynamicMqConfig extends React.Component {
  binderDrawer;

  constructor(props) {
    super(props);
    this.tableDS = new DataSet(tableDS());
    this.drawerFormDS = new DataSet(formDS());
    this.state = {
      selectedRows: [],
    };
  }

  componentDidMount() {
    // 增加选中记录的事件监听
    this.tableDS.addEventListener('select', this.handleSelectRows);
    // 增加撤销选择记录的事件监听
    this.tableDS.addEventListener('unSelect', this.handleSelectRows);
    // 增加全选记录的事件监听
    this.tableDS.addEventListener('selectAll', this.handleSelectRows);
    // 增加撤销全选记录的事件监听
    this.tableDS.addEventListener('unSelectAll', this.handleSelectRows);
  }

  componentWillUnmount() {
    // 移除选中记录的事件监听
    this.tableDS.removeEventListener('select', this.handleSelectRows);
    // 移除撤销选择记录的事件监听
    this.tableDS.removeEventListener('unSelect', this.handleSelectRows);
    // 移除全选记录的事件监听
    this.tableDS.removeEventListener('selectAll', this.handleSelectRows);
    // 移除撤销全选记录的事件监听
    this.tableDS.removeEventListener('unSelectAll', this.handleSelectRows);
  }

  /**
   * 选中行的key
   */
  @Bind()
  handleSelectRows() {
    this.setState({
      selectedRows: this.tableDS.selected.map((record) => record.toData()),
    });
  }

  /**
   * 启用/禁用/激活绑定/取消绑定
   */
  @Bind()
  async handleToggle(record, requestType) {
    record.set('_requestType', requestType);
    let tip = '';
    switch (requestType) {
      case 'enabled':
        tip = getLang('CHECK_ENABLE');
        break;
      case 'disabled':
        tip = getLang('CHECK_DISABLE');
        break;
      case 'activation':
        tip = getLang('CHECK_BIND');
        break;
      default:
    }
    const confirm = await Modal.confirm({
      children: <p>{tip}</p>,
    });
    if (confirm === 'ok') {
      await this.tableDS.submit();
      await this.tableDS.query();
    }
  }

  /**
   * 跳转到明细页
   * @param {number} binderId
   */
  @Bind()
  handleGotoDetail(binderId) {
    const { dispatch = () => {} } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hitf/dynamic-mq-config/detail/${binderId}`,
      })
    );
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.drawerFormDS.create({
      enabledFlag: false,
    });
    this.openBinderDrawer(false);
  }

  /**
   * 编辑
   */
  @Bind()
  async handleEdit(id) {
    this.openBinderDrawer(true);
    this.drawerFormDS.setQueryParameter('binderId', id);
    await this.drawerFormDS.query();
  }

  /**
   * 打开中间件滑窗
   */
  openBinderDrawer(disabledFlag) {
    const {
      match: { path },
    } = this.props;
    this.binderDrawer = Modal.open({
      title: getLang('CREATE_HEADER'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 450 },
      children: (
        <Form labelLayout="vertical" dataSet={this.drawerFormDS}>
          <TextField name="binderName" restrict="a-zA-Z0-9-_./" disabled={disabledFlag} />
          <Select name="binderType" />
          <Switch name="enabledFlag" />
          <TextArea name="remark" />
        </Form>
      ),
      afterClose: () => this.drawerFormDS.reset(),
      footer: (_okBtn, cancelBtn) => (
        <div style={{ textAlign: 'right' }}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.save`,
                type: 'button',
                meaning: '消息中间件-头保存',
              },
            ]}
            type="c7n-pro"
            color="primary"
            onClick={this.handleOk}
          >
            {getLang('SAVE')}
          </ButtonPermission>
          {cancelBtn}
        </div>
      ),
    });
  }

  /**
   * 头保存
   */
  @Bind()
  async handleOk() {
    const validate = await this.drawerFormDS.validate();
    if (validate) {
      if (this.drawerFormDS.current.status === 'sync') {
        notification.warning({
          message: getLang('SAVE_EMPTY'),
        });
        return Promise.reject();
      }
      await this.drawerFormDS.submit();
      this.binderDrawer.close();
      await this.tableDS.query();
    } else {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
  }

  /**
   * 打开参数选项弹窗
   */
  openParamOptionModal() {
    const { match } = this.props;
    const record = this.tableDS.current;
    const paramOptionProps = {
      match,
      readOnly: record.get('enabledFlag'),
      sourceId: record.get('binderId'),
      optionClass: DYNAMIC_MQ_OPTION_CLASS.BINDER,
    };
    Modal.open({
      title: getLang('PARAM_OPTION_HEADER'),
      closable: true,
      style: { width: '1000px' },
      children: <ParamOptionModal {...paramOptionProps} />,
    });
  }

  /**
   * 批量激活/取消绑定时校验是否包含禁用数据
   */
  checkInvalidData(data) {
    const temps = data.map((temp) => temp.enabledFlag);
    if (temps.includes(false)) {
      return true;
    }
    return false;
  }

  /**
   * 批量激活/取消绑定
   */
  @Bind()
  async handleBatchToggleActivate(type) {
    if (type === 'activation') {
      const confirm = await Modal.confirm({
        children: <p>{getLang('CHECK_BIND')}</p>,
      });
      if (confirm === 'ok') {
        const data = this.tableDS.selected.map((record) => record.toData());
        if (this.checkInvalidData(data)) {
          return notification.error({
            message: getLang('BIND_VALIDATE'),
          });
        }
        const res = await batchActivateBinder(data);
        if (getResponse(res)) {
          notification.success();
          this.setState({ selectedRows: [] });
          await this.tableDS.query();
        }
      }
    } else {
      const confirm = await Modal.confirm({
        children: <p>{getLang('CHECK_UNBIND')}</p>,
      });
      if (confirm === 'ok') {
        const data = this.tableDS.selected.map((record) => record.toData());
        if (this.checkInvalidData(data)) {
          return notification.error({
            message: getLang('UNBIND_VALIDATE'),
          });
        }
        const res = await batchDeactivateBinder(data);
        if (getResponse(res)) {
          notification.success();
          this.setState({ selectedRows: [] });
          await this.tableDS.query();
        }
      }
    }
  }

  get middleWareSettingColumns() {
    const {
      match: { path },
    } = this.props;
    return [
      {
        name: 'binderName',
        width: 350,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleGotoDetail(record.get('binderId'))}>{value}</a>
        ),
      },
      {
        name: 'binderType',
        align: 'center',
        width: 200,
        renderer: ({ value, text }) => TagRender(value, BINDER_TYPE_STATUS, text),
      },
      {
        name: 'enabledFlag',
        width: 160,
        renderer: ({ value }) => enableRender(value ? 1 : 0),
      },
      {
        name: 'remark',
      },
      {
        header: getLang('OPERATOR'),
        width: 300,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            !record.get('enabledFlag') && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.edit`,
                      type: 'button',
                      meaning: '消息中间件配置列表-编辑',
                    },
                  ]}
                  onClick={() => this.handleEdit(record.get('binderId'))}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            !record.get('enabledFlag')
              ? {
                  ele: (
                    <ButtonPermission
                      type="text"
                      permissionList={[
                        {
                          code: `${path}.button.enabled`,
                          type: 'button',
                          meaning: '消息中间件配置列表-启用',
                        },
                      ]}
                      onClick={() => this.handleToggle(record, 'enabled')}
                    >
                      {getLang('ENABLED')}
                    </ButtonPermission>
                  ),
                  key: 'enabled',
                  len: 2,
                  title: getLang('ENABLED'),
                }
              : {
                  ele: (
                    <ButtonPermission
                      type="text"
                      permissionList={[
                        {
                          code: `${path}.button.disabled`,
                          type: 'button',
                          meaning: '消息中间件配置列表-禁用',
                        },
                      ]}
                      onClick={() => this.handleToggle(record, 'disabled')}
                    >
                      {getLang('DISABLED')}
                    </ButtonPermission>
                  ),
                  key: 'disabled',
                  len: 2,
                  title: getLang('DISABLED'),
                },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.bind`,
                      type: 'button',
                      meaning: '消息中间件配置列表-激活绑定',
                    },
                  ]}
                  disabled={!record.get('enabledFlag')}
                  onClick={() => this.handleToggle(record, 'activation')}
                >
                  {getLang('BIND')}
                </ButtonPermission>
              ),
              key: 'bind',
              len: 4,
              title: getLang('BIND'),
            },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.paramOption`,
                      type: 'button',
                      meaning: '消息中间件配置列表-参数选项',
                    },
                  ]}
                  onClick={() => this.openParamOptionModal(false, record)}
                >
                  {getLang('PARAM_OPTION')}
                </ButtonPermission>
              ),
              key: 'paramOption',
              len: 4,
              title: getLang('PARAM_OPTION'),
            },
          ];
          return operatorRender(actions, record, { limit: 4 });
        },
      },
    ];
  }

  render() {
    const {
      match: { path },
    } = this.props;
    const { selectedRows } = this.state;
    return (
      <>
        <Header title={getLang('HEADER')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.create`,
                type: 'button',
                meaning: '消息中间件配置-新建',
              },
            ]}
            icon="add"
            type="c7n-pro"
            color="primary"
            onClick={this.handleCreate}
          >
            {getLang('CREATE')}
          </ButtonPermission>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.detail.bind`,
                type: 'button',
                meaning: '消息中间件配置-激活绑定',
              },
            ]}
            icon="lock_outline"
            type="c7n-pro"
            disabled={isEmpty(selectedRows)}
            onClick={() => this.handleBatchToggleActivate('activation')}
          >
            {getLang('BIND')}
          </ButtonPermission>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.detail.unbind`,
                type: 'button',
                meaning: '消息中间件配置-取消绑定',
              },
            ]}
            icon="lock_open"
            type="c7n-pro"
            disabled={isEmpty(selectedRows)}
            onClick={() => this.handleBatchToggleActivate('deactivation')}
          >
            {getLang('UNBIND')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table dataSet={this.tableDS} columns={this.middleWareSettingColumns} />
        </Content>
      </>
    );
  }
}
