/**
 * index.js
 * 适配器列表
 * @date: 2020-12-30
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { useEffect, useState } from 'react';
import { Table, DataSet, Button, Modal, Form, Select, Output } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import qs from 'querystring';
import { Header } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';

import EditorForm from './EditorForm';
import BaseInfo from './BaseInfo';
import RegisterInfo from './RegisterInfo';
import BussinessInfo from './BussinessInfo';
import InvoiceInfo from './InvoiceInfo';
import {
  getBaseDs,
  getTableDs,
  getOprationDs,
  getCompanyDs,
  getPassModalDs,
  passSelectDs as passSelectDsEl,
  getContactInfoDs,
  getAttachmentUuidDs,
  getFinanceInfoDs,
  getBankInfoDs,
  getAddressInfoDs,
} from '../store/taskDetailDs';
import { getModalDs, getOprationTableDs } from '../store/adaptorTaskDs';
import styles from '../index.less';

const enableRender = ({ value = 0 } = {}) => {
  return value ? intl.get('hzero.common.yes').d('是') : intl.get('hzero.common.no').d('否');
};
const statusRender = ({ value = 0 } = {}) => {
  return value
    ? intl.get('hzero.common.status.enable').d('启用')
    : intl.get('hzero.common.status.disable').d('禁用');
};

function TaskDetail(props = {}) {
  const [status, useStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { headerId, retrieveId, companyId } = qs.parse(props.history.location.search.substr(1));
  const {
    tableDs,
    oprationDs,
    baseDs,
    ModalDs,
    companyDs,
    passModalDs,
    passSelectDs,
    headerOprationDs,
    contactInfoDs,
    attachmentUuidDs,
    financeInfoDs,
    bankInfoDs,
    addressInfoDs,
  } = props.valueDs;

  useEffect(() => {
    getInfo();
    contactInfoDs.bind(companyDs, 'contactList');
    attachmentUuidDs.bind(companyDs, 'attachmentList');
    financeInfoDs.bind(companyDs, 'financeList');
    bankInfoDs.bind(companyDs, 'bankAccountList');
    addressInfoDs.bind(companyDs, 'addressList');
  }, [headerId, retrieveId, companyId]);

  const getInfo = () => {
    if (retrieveId !== undefined) {
      queryHeadInfo(retrieveId);
    }
    if (headerId !== undefined) {
      queryLineInfo(headerId);
    }
    if (companyId !== undefined) {
      queryBasicCompanyInfo(companyId);
    }
  };

  const queryLineInfo = (id) => {
    tableDs.setQueryParameter('id', id);
    tableDs.query();
  };

  const queryBasicCompanyInfo = (id) => {
    companyDs.setQueryParameter('id', id);
    companyDs.query();
  };

  const queryHeadInfo = async (id) => {
    baseDs.setQueryParameter('id', id);
    const bs = await baseDs.query();
    const { processStatus } = bs;
    useStatus(processStatus);
  };

  const columnsOpration = [
    {
      name: 'inviteMess',
      width: 120,
    },
    {
      name: 'inviteDate',
      width: 120,
    },
    {
      name: 'processDate',
      width: 120,
    },
    {
      name: 'processStatusMeaning',
      width: 120,
    },
  ];

  const handleModalOpen = (params) => {
    // routerDetail(id);
    Modal.open({
      key: Modal.key(),
      title: intl
        .get('spfm.enterpriseRecovery.model.enterpriseRecovery.oprationRecord')
        .d('操作记录'),
      children: <Table dataSet={oprationDs} columns={columnsOpration} />,
      style: { width: 610 },
      footer: false,
      closable: true,
      maskClosable: true,
    });
    oprationDs.setQueryParameter('params', params);
    oprationDs.query();
  };

  const headerRecordsColumns = [
    {
      name: 'operateUserName',
      width: 120,
    },
    {
      name: 'actionTypeMeaning',
      width: 120,
    },
    {
      name: 'actionContent',
      width: 250,
    },
    {
      name: 'creationDate',
      width: 160,
    },
  ];

  // 顶部操作记录
  const handleHeaderRecords = () => {
    Modal.open({
      key: Modal.key(),
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <Table dataSet={headerOprationDs} columns={headerRecordsColumns} />,
      style: { width: 750 },
      footer: null,
      closable: true,
      maskClosable: true,
    });
    headerOprationDs.setQueryParameter('retrieveId', retrieveId);
    headerOprationDs.query();
  };

  const columns = [
    {
      name: 'supplier',
      children: [
        {
          name: 'supplierCompanyCode',
          width: 200,
        },
        {
          name: 'supplierCompanyName',
          width: 200,
        },
        {
          name: 'supplierGroupName',
          width: 200,
        },
      ],
    },
    {
      name: 'purchaser',
      children: [
        {
          name: 'purchaserCompanyCode',
          width: 200,
        },
        {
          name: 'purchaserCompanyName',
          width: 200,
        },
        {
          name: 'purchaserGroupName',
          width: 200,
        },
      ],
    },
    {
      name: 'inviteStatusMeaning',
      width: 200,
    },
    {
      name: 'purchaserInvite',
      width: 100,
      renderer: ({ value = 0 } = {}) => {
        return value ? intl.get('hzero.common.yes').d('是') : intl.get('hzero.common.no').d('否');
      },
    },
    {
      name: 'supplierInvite',
      width: 100,
      renderer: ({ value = 0 } = {}) => {
        return value ? intl.get('hzero.common.yes').d('是') : intl.get('hzero.common.no').d('否');
      },
    },
    {
      name: 'privateFlag',
      width: 100,
      renderer: ({ value = 0 } = {}) => {
        return value ? intl.get('hzero.common.yes').d('是') : intl.get('hzero.common.no').d('否');
      },
    },
    {
      name: 'inviteDate',
      width: 200,
    },
    {
      name: 'oprationRecord',
      width: 100,
      renderer: ({ record = {} } = {}) => {
        const { data = {} } = record;
        const { purchaserCompanyId, supplierCompanyId } = data;
        return (
          <a onClick={() => handleModalOpen({ purchaserCompanyId, supplierCompanyId })}>
            {intl.get('spfm.configServer.model.purchaser.showRlue').d('查看')}
          </a>
        );
      },
    },
  ];

  const handlePass = async (flag, params = {}) => {
    baseDs.setQueryParameter('params', { flag, retrieveId, ...params });
    try {
      setLoading(true);
      const result = await baseDs.submit().finally(()=>{setLoading(false);});
      if (result) {
        getInfo();
      }
    } catch (e) {
      // console.log(e);
    }
  };

  const handlePassModal = async(flag) => {
    let showModal = true;
    passSelectDs.setQueryParameter('id', retrieveId);
   await passSelectDs.query().then((res)=>{
    if(res){
      showModal = res.length>1;
    }
    });
    if(showModal){
      Modal.open({
        key: Modal.key(),
        title:
          flag === 'notice'
            ? intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.notice').d('知会')
            : intl.get('hzero.common.view.message.title.approved').d('审批通过'),
        children: (
          <Form dataSet={passModalDs} labelLayout="float">
            <Select name="tenant" />
          </Form>
        ),
        style: { width: 448 },
        // footer: false,
        onOk: () => {
          const { tenant = {} } = passModalDs.toJSONData()[0] || {};
          const { tenantId } = tenant || {};
          passModalDs.reset();
          if (tenantId) handlePass(flag, { tenantId, retrieveId });
          else return false;
        },
        closable: true,
        maskClosable: true,
      });
    }else{
      const {tenantId} = passSelectDs.toData()[0]||{};
     return handlePass(flag, { tenantId, retrieveId });
    }
  };

  const columnsContactInfo = [
    {
      name: 'name',
      width: 100,
    },
    {
      name: 'gender',
      width: 80,
      renderer: ({ value }) => {
        return value === 1
          ? intl.get('hzero.common.gender.male').d('男')
          : intl.get('hzero.common.gender.female').d('女');
      },
    },
    {
      name: 'mail',
      width: 150,
    },
    {
      name: 'mobilephone',
      width: 150,
    },
    {
      name: 'telephone',
      width: 150,
    },
    {
      name: 'department',
      width: 100,
    },
    {
      name: 'position',
      width: 100,
    },
    {
      name: 'description',
      width: 100,
    },
    {
      name: 'defaultFlag',
      width: 150,
      renderer: enableRender,
    },
    {
      name: 'enabledFlag',
      width: 80,
      renderer: statusRender,
    },
  ];
  const columnsAddressInfo = [
    {
      width: 160,
      name: 'countryName',
    },
    {
      // align: 'center',
      width: 180,
      name: 'regionPathName',
    },
    {
      label: intl.get('spfm.certificationApproval.model.addressTable.addressDetail').d('详细地址'),
      // align: 'center',
      width: 300,
      name: 'addressDetail',
    },
    {
      // align: 'center',
      width: 120,
      name: 'postCode',
    },
    {
      // align: 'center',
      width: 250,
      name: 'description',
    },
    {
      width: 80,
      // align: 'center',
      name: 'enabledFlag',
      renderer: statusRender,
    },
  ];
  const columnsBankInfo = [
    {
      width: 150,
      name: 'bankCountryName',
    },
    {
      width: 150,
      name: 'bankCode',
    },
    {
      width: 180,
      name: 'bankName',
    },
    {
      width: 150,
      name: 'bankFirm',
    },
    {
      width: 180,
      name: 'bankBranchName',
    },
    {
      width: 220,
      // align: 'center',
      name: 'bankAccountName',
    },
    {
      width: 240,
      name: 'bankAccountNum',
    },
    {
      width: 100,
      name: 'masterFlag',
      renderer: enableRender,
    },
    {
      width: 80,
      // align: 'center',
      name: 'enabledFlag',
      renderer: statusRender,
    },
  ];
  const columnsFinanceInfo = [
    {
      width: 70,
      name: 'year',
    },
    {
      name: 'currencyName',
      width: 140,
    },
    {
      width: 180,
      name: 'totalAssets',
    },
    {
      width: 150,
      name: 'totalLiabilities',
    },
    {
      width: 150,
      name: 'currentAssets',
    },
    {
      width: 150,
      name: 'currentLiabilities',
    },
    {
      width: 150,
      name: 'revenue',
    },
    {
      width: 150,
      name: 'netProfit',
    },
    {
      width: 150,
      name: 'assetLiabilityRatio',
      render: ({ value }) => {
        return value > 0 ? <div>{`${(value * 100).toFixed(2)}%`}</div> : <div>--</div>;
      },
    },
    {
      width: 120,
      name: 'currentRatio',
      render: ({ value }) => {
        return value > 0 ? <div>{`${(value * 100).toFixed(2)}%`}</div> : <div>--</div>;
      },
    },
    {
      width: 150,
      name: 'totalAssetsEarningsRatio',
      render: ({ value }) => {
        return value > 0 ? <div>{`${(value * 100).toFixed(2)}%`}</div> : <div>--</div>;
      },
    },
  ];
  const columnsAttachmentInfo = [
    {
      label: intl.get('entity.attachment.type').d('附件类型'),
      name: 'attachmentFileType',
      bind: 'attachamentList.attachmentFileType',
      renderer: ({ record = {} } = {}) => {
        const { data = {} } = record;
        const { attachmentTypeMeaning, subAttachmentMeaning } = data;
        return `${attachmentTypeMeaning}/${subAttachmentMeaning}`;
      },
    },
    {
      label: intl.get('entity.attachment.description').d('附件描述'),
      name: 'description',
      bind: 'attachamentList.description',
    },
    {
      label: intl.get('spfm.certificationApproval.model.attachmentTable.endDate').d('文件到期日'),
      width: 150,
      // align: 'center',
      name: 'endDate',
      bind: 'attachamentList.endDate',
    },
    {
      label: intl.get('spfm.attachment.model.attachment.uploadDate').d('最后更新时间'),
      width: 150,
      // align: 'center',
      name: 'uploadDate',
      bind: 'attachamentList.uploadDate',
    },
    {
      label: intl.get('spfm.attachment.model.attachment.filesContent').d('附件内容'),
      width: 120,
      // align: 'center',
      name: 'attachmentUuid',
      renderer: ({ record = {} } = {}) => {
        const { data = {} } = record;
        const { attachmentCount, attachmentUuid } = data;
        return (
          <div>
            <UploadModal
              viewOnly
              filePreview
              attachmentUUID={attachmentUuid}
              filesNumber={attachmentCount}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spfm-comp"
            />
          </div>
        );
      },
    },
  ];
  return (
    <React.Fragment>
      <Header
        title={intl
          .get('spfm.enterpriseRecovery.view.title.enterpriseRecoveryApprove')
          .d('企业找回审批')}
        backPath="/spfm/enterprise-recovery/list"
      >
        {status === 'PENDING' && (
          <>
            <Button
              color="primary"
              className={styles.primary}
              icon="check"
              loading={loading}
              onClick={() => handlePassModal('pass')}
            >
              {intl.get('hzero.common.view.message.title.approved').d('审批通过')}
            </Button>
            <Button loading={loading} onClick={() => handlePass('reject')} icon="close">
              {intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
            </Button>
            {/* <Tooltip
              title={intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.noticeMetion')
                .d('请在审批通过之前通知当前租户下的租户管理员是否需要申诉，注意只可点击一次。')}
              theme="light"
              overlayClassName={styles.tooltip}
            >
              <Button onClick={() => handlePassModal('notice')} icon="help">
                {intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.notice').d('知会')}
              </Button>
            </Tooltip> */}
          </>
        )}
        <Button onClick={handleHeaderRecords} icon="schedule" loading={loading}>
          {intl
            .get('spfm.enterpriseRecovery.model.enterpriseRecovery.oprationRecord')
            .d('操作记录')}
        </Button>
      </Header>
      <div className={styles.section}>
        <h2 className="title">
          {intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.suggetion').d('审批意见')}
        </h2>
        <Row gutter={16}>
          <Col span={24}>
            <div className="info">
              {status === 'PENDING' ? (
                <EditorForm ds={baseDs} />
              ) : (
                <Output name="processRemark" dataSet={baseDs} />
              )}
            </div>
          </Col>
        </Row>
      </div>
      <BaseInfo ds={baseDs} ModalDs={ModalDs} />
      <div className={styles.section}>
        <Table
          dataSet={tableDs}
          columns={columns}
          header={intl
            .get('spfm.enterpriseRecovery.model.enterpriseRecovery.partnerRelation')
            .d('合作伙伴关系')}
          className={styles.sectionA}
        />
      </div>
      <div className={styles.section} style={{ marginBottom: '32px' }}>
        <h2 className="title">
          {intl.get('spfm.enterprise.view.message.companyInfo').d('企业信息')}
        </h2>
        <RegisterInfo
          ds={companyDs}
          header={intl.get('spfm.enterprise.view.message.registerInfo').d('登记信息')}
          className={styles.sectionA}
        />
        <BussinessInfo
          ds={companyDs}
          header={intl.get('spfm.enterprise.view.message.business').d('基础业务信息')}
          className={styles.sectionA}
        />
        <Table
          dataSet={contactInfoDs}
          columns={columnsContactInfo}
          className={styles.sectionA}
          header={intl
            .get('spfm.certificationApproval.view.title.tab.contactTable')
            .d('联系人信息')}
        />
        <Table
          dataSet={addressInfoDs}
          columns={columnsAddressInfo}
          className={styles.sectionA}
          header={intl.get('spfm.address.model.address.title').d('地址信息')}
        />
        <Table
          dataSet={bankInfoDs}
          columns={columnsBankInfo}
          className={styles.sectionA}
          header={intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息')}
        />
        <InvoiceInfo
          ds={companyDs}
          header={intl.get('spfm.invoice.view.message.title').d('开票信息')}
          className={styles.sectionA}
        />
        <Table
          dataSet={financeInfoDs}
          columns={columnsFinanceInfo}
          className={styles.sectionA}
          header={intl.get('spfm.certificationApproval.view.title.tab.financeTable').d('财务信息')}
        />
        <Table
          dataSet={attachmentUuidDs}
          columns={columnsAttachmentInfo}
          className={styles.sectionA}
          header={intl.get('spfm.attachment.view.title.tab.attachmentTable').d('附件信息')}
        />
      </div>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: [
    'spfm.enterpriseRecovery',
    'hzero.common',
    'spfm.configServer',
    'entity.tenant',
    'entity.supplier',
    'entity.attachment',
    'spfm.enterprise',
    'spfm.certificationApproval',
    'spfm.address',
    'spfm.attachment',
    'spfm.invoice',
    'spfm.bank',
    'entity.attachment',
    'spfm.common',
  ],
})(
  withProps(
    () => {
      const tableDs = new DataSet(getTableDs());
      const oprationDs = new DataSet(getOprationDs());
      const baseDs = new DataSet(getBaseDs());
      const ModalDs = new DataSet(getModalDs());
      const companyDs = new DataSet(getCompanyDs());
      const passModalDs = new DataSet(getPassModalDs());
      const headerOprationDs = new DataSet(getOprationTableDs());
      const contactInfoDs = new DataSet(getContactInfoDs());
      const attachmentUuidDs = new DataSet(getAttachmentUuidDs());
      const financeInfoDs = new DataSet(getFinanceInfoDs());
      const bankInfoDs = new DataSet(getBankInfoDs());
      const addressInfoDs = new DataSet(getAddressInfoDs());
      // baseDs.toJSONData()
      const valueDs = {
        tableDs,
        oprationDs,
        baseDs,
        ModalDs,
        companyDs,
        passModalDs,
        passSelectDs: passSelectDsEl,
        headerOprationDs,
        contactInfoDs,
        attachmentUuidDs,
        financeInfoDs,
        bankInfoDs,
        addressInfoDs,
      };
      return { valueDs };
    },
    { cacheState: true }
  )(TaskDetail)
);
