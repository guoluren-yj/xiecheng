/**
 * 数据接入管理页面（平台级）
 * @date: 2021-12-13
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { Fragment, useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Modal, Form, TextField } from 'choerodon-ui/pro';
import { Badge, Tabs } from 'choerodon-ui';
import { getDataAccessDs, getDimensionDs, getIndexDs } from './store/dataAccessDs';

const intlPrompt = 'sdps.dataAccess.view';
const { Column } = Table;
const { TabPane } = Tabs;

function DataAccess(props) {
  const {
    location: { state: { _back } = {} }, // 获取返回状态，根据 _back 来判断刷新状态
  } = props;
  const { dataAccessDs, dimensionDs, indexDs } = props.valueDs;

  useEffect(() => {
    dataAccessDs.query();
  }, [_back]);

  /**
   * handleModalOpen: 查看维度和指标弹窗
   */
  const handleModalOpen = () => {
    const serviceCode = dataAccessDs.current.get('serviceCode');
    dimensionDs.query(1, { serviceCode });
    dimensionDs.setQueryParameter('serviceCode', serviceCode);
    indexDs.query(1, { serviceCode });
    indexDs.setQueryParameter('serviceCode', serviceCode);
    Modal.open({
      drawer: true,
      size: 'large',
      destroyOnClose: true,
      footer: (okBtn) => okBtn,
      children: (
        <Fragment>
          <Form dataSet={dataAccessDs} labelWidth="auto">
            <TextField name="serviceName" disabled />
            <TextField name="serviceCode" disabled />
            <TextField name="serviceRoute" disabled />
          </Form>
          <Tabs defaultActiveKey="dimension">
            <TabPane tab={intl.get(`${intlPrompt}.title.dimension`).d('维度')} key="dimension">
              <Table dataSet={dimensionDs}>
                <Column name="dimensionalityCode" />
                <Column name="dimensionalityName" />
                <Column name="dataType" />
              </Table>
            </TabPane>
            <TabPane tab={intl.get(`${intlPrompt}.title.index`).d('指标')} key="index">
              <Table dataSet={indexDs}>
                <Column name="indexCode" />
                <Column name="indexName" />
                <Column name="dataType" />
              </Table>
            </TabPane>
          </Tabs>
        </Fragment>
      ),
      onClose: () => {
        indexDs.loadData([]);
        dimensionDs.loadData([]);
      },
    });
  };

  return (
    <Fragment>
      <Header title={intl.get(`${intlPrompt}.title.dataAccess`).d('数据接入')} />
      <Content>
        <Table dataSet={dataAccessDs}>
          <Column name="serviceName" width={200} />
          <Column name="serviceCode" width={200} />
          <Column name="serviceSource" width={200} />
          <Column name="serviceRoute" />
          <Column
            name="enableStatus"
            width={100}
            renderer={({ value }) => {
              return (
                <Badge
                  text={
                    value === 'true'
                      ? intl.get(`${intlPrompt}.status.use`).d('启用')
                      : intl.get(`${intlPrompt}.status.unUse`).d('禁用')
                  }
                  status={value === 'true' ? 'success' : 'error'}
                />
              );
            }}
          />
          <Column
            name="operation"
            width={100}
            renderer={() => (
              <a onClick={handleModalOpen}>{intl.get(`${intlPrompt}.operate.check`).d('查看')}</a>
            )}
          />
        </Table>
      </Content>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['sdps.dataAccess'],
})(
  withProps(
    () => {
      const dataAccessDs = new DataSet(getDataAccessDs());
      const dimensionDs = new DataSet(getDimensionDs());
      const indexDs = new DataSet(getIndexDs());
      const valueDs = {
        dataAccessDs,
        dimensionDs,
        indexDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
  )(DataAccess)
);
