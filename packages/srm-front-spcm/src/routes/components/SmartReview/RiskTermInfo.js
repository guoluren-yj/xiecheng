/*
 * @RiskTermInfo: 风险条款信息
 * @Date: 2025-01-21 19:19:44
 * @Author: CDJ
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useCallback, useState, useEffect } from 'react';
import { isEmpty, isFunction, isUndefined } from 'lodash';

import { Button, Modal, Form, DataSet, Tooltip } from 'choerodon-ui/pro';
import { Collapse, Card, Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import classNames from 'classnames';

import FormField from '@/routes/components/GeneralForm/FormField';
import StatusTag from '@/routes/components/StatusTag';
import { ignoreCheckPoint } from '@/services/contractCommonService';

import { ReactComponent as PassedSvg } from '@/assets/icon_pass.svg';
import { ReactComponent as NotPassedSvg } from '@/assets/icon_not_pass.svg';

import { getReviewResultColor } from './utils/utils';
import { getIndexDS } from './stores/indexDS';
import styles from './styles.less';

const { Panel } = Collapse;

const RiskTermInfo = ({
  hiddenIgnoreBtn = false, // 隐藏卡片头额外区域组件
  dataSet,
  pcHeaderId,
  handleSearchKeyWords = () => {},
  setLoading = () => {},
  customizeForm,
  code,
  riskStyleClass,
  defaultActiveKey,
} = {}) => {
  const [activeKey, setActiveKey] = useState([]);

  // 清空已激活的key
  useEffect(() => {
    if (isUndefined(dataSet.getState('clearActiveKeyFlag'))) {
      setActiveKey(defaultActiveKey || []);
    } else {
      setActiveKey([]);
    }
  }, [dataSet.getState('clearActiveKeyFlag'), defaultActiveKey]);

  const handleChangeKey = (key = []) => {
    setActiveKey(key);
  };

  // 风险信息测弹窗
  const handleViewDetailInfo = (params = {}) => {
    const { record, isEdit = false } = params;
    if (isEmpty(record)) {
      return;
    }
    const currentData = record.toData();
    const { reviewName } = currentData || {};
    const modalDs = new DataSet(getIndexDS({ pcHeaderId, isEdit }));
    modalDs.loadData([currentData]);
    Modal.open({
      title: reviewName || '',
      destroyOnClose: true,
      drawer: true,
      children: <ModalFormDom dataSet={modalDs} isEdit={isEdit} />,
      style: {
        width: 720,
      },
      okButton: isEdit,
      onOk: async () => {
        const validateFlag = await modalDs.validate();
        if (validateFlag) {
          const data = modalDs.current?.toData() || currentData;
          const payload = {
            ...data,
            ignoreFlag: data.ignoreFlag ? 0 : 1,
          };
          setLoading(true);
          const res = await ignoreCheckPoint(payload);
          if (getResponse(res)) {
            dataSet.query().finally(() => setLoading(false));
            return true;
          }
          return false;
        } else {
          return false;
        }
      },
    });
  };

  const getModalForm = (params = {}) => {
    const { dataSet, isEdit = false } = params;
    return (
      <Form
        labelLayout={isEdit ? 'float' : 'vertical'}
        dataSet={dataSet}
        columns={1}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      >
        <FormField
          name="reviewResult"
          isEdit={isEdit}
          componentType="SELECT"
          renderer={({ value, record }) =>
            record ? (
              <StatusTag
                color={getReviewResultColor(value)}
                text={record.get('reviewResultMeaning')}
                value={value}
              />
            ) : (
              '-'
            )
          }
        />
        <FormField
          name="riskLevel"
          isEdit={isEdit}
          componentType="SELECT"
          renderer={({ value, record }) =>
            record ? <StatusTag text={record.get('riskLevelMeaning')} value={value} /> : '-'
          }
        />
        <FormField name="riskDescription" isEdit={isEdit} componentType="TEXTAREA" />
        <FormField name="resolution" isEdit={isEdit} componentType="TEXTAREA" />
        <FormField name="errorMessage" isEdit={isEdit} componentType="TEXTAREA" />
        <FormField
          name="ignoreReasonFlag"
          isEdit={isEdit}
          componentType="CHECKBOX"
          renderer={({ value }) => {
            return yesOrNoRender(value);
          }}
        />
        <FormField
          name="ignoreReason"
          isEdit={isEdit}
          componentType="TEXTAREA"
          disabled={!isEdit}
        />
      </Form>
    );
  };

  // 弹窗表单Form
  const ModalFormDom = useCallback((params = {}) => {
    // 兼容处理二开没有个性化单元的情况
    const { dataSet } = params;
    return customizeForm
      ? customizeForm(
          {
            code,
            dataSet,
          },
          getModalForm(params)
        )
      : getModalForm(params);
  }, []);

  // 搜索关键字
  const handleSearchInWps = (locationField) => {
    if (isFunction(handleSearchKeyWords)) {
      if (locationField) {
        handleSearchKeyWords(locationField);
      }
    }
  };

  // 卡片右上角忽略按钮
  const renderCardExtra = (record) => {
    const reviewResult = record.get('reviewResult');
    const hiddenFlag = ['PASSED'].includes(reviewResult);
    return hiddenIgnoreBtn || hiddenFlag ? null : (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleViewDetailInfo({ record, isEdit: true });
        }}
        size="small"
        funcType="link"
        color="primary"
      >
        {intl.get('spcm.common.button.common.ignore').d('忽略')}
      </Button>
    );
  };

  // 标题图标添加
  const renderIcon = (record) => {
    const { reviewResult, ignoreFlag } = record.get(['reviewResult', 'ignoreFlag']);
    const hiddenFlag = ['PASSED'].includes(reviewResult);
    if (hiddenIgnoreBtn) {
      return hiddenFlag ? (
        <PassedSvg className={styles['contract-review-risk-card-icon']} />
      ) : (
        <>
          <NotPassedSvg className={styles['contract-review-risk-card-icon']} />
          {ignoreFlag === 1 && (
            <Tag style={{ border: 'none', marginLeft: 8 }} color="gray">
              {intl.get('spcm.common.model.common.ignoreFlag').d('已忽略')}
            </Tag>
          )}
        </>
      );
    } else {
      return null;
    }
  };

  // 审批表单中, 审查不通过的审查项直接显示忽略原因内容即可，不要点按钮再查看
  // 审查通过的检查项默认不显示忽略原因字段
  const renderIgnoreReason = (record) => {
    const reviewResult = record.get('reviewResult');
    const hiddenFlag = ['PASSED'].includes(reviewResult);
    if (hiddenFlag) {
      return null;
    } else if (hiddenIgnoreBtn) {
      return <FormField name="ignoreReason" />;
    } else {
      return (
        <FormField
          name="ignoreLink"
          renderer={({ record }) => (
            <a
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetailInfo({ record, isEdit: false });
              }}
            >
              {intl.get('spcm.common.model.common.ignoreReason').d('忽略原因')}
            </a>
          )}
        />
      );
    }
  };

  const getRiskTermForm = (term) => {
    const termRecord = new DataSet(getIndexDS({ pcHeaderId }));
    const { resultId } = term || {};
    termRecord.loadData([term]);
    return (
      <Form
        key={resultId}
        className={styles['contract-review-risk-card-form']}
        labelLayout="horizontal"
        dataSet={termRecord}
        labelAlign="left"
        useColon={false}
        columns={1}
        labelWidth={[60]}
      >
        <FormField
          name="reviewResult"
          renderer={({ value, record }) =>
            record ? (
              <StatusTag
                color={getReviewResultColor(value)}
                text={record.get('reviewResultMeaning')}
                value={value}
              />
            ) : (
              '-'
            )
          }
        />
        <FormField
          name="riskLevel"
          renderer={({ value, record }) =>
            record ? <StatusTag text={record.get('riskLevelMeaning')} value={value} /> : '-'
          }
        />
        <FormField name="locationField" />
        <FormField name="riskDescription" />
        <FormField name="resolution" />
        <FormField name="errorMessage" />
        {renderIgnoreReason(termRecord?.current)}
      </Form>
    );
  };

  const renderRiskTerm = (term) => {
    const termRecord = new DataSet(getIndexDS({ pcHeaderId }));
    const { reviewName, locationField, resultId } = term || {};
    termRecord.loadData([term]);
    return (
      <Card
        key={resultId}
        title={
          <div>
            <Tooltip title={reviewName}>{reviewName || '-'}</Tooltip>
            {renderIcon(termRecord?.current)}
          </div>
        }
        className={styles['contract-review-risk-card']}
        type="inner"
        onClick={() => {
          handleSearchInWps(locationField);
        }}
        extra={renderCardExtra(termRecord?.current)}
      >
        {customizeForm
          ? customizeForm(
              {
                code,
              },
              getRiskTermForm(term)
            )
          : getRiskTermForm(term)}
      </Card>
    );
  };

  return (
    <Collapse
      trigger="text-icon"
      expandIconPosition="text-right"
      activeKey={activeKey}
      onChange={handleChangeKey}
      className={classNames(styles['spcm-contract-review-risk-collapse'], riskStyleClass)}
    >
      {dataSet.map((record) => {
        const { riskType, riskTypeMeaning, lineNum = 1, treeList = [] } =
          record.get(['lineNum', 'riskType', 'riskTypeMeaning', 'treeList']) || {};
        // const termInfoDs = new DataSet(getIndexDS({ pcHeaderId }));
        // termInfoDs.loadData(treeList || []);
        const panelTitle = riskTypeMeaning || riskType;
        return (
          <Panel key={lineNum} header={<Tooltip title={panelTitle}>{panelTitle || '-'}</Tooltip>}>
            {treeList.map((term) => renderRiskTerm(term))}
          </Panel>
        );
      })}
    </Collapse>
  );
};

export default RiskTermInfo;
