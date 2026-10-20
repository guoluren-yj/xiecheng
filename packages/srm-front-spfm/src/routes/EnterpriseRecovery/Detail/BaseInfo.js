import React from 'react';
import { Output, Table, Tooltip } from 'choerodon-ui/pro';
import { Popover, Row, Col } from 'choerodon-ui';
// import UploadModal from 'components/Upload/index';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';

import intl from 'utils/intl';
import styles from '../index.less';

export default ({ ds, ModalDs }) => {
  const columnsModal = [
    {
      name: 'adminMess',
      width: 110,
      renderer: ({ value }) =>
        value ? (
          <Tooltip title={value} theme="light" overlayClassName={styles.tooltip}>
            {value}
          </Tooltip>
        ) : null,
    },
    {
      name: 'confirmRemark',
      width: 120,
      renderer: ({ value }) =>
        value ? (
          <Tooltip title={value} theme="light" overlayClassName={styles.tooltip}>
            {value}
          </Tooltip>
        ) : null,
    },
  ];

  const handleViewDetail = (record) => {
    const { data = {} } = record;
    const { retrieveId } = data;
    ModalDs.setQueryParameter('retrieveId', retrieveId);
    ModalDs.query();
  };

  return (
    <div className={styles.section}>
      <h2 className="title">
        {intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.myRequestInfo').d('申请信息')}
      </h2>
      <>
        <Row gutter={24}>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.retrieveNum')
                .d('申请单号')}
            </div>
            <div className="info">
              <Output name="retrieveNum" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.applicantName')
                .d('申请人姓名')}
            </div>
            <div className="info">
              <Output name="applicantName" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.applicantPhone')
                .d('申请人手机号')}
            </div>
            <div className="info">
              <Output name="phone" dataSet={ds} />
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.applicantEmail')
                .d('申请人邮箱')}
            </div>
            <div className="info">
              <Output name="email" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.applyDate').d('申请日期')}
            </div>
            <div className="info">
              <Output name="creationDate" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.companyName')
                .d('企业名称')}
            </div>
            <div className="info">
              <Output name="companyName" dataSet={ds} />
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.unifiedSocialCode')
                .d('统一社会信用码')}
            </div>
            <div className="info">
              <Output name="unifiedSocialCode" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.organizingInstitutionCode')
                .d('组织机构代码')}
            </div>
            <div className="info">
              <Output name="organizingInstitutionCode" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.dunsCode')
                .d('邓白氏编码')}
            </div>
            <div className="info">
              <Output name="dunsCode" dataSet={ds} />
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.businessRegistrationNumber')
                .d('商业注册登记号/税号')}
            </div>
            <div className="info">
              <Output name="businessRegistrationNumber" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.identityNum')
                .d('身份证号')}
            </div>
            <div className="info">
              <Output name="idNum" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.passportNum').d('护照号')}
            </div>
            <div className="info">
              <Output name="passport" dataSet={ds} />
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.webUrlTenant')
                .d('域名所属租户')}
            </div>
            <div className="info">
              <Output name="webUrlTenantName" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchase')
                .d('采购方企业名称')}
            </div>
            <div className="info">
              <Output name="purchasePartner" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchaseUnifiedCode')
                .d('采购方企业统一社会信用代码')}
            </div>
            <div className="info">
              <Output name="purchaseUnifiedSocialCode" dataSet={ds} />
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
        <Col span={7}>
            <div className="label">
              {intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchaseDunsCode')
              .d('采购方邓白氏编码')}
            </div>
            <div className="info">
              <Output name="purchaseDunsCode" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchaseBusinessRegistrationNumber')
          .d('采购方企业注册登记号/税号')}
            </div>
            <div className="info">
              <Output name="purchaseBusinessRegistrationNumber" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="middleInfo">
              <Output
                name="attachmentUuid"
                renderer={({ record = {} } = {}) => {
                  const { data = {} } = record;
                  return (
                    <UploadModal
                      viewOnly
                      btnText={intl.get('hzero.common.upload.view').d('查看附件')}
                      bucketName={PRIVATE_BUCKET}
                      attachmentUUID={data.attachmentUuid}
                      enableImageWatermark={1}
                    />
                  );
                }}
                dataSet={ds}
              />
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
        <Col span={7}>
            <div className="label">
              {intl
                .get('spfm.enterpriseRecovery.model.enterpriseRecovery.attachmentType')
                .d('附件类型')}
            </div>
            <div className="info">
              <Output name="attachmentType" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="label">
              {intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.remark').d('附件备注')}
            </div>
            <div className="info">
              <Output name="remark" dataSet={ds} />
            </div>
          </Col>
          <Col span={7}>
            <div className="middleInfo">
              <Output
                name="adminSuggest"
                renderer={({ record }) => (
                  <div>
                    <Popover
                      overlayClassName={styles.popover}
                      content={<Table dataSet={ModalDs} columns={columnsModal} />}
                      placement="bottomRight"
                      trigger="click"
                      title={intl
                        .get('spfm.enterpriseRecovery.model.enterpriseRecovery.adminSuggest')
                        .d('管理员意见')}
                    >
                      <a onClick={() => handleViewDetail(record)}>
                        {intl
                          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.viewAdminSuggest')
                          .d('查看管理员意见')}
                      </a>
                    </Popover>
                  </div>
                )}
                dataSet={ds}
              />
            </div>
          </Col>
        </Row>
      </>
    </div>
  );
};
