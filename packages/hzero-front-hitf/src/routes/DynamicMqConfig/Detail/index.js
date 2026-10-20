/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2020/5/9
 * @copyright HAND ® 2020
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Table, DataSet, Form, Output, Modal, Switch, TextField } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { operatorRender, enableRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { formDS, mqBinderTableDS } from '@/stores/DynamicMqConfig/DynamicMqConfigDS';
import getLang from '@/langs/dynamicMqConfigLang';
import {
  DYNAMIC_MQ_OPTION_CLASS,
  BINDING_TYPE_STATUS,
  CHARSET_STATUS,
  CONTENT_TYPE_STATUS,
  BINDING_TYPE,
} from '@/constants/constants';
import {
  batchActivateBinder,
  batchDeactivateBinder,
  enabledBinding,
  disabledBinding,
} from '@/services/dynamicMqConfigService';
import ParamOptionModal from '../common/ParamOptionModal';
import SendMessageModal from '../common/SendMessageModal';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.mqBinderTableDS = new DataSet(mqBinderTableDS());
    this.detailFormDS = new DataSet({
      ...formDS,
      children: {
        dynamicBindings: this.mqBinderTableDS,
      },
    });
    this.state = {
      readOnly: true,
    };
  }

  componentDidMount() {
    this.handleFetchDetail();
  }

  /**
   * 头行查询
   */
  async handleFetchDetail() {
    const {
      match: { params },
    } = this.props;
    const { id } = params;
    if (!isUndefined(id)) {
      this.detailFormDS.setQueryParameter('binderId', id);
      const res = await this.detailFormDS.query();
      this.setState({ readOnly: res.enabledFlag });
    }
  }

  /**
   * 消息队列保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.mqBinderTableDS.validate();
    if (!validate) {
      return notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }

    await this.mqBinderTableDS.submit();
    await this.mqBinderTableDS.query();
  }

  /**
   * 消息队列新增行
   */
  @Bind()
  async handleCreateMQ() {
    const {
      match: { params },
    } = this.props;
    const { id } = params;
    const newLine = await this.mqBinderTableDS.create({
      enabledFlag: true,
      binderId: Number(id),
    });
    newLine.setState('editor', true);
  }

  /**
   * 更改行的可编辑状态
   * @param {Object} record 当前行记录
   */
  handleLineStatus(record, status) {
    record.setState('editor', status);
  }

  /**
   * 启用/禁用
   */
  @Bind()
  async handleToggle(record, type) {
    if (type === 'enabled') {
      const confirm = await Modal.confirm({
        children: <p>{getLang('CHECK_ENABLE')}</p>,
      });
      if (confirm === 'ok') {
        const res = await enabledBinding({ ...record.toData() });
        if (getResponse(res)) {
          notification.success();
          await this.mqBinderTableDS.query();
        }
      }
    } else {
      const confirm = await Modal.confirm({
        children: <p>{getLang('CHECK_DISABLE')}</p>,
      });
      if (confirm === 'ok') {
        const res = await disabledBinding({ ...record.toData() });
        if (getResponse(res)) {
          notification.success();
          await this.mqBinderTableDS.query();
        }
      }
    }
  }

  /**
   * 打开参数选项弹窗
   */
  openParamOptionModal() {
    const { match } = this.props;
    const { readOnly } = this.state;
    const record = this.mqBinderTableDS.current;
    const paramOptionProps = {
      match,
      readOnly: readOnly || record.get('enabledFlag'),
      sourceId: record.get('bindingId'),
      optionClass: DYNAMIC_MQ_OPTION_CLASS.BINDING,
    };
    Modal.open({
      title: getLang('PARAM_OPTION_HEADER'),
      closable: true,
      style: { width: '1000px' },
      children: <ParamOptionModal {...paramOptionProps} />,
    });
  }

  /**
   * 激活/取消绑定
   */
  @Bind()
  async handleToggleActivate(type) {
    if (type === 'activation') {
      const confirm = await Modal.confirm({
        children: <p>{getLang('CHECK_BIND')}</p>,
      });
      if (confirm === 'ok') {
        const res = await batchActivateBinder([this.detailFormDS.current.toData()]);
        if (getResponse(res)) {
          notification.success();
          this.handleFetchDetail();
        }
      }
    } else {
      const confirm = await Modal.confirm({
        children: <p>{getLang('CHECK_UNBIND')}</p>,
      });
      if (confirm === 'ok') {
        const res = await batchDeactivateBinder([this.detailFormDS.current.toData()]);
        if (getResponse(res)) {
          notification.success();
          this.handleFetchDetail();
        }
      }
    }
  }

  /**
   * 发送消息
   */
  @Bind()
  handleSendMessage(record) {
    const { match } = this.props;
    const sendMessageProps = {
      match,
      channelName: record.get('bindingName'),
    };
    Modal.open({
      title: `${getLang('SEND_MESSAGE')}：${record.get('bindingName')}`,
      closable: true,
      style: { width: '520px' },
      children: <SendMessageModal {...sendMessageProps} />,
    });
  }

  /**
   * 消息队列绑定columns
   */
  get mqBinderColumns() {
    const {
      match: { path },
    } = this.props;
    const { readOnly } = this.state;
    return [
      {
        name: 'bindingName',
        width: 280,
        editor: (record) =>
          record.status === 'add' &&
          record.getState('editor') && <TextField restrict="a-zA-Z0-9-_./" />,
      },
      {
        name: 'bindingType',
        width: 150,
        align: 'center',
        editor: (record) => record.getState('editor'),
        renderer: ({ value, record, text }) =>
          !record.getState('editor') ? TagRender(value, BINDING_TYPE_STATUS, text) : text,
      },
      {
        name: 'destination',
        width: 200,
        editor: (record) => record.getState('editor'),
      },
      {
        name: 'bindingGroup',
        width: 200,
        editor: (record) => record.getState('editor'),
      },
      {
        name: 'contentType',
        width: 280,
        align: 'center',
        editor: (record) => record.getState('editor'),
        renderer: ({ value, record, text }) =>
          !record.getState('editor') ? TagRender(value, CONTENT_TYPE_STATUS, text) : text,
      },
      {
        name: 'charset',
        width: 130,
        align: 'center',
        editor: (record) => record.getState('editor'),
        renderer: ({ value, record, text }) =>
          !record.getState('editor') ? TagRender(value, CHARSET_STATUS, text) : text,
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value, record }) =>
          (!record.getState('editor') || record.status !== 'add') && enableRender(value ? 1 : 0),
        editor: (record) => record.getState('editor') && record.status === 'add' && <Switch />,
      },
      {
        name: 'remark',
        width: 250,
        editor: (record) => record.getState('editor'),
      },
      {
        header: getLang('OPERATOR'),
        width: readOnly ? 100 : 180,
        renderer: ({ record }) => {
          const actions = [
            !readOnly &&
              record.status !== 'add' &&
              (!record.get('enabledFlag')
                ? {
                    ele: (
                      <ButtonPermission
                        type="text"
                        permissionList={[
                          {
                            code: `${path}.button.mq.enabled`,
                            type: 'button',
                            meaning: '消息中间件配置-消息队列-启用',
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
                            code: `${path}.button.mq.disabled`,
                            type: 'button',
                            meaning: '消息中间件配置-消息队列-禁用',
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
                  }),
            !readOnly &&
              (record.status === 'add' ? true : record.get('enabledFlag')) &&
              // eslint-disable-next-line no-nested-ternary
              (!record.getState('editor')
                ? {
                    ele: (
                      <ButtonPermission
                        type="text"
                        permissionList={[
                          {
                            code: `${path}.button.mq.edit`,
                            type: 'button',
                            meaning: '消息中间件配置-消息队列-编辑',
                          },
                        ]}
                        onClick={() => this.handleLineStatus(record, true)}
                      >
                        {getLang('EDIT')}
                      </ButtonPermission>
                    ),
                    key: 'edit',
                    len: 2,
                    title: getLang('EDIT'),
                  }
                : record.status === 'add'
                ? {
                    ele: (
                      <ButtonPermission
                        type="text"
                        permissionList={[
                          {
                            code: `${path}.button.mq.clear`,
                            type: 'button',
                            meaning: '消息中间件配置-消息队列-清空',
                          },
                        ]}
                        onClick={() => this.mqBinderTableDS.remove(record)}
                      >
                        {getLang('CLEAR')}
                      </ButtonPermission>
                    ),
                    key: 'clear',
                    len: 2,
                    title: getLang('CLEAR'),
                  }
                : {
                    ele: (
                      <ButtonPermission
                        type="text"
                        permissionList={[
                          {
                            code: `${path}.button.mq.cancel`,
                            type: 'button',
                            meaning: '消息中间件配置-消息队列-取消',
                          },
                        ]}
                        onClick={() => this.handleLineStatus(record, false)}
                      >
                        {getLang('CANCEL')}
                      </ButtonPermission>
                    ),
                    key: 'cancel',
                    len: 2,
                    title: getLang('CANCEL'),
                  }),
            record.status !== 'add' && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.mq.paramOption`,
                      type: 'button',
                      meaning: '消息中间件配置-消息队列-参数选项',
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
            BINDING_TYPE.PRODUCER === record.get('bindingType') && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.mq.sendMessage`,
                      type: 'button',
                      meaning: '消息中间件配置-消息队列-发送消息',
                    },
                  ]}
                  onClick={() => this.handleSendMessage(record)}
                >
                  {getLang('SEND_MESSAGE')}
                </ButtonPermission>
              ),
              key: 'sendMessage',
              len: 4,
              title: getLang('SEND_MESSAGE'),
            },
          ];
          return operatorRender(actions, record, { limit: 4 });
        },
        lock: 'right',
        align: 'center',
      },
    ];
  }

  render() {
    const { match } = this.props;
    const { readOnly } = this.state;
    const { path } = match;
    const tableButtons = [
      <ButtonPermission
        permissionList={[
          {
            code: `${path}.button.mq.increase`,
            type: 'button',
            meaning: '消息中间件配置-消息队列-新增',
          },
        ]}
        icon="playlist_add"
        type="c7n-pro"
        color="primary"
        onClick={() => this.handleCreateMQ()}
      >
        {getLang('INCREASE')}
      </ButtonPermission>,
    ];
    return (
      <>
        <Header title={getLang('DETAIL')} backPath="/hitf/dynamic-mq-config/list">
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.detail.save`,
                type: 'button',
                meaning: '消息中间件配置-保存',
              },
            ]}
            icon="save"
            type="c7n-pro"
            color="primary"
            disabled={readOnly}
            onClick={() => this.handleSave()}
          >
            {getLang('SAVE')}
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
            disabled={!readOnly}
            onClick={() => this.handleToggleActivate('activation')}
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
            disabled={!readOnly}
            onClick={() => this.handleToggleActivate('deactivation')}
          >
            {getLang('UNBIND')}
          </ButtonPermission>
        </Header>
        <Content>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={<h3>{getLang('BASIC_INFO')}</h3>}
          >
            <Form labelLayout="horizontal" dataSet={this.detailFormDS} columns={3}>
              <Output name="binderName" />
              <Output name="binderType" />
              <Output
                name="enabledFlag"
                renderer={({ value }) => (value ? getLang('YES') : getLang('NO'))}
              />
              <Output newLine name="remark" colSpan={3} />
            </Form>
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={<h3>{getLang('DETAIL_INFO')}</h3>}
          >
            <Table
              dataSet={this.mqBinderTableDS}
              columns={this.mqBinderColumns}
              buttons={readOnly ? [] : tableButtons}
            />
          </Card>
        </Content>
      </>
    );
  }
}
