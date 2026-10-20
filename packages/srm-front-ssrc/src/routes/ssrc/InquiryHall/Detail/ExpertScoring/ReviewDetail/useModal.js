import React from 'react';
import { Modal, DataSet, Table, Output, Tooltip } from 'choerodon-ui/pro';
import CollapseForm from '_components/CollapseForm';
import { Record } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { noop } from 'lodash';

import { INQUIRY } from '@/utils/globalVariable';
import { scoreDetailDS, scoringInfoDS } from './store/storeDS';
import styles from './index.less';

const useModal = () => {
  const openModal = (props = {}, modalProps = {}) => {
    const {
      sourceKey = INQUIRY,
      sourceHeaderId,
      sourceFrom,
      useCustomize = true,
      customizeCollapseForm = noop,
      customizeTable = noop,
      // headerData = {}, // 头相关数据
      recordData, // 行相关数据
      fieldData = {}, // 列相关数据,
      formUnitCode,
      tableUnitCode,
      organizationId,
    } = props || {};

    const { evaluateScoreId, expertName } = fieldData || {};
    const { supplierCompanyName, supplierCompanyId, quotationHeaderId } =
      recordData instanceof Record
        ? recordData.get(['supplierCompanyName', 'supplierCompanyId', 'quotationHeaderId'])
        : recordData;

    const {
      title = `${intl
        .get(`ssrc.common.view.title.expertToSupplierReviewDetail`, {
          expertName,
          supplierCompanyName,
        })
        .d('{expertName}专家对{supplierCompanyName}的符合性检查明细')}`,
    } = modalProps || {};

    const scoreDetailDs = new DataSet(scoreDetailDS());

    const scoringInfoDs = new DataSet(scoringInfoDS());

    scoringInfoDs.setQueryParameter('commonProps', {
      sourceKey,
      evaluateScoreId,
      supplierCompanyId,
      sourceFrom,
      quotationHeaderId,
      customizeUnitCode: formUnitCode,
      organizationId,
      sourceHeaderId,
    });

    scoreDetailDs.setQueryParameter('commonProps', {
      sourceKey,
      evaluateScoreId,
      supplierCompanyId,
      sourceFrom,
      quotationHeaderId,
      customizeUnitCode: tableUnitCode,
      organizationId,
      sourceHeaderId,
    });

    scoringInfoDs.query();
    scoreDetailDs.query();

    const renderHeader = () => {
      return <Tooltip title={title}>{title}</Tooltip>;
    };
    const getColumns = () => {
      const columns = [
        {
          name: 'indicateName',
          renderer: ({ record }) => {
            const { indicateName, evaluateIndicId } = record.get([
              'indicateName',
              'evaluateIndicId',
            ]);

            return (
              <span style={{ fontWeight: !evaluateIndicId ? 'bold' : '' }}>{indicateName}</span>
            );
          },
        },
        {
          name: 'passStatus',
          width: 120,
          renderer: ({ record }) => {
            const {
              passStatus,
              passStatusMeaning,
              sumPassStatusMeaning,
              sumPassStatus,
            } = record.get([
              'passStatus',
              'passStatusMeaning',
              'sumPassStatusMeaning',
              'sumPassStatus',
            ]);

            if (!passStatus && !sumPassStatus) {
              return;
            }

            return (
              <span
                style={{
                  color:
                    passStatus === 'APPROVED' || sumPassStatus === 'ALL_PASS' ? 'green' : 'red',
                }}
              >
                {passStatusMeaning || sumPassStatusMeaning || '-'}
              </span>
            );
          },
        },
      ];
      return columns;
    };

    const getBaseForm = () => {
      return (
        <CollapseForm
          dataSet={scoringInfoDs}
          columns={3}
          showLines={6}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output
            name="reviewExpertSuggestion"
            renderer={({ value }) => (
              <Tooltip title={value}>
                <div className={styles['expert-suggestion']}>{value || '-'}</div>
              </Tooltip>
            )}
          />
        </CollapseForm>
      );
    };

    const modal = Modal.open({
      title: renderHeader(),
      drawer: true,
      style: {
        width: 742,
      },
      children: (
        <React.Fragment>
          <h3 className={styles['card-sub-title']} style={{ marginTop: '0' }}>
            <div className={styles['card-sub-title-line']} />
            {intl.get(`ssrc.expertScoring.view.title.basicInfo`).d('基本信息')}
          </h3>
          <div className={styles['scoring-attachment']}>
            {useCustomize
              ? customizeCollapseForm(
                  {
                    code: formUnitCode,
                    dataSet: scoringInfoDs,
                  },
                  getBaseForm()
                )
              : getBaseForm()}
          </div>
          <h3 className={styles['card-sub-title']}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.inquiryHall.reviewDetails').d('审查明细')}
          </h3>
          {customizeTable(
            {
              code: tableUnitCode,
            },
            <Table
              dataSet={scoreDetailDs}
              style={{ maxHeight: '70vh' }}
              customizedCode={tableUnitCode}
              columns={getColumns()}
            />
          )}
        </React.Fragment>
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
      afterClose: () => scoreDetailDs.loadData(),
      ...modalProps,
    });
    return modal;
  };
  return {
    openModal,
  };
};

export default useModal;
