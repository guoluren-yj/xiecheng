// 补充协议
import React, { Component, Fragment } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// import { Tag } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { getCurrentOrganizationId, isUrl } from 'utils/utils';

import ModalBtn from '@/routes/PurchaseContractView/Modal/CertificateModal/ModalBtn';
import { queryViewCertificateDeposit} from '@/services/workspaceService';


// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import StatusTag from '../../../../components/StatusTag';
import ChangeCompare from '../changeCompare';

// @WithCustomizeC7N({
//   unitCode: ['SPCM.WORKSPACE_DETAIL.CONTRACTREPLENISH'],
// })
@withRouter
export default class ContractReplenish extends Component {
  changeSkip(record) {
    const { redirectDetail = e => e } = this.props;
    return <a onClick={() => redirectDetail(record.get('pcHeaderId'))}>{record.get('pcNum')}</a>;
  }

  @Bind
  showHistoryCompare = record => {
    // 返利标识从协议头上面获取
    const {rebateFlag} =this.props;
    const { mainContractId, pcHeaderId, pcNum } = record?.get([
      'mainContractId',
      'pcHeaderId',
      'pcNum',
    ]);
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      drawer: true,
      title: `${intl.get(`spcm.common.model.fieldComparison`).d('字段对比')}-${pcNum}`,
      children: (
        <ChangeCompare
          {...this.props}
          mainContractId={mainContractId}
          pcHeaderId={pcHeaderId}
          rebateFlag={rebateFlag}
          fieldComparison
        />
      ),
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => cancelBtn,
      bodyStyle: { padding: 10, backgroundColor: '#f4f4f4' },
      style: { width: '1200px' },
    });
  };

  /**
   * e-sign查看存证
   */
  @Bind()
  handleJumpViewCertificateDeposit(record) {
    const { sceneCertificateNo, pcHeaderId } = record || {};
    queryViewCertificateDeposit({
      pcHeaderId,
      sceneCertificateNo,
      tenantId: getCurrentOrganizationId(),
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

  renderColumns() {
    const { remoteWorkDetail, sealType = '' } = this.props;
    const columns = [
      {
        name: 'pcStatusCodeMeaning',
        width: 200,
        renderer: ({ value, record }) => (
          <StatusTag text={value} value={record.get('pcStatusCode')} />
        ),
      },
      {
        name: 'pcNum',
        width: 200,
        renderer: ({ record }) => {
          return this.changeSkip(record);
        },
      },
      {
        name: 'version',
        width: 100,
      },
      {
        name: 'viewCertificate',
        renderer: ({ record }) => {
          if(record){
            const recordData = record.toData() || {};
            const {
              orderSignFlag,
              orderUnwillingSignFlag,
              sceneCertificateNo,
              electricSignFlag,
              pcStatusCode,
              electronicOrderType,
            } = recordData;
            const newAuthType = sceneCertificateNo? "ESIGN" : electronicOrderType || sealType || "";
            const showFlag = (
              (!(orderSignFlag == 1 && orderUnwillingSignFlag == 1) && sceneCertificateNo)
              || (!record.sceneCertificateNo && !newAuthType.includes("_SAAS"))
            )
              && Number(electricSignFlag) === 1 &&
              (
                ['EFFECTED', 'TERMINATION', 'TERMINATION_CONFIRM', 'ARCHIVE', 'ARCHIVE_TO_APPROVAL', 'TERMINATION_TO_APPROVAL', 'EXPIRED', 'SUPPLEMENT_COMPLETE', 'FIRST_EDITION'].includes(pcStatusCode)
              );
            return showFlag ? (
              <ModalBtn
                record={{...recordData, authType: newAuthType}}
                onClickESIGN={() => this.handleJumpViewCertificateDeposit(recordData)}
              >
                <a style={{ paddingRight: '1em' }}>
                  {intl.get('spcm.common.view.title.viewCertificate').d('查看存证')}
                </a>
              </ModalBtn>
              ) : "";
          }
          return "";
        },
      },
      {
        name: 'fieldComparison',
        renderer: ({ record }) => (
          <a onClick={() => this.showHistoryCompare(record)}>
            {intl.get('spcm.common.view.clickToview').d('点击查看')}
          </a>
        ),
      },
      {
        name: 'createdName',
        width: 200,
      },
      {
        name: 'creationDate',
        width: 200,
      },
      {
        name: 'effectDate',
        width: 200,
      },
    ];
    return remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_REPLENISH_RENDER_COLUMNS', columns, {
          current: this,
        })
      : columns;
  }

  render() {
    const { replenishDs, customizeTable, custCode } = this.props;
    return (
      <Fragment>
        {customizeTable(
          {
            code: custCode || 'SPCM.WORKSPACE_DETAIL.CONTRACTREPLENISH',
          },
          <Table dataSet={replenishDs} columns={this.renderColumns()} />
        )}
      </Fragment>
    );
  }
}
