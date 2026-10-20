/**
 * 风险指标管理
 */

import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { compose } from 'lodash';
import withProps from 'utils/withProps';
import { DataSet, Tabs, Button, Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';

import { RiskItemListDS, RiskMenuDetailDS, RiskDetailDS } from './stores/riskItemDS';
import { ScanItemListDS, ScanMenuDetailDS, ScanDetailDS } from './stores/scanItemDS';

import RiskItemManage from './RiskItemManage';
import ScanItemManage from './ScanItemManage';
import RiskItemModal from './RiskItemManage/RiskItemModal';
import ScanItemModal from './ScanItemManage/ScanItemModal';

const { TabPane } = Tabs;
const RiskIndexManage = props => {
  const riskMenuDetailDS = useMemo(() => new DataSet(RiskMenuDetailDS()), []);
  const riskDetailDS = useMemo(() => new DataSet(RiskDetailDS()), []);

  const scanMenuDetailDS = useMemo(() => new DataSet(ScanMenuDetailDS()), []);
  const scanDetailDS = useMemo(() => new DataSet(ScanDetailDS()), []);

  const { riskItemListDS, scanItemListDS } = props;

  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    riskItemListDS.setQueryParameter('scanFlag', 0); // 风险项
    scanItemListDS.setQueryParameter('scanFlag', 1); // 扫描项
  }, []);

  const handleChangeTabs = key => {
    setActiveKey(key);
  };

  const handleCreateItem = () => {
    if (activeKey === '1') {
      handleCreateRiskItem();
    } else {
      handleCreateScanItem();
    }
  };

  const handleCreateRiskItem = async () => {
    let modal = null;

    const title = intl.get('sdat.riskItemConfig.view.title.createSuperItem').d('新建顶级分类');

    const commonDS = riskMenuDetailDS;

    // 新建
    commonDS.data = [];
    // 顶级
    commonDS.create(
      {
        type: 'CATEGORY',
        enabledFlag: 1,
        parentId: 0,
        level: 1,
        scanFlag: 0,
        standardFlag: 1,
      },
      0
    );

    const handleCloseModal = () => {
      commonDS.loadData([]);
      commonDS.reset();
      modal.close();
    };

    const handleOkCreate = async () => {
      const isValid = await commonDS.validate();
      if (isValid) {
        return commonDS.submit().then(res => {
          if (getResponse(res)) {
            handleCloseModal();
            riskItemListDS.query();
            return res;
          }
        });
      }
    };

    const dsType = commonDS?.current?.get('dsType') ?? '';

    modal = Modal.open({
      title,
      key: 'createItem',
      children: <RiskItemModal dataSet={commonDS} type={0} viewType="create" dsType={dsType} />,
      closable: true,
      drawer: true,
      mask: false,
      style: { width: '372px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleOkCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const handleCreateScanItem = async () => {
    let modal = null;

    const title = intl.get('sdat.riskItemConfig.view.title.createSuperItem').d('新建顶级分类');

    const commonDS = scanMenuDetailDS;

    // 新建
    commonDS.data = [];
    // 顶级
    commonDS.create(
      {
        type: 'CATEGORY',
        enabledFlag: 1,
        parentId: 0,
        level: 1,
        scanFlag: 1,
        standardFlag: 1,
      },
      0
    );

    const handleCloseModal = () => {
      commonDS.loadData([]);
      commonDS.reset();
      modal.close();
    };

    const handleOkCreate = async () => {
      const isValid = await commonDS.validate();
      if (isValid) {
        return commonDS.submit().then(res => {
          if (getResponse(res)) {
            handleCloseModal();
            scanItemListDS.query();
            return res;
          }
        });
      }
    };

    const dsType = commonDS?.current?.get('dsType') ?? '';

    modal = Modal.open({
      title,
      key: 'createItem',
      children: <ScanItemModal dataSet={commonDS} type={0} viewType="create" dsType={dsType} />,
      closable: true,
      drawer: true,
      mask: false,
      style: { width: '372px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleOkCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  return (
    <>
      <Header title={intl.get('sdat.riskItemConfig.view.title.riskIndexManage').d('风险指标管理')}>
        <Button color="primary" icon="add" onClick={handleCreateItem}>
          {intl.get('sdat.riskItemConfig.button.createSuperItem').d('新建顶级')}
        </Button>
      </Header>
      <Content>
        <Tabs activeKey={activeKey} onChange={handleChangeTabs}>
          <TabPane
            tab={intl.get('sdat.riskItemConfig.view.title.riskItemManage').d('风险项管理')}
            key="1"
          >
            <RiskItemManage
              riskItemListDS={riskItemListDS}
              riskMenuDetailDS={riskMenuDetailDS}
              riskDetailDS={riskDetailDS}
            />
          </TabPane>
          <TabPane
            tab={intl.get('sdat.riskItemConfig.view.title.scanItemManage').d('企业信息补充项管理')}
            key="2"
          >
            <ScanItemManage
              scanItemListDS={scanItemListDS}
              scanMenuDetailDS={scanMenuDetailDS}
              scanDetailDS={scanDetailDS}
            />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
};

export default compose(
  connect(state => state),
  formatterCollections({
    code: ['sdat.common', 'sdat.riskItemConfig'],
  }),
  withProps(
    () => {
      const riskItemListDS = new DataSet(RiskItemListDS());
      const scanItemListDS = new DataSet(ScanItemListDS());

      return {
        riskItemListDS,
        scanItemListDS,
      };
    },
    { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
  )
)(RiskIndexManage);
