import React, { memo, useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from 'choerodon-ui';
import { Button, DataSet, Spin, Form, NumberField, Table } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  interfaceFlowData,
  controlLinkData,
  limitStrategyData,
  controlSizeData,
  fetchInterFlowSave,
} from './initialDataDs';
import './index.less';

const InterfaceFlowControlDetails = ({
  dataSource,
  dataSetSource,
  itfSrcPlatform,
  rederOnly = false,
  modal,
}) => {
  const [controlLinkFlag, setControlLink] = useState(true);
  const [controlSizeFlag, setControlSize] = useState(true);
  const [controlFlowFlag, setControlFow] = useState(true);

  const controlLinkDs = useMemo(() => new DataSet(controlLinkData()), []);

  const controlSizeDs = useMemo(() => new DataSet(controlSizeData()), []);

  const callDataVolumDs = useMemo(() => new DataSet(limitStrategyData()), []);
  const callNumberVolumDs = useMemo(() => new DataSet(limitStrategyData()), []);
  const singleNumberVolumDs = useMemo(() => new DataSet(limitStrategyData()), []);

  const interfaceFlowDataDs = useMemo(
    () =>
      new DataSet({
        ...interfaceFlowData(),
        children: {
          dataCountLimitStrategyList: callDataVolumDs,
          batchLimitStrategyList: callNumberVolumDs,
          singleLimitStrategyList: singleNumberVolumDs,
        },
      }),
    []
  );

  useEffect(() => {
    fetchData();
  }, [dataSource, itfSrcPlatform]);

  const dataColumns = useMemo(
    () => [
      { name: 'overLimitRatioLookup', editor: (record) => record.getState('editing') },
      { name: 'banDuration', editor: (record) => record.getState('editing') },
      !controlFlowFlag && {
        header: intl.get('scux.interfaceFlowControl.view.btn.operation').d('操作'),
        align: 'center',
        renderer: ({ record }) =>
          !isNil(record.get('orderSeq')) && (
            <>
              <a
                style={{ marginRight: '8px' }}
                onClick={() => handleLineOperation(1, record, callDataVolumDs)}
              >
                {intl.get('scux.interfaceFlowControl.view.btn.editor').d('编辑')}
              </a>
              <a onClick={() => handleLineOperation(0, record, callDataVolumDs)}>
                {intl.get('scux.interfaceFlowControl.view.btn.delete').d('删除')}
              </a>
            </>
          ),
      },
    ],
    [controlFlowFlag, callDataVolumDs]
  );

  const numberColumns = useMemo(
    () => [
      { name: 'overLimitRatioLookup', editor: (record) => record.getState('editing') },
      { name: 'banDuration', editor: (record) => record.getState('editing') },
      !controlFlowFlag && {
        header: intl.get('scux.interfaceFlowControl.view.btn.operation').d('操作'),
        align: 'center',
        renderer: ({ record }) =>
          !isNil(record.get('orderSeq')) && (
            <>
              <a
                style={{ marginRight: '8px' }}
                onClick={() => handleLineOperation(1, record, callNumberVolumDs)}
              >
                {intl.get('scux.interfaceFlowControl.view.btn.editor').d('编辑')}
              </a>
              <a onClick={() => handleLineOperation(0, record, callNumberVolumDs)}>
                {intl.get('scux.interfaceFlowControl.view.btn.delete').d('删除')}
              </a>
            </>
          ),
      },
    ],
    [controlFlowFlag, callNumberVolumDs]
  );

  const flowColumns = useMemo(
    () => [
      { name: 'overLimitRatioLookup', editor: (record) => record.getState('editing') },
      { name: 'banDuration', editor: (record) => record.getState('editing') },
      !controlFlowFlag && {
        header: intl.get('scux.interfaceFlowControl.view.btn.operation').d('操作'),
        align: 'center',
        renderer: ({ record }) =>
          !isNil(record.get('orderSeq')) && (
            <>
              <a
                style={{ marginRight: '8px' }}
                onClick={() => handleLineOperation(1, record, interfaceFlowDataDs)}
              >
                {intl.get('scux.interfaceFlowControl.view.btn.editor').d('编辑')}
              </a>
              <a onClick={() => handleLineOperation(0, record, interfaceFlowDataDs)}>
                {intl.get('scux.interfaceFlowControl.view.btn.delete').d('删除')}
              </a>
            </>
          ),
      },
    ],
    [controlFlowFlag, callNumberVolumDs]
  );

  const handleLineOperation = useCallback((flag, record, dataSet) => {
    if (flag === 1) {
      record.setState('editing', true);
    } else {
      const newDataSet = dataSet.filter((item) => item.get('orderSeq') !== record.get('orderSeq'));
      dataSet.loadData(newDataSet);
    }
  }, []);

  const fetchData = () => {
    const { tenantId, interfaceCode, interfaceId } = dataSource;
    interfaceFlowDataDs.setQueryParameter('tenantId', tenantId);
    interfaceFlowDataDs.setQueryParameter('interfaceCode', interfaceCode);
    interfaceFlowDataDs.setQueryParameter('itfSrcPlatform', itfSrcPlatform);
    interfaceFlowDataDs.setQueryParameter('interfaceId', interfaceId);
    interfaceFlowDataDs.query().then((res) => {
      const r = getResponse(res);
      if (r) {
        controlLinkDs.loadData(r);
        controlSizeDs.loadData(r);
      }
    });
  };

  const handleLink = (flag) => {
    if (flag) {
      controlLinkDs.reset();
    }
    setControlLink(flag);
  };

  const handleSize = (flag) => {
    if (flag) {
      controlSizeDs.reset();
    }
    setControlSize(flag);
  };

  const handleFlow = (flag) => {
    if (flag) {
      interfaceFlowDataDs.reset();
      callDataVolumDs.reset();
      callNumberVolumDs.reset();
      singleNumberVolumDs.reset();
    }
    setControlFow(flag);
  };

  const handleSave = useCallback(async () => {
    const validateLinkFlag = controlLinkFlag ? true : await controlLinkDs.validate();
    const validateSizeFlag = controlSizeFlag ? true : await controlSizeDs.validate();
    const validateFlowFlag = controlFlowFlag ? true : await interfaceFlowDataDs.validate();
    if (validateLinkFlag && validateSizeFlag && validateFlowFlag) {
      const { batchDataCountLimit, reqContCapLimit } = controlSizeDs.current.get([
        'batchDataCountLimit',
        'reqContCapLimit',
      ]);
      const currentData = {
        ...dataSource,
        ...interfaceFlowDataDs.current.toData(),
        concurrencyPermits: controlLinkDs.current.get('concurrencyPermits'),
        batchDataCountLimit,
        reqContCapLimit,
      };
      const response = await fetchInterFlowSave([currentData]);
      if (getResponse(response)) {
        notification.success();
        fetchData();
        setControlLink(true);
        setControlFow(true);
        setControlSize(true);
        dataSetSource.query();
      }
    } else {
      notification.warning({
        message: intl.get('scux.interfaceFlowControl.view.message.notNul').d('请填写必填项!'),
      });
    }
  }, [
    dataSource,
    controlLinkDs,
    controlSizeDs,
    interfaceFlowDataDs,
    controlLinkFlag,
    controlSizeFlag,
    controlFlowFlag,
  ]);

  const handleAddLine = useCallback((dataSet) => {
    const record = dataSet.create({}, 0);
    record.setState('editing', true);
  }, []);

  return (
    <div className="contentStyle">
      <Card>
        <div className="titleTag">
          {intl
            .get(`scux.interfaceFlowControl.view.title.concurrent.controlLink`)
            .d('并发链接控制')}
          <div className="titleTagRight">
            {controlLinkFlag ? (
              <Button
                color="primary"
                hidden={rederOnly}
                className="titleButton"
                onClick={() => handleLink(false)}
              >
                {intl.get(`scux.interfaceFlowControl.view.button.editor`).d('编辑')}
              </Button>
            ) : (
              <Button
                hidden={rederOnly}
                color="primary"
                className="titleButton"
                onClick={() => handleLink(true)}
              >
                {intl.get(`scux.interfaceFlowControl.view.button.cancel`).d('取消')}
              </Button>
            )}
          </div>
          <div className="titleTagMessage">
            {intl
              .get('scux.interfaceFlowControl.view.message.concurrent.controlLink')
              .d('设定系统允许的最大并发连接数，超出该限制的连接将被拒绝')}
          </div>
        </div>
        <Spin dataSet={controlLinkDs}>
          <Form dataSet={controlLinkDs} labelLayout="float">
            <NumberField
              name="concurrencyPermits"
              disabled={controlLinkFlag}
              addonAfter={intl.get('scux.interfaceFlowControl.view.title.individual').d('个')}
            />
          </Form>
        </Spin>
      </Card>
      <Card>
        <div className="titleTag">
          {intl.get(`scux.interfaceFlowControl.view.title.message.controlSize`).d('报文大小控制')}
          <div className="titleTagRight">
            {controlSizeFlag ? (
              <Button
                hidden={rederOnly}
                color="primary"
                className="titleButton"
                onClick={() => handleSize(false)}
              >
                {intl.get(`scux.interfaceFlowControl.view.button.editor`).d('编辑')}
              </Button>
            ) : (
              <Button
                hidden={rederOnly}
                color="primary"
                className="titleButton"
                onClick={() => handleSize(true)}
              >
                {intl.get(`scux.interfaceFlowControl.view.button.cancel`).d('取消')}
              </Button>
            )}
          </div>
          <div className="titleTagMessage">
            {intl
              .get('scux.interfaceFlowControl.view.message.controlSize')
              .d('设定每批次接口可以同步的数据量及请求体大小,任一满足才可进行数据同步')}
          </div>
        </div>
        <Spin dataSet={controlSizeDs}>
          <Form dataSet={controlSizeDs} labelLayout="float">
            <NumberField
              name="batchDataCountLimit"
              disabled={controlSizeFlag}
              addonAfter={intl.get('scux.interfaceFlowControl.view.title.strip').d('条')}
            />
            <NumberField
              name="reqContCapLimit"
              disabled={controlSizeFlag}
              addonAfter={intl.get('scux.interfaceFlowControl.view.title.M').d('M')}
            />
          </Form>
        </Spin>
      </Card>
      <Card>
        <div className="titleTag">
          {intl.get(`scux.interfaceFlowControl.view.title.access.controlflow`).d('访问流量控制')}
          <div className="titleTagRight">
            {controlFlowFlag ? (
              <Button
                hidden={rederOnly}
                color="primary"
                className="titleButton"
                onClick={() => handleFlow(false)}
              >
                {intl.get(`scux.interfaceFlowControl.view.button.editor`).d('编辑')}
              </Button>
            ) : (
              <Button
                hidden={rederOnly}
                color="primary"
                className="titleButton"
                onClick={() => handleFlow(true)}
              >
                {intl.get(`scux.interfaceFlowControl.view.button.cancel`).d('取消')}
              </Button>
            )}
          </div>
          <div className="titleTagMessage">
            {intl
              .get('scux.interfaceFlowControl.view.message.controlflow')
              .d('设定每五分钟允许调用次数和调用数据量，超出该限制的连接将根据熔断策略进行熔断')}
          </div>
        </div>

        <div className="subTitleTag">
          <div className="subTitleTag_title">
            {intl
              .get(`scux.interfaceFlowControl.view.title.data.volumes.assess.control`)
              .d('调用数据量访问控制')}
          </div>
          <Spin dataSet={interfaceFlowDataDs}>
            <Form dataSet={interfaceFlowDataDs} labelWidth={150}>
              <NumberField
                name="dataCountLimitPerFiveMin"
                disabled={controlFlowFlag}
                addonAfter={intl.get('scux.interfaceFlowControl.view.title.strip').d('条')}
              />
            </Form>
          </Spin>
          <div style={{ marginBottom: '8px' }}>
            {intl
              .get(`scux.interfaceFlowControl.view.title.circuit.breaker.strategy`)
              .d('熔断策略')}
          </div>
          <Table
            dataSet={callDataVolumDs}
            columns={dataColumns}
            buttons={
              controlFlowFlag
                ? []
                : [
                    <Button
                      funcType="flat"
                      icon="add"
                      onClick={() => handleAddLine(callDataVolumDs)}
                    >
                      {intl.get('scux.interfaceFlowControl.view.btn.add').d('添加')}
                    </Button>,
                  ]
            }
          />
        </div>
        <div className="subTitleTag">
          <div className="subTitleTag_title">
            {intl
              .get(`scux.interfaceFlowControl.view.title.data.number.assess.control`)
              .d('调用次数访问控制')}
          </div>
          <div style={{ marginTop: '12px' }}>
            {intl.get(`scux.interfaceFlowControl.view.title.batch.call.scenario`).d('批量调用场景')}
          </div>
          <Spin dataSet={interfaceFlowDataDs}>
            <Form dataSet={interfaceFlowDataDs} labelWidth={180}>
              <NumberField
                name="batchLimitPerFiveMin"
                disabled={controlFlowFlag}
                addonAfter={intl.get('scux.interfaceFlowControl.view.title.strip').d('条')}
              />
            </Form>
          </Spin>
          <div style={{ marginBottom: '8px' }}>
            {intl
              .get(`scux.interfaceFlowControl.view.title.circuit.breaker.strategy`)
              .d('熔断策略')}
          </div>
          <Table
            dataSet={callNumberVolumDs}
            columns={numberColumns}
            buttons={
              controlFlowFlag
                ? []
                : [
                    <Button
                      funcType="flat"
                      icon="add"
                      onClick={() => handleAddLine(callNumberVolumDs)}
                    >
                      {intl.get('scux.interfaceFlowControl.view.btn.add').d('添加')}
                    </Button>,
                  ]
            }
          />
          <div style={{ marginTop: '12px' }}>
            {intl
              .get(`scux.interfaceFlowControl.view.title.single.call.scenario`)
              .d('单条调用场景')}
          </div>
          <Spin dataSet={interfaceFlowDataDs}>
            <Form dataSet={interfaceFlowDataDs} labelWidth={180}>
              <NumberField
                name="singleLimitPerFiveMin"
                disabled={controlFlowFlag}
                addonAfter={intl.get('scux.interfaceFlowControl.view.title.strip').d('条')}
              />
            </Form>
          </Spin>
          <div style={{ marginBottom: '8px' }}>
            {intl
              .get(`scux.interfaceFlowControl.view.title.circuit.breaker.strategy`)
              .d('熔断策略')}
          </div>
          <Table
            dataSet={singleNumberVolumDs}
            columns={flowColumns}
            buttons={
              controlFlowFlag
                ? []
                : [
                    <Button
                      funcType="flat"
                      icon="add"
                      onClick={() => handleAddLine(singleNumberVolumDs)}
                    >
                      {intl.get('scux.interfaceFlowControl.view.btn.add').d('添加')}
                    </Button>,
                  ]
            }
          />
        </div>
      </Card>
      <div>
        <Button color="primary" hidden={rederOnly} onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button
          onClick={() => {
            modal.close(true);
          }}
        >
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['scux.interfaceFlowControl', 'hzero.common'],
})(memo(InterfaceFlowControlDetails));

// export default memo(InterfaceFlowControlDetails);
