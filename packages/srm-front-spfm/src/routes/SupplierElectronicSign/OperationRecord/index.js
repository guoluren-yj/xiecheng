/* eslint-disable react/no-array-index-key */
/**
 * 操作记录
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Timeline } from 'choerodon-ui';
import { Icon, Lov, DataSet, DatePicker, Form, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { fetchOperationRecord } from '@/services/supplierElecSignWorkplaceService';

import styles from './index.less';

let queryParam = {};

export default function OperationRecord(props) {
  const { companyId, authType } = props;

  const searchDS = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'dateSr',
            label: intl.get(`spfm.buyerElectronicSign.view.title.operationTime`).d('操作时间'),
            type: 'dateTime',
            range: true,
          },
          {
            label: intl.get(`spfm.buyerElectronicSign.view.title.selectSign`).d('选择印章'),
            name: 'peopleTree',
            type: 'object',
            lovCode: 'SPFM.ELECTRON_SIGN_WORKPLACE_SIGN_SELECT_LIST',
            noCache: true,
            dynamicProps: {
              lovQueryAxiosConfig: () => {
                return {
                  url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-seal/company/${companyId}?sealType=${authType}`,
                  method: 'GET',
                };
              },
            },
          },
        ],
      }),
    []
  );

  const [recordList, setRecordList] = useState([]);
  const [typeMap, setTypeMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    queryIdpValue('SPFM.SIGN_SEAL_RECORD').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setTypeMap(obj);
        // setTypeList(res);
      }
    });

    return () => {
      queryParam = {};
    };
  }, []);

  useEffect(() => {
    if (companyId) {
      getOperationList({
        ...queryParam,
      });
    }
  }, [companyId]);

  const getOperationList = (param = {}) => {
    setLoading(true);
    fetchOperationRecord({
      companyId,
      ...param,
      authType,
    }).then(res => {
      setLoading(false);
      if (getResponse(res) && Array.isArray(res) && res.length) {
        setRecordList([...res]);
      } else {
        setRecordList([]);
      }
    });
  };

  const switchName = (str) => {
    if (str === 'SIGN_PLATFORM') {
      return intl
        .get('spfm.buyerElectronicSign.view.operation.thirdFlatform')
        .d('电子签章第三方平台');
    }
    return str;
  };

  const iconMap = {
    SEAL_DELETE: 'delete',
    SEAL_UPDATE: 'mode_edit', // 撤销
    SEAL_INSERT: 'add', // 新建
    SEAL_REJECT: 'close', // 拒绝
    SEAL_APPROVED: 'check', // 通过
    SEAL_SYNC: 'sync', // 同步
  };

  const drawRecordItem = (list) => {
    return (list || []).map((item, index) => {
      return (
        <>
          <Timeline.Item key={index} color="#E5E5E5">
            <div style={{ lineHeight: '18px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ lineHeight: '16px', margin: '0 14px 0 10px' }}>
                <Icon type={iconMap[item.actionType]} style={{ fontSize: '14px' }} />
              </span>
              <div
                id={`sdat-risk-control-record-item-${index}`}
                className={styles['operation-record-modal-basic']}
              >
                <span style={{ color: '#000', fontWeight: '500' }}>
                  {switchName(item.operationName)}
                </span>
                <span style={{ color: 'rgba(0,0,0,0.65)', marginLeft: '8px' }}>
                  {typeMap[item.actionType]}
                </span>
                【
                <span
                  style={{
                    color: '#000',
                    fontWeight: '500',
                    marginLeft: '3px',
                  }}
                >
                  {item.sealName} - {item.sealCode}
                </span>
                】
              </div>
            </div>
            {item.action && item.action === 'SEAL_UPDATE_CHANGE' ? (
              <div
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  lineHeight: '18px',
                  marginTop: '8px',
                  paddingLeft: '40px',
                }}
              >
                {item.operationName}
                {intl.get('spfm.buyerElectronicSign.view.operation.will').d('将')}
                {`【${intl.get(`spfm.buyerElectronicSign.model.signName`).d('印章名称')}】`}
                {intl.get('spfm.buyerElectronicSign.view.operation.depend').d('由')}
                {`【${item.oldSealName}】`}
                {intl.get('spfm.buyerElectronicSign.view.operation.changeTo').d('变更为')}
                {`【${item.newSealName}】`}
              </div>
            ) : null}

            {(item.action && item.action === 'SEAL_UPDATE_CHANGE_IMG') ||
            (item.multiAction && item.multiAction === 'SEAL_UPDATE_CHANGE_IMG') ? ( // 更改图片
              <div
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  lineHeight: '18px',
                  marginTop: '8px',
                  paddingLeft: '40px',
                }}
              >
                {item.operationName}
                {intl.get('spfm.buyerElectronicSign.view.operation.changePic').d('更换了')}
                {intl.get(`spfm.buyerElectronicSign.model.signPicture`).d('印章图片')}
              </div>
            ) : null}

            {item.action && item.action === 'SEAL_UPDATE_ADD_EMPLOYEE' ? (
              <div
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  lineHeight: '18px',
                  marginTop: '8px',
                  paddingLeft: '40px',
                }}
              >
                {item.operationName}
                {intl
                  .get('spfm.buyerElectronicSign.view.operation.addAuthUser')
                  .d('新增了授权成员')}
                {`【${item.employees}】`}
              </div>
            ) : null}

            {item.action && item.action === 'SEAL_UPDATE_CANCEL_EMPLOYEE' ? (
              <div
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  lineHeight: '18px',
                  marginTop: '8px',
                  paddingLeft: '40px',
                }}
              >
                {item.operationName}
                {intl
                  .get('spfm.buyerElectronicSign.view.operation.removeAuthUser')
                  .d('取消了授权成员')}
                {`【${item.employees}】`}
              </div>
            ) : null}

            {/* 审批拒绝 */}
            {item.action && item.action === 'SEAL_REJECT_REASON' ? (
              <div
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  lineHeight: '18px',
                  marginTop: '8px',
                  paddingLeft: '40px',
                }}
              >
                {intl
                  .get('spfm.buyerElectronicSign.view.operation.thirdRefuse')
                  .d('印章被电子签章第三方平台审核拒绝，原因是')}
                ：{` ${item.sealResMsg} `}
              </div>
            ) : null}

            <div
              style={{
                color: 'rgba(0,0,0,0.45)',
                lineHeight: '18px',
                marginTop: '8px',
                paddingLeft: '40px',
              }}
            >
              {item.creationDate}
            </div>
          </Timeline.Item>
        </>
      );
    });
  };

  // 切换操作类型
  const handleSelectSign = (record) => {
    queryParam.sealId = record?.sealId ?? '';
    getOperationList(queryParam);
  };

  // 切换筛选日期
  const handleChange = (dateStr = []) => {
    queryParam.startDate = dateStr && dateStr.length ? `${moment(dateStr[0]).format('YYYY-MM-DD 00:00:00')}` : '';
    queryParam.endDate =
      dateStr && dateStr.length > 1 ? `${moment(dateStr[1]).format('YYYY-MM-DD 23:59:59')}` : '';
    getOperationList(queryParam);
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['operation-modal-lov']}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <Form dataSet={searchDS} columns={2} labelLayout="float">
            <DatePicker name="dateSr" onChange={handleChange} />
            <Lov name="peopleTree" onChange={handleSelectSign} />
          </Form>
        </div>
        <div
          className={styles['operation-record-modal-basic-panel']}
          style={{
            height: 'calc(100vh - 205px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '10px 0',
          }}
        >
          {recordList.length ? (
            <Timeline>{drawRecordItem(recordList)}</Timeline>
          ) : (
            <div
              style={{
                height: '95%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <div style={{ textAlign: 'center', height: '40px' }}>
                  <NoContent style={{ width: '40px', height: '40px' }} />
                </div>
                <div className={styles['chart-no-content-message']}>
                  {intl.get('hzero.common.message.data.none').d('暂无数据')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Spin>
  );
}
