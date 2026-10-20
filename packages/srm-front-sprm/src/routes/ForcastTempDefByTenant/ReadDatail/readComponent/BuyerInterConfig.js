import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Store } from '../../Detail/stores';
import styles from './index.less';

const commonPrompt = 'sprm.forecastMgt.model.common';

// const { Option } = SelectBox;
const BuyerInterConfigInfo = function BuyerInterConfigInfo() {
  const { headerDs } = useContext(Store);

  return (
    <Form
      dataSet={headerDs}
      labelAlign="left"
      columns={1}
      useColon={false}
      labelWidth={260}
      useWidthPercent
      className={styles['form-select-box']}
    >
      <Output
        name="needFeedback"
        showHelp="label"
        renderer={({ value }) =>
          String(value) === '1'
            ? intl.get(`${commonPrompt}.need`).d('需要')
            : intl.get(`${commonPrompt}.notNeed`).d('不需要')
        }
      />
      <Output
        name="feedbackAutoFill"
        showHelp="label"
        renderer={({ value }) =>
          String(value) === '1'
            ? intl.get(`${commonPrompt}.equal`).d('等于')
            : intl.get(`${commonPrompt}.notEqual`).d('不等于')
        }
      />
      <Output
        name="offlineInputFlag"
        showHelp="label"
        renderer={({ value }) =>
          String(value) === '1'
            ? intl.get(`${commonPrompt}.need`).d('需要')
            : intl.get(`${commonPrompt}.notNeed`).d('不需要')
        }
      />
      <Output
        name="detailFeedbackFlag"
        showHelp="label"
        renderer={({ value }) =>
          String(value) === '1'
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否')
        }
      />
      <Output name="feedbackChangeCnf" vertical showHelp="label" />
      <Output name="feedbackApprovalMethod" vertical disabled showHelp="label" />
      <Output
        name="feedbackSyncFlag"
        showHelp="label"
        renderer={({ value }) =>
          String(value) === '1'
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否')
        }
      />
    </Form>
  );
};

export default BuyerInterConfigInfo;
