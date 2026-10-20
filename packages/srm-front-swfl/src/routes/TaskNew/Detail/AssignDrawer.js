import React, { Component } from 'react';
import classnames from 'classnames';
import { Button } from 'choerodon-ui/pro';
import { Modal, Tooltip, Icon, Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { approveNameRenderTemp } from '@/utils/util';
import styles from './index.less';

const { Sidebar } = Modal;

export default class Drawer extends Component {
  @Bind()
  handleCleanEmployee(key, type) {
    const { approvalData, changeApprovalData } = this.props;
    // 驳回只能选择一个节点，故不用数组
    if (type === 'Jumped') {
      approvalData[type] = null;
    } else {
      const newData = approvalData[type].filter((item) => item.get('employeeId') !== key);
      approvalData[type] = newData;
    }
    changeApprovalData(approvalData);
  }

  @Bind()
  renderSelcectedEmployee(type, otherParams) {
    const { approvalData = [], handleChooseEmployee } = this.props;
    // 将 type 转换成审批动作 actionName,
    let approveActioName = '';
    if (type === 'addCc') {
      approveActioName = 'CarbonCopy';
    } else if (type.startsWith('nextNode')) {
      approveActioName = 'specify';
    } else {
      approveActioName = `${type.slice(0, 1).toUpperCase()}${type.slice(1)}`;
    }
    return (
      <>
        {!isEmpty(approvalData[type]) &&
          approvalData[type].map((item) => (
            <Tag
              color={approveNameRenderTemp(approveActioName).actionColor}
              key={item.get('employeeId')}
              closable
              onClose={() => this.handleCleanEmployee(item.get('employeeId'), type)}
            >
              {item.get('name')}
            </Tag>
          ))}
        <Tag
          onClick={() => handleChooseEmployee(type, otherParams)}
          style={{
            borderStyle: 'dashed',
            backgroundColor: '#fff',
            display: type === 'delegate' && !isEmpty(approvalData[type]) ? 'none' : 'inline-block',
          }}
        >
          <Icon type="add" style={{ color: '#333', marginRight: 0, fontSize: '0.14rem' }} />
        </Tag>
      </>
    );
  }

  @Bind()
  renderNextNodeApprover() {
    const {
      approvalData,
      task: { nextNodeApprover = [] },
    } = this.props;
    return nextNodeApprover.map(
      (node) =>
        (node.check === 'Y' || node.needAppoint === 'Y' || node.rejectedNeedAppoint === 'Y') && (
          <div style={{ marginBottom: '24px' }}>
            <div className={styles['label-col']}>
              {intl
                .get('hwfp.task.view.option.addNextApprover', {
                  nextActName: node.nextActName,
                })
                .d(`指派【${node.nextActName}】审批人`)}
              <Tooltip
                placement="bottom"
                title={intl
                  .get('hwfp.task.view.option.addNextApproverHelp')
                  .d('指定该节点的审批人')}
              >
                <Icon
                  type="help"
                  style={{
                    color: 'rgb(170, 170, 170)',
                    fontWeight: 'normal',
                    margin: '-2px 0 0 -2px',
                  }}
                />
              </Tooltip>
              {!isEmpty(approvalData[`nextNode-${node.nextActId}`]) && (
                <span
                  style={{
                    color: 'rgb(170, 170, 170)',
                    marginLeft: '16px',
                    fontWeight: 'normal',
                  }}
                >
                  {intl
                    .get('hwfp.task.view.title.haveChooseApproverSize', {
                      size: approvalData[`nextNode-${node.nextActId}`].length,
                    })
                    .d(`已选择${approvalData[`nextNode-${node.nextActId}`].length}个审批人`)}
                </span>
              )}
            </div>
            <div style={{ marginLeft: '10px', lineHeight: '28px' }}>
              {this.renderSelcectedEmployee(`nextNode-${node.nextActId}`, node)}
            </div>
          </div>
        )
    );
  }

  render() {
    const { handleToogleVisible } = this.props;
    return (
      <Sidebar
        visible
        closable
        maskClosable={false}
        title={intl.get('hwfp.task.view.message.addNextApprover').d('指派审批人')}
        width={700}
        className={classnames(styles['modal-drawer'], styles['approval-drawer'])}
        bodyStyle={{ flex: '1 1' }}
        onCancel={handleToogleVisible}
        footer={
          <Button color="primary" funcType="raised" onClick={handleToogleVisible}>
            {intl.get('hzero.common.button.ok').d('提交')}
          </Button>
        }
      >
        {this.renderNextNodeApprover()}
      </Sidebar>
    );
  }
}
