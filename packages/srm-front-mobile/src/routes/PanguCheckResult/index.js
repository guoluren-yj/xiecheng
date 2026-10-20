import React, { useEffect, useMemo, useState } from 'react';

import { connect } from 'dva';
// import classnames from 'classnames';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Table, DataSet, Button, Icon, Dropdown, Tooltip } from 'choerodon-ui/pro';
import { Menu } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';

// import { getLocationParam } from '@/utils/utils';
import { fetchCheckResult, submitAiCheckFeedback } from '@/services/pubCheckRuleService';

import checkLogo from '../../assets/check_res.svg';
import { ResultListDS } from './stores/checkResultDS';

import styles from './index.less';

const SortDownIcon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+aWNvbi1hc2NlbmRpbmc8L3RpdGxlPgogICAgPGcgaWQ9Iue7hOS7tiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlNlYXJjaC9Db21wb25lbnRzL1NvcnQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC05Ny4wMDAwMDAsIC04LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iaWNvbi1hc2NlbmRpbmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDk3LjAwMDAwMCwgOC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHg9IjAiIHk9IjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC0yMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4yNTAwMDAsIDQuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNyw2LjY2NjY2NjY3IEw3LDggTDAsOCBMMCw2LjY2NjY2NjY3IEw3LDYuNjY2NjY2NjcgWiBNNS42LDQgTDUuNiw1LjMzMzMzMzMzIEwwLDUuMzMzMzMzMzMgTDAsNCBMNS42LDQgWiBNNC4yLDEuMzMzMzMzMzMgTDQuMiwyLjY2NjY2NjY3IEwwLDIuNjY2NjY2NjcgTDAsMS4zMzMzMzMzMyBMNC4yLDEuMzMzMzMzMzMgWiIgaWQ9IuW9oueKtue7k+WQiCIgZmlsbC1vcGFjaXR5PSIwLjg1IiBmaWxsPSIjMDAwMDAwIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IuW9oueKtue7k+WQiC1wYXRoIiBmaWxsPSIjMzZDMkNGIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMC4wMDAwMDAsIDQuMDAwMDAwKSBzY2FsZSgxLCAtMSkgdHJhbnNsYXRlKC0xMC4wMDAwMDAsIC00LjAwMDAwMCkgIiBwb2ludHM9IjEwIDAgMTMuNSA0IDEwLjcgNCAxMC43IDggOS4zIDggOS4zIDQgNi41IDQiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';

const SortUpIcon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+aWNvbi1hc2NlbmRpbmc8L3RpdGxlPgogICAgPGcgaWQ9Iue7hOS7tiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlNlYXJjaC9Db21wb25lbnRzL1NvcnQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC05Ny4wMDAwMDAsIC04LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iaWNvbi1hc2NlbmRpbmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDk3LjAwMDAwMCwgOC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHg9IjAiIHk9IjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC0yMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4yNTAwMDAsIDQuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNyw2LjY2NjY2NjY3IEw3LDggTDAsOCBMMCw2LjY2NjY2NjY3IEw3LDYuNjY2NjY2NjcgWiBNNS42LDQgTDUuNiw1LjMzMzMzMzMzIEwwLDUuMzMzMzMzMzMgTDAsNCBMNS42LDQgWiBNNC4yLDEuMzMzMzMzMzMgTDQuMiwyLjY2NjY2NjY3IEwwLDIuNjY2NjY2NjcgTDAsMS4zMzMzMzMzMyBMNC4yLDEuMzMzMzMzMzMgWiIgaWQ9IuW9oueKtue7k+WQiCIgZmlsbC1vcGFjaXR5PSIwLjg1IiBmaWxsPSIjMDAwMDAwIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IuW9oueKtue7k+WQiC1wYXRoIiBmaWxsPSIjMzZDMkNGIiBwb2ludHM9IjEwIDAgMTMuNSA0IDEwLjcgNCAxMC43IDggOS4zIDggOS4zIDQgNi41IDQiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';

let showAll = false;

function PanguCheckResult({ bindObjList = [] }) {
  const resultListDS = useMemo(() => new DataSet(ResultListDS()), []);
  const [checkResult, setCheckResult] = useState({});
  const [sortField, setSortField] = useState({
    name: 'ruleName',
    label: intl.get('smbl.checkRules.view.label.ruleName').d('规则名称'),
  });
  const [sortFlag, setSortFlag] = useState('DESC');
  const [hasReject, setHasReject] = useState(true);

  // eslint-disable-next-line no-console
  console.info('check result params', JSON.stringify(bindObjList));

  useEffect(() => {
    return () => {
      showAll = false;
    };
  }, []);

  useEffect(() => {
    if (bindObjList && bindObjList.length) {
      getcheckResultList('ruleName,DESC');
    }
  }, []);

  const getcheckResultList = async (field = '') => {
    const list = [...bindObjList];
    if (!(list && list.length)) return;

    const res = await fetchCheckResult({
      queryList: [...list],
      sort: field || '',
      page: -1,
      size: 10,
    });

    if (getResponse(res)) {
      if (res?.records && res?.records?.length > 0) {
        const rejectList =
          res?.records?.filter(
            (item) => item.approveStatus === 'REJECTED' || item.approveStatus === 'FAIL'
          ) || [];
        setHasReject(rejectList.length > 0);

        if (showAll) {
          resultListDS.loadData(res?.records || []);
        } else {
          resultListDS.loadData(rejectList.length ? rejectList : res?.records || []);
        }
      }
      setCheckResult(res ? { ...res } : {});
    }
  };

  const finalResultMap = {
    EXECUTING: styles.alert, // 执行中
    FAIL: styles.rejected, // 审核失败
    APPROVED: styles.passed, // 审核通过
    REJECTED: styles.rejected, // 审核拒绝
    APPROVED_SUGGEST: styles.alert2, // 审核通过(有建议)
  };

  // const finalResultMsg = {
  //   EXECUTING: intl.get('smbl.checkRules.view.title.executing').d('执行中'), // 执行中
  //   FAIL: intl.get('smbl.checkRules.view.title.fail').d('审核失败'), // 审核失败
  //   APPROVED: intl.get('smbl.checkRules.view.title.approved').d('审核通过'), // 审核通过
  //   REJECTED: intl.get('smbl.checkRules.view.title.rejected').d('审核拒绝'), // 审核拒绝
  //   APPROVED_SUGGEST: intl
  //     .get('smbl.checkRules.view.message.approvedSuggest')
  //     .d('审核通过(有建议)'),
  // };

  const valueStyle = {
    control: styles.rejected, // 强控
    noticeOnly: styles.check, // 提醒
  };

  const columns = () => [
    {
      name: 'approveStatus',
      width: 80,
      renderer: ({ value, text }) => {
        return <span className={finalResultMap[value]}>{text}</span>;
      },
    },
    {
      name: 'displayName',
      width: 100,
    },
    {
      name: 'ruleName',
      width: 130,
    },

    {
      name: 'ruleControlStrategy',
      width: 80,
      renderer: ({ value, text }) => {
        return <span className={valueStyle[value]}>{text}</span>;
      },
    },
    {
      name: 'ruleDetail',
      width: 200,
    },
    {
      name: 'executeResult',
    },
    {
      name: 'feedback',
      width: 160,
      renderer: ({ record }) => {
        const isDisliked = record?.get('feedbackType') === 'DISLIKE';

        return (
          <div className={styles['feedback-cell']}>
            <span
              className={`${styles['feedback-btn']} ${isDisliked ? styles['feedback-disliked'] : ''
                }`}
              onClick={() => handleFeedback(record)}
            >
              <Icon type='thumb_down-o' />
              {intl.get('smbl.checkRules.view.message.feedbackDisliked').d('点踩')}
            </span>
          </div>
        );
      },
    },
    // {
    //   name: 'modifySuggestions',
    // },
  ];

  const fields = [
    {
      name: 'ruleName',
      label: intl.get('smbl.checkRules.view.label.ruleName').d('规则名称'),
    },
    {
      label: intl.get(`smbl.checkRules.model.checkScope`).d('审核范围'),
      name: 'bindObjName',
    },
  ];

  const handleSelectSortField = ({ key }) => {
    const field = fields.find((item) => item.name === key);
    setSortField(field);
    getcheckResultList(`${key},${sortFlag}`);
  };

  const handleToogleSortFlag = () => {
    const sortType = sortFlag === 'DESC' ? 'ASC' : 'DESC';
    setSortFlag(sortType);
    getcheckResultList(`${sortField.name},${sortType}`);
  };

  const overlayMenu = () => {
    return (
      <Menu
        onClick={handleSelectSortField}
        className={styles['check-result-sort-menu']}
        defaultSelectedKeys={[sortField.name]}
      >
        {fields.map((item) => (
          <Menu.Item key={item.name} className={styles['check-result-sort-menu-item']}>
            {intl.get('sdat.commonFilter.view.label.orderBy').d('按')}
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const handleShowAllItems = () => {
    showAll = !showAll;
    getcheckResultList(`${sortField.name},${sortFlag}`);
  };

  const handleFeedback = async (record) => {
    const { recordId, feedbackType } = record.get(['recordId', 'feedbackType']);
    const newFeedbackType = feedbackType === 'DISLIKE' ? 'LIKE' : 'DISLIKE';
    const res = await submitAiCheckFeedback({
      recordId,
      feedbackType: newFeedbackType,
    });
    if (getResponse(res)) {
      record.set('feedbackType', newFeedbackType);
    }
  };

  const statusMap = {
    APPROVED: styles['status-count-approved'],
    REJECTED: styles['status-count-rejected'],
    APPROVED_SUGGEST: styles['status-count-approved-suggest'],
  };

  const statusLabelMap = {
    APPROVED: intl.get('smbl.checkRules.view.message.approved').d('通过'),
    REJECTED: intl.get('smbl.checkRules.view.message.rejected').d('不通过'),
    APPROVED_SUGGEST: intl
      .get('smbl.checkRules.view.message.approvedSuggest')
      .d('审核通过(有建议)'),
  };

  return (
    <div className={styles['pangu-check-result-basic']}>
      <div className={styles['ai-alert-msg']}>
        {intl
          .get('smbl.checkRules.view.message.aiAlertMsg')
          .d('内容由 AI 生成，仅供参考，您据此所作判断及操作均由您自行承担责任')}
      </div>

      <div className={styles['result-summary-card']}>
        <div className={styles['summary-title']}>
          <img src={checkLogo} alt="" style={{ width: '18px', height: '18px' }} />
          <span style={{ marginLeft: '8px' }}>
            {intl
              .get('smbl.checkRules.view.message.summaryTitle')
              .d('您好，我是您的智能预审助手，现将审核的核心内容梳理如下：')}
          </span>
        </div>

        <div style={{ margin: '12px 0', height: '1px', backgroundColor: '#E5E7EC' }} />

        <div className={styles['status-stats']}>
          <div className={styles['status-item']}>
            <div>
              <span className={statusMap[checkResult?.approveResult]}>
                {checkResult?.approveResult ? statusLabelMap[checkResult?.approveResult] : '-'}
              </span>
            </div>
            <div className={styles['status-text']}>
              {intl.get('smbl.checkRules.view.message.aiCheckResult').d('AI审核结果')}
            </div>
          </div>
          <div className={styles['status-item']}>
            <div>
              <span className={styles['status-count-approved']}>
                {checkResult?.approveCount ?? 0}
              </span>
              <span className={styles['status-text']} style={{ marginLeft: '4px' }}>
                {intl.get('smbl.checkRules.view.message.passedCount').d('笔')}
              </span>
            </div>
            <div className={styles['status-text']}>
              {intl.get('smbl.checkRules.view.message.statusApproved').d('审核通过')}
            </div>
          </div>
          <div className={styles['status-item']}>
            <div>
              <span className={styles['status-count-rejected']}>
                {checkResult?.rejectCount ?? 0}
              </span>
              <span className={styles['status-text']} style={{ marginLeft: '4px' }}>
                {intl.get('smbl.checkRules.view.message.passedCount').d('笔')}
              </span>
            </div>
            <div className={styles['status-text']}>
              {intl.get('smbl.checkRules.view.message.statusRejected').d('审核不通过')}
            </div>
          </div>
        </div>

        {/* <div className={styles['risk-description']}>
          {intl.get('smbl.checkRules.view.message.riskDescription').d('风险说明')}: &nbsp;
          {checkResult?.riskDescription || '-'}
        </div> */}
      </div>

      <div className={styles['audit-details']}>
        <div className={styles['audit-header']}>
          <div style={{ display: 'flex', alignItems: 'center' }} />
          <div className={styles['finished-time']}>
            {intl.get('smbl.checkRules.view.message.finishedTime').d('审查完成时间')}: &nbsp;
            {checkResult?.approveTime || '-'}
          </div>
        </div>
        <div className={styles['audit-content']}>
          <div
            style={{
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {hasReject ? (
              <Button
                color="primary"
                icon="visibility-o"
                funcType="flat"
                onClick={handleShowAllItems}
              >
                {showAll
                  ? intl.get('smbl.checkRules.view.message.showRejectItems').d('显示审核拒绝项目')
                  : intl.get('smbl.checkRules.view.message.showAllItems').d('显示全部审核项目')}
              </Button>
            ) : (
              <div style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '600' }}>
                {intl.get('smbl.checkRules.view.message.allCheckItems').d('审核项目')}
              </div>
            )}

            <span className={styles['check-result-sort']}>
              <Dropdown overlay={overlayMenu} trigger={['click']}>
                <span className={styles['check-result-sort-control']}>
                  {sortField.label
                    ? `${intl.get('sdat.commonFilter.view.label.orderBy').d('按')}${
                        sortField.label
                      }`
                    : ''}
                  <Icon type="expand_more" />
                </span>
              </Dropdown>
              <Tooltip
                title={
                  sortFlag === 'ASC'
                    ? intl.get('srm.filterBar.view.tooltip.asc').d('升序')
                    : intl.get('srm.filterBar.view.tooltip.desc').d('降序')
                }
              >
                <img
                  alt="orderBy"
                  src={sortFlag === 'ASC' ? SortUpIcon : SortDownIcon}
                  onClick={handleToogleSortFlag}
                  style={{ cursor: 'pointer' }}
                />
              </Tooltip>
            </span>
          </div>
          <div style={{ height: 'calc(100vh - 480px)' }}>
            <Table
              dataSet={resultListDS}
              columns={columns()}
              autoHeight={{ type: 'maxHeight', diff: 40 }}
              customizable
              customizedCode="SMBL.PANGU_AI_CHECK_RESULT_LIST"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect((state) => state)(
  formatterCollections({
    code: ['smbl.checkRules', 'sdat.commonFilter', 'srm.filterBar'],
  })(PanguCheckResult)
);
