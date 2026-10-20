/**
 * 通用helper
 * @date: 2021-01-27
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { Rate, Icon, Popover, Steps, Tag, Text } from 'choerodon-ui';
import { Button, Dropdown, Attachment, Tooltip } from 'choerodon-ui/pro';
import { noop, isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import intl from 'utils/intl';

import MultiLineField from './Components/MultiLineField';
import MultiLinePopover from './Components/MultiLinePopover';
import styles from './index.less';

const promptCode = 'ssrc.projectSetup';

const { Step } = Steps;

/**
 * 渲染状态tag
 */
const renderStatusTag = (status, meaning) => {
  // let fontColor;
  // switch (status) {
  //   case 'NEW':
  //     fontColor = '#0094EE';
  //     break;
  //   case 'FINISHED':
  //     fontColor = '#0DAF73';
  //     break;
  //   default:
  //     return <span style={{ color: fontColor, fontWeight: 'bold' }}>{meaning}</span>;
  // }
  return <span>{meaning}</span>;
};

/**
 * 寻源项目工作台专用状态tag
 */
const renderProjectSetupStatusTag = (status, record) => {
  const { closedStatus, closedStatusMeaning, sourceProjectStatusMeaning } =
    record?.get(['closedStatus', 'closedStatusMeaning', 'sourceProjectStatusMeaning']) || {};

  const colorMap = new Map([
    /** 一级状态 */
    ['NEW', 'yellow'], // 新建
    ['CANCEL', 'gray'], // 已取消
    ['APPROVING', 'yellow'], // 审批中
    ['REFUSE', 'red'], // 审批拒绝
    ['APPROVED', 'yellow'], // 待寻源
    ['CHANGING', 'yellow'], // 变更中
    ['CHANGE_APPROVING', 'yellow'], // 变更审批中
    ['SOURCING', 'yellow'], // 寻源中
    ['FINISHED', 'green'], // 完成
    ['CHANGE_REFUSE', 'red'], // 变更审批拒绝

    /** 二级关闭状态 */
    ['CLOSE_APPROVING', 'yellow'], // 关闭审批中
    ['CLOSE_REFUSE', 'red'], // 关闭审批拒绝
  ]);
  // 一级状态为【待寻源】/【变更审批拒绝】时 才展示二级状态
  const statusFlag = status && ['APPROVED'].includes(status);
  // closedStatus=CLOSED 已关闭显示主状态，不显示二级状态
  const closeFlag = closedStatus && ['CLOSE_APPROVING', 'CLOSE_REFUSE'].includes(closedStatus);
  return (
    <>
      <div>
        <Tag color={colorMap.get(status) || 'yellow'} border={false}>
          {sourceProjectStatusMeaning}
        </Tag>
      </div>
      { closeFlag && statusFlag && (
        <div>
          <Tag color={colorMap.get(closedStatus) || 'yellow'} border={false}>
            {closedStatusMeaning}
          </Tag>
        </div>
      )}
    </>
  );
};

/**
 * 渲染star
 * @param {number} vaule - 星星个数
 */
const renderRateStar = (value) => {
  return (
    <Rate
      disabled
      allowHalf
      style={{ color: '#47B883' }}
      count={6}
      value={value}
      character={<Icon type="star_border" />}
      className={styles['rate-container']}
    />
  );
};

/**
 * 渲染项目信息列
 */
const renderSourceProjectField = (record, handleFuncMap) => {
  return (
    <MultiLineField
      multiLineConfigs={[
        {
          name: 'sourceProjectNum',
          valueCustStyle: {
            color: '#29BECE',
            cursor: 'pointer',
          },
          handleFunc: handleFuncMap.sourceProjectNum,
        },
        {
          name: 'sourceProjectName',
        },
        {
          name: 'sourceCategoryMeaning',
        },
        {
          name: 'sourceMethodMeaning',
        },
      ]}
      record={record}
    />
  );
};

/**
 * 渲染组织信息列
 */
const renderCompanyField = (record) => {
  return (
    <MultiLineField
      multiLineConfigs={[
        {
          name: 'companyName',
          label: intl.get(`${promptCode}.model.projectSetup.companyName`).d('公司'),
        },
      ]}
      record={record}
    />
  );
};

/**
 * 渲染创建信息列
 */
const renderCreationField = (record) => {
  return (
    <MultiLineField
      multiLineConfigs={[
        {
          name: 'creationDate',
        },
        {
          name: 'createdByName',
        },
        {
          name: 'createUnitName',
        },
      ]}
      record={record}
    />
  );
};

/**
 * 执行情况-关闭信息
 * @param {*} record
 */
const renderCloseFieldInfo = (record) => {
  const title = `${intl
    .get(`ssrc.inquiryHall.view.message.close.inquiryListReason`)
    .d('关闭理由')} ${record.get('closedComments') ?? ''}`;
  return (
    <>
      <Tooltip title={title}>
        <Text tooltip={false}>{title}</Text>
      </Tooltip>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>{intl.get(`ssrc.inquiryHall.view.message.close.attachment`).d('关闭附件')}</span>
        <Attachment
          viewMode="popup"
          value={record.get('closedAttachmentUuid')}
          bucketName={PRIVATE_BUCKET}
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
        />
      </div>
    </>
  );
};

/**
 * 渲染执行情况
 * @param {!Object} record - 行记录
 */
const renderImplementationField = (record = {}, flag = false, remote) => {
  const { dataSet } = record;
  const sourceProjectStatus = record.get('sourceProjectStatus');
  const simpleApprovalHistoryData = dataSet?.getState('simpleApprovalHistoryData') || {};
  switch (sourceProjectStatus) {
    case 'APPROVED':
      {
        const approved = `${intl
          .get(`${promptCode}.view.message.projectRemark`)
          .d('项目说明')} ${record.get('sourceProjectRemark') || '-'}`;
        const remoteApproved = remote
          ? remote.process('SSRC_PROJECT_SETUP_NEW_PROCESS_IMPLEMENTATION_APPROVED', approved, {
              flag,
              record,
              renderSectionInfo,
              rendeSectionrNoneInfo,
            })
          : approved;
        return remoteApproved;
      }
    case 'REFUSE': // 审批拒绝
      return `${intl.get(`${promptCode}.view.message.refusedReason`).d('拒绝理由')} ${record.get(
        'approvalComments'
      ) || '-'}`;
    case 'SOURCING': // 寻源中
      if (record.get('subjectMatterRule') === 'NONE') {
        return rendeSectionrNoneInfo(record, flag);
      } else {
        return renderSectionInfo(record, flag);
      }
    case 'APPROVING': // 审批中
    case 'CHANGE_APPROVING': // 变更审批中
      return <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('businessKey')]} />;
    default:
      return record.get('sourceProjectRemark');
  }
};

/**
 * 渲染工作流执行情况
 */
const renderWorkFlowInfo = (record, flag = false) => {
  return (
    <MultiLinePopover
      lineConfig={{
        labelName: 'employeeName',
        valueName: 'approvalMessageMeaning',
      }}
      flag={flag}
      record={record}
      lineList={record.toData().headerWorkFlowDTOS?.slice(0, 3)?.reverse()}
    />
  );
};

const approveExecutiveRender = ({ record }) => {
  const { dataSet } = record;
  const simpleApprovalHistoryData = dataSet?.getState('simpleApprovalHistoryData') || {};
  return <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('businessKey')]} />;
};

const workFlowStepRender = (headerWorkFlows) => {
  return (
    headerWorkFlows &&
    headerWorkFlows.length && (
      <Steps
        size="small"
        current={headerWorkFlows.length}
        direction="vertical"
        className={styles.steps}
      >
        {headerWorkFlows.map((item) => {
          if (item.approvalMessage === 'Pending') {
            return (
              <Step
                className={styles.approvalPending}
                title={`${item.employeeName}${item.approvalMessageMeaning}`}
                icon={<img src={require('@/assets/step-approval.svg')} alt="" />}
              />
            );
          } else if (item.approvalMessage === 'Rejected') {
            return (
              <Step
                className={styles.refuse}
                title={`${item.employeeName}${item.approvalMessageMeaning}`}
                icon={<img src={require('@/assets/step-refuse.svg')} alt="" />}
              />
            );
          }
          return (
            <Step
              title={`${item.employeeName}${item.approvalMessageMeaning}`}
              icon={<img src={require('@/assets/step-pass.svg')} alt="" />}
            />
          );
        })}
      </Steps>
    )
  );
};

/**
 * 渲染分标段执行情况
 */
const renderSectionInfo = (record, flag = false) => {
  return (
    <MultiLinePopover
      lineConfig={{
        labelName: 'sectionNum',
        secondLabelName: 'sourceTitle',
        valueName: record.get('sourceCategory') === 'BID' ? 'bidStatusMeaning' : 'rfxStatusMeaning',
        prefixLabel: intl.get(`${promptCode}.view.message.section`).d('标段'),
        renderLabelPopover: (line) => {
          return `${line.sectionCode}-${line.sectionName}`;
        },
      }}
      flag={flag}
      record={record}
      lineList={record.toData().headerDTOList}
    />
  );
};

/**
 * 渲染不分标段执行情况
 */
const rendeSectionrNoneInfo = (record, flag = false) => {
  return (
    <MultiLinePopover
      lineConfig={{
        labelName: 'sourceTitle',
        valueName: record.get('sourceCategory') === 'BID' ? 'bidStatusMeaning' : 'rfxStatusMeaning',
      }}
      flag={flag}
      record={record}
      lineList={record.toData().headerDTOList}
    />
  );
};

/**
 * 渲染分标段中标情况
 */
const renderBiddingSectionInfo = (record = {}) => {
  let lineCount = 0;
  return record.toData().sourceSupplierDetailDTOS?.map((section) => {
    if (section?.sectionSourceSupplierDetailDTOS?.length > 0) {
      // to do
    } else {
      lineCount++;
    }
    return lineCount <= 2 ? (
      <section className={styles['bidding-info-container']}>
        {section?.sectionSourceSupplierDetailDTOS?.map((supplier, index) => {
          const vnode =
            lineCount <= 2 ? (
              <div>
                <Popover
                  placement="topLeft"
                  content={`${section.sectionCode}-${section.sectionName}`}
                >
                  <span className={styles['section-name']}>
                    {index === 0 &&
                      `${intl.get(`${promptCode}.view.message.section`).d('标段')}${
                        section.sectionNum
                      }`}
                  </span>
                </Popover>
                <Popover placement="topLeft" content={supplier.supplierCompanyName}>
                  <span className={styles['supplier-name']}>{supplier.supplierCompanyName}</span>
                </Popover>
                <Popover placement="topLeft" content={supplier.biddingAmount || '-'}>
                  <span className={styles.amount}>
                    {supplier.currencySymbol} {supplier.biddingAmount || '-'}
                  </span>
                </Popover>
              </div>
            ) : null;
          lineCount++;
          return vnode;
        })}
      </section>
    ) : null;
  });
};

/**
 * 渲染不分标段中标情况
 */
const renderBiddingSectionNoneInfo = (record = {}, flag = false) => {
  const sourceSupplierDetailDTOS = record.get('sourceSupplierDetailDTOS');
  return sourceSupplierDetailDTOS && sourceSupplierDetailDTOS.length > 0 ? (
    <MultiLinePopover
      lineConfig={{
        labelName: 'supplierCompanyName',
        valueNameSymbol: 'currencySymbol',
        valueName: 'biddingAmount',
      }}
      flag={flag}
      record={record}
      lineList={record.toData().sourceSupplierDetailDTOS}
    />
  ) : null;
  // const supplier =
  //   record.toData().sourceSupplierDetailDTOS && record.toData().sourceSupplierDetailDTOS[0];
  // return (
  //   supplier && (
  //     <div className={styles['no-bindding']}>
  //       <Popover placement="topLeft" content={supplier.supplierCompanyName}>
  //         <span className={styles['supplier-name']}>{supplier.supplierCompanyName}</span>
  //       </Popover>
  //       <Popover placement="topLeft" content={supplier.biddingAmount || '-'}>
  //         <span className={styles.amount}>
  //           {supplier.currencySymbol} {supplier.biddingAmount || '-'}
  //         </span>
  //       </Popover>
  //     </div>
  //   )
  // );
};

// 渲染中标情况
const renderBiddingInfoField = (record) => {
  return record.get('subjectMatterRule') === 'PACK'
    ? renderBiddingSectionInfo(record)
    : renderBiddingSectionNoneInfo(record);
};

/**
 * 渲染自定义权限按钮
 */
const renderCustPermissionButton = (props) => {
  const { children, type = 'text', permissionCode = 1, ...otherProps } = props;
  switch (permissionCode) {
    case 1: // 正常
      if (type === 'button') {
        return <Button {...otherProps}>{children}</Button>;
      }
      return <a {...otherProps}>{children}</a>;
    case 0: // 隐藏
      return null;
    case -1: // 禁用
      return (
        <a disabled style={{ cursor: 'not-allowed', color: 'rgba(0, 0, 0, 0.25)' }}>
          {children}
        </a>
      );
    default:
      return null;
  }
};

/**
 * 渲染自定义权限下拉menu
 */
const renderCustPermissionMenu = (props) => {
  const { children, permissionCode = 1, overlay, list = [], onClick = noop } = props;
  switch (permissionCode) {
    case 1: // 正常
      if (list?.length > 1) {
        return (
          <Dropdown
            overlay={overlay}
            trigger={['hover']}
            placement="bottomLeft"
            SubMenu
            list={list}
            title={children}
          >
            <a>
              {children}
              <Icon type="expand_more" />
            </a>
          </Dropdown>
        );
      } else if (list.length === 1) {
        return <Button onClick={onClick} funcType="link" style={{ verticalAlign: 'baseline' }}>{children}</Button>;
      } else {
        return null;
      }
    case 0: // 隐藏
      return null;
    case -1: // 禁用
      if (list?.length > 1) {
        return (
          <Dropdown
            overlay={overlay}
            trigger={['hover']}
            placement="bottomLeft"
            SubMenu
            list={list}
            title={children}
          >
            <a disabled>{children}</a>
          </Dropdown>
        );
      } else {
        return <a disabled>{children}</a>;
      }
    default:
      return null;
  }
};

/**
 * 渲染【审批详情】按钮业务逻辑权限
 * 我发起的 我参与的 我抄送的
 * ①判断当前登录人是否属于流程的发起人/任一节点审批人/抄送人，若不属于则不展示；
 * ②若当前登录人符合第①条，再判断菜单权限：有审批工作台则展示【审批详情】按钮；没有审批工作台时，再根据当前登录人属于流程的什么节点，判断有没有对应的菜单，向下兼容，如果没有则隐藏【审批详情】按钮。
 * （例如：当前登录人属于流程的发起人，若用户没有我发起的流程菜单权限，则隐藏审批详情按钮）
 */
const getApprovedDetailBtn = (props) => {
  const { record, workFlowMenuPermissionMap = {} } = props;
  const { headerWorkFlowDTO = {} } = record.get(['headerWorkFlowDTO']) || {};
  const { workFlowMap = {}, encryptProcInstId, processName, startEmployeeName } =
    headerWorkFlowDTO || {};
  const { sponsor = 0, participants = 0, carbonCopy = 0 } = workFlowMap || {};
  let visible = false;
  let _url = '';
  const approvalMap = {
    sponsor: {
      pageName: '审批工作台我发起的详情',
      url: `/hwfp/approval/start-by-task/detail/${encryptProcInstId}?processName=${processName}&startUser=${startEmployeeName}`,
    },
    participants: {
      pageName: '审批工作台已审批详情',
      url: `/hwfp/approval/involved-task/detail/${encryptProcInstId}?processName=${processName}&startUserName=${startEmployeeName}`,
    },
    carbonCopy: {
      pageName: '审批工作台抄送详情',
      url: `/hwfp/approval/carbon-copy-task/detail/${encryptProcInstId}?processName=${processName}&startUserName=${startEmployeeName}`,
    },
  };
  // 页面
  const pageList = [
    {
      pageName: '我发起的流程详情',
      pageCode: 'sponsor',
      approveFlag: workFlowMenuPermissionMap?.startByTaskMenu, // 菜单权限
      url: `/hwfp/start-by-task/detail/${encryptProcInstId}`,
      roleFlag: sponsor, // 当前角色
    },
    {
      pageName: '我参与的流程详情',
      pageCode: 'participants',
      approveFlag: workFlowMenuPermissionMap?.involvedTaskMenu,
      url: `/hwfp/involved-task/detail/${encryptProcInstId}`,
      roleFlag: participants,
    },
    {
      pageName: '我的抄送流程详情',
      pageCode: 'carbonCopy',
      approveFlag: workFlowMenuPermissionMap?.carbonCopyTaskMenu,
      url: `/hwfp/carbon-copy-task/detail/${encryptProcInstId}`,
      roleFlag: carbonCopy,
    },
  ];
  if (sponsor || participants || carbonCopy) {
    // 1.先判断【审批工作台】是否有权限
    if (workFlowMenuPermissionMap?.approvalMenu) {
      const nodeObj = { sponsor, participants, carbonCopy }; // 按顺序维护节点对象。有优先级
      for (const key in nodeObj) {
        if (nodeObj[key]) {
          _url = approvalMap[key]?.url;
          visible = true;
          break;
        }
      }
    } else {
      // 2.判断【我发起的流程详情】【我参与的流程详情】【我的抄送流程详情】是否有权限
      const nodeObj = { sponsor, participants, carbonCopy };
      let list = [];
      for (const key in nodeObj) {
        if (nodeObj[key]) {
          switch (key) {
            case 'sponsor':
              list = pageList.filter((i) => i?.roleFlag);
              break;
            case 'participants':
              list = pageList.filter((i) => i?.pageCode !== 'sponsor' && i?.roleFlag);
              break;
            case 'carbonCopy':
              list = pageList.filter((i) => i?.pageCode === 'carbonCopy' && 1?.roleFlag);
              break;
            default:
              break;
          }
          const { url } = list.find((i) => i?.approveFlag) || {};
          if (url) {
            _url = url;
            visible = true;
          }
          if (visible) break;
        }
      }
    }
  }
  return { visible, _url };
};

/**
 * 渲染立项执行状态
 */
const renderExecutingStatus = ({ record, value }) => {
  const executingStatus = record?.get('executingStatus');
  const colorMap = new Map([
    ['SOURCED', 'green'], // 已寻源
    ['SOURCED_FAILED', 'red'], // 寻源失败
    ['UNSOURCED', 'gray'], // 未寻源
    ['PARTIALLY_SOURCED', 'yellow'], // 部分寻源
    ['RELEASED', 'green'], // 已释放
    ['PARTIALLY_RELEASED', 'yellow'], // 部分释放
  ]);
  return value ? (
    <Tag color={colorMap.get(executingStatus) ?? 'gray'} border={false}>
      {value ?? ''}
    </Tag>
  ) : null;
};

export {
  renderStatusTag,
  renderProjectSetupStatusTag,
  renderRateStar,
  renderSourceProjectField,
  renderCompanyField,
  renderCreationField,
  renderImplementationField,
  renderBiddingInfoField,
  renderCustPermissionButton,
  renderCustPermissionMenu,
  getApprovedDetailBtn,
  approveExecutiveRender,
  renderCloseFieldInfo,
  renderExecutingStatus,
};
