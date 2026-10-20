import React, { useContext } from 'react';
import { Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import CollapseForm from '_components/CollapseForm';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { StoreContext } from '../store/StoreProvider';
import { renderChangeFieldsColor } from '../utils';

// 基础信息卡片
const BaseInfoCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('baseInfoForm'),
      dataSet: headerDs,
    },
    <CollapseForm
      dataSet={headerDs}
      columns={3}
      showLines={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output
        name="sourceProjectNum"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'sourceProjectNum' })
        }
      />
      <Output
        name="sourceProjectName"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'sourceProjectName' })
        }
      />
      <Output
        name="budgetAmount"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'budgetAmount' })
        }
      />
      <Output
        name="totalEstimatedAmount"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'totalEstimatedAmount' })
        }
      />
      <Output
        name="estimatedDate"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({
            value: value && moment(value).format(DEFAULT_DATE_FORMAT),
            record,
            name: 'estimatedDate',
          })
        }
      />
      <Output
        name="sourceDate"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'sourceDate' })
        }
      />
      <Output
        name="subjectMatterRuleMeaning"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'subjectMatterRule' })
        }
      />
      <Output
        name="sourceProjectRemark"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'sourceProjectRemark' })
        }
        newLine
        colSpan={2}
      />
    </CollapseForm>
  );
});

export default BaseInfoCmp;
