/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useState } from 'react';
import intl from 'utils/intl';
import {
  Form,
  // Select,
  TextArea,
  Icon,
  Modal,
  Button,
  DataSet,
  Spin,
  Attachment,
  Row,
  Col,
} from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

import { fetchDynamicDetail } from '@/services/riskWorkPlaceService';
import { uniqueFunc, getResponse } from '@/utils/utils';

import style from './index.less';
import { AccountListDS, AttachmentDS } from '../stores/riskControlDS';
import CommonDetail from '../CommonDetail';
import RiskManagerModal from '../RiskManagerModal';

let cachePersonList = [];

export default function BroadcastModal(props) {
  const accountListDS = useMemo(() => new DataSet({ ...AccountListDS() }), []);
  const attachmentDS = useMemo(() => new DataSet({ ...AttachmentDS() }), []);

  const { broadcastDS, localRecord } = props;

  const [loading, setPageLoading] = useState(false);
  const [detail, setDetail] = useState({});
  const [indexCode, setIndexCode] = useState('');

  useEffect(() => {
    return () => {
      cachePersonList = [];
    };
  }, []);

  useEffect(() => {
    if (localRecord && localRecord.riskEventId) {
      broadcastDS.create({
        riskEventId: localRecord.riskEventId,
        tenantId: getCurrentOrganizationId(),
        processAction: ['RISK_BROADCAST'],
        broadcastWay: 'MAIL',
      });
      attachmentDS.loadData([{ ...localRecord }]);
    }

    if (localRecord.defineId !== -1) {
      setPageLoading(true);
      fetchDynamicDetail({
        eventId: localRecord.eventId,
        resultId: localRecord.resultId,
        tenantId: getCurrentOrganizationId(),
      }).then((res) => {
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

    return () => {
      broadcastDS.data = [];
      broadcastDS.reset();
    };
  }, [localRecord]);

  /**
   * 选择风险经办人
   */
  const openSelectPeople = async () => {
    let modal = null;
    const record = broadcastDS?.current?.toData() ?? {};

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    // 默认选中的数据
    const defaultArr = record?.customerRiskProcessPersonList ?? [];

    /**
     * 选择经办人确定操作
     */
    const handleSubmit = async () => {
      const personList = accountListDS.selected.map((rcd) => rcd.toData());
      const mixList = [...personList, ...cachePersonList];

      const uniList = uniqueFunc(mixList, 'loginName');

      if (broadcastDS && broadcastDS.current) {
        broadcastDS.current.set('customerRiskProcessPersonList', uniList);
      }
      modal.close();
    };

    const handleChangeCache = (data = []) => {
      cachePersonList = [...data];
    };

    modal = Modal.open({
      title: null,
      children: (
        <RiskManagerModal
          localRecord={record}
          defaultList={defaultArr}
          onChangeCache={handleChangeCache}
          accountListDS={accountListDS}
        />
      ),
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '1000px' },
      header: null,
      bodyStyle: { padding: '20px 0 0 20px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleSubmit}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const count = broadcastDS?.current?.toData()?.customerRiskProcessPersonList?.length ?? 0;

  return (
    <Spin spinning={loading}>
      <div className={style['risk-voucher-modal-basic-info']}>
        <div className={style['risk-voucher-modal-basic']}>
          {intl.get('sdat.riskControl.view.button.riskBroadcast').d('风险广播')}
        </div>

        <div
          style={{
            lineHeight: '22px',
            fontWeight: '500',
            marginTop: '16px',
            display: 'inline-block',
          }}
        >
          <a style={{ display: 'flex', alignItems: 'center' }} onClick={openSelectPeople}>
            <Icon type="add" />
            <span>
              {`${intl.get('sdat.riskControl.view.button.broadcast').d('广播人群')}（${count}）`}
            </span>
          </a>
        </div>

        <div style={{ marginTop: '20px' }}>
          <Form dataSet={broadcastDS} columns={1} labelLayout="float">
            <TextArea name="processReason" colSpan={2} maxLength={200} showLengthInfo />
          </Form>
        </div>

        <div className={style['risk-voucher-modal-basic']} style={{ marginTop: '32px' }}>
          {intl.get('sdat.riskControl.view.title.basicInfo').d('事件信息')}
        </div>

        {detail && Object.keys(detail).length ? (
          <div>
            <CommonDetail
              showCommon
              localRecord={localRecord}
              detail={detail}
              dimensionCode={indexCode}
            />
          </div>
        ) : (
          <span style={{ color: '#868d9c', marginTop: '12px', display: 'inline-block' }}>
            {intl.get('hzero.common.message.data.none').d('暂无数据')}
          </span>
        )}

        <div className={style['risk-voucher-modal-basic']} style={{ marginTop: '32px' }}>
          {intl.get('sdat.riskControl.view.title.attachInfo').d('附件信息')}
        </div>
        <Row style={{ marginTop: '8px' }}>
          <Col span={12} style={{ paddingRight: '16px' }}>
            <Form dataSet={attachmentDS} columns={1} labelLayout="float">
              <Attachment name="attachmentUuid" sortable={false} readOnly />
            </Form>
          </Col>
          <Col span={12}>
            <Form dataSet={broadcastDS} columns={1} labelLayout="float">
              <Attachment name="attachmentUuid" sortable={false} />
            </Form>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
