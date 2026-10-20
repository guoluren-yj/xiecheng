import React from 'react';
import { Button, DataSet, Table, Modal, Form, TextField, Select } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import crypto from 'crypto-js';
import { isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import { getComplementaryWordsService } from '@/services/adaptorTaskService';
import getTemplateLibraryDs from '../store/templateLibraryDs';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';

let uid = Date.now();
@formatterCollections({
  code: ['spfm.templateLibrary'],
})
@withProps(
  () => {
    const templateLibraryDs = new DataSet(getTemplateLibraryDs());
    return {
      templateLibraryDs,
    };
  },
  { cacheState: true }
)
export default class TemplateLibrary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      complementaryWords: [],
    };
    this.templateLibraryDs = this.props.templateLibraryDs;
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

  createUid = () => {
    return (uid++).toString(36);
  };

  addLine = () => {
    const newRecord = this.templateLibraryDs.create();
    newRecord.set('code', this.createUid());
    Modal.open({
      title: intl.get('hzero.common.button.create').d('新建'),
      drawer: true,
      children: (
        <Form record={newRecord}>
          <TextField name="description" />
          <Select name="type" />
        </Form>
      ),
      onOk: async () => {
        newRecord.set(
          'scriptContent',
          '/v8AZgB1AG4AYwB0AGkAbwBuACAAcAByAG8AYwBlAHMAcwAoACAAaQBuAHAAdQB0ACAAKQB7AAoAIAAgACAAcgBlAHQAdQByAG4AIAB7ACAAIgByAGUAcwB1AGwAdAAiADoAIgBoAGUAbABsAG8AIAB3AG8AcgBsAGQAIQAiAH0ACgB9AAo='
        );
        const res = await this.templateLibraryDs.submit();
        if (getResponse(res)) {
          this.templateLibraryDs.query();
          return true;
        } else {
          notification.warning({
            message: intl
              .get('spfm.templateLibrary.modal.submit.none')
              .d('提交前请填写完整相关信息'),
          });
          return false;
        }
      },
      onCancel: () => {
        this.templateLibraryDs.remove(newRecord);
      },
    });
  };

  deleteScript = (record) => {
    this.templateLibraryDs.delete(record);
  };

  // 行编辑弹窗
  editLine = (record) => {
    Modal.open({
      title: intl.get('hzero.common.button.edit').d('编辑'),
      drawer: true,
      children: (
        <Form record={record}>
          <TextField name="description" />
          <Select name="type" />
        </Form>
      ),
      okText: intl.get('hzero.common.model.save').d('保存'),
      onOk: async () => {
        // 检测是否修改过数据
        if (!record.dirty) {
          return true;
        }
        const res = await this.templateLibraryDs.submit();
        if (getResponse(res)) {
          this.templateLibraryDs.query();
          return true;
        } else {
          notification.warning({
            message: intl
              .get('spfm.templateLibrary.modal.submit.none')
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

  render() {
    const columns = [
      {
        name: 'description',
        minWidth: 400,
      },
      {
        name: 'scriptContent',
        width: 120,
        renderer: ({ record }) => {
          const code = record.get('code');
          const saveScriptKey = `TL|${code}`;
          return (
            <MarmotScriptButton
              name="scriptContent"
              record={record}
              complementaryWords={this.state.complementaryWords}
              saveScriptKey={saveScriptKey}
              scriptCacheKey="templateLibrary|MarmotScript"
              scriptVersion={3}
              testParam={{
                saveScriptKey,
                debugTenantNum: 'SRM-ZHENYUN',
              }}
              onSave={(...arg) => {
                this.templateLibraryDs
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
                this.templateLibraryDs.reset();
              }}
            />
          );
        },
      },
      {
        name: 'contributor',
        width: 120,
      },
      {
        name: 'type',
        width: 120,
      },
      {
        name: 'star',
        width: 120,
        sortable: true,
      },
      {
        name: 'action',
        width: 200,
        renderer: ({ record }) => {
          return (
            <>
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
        <Header title={intl.get('spfm.templateLibrary.view.title.templateLibrary').d('案例库')}>
          <Button color="primary" onClick={this.addLine}>
            <Icon type="add" style={{ fontSize: 14, marginRight: 5 }} />
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.templateLibraryDs} columns={columns} />
        </Content>
      </>
    );
  }
}
