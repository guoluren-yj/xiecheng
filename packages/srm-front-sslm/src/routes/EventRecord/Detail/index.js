/**
 *
 * @date: 2020/7/21
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import queryString from 'querystring';
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import uuid from 'uuid/v4';

import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import remote from 'utils/remote';
import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import styles from '@/routes/index.less';
import { submitEventRecord, obsoletedEventRecord } from '@/services/EventRecordService';
import DetailHeader from './DetailHeader';
import DetailLine from './DetailLine';
import Operate from './Operate';
import HeaderDs from './store/HeaderDS';
import LineDs from './store/LineDS';
import OperateDs from './store/OperateDS';

const { Panel } = Collapse;
const customizeUnitCode =
  'SSLM.EVALUATION_EVENT_RECORD.DETAIL.LINE_TABLE,SSLM.EVALUATION_EVENT_RECORD.DETAIL.HEADER';

@connect()
@formatterCollections({
  code: ['sslm.eventRecord', 'sslm.commonApplication'],
})
@WithCustomize({
  unitCode: [
    'SSLM.EVALUATION_EVENT_RECORD.DETAIL.LINE_TABLE',
    'SSLM.EVALUATION_EVENT_RECORD.DETAIL.HEADER',
  ],
})
@remote(
  {
    name: 'eventRecordRemote',
    code: 'SSLM_EVENTRECORD_DETAIL',
  },
)
export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { evalEventHeaderId },
        url,
        path,
      },
    } = props;
    const isDisabled = path.includes('/pub/');
    const routerParam = queryString.parse(location.search.substr(1));
    const { isView, openTab } = routerParam;
    this.line = new DataSet(LineDs());
    this.operate = new DataSet(OperateDs());
    this.header = new DataSet({
      ...HeaderDs(),
      children: {
        evalEventLines: this.line,
      },
    });
    const arr = url.split('/');
    const action = arr[arr.length - 1] === 'create' ? 'create' : 'edit';
    if (typeof evalEventHeaderId === 'string') {
      this.header.setQueryParameter('evalEventHeaderId', evalEventHeaderId);
      this.header.setQueryParameter(
        'customizeUnitCode',
        'SSLM.EVALUATION_EVENT_RECORD.DETAIL.HEADER'
      );
      this.line.setQueryParameter(
        'customizeUnitCode',
        'SSLM.EVALUATION_EVENT_RECORD.DETAIL.LINE_TABLE'
      );
      this.header.query();
    }
    this.state = {
      action,
      evalEventHeaderId,
      eventStatus: '',
      collapsed: ['header', 'line'],
      isDisabled,
      allLoading: false,
      isView: Boolean(Number(isView)),
      openTab: Boolean(Number(openTab)),
    };
    this.header.addEventListener('load', this.handleLoad);
  }

  // 供应商关联业务单据，对应页签刷新
  getSnapshotBeforeUpdate(prevProps) {
    const {
      match: { params: { evalEventHeaderId: prevEvalEventHeaderId } = {} },
    } = prevProps;
    const {
      match: { params: { evalEventHeaderId } = {} },
    } = this.props;
    return evalEventHeaderId !== prevEvalEventHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.refreshData();
    }
  }

  /**
   * 刷新数据
   */
  refreshData = () => {
    const {
      match: {
        params: { evalEventHeaderId },
      },
      eventRecordRemote,
    } = this.props;
    if (typeof evalEventHeaderId === 'string') {
      this.header.setQueryParameter('evalEventHeaderId', evalEventHeaderId);
      this.header.setQueryParameter(
        'customizeUnitCode',
        'SSLM.EVALUATION_EVENT_RECORD.DETAIL.HEADER'
      );
      this.line.setQueryParameter(
        'customizeUnitCode',
        'SSLM.EVALUATION_EVENT_RECORD.DETAIL.LINE_TABLE'
      );
      this.header.query();
    }
    if (eventRecordRemote?.event) {
      eventRecordRemote.event.fireEvent('cuxHandleInitDefaultValue', { evalEventHeaderId, headerDs: this.header, lineDs: this.line });
    }

  };

  componentWillUnmount() {
    this.header.removeEventListener('load', this.handleLoad);
  }

  static getDerivedStateFromProps(props, state) {
    const {
      match: {
        params: { evalEventHeaderId },
        url,
      },
    } = props;
    const arr = url.split('/');
    const action = arr[arr.length - 1] === 'create' ? 'create' : 'edit';
    const { action: stateAction, evalEventHeaderId: stateEvalEventHeaderId } = state;
    if (action !== stateAction || evalEventHeaderId !== stateEvalEventHeaderId) {
      return {
        evalEventHeaderId,
        action,
      };
    }
  }

  /**
   * dataSet获取完数据后的处理函数
   * @param dataSet
   */
  handleLoad = ({ dataSet }) => {
    const eventStatus = (dataSet.current && dataSet.current.get('eventStatus')) || '';
    const dataSetUuid = dataSet.current && dataSet.current.get('attachmentUuid');
    if (dataSetUuid) {
      this.setState({
        attachmentUuid: dataSetUuid,
      });
    } else {
      const attachmentUuid = uuid();
      if (dataSet.current) {
        dataSet.current.set('attachmentUuid', attachmentUuid);
      }
      this.setState({
        attachmentUuid,
      });
    }
    this.setState({
      eventStatus,
    });
  };

  /**
   * collapse 的折叠与展开
   */
  handleCollapse = keys => {
    this.setState({
      collapsed: keys,
    });
  };

  /**
   * 保存按钮处理逻辑
   */
  @Debounce(500)
  handleSave = async () => {
    if (this.header.dirty || this.line.dirty) {
      if (await this.header.validate()) {
        const { action } = this.state;
        let toEditFlag = false;
        return new Promise(resolve => {
          this.setState({ allLoading: true });
          this.header
            .submit()
            .then(res => {
              if (res && res.success) {
                if (action === 'create') {
                  const { dispatch } = this.props;
                  const {
                    content: [Data],
                  } = res;
                  const { evalEventHeaderId } = Data;
                  // 只有生成考评事件单据后才进行跳转
                  if (evalEventHeaderId) {
                    toEditFlag = true;
                    dispatch(routerRedux.push(`/sslm/event-record/detail/${evalEventHeaderId}`));
                    this.setState({
                      evalEventHeaderId,
                      action: 'edit',
                    });
                    this.header.setQueryParameter('evalEventHeaderId', evalEventHeaderId);
                  }
                }
              }
            })
            .finally(() => {
              if (action === 'create') {
                if (toEditFlag) {
                  this.header.query();
                }
              } else {
                this.header.query();
              }
              resolve();
              this.setState({ allLoading: false });
            });
        });
      }
    } else {
      notification.warning({
        message: intl.get('sslm.eventRecord.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
      });
    }
  };

  /**
   * 提交按钮处理逻辑
   * @returns {Promise<void>}
   */
  @Debounce(500)
  handleSubmit = async () => {
    if (await this.header.validate()) {
      const { evalEventHeaderId } = this.state;
      const evalEventHeader = (this.header.current && this.header.current.toData()) || {};
      return new Promise(resolve => {
        this.setState({ allLoading: true });
        submitEventRecord({ evalEventHeaderId, evalEventHeader, customizeUnitCode })
          .then((response = {}) => {
            const res = getResponse(response);
            if (res) {
              notification.success();
            }
          })
          .finally(() => {
            this.header.query();
            resolve();
            this.setState({ allLoading: false });
          });
      });
    } else {
      notification.error({
        message: intl.get('hzero.common.notification.invalid').d('校验不通过'),
      });
    }
  };

  /**
   * 删除按钮处理逻辑
   */
  @Debounce(500)
  handleDelete = async () => {
    return new Promise(resolve => {
      this.setState({ allLoading: true });
      this.header
        .delete(this.header.current)
        .then(res => {
          if (res && res.failed) {
            notification.error({
              message: res.message,
            });
            this.header.query();
            return false;
          }
          const { dispatch } = this.props;
          dispatch(routerRedux.push('/sslm/event-record/list'));
        })
        .finally(() => {
          this.header.query();
          resolve();
          this.setState({ allLoading: false });
        });
    });
  };

  /**
   * 废弃按钮处理逻辑
   */
  @Debounce(500)
  handleObsoleted = async () => {
    if (
      (await Modal.confirm(
        intl.get('sslm.commonApplication.message.confirmCancel').d('是否确认废弃?')
      )) !== 'cancel'
    ) {
      const { evalEventHeaderId } = this.state;
      const payload = {
        evalEventHeaderId,
      };
      return new Promise(resolve => {
        this.setState({ allLoading: true });
        obsoletedEventRecord(payload)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              this.header.query();
            }
          })
          .finally(() => {
            resolve();
            this.setState({ allLoading: false });
          });
      });
    }
  };

  /**
   * 操作记录按钮处理逻辑
   */
  @Debounce(500)
  handleOperated = () => {
    const { evalEventHeaderId } = this.state;
    this.operate.setQueryParameter('evalEventHeaderId', evalEventHeaderId);
    this.operate.query();
    Modal.open({
      closable: true,
      movable: true,
      maskClosable: true,
      keyboardClosable: true,
      footer: null,
      key: Modal.key(),
      title: intl.get('hzero.common.button.operated').d('操作记录'),
      children: <Operate dataSet={this.operate} />,
    });
  };

  render() {
    const {
      collapsed,
      action,
      isView,
      openTab,
      evalEventHeaderId,
      eventStatus,
      attachmentUuid,
      isDisabled,
      allLoading,
    } = this.state;
    const { custLoading, customizeTable, customizeForm } = this.props;
    const isCreate = action === 'create';
    const isEdit =
      !isView &&
      (action === 'create' ||
        (action === 'edit' &&
          typeof evalEventHeaderId === 'string' &&
          ['NEW', 'REJECTED'].includes(eventStatus)));
    const isDelete = eventStatus === 'NEW' || eventStatus === 'REJECTED';
    const isObsoleted = eventStatus === 'APPROVED';
    const tenantId = getCurrentOrganizationId();
    const uploadModalProps = {
      viewOnly: !(eventStatus === 'NEW' || eventStatus === 'REJECTED') || isDisabled,
      attachmentUUID: attachmentUuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sslm-eventRecord',
      tenantId,
      filePreview: true,
    };
    return (
      <Fragment>
        <Header
          backPath={openTab || isDisabled ? '' : '/sslm/event-record/list'}
          title={
            isView
              ? intl.get('sslm.eventRecord.view.title.checkEventRecord').d('查看考评事件')
              : intl.get('sslm.eventRecord.view.message.title.main').d('考评事件维护')
          }
        >
          <Button
            color="primary"
            icon="save"
            onClick={this.handleSave}
            hidden={isDisabled || isView || !isEdit}
            loading={allLoading}
          >
            {intl.get('hzero.common.save').d('保存')}
          </Button>
          {!isCreate && !isView && (
            <Button className="upload-btn" style={{ border: 'none' }}>
              <Upload {...uploadModalProps} />
            </Button>
          )}
          {!isDisabled &&
            !isCreate &&
            !isView && [
              <Button
                hidden={!isDelete}
                icon="check"
                funcType="flat"
                loading={allLoading}
                onClick={this.handleSubmit}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>,
              <Button
                icon="delete"
                funcType="flat"
                hidden={!isDelete}
                loading={allLoading}
                onClick={this.handleDelete}
              >
                {intl.get('hzero.common.button.enter').d('删除')}
              </Button>,
              <Button
                hidden={!isObsoleted}
                icon="close"
                funcType="flat"
                loading={allLoading}
                onClick={this.handleObsoleted}
              >
                {intl.get('sslm.commonApplication.view.button.cancel').d('废弃')}
              </Button>,
            ]}
          <Button
            hidden={isCreate}
            icon="operation_service_request"
            funcType="flat"
            loading={allLoading}
            onClick={this.handleOperated}
          >
            {intl.get('hzero.common.button.operated').d('操作记录')}
          </Button>
        </Header>
        <Content wrapperClassName={styles['content-wrap']} className={styles['customize-wrap']}>
          <Collapse
            trigger="text-icon"
            expandIconPosition="text-right"
            activeKey={collapsed}
            onChange={this.handleCollapse}
          >
            <Panel
              key="header"
              header={intl.get(`sslm.eventRecord.model.evaluationDocManage.baseInfo`).d('基本信息')}
            >
              <DetailHeader
                header={this.header}
                isEdit={isEdit}
                isCreate={isCreate}
                isDisabled={isDisabled}
                custLoading={custLoading}
                customizeForm={customizeForm}
              />
            </Panel>
            <Panel
              key="line"
              header={intl.get(`sslm.eventRecord.model.evaluationDocManage.lineInfo`).d('行信息')}
            >
              <DetailLine
                line={this.line}
                isEdit={isEdit}
                customizeTable={customizeTable}
                isDisabled={isDisabled}
              />
            </Panel>
          </Collapse>
        </Content>
      </Fragment>
    );
  }
}
