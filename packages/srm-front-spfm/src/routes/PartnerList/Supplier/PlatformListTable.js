import React, { PureComponent, Fragment } from 'react';
// eslint-disable-next-line no-unused-vars
import { Table, Modal, Tag, Tooltip } from 'hzero-ui';

import { Modal as C7nModal } from 'choerodon-ui/pro';
import { isNumber, sum } from 'lodash';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { queryRiskMonitorType, handleQCCAddMonitor } from '@/services/supplierService';
import SelectGroupDrawer from './SelectGroupDrawer';
import SignImg from './SignImg';
import ThirdRolesTable from "./ThirdRolesTable";

export default class PlatformListTable extends PureComponent {
  state = {
    selectGroupVisible: false, // 选择分组
    selectedRows: {}, // 当前行
    signImgVisible: false,
    signImgRecord: {},
  };

  /**
   * 加入监控
   */
  @Bind()
  handleAddMonitor(record) {
    queryRiskMonitorType({
      type: "ADD_MONITOR",
    }).then(res => {
      const riskMonitorTypeResult = getResponse(res);
      if (riskMonitorTypeResult) {
        const { partnerCode: riskMonitorType } = riskMonitorTypeResult;
        if (riskMonitorType === 'SRD') {
          this.handleSRDAddMonitor(record);
        }
        if (riskMonitorType === 'ZHENYUN_PARTNER') {
          this.handlePartnerAddMonitor(record);
        }
      }
    });
  }

  /**
   * 斯瑞德 -- 加入监控
   */
  @Bind()
  handleSRDAddMonitor(record) {
    const { selectGroupVisible } = this.state;
    this.setState({
      selectGroupVisible: !selectGroupVisible,
      selectedRows: record,
    });
  }

  // 企查查 -- 加入监控回调
  @Bind()
  async handlePartnerAddMonitor(record) {
    const { handleTableChange } = this.props;
    const { supplierCompanyId } = record;
    C7nModal.confirm({
      children: intl
        .get(`spfm.supplier.model.supplier.platform.confirmMessage`)
        .d('加入监控将会扣除监控额度，是否确认加入？'),
      onOk: async () => {
        await handleQCCAddMonitor({ supplierCompanyId }).then(response => {
          const res = getResponse(response);
          if (res) {
            C7nModal.destroyAll();
            notification.success();
            handleTableChange();
          }
        });
      },
    });
  }

  /**
   * 风险扫描
   */
  @Bind()
  handleRiskScan(record) {
    const { handleEmbedPage } = this.props;
    queryRiskMonitorType().then(res => {
      const riskMonitorTypeResult = getResponse(res);
      if (riskMonitorTypeResult) {
        const { partnerCode: riskMonitorType } = riskMonitorTypeResult;
        if (['SRD', 'ZHENYUN_PARTNER'].includes(riskMonitorType)) {
          handleEmbedPage(record);
        }
      }
    });
  }

  @Bind()
  handleInviteOther(record = {}) {
    C7nModal.open({
      drawer: true,
      key: C7nModal.key(),
      title: intl.get(`spfm.supplier.model.supplier.platform.thirdRoles`).d('第三方角色'),
      children: <ThirdRolesTable record={record} />,
      cancelButton: false,
      okText: intl.get('hzero.common.button.cancel').d('取消'),
    });
  }

  @Bind()
  handleViewSignImg(record) {
    //
    this.setState({ signImgVisible: true, signImgRecord: record });
  }

  @Bind()
  handleCloseModal() {
    this.setState({ signImgVisible: false, signImgRecord: {} });
  }

  @Bind()
  handleFetchViewSignImg() {
    const { dispatch } = this.props;
    const { signImgRecord = {} } = this.state;
    const { supplierCompanyId } = signImgRecord;
    return dispatch({
      type: 'supplier/fetchViewSignImg',
      payload: { supplierCompanyId },
    });
  }

  /**
   * 渲染Ca状态
   * @param {*} val
   * @param {*} status
   * @param {*} caAuthTime
   * @returns
   */
  @Bind()
  renderCaAuthStatus(val, status, caAuthTime, enabledFlag, caAuthTimeHiddenFlag = false) {
    let textColor;
    let textBackgroundColor;
    // 未申请:NOT_APPLY | 申请中:APPLYING | 已出证:CA_SUCCESS | 申请失败:APPLY_FAILURE | 人工初审通过:MANUAL_APPROVE
    switch (status) {
      case 'NOT_APPLY':
        textColor = 'rgba(0,0,0,0.65)';
        textBackgroundColor = 'rgba(0,0,0,0.06)';
        break;
      case 'APPLYING':
        textColor = '#F88D10';
        textBackgroundColor = 'rgba(252,160,0,0.10)';
        break;
      case 'CA_SUCCESS':
      case 'MANUAL_APPROVE':
        textColor = '#47B881';
        textBackgroundColor = 'rgba(71,184,129,0.10)';
        break;
      case 'APPLY_FAILURE':
        textColor = '#F56349';
        textBackgroundColor = 'rgba(245,99,73,0.10)';
        break;
      default:
        textColor = 'rgba(0,0,0,0.65)';
        textBackgroundColor = 'rgba(0,0,0,0.06)';
        break;
    }
    return (
      <span>
        <span
          style={{
            padding: '1px 7px',
            color: +enabledFlag ? '#47B881' : '#F56349',
            backgroundColor: +enabledFlag ? 'rgba(71,184,129,0.10)' : 'rgba(245,99,73,0.10)',
          }}
        >
          {+enabledFlag
            ? intl.get('spfm.companySearch.modal.status.enable').d('已启用')
            : intl.get('spfm.companySearch.modal.status.forbidden').d('未启用')}
        </span>
        <span
          style={{
            padding: '1px 7px',
            color: textColor,
            backgroundColor: textBackgroundColor,
            margin: '0 5px',
          }}
        >
          {val}
        </span>
        {!caAuthTimeHiddenFlag && (
        <span
          style={{
            padding: '1px 7px',
            color: 'rgba(0,0,0,0.65)',
            backgroundColor: 'rgba(0,0,0,0.06)',
          }}
        >
          # {caAuthTime}
        </span>
)
      }
      </span>
    );
  }

  /**
   * 渲染电子签章状态
   * @param {*} val
   * @param {*} status
   * @param {*} caAuthTime
   * @returns
   */
  @Bind()
  renderThirdServiceAuth(record = {}) {
    const { thirdServiceAuthStatus, thirdServiceAuthorizeStatus, thirdServiceAuthStatusMeaning, thirdServiceAuthorizeStatusMeaning } = record || {};
    const firstFieldColor = this.getTextColor(thirdServiceAuthStatus, true);
    const secondFieldColor = this.getTextColor(thirdServiceAuthorizeStatus, false);
    const firstFieldColorProps = this.getTextColorProps(firstFieldColor) || {};
    const secondFieldColorProps = this.getTextColorProps(secondFieldColor) || {};
    return (
      <span>
        <span
          style={{
            padding: '1px 7px',
            ...firstFieldColorProps,
          }}
        >
          {thirdServiceAuthStatusMeaning || intl.get('sslm.common.view.message.notCertified').d('未认证')}
        </span>
        <span
          style={{
            padding: '1px 7px',
            ...secondFieldColorProps,
            margin: '0 5px',
          }}
        >
          {thirdServiceAuthorizeStatusMeaning || intl.get('sslm.common.view.message.unauthorized').d('未授权')}
        </span>
      </span>
    );
  }

  @Bind()
  getTextColorProps(status) {
    let color;
    let backgroundColor;
    switch (status) {
      case 'gray':
        color = 'rgba(0,0,0,0.65)';
        backgroundColor = 'rgba(0,0,0,0.06)';
        break;
      case 'yellow':
        color = '#F88D10';
        backgroundColor = 'rgba(252,160,0,0.10)';
        break;
      case 'green':
        color = '#47B881';
        backgroundColor = 'rgba(71,184,129,0.10)';
        break;
      case 'red':
        color = '#F56349';
        backgroundColor = 'rgba(245,99,73,0.10)';
        break;
      default:
        color = 'rgba(0,0,0,0.65)';
        backgroundColor = 'rgba(0,0,0,0.06)';
        break;
    }
    return {
      color,
      backgroundColor,
    };
  }

  @Bind()
  getTextColor(status, firstFlag = false) {
    let textColor;
    switch (status) {
      case 0:
        textColor = 'gray';
        break;
      case 3:
        textColor = 'yellow';
        break;
      case 1:
        textColor = 'green';
        break;
      case 2:
      case 4:
        textColor = firstFlag ? 'red' : 'gray';
        break;
      default:
        textColor = 'gray';
        break;
    }
    return textColor;
  }

  render() {
    const { selectGroupVisible, selectedRows, signImgVisible, signImgRecord } = this.state;
    const {
      rowKey,
      handleTableChange,
      dataSource,
      loading,
      pagination,
      // toggleEnable,
      // addMonitor = {},
      // riskScan = {},
      customizeTable,
    } = this.props;
    const selectGroupProps = {
      selectGroupVisible,
      selectedRows,
      handleTableChange,
      handleClose: this.handleSRDAddMonitor,
    };
    const columns = [
      {
        title: intl.get('spfm.supplier.model.supplier.platform.supplierCompanyNum').d('供应商编码'),
        width: 120,
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl
          .get('spfm.supplier.model.supplier.platform.supplierCompanyName')
          .d('供应商名称'),
        width: 200,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl
          .get('spfm.supplier.model.supplier.platform.UnifiedSocialCode')
          .d('统一社会信用代码'),
        width: 200,
        dataIndex: 'supplierUnifiedSocialCode',
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.certification.organizingInstitutionCode')
          .d('组织机构代码'),
        dataIndex: 'organizingInstitutionCode',
        width: 200,
      },
      {
        title: intl.get('spfm.certificationApproval.model.certification.dunsCode').d('邓白氏编码'),
        dataIndex: 'dunsCode',
        width: 200,
      },
      {
        title: intl.get('spfm.supplier.model.supplier.erp.businessNum').d('商业注册登记号/税号'),
        width: 150,
        dataIndex: 'businessRegistrationNumber',
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.processDate').d('认证通过日期'),
        width: 120,
        dataIndex: 'processDate',
        render: dateRender,
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.startDate').d('合作开始日期'),
        width: 120,
        dataIndex: 'startDate',
        render: dateRender,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        width: 200,
        dataIndex: 'customCompanyName',
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.thirdPartyFlag').d('是否第三方合作'),
        width: 120,
        dataIndex: 'thirdPartyFlag',
        render: value =>
          value
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否'),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.thirdPartyTime').d('第三方合作时间'),
        width: 150,
        dataIndex: 'thirdPartyTime',
        // render: dateRender,
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.levelType').d('是否为集团级'),
        width: 200,
        dataIndex: 'levelTypeFlagMeaning',
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.isErp').d('是否 ERP'),
        width: 100,
        dataIndex: 'isErp',
        render: value =>
          value
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否'),
      },
      {
        title: intl
          .get('spfm.supplier.model.supplier.platform.privateFlagSupplier')
          .d('是否私密供应商'),
        width: 140,
        dataIndex: 'privateFlag',
        render: value =>
          value
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否'),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.isMonitor').d('是否已加入监控'),
        width: 140,
        dataIndex: 'isMonitor',
        render: value =>
          value
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否'),
      },
      // {
      //   title: intl.get('hzero.common.status').d('状态'),
      //   width: 100,
      //   dataIndex: 'enabledFlag',
      //   render: enableRender,
      // },
      {
        title: intl
          .get('spfm.supplier.model.supplier.platform.inviteOtherSupplier')
          .d('第三方邀请'),
        width: 100,
        dataIndex: 'inviteOtherSupplier',
        render: (_, record) =>(
          <a onClick={() => this.handleInviteOther(record)}>
            {intl
              .get('spfm.supplier.model.supplier.platform.inviteOtherSupplier')
              .d('第三方邀请')}
          </a>
        ),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.esignCaAuthStatus').d('E签宝CA状态'),
        width: 190,
        dataIndex: 'esignCaAuthStatusMeaning',
        render: (val, record) =>
          this.renderCaAuthStatus(
            val,
            record.esignCaAuthStatus,
            record.esignCaAuthTime,
            record.esignCaEnabledFlag
          ),
      },
      {
        title: intl
          .get('spfm.supplier.model.supplier.platform.fddCaAuthStatus')
          .d('法大大签CA状态'),
        width: 190,
        dataIndex: 'fddCaAuthStatusMeaning',
        render: (val, record) =>
          this.renderCaAuthStatus(
            val,
            record.fddCaAuthStatus,
            record.fddCaAuthTime,
            record.fddCaEnabledFlag
          ),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.ContractTreasureCaAuthStatus')
        .d('契约锁CA状态'),
        width: 150,
        dataIndex: 'qysCaAuthStatusMeaning',
        render: (val, record) =>
          this.renderCaAuthStatus(
            val,
            record.qysCaAuthStatus,
            null,
            record.qysCaEnabledFlag,
            true,
          ),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.signImg').d('印章图片'),
        width: 100,
        dataIndex: 'signImg',
        render: (_, record) => (
          <a onClick={() => this.handleViewSignImg(record)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
      {
        title: intl.get('spfm.supplier.model.supplier.platform.addMonitor').d('加入监控'),
        width: 100,
        dataIndex: 'isShowMonitor',
        render: (_, record) => (
          <a onClick={() => this.handleAddMonitor(record)}>
            {intl.get('spfm.supplier.model.supplier.platform.addMonitor').d('加入监控')}
          </a>
        ),
      },
      {
        title: intl.get('spfm.companySearch.view.message.riskScan').d('风险扫描'),
        width: 100,
        dataIndex: 'isShowScan',
        render: (_, record) => (
          <a onClick={() => this.handleRiskScan(record)}>
            {intl.get('spfm.companySearch.view.message.riskScan').d('风险扫描')}
          </a>
        ),
      },
      {
        title: intl.get('sslm.common.model.supplier.platform.thirdServiceAuthStatus')
        .d('电子签章认证状态'),
        width: 150,
        dataIndex: 'thirdServiceAuthStatusMeaning',
        render: (val, record) => {
          return this.renderThirdServiceAuth(record);
        },
      },
      // {
      //   title: intl.get('hzero.common.button.action').d('操作'),
      //   width: 100,
      //   dataIndex: 'action',
      //   render: (_, record) => {
      //     return (
      //       <a onClick={() => toggleEnable(record)}>
      //         {record.enabledFlag
      //           ? intl.get('hzero.common.status.disable').d('禁用')
      //           : intl.get('hzero.common.status.enable').d('启用')}
      //       </a>
      //     );
      //   },
      // },
    ];

    // 配置中心启用就显示
    // if (addMonitor.enabledFlag) {
    //   columns.splice(7, 0, {
    //     title: intl.get('spfm.supplier.model.supplier.platform.addMonitor').d('加入监控'),
    //     width: 100,
    //     dataIndex: 'isShowMonitor',
    //     render: (_, record) => (
    //       <a onClick={() => this.handleAddMonitor(record)}>
    //         {intl.get('spfm.supplier.model.supplier.platform.addMonitor').d('加入监控')}
    //       </a>
    //     ),
    //   });
    // }
    // if (riskScan.enabledFlag) {
    //   columns.splice(7, 0, {
    //     title: intl.get('spfm.companySearch.view.message.riskScan').d('风险扫描'),
    //     width: 100,
    //     dataIndex: 'isShowScan',
    //     render: (_, record) => (
    //       <a onClick={() => this.handleRiskScan(record)}>
    //         {intl.get('spfm.companySearch.view.message.riskScan').d('风险扫描')}
    //       </a>
    //     ),
    //   });
    // }
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SPFM.PARTNER_LIST_SUPPLIER.SUPPLIEROFPLATFORM',
          },
          <Table
            bordered
            loading={loading}
            rowKey={rowKey}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: scrollX, y: 'calc(100vh - 450px)' }}
          />
        )}
        {selectGroupVisible && <SelectGroupDrawer {...selectGroupProps} />}
        {/* {signImgVisible && ( */}
        <Modal
          footer={null}
          destroyOnClose
          title={intl.get(`spfm.supplier.model.supplier.platform.viewSignImg`).d('印章图片查看')}
          visible={signImgVisible}
          width={800}
          onCancel={this.handleCloseModal}
          bodyStyle={{paddingTop: 0}}
        >
          <SignImg record={signImgRecord} onSearch={this.handleFetchViewSignImg} />
        </Modal>
        {/* )} */}
      </Fragment>
    );
  }
}
