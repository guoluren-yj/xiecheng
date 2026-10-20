/**
 * DocFlow
 * 单据流组件
 * @date: 2021-09-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { memo, Suspense, useState } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { getCurrentOrganizationId, getCurrentUserId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { getEnvConfig } from 'utils/iocUtils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import cuxRemote from 'hzero-front/lib/utils/remote';

import DocRelation from './DocRelation';
import { queryNodeRelDocData } from './docFlowService';
import './index.less';

const { TabPane } = Tabs;

interface DocFlowProps {
  remote: {
    process: Function;
  };
  tableName: string; //
  tablePk: string;
  buttonType?: string;
  buttonText?: string;
}

const ButtonType = {
  button: 'button',
  aTag: 'aTag',
};

function DocFlow(props: DocFlowProps) {
  const [btnLoading, setbtnLoading] = useState(false);
  const { DOCFLOW_FLAG } = getEnvConfig();
  const { tableName, tablePk, buttonType = ButtonType.button, buttonText = intl.get('hzero.common.view.button.defaultDocFlowBtn').d('单据流'), remote } = props;
  const currentOrganizationId = getCurrentOrganizationId();
  const currentUserId = getCurrentUserId();

  const openDocFlowModal = () => {
    if (tableName && tablePk) {
      try {
        setbtnLoading(true);
        queryNodeRelDocData({ tableName, tablePk, currentOrganizationId }).then(res => {
          if (res) {
            const FlowChart = React.lazy( () => import('./FlowChart'));
            const flowModal = Modal.open({});
            flowModal.update({
              title: intl.get('component.docFlow.view.title.modal').d('单据全流程追踪'),
              drawer: true,
              okCancel: false,
              closable: true,
              okText: intl.get('hzero.common.button.close').d('关闭'),
              style: {
                width: 1200,
              },
              closeOnLocationChange: true,
              className: 'docFlow-modal-wrapper',
              children: (
                <Tabs defaultActiveKey="1" className='docFlow-modal-wrapper-tabs'>
                  <TabPane tab={intl.get('component.docFlow.view.tab.docFlow').d('流程图视图')} key="1">
                    <Suspense fallback={<div>{intl.get('hzero.common.view.load.loadingMsg').d('正在加载...')}</div>}>
                      <FlowChart
                        tableName={tableName}
                        tablePk={tablePk}
                        flowModal={flowModal}
                        currentOrganizationId={currentOrganizationId}
                        currentUserId={currentUserId}
                      />
                    </Suspense>
                  </TabPane>

                  <TabPane tab={intl.get('component.docFlow.view.tab.docRelation').d('列表视图')} key="2">
                    <DocRelation
                      remote={remote}
                      tableName={tableName}
                      tablePk={tablePk}
                      currentOrganizationId={currentOrganizationId}
                    />
                  </TabPane>
                </Tabs>
              ),
            });
          } else {
            notification.warning({
              message: intl
                .get('component.docFlow.view.action.warning.theCurrentDocumentsCapacity')
                .d('当前单据关联上下游节点数据超出显示上限。'),
            });
          }
        });
      } finally {
        setbtnLoading(false);
      }
    } else {
      notification.error({
        message: intl
          .get('component.docFlow.view.action.warning.noTableNameAndTablePk')
          .d('单据流查询异常，原因为尚未生成单据主键，请先保存单据再进行查询！'),
      });
    }
  };

  return (
    <div className="doc-flow">
      {buttonType === ButtonType.button ? (
        <Button
          wait={3000}
          style={{height: "28px"}}
          funcType={FuncType.link}
          color={ButtonColor.primary}
          icon='timeline'
          onClick={openDocFlowModal}
          loading={btnLoading}
        >
          {buttonText}
        </Button>
      ) : (
        <a onClick={openDocFlowModal}>{buttonText}</a>
      )}
    </div>
    );


}

export default formatterCollections({ code: ['component.docFlow', 'hzero.common'] })(cuxRemote({ code: 'DOC_FLOW'})(memo(DocFlow)));