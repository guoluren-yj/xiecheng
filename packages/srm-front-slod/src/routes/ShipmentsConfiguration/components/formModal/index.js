import React, { Fragment, forwardRef, useImperativeHandle } from 'react';
import { Form, Select, Spin, Output, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from '../../ShipmentsStrategy/Detail/index.less';

const FormIndex = forwardRef((props, ref) => {
  const { spinFlag, chartsDs, classify, openModal = (e) => e } = props;
  useImperativeHandle(ref, () => ({
    ref: ref.current,
  }));
  return (
    <Fragment>
      <Spin spinning={spinFlag || false}>
        <div className={styles['line-show-right']}>
          <Form
            className={styles['form-text']}
            labelWidth={1}
            labelLayout="float"
            dataSet={chartsDs}
            columns={1}
          >
            <h3 className="title-h3">
              <div style={{ width: '3px', height: '12px' }} />
              {intl
                .get('slod.shipmentsConfiguration.model.createProcessConfiguration')
                .d('创建流程配置')}
            </h3>
            <Select
              name="createCampCode"
              disabled={classify === 'history'}
              // getPopupContainer={() => document.getElementById('formId')}
            />
            <Select
              name="createQuantityCode"
              disabled={classify === 'history'}
              // getPopupContainer={() => document.getElementById('formId')}
            />
            <Select name="approveMethod" disabled={classify === 'history'} />
            <h3 className="title-h3" style={{ marginTop: 6 }}>
              <div className="block" />
              {intl
                .get('slod.shipmentsConfiguration.model.interactionProcessConfiguration')
                .d('交互流程配置')}
            </h3>
            <Select
              name="interactiveCampCode"
              disabled={classify === 'history'}
              // getPopupContainer={() => document.getElementById('formId')}
            />
            <Select
              name="interactiveType"
              disabled={classify === 'history'}
              // getPopupContainer={() => document.getElementById('formId')}
            />
            <Select
              name="cooperativeLineFlag"
              disabled={classify === 'history'}
              showHelp="tooltip"
              // getPopupContainer={() => document.getElementById('formId')}
            />
            <Select
              name="demolitionUpdateCode"
              disabled={classify === 'history'}
              // getPopupContainer={() => document.getElementById('formId')}
              showHelp="tooltip"
            />
            <Select
              name="cooperativeQuantityCode"
              disabled={classify === 'history'}
              showHelp="tooltip"
              // getPopupContainer={() => document.getElementById('formId')}
            />
            <h3 className="title-h3" style={{ marginTop: 6 }}>
              <div className="block" />
              {intl
                .get('slod.shipmentsConfiguration.model.downstreamProcessConfiguration')
                .d('下游流程配置')}
            </h3>
            <Select
              name="nodeQuantityOccupyStrategy"
              disabled={classify === 'history'}
              // getPopupContainer={() => document.getElementById('formId')}
              showHelp="tooltip"
            />
            <Select
              name="receiveStrategyFlag"
              disabled={classify === 'history'}
              showHelp="tooltip"
              // help={intl
              //   .get('slod.shipmentsConfiguration.model.receiveStrategyFlagDetail')
              //   .d(
              //     '配置当前节点的单据变为【已确认】状态后，是否需要同步至下游收货模块，用于收货操作'
              //   )}
              // getPopupContainer={() => document.getElementById('formId')}
            />
            <Select
              name="overReceiveRule"
              disabled={classify === 'history'}
              // getPopupContainer={() => document.getElementById('formId')}
              showHelp="tooltip"
            />
            <h3 className="title-h3" style={{ marginTop: 6 }}>
              <div className="block" />
              {intl
                .get('slod.shipmentsConfiguration.model.nodeDataJurisdiction')
                .d('节点数据权限配置')}
            </h3>
            <Output
              name="jurisdiction"
              renderer={({ record }) => (
                <>
                  {/* <span>标题：</span> */}
                  <Button
                    icon="assignment_ind"
                    style={{
                      float: 'left',
                      width: ' 100%',
                      textAlign: 'left',
                      // borderColor: ' #ffbc00',
                      border: 'none',
                      color: '#29BECE',
                    }}
                    onClick={() => openModal(record?.get('originalStrategyLineId'))}
                  >
                    {intl
                      .get('slod.shipmentsConfiguration.model.queryOperate')
                      .d('操作/查询权限角色维护')}
                  </Button>
                </>
              )}
            />
            <Select name="canCloseCampCode" disabled={classify === 'history'} />,
            <h3 className="title-h3" style={{ marginTop: 6 }}>
              <div className="block" />
              {intl.get('slod.shipmentsConfiguration.model.exportlation').d('外部系统导出配置')}
            </h3>
            <Select
              name="submitExportEsFlag"
              disabled={classify === 'history'}
              // getPopupContainer={() => document.getElementById('formId')}
            />
          </Form>
        </div>
      </Spin>
    </Fragment>
  );
});

export default FormIndex;
