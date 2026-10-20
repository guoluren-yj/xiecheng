/*
 * @Date: 2024-10-17 15:43:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, forwardRef, useImperativeHandle } from 'react';
import { useDataSet, Form, TextField, SelectBox, Tooltip, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import { ReactComponent as IndicatorsAttType } from '@/assets/evaluation/indicators-att-type.svg';
import { ReactComponent as IndicatorsReportDoc } from '@/assets/evaluation/indicators-report-doc.svg';
import styles from './styles.less';
import { getIndexDS } from './getIndexDS';

const Index = (props, ref) => {
  const dataSet = useDataSet(() => getIndexDS(), []);

  const downloadDimensionMsg = {
    REPORT: intl
      .get('sslm.purchaserEvaluation.view.downloadDimension.reportMsg')
      .d('按评估单据维度打包，结构可参考图例一'),
    ATTACHMENT: intl
      .get('sslm.purchaserEvaluation.view.downloadDimension.attachmentMsg')
      .d('按附件类型维度打包，结构可参考图例二'),
  };

  useImperativeHandle(ref, () => {
    return { dataSet, getSaveParams };
  });

  // 获取保存参数
  const getSaveParams = async () => {
    const validateFlag = await dataSet.validate();
    if (validateFlag && dataSet.current) {
      return dataSet.current.toJSONData();
    } else {
      return false;
    }
  };

  // 渲染下载维度
  const renderDownloadDimension = ({ text, value }) => {
    return (
      <Fragment>
        {text}
        <Tooltip title={downloadDimensionMsg[value]}>
          <Icon
            type="help"
            style={{ fontSize: 14, color: '#868d9c', marginLeft: 8, marginTop: -3 }}
          />
        </Tooltip>
      </Fragment>
    );
  };
  return (
    <TopSection className={styles['export-report-attachment']}>
      <SecondSection
        key="baseInfo"
        title={intl.get(`sslm.common.view.archiveFilled.baseInfo`).d('基本信息')}
      >
        <Form columns={2} dataSet={dataSet} labelLayout="float" style={{ marginBottom: 32 }}>
          <TextField name="contentName" />
          <TextField name="exportType" />
          <TextField
            name="maxCapacity"
            showHelp="tooltip"
            help={intl
              .get('sslm.purchaserEvaluation.view.help.maximumFileCapacityMsg')
              .d('文件最大容量为1GB，超过最大容量则会下载失败，需减少下载文件的数量后重试')}
          />
          <TextField name="isAsync" />
        </Form>
      </SecondSection>
      <SecondSection
        key="attachmentType"
        title={intl.get('sslm.common.view.attachment.type').d('附件类型')}
      >
        <SelectBox name="attachmentTypes" dataSet={dataSet} style={{ marginBottom: 16 }} />
      </SecondSection>
      <SecondSection
        key="attachmentType"
        title={intl.get('sslm.common.view.attachment.downloadDimension').d('下载维度')}
      >
        <SelectBox
          name="downloadDimension"
          dataSet={dataSet}
          optionRenderer={renderDownloadDimension}
        />
        <div className={styles['download-dimension-legend']}>
          <div className={styles['download-dimension-legend-item-wrap']}>
            <div className={styles['download-dimension-legend-item']}>
              <IndicatorsReportDoc />
              <span>{intl.get('sslm.common.view.legend.one').d('图例一')}</span>
            </div>
          </div>
          <div className={styles['download-dimension-legend-item-wrap']}>
            <div className={styles['download-dimension-legend-item']}>
              <IndicatorsAttType />
              <span>{intl.get('sslm.common.view.legend.two').d('图例二')}</span>
            </div>
          </div>
        </div>
      </SecondSection>
    </TopSection>
  );
};

export default forwardRef(Index);
