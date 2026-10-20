/**
 * 模式头
 */
import React, { useCallback } from 'react';
import { Dropdown, Icon, Select } from 'choerodon-ui/pro';
import { Row, Col, Card } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import classnames from 'classnames';

import styles from '../index.less';

const PC_HEADER_QUERY_AREA = 'pcHeaderQueryArea';
const PC_HEADER_EDIT_AREA = 'pcHeaderEditArea';
const { Option } = Select;

export default function ModeHeader(props) {
  const {
    isEditMode,
    lookupData = [],
    pcHeaderEditArea,
    pcHeaderQueryArea,
    onUpdateEditText,
    compareInfo,
    compareList,
    onSetState,
    coordinateable,
    editable,
    createdTextFlag = false,
    remoteWorkDetail,
  } = props;

  const getMeaningFromValue = (val) => {
    return lookupData?.find((item) => item.value === val)?.meaning;
  };

  // 模式切换版本，更新对应模式数据
  const handleUpdateEditText = useCallback(
    (field, value) => {
      let params = {};
      // 对应模式版本发生变化
      if (field === PC_HEADER_EDIT_AREA && value !== pcHeaderEditArea) {
        params = {
          pcHeaderEditArea: value,
          pcHeaderQueryArea,
        };
      }

      if (field === PC_HEADER_QUERY_AREA && value !== pcHeaderQueryArea) {
        params = {
          pcHeaderQueryArea: value,
          pcHeaderEditArea,
        };
      }
      if (isEmpty(params)) {
        return;
      }
      onUpdateEditText(params);
    },
    [pcHeaderEditArea, pcHeaderQueryArea]
  );

  // 获取可切换版本选项
  const getMenu = (updateField) => {
    return (
      <div className={styles.modeHeaderMenu}>
        {lookupData.map((item) => {
          return (
            <div
              key={item.value}
              className={styles.menuItem}
              onClick={() => handleUpdateEditText(updateField, item.value)}
            >
              {updateField === PC_HEADER_QUERY_AREA
                ? intl.get('spcm.workspace.view.title.previewText').d('引用')
                : intl.get('spcm.workspace.view.title.refText').d('预览')}
              {item.meaning}
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染切换下拉菜单
  const renderDropdownMenu = (updateField) => {
    if (coordinateable || !editable) {
      return null;
    }
    return (
      <Dropdown overlay={getMenu(updateField)} placement="bottomRight">
        <div className={styles.dropdownMenu}>
          <span className={styles.menuTitle}>
            {updateField === PC_HEADER_QUERY_AREA
              ? intl.get('spcm.workspace.view.title.textPreview').d('文本预览')
              : intl.get('spcm.workspace.view.title.textCreate').d('文本创建')}
          </span>
          <Icon type="keyboard_arrow_down" />
        </div>
      </Dropdown>
    );
  };

  // 渲染头卡片
  const renderHeader = ({ title, subTitle, className, subTitleClassName, extra }) => {
    return (
      <Col span={24} className={className}>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={
            <>
              <div className={styles.title}>{title}</div>
              <div className={classnames([subTitleClassName, styles.subTitleWrapper])}>
                <span className={styles.subTitle}>{subTitle}</span>
              </div>
            </>
          }
          extra={extra || <></>}
        />
      </Col>
    );
  };

  const renderCompareHeader = ({ defaultValue, isLeft }) => {
    return (
      <Col span={12}>
        <Select className={styles.compareSelect} defaultValue={defaultValue}>
          {compareList.map((option) => (
            <Option
              onClick={() => {
                onSetState({
                  compareInfo: {
                    left: {
                      fileUrl: isLeft ? option.fileUrl : compareInfo?.left?.fileUrl,
                    },
                    right: {
                      fileUrl: isLeft ? compareInfo?.right?.fileUrl : option.fileUrl,
                    },
                  },
                });
              }}
              value={option.fileEditArea || '4'}
            >
              {option.fieldName}
            </Option>
          ))}
        </Select>
      </Col>
    );
  };

  const renderLeftHeader = () => {
    if (isEditMode) {
      const { handleCuxRenderHeader } = remoteWorkDetail?.props?.process ?? {};
      const renderProps = {
        title: createdTextFlag
          ? intl.get('spcm.workspace.view.title.updateArea').d('修改区域')
          : intl.get('spcm.common.view.title.contractFile').d('合同文本'),
        subTitle: getMeaningFromValue(pcHeaderEditArea),
        className: styles.leftContent,
        subTitleClassName: '',
        extra: renderDropdownMenu(PC_HEADER_EDIT_AREA),
      };
      if (handleCuxRenderHeader && typeof handleCuxRenderHeader === 'function') {
        return handleCuxRenderHeader(renderProps);
      }
      return renderHeader(renderProps);
    } else {
      return renderCompareHeader({
        defaultValue: pcHeaderEditArea,
        isLeft: true,
      });
    }
  };

  const renderRightHeader = () => {
    if (isEditMode) {
      return null;
    } else {
      return renderCompareHeader({
        defaultValue: pcHeaderQueryArea,
        isLeft: false,
      });
    }
  };

  return (
    <div>
      <Row className={styles.modeHeader}>
        {renderLeftHeader()}
        {renderRightHeader()}
      </Row>
    </div>
  );
}
