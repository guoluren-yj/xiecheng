/**
 * 风险事件详情
 */
import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Form, Output, Modal, Spin, Attachment, DataSet } from 'choerodon-ui/pro';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';

import { getResponse } from '@/utils/utils';
import {
  fetchDynamicDetail,
  fetchMonitorMsg,
  fetchSupplierMsg,
} from '@/services/riskWorkPlaceService';
import CommonDetail from '@/routes/RiskControlWorkbench/CommonDetail';

import { AttachmentDS } from '../../../store/monitorOrgManagementDs';

import styles from './index.less';

const riskEventKey = Modal.key();

export default function RiskIncidentDetail(props) {
  const { dataSet, localRecord } = props;

  const ds = useMemo(() => new DataSet({ ...AttachmentDS() }), []);

  const [detail, setDetail] = useState({});
  const [supplierData, setSupplierData] = useState({});
  const [loading, setPageLoading] = useState(false);
  const [indexCode, setIndexCode] = useState('');

  useEffect(() => {
    if (localRecord.defineId !== -1) {
      setPageLoading(true);
      fetchDynamicDetail({
        eventId: localRecord.eventId,
        resultId: localRecord.resultId,
        tenantId: getCurrentOrganizationId(),
      }).then(res => {
        setPageLoading(false);
        if (getResponse(res)) {
          setDetail(res?.detail ?? {});
          setIndexCode(res?.indexCode ?? '');
        }
      });
    } else {
      setDetail({
        eventName: localRecord?.eventName ?? '',
        eventTime: localRecord?.eventTime ?? '',
        eventLevel: localRecord?.eventLevel ?? '',
        dimension: localRecord?.dimension ?? '',
      });
      setIndexCode('-1');
    }

    if (localRecord) {
      ds.loadData([{ ...localRecord }]);
    }

    if (localRecord && localRecord.socialCode) {
      fetchMonitorMsg({
        socialCode: localRecord.socialCode,
        tenantId: getCurrentOrganizationId(),
        // userId: getCurrentUser().id,
      }).then(res => {
        if (getResponse(res)) {
          const param = res && res.content && res.content.length ? res.content[0] : {};

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
            ]).then(result => {
              if (getResponse(result)) {
                setSupplierData(result && result.length ? { ...result[0] } : {});
              }
            });
          }
        }
      });
    }
  }, [localRecord]);

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
      <div className={styles['risk-incident-detail-modal-basic-info']}>
        <div className={styles['risk-incident-detail-modal-basic']}>
          {intl.get('sdat.riskControl.view.title.basicInfo').d('基础信息')}
        </div>
        {detail && Object.keys(detail).length ? (
          <div>
            <CommonDetail
              showCommon
              detail={detail}
              localRecord={localRecord}
              dimensionCode={indexCode}
            />
          </div>
        ) : (
          <span style={{ color: '#868d9c', marginTop: '12px', display: 'inline-block' }}>
            {intl.get('hzero.common.message.data.none').d('暂无数据')}
          </span>
        )}

        <div className={styles['risk-incident-detail-modal-basic']} style={{ marginTop: '32px' }}>
          {intl.get('sdat.riskControl.view.title.companyInfo').d('公司信息')}
        </div>

        <div className={styles['risk-incident-detail-modal-supplier-panel']}>
          <Form dataSet={dataSet} columns={2} labelLayout="float">
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
              {intl.get('sdat.riskControl.view.title.businessSearchAround').d('企业360度查询')}
              &gt;
            </a>
          </div>
        ) : null}

        <div className={styles['risk-incident-detail-modal-basic']} style={{ marginTop: '32px' }}>
          {intl.get('sdat.riskControl.view.title.attachInfo').d('附件信息')}
        </div>
        <div style={{ marginTop: '8px' }}>
          <Form dataSet={ds} columns={2} labelLayout="float">
            <Attachment name="attachmentUuid" sortable={false} readOnly />
          </Form>
        </div>
      </div>
    </Spin>
  );
}
