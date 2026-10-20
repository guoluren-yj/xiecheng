/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useState } from 'react';
import intl from 'utils/intl';
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

import { uniqueFunc, getResponse } from '@/utils/utils';
import { fetchApproveDetail, fetchApprovePeople } from '@/services/riskWorkPlaceService'; // fetchIsSupplier

import style from './index.less';
import { AccountListDS, AttachmentDS } from '../stores/riskControlDS';
import CommonDetail from '../CommonDetail';
import RiskManagerModal from '../RiskManagerModal';
// import InnerEmbedPage from '../InnerEmbedPage';

let cachePersonList = [];

export default function RiskVoucherModal(props) {
  const accountListDS = useMemo(() => new DataSet({ ...AccountListDS() }), []);
  const attachmentDS = useMemo(() => new DataSet({ ...AttachmentDS() }), []);

  const { disposalDS, localRecord, typeMode, parentAttach } = props;

  const [loading, setPageLoading] = useState(false);
  const [detail, setDetail] = useState({});
  const [hidden, setHidden] = useState(true);
  const [indexCode, setIndexCode] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    cachePersonList = [];
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (localRecord && localRecord.riskProcessId) {
      setPageLoading(true);
      fetchApproveDetail({ riskProcessId: localRecord.riskProcessId }).then((res) => {
        setPageLoading(false);
        if (getResponse(res)) {
          const obj = res || {};
          const processActionStr = obj.processAction || '';
          const actionList = processActionStr.split(',');
          delete obj.processAction;

          if (actionList.indexOf('RISK_BROADCAST') !== -1) {
            setHidden(false);
          }

          if (localRecord.defineId !== -1) {
            const { workbenchData = {} } = obj;
            setDetail(workbenchData?.detail ?? { ...obj });
            setIndexCode(workbenchData?.indexCode ?? '-1');
          }

          fetchApprovePeople({ riskProcessId: localRecord.riskProcessId }).then((result) => {
            if (getResponse(result)) {
              disposalDS.create(
                {
                  ...obj,
                  processAction: processActionStr, // actionList,
                  actionCode: processActionStr, // actionList,
                  stastus: '1',
                  customerRiskProcessPersonList: [...result],
                },
                0
              );
              setRefresh(true);
            }
          });
        }
      });

      attachmentDS.loadData([{ attachmentUuid: parentAttach }]);
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
    if (defaultArr.length) {
      defaultArr.forEach((item) => {
        item.id = item.id ? item.id : item.userId;
      });
    }

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
      bodyStyle: { padding: '0 20px 20px 20px' },
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

  // const handleLinkSurvey = () => {
  //   fetchIsSupplier().then((res) => {
  //     if(getResponse(res)) {
  //       Modal.open({
  //         title: intl.get('sdat.riskControl.view.title.supplierOrder').d('供应商'),
  //         drawer: true,
  //         closable: true,
  //         style: { width: '1000px' },
  //         children: <InnerEmbedPage indexCode={indexCode} />,
  //         footer: null,
  //       });
  //     }
  //   });
  // };

  const tagDs = disposalDS?.getField('processAction')?.getOptions();
  const tagList = tagDs?.toData() ?? [];

  return (
    <Spin spinning={loading}>
      <div className={style['risk-voucher-modal-basic-info']}>
        <div className={style['risk-voucher-modal-basic']}>
          {typeMode
            ? intl.get('sdat.riskControl.view.button.riskBroadcast').d('风险广播')
            : intl.get('sdat.riskControl.view.title.disposalInformation').d('处置信息')}
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

        <div style={{ marginTop: '20px' }}>
          <Form dataSet={disposalDS} columns={2} labelLayout="float">
            {!typeMode ? (
              <Select name="actionCode" onChange={handleChangeType}>
                {tagList.map((item) => {
                  return item.value !== 'RISK_BROADCAST' ? (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ) : null;
                })}
              </Select>
            ) : null}
            {!typeMode ? <Select name="processFeedback" /> : null}

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

        <div
          className={style['risk-voucher-modal-basicrisk-voucher-modal-basic']}
          style={{ marginTop: '32px' }}
        >
          {intl.get('sdat.riskControl.view.title.attachInfo').d('附件信息')}
        </div>
        <div style={{ marginTop: '8px' }}>
          <Row>
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
        </div>

        {/* <div
          className={style['risk-voucher-modal-basicrisk-voucher-modal-basic']}
          style={{ marginTop: '32px' }}
        >
          {intl.get('sdat.riskControl.view.title.publishSurvey').d('发布调查表')}
        </div>
        <div>
          <a onClick={handleLinkSurvey}>{intl.get('sdat.riskControl.view.title.linkSurvey').d('关联调查表')}</a>
        </div> */}
      </div>
    </Spin>
  );
}
