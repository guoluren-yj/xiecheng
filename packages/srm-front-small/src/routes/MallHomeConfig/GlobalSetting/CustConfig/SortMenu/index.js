import React, { useState, useEffect, useMemo } from 'react';
import { compose, isEmpty } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { Icon, Row, Col } from 'choerodon-ui/pro';
import { DraggableArea } from 'react-draggable-tags';

import intl from 'utils/intl';
import classNames from 'classnames';
import { getCurrentOrganizationId } from 'utils/utils'; // 租户ID
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const iconMapping = {
  0: 'looks_one-o',
  1: 'looks_two-o',
  2: 'looks_3-o',
  3: 'looks_4-o',
  4: 'looks_5-o',
  5: 'looks_6-o',
};

function SortMenu({ dataSet, mallHome: { sortData = {} } }) {
  const [list, setList] = useState([]);
  const [top, setTop] = useState([]);
  const [bottom, setBottom] = useState([]);

  const hiddenList = useMemo(() => {
    return list?.filter((p) => p.tag === '-1') || [];
  }, [list]);

  useEffect(() => {
    setTop(list?.filter((p) => p.tag !== '-1' && p.enabledFlag === 1) || []);
    // setBottom(list?.filter((p) => p.tag !== '-1' && p.enabledFlag !== 1) || []);
  }, [list]);

  useEffect(() => {
    dataSet.current.set(
      'productQuickLinkConfigList',
      [...top, ...bottom?.map((p) => ({ ...p, enabledFlag: 0 })), ...hiddenList]?.map(
        (p, index) => ({
          ...p,
          orderSeq: index + 1,
          configType: 'QUICK_LINK',
        })
      )
    );
  }, [top, bottom, hiddenList]);

  useEffect(() => {
    if (sortData?.quickLinkFlag) {
      // 配置过
      setList(
        sortData?.productQuickLinkConfigList?.map((p) => ({
          ...p,
          enabledFlag: p.tag !== '-1' ? p.enabledFlag : 0,
          id: uuid(),
        }))
      );
      const newBottom = (
        sortData?.quickLinkList?.filter(
          (p) =>
            p.tag !== '-1' &&
            !sortData?.productQuickLinkConfigList?.some((s) => s.searchType === p.value)
        ) || []
      )?.map((p) => {
        return {
          ...p,
          configType: 'QUICK_LINK',
          enabledFlag: p.tag !== '-1' ? 1 : 0,
          searchType: p.value,
          tenantId: organizationId,
          id: uuid(),
        };
      });
      setBottom(newBottom);
    } else {
      // 没配置过
      setList(
        sortData?.quickLinkList?.map((p) => {
          return {
            ...p,
            configType: 'QUICK_LINK',
            enabledFlag: p.tag !== '-1' ? 1 : 0,
            searchType: p.value,
            tenantId: organizationId,
            id: uuid(),
          };
        })
      );
    }
  }, [sortData]);

  function getValueMeaning(value) {
    return sortData?.quickLinkList?.find((p) => p.value === value)?.meaning;
  }
  const RenderItem = ({
    renderList = [],
    item = {},
    index = 0,
    disabled,
    handleClick = (e) => e,
  }) => {
    return (
      <div
        className="sort-search-content-item"
        style={{
          marginRight: index === 2 || index === 5 ? 0 : 16,
          marginBottom:
            (renderList.length > 3 && index < 3) || (!isEmpty(bottom) && !disabled) ? 16 : 0,
        }}
      >
        <span className={classNames(["sort-search-content-item-icon", {"sort-search-content-item-icon-disabled": !(!disabled && item.enabledFlag === 1)}])}>
          <Icon
            type="baseline-drag_indicator"
            // style={{ color: !disabled && item.enabledFlag === 1 ? '#000' : 'rgba(0,0,0,0.25)' }}
          />
        </span>
        <div
          onClick={handleClick}
          className={classNames([
            'sort-search-content-item-name',
            { active: !disabled && item.enabledFlag === 1 },
          ])}
        >
          {!disabled && item.enabledFlag === 1 ? (
            <Icon className="sort-search-content-item-name-icon" type={iconMapping[index]} />
          ) : (
            <Icon
              className="sort-search-content-item-name-icon empty-icon"
              type="check_box_outline_blank"
            />
          )}
          {getValueMeaning(item.searchType)}
        </div>
      </div>
    );
  };
  return (
    <div className={styles['sort-search-content']}>
      <DraggableArea
        tags={top || []}
        render={({ tag, index }) => (
          <div>
            {RenderItem({
              renderList: top,
              item: tag,
              index,
              handleClick: () => {
                const newTopList = [...top].filter((p) => p.searchType !== tag.searchType);
                const current = [...top].find((p) => p.searchType === tag.searchType);
                setTop(newTopList);
                setBottom([...bottom, current]);
              },
            })}
          </div>
        )}
        onChange={(tags) => setTop(tags)}
      />
      {!isEmpty(bottom) && (
        <p className="hidden-area-line">
          <span>{intl.get('small.mallHomeConfig.view.common.hiddenArea').d('隐藏区域')}</span>
        </p>
      )}
      <Row style={{ width: 685 }}>
        {bottom?.map((item, index) => {
          return (
            <Col span={8}>
              {RenderItem({
                renderList: bottom,
                item,
                index,
                disabled: true,
                handleClick: () => {
                  const newBottom = [...bottom].filter((p) => p.searchType !== item.searchType);
                  const current = [...bottom].find((p) => p.searchType === item.searchType);
                  setBottom(newBottom);
                  setTop([...top, current]);
                },
              })}
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(SortMenu);
