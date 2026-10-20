/**
 * 风险凭证详情弹窗
 */
import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import notification from 'utils/notification';
import {
  Form,
  Output,
  Modal,
  DataSet,
  Table,
  Button,
  Spin,
  Row,
  Col,
  Attachment,
} from 'choerodon-ui/pro';

import { getResponse } from '@/utils/utils';
import {
  fetchApproveDetail,
  fetchApprovePeople,
  fetchPagePath,
  fetchProblemId,
} from '@/services/riskWorkPlaceService';

import QueryBarMore from './QueryBarMore';
import CommonDetail from '../CommonDetail';
import InnerEmbedPage from '../InnerEmbedPage';
import { AccountViewListDS, AttachmentDS } from '../stores/riskControlDS';

import styles from './index.less';

let globalUuid = '';
let isCanClick = 1;

export default function RiskVoucherDetails(props) {
  const { voucherDisposalDS, localRecord, typeMode, parentAttach, eventNumber, companyId } = props;

  const viewDS = useMemo(() => new DataSet({ ...AccountViewListDS() }), []);
  const attachmentDS = useMemo(() => new DataSet({ ...AttachmentDS() }), []);

  const [userList, setUserList] = useState([]);
  const [loading, setPageLoading] = useState(false);
  const [details, setDetail] = useState({});
  const [indexCode, setIndexCode] = useState('');

  useEffect(() => {
    globalUuid = uuid();
    return () => {
      voucherDisposalDS.loadData([]);
      globalUuid = '';
      isCanClick = 1;
    };
  }, []);

  useEffect(() => {
    if (localRecord && localRecord.riskProcessId) {
      setPageLoading(true);
      fetchApproveDetail({ riskProcessId: localRecord.riskProcessId }).then((res) => {
        setPageLoading(false);
        if (getResponse(res)) {
          const obj = res || {};
          // const processActionStr = obj.processAction || '';
          // delete obj.processAction;

          voucherDisposalDS.create(
            {
              ...obj,
              // processAction: processActionStr.split(','),
            },
            0
          );

          const { workbenchData = {} } = obj;
          setDetail(
            workbenchData?.detail ?? {
              eventName: localRecord?.eventName ?? '',
              eventTime: localRecord?.eventTime ?? '',
              eventLevel: localRecord?.eventLevel ?? '',
              dimension: localRecord?.dimension ?? '',
            }
          );
          setIndexCode(workbenchData?.indexCode ?? '-1');
        }
      });

      fetchApprovePeople({ riskProcessId: localRecord.riskProcessId }).then((res) => {
        if (getResponse(res)) {
          setUserList(res || []);
        }
      });

      attachmentDS.loadData([{ attachmentUuid: parentAttach }]);
    }
  }, [localRecord]);

  /**
   * 查看广播人群
   */
  const handleViewBroadcast = () => {
    let modal = null;

    viewDS.setQueryParameter('riskProcessId', localRecord.riskProcessId);
    viewDS.query();

    const handleCloseModal = () => {
      if (modal) {
        viewDS.loadData([]);
        modal.close();
      }
    };

    const columns = () => {
      return [{ name: 'loginName' }, { name: 'realName' }];
    };

    const renderQueryBar = (prop) => {
      return <QueryBarMore {...prop} />;
    };

    modal = Modal.open({
      title: null,
      children: (
        <>
          <Table
            dataSet={viewDS}
            queryFieldsLimit={2}
            columns={columns()}
            queryBar={renderQueryBar}
          />
        </>
      ),
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '742px' },
      header: null,
      bodyStyle: { padding: '20px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const typeMap = {
    PUBLISH: 'INVESTIGATION',
    ASSESS: 'SITE',
    RELEGATION: 'RELEGATION',
  };

  const handlePushToOrder = async (record) => {
    let modal = null;
    let res = null;

    if (modal || isCanClick === 0) return false;

    const type = record?.get('processAction') ?? '';
    const bizNum = record?.get('bizNum') ?? '';

    isCanClick = 0;
    let problemHeaderId = null;

    if (type === 'QUALITY') {
      // 质量整改
      res = 1;

      const result = await fetchProblemId({
        problemNums: [bizNum],
      });

      problemHeaderId = Array.isArray(result) && result.length ? result[0].problemHeaderId : '';
    } else {
      res = await fetchPagePath({
        companyId,
        riskEventNum: eventNumber,
        riskProcessUuid: globalUuid,
        reqType: typeMap[type],
        reqNumber: bizNum,
      });
    }

    isCanClick = 1;

    const handleClose = () => {
      if (modal) modal.close();
      isCanClick = 1;
    };

    const resStr = res ? JSON.stringify(res) : '';

    if (res && !(resStr.includes('failed') && resStr.includes('true'))) {
      let url = '';
      if (typeof res === 'string' && res.includes('sslm')) {
        // 供应商单据创建
        url = res;
      } else {
        url = `/sqam/initiated8D/detail/${bizNum}`;
      }

      modal = Modal.open({
        title: '', // intl.get('sdat.riskControl.view.title.supplierOrder').d('供应商')
        drawer: true,
        closable: true,
        style: { width: '1000px' },
        header: null,
        maskClosable: true,
        destroyOnClose: true,
        contentStyle: { padding: '0' },
        bodyStyle: { padding: '0' },
        children: (
          <InnerEmbedPage
            indexCode={indexCode}
            companyId={companyId}
            eventNumber={eventNumber}
            problemHeaderId={problemHeaderId}
            selectedType={type}
            qualityParam={{}}
            path={url}
            globalUuid={globalUuid}
            modal={modal}
          />
        ),
        footer: (
          <div>
            <Button color="primary" onClick={handleClose}>
              {intl.get(`hzero.common.button.close`).d('关闭')}
            </Button>
          </div>
        ),
      });
    } else {
      const responseMsg = typeof res === 'string' ? JSON.parse(res) : res || {};
      notification.error({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: responseMsg?.message ?? '',
      });
      return false;
    }
  };

  const data = voucherDisposalDS?.current?.toData() ?? {};
  const { processAction } = data;
  const proList =
    processAction && Array.isArray(processAction)
      ? [...processAction]
      : processAction?.split(',') ?? [];

  return (
    <Spin spinning={loading}>
      <div className={styles['risk-voucher-detail-basic-info']}>
        <div className={styles['risk-voucher-detail-basic']}>
          {typeMode
            ? intl.get('sdat.riskControl.view.button.riskBroadcast').d('风险广播')
            : intl.get('sdat.riskControl.view.title.disposalInformation').d('处置信息')}
        </div>

        {proList && proList.length && proList.indexOf('RISK_BROADCAST') !== -1 ? (
          <div
            style={{
              lineHeight: '22px',
              fontWeight: '500',
              display: 'inline-block',
            }}
          >
            <a
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '16px',
              }}
              onClick={handleViewBroadcast}
            >
              <span>
                {`${intl.get('sdat.riskControl.view.button.viewBroadcast').d('查看广播人群')}（${
                  userList?.length ?? 0
                }）`}
              </span>
            </a>
          </div>
        ) : null}

        <div>
          <Form dataSet={voucherDisposalDS} columns={2} labelLayout="float">
            {!typeMode ? <Output name="processAction" /> : null}
            {!typeMode ? <Output name="processFeedback" /> : null}
            {!typeMode ? (
              <Output
                name="bizNum"
                renderer={({ record, text }) => {
                  const bizDeleteFlag = record?.get('bizDeleteFlag');

                  return [0, '0'].includes(bizDeleteFlag) ? (
                    <a onClick={() => handlePushToOrder(record)}>{text}</a>
                  ) : (
                    <span style={{ color: '#868D9C' }}>{text}</span>
                  );
                }}
              />
            ) : null}
            <Output name="processReason" colSpan={2} />
          </Form>
        </div>

        <div className={styles['risk-voucher-detail-basic']} style={{ marginTop: '32px' }}>
          {intl.get('sdat.riskControl.view.title.basicInfo').d('基础信息')}
        </div>

        {details && Object.keys(details).length ? (
          <div style={{ marginTop: '4px' }}>
            <CommonDetail
              showCommon
              localRecord={localRecord}
              detail={details}
              dimensionCode={indexCode}
            />
          </div>
        ) : (
          <span style={{ color: '#868d9c', marginTop: '12px', display: 'inline-block' }}>
            {intl.get('hzero.common.message.data.none').d('暂无数据')}
          </span>
        )}

        <div className={styles['risk-voucher-detail-basic']} style={{ marginTop: '32px' }}>
          {intl.get('sdat.riskControl.view.title.attachInfo').d('附件信息')}
        </div>
        <Row style={{ marginTop: '8px' }}>
          <Col span={12} style={{ paddingRight: '16px' }}>
            <Form dataSet={attachmentDS} columns={1} labelLayout="float">
              <Attachment name="attachmentUuid" sortable={false} readOnly />
            </Form>
          </Col>
          <Col span={12}>
            <Form dataSet={voucherDisposalDS} columns={1} labelLayout="float">
              <Attachment name="attachmentUuid" sortable={false} readOnly />
            </Form>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
