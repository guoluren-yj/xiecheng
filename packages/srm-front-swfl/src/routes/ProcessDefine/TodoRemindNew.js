/**
 * TodoRemind - 流程定义设置
 */
import React, { useState, useRef } from 'react';
import { Modal } from 'hzero-ui';
import {
  Form,
  TimePicker,
  Row,
  Col,
  CheckBox,
  Radio,
  Picture,
  Tooltip,
  IntlField,
  NumberField,
  DataSet,
  Output,
  Modal as C7NModal,
} from 'choerodon-ui/pro';
import { Popover, Tag, Icon, Text, Alert, Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import RowLayoutImg from '@/assets/rowLayout.png';
import ColumnLayoutImg from '@/assets/columnLayout.png';
import InOpenImg from '@/assets/inOpen.png';
import PassInImg from '@/assets/passIn.png';
import { deleteProcessTagConfs } from '@/services/processDefineService';
import styles from './TodoRemind.less';
import TaskTag from './TaskTag';
import AppointApprover from './AppointApprover';

function TodoRemind(props = {}) {
  const { anchor, title, visible, onOk, onCancel, approvalActionSeqDataMap, dataSet } = props;
  const currentTargetRef = useRef();
  const [activeKey, setActiveKey] = useState([
    'message-notifiction',
    'redirect',
    'approval-workbench',
    'approval-record',
    'approval-config',
  ]);
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

  const saveBtn = async () => {
    const flag = await dataSet.validate();
    if (flag) {
      onOk(dataSet.current.toJSONData());
    }
  };

  const handleEditTaskTag = ({ value, list, record, index }) => {
    const isNew = isNil(value) || isNil(value.labelId);
    const formDs = new DataSet({
      paging: false,
      selection: false,
      fields: [
        {
          name: 'tenantId',
          defaultValue: getCurrentOrganizationId(),
        },
        {
          name: 'labelCode',
          maxLength: 30,
          label: intl.get('hwfp.processDefine.model.tag.code').d('标签编码'),
          required: true,
          disabled: !isNew,
          format: 'uppercase',
          validator: (v) => {
            const pattern = /^[A-Z][A-Z0-9_]*$/;
            if (!pattern.test(v)) {
              return intl
                .get('hwfp.processDefine.validation.codeUpperBegin')
                .d('全大写及数字，必须以字母开头，可包含“_”');
            }
            if (
              list &&
              list.length &&
              isNew &&
              list.some((item, i) => item.labelCode === v && (isNil(index) || i !== index))
            ) {
              return intl
                .get('hwfp.processDefine.validation.sameLabelCode')
                .d('标签编码不能重复！');
            }
          },
        },
        {
          name: 'description',
          type: 'intl',
          maxLength: 30,
          label: intl.get('hwfp.processDefine.model.tag.name').d('标签名称'),
          required: true,
        },
        {
          name: 'labelColor',
          type: 'string',
          label: intl.get('hwfp.processDefine.model.tag.color').d('标签颜色'),
          defaultValue: 'red',
        },
      ],
    });
    const formRecord = value ? formDs.create(value) : formDs.create();
    formRecord.status = 'update';
    C7NModal.open({
      title: value
        ? intl.get('hwfp.processDefine.view.title.editTag').d('编辑标签')
        : intl.get('hwfp.processDefine.view.title.createTag').d('新建标签'),
      drawer: true,
      autoCenter: true,
      style: { width: '380px' },
      children: <TaskTag record={formRecord} />,
      okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      onOk: async () => {
        const flag = await formRecord.validate();
        if (flag) {
          let processLabellist = record.get('labelConfList');
          if (!processLabellist || !processLabellist.length) {
            processLabellist = [];
          }
          const newLabel = formRecord.toData();
          if (value) {
            processLabellist = processLabellist.map((item, i) => {
              if (!isNil(value.labelId)) {
                return item.labelId === newLabel.labelId ? newLabel : item;
              } else {
                return i === index ? newLabel : item;
              }
            });
          } else {
            processLabellist.push(newLabel);
          }
          record.set('labelConfList', processLabellist);
        }
        return flag;
      },
    });
  };

  const handleDeleteFastReply = async ({ listData, record, index }) => {
    C7NModal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示?'),
      children: intl
        .get('hwfp.processDefine.view.message.deleteFastReply')
        .d('确定删除快捷回复吗?'),
      onOk: () => {
        const newValue = listData.splice(index, 1);
        record.set('labelCfastReplyListnfList', newValue);
      },
    });
  };

  const handleDeleteTaskTag = async ({ value, record, index }) => {
    const { labelId, description, _token } = value;
    const data = [
      {
        labelId,
        description,
        _token,
      },
    ];
    const removeNew = isNil(value.labelId);
    let validateResult;
    if (!removeNew) {
      const res = await deleteProcessTagConfs({ checkFlag: 1 }, data);
      if (res && res.failed && res.message) {
        validateResult = res.message;
      }
    }
    C7NModal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示?'),
      children:
        validateResult || intl.get('hwfp.processDefine.view.message.deleteTag').d('确定删除标签?'),
      onOk: () => {
        let processLabellist = record.get('labelConfList');
        if (!processLabellist || !processLabellist.length) {
          processLabellist = [];
        }
        if (processLabellist && processLabellist[index]) {
          processLabellist = processLabellist.filter((_, i) => i !== index);
        }
        if (!removeNew) {
          deleteProcessTagConfs({ checkFlag: 0 }, data).then((res) => {
            if (getResponse(res)) {
              notification.success();
              record.set('labelConfList', processLabellist);
            }
          });
        } else {
          record.set('labelConfList', processLabellist);
        }
      },
    });
  };

  const handleEditFastReply = ({ editData, isCreate, listData, index, originRecord, name }) => {
    const formDs = new DataSet({
      fields: [
        {
          name: 'content',
          label: intl.get('hwfp.common.view.title.fastReply').d('快捷回复'),
          required: true,
          maxLength: 1000,
          type: 'intl',
        },
      ],
    });
    const record = isCreate ? formDs.create() : formDs.create(editData);
    record.status = 'update';
    C7NModal.open({
      title: isCreate
        ? intl.get('hwfp.common.view.title.createFastReply').d('新建快捷回复')
        : intl.get('hwfp.common.view.title.editFastReply').d('编辑快捷回复'),
      drawer: true,
      style: { width: '380px' },
      bodyStyle: { padding: '0 0 20px', overflowX: 'hidden' },
      children: (
        <div>
          <Alert
            closable
            type="info"
            showIcon
            className={styles['fast-reply-alert']}
            description={intl
              .get('hwfp.common.view.title.fastReply.help')
              .d('管理员新增或编辑快捷回复，所有用户均会生效，快捷回复最多长度1000')}
          />
          <Form
            record={record}
            labelLayout="float"
            style={{ marginTop: '16px', padding: '0 20px' }}
          >
            <IntlField name="content" type="multipleLine" />
          </Form>
        </div>
      ),
      onOk: async () => {
        const flag = await record.validate();
        if (!flag) {
          return false;
        }
        const data = record.toData();
        const newListData = listData && listData.length ? listData : [];
        if (isCreate) {
          newListData.push(data);
        } else {
          newListData[index] = data;
        }
        originRecord.set(name, newListData);
        return true;
      },
    });
  };

  const renderTaskTag = ({ value, record }) => {
    const tags = [];
    if (value && value.length) {
      value.forEach((v, i) => {
        tags.push(
          <Tag
            key={v.labelId}
            color={v.labelColor}
            className={styles['process-label']}
            onClick={() => handleEditTaskTag({ value: v, list: value, record, index: i })}
          >
            <Text style={{ maxWidth: '300px' }}>{v.description}</Text>
            <Tooltip title={intl.get('hzero.common.button.delete').d('删除')}>
              <span
                className={styles['process-label-close']}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteTaskTag({ value: v, record, index: i });
                }}
              >
                <Icon type="close" />
              </span>
            </Tooltip>
          </Tag>
        );
      });
    }
    if (!value || value.length < 10) {
      tags.push(
        <Tooltip title={intl.get('hwfp.processDefine.view.title.createTag').d('新建标签')}>
          <Tag
            key="add"
            className={styles['process-label-add']}
            onClick={() => handleEditTaskTag({ record, list: value })}
          >
            <Icon type="add" style={{ fontSize: '12px' }} />
          </Tag>
        </Tooltip>
      );
    }
    return tags;
  };

  const rederFastReply = ({ value, record, name }) => {
    const tags = [];
    if (value && value.length) {
      value.forEach((v, i) => {
        tags.push(
          <div
            key={v.id}
            className={styles['fast-reply-label']}
            onClick={() =>
              handleEditFastReply({
                editData: v,
                listData: value,
                index: i,
                originRecord: record,
                name,
              })
            }
          >
            <Text style={{ maxWidth: '300px' }}>{v.content}</Text>
            <Tooltip title={intl.get('hzero.common.button.delete').d('删除')}>
              <span
                className={styles['fast-reply-label-close']}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteFastReply({ listData: value, record, index: i });
                }}
              >
                <Icon type="close" />
              </span>
            </Tooltip>
          </div>
        );
      });
    }
    if (!value || value.length < 10) {
      tags.push(
        <Tooltip title={intl.get('hwfp.common.view.title.createFastReply').d('新建快捷回复')}>
          <div
            key="add"
            className={styles['fast-reply-label-add']}
            onClick={() =>
              handleEditFastReply({ listData: value, originRecord: record, isCreate: true, name })
            }
          >
            <Icon type="add" style={{ fontSize: '12px' }} />
          </div>
        </Tooltip>
      );
    }
    return tags;
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

  const handleChangeCollpase = (key) => {
    setActiveKey(key);
  };

  return (
    <Modal
      title={<span style={{ fontWeight: '600' }}>{title}</span>}
      width={520}
      wrapClassName={`ant-modal-sidebar-${anchor}`}
      transitionName={`move-${anchor}`}
      visible={visible}
      // confirmLoading={saving}
      onOk={saveBtn}
      okText={intl.get('hzero.common.button.ok').d('确定')}
      onCancel={onCancel}
      cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      destroyOnClose
      zIndex={999}
    >
      <Collapse
        ghost
        className={styles.collapse}
        expandIconPosition="text-right"
        activeKey={activeKey}
        onChange={handleChangeCollpase}
      >
        <Collapse.Panel
          forceRender
          key="message-notifiction"
          header={
            <div className="sub-title">
              <span className="green-dot" />
              <span>{intl.get('hwfp.common.model.onTimeRemind.config').d('消息提醒配置')}</span>
            </div>
          }
        >
          <Form
            dataSet={dataSet}
            labelWidth="auto"
            labelLayout="float"
            className={styles['process-define-config-form']}
          >
            <CheckBox name="enabledFlag" />
            <TimePicker name="remindDate" step={{ minute: 60, second: 60 }} filter={filterTime} />
            <NumberField name="remindIntervalTime" />
          </Form>
        </Collapse.Panel>
        <Collapse.Panel
          forceRender
          key="redirect"
          header={
            <div className="sub-title">
              <span className="green-dot" />
              <span>
                {intl.get('hwfp.common.model.onTimeRemind.redirectConfig').d('外部消息跳转SRM配置')}
              </span>
            </div>
          }
        >
          <Form
            dataSet={dataSet}
            labelWidth="auto"
            labelLayout="float"
            className={styles['process-define-config-form']}
          >
            <div>
              <div style={{ marginTop: '8px' }}>
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
                    style={{
                      fontSize: '14px',
                      lineHeight: '14px',
                      marginLeft: '8px',
                      color: '#868D9C',
                      verticalAlign: 'text-bottom',
                    }}
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
                    style={{
                      fontSize: '14px',
                      lineHeight: '14px',
                      marginLeft: '8px',
                      color: '#868D9C',
                      verticalAlign: 'text-bottom',
                    }}
                  />
                </Popover>
              </Radio>
            </div>
            <div>
              <div style={{ marginTop: '-8px' }}>
                {intl.get('hwfp.common.model.afterApprove.title').d('待办审批后跳转页面设置')}
                <Tooltip
                  title={intl
                    .get('hwfp.common.model.afterApprove.title.help')
                    .d(
                      '适配场景：待办跳转SRM审批后，跳转SRM待办列表或关闭SRM页面跳转客户外部待办列表'
                    )}
                >
                  <Icon
                    type="help"
                    style={{
                      fontSize: '14px',
                      lineHeight: '14px',
                      marginLeft: '8px',
                      color: '#868D9C',
                      verticalAlign: 'text-bottom',
                    }}
                  />
                </Tooltip>
              </div>
              <Radio style={{ display: 'block' }} name="msgTabCloseFlag" value={0}>
                {intl.get('hwfp.common.model.afterApprove.linkToList').d('自动跳转待审批列表')}
              </Radio>
              <Radio style={{ display: 'block' }} name="msgTabCloseFlag" value={1}>
                {intl
                  .get('hwfp.common.model.afterApprove.closeAndBack')
                  .d('关闭审批页面，返回外部系统')}
              </Radio>
            </div>
            <div>
              <div style={{ marginTop: '-8px' }}>
                {intl.get('hwfp.common.model.ApproveFinish.title').d('已审批待办链接跳转设置')}
                <Tooltip
                  title={intl
                    .get('hwfp.common.model.ApproveFinish.title.help')
                    .d('适配场景：外部待办链接无法通过已办更新，可通过该配置支持跳转对应已办详情')}
                >
                  <Icon
                    type="help"
                    style={{
                      fontSize: '14px',
                      lineHeight: '14px',
                      marginLeft: '8px',
                      color: '#868D9C',
                      verticalAlign: 'text-bottom',
                    }}
                  />
                </Tooltip>
              </div>
              <Radio style={{ display: 'block' }} name="todoJumpApprovedFlag" value={0}>
                {intl.get('hwfp.common.model.ApproveFinish.linkToProcess').d('跳转待办审批列表')}
              </Radio>
              <Radio style={{ display: 'block' }} name="todoJumpApprovedFlag" value={1}>
                {intl.get('hwfp.common.model.ApproveFinish.linkToDetail').d('跳转已办流程详情')}
              </Radio>
            </div>
          </Form>
        </Collapse.Panel>
        <Collapse.Panel
          forceRender
          key="approval-workbench"
          header={
            <div className="sub-title">
              <span className="green-dot" />
              <span>
                {intl.get('hwfp.common.model.layoutSetting.newTitle').d('审批工作台样式配置')}
              </span>
            </div>
          }
        >
          <Form
            dataSet={dataSet}
            labelWidth="auto"
            labelLayout="float"
            className={styles['process-define-config-form']}
          >
            <div style={{ marginTop: '8px' }}>
              <Tooltip
                title={intl
                  .get('hwfp.common.model.approvalFormMergeMessage')
                  .d('配置后审批工作台界面的审批表单和审批记录会合并上下拼接展示')}
              >
                {intl
                  .get('hwfp.common.model.approvalFormMergeFlag.newTitle')
                  .d('审批表单与审批记录布局选择')}
              </Tooltip>
            </div>
            <Radio style={{ display: 'block' }} name="approvalFormMergeFlag" value={0}>
              {intl.get('hwfp.common.model.approvalFormMergeFlag.row').d('左右布局，Tab切换查看')}
              <Popover placement="topRight" content={getPopoverContent('row')} trigger="hover">
                <Icon
                  type="help"
                  style={{
                    fontSize: '14px',
                    lineHeight: '14px',
                    marginLeft: '8px',
                    color: '#868D9C',
                    verticalAlign: 'text-bottom',
                  }}
                />
              </Popover>
            </Radio>
            <Radio style={{ display: 'block' }} name="approvalFormMergeFlag" value={1}>
              {intl
                .get('hwfp.common.model.approvalFormMergeFlag.column')
                .d('上下布局，鼠标滚动查看')}
              <Popover placement="topRight" content={getPopoverContent('column')} trigger="hover">
                <Icon
                  type="help"
                  style={{
                    fontSize: '14px',
                    lineHeight: '14px',
                    marginLeft: '8px',
                    color: '#868D9C',
                    verticalAlign: 'text-bottom',
                  }}
                />
              </Popover>
            </Radio>
            <div>
              {intl
                .get('hwfp.common.modal.dragContentSort.newTitle')
                .d('审批按钮排序，拖动内容区域排序')}
            </div>
            <div className={styles.buttons}>
              {actions.map(({ id, text, key }) => (
                <div
                  className={styles['custom-bottom']}
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
            {/* 审批工作台显示挂起原因 */}
            <CheckBox name="approvalShowSuspend">
              {intl.get('hwfp.common.model.approvalShowSuspend').d('审批工作台显示挂起原因')}
              <Popover
                placement="topRight"
                content={intl
                  .get('hwfp.common.model.approvalShowSuspend.help')
                  .d(
                    '勾选后在审批工作台我发起页签、审批进度组件会显示挂起原因，便于发起人知晓具体的挂起原因。'
                  )}
                trigger="hover"
              >
                <Icon
                  type="help"
                  style={{
                    fontSize: '14px',
                    lineHeight: '14px',
                    marginLeft: '8px',
                    color: '#868D9C',
                    verticalAlign: 'text-bottom',
                  }}
                />
              </Popover>
            </CheckBox>
          </Form>
        </Collapse.Panel>
        <Collapse.Panel
          forceRender
          key="approval-record"
          header={
            <div className="sub-title">
              <span className="green-dot" />
              <span>{intl.get('hwfp.common.modal.reportSetting').d('审批记录设置')}</span>
            </div>
          }
        >
          <Form
            dataSet={dataSet}
            labelWidth="auto"
            labelLayout="float"
            className={styles['process-define-config-form1']}
          >
            <CheckBox name="autoApprovalFilterFlag" />
            <CheckBox name="noAssigneeApprovalFilterFlag" />
            <CheckBox name="multiApprovalFilterFlag" />
            <CheckBox name="commentUnfoldFlag" />
            <CheckBox name="forecastUnfoldFlag" />
            <CheckBox name="modelStandardTimeFlag" />
          </Form>
        </Collapse.Panel>
        <Collapse.Panel
          forceRender
          key="approval-config"
          header={
            <div className="sub-title">
              <span className="green-dot" />
              <span>{intl.get('hwfp.common.view.title.approve_setting').d('审批设置')}</span>
            </div>
          }
        >
          <Form
            dataSet={dataSet}
            labelWidth="auto"
            labelLayout="float"
            className={styles['process-define-config-form1']}
          >
            <Output name="labelConfList" renderer={renderTaskTag} />
            <Output name="fastReplyList" renderer={rederFastReply} />
            <CheckBox name="disableAutoApprovalFlag" showHelp="tooltip" />
            <CheckBox
              name="jumpConsistencyCheckFlag"
              label={
                <>
                  {intl
                    .get('hwfp.common.view.title.jumpConsistencyCheckFlag')
                    .d('开启跳过中间节点跳转线是否一致强校验')}
                  <Tooltip
                    title={intl
                      .get('hwfp.common.view.title.jumpConsistencyCheckFlag.tip')
                      .d('开启跳过中间节点跳转线是否一致强校验')}
                  >
                    <Icon
                      type="help"
                      style={{ verticalAlign: 'text-bottom', marginLeft: '2px', fontSize: '16px' }}
                    />
                  </Tooltip>
                </>
              }
            />
            <CheckBox
              name="stepRebutFlag"
              label={
                <>
                  {intl.get('hwfp.common.view.title.stepRebutFlag').d('逐级驳回')}
                  <Tooltip
                    title={intl
                      .get('hwfp.common.view.title.stepRebutFlag.tip')
                      .d(
                        '默认驳回操作可驳回任意节点(审批人选择需驳回的节点)，开启该配置后，驳回操作仅支持驳回上级，无需选择驳回节点，且流程“驳回选择路径”配置项无需选择'
                      )}
                  >
                    <Icon
                      type="help"
                      style={{ verticalAlign: 'text-bottom', marginLeft: '2px', fontSize: '16px' }}
                    />
                  </Tooltip>
                </>
              }
            />
            <CheckBox name="rejectJumpOriginApproverFlag" />
            {dataSet.current && dataSet.current.get('rejectJumpOriginApproverFlag') === 1 && (
              <CheckBox name="rejectJumpAutoApprovedFlag" />
            )}
            <div>
              <div style={{ color: '#868d9c', fontWeight: 500 }}>
                {intl
                  .get('hwfp.common.model.approverResignStrategy.title')
                  .d('审批人离职或禁用处理方式')}
                <Tooltip
                  title={intl
                    .get('hwfp.common.model.approverResignStrategy.title.help')
                    .d(
                      '节点配置的审批规则找到离职/禁用员工处理方式配置，可选择1)不做任何处理，审批人为空，存在节点找不到审批人挂起的情况。2)执行离职审批人的“自动转交配置"与“自动处理规则-固定时问转交配置”，找到生效审批人，若未找到可选择，审批人为空，流程挂起，或者配置转交的审批人'
                    )}
                >
                  <Icon
                    type="help"
                    style={{
                      fontSize: '14px',
                      lineHeight: '14px',
                      marginLeft: '8px',
                      color: '#868D9C',
                      verticalAlign: 'text-bottom',
                    }}
                  />
                </Tooltip>
              </div>
              <Radio
                className={styles['todo-remind-radio']}
                name="approverResignStrategy"
                value="DELEGATE_SUSPENDED"
              >
                <div className={styles['todo-remind-radio-label']}>
                  {intl
                    .get('hwfp.common.model.approverResignStrategy.delegateSuspended')
                    .d('先执行审批人自动转交配置，未找到审批人，流程挂起')}
                </div>
              </Radio>
              <Radio
                className={styles['todo-remind-radio']}
                name="approverResignStrategy"
                value="DELEGATE_DEFAULT"
              >
                <div className={styles['todo-remind-radio-label']}>
                  {intl
                    .get('hwfp.common.model.approverResignStrategy.delegateDefault')
                    .d('先执行审批人自动转交配置，未找到审批人，默认审批人')}
                  {dataSet.current &&
                    dataSet.current.get('approverResignStrategy') === 'DELEGATE_DEFAULT' && (
                      <AppointApprover record={dataSet.current} />
                    )}
                </div>
              </Radio>
              <Radio
                className={styles['todo-remind-radio']}
                name="approverResignStrategy"
                value="SUSPENDED"
              >
                <div className={styles['todo-remind-radio-label']}>
                  {intl
                    .get('hwfp.common.model.approverResignStrategy.suspended')
                    .d('关闭审批页面，返回外部系统')}
                </div>
              </Radio>
            </div>
          </Form>
        </Collapse.Panel>
      </Collapse>
    </Modal>
  );
}
export default formatterCollections({
  code: ['hwfp.common', 'hwfm.common', 'hwfp.task', 'hzero.common', 'hzero.c7nProUI'],
})(observer(TodoRemind));
