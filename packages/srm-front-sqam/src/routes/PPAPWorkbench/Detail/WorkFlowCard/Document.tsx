import React, { useContext, useMemo, useCallback } from 'react';

import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';

import styles from './index.less';
import { Store } from '../stores';
import { flowBasicCardDocumentCode, DetailBtnCode } from '../../utils/type';


const basicFields = ['createName', 'creationDate'];

const WorkFlowDocument = (props) => {

  const { headerBtns = [] } = props;
  const {
    documentInfoDs,
    headerDs,
    customizeCommon,
    customizeBtnGroup,
  } = useContext(Store);

  const { projectName, projectNum } = headerDs.current?.get(['projectName', 'projectNum']) || {};

  const { documentNum, documentName } = documentInfoDs.current?.get(['documentNum', 'documentName']) || {};

  const basicFieldsConfig = useMemo(() => {
    return {
      documentAfBasicTitle: {
        render: () => `${projectName}-${intl.get(`sqam.ppap.view.title.document`).d('交付物')}: ${documentName}-${projectNum}-${documentNum}`,
      },
    };
  }, [projectName, documentName, projectNum, documentNum]);

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
          code: flowBasicCardDocumentCode,
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={documentInfoDs}
          titleField="documentAfBasicTitle"
          normalFields={basicFields}
          fieldsConfig={basicFieldsConfig}
          contentRemainWidth="25%"
          contentBottomRender={contentBottomRender}
        />
      )}
    </div>
  );
};

export default WorkFlowDocument;
