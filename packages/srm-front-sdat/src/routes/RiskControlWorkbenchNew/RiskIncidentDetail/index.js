/**
 * 风险事件详情
 */
import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { Form, Output, Modal, Spin, Attachment, DataSet } from 'choerodon-ui/pro';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';

import { getResponse } from '@/utils/utils';
import {
  fetchDynamicDetail,
  fetchMonitorMsg,
  fetchSupplierMsg,
  fetchSupplierList,
} from '@/services/riskNewWorkPlaceService';

import { AttachmentDS } from '../stores/riskControlDS';

import styles from './index.less';
import CommonDetail from '../CommonDetail';

const riskEventKey = Modal.key();

export default function RiskIncidentDetail(props) {
  const { dataSet, localRecord, closeFormDS } = props;

  const ds = useMemo(() => new DataSet({ ...AttachmentDS() }), []);

  const [detail, setDetail] = useState({});
  const [supplierData, setSupplierData] = useState({});
  const [loading, setPageLoading] = useState(false);
  const [indexCode, setIndexCode] = useState('');
  const [old360Page, setOld360Page] = useState(false);

  useEffect(() => {
    if (localRecord.defineId !== -1) {
      setPageLoading(true);
      fetchDynamicDetail({
        riskEventId: localRecord.riskEventId,
      }).then((res) => {
        setPageLoading(false);
        if (getResponse(res)) {
          const riskMessageDetail = res?.riskMessageDetail ?? [];
          const obj = riskMessageDetail.length ? riskMessageDetail[0] : {};
          const result = obj?.result ?? {};

          setDetail({
            riskItemCode: res?.riskItemCode ?? '',
            planNumber: res?.planNumber ?? '',
            scopeType: res?.scopeType ?? '',
            companyName: res?.companyName ?? '',
            dsType: res?.dsType ?? '',
            ...obj,
            ...result,
          });
          setIndexCode(res?.riskItemCode ?? '');
        }
      });
    } else {
      setDetail({
        eventName: localRecord?.eventName ?? '',
        eventTime: localRecord?.eventTime ?? '',
        eventLevel: localRecord?.eventLevel ?? '',
        // dimension: localRecord?.dimension ?? '',
      });
      setIndexCode('-1');
    }

    if (localRecord) {
      ds.loadData([{ ...localRecord }]);
    }

    if (localRecord && localRecord.socialCode) {
      fetchMonitorMsg({
        riskEventId: localRecord.riskEventId,
        socialCode: localRecord.socialCode,
      }).then((res) => {
        if (getResponse(res)) {
          const param = res ? { ...res } : {};

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
            ]).then((result) => {
              if (getResponse(result)) {
                const supplierObj = result && result.length ? { ...result[0] } : {};
                setSupplierData(supplierObj);
                if (supplierObj?.isPartner === 1) {
                  const { tenantNum = '' } = getCurrentUser();
                  fetchSupplierList({
                    code: 'sslm_life_cycle_new_360_bk',
                    tenantNum,
                  }).then((res1) => {
                    if (getResponse(res1) && Array.isArray(res1)) {
                      setOld360Page(res1?.length > 0);
                    }
                  });
                }
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
    const path = old360Page
      ? '/sslm/supplier-manager/supplier-detail'
      : '/sslm/supplier-detail-new';

    const companyId = supplierData?.companyId ?? '';
    const supplierCompanyId = supplierData?.supplierCompanyId ?? '';
    const partnerTenantId = supplierData?.supplierTenantId ?? '';

    const embedProps = {
      path,
      pageData: {},
      location: {
        path,
        pathname: path,
        search: `?companyId=${companyId}&partnerTenantId=${partnerTenantId}&supplierCompanyId=${supplierCompanyId}&tenantId=${getCurrentOrganizationId()}&pageType=readOnly`,
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
      drawer: true,
      mask: true,
      closable: true,
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

        {indexCode !== 'linkRepeat' ? (
          <>
            <div
              className={styles['risk-incident-detail-modal-basic']}
              style={{ marginTop: '32px' }}
            >
              {intl.get('sdat.riskControl.view.title.companyInfo').d('公司信息')}
            </div>

            <div className={styles['risk-incident-detail-modal-supplier-panel']}>
              <Form dataSet={dataSet} columns={2} labelLayout="float">
                <Output name="enterpriseName" />
                <Output name="socialCode" />
                <Output name="registerTime" />
                {/* <Output name="countInfo" /> */}
                {/* <Output name="monthCount" />
                <Output name="monthOrder" />
                <Output name="scoreAndTime" /> */}
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
          </>
        ) : null}

        <div className={styles['risk-incident-detail-modal-basic']} style={{ marginTop: '32px' }}>
          {intl.get('sdat.riskControl.view.title.attachInfo').d('附件信息')}
        </div>
        <div style={{ marginTop: '8px' }}>
          <Form dataSet={ds} columns={2} labelLayout="float">
            <Attachment name="attachmentUuid" sortable={false} readOnly />
          </Form>
        </div>

        {localRecord?.status === 'FINISH' ? (
          <>
            <div
              className={styles['risk-incident-detail-modal-basic']}
              style={{ marginTop: '32px' }}
            >
              {intl.get('sdat.riskControl.view.title.closeInfo').d('关闭信息')}
            </div>
            <Form dataSet={closeFormDS} columns={2} labelLayout="float">
              <Output name="remark" />
              <Attachment name="closeAttachmentUuid" sortable={false} readOnly newLine />
            </Form>
          </>
        ) : null}
      </div>
    </Spin>
  );
}
