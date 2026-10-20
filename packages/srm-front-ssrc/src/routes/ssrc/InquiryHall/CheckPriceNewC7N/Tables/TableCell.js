/* eslint-disable no-unused-expressions */
/**
 * 单元格
 */
import React, { memo, Fragment } from 'react';
import { Row, Col, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop, isNil } from 'lodash';
import { getCurrentLanguage } from 'utils/utils';

import { computedCheckBoxIsChecked } from './helpers';

export default memo(
  observer((props) => {
    const {
      record,
      // shareDs,
      detailFlag,
      // itemTableRef,
      // scoreTableRef,
      dimensionCode,
      aggregationTree,
      headerGroup,
      // columnsChange,
      // columnExpandedALlStatus,
      handleClickColumnCell = noop,
      handleMouseEnterColumnCell = noop,
      handleMouseLeaveColumnCell = noop,
      handleChangeCellCheckBox = noop,
      rowGroup = {},
    } = props;
    const { index } = headerGroup;
    const showCheckBox = dimensionCode === 'ITEM' && !detailFlag;
    const { suggestedFlag, rankTeam, validDataFlag, validQuotationPrice } = record.get([
      'suggestedFlag',
      'rankTeam',
      'validDataFlag',
      'validQuotationPrice',
    ]);
    const { indeterminate, checked } = computedCheckBoxIsChecked({
      record,
      headerGroup,
      dimensionCode,
      type: 'cell',
    });

    const language = getCurrentLanguage();
    return (
      <Fragment>
        <Row
          className="table-cell-inner-content-wrap"
          style={isNil(validQuotationPrice) ? { display: 'none' } : {}}
          data-index={rowGroup?.expandedRecords[index]?.id}
        >
          <Col className="CheckBox">
            {!!showCheckBox && (
              <CheckBox
                indeterminate={indeterminate}
                checked={validDataFlag === 0 ? false : checked}
                disabled={!!rankTeam || validDataFlag === 0}
                onChange={(value) => handleChangeCellCheckBox({ value, record, dimensionCode })}
              />
            )}
          </Col>

          {/* 左侧 - 聚合字段 */}
          <Col
            onClick={(e) => handleClickColumnCell({ index: index + 1, record, headerGroup }, e)}
            onMouseEnter={() => handleMouseEnterColumnCell(record)}
            onMouseLeave={() => handleMouseLeaveColumnCell(record)}
            className={
              suggestedFlag
                ? language === 'zh_CN'
                  ? 'table-cell-inner-seal-icon-ch'
                  : 'table-cell-inner-seal-icon-en'
                : 'table-cell-inner-cell'
            }
          >
            {aggregationTree[0]}
          </Col>
        </Row>
      </Fragment>
    );
  })
);
