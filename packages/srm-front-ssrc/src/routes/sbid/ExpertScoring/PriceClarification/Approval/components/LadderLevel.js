import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Table, Form, Output } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import intl from 'utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';

const LadderLevel = (props) => {
  const {
    recordData = {},
    ladderLevelModalDS,
    doubleUnitFlag = false,
    getCustomizeUnitCode = noop,
    customizeTable = noop,
  } = props;

  const columns = useMemo(
    () =>
      [
        {
          name: 'rfxLadderLineNum',
          width: 100,
        },
        doubleUnitFlag
          ? {
              name: 'secondaryLadderFrom',
              width: 100,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        doubleUnitFlag
          ? {
              width: 100,
              name: 'secondaryLadderTo',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        {
          name: 'ladderFrom',
          width: 100,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          width: 100,
          name: 'ladderTo',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        doubleUnitFlag
          ? {
              name: 'validLadderSecPrice',
              width: 100,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,

        doubleUnitFlag
          ? {
              name: 'validNetLadderSecPrice',
              width: 100,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        {
          width: 100,
          name: 'validLadderPrice',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          width: 120,
          name: 'validNetLadderPrice',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'remark',
        },
      ].filter(Boolean),
    [doubleUnitFlag]
  );

  // 渲染头
  const renderHeader = () => {
    const { itemCode, itemName } = recordData || {};
    return (
      <Form columns={2}>
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
          value={itemCode}
        />
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
          value={itemName}
        />
      </Form>
    );
  };

  return (
    <React.Fragment>
      {renderHeader()}
      {customizeTable(
        {
          code: getCustomizeUnitCode('ladderLevel'),
          dataSet: ladderLevelModalDS,
        },
        <Table dataSet={ladderLevelModalDS} columns={columns} />
      )}
    </React.Fragment>
  );
};

export default observer(LadderLevel);
