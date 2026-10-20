/**
 * 规则配置详情 - 查看(只读)页面(平台级)
 * @date: 2021-12-28
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useEffect, useState, Fragment } from 'react';
import { DataSet, Spin, Modal, Button } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import qs from 'querystring';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchOutPlatformList } from '@/services/ruleManagesOrgService';
import {
  getBasicParamDs,
  getIndexMessageDs,
  getIndexDimensionDs,
  getActionConfigTableDs,
  getOutDimensionDs,
} from '../store/ruleManagesDetailDs';
import BasicParamTable from './components/BasicParamTable';
import IndexMessageTable from './components/IndexMessageTable';
import IndexDimensionTable from './components/IndexDimensionTable';
import ActionConfigTable from './components/ActionConfigTable';
import OutParamsTable from './components/OutParamsTable';

const { TabPane } = Tabs;
const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀
const dimensionCheckModalKey = Modal.key();
const transparentDimensionCheckModalKey = Modal.key();

let recordIndex = 0;

function DetailOnlyRead(props = {}) {
  const { tenantId, ruleManagementHeaderId, activeKey: backKey } = qs.parse(
    props.location.search.substr(1)
  ); // 截取url上面传递参数
  const [spinning, handleSpinning] = useState(false); // tab页加载事件
  const [type, handleType] = useState(undefined); // 规则类型字段，区别规则是标准（0）或透传（1），字符串类型
  const {
    basicParamDs,
    indexMessageDs,
    indexDimensionDs,
    actionConfigTableDs,
    outDimensionDs,
  } = props.valueDs;

  useEffect(() => {
    return () => {
      recordIndex = 0;
    };
  }, []);

  /**
   * 副作用——查询,当点击了编辑（metaDefinitionId存在）时查询一遍数据
   */
  useEffect(() => {
    if (ruleManagementHeaderId) {
      handleSpinning(true);
      // 若规则编码存在，说明是编辑
      // indexMessageDs的ruleManagementHeaderId为查询参数，因为删除的过程会自动查询参数，因此不能用query传参
      indexMessageDs.setState('ruleManagementHeaderId', ruleManagementHeaderId);
      Promise.all([
        basicParamDs.query(1, { ruleManagementHeaderId }).then((res) => {
          if (tenantId !== '0' && basicParamDs.current.get('type') === '0') {
            // actionConfigTableDs的查询需要参数
            actionConfigTableDs.setState('currentTenantId', tenantId);
            actionConfigTableDs.setState('code', res.code);
            actionConfigTableDs.setState('fullPathCode', res.ruleCode);
            actionConfigTableDs.query();
          }
          handleType(basicParamDs.current.get('type'));
        }),
        indexMessageDs.query(),
      ]).finally(() => {
        handleSpinning(false);
      });
    }
  }, [ruleManagementHeaderId, tenantId]);

  /**
   * 上一条
   * @param {*} dataSet
   */
  const handlePrev = (dataSet) => {
    const indexNum = recordIndex <= 0 ? 0 : recordIndex - 1;
    const dataItem = dataSet.get(indexNum);

    dataSet.select(indexNum);
    handleDimensionCheck(dataItem, dataSet);
    if (indexNum <= 0) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl.get('sdps.ruleManagesDetail.view.mesage.toPrevItem').d('已到第一条数据'),
      });
    }
  };

  /**
   * 下一条
   * @param {*} dataSet
   */
  const handleNext = (dataSet) => {
    const indexNum = recordIndex >= dataSet.length - 1 ? dataSet.length - 1 : recordIndex + 1;
    const dataItem = dataSet.get(indexNum);

    dataSet.select(indexNum);
    handleDimensionCheck(dataItem, dataSet);
    if (indexNum >= dataSet.length - 1) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sdps.ruleManagesDetail.view.mesage.toLastItem')
          .d('已到最后一条数据'),
      });
    }
  };

  /**
   * handleIndexDimDistribute: 处理指标页面的查看维度点击事件
   * @param {Object} record
   */
  const handleDimensionCheck = (record, dataSet) => {
    recordIndex = record.index || 0;

    // 载入本指标的维度数据
    indexDimensionDs.loadData(JSON.parse(record.get('dimensionality') || '[]'));
    Modal.open({
      key: dimensionCheckModalKey,
      title: intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度'),
      maskClosable: true,
      mask: false,
      closable: true,
      drawer: true,
      footer: (okBtn) => (
        <div>
          {okBtn}
          <Button onClick={() => handlePrev(dataSet)}>
            {intl.get('sdps.ruleManagesDetail.view.button.prevPage').d('上一页')}
          </Button>
          <Button onClick={() => handleNext(dataSet)}>
            {intl.get('sdps.ruleManagesDetail.view.button.nextPage').d('下一页')}
          </Button>
        </div>
      ),
      children: <IndexDimensionTable tableDs={indexDimensionDs} />,
      onClose: () => {
        indexMessageDs.current.set('dimensionality', JSON.stringify(indexDimensionDs.toData()));
        indexDimensionDs.loadData([]);
      },
    });
  };

  /**
   * handleCheckTransparentDim: 处理透传规则的维度查看
   */
  const handleCheckTransparentDim = () => {
    const record = basicParamDs.current;

    // 载入本指标的维度数据
    indexDimensionDs.loadData(JSON.parse(record.get('dimensionality') || '[]'));
    Modal.open({
      key: transparentDimensionCheckModalKey,
      title: intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度'),
      drawer: true,
      maskClosable: true,
      footer: (okBtn) => okBtn,
      children: <IndexDimensionTable tableDs={indexDimensionDs} />,
      onClose: () => {
        indexDimensionDs.loadData([]);
      },
    });
  };

  /**
   * handleViewOutParam: 查看出参
   */
  const handleViewOutParam = async () => {
    const record = basicParamDs.current;
    const serviceCode = record.get('serviceCode');

    const res = await fetchOutPlatformList({ serviceCode });
    if (getResponse(res)) {
      // 载入本指标的维度数据
      outDimensionDs.loadData([...res]);
    }

    Modal.open({
      key: transparentDimensionCheckModalKey,
      title: intl.get('sdps.ruleManagesDetail.view.btn.viewOutPutParams').d('查看出参'),
      drawer: true,
      maskClosable: true,
      footer: (okBtn) => okBtn,
      children: <OutParamsTable tableDs={outDimensionDs} />,
      onClose: () => {
        outDimensionDs.loadData([]);
      },
    });
  };

  /**
   * handlePageBack: 页面回退的回调
   */
  const handlePageBack = () => {
    basicParamDs.loadData([]);
    indexMessageDs.loadData([]);
    indexDimensionDs.loadData([]);
    outDimensionDs.loadData([]);
    actionConfigTableDs.loadData([]);
  };

  return (
    <Fragment>
      <Header
        title={intl.get(`${viewPrompt}.header.title`).d('规则详情')}
        backPath={`/sdps/rule-management/list?backKey=${backKey}`}
        onBack={handlePageBack}
      >
        {type === '1' && (
          <Button color="primary" onClick={handleViewOutParam}>
            {intl.get('sdps.ruleManagesDetail.view.btn.viewOutPutParams').d('查看出参')}
          </Button>
        )}
        {type === '1' && (
          <Button color="primary" onClick={handleCheckTransparentDim}>
            {intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度')}
          </Button>
        )}
      </Header>
      <Content>
        <Spin spinning={spinning}>
          <Tabs defaultActiveKey="basic">
            <TabPane tab={intl.get(`${viewPrompt}.tab.basic`).d('基本信息')} key="basic">
              <BasicParamTable formDs={basicParamDs} />
            </TabPane>
            {type === '0' && (
              <TabPane
                tab={intl.get(`${viewPrompt}.tab.indexMessage`).d('指标信息')}
                key="index"
                disabled={!ruleManagementHeaderId}
              >
                <IndexMessageTable
                  tableDs={indexMessageDs}
                  tenantId={tenantId}
                  onDimensionClick={handleDimensionCheck}
                />
              </TabPane>
            )}
            {type === '0' && tenantId !== '0' && (
              <TabPane tab={intl.get(`${viewPrompt}.tab.action`).d('策略配置')} key="action">
                <ActionConfigTable tableDs={actionConfigTableDs} />
              </TabPane>
            )}
          </Tabs>
        </Spin>
      </Content>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['sdps.ruleManagesDetail'],
})(
  withProps(
    () => {
      const basicParamDs = new DataSet(getBasicParamDs());
      const indexMessageDs = new DataSet(getIndexMessageDs());
      const indexDimensionDs = new DataSet(getIndexDimensionDs());
      indexDimensionDs.selection = false; // 只读页面的表格无需可选
      const actionConfigTableDs = new DataSet(getActionConfigTableDs());
      const outDimensionDs = new DataSet(getOutDimensionDs());
      outDimensionDs.selection = false; //

      const valueDs = {
        basicParamDs,
        indexMessageDs,
        indexDimensionDs,
        actionConfigTableDs,
        outDimensionDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(DetailOnlyRead)
);
