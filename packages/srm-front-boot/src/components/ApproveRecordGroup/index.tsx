import type { ReactNode } from 'react';
import React, { useMemo, useEffect, useState } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { isNil } from 'lodash';

import { getCurrentUser, getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getProcessDefineConfig } from '../..//services/taskService';
import ApprovalRecord from '../ApproveRecord';
import ApprovalReply from '../ApprovalReply';
import './index.less';

const { Panel } = Collapse;

type Group = {
  title: ReactNode;
  children: any[];
}

interface IApproveRecordGroup {
  group: Group[];
  className?: string;
}

function ApproveRecordGroup({
  group,
  className,
}: IApproveRecordGroup) {

  const [state, setState] = useState<{
    forecastUnfold: boolean,
    commentUnfold: boolean,
    showModelStandardTime: boolean,
  }>({
    forecastUnfold: false,
    commentUnfold: false,
    showModelStandardTime: false,
  });

  useEffect(() => {
    fetchProcessGlobalConfig();
  }, []);

  const fetchProcessGlobalConfig = () => {
    getProcessDefineConfig().then((res: any) => {
      if (getResponse(res)) {
        setState({
          forecastUnfold: res.forecastUnfoldFlag === 1,
          commentUnfold: res.commentUnfoldFlag === 1,
          showModelStandardTime: res.modelStandardTimeFlag === 1,
        });
      }
    });
  };

  const haEmployeeCount = useMemo(() => {
    const { additionInfo } = getCurrentUser() || {};
    const { employeeCode } = additionInfo || {};
    return !isNil(employeeCode);
  }, []);

  const handleComment = (event, groupItem) => {
    event.stopPropagation();
    const { children } = groupItem;
    if (children && children.length) {
      const param: {
        taskId?: string;
        processInstanceId?: string[];
      } = {};
      const processInstanceId: Set<string> = new Set(); // 取children的processInstanceId, 需去重
      const approvingRecord = children.find(i => i && !['startEvent', 'endEvent', 'CommentCarbonCopy'].includes(i.actType) && !i.action);
      if (approvingRecord && approvingRecord.id) {
        // 取审批中节点的taskid，没有审批中节点就不传
        param.taskId = approvingRecord.id;
        if (approvingRecord.processInstanceId) {
          processInstanceId.add(approvingRecord.processInstanceId);
        }
      }
      children.forEach(i => {
        if (i.processInstanceId) {
          processInstanceId.add(i.processInstanceId);
        }
      });
      param.processInstanceId = Array.from(processInstanceId);
      Modal.open({
        title: intl.get('hwfp.task.button.comment').d('评论'),
        footer: null,
        drawer: true,
        bodyStyle: {
          padding: 0,
          background: '#F8F9FB',
        },
        closable: true,
        children: <ApprovalReply {...param} />,
      });
    }
  };

  const renderGroupItem = (groupItem, index) => {
    const { title, children } = groupItem;
    return (
      <Panel
        header={title}
        key={index}
        extra={
          // 任取一条记录，commentStartFlag 为 1 表示 允许发起评论
          // 若当前账号未绑定员工 则不允许发起评论
          children && children[0] && children[0].commentStartFlag === 1 && haEmployeeCount ?
          (
            <Button
              funcType={FuncType.link}
              onClick={(event) => handleComment(event, groupItem)}
              style={{ fontWeight: 600, height: '22px', lineHeight: '22px' }}
            >
              <Icon type='textsms-o' style={{ fontWeight: 400 }} />
              {intl.get("srm.common.view.button.addComment").d('添加评论')}
            </Button>
        ) : undefined}
      >
        <ApprovalRecord
          noCommentBtn
          data={children}
          getProcessGlobalConfig={false}
          forecastUnfold={state.forecastUnfold}
          commentUnfold={state.commentUnfold}
          showModelStandardTime={state.showModelStandardTime}
        />
      </Panel>
    );
  };

  const renderGroup = () => {
    if (!group || !group.length) {
      return null;
    }
    return (
      <div className={className}>
        <Collapse bordered={false} expandIconPosition='text-right' defaultActiveKey={['0']} className='srm-approval-record-group'>
          {group.map(renderGroupItem)}
        </Collapse>
      </div>
    );
  };

  return renderGroup();
}

export default formatterCollections({
  code: ['srm.common', 'hwfp.task'],
})(ApproveRecordGroup);