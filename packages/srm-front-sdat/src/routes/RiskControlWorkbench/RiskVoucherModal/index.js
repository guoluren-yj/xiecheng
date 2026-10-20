/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useState } from 'react';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import notification from 'utils/notification';
import {
  Form,
  Select,
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

import {
  fetchDynamicDetail,
  fetchPagePath,
  fetchProcessList,
  fetchQualityParam,
} from '@/services/riskWorkPlaceService';
import { uniqueFunc, getResponse } from '@/utils/utils';

import style from './index.less';
import { AccountListDS, AttachmentDS } from '../stores/riskControlDS';
import CommonDetail from '../CommonDetail';
import RiskManagerModal from '../RiskManagerModal';
import InnerEmbedPage from '../InnerEmbedPage';

let cachePersonList = [];
let isCanClick = 1;
let innerUuid = '';

export default function RiskVoucherModal(props) {
  const accountListDS = useMemo(() => new DataSet({ ...AccountListDS() }), []);
  const attachmentDS = useMemo(() => new DataSet({ ...AttachmentDS() }), []);

  const {
    disposalDS,
    localRecord,
    parentAttach,
    cooperationFlag,
    companyId,
    // globalUuid,
    eventNumber,
    onChangeUuid = () => {},
  } = props;

  const [loading, setPageLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [detail, setDetail] = useState({});
  const [hidden, setHidden] = useState(true);
  const [indexCode, setIndexCode] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [processList, setProcessList] = useState([]);

  useEffect(() => {
    return () => {
      cachePersonList = [];
      isCanClick = 1;
      innerUuid = '';
      onChangeUuid('');
    };
  }, []);

  useEffect(() => {
    if (localRecord && localRecord.riskEventId) {
      disposalDS.create({
        riskEventId: localRecord.riskEventId,
        tenantId: getCurrentOrganizationId(),
        broadcastWay: 'MAIL',
        attachmentUuid: '',
      });
      attachmentDS.loadData([{ attachmentUuid: parentAttach }]);

      fetchProcessList({
        riskEventId: localRecord.riskEventId,
        eventId: localRecord.eventId,
      }).then((res) => {
        if (getResponse(res)) {
          const { processAction = '' } = res;
          setProcessList(processAction ? processAction.split(',') : []);
        }
      });
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
      disposalDS.data = [];
      disposalDS.reset();
    };
  }, [localRecord]);

  /**
   * 选择风险经办人
   */
  const openSelectPeople = async () => {
    let modal = null;
    const record = disposalDS?.current?.toData() ?? {};

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

      if (disposalDS && disposalDS.current) {
        disposalDS.current.set('customerRiskProcessPersonList', uniList);
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

  const count = disposalDS?.current?.toData()?.customerRiskProcessPersonList?.length ?? 0;

  const handleChangeType = (value) => {
    setSelectedType(value);
    innerUuid = uuid();
    onChangeUuid(innerUuid);
    if (disposalDS && disposalDS.current) {
      disposalDS.current.set('processAction', value);
      disposalDS.current.set('actionCode', value);
    }

    if (value && value.length && value.indexOf('RISK_BROADCAST') !== -1) {
      setHidden(false);
    } else {
      setHidden(true);
      if (disposalDS && disposalDS.current) {
        disposalDS.current.set('customerRiskProcessPersonList', []);
      }
    }
  };

  const typeMap = {
    PUBLISH: 'INVESTIGATION',
    ASSESS: 'SITE',
    RELEGATION: 'RELEGATION',
  };

  const handleLinkSurvey = async () => {
    let modal = null;
    let res = null;

    if (modal || isCanClick === 0) return false;

    setFetching(true);
    isCanClick = 0;
    if (selectedType === 'QUALITY') {
      // 质量整改
      res = await fetchQualityParam({
        companyId,
      });
    } else {
      res = await fetchPagePath({
        companyId,
        riskEventNum: eventNumber,
        riskProcessUuid: innerUuid,
        reqType: typeMap[selectedType],
      });
    }

    setFetching(false);
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
        url = `/sqam/create8D/create`;
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
            selectedType={selectedType}
            qualityParam={selectedType === 'QUALITY' ? { ...res } : {}}
            path={url}
            globalUuid={innerUuid}
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

  const tagDs = disposalDS?.getField('processAction')?.getOptions();
  const tagList = tagDs?.toData() ?? [];
  const finalTagList = !(processList && processList.length) ? tagList : [];

  if (tagList.length && processList && processList.length) {
    tagList.forEach((item) => {
      if (processList.includes(item.value)) {
        finalTagList.push({ ...item });
      }
    });
  }

  const titleMap = {
    QUALITY: intl.get('sdat.riskControl.view.title.qualityCreate').d('质量整改创建'),
    PUBLISH: intl.get('sdat.riskControl.view.title.publishSurvey').d('发布调查表'),
    ASSESS: intl.get('sdat.riskControl.view.title.siteInspection').d('现场考察'),
    RELEGATION: intl.get('sdat.riskControl.view.title.relegation').d('供应商升降级申请'),
  };

  const operationMap = {
    QUALITY: intl.get('sdat.riskControl.view.title.qualityCreate').d('质量整改创建'),
    PUBLISH: intl.get('sdat.riskControl.view.title.linkSurvey').d('关联调查表'),
    ASSESS: intl.get('sdat.riskControl.view.title.linkSiteInspection').d('关联现场考察报告'),
    RELEGATION: intl.get('sdat.riskControl.view.title.linkRelegation').d('关联升降级申请单'),
  };

  return (
    <Spin spinning={loading}>
      <div className={style['risk-voucher-modal-basic-info']}>
        <div className={style['risk-voucher-modal-basic']}>
          {intl.get('sdat.riskControl.view.title.disposalInformation').d('处置信息')}
        </div>

        {!hidden ? (
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
        ) : null}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', lineHeight: '32px' }}>
            <div style={{ marginRight: '10px', fontWeight: '600' }}>
              <span style={{ color: 'red' }}>*</span> &nbsp;
              {intl.get('sdat.riskControl.view.title.recommendedAction').d('建议处置动作')}:
            </div>
            <div>
              {finalTagList.map((item) => {
                return item.value !== 'RISK_BROADCAST' && item.value !== 'AUTO_RELEGATION' ? (
                  <span key={item.value} style={{ marginLeft: '8px' }}>
                    {item.meaning}
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <Form dataSet={disposalDS} columns={2} labelLayout="float">
            <Select name="actionCode" onChange={handleChangeType}>
              {finalTagList.map((item) => {
                return item.value !== 'RISK_BROADCAST' && item.value !== 'AUTO_RELEGATION' ? (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ) : null;
              })}
            </Select>
            <Select name="processFeedback" />
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
            <Form dataSet={disposalDS} columns={1} labelLayout="float">
              <Attachment name="attachmentUuid" sortable={false} />
            </Form>
          </Col>
        </Row>

        {['QUALITY', 'PUBLISH', 'ASSESS', 'RELEGATION'].includes(selectedType) ? (
          <>
            <div className={style['risk-voucher-modal-basic']} style={{ marginTop: '32px' }}>
              {titleMap[selectedType]}
            </div>
            <div style={{ marginTop: '8px' }}>
              {![true, 'true'].includes(cooperationFlag) ? (
                <span style={{ color: '#868d9c' }}>{operationMap[selectedType]}</span>
              ) : (
                <div className={style['site-inspection-link-spin']}>
                  {fetching ? <Spin spinning /> : null}
                  <a onClick={handleLinkSurvey} style={{ marginLeft: '4px' }}>
                    {operationMap[selectedType]}
                  </a>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </Spin>
  );
}
