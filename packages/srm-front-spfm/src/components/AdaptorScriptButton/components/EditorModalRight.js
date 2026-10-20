/**
 * EditorModalRight.js
 * 适配器js编辑器右侧内容
 * @date: 2021-11-1
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { CodeArea } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import styles from './EditorModal.less';

const tenantFlag = isTenantRoleLevel();
const { TabPane } = Tabs;
export default function EditorModalRight(props = {}) {
  const { scriptOutputDs, jsxOptions, jsonOptions, sqlOptions, scriptCodeDs } = props.queryParam;

  return (
    <div>
      <Tabs defaultActiveKey="outputJson">
        <TabPane
          tab={intl.get('spfm.adaptorPlayGround.view.title.outputJson').d('代码执行结果')}
          key="outputJson"
        >
          <CodeArea
            dataSet={scriptOutputDs}
            name="output"
            options={jsonOptions}
            format={JSONFormatter}
            style={{ height: 780 }}
            className={styles['editor-right-outputLog']}
          />
        </TabPane>
        <TabPane
          tab={intl.get('spfm.adaptorPlayGround.view.title.logOutput').d('日志输出')}
          key="logOutput"
        >
          <CodeArea
            dataSet={scriptOutputDs}
            name="outPutLog"
            options={jsxOptions}
            style={{ height: 780 }}
            className={styles['editor-right-outputLog']}
            readOnly
          />
        </TabPane>
        {!tenantFlag ? (
          <TabPane
            tab={intl.get('spfm.adaptorPlayGround.view.title.queryBlockSql').d('QueryBlock(Beta)')}
            key="queryBlockSql"
          >
            <CodeArea
              dataSet={scriptOutputDs}
              name="queryBlockSql"
              options={sqlOptions}
              style={{ height: 780 }}
              className={styles['editor-right-outputLog']}
              readOnly
            />
          </TabPane>
        ) : (
          ''
        )}
        <TabPane
          tab={intl.get('spfm.adaptorPlayGround.view.title.inputJson').d('测试用例')}
          key="inputJson"
        >
          <CodeArea
            dataSet={scriptCodeDs}
            name="input"
            options={jsonOptions}
            format={JSONFormatter}
            style={{ height: 780 }}
            className={styles['editor-right-outputLog']}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}
