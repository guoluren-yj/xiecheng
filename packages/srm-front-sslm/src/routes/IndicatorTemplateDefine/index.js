/*
 * @Date: 2023-10-07 15:28:52
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose, isEmpty, isNil } from 'lodash';
import { Tabs, DataSet, Modal, Spin, Table } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useState, useEffect } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import './index.less';
import {
  queryScoreTemp,
  updateScoreTemp,
  savePlatformIndicator,
} from '@/services/indicatorTemplateDefineService';
import { handleReferenceIndicator } from '@/routes/components/utils/appraisal';

import HeaderBtns from './HeaderBtns';
import IndicatorDefine from './IndicatorDefine';
import TemplateDefine from './TemplateDefine';
import { getTemplateListDs } from './stores/getTemplateListDS';
import { handleManualCreate } from './IndicatorDefine/utils';
import { getIndicatorListDs, getReferenceTemplateDs } from './stores/getIndicatorListDS';

const { TabPane } = Tabs;

const Index = ({
  remote,
  mixObj,
  indicatorListDs,
  templateListDs,
  customizeTable,
  dispatch,
  customizeTabPane,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(mixObj.activeKey);
  const [allRowExpandFlag, setAllRowExpandFlag] = useState(false); // 全部展开标识

  useEffect(() => {
    indicatorListDs.setQueryParameter(
      'customizeUnitCode',
      ['SSLM.INDICATOR_DEFINE.LIST_TABLE', 'SSLM.INDICATOR_DEFINE.LIST_SEARCH_BAR'].join()
    );
    templateListDs.setQueryParameter(
      'customizeUnitCode',
      ['SSLM.TEMPLATE_DEFINE.LIST_TABLE', 'SSLM.TEMPLATE_DEFINE.LIST_SEARCH_BAR'].join()
    );
    remote.event.fireEvent('cuxInit', {
      templateListDs,
      setLoading,
    });
  }, []);

  const handleTabChange = useCallback(key => {
    setActiveKey(key);
    // eslint-disable-next-line no-param-reassign
    mixObj.activeKey = key;
  }, []);

  // 引用平台指标回调
  const handlePlatformIndicator = ({ record, selectedRows, resolve }) => {
    let parentIndicatorId = -1;
    if (record) {
      parentIndicatorId = record.get('indicatorId');
    }
    return savePlatformIndicator({
      parentIndicatorId,
      kpiIndicatorList: selectedRows,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          resolve();
          notification.success();
          indicatorListDs.query();
        }
      })
      .finally(() => {
        resolve(false);
      });
  };

  // 新建指标下拉菜单回调
  const handleOverlayClick = (event, type, record) => {
    const { key } = event;
    switch (key) {
      case 'manualCreate': // 手工新建
        handleManualCreate(indicatorListDs, type, record, null, remote);
        break;
      case 'referenceIndicator': // 引用平台指标
        handleReferenceIndicator({
          record,
          dataSet: indicatorListDs,
          sourceKey: 'PLATFORM',
          onOk: handlePlatformIndicator,
          searchCode: 'SSLM.INDICATOR_DEFINE.PLATFORM_INDICATOR_SEARCH_BAR',
        });
        break;
      default:
        break;
    }
  };

  // c7n表格全部展开-回调
  const expandAllClick = () => {
    if (indicatorListDs) {
      if (allRowExpandFlag) {
        indicatorListDs.forEach(record => {
          if (!isNil(record.data.children)) {
            Object.assign(record, { isExpanded: false });
          }
        });
      } else {
        indicatorListDs.forEach(record => {
          if (!isNil(record.data.children)) {
            Object.assign(record, { isExpanded: true });
          }
        });
      }
    }
    setAllRowExpandFlag(!allRowExpandFlag);
  };

  /**
   * 更新至评分模板
   * verifyParams - 校验参数
   * updateParams - 更新至评分模板参数
   * type - 类型，BATCH_UPDATE 批量编辑,MODAL 编辑弹框里的更新
   * callBack 更新模板回调函数
   */
  const updateToTemplate = useCallback(({ params, type, modal }) => {
    const referenceTemplateDs = new DataSet(getReferenceTemplateDs());
    const columns = [
      {
        name: 'evalTplCode',
      },
      {
        name: 'evalTplName',
      },
    ];
    setLoading(true);
    queryScoreTemp(params, type)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          if (!isEmpty(res)) {
            referenceTemplateDs.loadData(res);
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: (
                <Fragment>
                  <div style={{ fontSize: 14, color: '#4E5769' }}>
                    {intl
                      .get('sslm.indicatorTemplate.model.message.updateTemplateMsg')
                      .d(
                        '当前指标信息将更新至下列已使用该指标的评分模板中，更新后，评分模板状态将变更为“未发布”，需要重新发布。确认更新吗？'
                      )}
                  </div>
                  <Table
                    columns={columns}
                    dataSet={referenceTemplateDs}
                    style={{ maxHeight: 210, marginTop: 16 }}
                  />
                </Fragment>
              ),
              onOk: () => {
                setLoading(true);
                return updateScoreTemp(params, type)
                  .then(updateResponse => {
                    const updateRes = getResponse(updateResponse);
                    if (updateRes) {
                      notification.success();
                      indicatorListDs.query(null, null, false);
                      if (modal) {
                        modal.close();
                      }
                    }
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              },
            });
          } else {
            notification.warning({
              message: intl
                .get('spfm.supplierKpiIndicator.view.message.nonRenewableWarning')
                .d('该字段未被评分模板引用，不可更新'),
            });
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 批量更新至评分模板
  const batchUpdateTemplate = useCallback(() => {
    const selectedRows = indicatorListDs.selected.map(item => item.toData());
    updateToTemplate({ params: selectedRows, type: 'BATCH_UPDATE' });
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sslm.indicatorTemplate.view.title.define').d('指标模板定义')}>
        <HeaderBtns
          loading={loading}
          activeKey={activeKey}
          dispatch={dispatch}
          indicatorListDs={indicatorListDs}
          onOverlayClick={handleOverlayClick}
          batchUpdateTemplate={batchUpdateTemplate}
          expandAllClick={expandAllClick}
          allRowExpandFlag={allRowExpandFlag}
        />
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTabPane(
            {
              code: 'SSLM_INDICATOR_TEMPLATE_DEFINITION.TABS',
              custDefaultActive: key => handleTabChange(key || activeKey),
            },
            <Tabs activeKey={activeKey} onChange={handleTabChange}>
              <TabPane
                key="indicatorDefine"
                tab={intl.get('sslm.indicatorTemplate.view.title.indicatorDefine').d('指标定义')}
              >
                <IndicatorDefine
                  remote={remote}
                  loading={loading}
                  dataSet={indicatorListDs}
                  customizeTable={customizeTable}
                  setLoading={setLoading}
                  onOverlayClick={handleOverlayClick}
                  updateToTemplate={updateToTemplate}
                />
              </TabPane>
              <TabPane
                key="templateDefine"
                tab={intl.get('sslm.indicatorTemplate.view.title.templateDefine').d('模板定义')}
              >
                <TemplateDefine
                  remote={remote}
                  loading={loading}
                  dispatch={dispatch}
                  setLoading={setLoading}
                  dataSet={templateListDs}
                  customizeTable={customizeTable}
                />
              </TabPane>
            </Tabs>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.scoreLevel',
      'sslm.indicatorTemplate',
      'spfm.supplierKpiIndicator',
      'spfm.evaluationTemplate',
      'sslm.supplierKpiIndicator',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.INDICATOR_DEFINE.LIST_TABLE',
      'SSLM.TEMPLATE_DEFINE.LIST_TABLE',
      'SSLM_INDICATOR_TEMPLATE_DEFINITION.TABS',
    ],
  }),
  withProps(
    () => {
      const indicatorListDs = new DataSet(getIndicatorListDs());
      const templateListDs = new DataSet(getTemplateListDs());
      const mixObj = {
        activeKey: 'indicatorDefine',
      };
      return { mixObj, indicatorListDs, templateListDs };
    },
    { cacheState: true }
  ),
  remotes(
    {
      code: 'SSLM_INDICATOR_TEMPLATE_DEFINE_LIST',
    },
    {
      events: {
        cuxManualInit: () => {}, // 新建、编辑指标弹框二开新增页签的查询
        cuxManualModalOk: () => {}, // 新建、编辑指标弹框二开确定按钮逻辑
        cuxInit: () => {}, // 二开增加额外的初始化
      },
    }
  )
)(Index);
