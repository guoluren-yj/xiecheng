/*
 * ContractReviewConfig - 合同审查配置
 * @date: 2025/03/06 15:12:06
 * @author: CDJ
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { routerRedux } from 'dva/router';
import { DataSet, Modal, Tabs, Spin } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { getResponse } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { createReviewPoint, updateReviewPoint } from '@/services/contractReviewConfigService';

import ListTable from './components/ListTable';
import { getTabPane, getReviewPointModalTitle, getListUnitCodes } from './utils';
import { getPointDs, getTemplateDs, getPointDetailDs } from './stores/indexDS';
import ReviewPointForm from './components/ReviewPointForm';

const Index = ({
  pointDs,
  templateDs,
  dispatch,
  customizeForm,
  customizeTable,
  customizeTabPane,
  customizeBtnGroup,
  mixObj = {},
}) => {
  const [activeKey, setActiveKey] = useState(mixObj.currentKey || 'pointDefinition');
  const [loading, setLoading] = useState(false);

  // tab改变时的查询
  useEffect(() => {
    handleQuery();
  }, [activeKey]);

  // tab改变时的回调
  const handleTabChange = useCallback(
    (key) => {
      setActiveKey(key);
      // eslint-disable-next-line no-param-reassign
      mixObj.currentKey = key;
    },
    [activeKey]
  );

  // 审查点定义弹窗
  const openPointDefinitionModal = ({ type = 'create', record, predefinedFlag = false }) => {
    const currentData = (record && record.toData()) || {};
    const { reviewPointId, copyPointId } = currentData;
    const pointId = predefinedFlag ? copyPointId : reviewPointId;
    const pointModalDs = new DataSet(getPointDetailDs({ reviewPointId: pointId }));
    const isEdit = type !== 'view';
    if (type === 'create') {
      pointModalDs.create({});
    } else if (type === 'edit') {
      pointModalDs.loadData([
        {
          ...currentData,
        },
      ]);
    } else {
      pointModalDs.query();
    }
    Modal.open({
      title: getReviewPointModalTitle(),
      drawer: true,
      destroyOnClose: true,
      children: (
        <ReviewPointForm
          dataSet={pointModalDs}
          isEdit={isEdit}
          customizeForm={customizeForm}
          formCode={getListUnitCodes.pointModal}
        />
      ),
      style: {
        width: 380,
      },
      okButton: isEdit,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      onOk: async () => {
        const validateFlag = await pointModalDs.validate();
        if (validateFlag) {
          const saveReviewPoint = type === 'create' ? createReviewPoint : updateReviewPoint;
          const data = pointModalDs.current?.toJSONData() || {};
          const payload = {
            data,
            customizeUnitCode: getListUnitCodes.pointModal,
          };
          setLoading(true);
          const res = await saveReviewPoint(payload);
          setLoading(false);
          if (getResponse(res)) {
            pointDs.query();
            return true;
          }
          return false;
        } else {
          return false;
        }
      },
    });
  };

  /**
   * 处理新建
   */
  const handleCreate = useCallback(() => {
    if (activeKey === 'pointDefinition') {
      openPointDefinitionModal({ type: 'create' });
    } else if (activeKey === 'templateDefinition') {
      dispatch(
        routerRedux.push({
          pathname: '/spcm/contract-review-config/template/create',
        })
      );
    }
  }, [activeKey]);

  // 查询
  const handleQuery = useCallback(() => {
    switch (activeKey) {
      case 'pointDefinition':
        if (pointDs?.getState('queryStatus') === 'ready') {
          pointDs.query(pointDs.currentPage);
        }
        break;
      case 'templateDefinition':
        if (templateDs?.getState('queryStatus') === 'ready') {
          templateDs.query(templateDs.currentPage);
        }
        break;
      default:
        break;
    }
  }, [activeKey]);

  // 按钮集合
  const OperationButtons = observer(() => {
    const buttons = [
      {
        name: 'add',
        btnProps: {
          icon: 'add',
          color: 'primary',
          onClick: handleCreate,
          wait: 500,
          waitType: 'throttle',
        },
        child: intl.get(`hzero.common.button.create`).d('新建'),
      },
    ];
    return customizeBtnGroup(
      {
        code: '',
        pro: true,
      },
      <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
    );
  });

  const tabPaneList = useMemo(() => getTabPane(), []);
  const dataObj = {
    pointDefinition: pointDs,
    templateDefinition: templateDs,
  };

  return (
    <React.Fragment>
      <Header title={intl.get('spcm.contractReview.view.title.contractReview').d('合同审查配置')}>
        <React.Fragment>
          <OperationButtons />
        </React.Fragment>
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTabPane(
            {
              code: 'SPCM_CONTRACT_REVIEW_CONFIG_LIST.TABS',
              custDefaultActive: (key) => {
                const currentKey = key || activeKey;
                // 获取个性化配置的默认激活key，没配置的值为undefined
                handleTabChange(currentKey);
              },
            },
            <Tabs activeKey={activeKey} onChange={handleTabChange}>
              {tabPaneList.map((pane) => (
                <Tabs.TabPane tab={pane.tab} key={pane.key}>
                  <ListTable
                    dispatch={dispatch}
                    activeKey={activeKey}
                    dataSet={dataObj[pane.key]}
                    searchCode={pane.searchCode}
                    customizeTable={customizeTable}
                    customizeCode={pane.customizeCode}
                    openPointDefinitionModal={openPointDefinitionModal}
                  />
                </Tabs.TabPane>
              ))}
            </Tabs>
          )}
        </Spin>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common', 'spcm.contractReview'],
  }),
  WithCustomize({
    unitCode: [
      'SPCM_CONTRACT_REVIEW_CONFIG_LIST.POINT_TABLE',
      'SPCM_CONTRACT_REVIEW_CONFIG_LIST.POINT_MODAL',
      'SPCM_CONTRACT_REVIEW_CONFIG_LIST.TEMPLATE_TABLE',
      'SPCM_CONTRACT_REVIEW_CONFIG_LIST.TABS',
    ],
  }),
  withProps(
    () => {
      const pointDs = new DataSet(getPointDs());
      const templateDs = new DataSet(getTemplateDs());
      const mixObj = {
        currentKey: 'pointDefinition',
      };
      return {
        pointDs,
        templateDs,
        mixObj,
      };
    },
    { cacheState: true }
  )
)(Index);
