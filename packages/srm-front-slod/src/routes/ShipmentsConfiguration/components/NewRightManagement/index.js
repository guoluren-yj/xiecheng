import React, { useEffect, useState, useMemo } from 'react';
import { Button, Form, Select, Output, Spin, DataSet, Lov } from 'choerodon-ui/pro';
// import PositionAnchor from '_components/PositionAnchor';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer.js';
// import cx from 'classnames';
import { openStockControl } from '@/services/ShipmentsConfigurationService';
import styles from './index.less';

// const { Link } = PositionAnchor;
import { indexDS } from '../alteration/indexDS';

export function Newpermission(props) {
  const {
    urlFlag,
    classify,
    chartsDs,
    data = {},
    openModal = (e) => e,
    openModalChange = (e) => e,
    openModalPermission = (e) => e,
  } = props;
  const Cmps = urlFlag || classify === 'history' ? Output : Select;
  const CmpLov = urlFlag || classify === 'history' ? Output : Lov;
  const StyleForm = urlFlag ? 'form-title' : null;
  const [spinFlag, useSpin] = useState(false);
  const [stofkFlag, setStockControl] = useState(false);
  // 判断首次进来变更字段列表是否有数据
  const indexDs = useMemo(() => new DataSet(indexDS(data.nodeTemplateCode)), [data.strategyLineId]);
  const [hasChangeFields, setChangeFields] = useState(false);
  // const [typeKey, useLiType] = useState('create');
  console.log(data, 'data');
  useEffect(() => {
    useSpin(true);
    try {
      queryOpenStockControl();
      chartsDs.setQueryParameter('params', {
        strategyLineId: data?.strategyLineId,
      });
      chartsDs.query().then((res) => {
        if (['ASN', 'PLAN'].includes(res.nodeTemplateCode)) {
          indexDs.forEach((record) => {
            Object.assign(record, { data });
          });
          indexDs.setQueryParameter('params', {
            strategyLineId: res.originalStrategyLineId,
            nodeTemplateCode: res.nodeTemplateCode,
          });
          indexDs.query().then((r) => {
            if (Array.isArray(r.content) && getResponse(r)) {
              setChangeFields(Boolean(r.content?.length));
            }
          });
        }
      });
    } catch (e) {
      throw e;
    } finally {
      useSpin(false);
    }
  }, []);

  const queryOpenStockControl = () => {
    openStockControl().then((res) => {
      setStockControl(res);
    });
  };

  // const onLiChange = (key) => {
  //   useLiType(key);
  // };

  return (
    <div className={styles.modal}>
      <div className={styles.right}>
        <Spin spinning={spinFlag || false}>
          <Content className={styles.content}>
            <h3 className={styles['title-h3']} id="delivery-create">
              <div className={styles.block} />
              {intl
                .get('slod.shipmentsConfiguration.model.createProcessConfiguration')
                .d('创建流程配置')}
            </h3>
            <Form
              columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
              labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
              labelLayout={urlFlag ? 'vertical' : 'float'}
              dataSet={chartsDs}
              className={styles[StyleForm]}
            >
              <Cmps name="createCampCode" disabled={classify === 'history' || hasChangeFields} />
              <Cmps name="createQuantityCode" disabled={classify === 'history'} />
              <Cmps name="approveMethod" disabled={classify === 'history'} />
              {classify !== 'history' && (
                <Cmps
                  name="unlimitedCreateFlag"
                  disabled={classify === 'history'}
                  showHelp="tooltip"
                  hidden={![1].includes(data?.canUnlimitedCreateFlag)}
                />
              )}
              {classify === 'history' && (
                <Cmps
                  name="unlimitedCreateFlag"
                  disabled={classify === 'history'}
                  showHelp="tooltip"
                  hidden={![1].includes(data?.canUnlimitedCreateFlag)}
                  renderer={({ value }) => yesOrNoRender(+value)}
                />
              )}
              <Cmps name="autoCreateFlag" disabled={classify === 'history'} showHelp="tooltip" />
              <Cmps
                name="consultPlanCreateFlag"
                disabled={classify === 'history'}
                showHelp="tooltip"
                hidden={![1].includes(data?.canConsultPlanDeliveryFlag)}
              />
              {[1].includes(data?.canConsultPlanDeliveryFlag) && (
                <CmpLov
                  // hidden={!stofkFlag}
                  name="consultPlanNodeIdLov"
                  disabled={classify === 'history'}
                  renderer={({ value, record }) => value && record?.get('consultPlanNodeIdMeaning')}
                />
              )}
            </Form>
          </Content>
          <Content className={styles.content}>
            <h3 className={styles['title-h3']} id="delivery-interaction">
              <div className={styles.block} />
              {intl
                .get('slod.shipmentsConfiguration.model.interactionProcessConfiguration')
                .d('交互流程配置')}
            </h3>
            <Form
              columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
              labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
              labelLayout={urlFlag ? 'vertical' : 'float'}
              dataSet={chartsDs}
              className={styles[StyleForm]}
            >
              <Cmps
                name="interactiveCampCode"
                disabled={classify === 'history' || hasChangeFields}
              />
              <Cmps name="interactiveType" disabled={classify === 'history' || hasChangeFields} />
              {classify !== 'history' && (
                <Cmps
                  name="cooperativeLineFlag"
                  disabled={classify === 'history'}
                  showHelp="tooltip"
                />
              )}
              {classify === 'history' && (
                <Cmps
                  name="cooperativeLineFlag"
                  disabled={classify === 'history'}
                  showHelp="tooltip"
                  renderer={({ value }) => yesOrNoRender(+value)}
                />
              )}
              <Cmps
                name="demolitionUpdateCode"
                disabled={classify === 'history'}
                // getPopupContainer={() => document.getElementById('formId')}
                showHelp="tooltip"
              />
              <Cmps
                name="feedbackRule"
                disabled={
                  classify === 'history' &&
                  !['ASN', 'PLAN'].includes(chartsDs?.getState('nodeCode'))
                }
                showHelp="tooltip"
              />
              <Cmps
                name="cooperativeQuantityCode"
                disabled={classify === 'history'}
                showHelp="tooltip"
              />
            </Form>
          </Content>
          <Content className={styles.content}>
            <h3 className={styles['title-h3']} id="delivery-downstream">
              <div className={styles.block} />
              {intl
                .get('slod.shipmentsConfiguration.model.downstreamProcessConfiguration')
                .d('下游流程配置')}
            </h3>
            <Form
              columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
              labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
              labelLayout={urlFlag ? 'vertical' : 'float'}
              dataSet={chartsDs}
              className={styles[StyleForm]}
            >
              <Cmps
                name="nodeQuantityOccupyStrategy"
                disabled={classify === 'history'}
                // getPopupContainer={() => document.getElementById('formId')}
                showHelp="tooltip"
              />
              <Cmps
                name="receiveStrategyFlag"
                disabled={classify === 'history'}
                showHelp="tooltip"
              />
              <Cmps
                name="overReceiveRule"
                disabled={classify === 'history'}
                // getPopupContainer={() => document.getElementById('formId')}
                showHelp="tooltip"
                optionsFilter={(record) => {
                  if (record.get('nodeQuantityOccupyStrategy') === 'CURRENT') {
                    return record.get('value') === 'NONE';
                  } else {
                    return record.get('value') !== 'NONE';
                  }
                }}
              />
            </Form>
          </Content>
          <Content className={styles.content}>
            <h3 className={styles['title-h3']} id="delivery-node">
              <div className={styles.block} />
              {intl
                .get('slod.shipmentsConfiguration.model.nodeDataJurisdiction')
                .d('节点数据权限配置')}
            </h3>
            <Form
              columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
              labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
              labelLayout={urlFlag ? 'vertical' : 'float'}
              dataSet={chartsDs}
              className={styles[StyleForm]}
            >
              <Output
                name="jurisdiction"
                renderer={({ record }) => (
                  <>
                    <Button
                      type="c7n-pro"
                      // icon="assignment_ind"
                      color="primary"
                      funcType="link"
                      onClick={() => openModal(record?.get('originalStrategyLineId'))}
                    >
                      {classify === 'history'
                        ? intl.get('hzero.common.button.look').d('查看')
                        : intl.get('hzero.common.view.button.edit').d('编辑')}
                    </Button>
                  </>
                )}
              />
              {!urlFlag && ['ASN', 'PLAN'].includes(data.nodeTemplateCode) && (
                <Output
                  name="alteration"
                  renderer={({ record }) => (
                    <>
                      <Button
                        type="c7n-pro"
                        // icon="build_circle"
                        color="primary"
                        funcType="link"
                        disabled={
                          !record?.get('createCampCode') || !record?.get('interactiveCampCode')
                        }
                        onClick={() =>
                          openModalChange(
                            record?.get('originalStrategyLineId'),
                            record?.get('nodeTemplateCode'),
                            record,
                            data?.nodeConfigName,
                            indexDS
                          )
                        }
                      >
                        {classify === 'history'
                          ? intl.get('hzero.common.button.look').d('查看')
                          : intl.get('hzero.common.view.button.edit').d('编辑')}
                      </Button>
                    </>
                  )}
                />
              )}
            </Form>
          </Content>
          <Content className={styles.content}>
            <h3 className={styles['title-h3']} id="delivery-external">
              <div className={styles.block} />
              {intl
                .get('slod.shipmentsConfiguration.model.documentClosingPermissionConfiguration')
                .d('单据关闭权限配置')}
            </h3>
            <Form
              columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
              labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
              labelLayout={urlFlag ? 'vertical' : 'float'}
              dataSet={chartsDs}
              className={styles[StyleForm]}
            >
              <Cmps name="canCloseCampCode" disabled={classify === 'history'} />
              {!urlFlag && (
                <Output
                  name="documentClosingStatusLimit"
                  renderer={({ record }) => (
                    <>
                      <Button
                        type="c7n-pro"
                        // icon="build_circle"
                        color="primary"
                        funcType="link"
                        disabled={
                          !record?.get('createCampCode') || !record?.get('interactiveCampCode')
                        }
                        onClick={() =>
                          openModalPermission(
                            record?.get('originalStrategyLineId'),
                            record?.get('nodeTemplateCode'),
                            record,
                            data?.nodeConfigName
                          )
                        }
                      >
                        {classify === 'history'
                          ? intl.get('hzero.common.button.look').d('查看')
                          : intl.get('hzero.common.view.button.edit').d('编辑')}
                      </Button>
                    </>
                  )}
                />
              )}
            </Form>
          </Content>
          <Content className={styles.content}>
            <h3 className={styles['title-h3']} id="delivery-external">
              <div className={styles.block} />
              {intl
                .get('slod.shipmentsConfiguration.model.exportlation')
                .d('对接外部系统/模块配置')}
            </h3>
            <Form
              columns={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
              labelWidth={{ xs: 'auto', sm: 1, md: 1, lg: 2 }}
              labelLayout={urlFlag ? 'vertical' : 'float'}
              dataSet={chartsDs}
              className={styles[StyleForm]}
            >
              {classify !== 'history' && (
                <Cmps name="submitExportEsFlag" disabled={classify === 'history'} />
              )}
              {classify === 'history' && (
                <Cmps
                  name="submitExportEsFlag"
                  disabled={classify === 'history'}
                  renderer={({ value }) => yesOrNoRender(+value)}
                />
              )}
              {classify !== 'history' && ['ASN'].includes(data?.nodeTemplateCode) && (
                <Cmps
                  hidden={!stofkFlag}
                  newLine
                  name="syncOutsourceFlag"
                  disabled={classify === 'history'}
                />
              )}
              {classify === 'history' && ['ASN'].includes(data?.nodeTemplateCode) && (
                <Cmps
                  hidden={!stofkFlag}
                  newLine
                  name="syncOutsourceFlag"
                  disabled={classify === 'history'}
                  renderer={({ value }) => yesOrNoRender(+value)}
                />
              )}
              {['ASN'].includes(data?.nodeTemplateCode) && (
                <CmpLov
                  hidden={!stofkFlag}
                  name="outsourceStrategy"
                  disabled={classify === 'history'}
                  renderer={({ value, record }) =>
                    value && record?.get('outsourceStrategyCodeMeaning')
                  }
                />
              )}
            </Form>
          </Content>
        </Spin>
      </div>
    </div>
  );
}
