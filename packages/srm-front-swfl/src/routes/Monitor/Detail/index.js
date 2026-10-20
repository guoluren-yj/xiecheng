/* eslint-disable no-nested-ternary */
/**
 * Detail - 流程监控 明细
 * @date: 2018-11-15
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Tabs, Row, Col, Spin, Tag } from 'hzero-ui';
import { connect } from 'dva';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isArray, isNil } from 'lodash';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { processStatusRender } from '@/utils/util';

import ApproveHistory from './ApproveHistory';
import ApproveForm from '../../components/ApproveFormNew';
import FlowChart from './FlowChart';
import styles from './index.less';
import ApproveHistoryExtra from './ApproveHistoryExtra';

@connect(({ monitor, loading }) => ({
  monitor,
  fetchDetailLoading: loading.effects['monitor/fetchDetail'],
  fetchForecast: loading.effects['monitor/fetchForecast'],
  tenantId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'hwfp.monitor',
    'hwfp.common',
    'entity.position',
    'entity.department',
    'hpfm.organization',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { tenantId, location } = this.props;
    const { state: { approveFormParams = {} } = {} } = location || {};
    const { tenantId: stateTenantId } = approveFormParams;
    this.approveFormChildren = undefined;
    this.tenantId = !isNil(stateTenantId) ? stateTenantId : tenantId;
    this.state = {
      historyApprovalRecords: [],
      processDefineConfig: {},
    };
  }

  /**
   * 生命周期函数
   *render调用后，获取页面展示数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    // 查询审批状态类型（单独查询而不用record上的状态是考虑未从表格点击进入详情页的情况）
    dispatch({ type: 'monitor/queryProcessStatus' });
    this.handleSearch();
    this.fetchProcessDefineConfig();
  }

  @Bind()
  fetchProcessDefineConfig() {
    if (isTenantRoleLevel()) {
      this.props
        .dispatch({
          type: 'monitor/fetchProcessDefineConfig',
        })
        .then((res) => {
          if (res) {
            this.setState({ processDefineConfig: res });
          }
        });
    }
  }

  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'monitor/fetchDetail',
      payload: {
        tenantId: this.tenantId,
        id: match.params.id,
      },
    }).then((res) => {
      if (res && res.businessKey && isTenantRoleLevel()) {
        dispatch({
          type: 'monitor/fetchApprovalHistoryList',
          payload: {
            businessKey: res.businessKey,
          },
        }).then((response) => {
          if (response && isArray(response)) {
            this.setState({ historyApprovalRecords: response.filter((i) => i.id !== res.id) });
          }
        });
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { historyApprovalRecords, processDefineConfig } = this.state;
    const {
      dispatch,
      fetchDetailLoading,
      fetchForecast,
      match,
      location,
      monitor: {
        [match.params.id]: { detail = {}, forecast = [], uselessParam } = {},
        processStatus = [],
      },
    } = this.props;
    let { state: { approveFormParams = {} } = {} } = location || {};
    // const { formKey = null } = detail;
    const historyProps = {
      detail,
      loading: fetchDetailLoading,
      processDefineConfig,
    };
    const flowProps = {
      dispatch,
      match,
      tenantId: this.tenantId,
      forecast,
      detail,
      uselessParam,
      loading: fetchForecast,
    };
    approveFormParams.moduleForm = detail.moduleForm;
    if (!approveFormParams.formKey) {
      const {
        businessKey,
        formDefinitionCode,
        formKey,
        originFormKey,
        processDefinitionId,
        processDefinitionKey,
      } = detail;
      approveFormParams = {
        ...approveFormParams,
        businessKey,
        formDefinitionCode,
        formKey,
        originFormKey,
        processDefinitionId,
        processDefinitionKey,
      };
    }
    const formProps = {
      ...approveFormParams,
      disabled: true,
      // detail,
      onRef: (ref) => {
        this.approveFormChildren = ref;
      },
      onAction: this.taskAction,
    };

    const priority =
      detail.priority < 34
        ? intl.get('hzero.common.priority.low').d('低')
        : detail.priority > 66
        ? intl.get('hzero.common.priority.high').d('高')
        : intl.get('hzero.common.priority.medium').d('中');
    const name = `${detail.startUserName ? `${detail.startUserName}` : ''}`;

    const processStatusArr = {};
    processStatus.forEach((item) => {
      processStatusArr[item.value] = item.meaning;
    });
    const isTenant = isTenantRoleLevel();
    return (
      <>
        <Header title={intl.get('hwfp.common.model.process.detail').d('流程明细')} />
        <Content>
          <Spin spinning={fetchDetailLoading}>
            {/* 审批事项 */}
            <div className={classNames(styles['label-col'])}>
              {intl.get('hwfp.common.model.approval.item').d('审批事项')}
            </div>
            <Row
              style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 20 }}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfp.common.model.process.name').d('流程名称')}:
                  </Col>
                  <Col md={16}>
                    <div className={styles['approve-item-content']}>
                      <span style={{ marginRight: '0.06rem' }}>{detail.processName}</span>
                      <span>{processStatusRender(processStatusArr, detail.deleteReason)}</span>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfp.common.model.process.ID').d('流程标识')}:
                  </Col>
                  <Col md={16}>
                    <div className={styles['approve-item-content']}>{detail.id}</div>
                  </Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfp.common.model.apply.owner').d('申请人')}:
                  </Col>
                  <Col md={16}>
                    <div className={styles['approve-item-content']}>
                      {name}
                      {detail.employeeResign && (
                        <Tag
                          color="#E5E7EC"
                          style={{
                            lineHeight: '18px',
                            height: '18px',
                            border: 'none',
                            padding: '0 4px',
                            cursor: 'default',
                            marginLeft: '4px',
                            marginRight: 0,
                            transform: 'scale(0.84)',
                            color: '#4E5769',
                            fontWeight: 400,
                          }}
                        >
                          {intl.get('hpfm.organization.model.position.leave').d('离职')}
                        </Tag>
                      )}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row
              style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 20 }}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfp.common.model.apply.time').d('申请时间')}:
                  </Col>
                  <Col md={16}>
                    <div className={styles['approve-item-content']}>{detail.startTime}</div>
                  </Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hzero.common.priority').d('优先级')}:
                  </Col>
                  <Col md={16}>
                    <div className={styles['approve-item-content']}>{priority}</div>
                  </Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfp.common.model.process.description').d('流程描述')}:
                  </Col>
                  <Col md={16}>
                    <div className={styles['approve-item-content']}>{detail.description}</div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row
              style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 40 }}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfp.common.model.process.currentProcessVersion').d('当前流程版本')}:
                  </Col>
                  <Col md={16}>
                    <div className={styles['approve-item-content']}>
                      {detail.currentProcessVersion}
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col md={8} pull={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfp.common.model.process.definition.key').d('流程定义编码')}:
                  </Col>
                  <Col md={16}>
                    <div className={styles['approve-item-content']}>
                      {detail.processDefinitionKey}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            {isTenant && approveFormParams.formKey && (
              <>
                <div className={classNames(styles['label-col'])}>
                  {intl.get('hwfp.common.model.approval.form').d('审批表单')}
                </div>
                <ApproveForm {...formProps} />
              </>
            )}

            <Tabs defaultActiveKey="1" animated={false}>
              <Tabs.TabPane
                tab={intl.get('hwfp.common.model.approval.history').d('审批历史')}
                key="1"
              >
                <ApproveHistory {...historyProps} />
                {historyApprovalRecords.length > 0 && (
                  <ApproveHistoryExtra
                    records={historyApprovalRecords}
                    processStatusMap={processStatusArr}
                  />
                )}
              </Tabs.TabPane>
              <Tabs.TabPane tab={intl.get('hwfp.common.model.process.graph').d('流程图')} key="2">
                <FlowChart {...flowProps} />
              </Tabs.TabPane>
            </Tabs>
          </Spin>
        </Content>
      </>
    );
  }
}
