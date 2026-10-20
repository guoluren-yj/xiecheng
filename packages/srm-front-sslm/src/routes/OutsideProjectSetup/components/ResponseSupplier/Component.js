import classNames from 'classnames';
import { isEmpty, omit } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Record } from 'choerodon-ui/dataset';
import React, { useMemo, useEffect, useState } from 'react';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import GeneralForm from '@/routes/components/GeneralForm';
import { renderStatus } from '@/routes/components/utils';
import { supplierQuery, rightQuery } from '@/services/outsideProjectSetupService';
import { supItemColumns } from './utils';
import './index.less';

const ResCmp = props => {
  const { extSourceReqId, customizeForm } = props;

  const [loading, setLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('supplier');
  const [currentTab, setCurrentTab] = useState({});
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
        selection: false,
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
        setLeftTabData(data || []); // 数据
        setCurrentTab({ ..._obj, extSourceReqId }); // 设置标题
        // const { quotaSupplierId } = data[0] || {};
        const rightRes = await rightQuery({
          extSourceItemId: _obj?.extSourceItemId,
          quotaSupplierId: _obj?.quotaSupplierId,
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

  const formProps = {
    isEdit: false,
    customizeForm,
    dataSet: formDs,
    fields: formFields.filter(item => !item.hidden).map(field => omit(field, ['label'])),
  };

  const onBtnClick = key => {
    setActiveTab(key);
  };

  return (
    <Spin spinning={loading}>
      <div className="header">
        <div className="title">
          {intl.get('sslm.outsideProjectSetup.modal.responseSupplier').d('响应供应商')}
        </div>
        <div className="buttons">
          <div className="button-parent">
            <div
              key="supplier"
              onClick={() => onBtnClick('supplier')}
              className={classNames('page-content-btn-supplier', {
                'active-btn': activeTab === 'supplier',
              })}
            >
              {intl.get('sslm.outsideProjectSetup.modal.supplierLatitude').d('供应商维度')}
            </div>
            <div
              key="item"
              onClick={() => onBtnClick('item')}
              className={classNames('page-content-btn-item', {
                'active-btn': activeTab === 'item',
              })}
            >
              {intl.get('sslm.outsideProjectSetup.modal.itemLatitude').d('物料维度')}
            </div>
          </div>
        </div>
      </div>
      <div className="layout-container">
        {/* 左侧tab */}
        <div className="left-panel">
          <ul>
            {(leftTabData || [])?.map(item => (
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
        {/* 右侧内容区域 */}
        <div className="right-panel">
          <Spin spinning={rightLoading}>
            <div className="supplier-right-header">
              {/* 标题 */}
              <h2>{currentTab?.supplierCompanyName || currentTab?.itemName || null}</h2>
            </div>
            <GeneralForm {...formProps} />
            <div style={{ marginTop: '20px' }}>
              <Table
                virtual
                virtualCell
                dataSet={tableDs}
                columns={lineColumns.filter(item => !item.hidden)}
                customizedCode="SSLM_OUTSIEDPROJECTSETUP_DETAIL.SUPPLIER_ITEM_TABLE"
              />
            </div>
          </Spin>
        </div>
      </div>
    </Spin>
  );
};

export default observer(ResCmp);
