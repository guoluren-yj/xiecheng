import React, {
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { DataSet, Form, Select, Spin, Lov, Table, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Content } from 'components/Page';
import notification from 'utils/notification';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer.js';
import { saveDetailInfo, delDataLine } from '@/services/receiptManageConfigService';
import tableColumns from '../NewReceiveOrReturn/columns';
import { indexDS } from './indexDS';
import { receiveOrReturnDS } from '../NewReceiveOrReturn/receiveOrReturnDS';
import styles from './index.less';

function Permission(props, ref) {
  const {
    formRef,
    tabsKey,
    workFlag,
    chartsId,
    readOnly,
    data = {},
    chartList = {},
    recursion = (e) => e,
    clearText = (e) => e,
    strategyLineId,
  } = props;

  const [spinFlag, useSpin] = useState(false);
  const indexDs = useMemo(() => new DataSet(indexDS(workFlag, readOnly)), []);
  const [coopFlag, setCoopFlag] = useState(false);
  const [srmFlag, setSrmFlag] = useState(false);
  const [approveFlag, setApproveFlag] = useState(false); // 启用收货指定审批人显示标识
  const [returnFlag, setReturnFlag] = useState(false); // 启用退货指定审批人显示标识
  const receiveOrReturnDs = useMemo(() => new DataSet(receiveOrReturnDS(readOnly)), []);

  const CmpSle = readOnly ? Output : Select;
  const CmpLov = readOnly ? Output : Lov;

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

  const handleChange = useCallback(
    (val) => {
      if (val === '0') {
        setCoopFlag(Number(val));
      } else {
        setCoopFlag(Number(val));
      }
    },
    [coopFlag]
  );

  const handleApproveChange = useCallback(
    (val) => {
      setApproveFlag(['WFL', 'WORKFLOW_APPROVAL'].includes(val));
    },
    [approveFlag]
  );

  const handleReturnChange = useCallback(
    (val) => {
      setReturnFlag(['WFL', 'WORKFLOW_APPROVAL'].includes(val));
    },
    [returnFlag]
  );

  const handleChangeSrm = useCallback(
    (val) => {
      if (val === '0') {
        setSrmFlag(Number(val));
      } else {
        setSrmFlag(Number(val));
      }
    },
    [coopFlag]
  );

  const handleDel = async () => {
    const params = receiveOrReturnDs.selected
      .map((i) => i.toJSONData())
      .filter((i) => i.strategyLineId);
    if (params.length > 0) {
      const res = await delDataLine(params);
      if (getResponse(res)) {
        receiveOrReturnDs.setQueryParameter('params', {
          strategyLineId: data.strategyLineId,
        });
        receiveOrReturnDs.query().then((r) => {
          receiveOrReturnDs.loadData(r);
        });
        receiveOrReturnDs.remove(receiveOrReturnDs.selected, true);
      }
    } else {
      receiveOrReturnDs.remove(receiveOrReturnDs.selected, true);
    }
  };

  const handleAdd = () => {
    receiveOrReturnDs.create({}, receiveOrReturnDs.length);
  };

  const buttons = useMemo(() => {
    return [
      ['add', { onClick: handleAdd }],
      ['delete', { onClick: handleDel }],
    ];
  }, []);

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
                columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
                labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
                labelLayout="float"
                dataSet={indexDs}
              >
                <CmpSle
                  name="srmEnable"
                  showHelp="tooltip"
                  onChange={(val) => handleChangeSrm(val)}
                />
                <CmpSle name="subjectType" showHelp="tooltip" />
                <CmpSle name="autoReceiveRule" showHelp="tooltip" />
                <CmpSle name="coopFlag" showHelp="tooltip" onChange={(val) => handleChange(val)} />
                {!coopFlag ? (
                  <CmpSle
                    name="approveRuleCode"
                    showHelp="tooltip"
                    onChange={(val) => handleApproveChange(val)}
                  />
                ) : null}
                {!coopFlag ? (
                  <CmpSle
                    name="returnedApproveRule"
                    showHelp="tooltip"
                    onChange={(val) => handleReturnChange(val)}
                  />
                ) : null}
                {!coopFlag && approveFlag ? (
                  <CmpSle name="approveUserFlag" showHelp="tooltip" />
                ) : null}
                {!coopFlag && returnFlag ? (
                  <CmpSle name="returnApproveUserFlag" showHelp="tooltip" />
                ) : null}
                {/* <NumberField name="tailDifferenceQuantity" showHelp="tooltip" /> */}
              </Form>
            </Content>
            {coopFlag ? (
              <Content className={styles.content1}>
                <Table
                  customizedCode="code-cust"
                  dataSet={receiveOrReturnDs}
                  columns={tableColumns(readOnly)}
                  buttons={!readOnly && buttons}
                  boxSizing="wrapper"
                  style={{ maxHeight: 510 }}
                />
              </Content>
            ) : null}
            <Content className={styles.content}>
              <h3 className={styles['title-h3']} id="delivery-interaction">
                <div className={styles.block} />
                {intl.get(`sinv.receiptManage.view.title.dataConfiguration`).d('数据权限配置')}
              </h3>
              <Form
                columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
                labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
                labelLayout="float"
                dataSet={indexDs}
              >
                <CmpLov name="updateRoleIdsLov" showHelp="tooltip" />
                <CmpLov name="queryRoleIdsLov" showHelp="tooltip" />
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
                columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
                labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
                labelLayout="float"
                dataSet={indexDs}
              >
                {!coopFlag && <CmpSle name="exportExtEnable" showHelp="tooltip" />}
                <CmpSle name="settleFlag" showHelp="tooltip" />
                {!readOnly && <CmpSle name="exportStockFlag" showHelp="tooltip" />}
                {readOnly && (
                  <Output name="exportStockFlag" renderer={({ value }) => yesOrNoRender(+value)} />
                )}

                {data?.exportOutsourceShowFlag && !readOnly && (
                  <CmpSle name="exportOutsourceFlag" showHelp="tooltip" />
                )}
                {readOnly && (
                  <Output
                    name="exportOutsourceFlag"
                    renderer={({ value }) => yesOrNoRender(+value)}
                  />
                )}
                {/* {data?.exportFinanceShowFlag === 1 && !readOnly && (
                  <CmpSle name="exportFinanceFlag" showHelp="tooltip" />
                )}
                {data?.exportFinanceShowFlag === 1 && readOnly && (
                  <Output
                    name="exportFinanceFlag"
                    renderer={({ value }) => yesOrNoRender(+value)}
                  />
                )} */}
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
                <div style={{ marginBottom: '8px' }}>
                  <Alert
                    banner
                    closable
                    type="info"
                    style={{ marginBottom: '8px', color: '#1890ff' }}
                    message={intl
                      .get(`sinv.receiptManage.view.title.externalSystemConfigurationTip`)
                      .d(
                        '存在配置【执行系统为：SRM】但同时存在外部系统收货导入时需关注如下配置，若不存在此业务，则无需关注。'
                      )}
                  />
                </div>
              ) : null}
              <div style={{ marginTop: '16px' }}>
                <Form
                  columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
                  labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
                  labelLayout="float"
                  dataSet={indexDs}
                >
                  <CmpSle
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
                    <CmpSle
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
                  {!workFlag && <CmpSle name="asnReceiveRule" showHelp="tooltip" />}
                  <CmpSle name="asnMatchRule" showHelp="tooltip" />
                  <CmpSle name="returnAsnMatchRule" showHelp="tooltip" />
                  {/* {!readOnly && <CmpSle name="overReceiveFlag" showHelp="tooltip" />} */}
                  <CmpSle name="overReceiveFlag" showHelp="tooltip" />
                  {/* {readOnly && (
                    <Output
                      name="overReceiveFlag"
                      renderer={({ value }) => yesOrNoRender(+value)}
                    />
                  )} */}
                  <CmpLov name="strategyLov" showHelp="tooltip" />
                </Form>
              </div>
            </Content>

            {srmFlag === 1 ? (
              <Content className={styles.content}>
                <h3 className={styles['title-h3']} id="delivery-downstream">
                  <div className={styles.block} />
                  {intl.get(`sinv.receiptManage.view.title.ReturnConfig`).d('退货限制配置')}
                </h3>
                <Form
                  columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
                  labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
                  labelLayout="float"
                  dataSet={indexDs}
                >
                  <CmpSle
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
          <CmpSle name="srmEnable" showHelp="tooltip" />
        </Form>
      </>
    );
  }
}
const Newpermission = forwardRef(Permission);
export default Newpermission;
