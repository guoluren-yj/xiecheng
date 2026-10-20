/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2023-08-02 14:57:17
 * @LastEditors: yiping.liu
 */
import React, { useContext, useMemo } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';
import ShowSourceNode from './ShowSourceNode';
import styles from '../../index.less';

const BaseInfo = (props) => {
  const {
    remote,
    customizeForm,
    commonDs: { baseInfoDs },
  } = useContext(Store);
  const { nodes = [], britishBidding = noop } = props;

  const britishBiddingFlag = britishBidding();

  // 新竞价标识
  const biddingFlag = useMemo(() => {
    return baseInfoDs?.current?.get('sourceCategory') === 'RFA';
  }, [baseInfoDs?.current?.get('sourceCategory')]);

  // 启用红绿灯
  const isBritishBidTrafficLight = useMemo(() => {
    return baseInfoDs?.current?.get('isBritishBidTrafficLight');
  }, [baseInfoDs?.current?.get('isBritishBidTrafficLight')]);

  const getSourceFields = () => {
    const list = [
      <Output name="sourceCategory" />,
      <Output name="biddingMode" hidden={!biddingFlag} showHelp="label" />,
      <Output
        name="isBritishBidTrafficLight"
        hidden={!britishBiddingFlag}
        renderer={({ value }) => yesOrNoRender(value)}
        showHelp="label"
      />,
      <Output
        name="isBritishBidLowestPriceGreen"
        hidden={!britishBiddingFlag || isBritishBidTrafficLight !== 1}
        renderer={({ value }) => yesOrNoRender(value)}
        showHelp="label"
      />,
      <Output
        name="biddingStageChangeableFlag"
        hidden={!biddingFlag}
        renderer={({ value }) => yesOrNoRender(value)}
        // showHelp="label"
      />,
    ];
    return remote?.process(
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.PROCESS_SOURCE_CATEGORY_FORM',
      list,
      { baseInfoDs }
    );
  };
  return (
    <React.Fragment>
      <div>
        <h3
          className={styles['card-sub-title']}
          style={{ marginBottom: '8px', fontWeight: 600, marginTop: '16px' }}
        >
          <div className={styles['card-sub-title-line']} />
          {intl.get('ssrc.sourceTemplate.view.message.panel.baseInfos').d('基本信息')}
        </h3>
        {customizeForm(
          {
            code: 'SSRC.SOURCE_TEMPLATE_WORKBENCH_DETAIL.BASE_INFO',
            dataSet: baseInfoDs,
          },
          <Form
            dataSet={baseInfoDs}
            columns={3}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
            labelAlign="left"
            useWidthPercent
          >
            <Output name="templateNum" />
            <Output name="templateName" />
            <Output name="versionNumber" />
            <Output name="templateStatusMeaning" hidden />
          </Form>
        )}
      </div>
      <div>
        <h3 className={styles['card-sub-title']} style={{ marginBottom: '8px', fontWeight: 600 }}>
          <div className={styles['card-sub-title-line']} />
          {intl.get(`ssrc.sourceTemplate.model.template.sourcingCategory`).d('寻源类别')}
        </h3>
        <Form
          dataSet={baseInfoDs}
          columns={3}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          labelAlign="left"
        >
          {getSourceFields()}
        </Form>

        <div style={{ marginTop: '24px' }} className={styles['source-detail-node']}>
          <ShowSourceNode
            nodes={nodes}
            sourceCategory={
              baseInfoDs?.current?.get('secondarySourceCategory') ||
              baseInfoDs?.current?.get('sourceCategory')
            }
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default observer(BaseInfo);
