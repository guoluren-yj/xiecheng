/*
 * ReferenceReviewPoint - 引用审查点弹窗
 * @date: 2025/03/14 15:12:06
 * @author: CDJ
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React from 'react';

import SearchBarTable from '_components/SearchBarTable';
import { yesOrNoRender } from 'utils/renderer';

import { getUnitCodes } from '../utils/utils';

const Index = ({
  customizeTable,
  dataSet,
}) => {

  const getColumns = () => {
    const columns = [
      {
        name: 'reviewCode',
        width: 180,
      },
      {
        name: 'reviewName',
        width: 200,
      },
      {
        name: 'routeNameMeaning',
        width: 180,
      },
      {
        name: 'routeUrl',
        width: 180,
      },
      {
        name: 'riskTypeMeaning',
        width: 160,
      },
      {
        name: 'riskLevelMeaning',
        width: 160,
      },
      {
        name: 'validationTypeMeaning',
        width: 120,
      },
      {
        name: 'ignoreReasonFlag',
        width: 140,
        renderer: ({ value }) => {
          return yesOrNoRender(Number(value) || 0);
        },
      },
      {
        name: 'riskDescription',
        width: 160,
      },
      {
        name: 'resolution',
        width: 160,
      },
      {
        name: 'ruleDescription',
        width: 160,
      },
      {
        name: 'ruleSourceMeaning',
        width: 160,
      },
      {
        name: 'customCopyFlag',
        width: 120,
        renderer: ({ value }) => {
          return yesOrNoRender(Number(value) || 0);
        },
      },
      {
        name: 'copyReviewCode',
        width: 180,
      },
      {
        name: 'reviewTypeMeaning',
        width: 140,
      },
    ].filter(i => !i.hidden);

    return columns;
  };

  return (
    <div style={{ height: `calc(100vh - 209px)` }}>
      {customizeTable(
        {
          code: getUnitCodes.lineCreateListCode,
        },
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={getColumns()}
          searchCode={getUnitCodes.lineCreateSearchCode}
          style={{ maxHeight: '100%' }}
          searchBarConfig={{
            closeFilterSelector: true,
            expandable: false,
          }}
        />
      )}
    </div>
  );
};

export default Index;
