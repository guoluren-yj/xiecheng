import React, { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Form, Output, Spin, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Content } from 'components/Page';
import notification from 'utils/notification';
import { saveDetailInfo } from '@/services/receiptManageConfigService';
// import columns from '../NewReceiveOrReturn/columns';
import { indexDS } from './indexDS';
import { receiveOrReturnDS } from '../NewReceiveOrReturn/receiveOrReturnDS';
import styles from './index.less';

function Permission(props, ref) {
  const {
    formRef,
    tabsKey,
    workFlag,
    chartsId,
    data = {},
    chartList = {},
    recursion = (e) => e,
    clearText = (e) => e,
    strategyLineId,
    nodeStrategyId,
  } = props;

  const [spinFlag, useSpin] = useState(false);

  const indexDs = useMemo(() => new DataSet(indexDS(workFlag)), []);
  const [coopFlag, setCoopFlag] = useState(false);
  const [srmFlag, setSrmFlag] = useState(false);
  const [approveFlag, setApproveFlag] = useState(false); // 启用收货指定审批人显示标识
  const [returnFlag, setReturnFlag] = useState(false); // 启用退货指定审批人显示标识
  const receiveOrReturnDs = useMemo(() => new DataSet(receiveOrReturnDS(nodeStrategyId)), []);

  const columns = [
    {
      name: 'returnedFlag',
      width: 100,
      fixed: 'left',
    },
    {
      name: 'coopType',
      width: 80,
      fixed: 'left',
    },
    {
      name: 'approveRuleCode',
      width: 100,
      fixed: 'left',
    },
    {
      name: 'supplierConfirmType',
      width: 140,
    },
    {
      name: 'exportExtEnable',
      width: 120,
    },
    {
      name: 'itfRcvConfirmExport',
      width: 190,
    },
  ];

  useImperativeHandle(ref, () => ({
    indexDs,
    ref: ref.current,
    formChartChange,
  }));

  useEffect(() => {
    if (data.coopFlag) {
      setCoopFlag(data.coopFlag);
    }
    if (data.approveRuleCode) {
      setApproveFlag(['WFL', 'WORKFLOW_APPROVAL'].includes(data.approveRuleCode));
    }
    if (data.returnedApproveRule) {
      setReturnFlag(['WFL', 'WORKFLOW_APPROVAL'].includes(data.returnedApproveRule));
    }
  }, []);

  useEffect(() => {
    if (data.srmEnable) {
      setSrmFlag(data.srmEnable);
    }
  }, []);

  useEffect(() => {
    useSpin(true);
    try {
      if (Array.isArray(data?.childrenCoop) && data?.childrenCoop?.length) {
        receiveOrReturnDs.loadData(data.childrenCoop);
      } else {
        receiveOrReturnDs.loadData([]);
      }
      indexDs.loadData([data]);
    } catch (e) {
      throw e;
    } finally {
      useSpin(false);
    }
  }, []);

  /**
   * 保存编辑的节点数据
   */
  const formChartChange = async () => {
    const list = recursion([chartList], 'children', []);
    const headerFlag = await indexDs.validate();
    const lineFlag = await receiveOrReturnDs.validate();
    const { __dirty, __id, _status, ...others } = indexDs?.current?.toData() || {};
    const lineCharts = [];
    if (!isEmpty(Object.keys(others))) {
      const dataList = list.map((item) => {
        return item.nodeConfigId === others.nodeConfigId
          ? { ...others, strategyHeaderId: chartsId }
          : item;
      });
      lineCharts.push(...dataList);
    } else {
      lineCharts.push(...list);
    }

    const dataLine = receiveOrReturnDs
      .map((i) => i.toJSONData())
      .map((x) => ({
        ...x,
        strategyHeaderId: chartsId,
        tenantId: getCurrentOrganizationId(),
        strategyLineId: data.strategyLineId,
      }));
    const newLineCharts = lineCharts
      .filter((i) => i.strategyLineId === strategyLineId)
      .map((i) => ({ ...i, childrenCoop: coopFlag === 1 ? dataLine : [] }));
    const params = {
      ...formRef.current?.ds?.current?.toJSONData(),
      rcvStrategyLineList: newLineCharts,
    };
    if (headerFlag && lineFlag) {
      const res = await saveDetailInfo({ params, tabsKey });
      if (getResponse(res)) {
        notification.success();
        clearText();
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  // const handleDel = async () => {
  //   const params = receiveOrReturnDs.Outputed
  //     .map((i) => i.toJSONData())
  //     .filter((i) => i.strategyLineId);
  //   if (params.length > 0) {
  //     const res = await delDataLine(params);
  //     if (getResponse(res)) {
  //       receiveOrReturnDs.setQueryParameter('params', {
  //         strategyLineId: data.strategyLineId,
  //       });
  //       receiveOrReturnDs.query().then((r) => {
  //         receiveOrReturnDs.loadData(r);
  //       });
  //       receiveOrReturnDs.remove(receiveOrReturnDs.Outputed, true);
  //     }
  //   } else {
  //     receiveOrReturnDs.remove(receiveOrReturnDs.Outputed, true);
  //   }
  // };

  // const handleAdd = () => {
  //   receiveOrReturnDs.create({}, receiveOrReturnDs.length);
  // };

  // const buttons = useMemo(() => {
  //   return [
  //     ['add', { onClick: handleAdd }],
  //     ['delete', { onClick: handleDel }],
  //   ];
  // }, []);

  if (!['PLAN', 'ASN'].includes(data?.nodeOrderType)) {
    return (
      <div className={styles.modal}>
        <div className={styles.right}>
          <Spin spinning={spinFlag || false}>
            <Content className={styles.content}>
              <h3 className={styles['title-h3']} id="delivery-create">
                <div className={styles.block} />
                {intl
                  .get(`sinv.receiptManage.view.title.createRuleConfiguration`)
                  .d('单据创建及交互流程配置')}
              </h3>
              <Form
                columns={3}
                labelLayout="vertical"
                dataSet={indexDs}
                className={styles['form-readOnly']}
              >
                <Output name="srmEnable" showHelp="tooltip" />
                <Output name="subjectType" showHelp="tooltip" />
                <Output name="autoReceiveRule" showHelp="tooltip" />
                <Output name="coopFlag" showHelp="tooltip" />
                {!coopFlag ? <Output name="approveRuleCode" showHelp="tooltip" /> : null}
                {!coopFlag ? <Output name="returnedApproveRule" showHelp="tooltip" /> : null}
                {!coopFlag && approveFlag ? (
                  <Output name="approveUserFlag" showHelp="tooltip" />
                ) : null}
                {!coopFlag && returnFlag ? (
                  <Output name="returnApproveUserFlag" showHelp="tooltip" />
                ) : null}
                {/* <NumberField name="tailDifferenceQuantity" showHelp="tooltip" /> */}
              </Form>
            </Content>
            {coopFlag ? (
              <Content className={styles.content1}>
                <Table dataSet={receiveOrReturnDs} columns={columns} />
              </Content>
            ) : null}
            <Content className={styles.content}>
              <h3 className={styles['title-h3']} id="delivery-interaction">
                <div className={styles.block} />
                {intl.get(`sinv.receiptManage.view.title.dataConfiguration`).d('数据权限配置')}
              </h3>
              <Form
                columns={3}
                labelLayout="vertical"
                dataSet={indexDs}
                className={styles['form-readOnly']}
              >
                <Output name="updateRoleIdsLov" showHelp="tooltip" />
                <Output name="queryRoleIdsLov" showHelp="tooltip" />
              </Form>
            </Content>
            <Content className={styles.content}>
              <h3 className={styles['title-h3']} id="delivery-downstream">
                <div className={styles.block} />
                {intl
                  .get(`sinv.receiptManage.view.title.xiayouConfiguration`)
                  .d('对接外部系统/模块配置')}
              </h3>
              <Form
                columns={3}
                labelLayout="vertical"
                dataSet={indexDs}
                className={styles['form-readOnly']}
              >
                {!coopFlag && <Output name="exportExtEnable" showHelp="tooltip" />}
                <Output name="settleFlag" showHelp="tooltip" />
                <Output name="exportStockFlag" showHelp="tooltip" />

                {data.exportOutsourceShowFlag && (
                  <Output name="exportOutsourceFlag" showHelp="tooltip" />
                )}
              </Form>
            </Content>
            <Content className={styles.content}>
              <h3 className={styles['title-h3']} id="delivery-downstream">
                <div className={styles.block} />
                {intl
                  .get(`sinv.receiptManage.view.title.externalSystemConfiguration`)
                  .d('外部系统收货导入关联业务逻辑配置')}
              </h3>
              {srmFlag === 1 ? (
                <Alert
                  banner
                  closable
                  type="info"
                  style={{ marginBottom: 8 }}
                  message={intl
                    .get(`sinv.receiptManage.view.title.externalSystemConfigurationTip`)
                    .d(
                      '存在配置【执行系统为：SRM】但同时存在外部系统收货导入时需关注如下配置，若不存在此类业务，则无需关注。'
                    )}
                />
              ) : null}
              <Form
                columns={3}
                labelLayout="vertical"
                dataSet={indexDs}
                className={styles['form-readOnly']}
              >
                <Output
                  name="poReceiveRule"
                  showHelp="tooltip"
                  checkValueOnOptionsChange
                  onOption={({ record }) => {
                    const { poReceiveRule } = indexDs?.current?.toJSONData();
                    const rule = poReceiveRule?.split(',') || [];
                    const disabled =
                      record.get('value') !== 'NONE' && rule.some((s) => s === 'NONE');
                    if (record.get('value').includes('NONE')) {
                      return record.set('poReceiveRule', ['NONE']);
                    }
                    return { disabled };
                  }}
                  onChange={(value) => {
                    const none = value?.some((s) => s === 'NONE') || false;
                    if (none) {
                      indexDs.current.set({ poReceiveRule: ['NONE'] });
                    }
                  }}
                />
                {workFlag && (
                  <Output
                    name="slodReceiveRule"
                    showHelp="tooltip"
                    onOption={({ record }) => {
                      const { slodReceiveRule } = indexDs?.current?.toJSONData();
                      const rule = slodReceiveRule?.split(',') || [];
                      const disabled =
                        record.get('value') !== 'NONE' && rule.some((s) => s === 'NONE');
                      return { disabled };
                    }}
                    onChange={(value) => {
                      const none = value?.some((s) => s === 'NONE') || false;
                      if (none) {
                        indexDs.current.set({ slodReceiveRule: ['NONE'] });
                      }
                    }}
                  />
                )}
                {!workFlag && <Output name="asnReceiveRule" showHelp="tooltip" />}
                <Output name="asnMatchRule" showHelp="tooltip" />
                <Output name="returnAsnMatchRule" showHelp="tooltip" />
                <Output name="overReceiveFlag" showHelp="tooltip" />
                <Output name="strategyLov" showHelp="tooltip" />
              </Form>
            </Content>

            {srmFlag === 1 ? (
              <Content className={styles.content}>
                <h3 className={styles['title-h3']} id="delivery-downstream">
                  <div className={styles.block} />
                  {intl.get(`sinv.receiptManage.view.title.ReturnConfig`).d('退货限制配置')}
                </h3>
                <Form
                  columns={3}
                  labelLayout="vertical"
                  dataSet={indexDs}
                  className={styles['form-readOnly']}
                >
                  <Output
                    name="financeReverseCode"
                    showHelp="tooltip"
                    checkValueOnOptionsChange
                    onOption={({ record }) => {
                      const { financeReverseCode } = indexDs?.current?.toJSONData();
                      const rule = financeReverseCode?.split(',') || [];
                      const disabled =
                        record.get('value') !== 'NONE' && rule.some((s) => s === 'NONE');
                      if (record.get('value').includes('NONE')) {
                        return record.set('financeReverseCode', ['NONE']);
                      }
                      return { disabled };
                    }}
                    onChange={(value) => {
                      const none = value?.some((s) => s === 'NONE') || false;
                      if (none) {
                        indexDs.current.set({ financeReverseCode: ['NONE'] });
                      }
                    }}
                  />
                </Form>
              </Content>
            ) : null}
          </Spin>
        </div>
      </div>
    );
  }
  if (['PLAN', 'ASN'].includes(data?.nodeOrderType)) {
    return (
      <>
        <Form columns={1} labelLayout="float" dataSet={indexDs}>
          <Output name="srmEnable" showHelp="tooltip" />
        </Form>
      </>
    );
  }
}
const Newpermission = forwardRef(Permission);
export default Newpermission;
