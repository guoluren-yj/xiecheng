import React, { Fragment, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { isFunction } from 'lodash';
import { Form as HForm, Input, Tag, Tooltip } from 'choerodon-ui';
import classNames from 'classnames';
import {
  Button,
  TextField,
  Form,
  Select,
  Lov,
  Row,
  Col,
  Dropdown,
  Menu,
  Icon,
  DateTimePicker,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import ExcelExportPro from 'components/ExcelExportPro';
import ExcelExport from 'components/ExcelExport';
import { Button as PermissionButton } from 'components/Permission';
import c7nModal from '@/utils/c7nModal';
import listCellRender from '@/routes/renderTools/listCellRender';
import LabelPreview, { AutoLabel, LinkLabel } from '../ProductLabelManage/LabelPreview';
import { getFilterFields } from './ds';
// eslint-disable-next-line import/no-duplicates
import styles from './index.less';
// eslint-disable-next-line import/no-duplicates
import './index.less';

const ObserverBtn = observer(
  ({
    dataSet,
    text,
    permission,
    className,
    isHeadButton = true,
    getText = () => '',
    getLoading,
    isExport, // 导出必传
    queryParams, // 导出必传
    getDisable = () => false,
    getTooltip = () => null,
    ...btnProps
  }) => {
    const disabled = dataSet
      ? btnProps.disabled || getDisable(dataSet.selected)
      : btnProps.disabled;
    const tooltip = getTooltip(dataSet);
    const loading = getLoading ? btnProps.loading || getLoading(dataSet) : btnProps.loading;
    const ButtonRef = permission ? PermissionButton : Button;
    return isExport ? (
      <ExcelExportPro
        {...btnProps}
        buttonText={
          dataSet?.selected?.length > 0
            ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出(新)')
            : intl.get('smpc.product.button.batchExportNew').d('(新)批量导出')
        }
        queryParams={() => queryParams(dataSet)}
      />
    ) : (
      <Tooltip title={typeof tooltip === 'string' ? tooltip : null}>
        <ButtonRef
          type="c7n-pro"
          {...btnProps}
          disabled={disabled}
          loading={loading}
          className={classNames({
            [className || '']: true,
            [styles['weight-head-btn']]: isHeadButton,
          })}
        >
          {getText() || text}
        </ButtonRef>
      </Tooltip>
    );
  }
);

export const MenuItemBtn = ({ btnComp, ...btnProps }) => {
  const BtnComp = btnComp || ObserverBtn;
  return (
    <div className={styles['workbench-btn-wrapper']}>
      <BtnComp {...btnProps} funcType="flat" isHeadButton={false} />
    </div>
  );
};

export const MenuItemLinkBtn = ({ btnComp, style, ...btnProps }) => {
  const BtnComp = btnComp || ObserverBtn;
  return (
    <div className="drop-down-import-btn-wrapper" style={style}>
      <BtnComp {...btnProps} isHeadButton={false} />
    </div>
  );
};

export const OverlayMenuItemBtn = ({ dataSet, getChildRef, ...btnProps }) => {
  const refCom = getChildRef && isFunction(getChildRef) && getChildRef(dataSet);
  const BtnComp = refCom ? () => refCom : ObserverBtn;
  return (
    <div className={styles['workbench-btn-wrapper']}>
      <BtnComp
        {...btnProps}
        funcType="flat"
        isHeadButton={false}
        dataSet={dataSet}
        className={styles['primary-color-btn']}
      />
    </div>
  );
};

const DropdownBtn = ({ text, primary, color, permission, hiddenIcon, newVersion, ...props }) => {
  const forceClass = primary ? styles['primary-head-btn'] : styles['drop-head-btn'];
  const ButtonRef = permission ? PermissionButton : Button;
  return (
    <ButtonRef
      type="c7n-pro"
      className={classNames({ [forceClass]: true, [styles['new-version-btn']]: newVersion })}
      icon="add"
      color={color}
      {...props}
    >
      {text}
      {!hiddenIcon && (
        <Icon
          type="expand_more"
          style={{
            marginLeft: 4,
            marginTop: -2,
            fontSize: '16px',
          }}
        />
      )}
      {/* {newVersion && <span className={styles['new-version-tag']}>NEW</span>} */}
    </ButtonRef>
  );
};

const DropdownBtns = ({ children, menus, width = 160, placement = 'right' }) => {
  const overlay = menus
    .filter((f) => f.show !== false)
    .map((m) => {
      const {
        text,
        color,
        dataSet,
        childRef,
        permission,
        permissionList,
        disabled = false,
        loading = false,
        event = (e) => e,
        getText = (e) => e,
        getLoading = () => false,
        getDisable = () => false,
        getChildRef = () => false,
      } = m;
      const btnProps = {
        color,
        loading,
        disabled,
        onClick: event,
        funcType: 'flat',
        style: {
          width: '100%',
          textAlign: 'left',
          marginLeft: 0,
          paddingLeft: 20,
          whiteSpace: 'nowrap',
        },
      };

      const defaultRef = dataSet ? (
        <ObserverBtn
          text={text}
          dataSet={dataSet}
          getText={getText}
          isHeadButton={false}
          getLoading={getLoading}
          getDisable={getDisable}
          permission={permission}
          permissionList={permissionList}
          {...btnProps}
        />
      ) : (
        <Button {...btnProps}>{text}</Button>
      );
      return getChildRef(dataSet) || childRef || defaultRef;
    });
  const position = placement === 'right' ? 'bottomRight' : 'bottomLeft';
  return (
    <Dropdown
      placement={position}
      overlay={() => (
        <Menu className={styles['btn-list-content']} style={{ minWidth: width }}>
          {overlay}
        </Menu>
      )}
    >
      {children}
    </Dropdown>
  );
};

const DropdownMenus = ({ children, menus, ...dropProps }) => {
  const overlay = (
    <Menu>
      {menus.map((m) => {
        const { text, event = (e) => e } = m;
        const menuProps = {
          key: text,
          onClick: event,
          style: { width: 120, paddingLeft: 20 },
        };
        return <Menu.Item {...menuProps}>{text}</Menu.Item>;
      })}
    </Menu>
  );
  return (
    <Dropdown overlay={overlay} {...dropProps}>
      {children}
    </Dropdown>
  );
};

function getFormField(fields = []) {
  return fields
    .filter((f) => !f.bind)
    .map((m) => {
      const { name, lovCode, lookupCode, type } = m;
      let FormField = TextField;
      if (lovCode) {
        FormField = Lov;
      } else if (lookupCode) {
        FormField = Select;
      } else if (type === 'dateTime') {
        FormField = DateTimePicker;
      } else {
        FormField = TextField;
      }
      return <FormField name={name} />;
    });
}

let queryModal;

const QueryForm = (props) => {
  const { dataSet, isSup, filterStatus, skuType = 'CATA', extra, onSearch = (e) => e } = props;

  function handleAdvance() {
    const filterFields = [
      { name: 'shelfFlag', show: filterStatus === '1' && skuType === 'CATA' }, // 自有商品池的全部
      { name: 'supplier', show: !isSup }, // 采
      { name: 'publisher', show: skuType === 'CATA' }, // 自有商品池
      { name: 'shelfDate', show: ['3', '4'].includes(filterStatus) }, // 已上架
      { name: 'shelfStatus', show: filterStatus === '4' }, // 待上架
    ]
      .filter((f) => f.show === false)
      .map((m) => m.name);
    queryModal = c7nModal({
      style: { width: 380 },
      title: intl.get('smpc.workbench.view.advanceQuery').d('高级查询'),
      footer: (
        <Fragment>
          <Button
            onClick={() => {
              queryModal.close();
            }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            onClick={() => {
              dataSet.current.reset();
            }}
          >
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button
            onClick={() => {
              onSearch();
              queryModal.close();
            }}
            color="primary"
          >
            {intl.get('hzero.common.button.query').d('查询')}
          </Button>
        </Fragment>
      ),
      children: (
        <Form dataSet={dataSet} labelLayout="float">
          {getFormField(getFilterFields(filterFields))}
        </Form>
      ),
    });
  }

  return (
    <div className="workbench-col-container">
      <div className="workbench-query-form">
        <TextField
          dataSet={dataSet}
          name="skuName"
          style={{ width: 280 }}
          placeholder={intl.get('smpc.workbench.model.codeOrNameQuery').d('输入编码或名称查询')}
          suffix={<Icon type="search" onClick={onSearch} />}
          onInput={(e) => {
            const val = e.target.value || undefined;
            dataSet.current.set('skuName', val);
          }}
          onEnterDown={onSearch}
        />
        <span className="divide-line" />
        <Button onClick={handleAdvance}>
          {intl.get('smpc.workbench.view.advanceQuery').d('高级查询')}
        </Button>
      </div>
      {extra}
    </div>
  );
};

const FilterBar = observer((props) => {
  const { filterStatus, onChangeStatus = (e) => e, tableDataSet, statusList = [], extra } = props;
  const [activeInd, setInd] = useState(0);
  const count = tableDataSet.totalCount;

  const statusMeaning = {
    1: intl.get('smpc.workbench.view.all').d('全部'),
    2: intl.get('smpc.workbench.view.waitSubmit').d('待提交'),
    3: intl.get('smpc.workbench.view.shelf').d('已上架'),
    4: intl.get('smpc.workbench.view.unshelf').d('待上架'),
    5: intl.get('smpc.workbench.view.waitApprove').d('待审批'),
  };

  function handleFilterStatus(_status, ind) {
    onChangeStatus(_status);
    setInd(ind);
  }

  return (
    <div className="workbench-col-container">
      <div className="workbench-filter-bar">
        {statusList.map((m, ind) => {
          const active = filterStatus === m.value;
          const divide = activeInd - 1 !== ind;
          const meaning = statusMeaning[m.value];
          return (
            <span
              className={`status-tag ${active ? 'status-active' : ''} ${
                divide ? 'status-divide' : ''
              }`}
              key={m.value}
              onClick={() => handleFilterStatus(m.value, ind)}
            >
              {active ? `${meaning} ${count}` : meaning}
            </span>
          );
        })}
      </div>
      {extra}
    </div>
  );
});

const ViewFilter = (props) => {
  const { aggregation, onAggregationChange = (e) => e } = props;
  return (
    <div className="workbench-view-filter">
      <Tooltip title={intl.get('smpc.product.view.flatTableView').d('平铺表视图')}>
        <span
          className={`${!aggregation ? 'view-active' : ''}`}
          onClick={() => onAggregationChange(false)}
        >
          <Icon type="view_headline" />
        </span>
      </Tooltip>
      <Tooltip title={intl.get('smpc.product.view.aggregateTableView').d('聚合表视图')}>
        <span
          className={`${aggregation ? 'view-active' : ''}`}
          onClick={() => onAggregationChange(true)}
        >
          <Icon type="view_day" />
        </span>
      </Tooltip>
    </div>
  );
};

const LabelContainer = observer((props) => {
  const {
    labels,
    record, // 必传
    isLimit = true,
    limitLine = 4,
    lineCount = 1,
    aggregation = true,
    labelWidth,
    type = 'tag',
  } = props;
  const isLabelExpand = record.getState('isLabelExpand');
  const labelList = labels || [];
  const maxCount = limitLine * lineCount;
  const maxLength = !isLimit || isLabelExpand ? labelList.length : maxCount;
  const colSpan = 24 / lineCount;
  const showLabels = labelList.slice(0, maxLength);
  const LabelCom = type === 'link' ? LinkLabel : AutoLabel;
  if (!labelList.length) {
    return '-';
  }
  if (!aggregation) {
    return labelList.map((m) => (
      <LabelCom
        code={m.labelColorCode}
        value={m.labelName}
        tooltip={false}
        onClick={m.onClick}
        wrapperStyle={{ display: 'inline-block', paddingRight: type === 'link' ? 5 : 0 }}
      />
    ));
  }
  const defaultLabel = (
    <Row gutter={2}>
      {showLabels.map((l) => (
        <Col span={colSpan}>
          <LabelPreview code={l.labelColorCode} value={l.labelName} />
        </Col>
      ))}
    </Row>
  );

  const autoLabel = showLabels.map((m) => (
    <LabelCom code={m.labelColorCode} value={m.labelName} onClick={m.onClick} key={m.labelId} />
  ));
  return (
    <div>
      {labelWidth === 'auto' ? autoLabel : defaultLabel}
      {isLimit && labelList.length > maxCount && (
        <div>
          <a
            onClick={() => {
              record.setState('isLabelExpand', !isLabelExpand);
            }}
          >
            {isLabelExpand
              ? intl.get('smpc.product.button.collapse').d('收起')
              : intl.get('smpc.product.button.expand').d('展开')}
            <Icon
              type={isLabelExpand ? 'expand_less' : 'expand_more'}
              style={{ marginTop: -4, fontSize: '16px' }}
            />
          </a>
        </div>
      )}
    </div>
  );
});

function Remark(props) {
  const {
    modal,
    name,
    initialValue,
    requireMsg,
    labelMsg,
    maxLength,
    onOk = (e) => e,
    form: { getFieldDecorator, validateFields },
  } = props;

  useEffect(() => {
    modal.handleOk(() => {
      let flag = false;
      let data = {};
      validateFields((err, values) => {
        if (!err) {
          flag = true;
          data = values;
        }
      });
      if (flag) {
        return onOk(data);
      } else {
        return false;
      }
    });
  }, []);

  return (
    <HForm>
      <HForm.Item>
        {getFieldDecorator(name, {
          initialValue,
          rules: [
            {
              required: true,
              message: requireMsg,
            },
          ],
        })(<Input.TextArea rows={4} maxLength={maxLength} placeholder={labelMsg} />)}
      </HForm.Item>
    </HForm>
  );
}

const FormRemark = HForm.create()(Remark);

const ExportButton = observer(
  ({
    dataSet,
    headBtn,
    requestUrl,
    buttonText,
    exportAsync, // icon,
    permission,
    permissionList,
    otherButtonProps = {},
    getQueryParams = () => ({}),
  }) => {
    // const exportId = headBtn ? styles['c7n-head-export'] : styles['c7n-export'];
    return (
      <ExcelExport
        exportAsync={exportAsync}
        queryParams={() => {
          const queryParams = getQueryParams(dataSet);
          return filterNullValueObject(queryParams);
        }}
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          funcType: 'flat',
          className: headBtn ? styles['weight-head-btn'] : '',
          permissionList: permission ? permissionList : undefined,
          ...otherButtonProps,
        }}
        buttonText={buttonText}
        requestUrl={requestUrl}
      />
    );
  }
);

const UnitLine = (props) => {
  const { children, title, style = {} } = props;
  return (
    <span className={styles['unit-line']} style={style} title={title}>
      {children}
    </span>
  );
};

const StatusTag = (props) => {
  const { fontColor, bgColor, text, message, tip, aggregation, iconType = 'help' } = props;
  return (
    <>
      <Tag color={bgColor} style={{ color: fontColor, fontWeight: 700 }}>
        {text}
        {message && !aggregation && (
          <Tooltip title={message} placement="top">
            <Icon
              type={iconType}
              style={{
                fontSize: '14px',
                marginBottom: 4,
                marginLeft: 6,
                fontWeight: 'normal',
                color: fontColor || 'rgba(0, 0, 0, 0.65)',
              }}
            />
          </Tooltip>
        )}
        {tip && (
          <Tooltip title={tip} placement="top">
            <Icon
              type="sync"
              style={{
                fontSize: '14px',
                marginBottom: 4,
                marginLeft: 6,
                fontWeight: 'normal',
                color: fontColor,
              }}
            />
          </Tooltip>
        )}
      </Tag>
      {message &&
        aggregation &&
        listCellRender(
          [
            {
              name: 'message',
              labelMinWidth: 24,
              label: intl.get('smpc.product.model.tag.help').d('提示'),
            },
          ],
          { message }
        )}
    </>
  );
};

const ObserverStatus = observer(({ dataSet, statusMeaning, className, onClick = (e) => e }) => {
  const count = dataSet.totalCount > 99 ? '99+' : dataSet.totalCount;

  return (
    <span className={className} onClick={onClick}>
      {`${statusMeaning} `}
      <span className="data-count">{count}</span>
    </span>
  );
});

const OptionList = ({ actions, type = 'ver', maxLength = 4 }) => {
  const filterActions = actions.filter((f) => {
    const { show = true } = f;
    return show;
  });
  const viewActions =
    filterActions.length > maxLength ? filterActions.slice(0, maxLength - 1) : filterActions;
  const menuActions = filterActions.slice(maxLength - 1, filterActions.length);
  return (
    <div className={type === 'hor' ? styles['action-link-hor'] : styles['action-link-ver']}>
      {viewActions.map((m) => {
        const { text, disabled, event = (e) => e } = m;
        return (
          <a disabled={disabled} onClick={event}>
            {text}
          </a>
        );
      })}
      {filterActions.length > maxLength && (
        <DropdownMenus menus={menuActions} placement="bottomLeft">
          <a>
            {intl.get('hzero.common.button.expand').d('展开')}
            <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginBottom: 2 }} />
          </a>
        </DropdownMenus>
      )}
    </div>
  );
};

export {
  DropdownBtn,
  DropdownBtns,
  DropdownMenus,
  QueryForm,
  FilterBar,
  LabelContainer,
  ObserverBtn,
  FormRemark,
  ExportButton,
  ViewFilter,
  UnitLine,
  StatusTag,
  ObserverStatus,
  OptionList,
};
