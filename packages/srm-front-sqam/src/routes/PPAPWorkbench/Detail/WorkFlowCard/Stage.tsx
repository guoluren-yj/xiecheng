import React, { useContext, useMemo, useCallback } from 'react';

import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';

import styles from './index.less';
import { Store } from '../stores';
import { flowBasicCardStageCode, DetailBtnCode } from '../../utils/type';


const basicFields = ['createName', 'creationDate'];

const WorkFlowStage = (props) => {

  const { headerBtns = [] } = props;
  const {
    stageInfoDs,
    headerDs,
    customizeCommon,
    customizeBtnGroup,
  } = useContext(Store);

  const { projectName, projectNum } = headerDs.current?.get(['projectName', 'projectNum']) || {};

  const { stageName, stageNum } = stageInfoDs.current?.get(['stageName', 'stageNum']) || {};

  const basicFieldsConfig = useMemo(() => {
    return {
      stageAfBasicTitle: {
        render: () => `${projectName}-${intl.get(`sqam.ppap.model.template.stage`).d('阶段')}:${stageName}-${projectNum}-${stageNum}`,
      },
    };
  }, [projectName, stageName, projectNum, stageNum]);

  const contentBottomRender = useCallback(() => {
    return (
      <div className={styles['sqam-ppap-workflow-basic-bottom']}>
        {customizeBtnGroup(
          { code: DetailBtnCode, pro: true },
          <DynamicButtons defaultBtnType='c7n-pro' buttons={headerBtns} />
        )}
      </div>
    );
  }, [headerBtns, customizeBtnGroup]);

  return (
    <div className={styles['ppap-workflow-card-wrapper']}>
      {customizeCommon(
        {
          code: flowBasicCardStageCode,
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={stageInfoDs}
          titleField="stageAfBasicTitle"
          normalFields={basicFields}
          fieldsConfig={basicFieldsConfig}
          // maxTagCount={3}
          contentRemainWidth="25%"
          contentBottomRender={contentBottomRender}
        />
      )}
    </div>
  );
};

export default WorkFlowStage;
