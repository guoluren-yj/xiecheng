import React, { Fragment, Component } from 'react';
import { Menu } from 'choerodon-ui';
import { Table, Form, TextField, Modal, CodeArea } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import './index.less';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'hzero.common', 'smbl.common'] })
export default class RuleApi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paramMenuKey: 'pathParams',
    };
  }

  buttons = [
    'add',
    [
      'delete',
      {
        color: 'red',
        onClick: () => {
          Modal.confirm({
            children: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
            onOk: () => {
              this.props.ruleStatementApiUrlParamDataSet.remove(
                this.props.ruleStatementApiUrlParamDataSet.selected,
                true
              );
            },
          });
        },
      },
    ],
  ];

  menuChanged = (e) => {
    this.setState({
      paramMenuKey: e.key,
    });
  };

  render() {
    const {
      editor,
      ruleStatementApiUrlPathDataSet,
      ruleStatementApiUrlParamDataSet,
      ruleStatementApiBodyParamDataSet,
    } = this.props;
    const options = { mode: { name: 'javascript', json: true } };
    const jsonStyle = { height: 500, width: 470 };
    return (
      <Fragment>
        <div>
          <Form dataSet={ruleStatementApiUrlPathDataSet} labelLayout="float">
            <TextField name="urlPath" disabled={!editor} />
          </Form>
          <div className="task-source-rule-param-def">
            <div className="task-source-rule-param-def-icon" />
            <div className="task-source-rule-param-def-title">
              {intl.get('smbl.common.model.paramDef').d('参数定义')}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <Menu
              defaultSelectedKeys={['pathParams']}
              style={{
                backgroundColor: '#f4f6f8',
                marginRight: '30px',
                width: 150,
                minWidth: 150,
                minHeight: 500,
              }}
              mode="inline"
            >
              <Menu.Item key="pathParams" onClick={this.menuChanged}>
                <div style={{ fontSize: '14px' }}>
                  {intl.get('smbl.purchaseRobotConfig.view.title.pathParameter').d('路径参数')}
                </div>
              </Menu.Item>
              <Menu.Item key="bodyParams" onClick={this.menuChanged}>
                <div style={{ fontSize: '14px' }}>
                  {intl.get('smbl.purchaseRobotConfig.view.title.bodyParameter').d('Body参数')}
                </div>
              </Menu.Item>
            </Menu>
            {this.state.paramMenuKey === 'pathParams' ? (
              <Table
                dataSet={ruleStatementApiUrlParamDataSet}
                columns={[
                  { name: 'key', editor, width: 200 },
                  { name: 'value', editor },
                ]}
                buttons={editor ? this.buttons : null}
              />
            ) : (
              <CodeArea
                dataSet={ruleStatementApiBodyParamDataSet}
                name="jsonBody"
                style={jsonStyle}
                formatter={JSONFormatter}
                options={options}
                disabled={!editor}
              />
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}
