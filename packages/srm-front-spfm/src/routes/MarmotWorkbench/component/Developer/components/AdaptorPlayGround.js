/**
 * AdaptorPlayGround.js
 * 适配器PlayGround
 * @date: 2021-08-18
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, DataSet, Table, Modal, Form, Lov, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import crypto from 'crypto-js';
import { isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, isTenantRoleLevel, getCurrentTenant, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import { getComplementaryWordsService } from '@/services/adaptorTaskService';
import { getAdatorPlayGroundDs } from '../store/adatorPlayGroundDs';
// import AdaptorButton from '@/components/AdaptorScriptButton/AdaptorButton';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';

const tenantFlag = isTenantRoleLevel();
const { realName } = getCurrentUser();
const currentTenant = getCurrentTenant();
@formatterCollections({
  code: ['spfm.adaptorTask', 'spfm.adaptorTaskDetail', 'spfm.adaptorPlayGround'],
})
@withProps(
  () => {
    const adaptorPlayGroundDs = new DataSet(getAdatorPlayGroundDs());
    return {
      adaptorPlayGroundDs,
    };
  },
  { cacheState: true }
)
export default class AdaptorPlayGround extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      complementaryWords: [],
      isOnClickQuery: false,
    };
    this.adaptorPlayGroundDs = this.props.adaptorPlayGroundDs;
  }

  componentDidMount() {
    getComplementaryWordsService().then((res) => {
      if (getResponse(res)) {
        // 自定义的代码提示
        if (!isEmpty(res)) {
          this.setState({
            complementaryWords: crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res)),
          });
        }
      }
    });
  }

  addLine = () => {
    const newRecord = this.adaptorPlayGroundDs.create();
    if (tenantFlag) {
      newRecord.set('applyTenant', currentTenant);
    }
    Modal.open({
      title: intl.get('hzero.common.button.create').d('新建'),
      drawer: true,
      children: (
        <Form record={newRecord}>
          <TextField name="taskCode" />
          {!tenantFlag ? <Lov name="applyTenant" disabled={tenantFlag} /> : ''}
          <TextField name="description" />
        </Form>
      ),
      onOk: async () => {
        const res = await this.adaptorPlayGroundDs.submit();
        if (getResponse(res)) {
          this.adaptorPlayGroundDs.query();
          return true;
        } else {
          notification.warning({
            message: intl
              .get('spfm.adaptorPlayGround.modal.submit.none')
              .d('提交前请填写完整相关信息'),
          });
          return false;
        }
      },
      onCancel: () => {
        this.adaptorPlayGroundDs.remove(newRecord);
      },
    });
  };

  deleteScript = (record) => {
    this.adaptorPlayGroundDs.delete(record);
  };

  // 行编辑弹窗
  editLine = (record) => {
    Modal.open({
      title: intl.get('hzero.common.button.edit').d('编辑'),
      drawer: true,
      children: (
        <Form record={record}>
          <TextField name="taskCode" disabled />
          {tenantFlag || <Lov name="applyTenant" />}
          <TextField name="realName" disabled required />
          <TextField name="description" />
        </Form>
      ),
      okText: intl.get('hzero.common.model.save').d('保存'),
      onOk: async () => {
        // 检测是否修改过数据
        if (!record.dirty) {
          return true;
        }
        const res = await this.adaptorPlayGroundDs.submit();
        if (getResponse(res)) {
          this.adaptorPlayGroundDs.query();
          return true;
        } else {
          notification.warning({
            message: intl
              .get('spfm.adaptorPlayGround.modal.submit.none')
              .d('提交前请填写完整相关信息'),
          });
          return false;
        }
      },
      onCancel: () => {
        record.reset();
      },
    });
  };

  queryMyself = () => {
    const currentUserName = this.state.isOnClickQuery ? null : realName;
    this.adaptorPlayGroundDs.setQueryParameter('realName', currentUserName);
    this.setState({ isOnClickQuery: !this.state.isOnClickQuery });
    this.adaptorPlayGroundDs.query();
  };

  render() {
    const columns = [
      {
        name: 'taskCode',
        width: 300,
      },
      tenantFlag || {
        name: 'applyTenantName',
        width: 200,
      },
      {
        name: 'description',
      },
      {
        name: 'realName',
        width: 120,
      },
      {
        name: 'action',
        width: 180,
        renderer: ({ record }) => {
          const {
            taskCode,
            applyTenantNum,
            scriptVersion = 3,
            applyTenantNum: debugTenantNum,
            inputContent,
            bindRoutePrefix,
          } = record.get([
            'taskCode',
            'applyTenantNum',
            'scriptVersion',
            'applyTenantNum',
            'inputContent',
            'bindRoutePrefix',
          ]);
          const saveScriptKey = `PG|${taskCode}|${applyTenantNum}`;
          return (
            <>
              <MarmotScriptButton
                name="scriptContent"
                record={record}
                complementaryWords={this.state.complementaryWords}
                marmotScriptInput={inputContent}
                saveScriptKey={saveScriptKey}
                scriptCacheKey="adaptorConsole|MarmotScript"
                bindRoutePrefix={bindRoutePrefix}
                scriptVersion={scriptVersion}
                testParam={{
                  saveScriptKey,
                  debugTenantNum,
                }}
                onSave={(...arg) => {
                  record.set('inputContent', arg[2].inputContent);
                  this.adaptorPlayGroundDs
                    .submit()
                    .then(() => {
                      if (arg[4]) {
                        arg[4](false);
                      }
                    })
                    .finally(() => {
                      arg[0](false);
                    });
                }}
                onClose={() => {
                  this.adaptorPlayGroundDs.reset();
                }}
              />
              &nbsp;&nbsp;&nbsp;
              <span className="action-link">
                <a onClick={() => this.editLine(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </span>
              &nbsp;&nbsp;&nbsp;
              <span className="action-link">
                <a onClick={() => this.deleteScript(record)}>
                  {intl.get('hzero.common.button.toDelete').d('删除')}
                </a>
              </span>
            </>
          );
        },
      },
    ];
    return (
      <>
        <Header
          title={intl
            .get('spfm.adaptorPlayGround.view.title.adaptorPlayGround')
            .d('适配器PlayGround')}
        >
          <Button color="primary" onClick={this.addLine}>
            <Icon type="add" style={{ fontSize: 14, marginRight: 5 }} />
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button onClick={this.queryMyself}>
            {!this.state.isOnClickQuery
              ? intl.get('spfm.adaptorPlayGround.view.look.myself').d('只看我的')
              : intl.get('spfm.adaptorPlayGround.view.look.all').d('查看所有')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.adaptorPlayGroundDs} columns={columns} />
        </Content>
      </>
    );
  }
}
