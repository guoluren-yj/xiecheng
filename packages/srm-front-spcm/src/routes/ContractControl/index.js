/**
 * 协议控制
 * @date: 2020-09-15
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Table, Icon, Modal as ModalPro } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Bind, Debounce } from 'lodash-decorators';
import { merge, throttle } from 'lodash';
import { Modal } from 'hzero-ui'; // 暂时未用c7n的，因为该组件没有hzero处理得好
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { Button as PermissionButton } from 'components/Permission';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import hocRemote from 'utils/remote';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import './index.less';

import {
  invalidContract,
  terminateContract,
  terminateContractValid,
  changeContract,
} from '@/services/contractControlService';
import { batchCheckOrderSignContract } from '@/utils/commonCheck';
import { listLineDS } from './DataSet';
import TextComparisonModal from './components/TextComparisonModal';
import OperationRecordDrawer from '../components/OperationRecordDrawer';
import showTerminateModal from './ShowTerminateModal';

@formatterCollections({
  code: [
    'spcm.contractControl',
    'spcm.contractChange',
    'spcm.common',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'hzero.common',
    'spcm.purchaseContractView',
  ],
})
@withProps(
  () => {
    const tableDs = new DataSet(listLineDS());
    return {
      tableDs,
    };
  },
  { cacheState: true }
)
@hocRemote(
  {
    code: 'SPCM_CONTRACT_CONTROL_VIEW_LIST',
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    events: {
      handleCuxInvalid() {}, // 二开租户审批通过逻辑
    },
  }
)
@WithCustomizeC7N({
  unitCode: [
    'SPCM.CONTRACT.CONTROL.LIST',
    'SPCM.CONTRACT.CONTROL.LIST.FILTER',
    'SPCM.CONTRACT.CONTROL.TERMINATION',
    'SPCM.CONTRACT.CONTROL.LIST.BTN_GROUP',
  ],
})
export default class ContractControl extends Component {
  state = {
    textComparisonVisible: false,
    conChangeLoading: false,
    operationRecordVisible: false,
  };

  componentDidMount() {
    this.fetchList();
  }

  /**
   * 查询列表页
   */
  @Bind()
  fetchList() {
    const { tableDs } = this.props;
    tableDs.query(tableDs.currentPage);
  }

  @Bind()
  fetchHeader(pcHeaderId) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractCommon/fetchHeader',
      pcHeaderId,
    }).then((res) => {
      if (res) {
        return Promise.resolve(res);
      }
    });
  }

  /**
   * fetchPartner - 查询合作伙伴数据
   * @param {object} page - 合作伙伴分页条件
   */
  @Bind()
  fetchPartner(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise((resolve) => {
        dispatch({
          type: 'contractCommon/fetchPartner',
          payload: {
            page,
            pcHeaderId,
          },
        }).then((res) => {
          if (res) {
            const partnerDataSource = res.map((n) => ({
              ...n,
              pcHeaderId: null,
              partnerId: null,
            }));
            return resolve(partnerDataSource);
          }
        });
      });
    }
  }

  /**
   * fetchSubject - 查询标的信息数据
   * @param {object} page - 标的信息分页条件
   */
  @Bind()
  fetchSubject(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise((resolve) => {
        dispatch({
          type: 'contractCommon/fetchSubject',
          payload: {
            page,
            pcHeaderId,
          },
        }).then((res) => {
          if (res) {
            const pcSubjectDataSource = res.content.map((n) => ({
              ...n,
              pcHeaderId: null,
              pcSubjectId: null,
            }));
            return resolve(pcSubjectDataSource);
          }
        });
      });
    }
  }

  /**
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   */
  @Bind()
  fetchStage(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise((resolve) => {
        dispatch({
          type: 'contractCommon/fetchStage',
          payload: {
            page,
            pcHeaderId,
          },
        }).then((res) => {
          if (res) {
            const pcStageDataSource = res.content.map((n) => ({
              ...n,
              pcHeaderId: null,
              pcStageId: null,
            }));
            return resolve(pcStageDataSource);
          }
        });
      });
    }
  }

  /**
   * fetchSubject - 查询业务条款数据
   * @param {object} page - 业务条款分页数据
   */
  @Bind()
  fetchTerm(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise((resolve) => {
        dispatch({
          type: 'contractCommon/fetchTerm',
          payload: {
            page,
            pcHeaderId,
          },
        }).then((res) => {
          if (res) {
            const termDataSource = res.map((n) => ({
              ...n,
              pcHeaderId: null,
              termId: null,
            }));
            return resolve(termDataSource);
          }
        });
      });
    }
  }

  /**
   * 查询返利信息
   * @param {*} page
   */
  @Bind()
  fetchContractRebate(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise((resolve) => {
        dispatch({
          type: 'contractCommon/fetchContractRebate',
          payload: {
            page,
            pcHeaderId,
          },
        }).then((res) => {
          if (res && res.content) {
            const pcRebateDataSource = res.content.map((n) => ({
              ...n,
              pcHeaderId: null,
              rebateInformationId: null,
            }));
            return resolve(pcRebateDataSource);
          }
        });
      });
    }
  }

  @Bind()
  jumpToDetail(record) {
    const {
      data: { pcHeaderId },
    } = record;
    this.props.history.push(`/spcm/contract-control/detail/${pcHeaderId}`);
  }

  /**
   * 控制文本对比modal显隐
   * @param {*} pcHeaderId
   */
  @Bind()
  handleControlComparison(params) {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible, ...params });
  }

  /**
   * 作废
   */
  @Bind()
  async handleInvalid() {
    const _this = this;
    const { tableDs, remote } = this.props;
    const selectedRows = tableDs.selected.map((s) => s.toData()) || [];

    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxInvalid', {
        current: this,
        otherProps: {
          invalidContract,
        },
      });
      if (!res) {
        return;
      }
    }
    Modal.confirm({
      title: intl.get(`spcm.contractChange.title.sureCancel`).d('确认作废'),
      async onOk() {
        const response = getResponse(await invalidContract(selectedRows));
        if (response) {
          notification.success();
          _this.fetchList();
        }
      },
    });
  }

  /**
   * 终止协议前置处理
   * @returns
   */
  @Bind()
  @Debounce(500)
  async terminateContractFunc() {
    const { customizeForm, tableDs } = this.props;
    const selectedRows = tableDs.selected.map((r) => r?.get('pcHeaderId')) || [];
    const selectedRecords = tableDs.selected.map((s) => s.toData()) || [];
    const notAllowedFlag = batchCheckOrderSignContract(selectedRecords);
    if (notAllowedFlag) {
      return;
    }

    const validRes = getResponse(await terminateContractValid(selectedRows));
    if (validRes) {
      // strategy：2，existsDwonStream： Y，显示弱提示：合同存在有效下游订单/物流/预付款，合同不可终止
      if (validRes?.strategy === '2' && validRes?.existsDwonStream === 'Y') {
        const feedback = await ModalPro.confirm({
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('spcm.common.view.message.cannotTerminate')
            .d('合同存在有效下游订单/物流/预付款，合同不可终止'),
        });
        if (feedback === 'ok') {
          showTerminateModal(this.handleTerminate, customizeForm);
        }
        return false;
      }
      // strategy：0或1，直接终止
      showTerminateModal(this.handleTerminate, customizeForm);
    }
  }

  /**
   * 终止
   */
  @Bind()
  async handleTerminate(terminateDs) {
    const { tableDs } = this.props;
    const selectedRows = tableDs.selected.map((s) => s.toData()) || [];

    const flag = await terminateDs.validate();
    const data = (await terminateDs.toData()[0]) || {};
    const params = {
      pcHeaderStatus: 'TERMINATION_CONFIRM',
      pcHeaderDetailDtos: selectedRows.map((item) => ({
        ...item,
        ...data,
        terminationReason: data.terminationReason,
        terminationAttachmentUuid: data.terminationAttachmentUuid,
      })),
    };
    if (flag) {
      const response = getResponse(await terminateContract(params));
      if (response) {
        notification.success();
        this.fetchList();
      }
      return true;
    }
    return false;
  }

  /**
   * 变更操作
   * @param pcHeaderId 协议头id
   */
  @Bind()
  async handleContractChange(pcHeaderId) {
    const { dispatch } = this.props;
    const headerInfo = await this.fetchHeader(pcHeaderId);
    const termDataSource = await this.fetchTerm({}, pcHeaderId);
    const pcStageDataSource = await this.fetchStage({}, pcHeaderId);
    const pcSubjectDataSource = await this.fetchSubject({}, pcHeaderId);
    const partnerDataSource = await this.fetchPartner({}, pcHeaderId);
    const pcRebateDataSource = await this.fetchContractRebate({}, pcHeaderId);
    const payload = {
      ...merge(headerInfo),
      pcSubjectDetailDTOList: [...pcSubjectDataSource],
      pcPartnerDetailDTOList: [...partnerDataSource],
      pcStageDetailDTOList: [...pcStageDataSource],
      pcTermDetailDTOList: [...termDataSource],
      pcRebateInformationlist: [...pcRebateDataSource],
      mainContractId: pcHeaderId,
      pcHeaderId: null,
      amount: null,
      creationDate: null,
      // pcNum: null,
      createdBy: null,
      electricSignFlag: null,
      alterationFlag: 1,
      // attachmentUuid: uuid(),
    };

    const response = getResponse(await changeContract(payload));
    this.setState({ conChangeLoading: false });
    if (response) {
      notification.success();
      const { pcHeaderId: headerId, pcStatusCode } = response;
      if (pcStatusCode === 'CHANGE_TO_APPROVAL') {
        this.fetchList();
      } else {
        localStorage.setItem('isReplenishCreate', 'true');
        dispatch(
          routerRedux.push({
            pathname: `/spcm/contract-control/detail/${headerId}`,
            search: querystring.stringify({ hasChanged: 'true' }),
          })
        );
      }
    }
  }

  /**
   * 变更操作（针对已确定、已生效）
   * @param pcHeaderId 协议头id
   */
  @Bind()
  async handleOtherContractChange(pcHeaderId) {
    const { dispatch } = this.props;
    const headerInfo = await this.fetchHeader(pcHeaderId);
    const payload = {
      ...merge(headerInfo),
      mainContractId: pcHeaderId,
      pcHeaderId: null,
      amount: null,
      creationDate: null,
      // pcNum: null,
      createdBy: null,
      electricSignFlag: null,
      alterationFlag: 1,
      // attachmentUuid: uuid(),
    };
    const response = getResponse(await changeContract(payload));
    this.setState({ conChangeLoading: false });
    if (response) {
      notification.success();
      const { pcHeaderId: headerId, pcStatusCode } = response;
      if (pcStatusCode === 'CHANGE_TO_APPROVAL') {
        this.fetchList();
      } else {
        localStorage.setItem('isReplenishCreate', 'true');
        dispatch(
          routerRedux.push({
            pathname: `/spcm/contract-control/detail/${headerId}`,
            search: querystring.stringify({ hasChanged: 'true' }),
          })
        );
      }
    }
  }

  /**
   * 变更
   */
  @Bind()
  onContractChange() {
    const _this = this;
    const { tableDs } = this.props;
    const selectedRows = tableDs.selected.map((s) => s.toData()) || [];
    const { pcHeaderId, pcStatusCode } = selectedRows[0];
    const notAllowedFlag = batchCheckOrderSignContract(selectedRows);
    if (notAllowedFlag) {
      return;
    }
    _this.setState({ conChangeLoading: true });
    Modal.confirm({
      title: intl.get(`spcm.contractChange.title.sureChange`).d('确认变更'),
      onOk: throttle(
        () => {
          if (['CONFIRMED', 'EFFECTED'].includes(pcStatusCode)) {
            _this.handleOtherContractChange(pcHeaderId);
          } else {
            _this.handleContractChange(pcHeaderId);
          }
        },
        1500,
        {
          leading: true,
          trailing: false,
        }
      ),
      onCancel() {
        _this.setState({ conChangeLoading: false });
      },
    });
  }

  /**
   * 改变模态框显示状态
   * @param {String} modalVisible 字段
   * @param {Boolean} flag 值
   * @param {Object} [otherParams={}] 其他参数
   */
  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  @Bind()
  getColumns() {
    const { remote } = this.props;
    const columns = [
      {
        name: 'version',
        width: 80,
        lock: 'left',
      },
      {
        name: 'pcStatusCode',
        width: 85,
        lock: 'left',
        renderer: ({ record }) => record.get('pcStatusCodeMeaning'),
      },
      {
        name: 'pcNum',
        width: 160,
        lock: 'left',
        renderer: ({ value, record }) => <a onClick={() => this.jumpToDetail(record)}>{value}</a>,
      },
      {
        name: 'pcName',
        width: 150,
        tooltip: 'overflow',
        lock: 'left',
      },
      {
        name: 'supplierCompanyName',
        tooltip: 'overflow',
        width: 200,
        renderer: ({ record }) => record.get('supplierCompanyName') || record.get('supplierName'),
      },
      {
        name: 'pcKindCode',
        width: 100,
        renderer: ({ record }) => record.get('pcKindCodeMeaning'),
      },
      {
        name: 'pcTypeId',
        width: 120,
        renderer: ({ record }) => record.get('pcTypeName'),
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'globalFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'ouId',
        width: 150,
        renderer: ({ record }) => record.get('ouName'),
      },
      {
        name: 'purchaseOrgId',
        width: 150,
        renderer: ({ record }) => record.get('purchaseOrgName'),
      },
      {
        name: 'purchaseAgentId',
        width: 100,
        renderer: ({ record }) => record.get('purchaseAgentName'),
      },
      {
        name: 'pcTemplateId',
        width: 120,
        renderer: ({ record }) => record.get('templateName'),
      },
      {
        name: 'createBy',
        width: 140,
        renderer: ({ record }) => record.get('createByRealName'),
      },
      {
        name: 'creationDate',
        width: 150,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'confirmedDate',
        width: 150,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'pcSourceCode',
        width: 100,
        renderer: ({ record }) => record.get('pcSourceCodeMeaning'),
      },
      {
        name: 'mainContractId',
        width: 100,
        renderer: ({ record }) => record.get('mainPcNum'),
      },
      {
        name: 'archiveCode',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.signatureTypeMeaning`).d('签署方式'),
        name: 'signatureTypeMeaning',
        width: 100,
        renderer: ({ record }) => {
          const authType = record.get('authType');
          const electricSignFlag = record.get('electricSignFlag');
          const pcKindCode = record.get('pcKindCode');
          const signatureType = record.get('signatureType');
          const signatureTypeMeaning = record.get('signatureTypeMeaning');
          if (electricSignFlag === 1 && authType === 'ESIGN') {
            if (
              ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) &&
              signatureType === 'TEXT_SIGNATURE'
            ) {
              return '';
            }
            return signatureTypeMeaning;
          }
        },
      },
      {
        name: 'operating',
        width: 100,
        renderer: ({ record }) => (
          <a
            onClick={() =>
              this.handleModalVisible('operationRecordVisible', true, {
                pcHeaderId: record.get('pcHeaderId'),
              })
            }
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
      {
        name: 'operator',
        width: 100,
        lock: 'right',
        renderer: ({ record }) => {
          const isAttachmentSignUpload = record.get('signatureType') === 'ANNEX_SIGNATURE';
          const isAuthType = record.get('authType') === 'ESIGN';
          const isElectricSignFlag = record.get('electricSignFlag') === 1;
          return (
            !(isAttachmentSignUpload && isElectricSignFlag && isAuthType) &&
            !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.get('pcKindCode')) && (
              <a
                onClick={() =>
                  this.handleControlComparison({ pcHeaderId: record.get('pcHeaderId') })
                }
              >
                {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
              </a>
            )
          );
        },
      },
    ];
    return remote
      ? remote.process('SPCM_CONTRACT_CONTROL_VIEW_LIST_LINECOLUMNS', columns, {
          current: this,
        })
      : columns;
  }

  render() {
    const { tableDs, customizeTable, remote, customizeBtnGroup } = this.props;
    const {
      textComparisonVisible,
      pcHeaderId,
      conChangeLoading,
      operationRecordVisible,
    } = this.state;

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const HeaderButtons = observer((props) => {
      const selectedRows = props.dataSet.selected.map((s) => s.toData()) || [];

      // 已发布 true
      const invalidFlag = selectedRows.every((s) => s.pcStatusCode === 'PUBLISHED');
      // 非已发布和已失效 true
      const terminateFlag = selectedRows.every(
        (s) => !['PUBLISHED', 'EXPIRED'].includes(s.pcStatusCode)
      );

      // 已失效且invalidAllowChangeFlag=1允许变更
      const isExpiredChange =
        selectedRows[0]?.pcStatusCode === 'EXPIRED' && !!selectedRows[0]?.invalidAllowChangeFlag;

      let buttons = [
        <PermissionButton
          color="primary"
          // icon="event_note"
          key="change"
          data-name="change"
          onClick={this.onContractChange}
          loading={conChangeLoading}
          disabled={
            selectedRows.length !== 1 ||
            !(isExpiredChange || selectedRows[0]?.pcStatusCode != 'EXPIRED')
          }
          permissionList={[
            {
              code: 'srm.pc-admin.pc-purchaser.control.ps.change',
              type: 'button',
              meaning: '变更',
            },
          ]}
        >
          <Icon type="mode_edit" style={{ marginRight: '8px', fontSize: '16px' }} />
          {intl.get(`spcm.contractChange.view.button.change`).d('变更')}
        </PermissionButton>,
        <PermissionButton
          // icon="event_busy"
          key="invalid"
          data-name="invalid"
          onClick={this.handleInvalid}
          disabled={selectedRows.length < 1 || !invalidFlag}
          permissionList={[
            {
              code: 'srm.pc-admin.pc-purchaser.control.ps.invalid.button',
              type: 'button',
              meaning: '作废',
            },
          ]}
        >
          <Icon type="cancel" style={{ marginRight: '8px', fontSize: '16px' }} />
          {intl.get(`spcm.contractChange.view.button.invalid`).d('作废')}
        </PermissionButton>,
        <PermissionButton
          // icon="cancel"
          key="terminate"
          data-name="terminate"
          onClick={this.terminateContractFunc}
          disabled={selectedRows.length < 1 || !terminateFlag}
          permissionList={[
            {
              code: 'srm.pc-admin.pc-purchaser.control.ps.stop.button',
              type: 'button',
              meaning: '终止',
            },
          ]}
        >
          <Icon type="state_over" style={{ marginRight: '8px', fontSize: '16px' }} />
          {intl.get(`spcm.contractChange.view.button.terminate`).d('终止')}
        </PermissionButton>,
      ];
      buttons = remote
        ? remote.process('SPCM_CONTRACT_CONTROL_VIEW_LIST_HEADERBUTTONS', buttons, {
            current: this,
            props,
          })
        : buttons;

      return (
        <Fragment>
          {customizeBtnGroup(
            {
              code: 'SPCM.CONTRACT.CONTROL.LIST.BTN_GROUP',
            },
            buttons
          )}
        </Fragment>
      );
    });

    return (
      <Fragment>
        <Header title={intl.get('spcm.contractControl.view.title.ContractControl').d('协议控制')}>
          <HeaderButtons dataSet={tableDs} />
        </Header>
        <Content>
          {customizeTable(
            {
              code: 'SPCM.CONTRACT.CONTROL.LIST',
              filterCode: 'SPCM.CONTRACT.CONTROL.LIST.FILTER',
            },
            <Table
              className="contract-control-table"
              dataSet={tableDs}
              columns={this.getColumns()}
              queryFieldsLimit={3}
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            />
          )}
        </Content>
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
        <OperationRecordDrawer {...operationRecordProps} />
      </Fragment>
    );
  }
}
