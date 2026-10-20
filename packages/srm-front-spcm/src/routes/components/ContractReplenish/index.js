/**
 * 补充协议
 * @date: 2020-09-28
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth, getCurrentOrganizationId, isUrl } from 'utils/utils';
import notification from 'utils/notification';
import { dateRender } from 'utils/renderer';
import { querySealType } from '@/services/contractCommonService';

import ModalBtn from '@/routes/PurchaseContractView/Modal/CertificateModal/ModalBtn';

import { ChangeCompareDrawer } from '../../PurchaseContractView/Detail/infoChangeCompare';


@connect(({ loading, contractCommon }) => ({
  loading: loading.effects['contractCommon/fetchReplenish'],
  contractCommon,
}))
export default class ContractReplenish extends Component {
  state = {
    visible: false,
    dataSource: [],
    pagination: {},
    sealType: "",
  };

  componentDidMount() {
    this.fetchReplenish();
    this.fetchSealType();
  }

  /**
   * 查询签章服务类型
   */
  @Bind()
  fetchSealType(){
    querySealType().then((res)=>{
      // 此处不要用getResponse处理，因为‘核企未开通签章套餐’也会作为错误抛出，但是我们不需要将此错误可视化。
      this.setState({ sealType: res?.sealType });
    });
  };

  /**
   * changeSkip - 协议类型编码render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */

  @Bind()
  changeSkip(text, record) {
    const { redirectDetail = (e) => e, openFrom } = this.props;
    return openFrom ? (
      <span>{text}</span>
    ) : (
      <a onClick={() => redirectDetail(record.pcHeaderId)}>{text}</a>
    );
  }

  /**
   * 查询
   */
  @Bind()
  async fetchReplenish(page = {}) {
    const { dispatch, pcHeaderId, remote } = this.props;
    if (remote?.event) {
      const res = await remote.event.fireEvent('fetchCuxReplenish', {
        current: this,
        page,
      });
      if (!res) {
        return;
      }
    }
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchReplenish',
        payload: {
          page,
          pcHeaderId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            dataSource: res?.replenishList,
            pagination: res?.replenishPagination,
          });
        }
      });
    }
  }

  @Bind()
  toContractHistoryCompare(record) {
    this.setState({ record, visible: !!record });
  }

  // e签宝查看存证
  @Bind()
  handleJumpViewCertificateDeposit(record) {
    const { dispatch } = this.props;
    const { sceneCertificateNo = '', pcHeaderId } = record;
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'contractCommon/queryViewCertificateDeposit',
      payload: {
        pcHeaderId,
        sceneCertificateNo: sceneCertificateNo || '',
        tenantId,
      },
    }).then((res) => {
      if (isUrl(res)) {
        window.open(res);
      } else if (res === 'Y') {
        notification.warning({
          message: intl
            .get('spcm.common.view.jurisdiction')
            .d('由于存证查看权限升级，该类历史存证仅能由签署人查看'),
        });
      } else if (res === 'N') {
        notification.warning({
          message: intl.get('spcm.common.view.noViewDepositPermission').d('无查看该存证权限'),
        });
      } else if (res === 'U') {
        notification.warning({
          message: intl
            .get('spcm.common.view.noRealNameCertificationOrCertification')
            .d('无实名认证或认证中'),
        });
      } else {
        notification.warning({
          message: intl.get('spcm.common.view.noQueryViewCertificateDeposit').d('暂未查询到数据！'),
        });
      }
    });
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { remote } = this.props;
    const { sealType = ""} = this.state;
    const columnArray = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'pcStatusCode',
        width: 85,
        render: (_, record) => record.pcStatusCodeMeaning,
      },
      {
        title: intl.get(`spcm.common.model.common.replenishContract`).d('补充协议编号'),
        dataIndex: 'pcNum',
        width: 180,
        render: this.changeSkip,
      },
      {
        title: intl.get(`spcm.common.model.common.version`).d('版本号'),
        dataIndex: 'version',
        width: 80,
      },
      {
        title: intl.get('spcm.common.view.title.viewCertificate').d('查看存证'),
        dataIndex: 'viewCertificate',
        width: 120,
        render: (_, record) => {
          const newAuthType = record.sceneCertificateNo? "ESIGN" : record.electronicOrderType || sealType || "";
          const showFlag = (
            (!(record?.orderSignFlag == 1 && record?.orderUnwillingSignFlag == 1) && record.sceneCertificateNo)
            || (!record.sceneCertificateNo && !newAuthType.includes('_SAAS'))
          )
             && Number(record.electricSignFlag) === 1 &&
            (
              ['EFFECTED', 'TERMINATION', 'TERMINATION_CONFIRM', 'ARCHIVE', 'ARCHIVE_TO_APPROVAL', 'TERMINATION_TO_APPROVAL', 'EXPIRED', 'SUPPLEMENT_COMPLETE', 'FIRST_EDITION'].includes(record.pcStatusCode)
            );
          return showFlag ? (
            <ModalBtn
              record={{...record, authType: newAuthType}}
              onClickESIGN={() => this.handleJumpViewCertificateDeposit(record)}
            >
              <a style={{ paddingRight: '1em' }}>
                {intl.get('spcm.common.view.title.viewCertificate').d('查看存证')}
              </a>
            </ModalBtn>
            ) : "";
        },
      },
      {
        title: intl.get(`spcm.common.model.fieldComparison`).d('字段对比'),
        dataIndex: 'fieldComparison',
        width: 120,
        render: (_, record) => (
          <a onClick={() => this.toContractHistoryCompare(record)}>
            {intl.get('spcm.common.view.clickToview').d('点击查看')}
          </a>
        ),
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createdName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.startDateActive`).d('生效日期'),
        dataIndex: 'effectDate',
        width: 120,
        render: dateRender,
      },
    ];
    return remote
      ? remote.process('SPCM_CONTRACT_REPLENISH_LIST_DETAILCOLUMNS', columnArray, {
          current: this,
        })
      : columnArray;
  }

  render() {
    const {
      loading,
      // contractCommon: { replenishList = [], replenishPagination = {} },
      versionFlag = true,
      customizeTable,
      remote,
    } = this.props;
    const { visible, record, dataSource, pagination } = this.state;
    const columns = this.getColumns();
    const scrollX = tableScrollWidth(columns);
    const tableProps = {
      loading,
      columns,
      bordered: true,
      rowKey: 'pcHeaderId',
      dataSource,
      pagination,
      onChange: this.fetchReplenish,
      scroll: { x: scrollX },
    };
    const changeCompareProps = {
      location,
      record,
      visible,
      versionFlag,
      closeCompare: () => this.toContractHistoryCompare(),
    };
    const code = 'SPCM.PURCHASE_CONTRACT_MAINTAIN.CONTRACTREPLENISH';
    const custCode = remote
      ? remote.process('SPCM_CONTRACT_REPLENISH_LIST_CUSTCODE', code, {
          current: this,
        })
      : code;
    return (
      <>
        {customizeTable(
          {
            code: custCode,
          },
          <Table {...tableProps} />
        )}
        {/* 此处弹框Drawer用h0的主要原因是，老的relative审批页面用的iframe标签嵌入审批表单，
        c7n弹框内容层级在iframe的外部，style文件在iframe内部，最终会导致c7n弹框内容样式不生效 */}
        {visible && <ChangeCompareDrawer {...changeCompareProps} />}
      </>
    );
  }
}
