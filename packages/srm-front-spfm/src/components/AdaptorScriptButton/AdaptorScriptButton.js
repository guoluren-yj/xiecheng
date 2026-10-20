/**
 * AdaptorScriptButton.js
 * 脚本代码按钮组件
 * @date: 2021-09--8
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import crypto from 'crypto-js';
import { omit } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import EditorModal from './components/EditorModal';
import { getAdaptorTaskHeadDs, getAdaptorTaskLineDs } from './store/taskDetailDs';
import {
  queryAdaptorTask,
  saveAdaptorScript,
  saveScriptDataService,
} from '@/services/adaptorTaskService';

@formatterCollections({
  code: ['spfm.adaptorTask', 'spfm.adaptorTaskDetail', 'spfm.adaptorPlayGround'],
})
export default class AdaptorScriptButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerId: undefined,
    };
    this.adaptorTaskHeadDs = new DataSet(getAdaptorTaskHeadDs());
    this.adaptorTaskLineDs = new DataSet(getAdaptorTaskLineDs());
  }

  scriptCodeDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'script',
        type: 'string',
        defaultValue: crypto.enc.Utf16.stringify(
          crypto.enc.Base64.parse(
            '/v8AZgB1AG4AYwB0AGkAbwBuACAAcAByAG8AYwBlAHMAcwAoACAAaQBuAHAAdQB0ACAAKQB7AAoAIAAgACAAcgBlAHQAdQByAG4AIAB7ACAAIgByAGUAcwB1AGwAdAAiADoAIgBoAGUAbABsAG8AIAB3AG8AcgBsAGQAIQAiAH0ACgB9AAo='
          )
        ),
      },
      {
        name: 'input',
        type: 'string',
        defaultValue: crypto.enc.Utf16.stringify(
          crypto.enc.Base64.parse(
            '/v8AewAKACAAIAAiAEEATgBZAFQASABJAE4ARwAiACAAOgAgACIAcwB0AHIAaQBuAGcAIgAKAH0='
          )
        ),
      },
    ],
  });

  scriptOutputDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'output',
        type: 'string',
      },
      {
        name: 'outPutLog',
        type: 'string',
      },
      {
        name: 'queryBlockSql',
        type: 'string',
      },
    ],
  });

  helpDs = new DataSet({
    fields: [
      {
        name: 'msg',
        type: 'string',
      },
    ],
  });

  // 通过父级传入的id来访问接口获取数据
  @Bind()
  @Debounce(500)
  async queryAdaptorScript(currentState) {
    const { id } = this.props;
    this.setState({ headerId: id });
    queryAdaptorTask({
      headerId: id,
    }).then((res) => {
      if (getResponse(res)) {
        const headerData = this.state.headerId
          ? res
          : omit(res, ['applyTenantName', 'applyTenantNum']);
        const lineData = res.adaptorTaskLines;
        this.adaptorTaskHeadDs.loadData([headerData]);
        this.adaptorTaskLineDs
          .getField('resultInvokeLov')
          .set('lovPara', { runningService: headerData.runningService });
        this.adaptorTaskLineDs.loadData(lineData);
        if (currentState !== 'save') {
          this.showScript();
        }
      }
    });
  }

  saveAction = async () => {
    await new Promise((resolve) => this.setScriptData(this.adaptorTaskLineDs.current, resolve));
    this.adaptorTaskHeadDs.validate().then((headerRes) => {
      this.adaptorTaskLineDs.validate().then((lineRes) => {
        if (headerRes && lineRes) {
          const header = omit(this.adaptorTaskHeadDs.current.toJSONData(), [
            'applyTenant',
            'inputEntity',
            'task',
          ]);
          const lines = this.adaptorTaskLineDs.toJSONData();
          const saveData = {
            ...header,
            adaptorTaskLines: lines.map((line) => omit(line, ['outputEntity', 'resultInvokeLov'])),
          };
          saveAdaptorScript(saveData).then((res) => {
            if (getResponse(res)) {
              notification.success();
              this.queryAdaptorScript('save');
            }
          });
        }
      });
    });
  };

  setScriptData = (record, resolve) => {
    const { script, input } = this.scriptCodeDs.toData()[0];
    record.set('inputContent', crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(input)));
    record.set('scriptContent', crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(script)));
    resolve();
  };

  // 关闭modal触发保存代码
  saveScriptData = (key) => {
    const script = crypto.enc.Base64.stringify(
      crypto.enc.Utf16.parse(this.scriptCodeDs.current.get('script'))
    );
    const isChange = this.adaptorTaskLineDs.current.get('scriptContent') === script;
    if (!isChange) {
      const saveData = {
        key,
        script,
      };
      saveScriptDataService(saveData);
    }
  };

  // 打开脚本代码模态框
  showScript = () => {
    const { taskCode, applyTenantNum, trustful } = this.adaptorTaskHeadDs.current.toData();
    const saveScriptKey = `${taskCode}|${applyTenantNum}`;
    const record = this.adaptorTaskLineDs.current;
    const {
      inputContent,
      scriptContent,
      bindRoutePrefix,
      debugTenantNum,
      scriptVersion,
    } = record.toData();
    const outputEntityCode = 'ANYTHING';
    const inputEntityCode = 'ANYTHING';
    if (scriptContent) {
      this.scriptCodeDs.current.set(
        'script',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(scriptContent))
      );
    }
    if (inputContent) {
      this.scriptCodeDs.current.set(
        'input',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(inputContent))
      );
    }
    if (outputEntityCode) {
      Modal.open({
        title: intl.get('spfm.adaptorTaskDetail.modal.header.title').d('脚本编辑器'),
        children: (
          <EditorModal
            queryParam={{
              inputEntityCode,
              outputEntityCode,
              scriptVersion,
              bindRoutePrefix,
              debugTenantNum,
              saveScriptKey,
              trustful,
            }}
            scriptCodeDs={this.scriptCodeDs}
            scriptOutputDs={this.scriptOutputDs}
            helpDs={this.helpDs}
            complementaryWords={this.props.complementaryWords}
          />
        ),
        closable: true,
        destroyOnClose: true,
        fullScreen: true,
        onClose: () => {
          // 清除所有ds
          this.saveScriptData(saveScriptKey);
          this.scriptCodeDs.reset();
          this.scriptOutputDs.reset();
          this.helpDs.reset();
          this.props.currentTableDs.query();
        },
        footer: (onOk, onClose) => (
          <div>
            <Button color="primary" onClick={() => this.saveAction()}>
              {intl.get('hzero.common.model.save').d('保存')}
            </Button>
            {onClose}
          </div>
        ),
      });
    } else {
      notification.warning({
        message: intl.get('spfm.adaptorTaskDetail.view.message.waring').d('请选择输入结构！'),
      });
    }
  };

  render() {
    return (
      <a onClick={this.queryAdaptorScript}>
        {intl.get('spfm.adaptorTaskDetail.view.title.scriptContent').d('脚本代码')}
      </a>
    );
  }
}
