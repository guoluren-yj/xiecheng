/**
 * GlobalConfigModal - 工作流全局配置
 * @date: 2022-12-13
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useRef } from 'react';
import {
  Form,
  TimePicker,
  Row,
  Col,
  Icon,
  CheckBox,
  Radio,
  Picture,
  IntlField,
  NumberField,
} from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import RowLayoutImg from '@/assets/rowLayout.png';
import ColumnLayoutImg from '@/assets/columnLayout.png';
import InOpenImg from '@/assets/inOpen.png';
import PassInImg from '@/assets/passIn.png';
import intl from 'utils/intl';

function GlobalConfigModal(props = {}) {
  const { dataSet, approvalActionSeqDataMap } = props;
  const currentTargetRef = useRef();

  const sortObj = (params = { Approved: '3', More: '1', Rejected: '2' }) => {
    const result = [];
    const values = Object.values(params).sort();
    for (let i = 0; i <= values.length; i++) {
      if (params.Approved === values[i]) {
        result.push({
          id: i + 1,
          key: 'Approved',
          text: intl.get('hwfm.common.title.approve').d('审批通过'),
        });
      }
      if (params.More === values[i]) {
        result.push({
          id: i + 1,
          key: 'More',
          text: intl.get('hzero.common.button.option').d('更多'),
        });
      }
      if (params.Rejected === values[i]) {
        result.push({
          id: i + 1,
          key: 'Rejected',
          text: intl.get('hwfp.task.view.rejected').d('审批拒绝'),
        });
      }
    }
    return result;
  };

  const [actions, sortActions] = useState(sortObj(approvalActionSeqDataMap));

  const filterTime = (currentDate) => {
    const hour = currentDate.get('h');
    const minute = currentDate.get('m');
    const second = currentDate.get('s');
    if (hour === 0 && minute === 0 && second === 0) {
      return false;
    } else {
      return true;
    }
  };

  const dragStart = (target) => {
    currentTargetRef.current = target;
  };

  const drop = ({ key, text }) => {
    const currentTarget = currentTargetRef.current;
    const newActions = actions.map((action) => {
      if (action.key === key) {
        return { ...action, ...currentTarget };
      }
      if (action.key === currentTarget.key) {
        return { ...action, key, text };
      }
      return action;
    });
    sortActions(newActions);
    if (dataSet.current) {
      const dataMap = {};
      newActions.map(({ key: actionKey, id }) => {
        dataMap[actionKey] = id;
        return id;
      });
      dataSet.current.set('approvalActionSeqDataMap', dataMap);
    }
  };

  const dragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  const getPopoverContent = (code) => {
    let srcImg = '';
    if (code === 'row') {
      srcImg = RowLayoutImg;
    } else if (code === 'column') {
      srcImg = ColumnLayoutImg;
    } else if (code === 'inOpen') {
      srcImg = InOpenImg;
    } else if (code === 'passIn') {
      srcImg = PassInImg;
    }
    return (
      <div style={{ height: '100px', width: '200px' }}>
        <Picture border src={srcImg} width={200} height={100} objectFit="cover" />
      </div>
    );
  };

  const tooltipList = [
    'approved',
    'rejected',
    'delegate',
    'rebut',
    'addSign',
    'approveAndAddSign',
    'recall',
    'revoke',
    'carbonCopy',
    'remind',
  ];

  return (
    <Form dataSet={dataSet} labelWidth="auto" labelLayout="float" className="global-config-form">
      <Row>
        <Col span={24} className="sub-title">
          <span className="green-dot" />
          <span>{intl.get('hwfp.common.model.onTimeRemind.config').d('消息提醒配置')}</span>
        </Col>
      </Row>
      <CheckBox name="enabledFlag" />
      <TimePicker name="remindDate" step={{ minute: 60, second: 60 }} filter={filterTime} />
      <NumberField name="remindIntervalTime" />
      <div>
        <div>
          {intl
            .get('hwfp.common.model.msgFormMenuDisplayFlag.newTitle')
            .d('消息推送外部系统，跳转SRM展示表单')}
        </div>
        <Radio style={radioStyle} name="msgFormMenuDisplayFlag" value={1}>
          {intl
            .get('hwfp.common.model.msgFormMenuDisplayFlag.inOpen')
            .d('进入系统，打开审批明细页面')}
          <Popover placement="topRight" content={getPopoverContent('inOpen')} trigger="hover">
            <Icon
              type="help"
              style={{ fontSize: '14px', lineHeight: '14px', marginLeft: '8px', color: '#868D9C' }}
            />
          </Popover>
        </Radio>
        <Radio style={radioStyle} name="msgFormMenuDisplayFlag" value={0}>
          {intl
            .get('hwfp.common.model.msgFormMenuDisplayFlag.passIn')
            .d('仅审批明细页面，审批通过进入系统')}
          <Popover placement="topRight" content={getPopoverContent('passIn')} trigger="hover">
            <Icon
              type="help"
              style={{ fontSize: '14px', lineHeight: '14px', marginLeft: '8px', color: '#868D9C' }}
            />
          </Popover>
        </Radio>
      </div>
      <div>
        <div>
          {intl.get('hwfp.common.model.afterApprove.title').d('消息推送外部系统，跳转SRM展示表单')}
        </div>
        <Radio style={radioStyle} name="msgTabCloseFlag" value={0}>
          {intl.get('hwfp.common.model.afterApprove.linkToList').d('自动跳转待审批列表')}
        </Radio>
        <Radio style={radioStyle} name="msgTabCloseFlag" value={1}>
          {intl.get('hwfp.common.model.afterApprove.closeAndBack').d('关闭审批页面，返回外部系统')}
        </Radio>
      </div>
      <Row>
        <Col span={24} className="sub-title mt-32">
          <span className="green-dot" />
          <span>
            {intl.get('hwfp.common.model.layoutSetting.newTitle').d('审批工作台样式配置')}
          </span>
        </Col>
      </Row>
      <div>
        <div>
          {intl
            .get('hwfp.common.model.approvalFormMergeFlag.newTitle')
            .d('审批表单与审批记录布局选择')}
        </div>
        <Radio style={radioStyle} name="approvalFormMergeFlag" value={0}>
          {intl.get('hwfp.common.model.approvalFormMergeFlag.row').d('左右布局，Tab切换查看')}
          <Popover placement="topRight" content={getPopoverContent('row')} trigger="hover">
            <Icon
              type="help"
              style={{ fontSize: '14px', lineHeight: '14px', marginLeft: '8px', color: '#868D9C' }}
            />
          </Popover>
        </Radio>
        <Radio style={radioStyle} name="approvalFormMergeFlag" value={1}>
          {intl.get('hwfp.common.model.approvalFormMergeFlag.column').d('上下布局，鼠标滚动查看')}
          <Popover placement="topRight" content={getPopoverContent('column')} trigger="hover">
            <Icon
              type="help"
              style={{ fontSize: '14px', lineHeight: '14px', marginLeft: '8px', color: '#868D9C' }}
            />
          </Popover>
        </Radio>
      </div>
      <div>
        <div>
          {intl
            .get('hwfp.common.modal.dragContentSort.newTitle')
            .d('审批按钮排序，拖动内容区域排序')}
        </div>
        <div className="buttons">
          {actions.map(({ id, text, key }) => (
            <div
              className="custom-bottom"
              draggable
              onDragStart={() => dragStart({ text, key })}
              onDrop={() => drop({ text, key })}
              onDragOver={dragOver}
            >
              <span>
                <Icon
                  type="more_vert"
                  style={{ width: '4px', lineHeight: '23px', color: '#868D9C' }}
                />
                <Icon type="more_vert" style={{ lineHeight: '23px', color: '#868D9C' }} />
                {text}
              </span>
              <span>{id}</span>
            </div>
          ))}
        </div>
        <div style={{ margin: '8px 0' }}>
          {intl.get('hwfp.common.approval.button.tooltip').d('审批按钮气泡提示')}
        </div>
        <Row>
          {tooltipList.map((item, index) => (
            <Col span={10} offset={index % 2 ? 2 : 0}>
              <IntlField name={item} style={{ marginBottom: '8px' }} />
            </Col>
          ))}
        </Row>
      </div>
      <Row>
        <Col span={24} className="sub-title mt-32">
          <span className="green-dot" />
          <span>{intl.get('hwfp.common.modal.reportSetting').d('审批记录设置')}</span>
        </Col>
      </Row>
      <CheckBox name="autoApprovalFilterFlag" />
      <CheckBox name="noAssigneeApprovalFilterFlag" />
      <CheckBox name="multiApprovalFilterFlag" />
    </Form>
  );
}
export default formatterCollections({
  code: ['hwfp.common', 'hwfm.common', 'hwfp.task', 'hzero.common'],
})(GlobalConfigModal);
