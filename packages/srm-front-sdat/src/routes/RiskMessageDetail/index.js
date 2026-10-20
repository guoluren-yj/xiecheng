/* eslint-disable no-param-reassign */
/**
 * 风险事件详情
 */
import React, { useEffect, useState, useMemo } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import { Header } from 'components/Page';
import { Form, Output, Spin, Modal, DataSet, Attachment, Row, Col } from 'choerodon-ui/pro';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { connect } from 'dva';
import { queryIdpValue } from 'services/api';

import { getResponse } from '@/utils/utils';
import { fetchDynamicDetail } from '@/services/riskMessageService';
import { fetchMonitorMsg, fetchSupplierMsg } from '@/services/riskWorkPlaceService';

import { IncidentDetailDS, AttachmentDS, BroadcastDS } from './stores/riskMessageDS';
import CommonDetail from '../RiskControlWorkbench/CommonDetail';

import styles from './index.less';

const riskEventKey = Modal.key();

const RiskMessageDetail = (props) => {
  const riskEventId = props?.match?.params?.riskEventId ?? '';

  const dataSet = useMemo(() => new DataSet({ ...IncidentDetailDS() }), []);
  const basicAttachDS = useMemo(() => new DataSet({ ...AttachmentDS() }), []);
  const childAttachDS = useMemo(() => new DataSet({ ...AttachmentDS() }), []);
  const broadcastDS = useMemo(() => new DataSet({ ...BroadcastDS() }), []);

  const [detail, setDetail] = useState({});
  const [eventData, setEventData] = useState({});
  const [supplierData, setSupplierData] = useState({});
  // const [approveRecordData, setApproveRecordData] = useState([]);
  const [loading, setPageLoading] = useState(false);
  const [indexCode, setIndexCode] = useState('');

  useEffect(() => {
    if (riskEventId) {
      const typeMap = {};

      queryIdpValue('SDAT.PROCESS_ACTION').then((res) => {
        if (getResponse(res)) {
          res.forEach((item) => {
            typeMap[item.value] = item.meaning;
          });
        }
      });

      setPageLoading(true);
      fetchDynamicDetail({ riskEventId }).then((res) => {
        setPageLoading(false);
        if (getResponse(res)) {
          let attachUuid = '';
          let processReason = '';
          if (res && res.customerRiskProcessList && res.customerRiskProcessList.length) {
            res.customerRiskProcessList.forEach((item) => {
              if (item.processAction === 'RISK_BROADCAST') {
                attachUuid = item?.attachmentUuid ?? '';
                processReason = item?.processReason ?? '';
              }
            });
          }

          basicAttachDS.loadData([{ attachmentUuid: res?.attachmentUuid ?? '' }]);
          childAttachDS.loadData([{ attachmentUuid: attachUuid }]);
          broadcastDS.loadData([{ processReason }]);
          const obj = {
            dimension: res?.dimension ?? '',
            eventLevel: res?.eventLevel ?? '',
            eventTime: res?.eventTime ?? '',
          };

          setEventData(res && res.workbenchData ? { ...res.workbenchData, ...obj } : {});
          setDetail(
            res?.workbenchData?.detail ?? {
              eventName: res?.workbenchData?.eventName ?? '',
              eventTime: res?.eventTime ?? '',
              eventLevel: res?.eventLevel ?? '',
              dimension: res?.dimension ?? '',
            }
          );
          setIndexCode(res?.workbenchData?.indexCode ?? '-1');

          const socialCode = res?.workbenchData?.socialCode ?? '';
          if (socialCode) {
            fetchMonitorMsg({
              socialCode,
              tenantId: getCurrentOrganizationId(),
              userId: getCurrentUserId().id,
            }).then((result) => {
              if (getResponse(result)) {
                const param =
                  result && result.content && result.content.length ? result.content[0] : {};
                let monthCount;
                let monthOrder;
                let scoreTime;
                if (param) {
                  monthCount =
                    param.totalCount >= 0 || param.totalAmount >= 0
                      ? `${param.totalCount || '-'}/${param.totalAmount || '-'}`
                      : null;
                  monthOrder =
                    param.orderCount >= 0 || param.orderAmount >= 0
                      ? `${param.orderCount || '-'}/${param.orderAmount || '-'}`
                      : null;
                  scoreTime =
                    param.finalScore >= 0 || param.scoreDate
                      ? `${param.finalScore || '-'}/${param.scoreDate || '-'}`
                      : null;
                }

                dataSet.create(
                  {
                    ...param,
                    monthCount,
                    monthOrder,
                    scoreAndTime: scoreTime,
                  },
                  0
                );
                if (param.enterpriseName || param.socialCode) {
                  fetchSupplierMsg([
                    {
                      companyName: param.enterpriseName,
                      unifiedSocialCode: param.socialCode,
                    },
                  ]).then((result2) => {
                    if (getResponse(result2)) {
                      setSupplierData(result2 && result2.length ? { ...result2[0] } : {});
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  }, [riskEventId]);

  /**
   * 打开二级弹窗
   */
  const handleOpenSubModal = () => {
    const path = '/sslm/supplier-manager/supplier-detail';

    const obj = dataSet?.current?.toData() ?? {};

    const companyId = supplierData?.companyId ?? '';
    const supplierCompanyId = supplierData?.supplierCompanyId ?? '';
    const { tenantId } = obj;
    const partnerTenantId = supplierData?.supplierTenantId ?? '';

    const embedProps = {
      path,
      pageData: {},
      location: {
        path,
        pathname: path,
        search: `?companyId=${companyId}&partnerTenantId=${partnerTenantId}&supplierCompanyId=${supplierCompanyId}&tenantId=${tenantId}&pageType=readOnly`,
      },
      match: {
        path,
      },
      history: {
        ...window.dvaApp._history,
      },
    };

    Modal.open({
      title: '',
      children: <EmbedPage href={path} {...embedProps} />,
      key: riskEventKey,
      closable: false,
      drawer: true,
      mask: true,
      resizable: true,
      style: { width: '1000px' },
      contentStyle: { padding: '0' },
      bodyStyle: { padding: '0' },
      header: null,
      footer: null,
    });
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['risk-incident-detail-basic']}>
        <Header
          title={intl.get('sdat.riskControl.view.title.eventMessageDetail').d('风险事件详情')}
        />

        <div className={styles['risk-incident-detail-modal-basic-info']}>
          <div style={{ padding: '20px', background: '#fff' }}>
            <div className={styles['risk-incident-detail-modal-basic']}>
              {intl.get('sdat.riskControl.view.title.eventInfo').d('事件信息')}
            </div>
            {detail && Object.keys(detail).length ? (
              <div>
                <CommonDetail
                  showCommon
                  detail={detail}
                  fieldWidth
                  localRecord={eventData}
                  dimensionCode={indexCode}
                />
                <Form dataSet={broadcastDS} columns={1} labelLayout="float">
                  <Output name="processReason" />
                </Form>
              </div>
            ) : (
              <span style={{ color: '#868d9c', marginTop: '12px', display: 'inline-block' }}>
                {intl.get('hzero.common.message.data.none').d('暂无数据')}
              </span>
            )}
          </div>

          <div style={{ padding: '20px', background: '#fff', marginTop: '8px' }}>
            <div className={styles['risk-incident-detail-modal-basic']}>
              {intl.get('sdat.riskControl.view.title.attachInfo').d('附件信息')}
            </div>
            <div style={{ marginTop: '16px', minHeight: '121px' }}>
              <Row style={{ marginTop: '8px' }}>
                <Col span={8} style={{ paddingRight: '16px' }}>
                  <Form dataSet={basicAttachDS} columns={1} labelLayout="float">
                    <Attachment
                      name="attachmentUuid"
                      sortable={false}
                      label={intl
                        .get(`sdat.riskDefinition.model.riskEventAttach`)
                        .d('风险事件附件')}
                      readOnly
                    />
                  </Form>
                </Col>
                <Col span={8}>
                  <Form dataSet={childAttachDS} columns={1} labelLayout="float">
                    <Attachment
                      name="attachmentUuid"
                      sortable={false}
                      label={intl
                        .get(`sdat.riskDefinition.model.broadcastAttach`)
                        .d('风险广播附件')}
                      readOnly
                    />
                  </Form>
                </Col>
              </Row>
            </div>
          </div>

          {indexCode !== 'linkRepeat' ? (
            <div style={{ padding: '20px', background: '#fff', marginTop: '8px' }}>
              <div className={styles['risk-incident-detail-modal-basic']}>
                {intl.get('sdat.riskControl.view.title.companyInfo').d('公司信息')}
              </div>

              <div className={styles['risk-incident-detail-modal-supplier-panel']}>
                <Form dataSet={dataSet} columns={3} labelLayout="float">
                  <Output name="enterpriseName" />
                  <Output name="socialCode" />
                  <Output name="registerTime" />
                  <Output name="countInfo" />
                  <Output name="monthCount" />
                  <Output name="monthOrder" />
                  <Output name="scoreAndTime" />
                </Form>
              </div>

              {supplierData && supplierData.isPartner === 1 ? (
                <div style={{ marginTop: '16px' }}>
                  <a onClick={handleOpenSubModal}>
                    {intl
                      .get('sdat.riskControl.view.title.businessSearchAround')
                      .d('企业360度查询')}
                    &gt;
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* <div style={{ padding: '20px', background: '#fff', marginTop: '8px' }}>
            <div className={styles['risk-incident-detail-modal-basic']}>
              {intl.get('sdat.riskControl.view.title.operationRecord').d('处置记录')}
            </div>
            <div style={{ marginTop: '16px', minHeight: '121px' }}>
              <OperationRecord operationList={approveRecordData} />
            </div>
          </div> */}
        </div>
      </div>
    </Spin>
  );
};

export default connect((state) => state)(
  formatterCollections({
    code: ['sdat.riskControl', 'sdat.monitorStuff', 'sdat.monitorBusiness', 'sdat.riskDefinition'],
  })(RiskMessageDetail)
);
