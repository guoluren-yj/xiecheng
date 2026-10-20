/*
 * @Date: 2023-11-01 10:52:26
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { routerRedux } from 'dva/router';
import React, { Fragment, useEffect, useState, useMemo } from 'react';
import { compose, isEmpty } from 'lodash';
import { useDataSet, Spin, Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remote from 'utils/remote';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getUserOrganizationId } from 'utils/utils';

import {
  saveScoreDetail,
  confirmScoreDetail,
  submitComplaint,
} from '@/services/appraisalSupplierService';
import Basic from '../components/Basic';
import Attachment from '../components/Attachment';
import ScoreResult from '../components/ScoreResult';
import HeaderBtns from './HeaderBtns';
import { getBasicDs } from '../stores/getBasicDS';
import { getResultListDs } from '../stores/getScoreResultDS';
import styles from '../styles.less';

const supplierTenantId = getUserOrganizationId();
const customizeUnitCode = [
  'SSLM.APPRAISAL_SUPPLIER_DETAIL.BASIC',
  'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_TABLE',
];

const Index = ({
  dispatch,
  custLoading,
  customizeForm,
  customizeTable,
  queryUnitConfig,
  appraisalSupplierDetailRemote,
  match: {
    params: { evalHeaderId, evalGranularity },
  },
}) => {
  const [loading, setLoading] = useState(false);

  const basicDs = useDataSet(() => getBasicDs({ evalHeaderId, evalGranularity }), [
    evalHeaderId,
    evalGranularity,
  ]);
  const resultListDsProps = useMemo(() => getResultListDs({ evalHeaderId, evalGranularity }), [
    evalHeaderId,
    evalGranularity,
  ]);
  const finalResultListDsProps = appraisalSupplierDetailRemote.process(
    'SSLM_APPRAISAL_SUPPLIER_DETAIL_RESULT_LIST_DS',
    resultListDsProps
  );
  const resultListDs = useDataSet(() => finalResultListDsProps, [resultListDsProps]);

  resultListDs.bind(basicDs, 'resultList');

  // 刷新数据
  const handleRefresh = () => {
    return basicDs.query();
  };

  useEffect(() => {
    setLoading(true);
    basicDs.setQueryParameter('customizeUnitCode', 'SSLM.APPRAISAL_SUPPLIER_DETAIL.BASIC');
    basicDs
      .query()
      .then(response => {
        if (response) {
          queryUnitConfig({
            customizeTenantId: response.tenantId,
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [evalHeaderId]);

  // 获取需保存的数据
  const getSaveParams = async () => {
    const validateFlag = await basicDs.validate();
    let saveParams = {};
    if (validateFlag) {
      const data = basicDs.current?.toJSONData() || {};
      const { resultList, kpiEvalDetailLineDTOList, kpiEvalDetailLineDTOPage, ...rest } = data;
      saveParams = {
        ...rest,
        supplierTenantId,
        kpiEvalDetailLineDTOList: resultList,
        customizeUnitCode: customizeUnitCode.join(),
      };
    } else {
      notification.warning({
        message: intl.get('sslm.common.view.message.requiredMsg').d('请检查是否有必填项未填写！'),
      });
    }
    return saveParams;
  };

  // 保存
  const handleSave = async () => {
    const saveParams = await getSaveParams();
    if (!isEmpty(saveParams)) {
      setLoading(true);
      return saveScoreDetail(saveParams)
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            await handleRefresh();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 确认
  const handleConfirm = async () => {
    const saveParams = await getSaveParams();
    if (!isEmpty(saveParams)) {
      setLoading(true);
      return confirmScoreDetail(saveParams)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: '/sslm/appraisal-supplier/list',
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 申诉
  const handleComplaint = () => {
    const complaintDs = new DataSet(
      getResultListDs({ evalHeaderId, evalGranularity, paging: false })
    );
    const selectedRows = resultListDs.selected.map(record => record.toData());
    complaintDs.loadData(selectedRows);
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      title: intl.get('sslm.supplierDocManage.view.title.initiateComplaint').d('发起申诉'),
      children: (
        <ScoreResult
          basicDs={basicDs}
          dispatch={dispatch}
          sourceKey="COMPLAINT"
          resultListDs={complaintDs}
          customizeTable={customizeTable}
        />
      ),
      onOk: () => {
        return new Promise(async resolve => {
          const validateFlag = await complaintDs.validate();
          if (validateFlag) {
            const newList = complaintDs.toData();
            setLoading(true);
            submitComplaint({
              newList,
              customizeUnitCode: 'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_TABLE',
            })
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  resolve();
                  handleRefresh();
                }
              })
              .finally(() => {
                resolve(false);
                setLoading(false);
              });
          } else {
            resolve(false);
          }
        });
      },
    });
  };

  return (
    <Fragment>
      <Header
        backPath="/sslm/appraisal-supplier/list"
        title={intl.get('sslm.appraisalSupplier.view.title.viewAppraisal').d('查看绩效考评')}
      >
        <HeaderBtns
          basicDs={basicDs}
          loading={loading}
          onSave={handleSave}
          onConfirm={handleConfirm}
          evalHeaderId={evalHeaderId}
          customizeUnitCode={customizeUnitCode}
          remote={appraisalSupplierDetailRemote}
        />
      </Header>
      <Content wrapperClassName={styles['detail-wrap']}>
        <Spin spinning={loading}>
          <div className={styles['card-wrap']}>
            <div className={styles['card-title']}>
              {intl.get('sslm.common.view.title.baseInfo').d('基础信息')}
            </div>
            <Basic dataSet={basicDs} custLoading={custLoading} customizeForm={customizeForm} />
          </div>
          <div className={styles['card-wrap']}>
            <div className={styles['card-title']}>
              {intl.get('sslm.common.view.title.scoreResult').d('评分结果')}
            </div>
            <ScoreResult
              basicDs={basicDs}
              dispatch={dispatch}
              resultListDs={resultListDs}
              custLoading={custLoading}
              customizeTable={customizeTable}
              onComplaint={handleComplaint}
              remote={appraisalSupplierDetailRemote}
            />
          </div>
          <div className={styles['card-wrap']}>
            <div className={styles['card-title']}>
              {intl.get('hzero.common.upload.modal.title').d('附件')}
            </div>
            <Attachment dataSet={basicDs} />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.evaluationQuery',
      'sslm.appraisalSupplier',
      'sslm.supplierDocManage',
      'sslm.receivedEvaluationResult',
    ],
  }),
  withCustomize({
    manualQuery: true,
    unitCode: [
      'SSLM.APPRAISAL_SUPPLIER_DETAIL.BASIC',
      'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_TABLE',
      'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_DETAIL',
    ],
  }),
  remote({
    code: 'SSLM_APPRAISAL_SUPPLIER_DETAIL',
    name: 'appraisalSupplierDetailRemote',
  })
)(Index);
