/**
 * index.js
 * a适配器脚本查询页面
 * @date: 2021-07-05
 * @author: angnong <ang.nong@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { message } from 'choerodon-ui';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Content } from 'components/Page';
import { withRouter } from 'dva/router';
import { isFunction } from 'lodash';
import { isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js'; // 折叠代码
import getadaptorDs from './store/adaptorDs';
import MyCard from './component/MyCard/index';

const tenantFlag = isTenantRoleLevel();
@formatterCollections({ code: ['spfm.script'] })
@withRouter
class ScriptSearch extends Component {
  constructor(props) {
    super(props);
    this.ds = new DataSet(getadaptorDs());
  }

  showScript = (record, value) => {
    const jsOptions = {
      name: 'javascript',
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    };
    const realScript = record.get('adaptorLine').scriptContent;
    const scriptVersion = record.get('scriptVersion');
    const lineId = record.get('adaptorLine').id;
    Modal.info({
      drawer: true,
      style: { width: 700 },
      drawerTransitionName: 'slide-right',
      children: (
        <div className="editor-left">
          <MyCard
            scriptVersion={scriptVersion}
            realScript={realScript}
            jsOptions={jsOptions}
            value={value}
            lineId={lineId}
          />
        </div>
      ),
    });
  };

  adaptorPosition = (record) => {
    const { runningService, taskCode, applyTenantNum, applyTenantName } = record.toData();
    if (tenantFlag) {
      if (this.props.findAdaptor && isFunction(this.props.findAdaptor)) {
        this.props.findAdaptor(runningService, taskCode);
      } else {
        message.destroy();
        message.config({
          top: 100,
          bottom: 100,
          duration: 3,
        });
        message.error(
          intl.get('spfm.script.view.message.find.noFunction').d('定位错误，请联系管理员')
        );
      }
    } else {
      this.props.history.push({
        pathname: `/spfm/adaptor-task/list`,
        query: {
          runningService,
          taskCode,
          applyTenantNum,
          applyTenantName,
        },
      });
    }
  };

  render() {
    const fieldArr = tenantFlag
      ? [
          {
            name: 'description',
          },
        ]
      : [
          {
            name: 'applyTenantName',
            width: 190,
          },
          {
            name: 'description',
          },
          {
            name: 'scriptVersion',
            width: 100,
            renderer: ({ value }) => <p>V{value}</p>,
          },
        ];
    const columns = [
      {
        name: 'runningService',
        width: 260,
      },
      {
        name: 'taskCode',
        width: 260,
      },
      ...fieldArr,
      {
        name: 'creatorName',
        width: 80,
        lock: 'right',
      },
      {
        name: 'action',
        width: 120,
        lock: 'right',
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.showScript(record, 'select')}>
              {intl.get('spfm.script.view.message.detail').d('详情')}
            </a>
            <a onClick={() => this.adaptorPosition(record)}>
              {intl.get('spfm.script.view.message.position').d('定位')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <>
        <Content>
          <Table
            dataSet={this.ds}
            virtualCell
            columns={columns}
            queryBarProps={{ defaultShowMore: true }}
          />
        </Content>
      </>
    );
  }
}
export default ScriptSearch;
