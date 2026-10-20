/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2020/5/11
 * @copyright HAND ® 2020
 */
import React, { PureComponent } from 'react';
import { Table, DataSet, Switch, Modal } from 'choerodon-ui/pro';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { operatorRender, enableRender } from 'hzero-front/lib/utils/renderer';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { paramOptionTableDS } from '@/stores/DynamicMqConfig/DynamicMqConfigDS';
import getLang from '@/langs/dynamicMqConfigLang';
import { enabledParam, disabledParam } from '@/services/dynamicMqConfigService';

@formatterCollections({ code: ['hzero.common', 'hitf.dynamicMqConfig'] })
export default class ParamOptionModal extends PureComponent {
  constructor(props) {
    super(props);
    this.paramOptionTableDS = new DataSet(paramOptionTableDS());
  }

  componentDidMount() {
    this.handleUpdateModalFooter();
    this.handleFetchDetail();
  }

  async handleFetchDetail() {
    const { sourceId, optionClass } = this.props;
    this.paramOptionTableDS.setQueryParameter('sourceId', sourceId);
    this.paramOptionTableDS.setQueryParameter('optionClass', optionClass);
    await this.paramOptionTableDS.query();
  }

  /**
   * 更新Modal的footer
   */
  handleUpdateModalFooter() {
    const { match, readOnly, modal } = this.props;
    const { path } = match;
    modal.update({
      footer: (_okBtn, cancelBtn) => (
        <>
          {cancelBtn}
          {!readOnly && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.saveParamOption`,
                  type: 'button',
                  meaning: '消息中间件-参数选项保存',
                },
              ]}
              type="c7n-pro"
              color="primary"
              onClick={this.handleSave}
            >
              {getLang('SAVE')}
            </ButtonPermission>
          )}
        </>
      ),
    });
  }

  /**
   * 参数选项保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.paramOptionTableDS.validate();
    if (validate) {
      await this.paramOptionTableDS.submit();
      this.handleFetchDetail();
    } else {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
  }

  /**
   * 消息队列新增行
   */
  async handleCreateParam() {
    const { sourceId, optionClass } = this.props;
    const newLine = await this.paramOptionTableDS.create({
      sourceId,
      optionClass,
      enabledFlag: true,
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
        const res = await enabledParam({ ...record.toData() });
        if (getResponse(res)) {
          notification.success();
          this.handleFetchDetail();
        }
      }
    } else {
      const confirm = await Modal.confirm({
        children: <p>{getLang('CHECK_DISABLE')}</p>,
      });
      if (confirm === 'ok') {
        const res = await disabledParam({ ...record.toData() });
        if (getResponse(res)) {
          notification.success();
          this.handleFetchDetail();
        }
      }
    }
  }

  get paramOptionColumns() {
    const {
      readOnly,
      match: { path },
    } = this.props;
    return [
      {
        name: 'propertyKey',
        width: 360,
        editor: (record) => record.getState('editor'),
      },
      {
        name: 'propertyValue',
        width: 180,
        editor: (record) => record.getState('editor'),
      },
      {
        name: 'enabledFlag',
        width: 120,
        editor: (record) => record.getState('editor') && <Switch />,
        renderer: ({ value, record }) => !record.getState('editor') && enableRender(value ? 1 : 0),
      },
      {
        name: 'remark',
        editor: (record) => record.getState('editor'),
      },
      !readOnly && {
        header: getLang('OPERATOR'),
        width: 160,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            record.status !== 'add' &&
              (!record.get('enabledFlag')
                ? {
                    ele: (
                      <ButtonPermission
                        type="text"
                        permissionList={[
                          {
                            code: `${path}.button.param.enabled`,
                            type: 'button',
                            meaning: '消息中间件配置-参数选项-启用',
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
                            code: `${path}.button.param.disabled`,
                            type: 'button',
                            meaning: '消息中间件配置-参数选项-禁用',
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
            // eslint-disable-next-line no-nested-ternary
            !record.getState('editor')
              ? {
                  ele: (
                    <ButtonPermission
                      type="text"
                      permissionList={[
                        {
                          code: `${path}.button.param.edit`,
                          type: 'button',
                          meaning: '消息中间件配置-参数选项-编辑',
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
                          code: `${path}.button.param.clear`,
                          type: 'button',
                          meaning: '消息中间件配置-参数选项-清空',
                        },
                      ]}
                      onClick={() => this.paramOptionTableDS.remove(record)}
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
                          code: `${path}.button.param.cancel`,
                          type: 'button',
                          meaning: '消息中间件配置-参数选项-取消',
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
                },
            record.status !== 'add' && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.param.delete`,
                      type: 'button',
                      meaning: '消息中间件配置-参数选项-删除',
                    },
                  ]}
                  onClick={() => this.paramOptionTableDS.delete(record)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions);
        },
      },
    ];
  }

  render() {
    const {
      readOnly,
      match: { path },
    } = this.props;
    const tableButtons = [
      <ButtonPermission
        permissionList={[
          {
            code: `${path}.button.param.increase`,
            type: 'button',
            meaning: '消息中间件配置-参数选项-新增',
          },
        ]}
        icon="playlist_add"
        type="c7n-pro"
        color="primary"
        onClick={() => this.handleCreateParam()}
      >
        {getLang('INCREASE')}
      </ButtonPermission>,
    ];
    return (
      <div style={{ padding: '0px 8px' }}>
        <Table
          dataSet={this.paramOptionTableDS}
          columns={this.paramOptionColumns}
          buttons={readOnly ? [] : tableButtons}
        />
      </div>
    );
  }
}
