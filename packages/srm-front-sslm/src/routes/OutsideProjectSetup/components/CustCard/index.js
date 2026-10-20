/*
 * @Description: 外部寻源-FlexLayout
 * @Date: 2025-05-21 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import classNames from 'classnames';
import { omit, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Record } from 'choerodon-ui/dataset';
import React, { useMemo, useEffect, useState, useImperativeHandle } from 'react';
import { DataSet, Table, Row, Button, Spin } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { renderStatus } from '@/routes/components/utils';
import intl from 'srm-front-boot/lib/utils/intl/index.js';

import GeneralForm from '@/routes/components/GeneralForm';
import { supplierQuery, rightQuery, handleCandidate } from '@/services/outsideProjectSetupService';
import Reject from '../Reject';
import Cooperation from '../Cooperation';
import { supItemColumns } from './utils';
import './index.less';

const FlexLayout = (props, ref) => {
  const {
    editor,
    basicDs,
    reqStatus,
    lastReqStatus,
    extSourceReqId,
    activeTab = 'supplier',
  } = props;

  const [loading, setLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState({});
  // 存在【待处理】的供应商
  const [unrespondedFlag, setUnrespondedFlag] = useState(false);
  // 左侧区域数据源
  const [leftTabData, setLeftTabData] = useState([]);
  const { supplierInfo, itemInfo, lineColumns } = useMemo(
    () =>
      supItemColumns({
        activeTab,
        currentTab,
        setLoading,
      }),
    [activeTab, currentTab]
  );

  const formFields = activeTab === 'supplier' ? supplierInfo : itemInfo;

  const formDs = useMemo(
    () =>
      new DataSet({
        fields: formFields,
      }),
    [activeTab]
  );

  const tableDs = useMemo(
    () =>
      new DataSet({
        paging: false,
        selection: false,
        fields: lineColumns,
      }),
    [activeTab]
  );

  useImperativeHandle(ref, () => {
    return {
      unrespondedFlag,
    };
  });

  useEffect(() => {
    if (extSourceReqId) {
      handleTabsQuery();
    }
  }, [activeTab, extSourceReqId]);

  // 查询供应商/物料信息(左侧tab)
  const handleTabsQuery = async () => {
    try {
      setLoading(true);
      const res = await supplierQuery({ extSourceReqId, activeTab });
      if (getResponse(res)) {
        const data = activeTab === 'supplier' ? res || [] : res?.content || [];
        // 如果没有数据则不执行
        if (isEmpty(data)) {
          setCurrentTab({});
          setLeftTabData([]);
          return;
        }
        const _obj = data[0] || {};
        const unresponded = data.some(item => item.processStatus === 'WAIT_PROCESS');
        setUnrespondedFlag(unresponded);
        setLeftTabData(data || []); // 数据
        setCurrentTab({ ..._obj, extSourceReqId }); // 设置标题
        const rightRes = await rightQuery({
          extSourceItemId: _obj.extSourceItemId,
          quotaSupplierId: _obj.quotaSupplierId,
          activeTab,
        });
        if (getResponse(rightRes)) {
          const name = activeTab === 'supplier' ? 'itemQuatoInfos' : 'supplierQuatoInfos';
          const { [name]: lineData = [], ...others } = rightRes || {};
          formDs.loadData([others || {}]);
          tableDs.loadData(lineData);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 点击tab
  const handleTabsClick = async obj => {
    try {
      setRightLoading(true);
      const rightRes = await rightQuery({
        extSourceItemId: obj?.extSourceItemId,
        quotaSupplierId: obj?.quotaSupplierId,
        activeTab,
      });
      if (getResponse(rightRes)) {
        const name = activeTab === 'supplier' ? 'itemQuatoInfos' : 'supplierQuatoInfos';
        const { [name]: lineData = [], ...others } = rightRes || {};
        setCurrentTab({ ...obj, extSourceReqId }); // 设置标题
        formDs.loadData([others || {}]);
        tableDs.loadData(lineData);
      }
    } finally {
      setRightLoading(false);
    }
  };

  const handleCandidateClick = async () => {
    const data = formDs?.current?.toData() || {};
    const res = await handleCandidate(data);
    if (getResponse(res)) {
      notification.success();
      handleTabsQuery();
    }
  };

  const formProps = {
    isEdit: false,
    dataSet: formDs,
    fields: formFields.filter(item => !item.hidden).map(field => omit(field, ['label'])),
  };

  return (
    <Spin spinning={loading}>
      <div className="flex-container">
        {/* 左侧 */}
        <div className="left-sidebar">
          <ul>
            {(leftTabData || []).map(item => (
              <li
                onClick={() => handleTabsClick(item)}
                key={item.quotaSupplierId || item.extSourceItemId}
                className={classNames('supplier-item', {
                  active:
                    (currentTab.quotaSupplierId || currentTab.extSourceItemId) ===
                      item.quotaSupplierId || item.extSourceItemId,
                })}
              >
                {/* 供应商名称 */}
                <div className="supplier-title">
                  {item.supplierCompanyName || item.itemName || null}
                </div>
                {/* 供应商状态 */}
                {activeTab === 'supplier' && (
                  <div className="supplier-status">
                    {renderStatus({
                      value: item.processStatusMeaning,
                      name: 'processStatus',
                      record: new Record(item),
                    })}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* 右侧 */}
        <div className="right-content">
          <Spin spinning={rightLoading}>
            <div className="supplier-right-header">
              {/* 标题 */}
              <h2>{currentTab.supplierCompanyName || currentTab.itemName || null}</h2>
              <div className="supplier-right-btn">
                {editor && activeTab === 'supplier' && (
                  <Row>
                    {currentTab.processStatus === 'WAIT_PROCESS' &&
                      (['RESPONSED', 'EXPIRED'].includes(reqStatus) ||
                        (['EXPIRED'].includes(reqStatus) &&
                          !['RESPONSED'].includes(lastReqStatus))) && (
                          <>
                            <Reject
                              handleTabsQuery={handleTabsQuery}
                              data={formDs.current?.toData() || {}}
                            />
                            <Button
                              funcType="link"
                              icon="check_circle"
                              onClick={handleCandidateClick}
                            >
                              {intl.get('sslm.outsideProjectSetup.modal.houxuan').d('候选')}
                            </Button>
                          </>
                      )}
                    {/* 建立合作 */}
                    {currentTab.processStatus === 'CANDIDATED' &&
                      (['RESPONSED'].includes(reqStatus) ||
                        (['EXPIRED'].includes(reqStatus) &&
                          !['RESPONSED'].includes(lastReqStatus))) && (
                          <Cooperation
                            curFormDs={formDs}
                            basicDs={basicDs}
                            tableDs={tableDs}
                            currentTab={currentTab}
                            handleTabsQuery={handleTabsQuery}
                          />
                      )}
                  </Row>
                )}
              </div>
            </div>
            <GeneralForm {...formProps} />
            <div style={{ marginTop: '20px' }}>
              <Table
                virtual
                virtualCell
                dataSet={tableDs}
                columns={lineColumns.filter(item => !item.hidden)}
              />
            </div>
          </Spin>
        </div>
      </div>
    </Spin>
  );
};

export default observer(FlexLayout, { forwardRef: true });
