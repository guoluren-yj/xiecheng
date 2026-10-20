import React, { useCallback, useRef } from 'react';
import { Select, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
// import useDataSetEvents from '@/routes/hooks/useDataSetEvents';

function SelectContent(props) {
  const { dataSet, customizeTable, customizeCode } = props || {};
  const expertColumns = [
    {
      name: 'loginName',
      width: 90,
    },
    {
      name: 'expertName',
      width: 80,
    },
    {
      name: 'expertWeight',
      width: 90,
      editor: true,
    },
  ];

  return customizeTable(
    {
      code: customizeCode,
    },
    <Table
      virtual
      virtualCell
      dataSet={dataSet}
      columns={expertColumns}
      style={{ maxHeight: '220px' }}
    />
  );
}

export default observer(function AssignExperts(params) {
  const { customizeTable, customizeCode, fieldName, commonProps, record: elementRecord } =
    params || {};

  const selectRef = useRef();

  const optionsDs = elementRecord.getField(fieldName).options;

  const renderPopupContent = useCallback(
    () => (
      <div style={{ width: selectRef.current?.wrapper?.offsetWidth }}>
        <SelectContent
          dataSet={optionsDs}
          customizeTable={customizeTable}
          customizeCode={customizeCode}
        />
      </div>
    ),
    [customizeTable, customizeCode]
  );

  const handlePopupHiddenChange = useCallback(
    (hidden) => {
      if (!hidden) {
        optionsDs.setState('elementRecord', elementRecord);
        optionsDs.setQueryParameter('commonProps', commonProps);
        optionsDs.query();
      } else {
        const optionData = optionsDs.toData();
        elementRecord.set('assignedExpertList', optionData);
        optionsDs.loadData([]);
      }
      elementRecord.setState('assignExpertsShow', !hidden);
    },
    [optionsDs, commonProps, elementRecord]
  );

  const renderer = useCallback(
    ({ record, value }) => {
      const regular = /(-undefined%)|(-null%)/g;
      // 过程控制页面 有标红逻辑处理 新增或者更改专家权重标红
      if (customizeCode.includes('QUOTATION_CONTROLLER_DETAIL')) {
        const sourceAssignedExperts =
          (record.get('sourceEvaluateIndic') || {}).assignedExperts || [];
        const sourceAssignedExpertsKeys =
          sourceAssignedExperts.map((i) => i.evaluateExpertId) || [];
        if (sourceAssignedExpertsKeys.includes(value?.evaluateExpertId)) {
          const source = sourceAssignedExperts.find(
            (i) => i.evaluateExpertId === value?.evaluateExpertId
          );
          if (
            // eslint-disable-next-line eqeqeq
            source?.expertWeight != value?.expertWeight
          ) {
            return (
              <span style={{ color: '#f56349' }}>
                {`${value?.expertName}-${value?.expertWeight}%`.replace(regular, '')}
              </span>
            );
          } else {
            return `${value?.expertName}-${value?.expertWeight}%`.replace(regular, '');
          }
        }
        return (
          <span style={{ color: '#f56349' }}>
            {`${value?.expertName}-${value?.expertWeight}%`.replace(regular, '')}
          </span>
        );
      }
      return `${value?.expertName}-${value?.expertWeight}%`.replace(regular, '');
    },
    [customizeCode]
  );

  return (
    <Select
      multiple
      noCache
      name={fieldName}
      record={elementRecord}
      popupContent={renderPopupContent}
      onPopupHiddenChange={handlePopupHiddenChange}
      style={{ width: '100%' }}
      ref={selectRef}
      renderer={renderer}
    />
  );
});
