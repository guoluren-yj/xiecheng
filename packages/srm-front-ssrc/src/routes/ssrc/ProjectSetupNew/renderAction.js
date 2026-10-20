/**
 * 渲染操作列
 */
import React from 'react';
import { isFunction, isEmpty, isNil } from 'lodash';

import { Icon } from 'choerodon-ui';
import { Menu, Dropdown, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import HistoryVersionListBtn from '@/routes/ssrc/ProjectSetupNew/Components/HistoryVersionListBtn';

import styles from './index.less';
import {
  renderCustPermissionButton,
  renderCustPermissionMenu,
  getApprovedDetailBtn,
} from './helpers';

const promptCode = 'ssrc.projectSetup';

function renderMenuList(typeList) {
  return (
    <Menu>
      {typeList.map((item) => (
        <Menu.Item onClick={item.onClick}>{item.showName}</Menu.Item>
      ))}
    </Menu>
  );
}

function renderSubMenuList(typeList, draftList) {
  return draftList?.length ? (
    <Menu className={`${styles.menu} ${styles.subMenuOperateColor}`}>
      <Menu.ItemGroup key="edit" title={intl.get('hzero.common.button.edit').d('编辑')}>
        {draftList.map((item) => (
          <Menu.Item onClick={item.onClick} key={item.key}>
            {item.showName}
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
      <Menu.ItemGroup key="create" title={intl.get('hzero.common.button.create').d('新建')}>
        {typeList.map((item) => (
          <Menu.Item onClick={item.onClick} key={item.key}>
            {item.showName}
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
    </Menu>
  ) : (
    <Menu className={styles.subMenuOperateColor}>
      {typeList.map((item) => (
        <Menu.Item onClick={item.onClick}>{item.showName}</Menu.Item>
      ))}
    </Menu>
  );
}

function renderRFQList(typeList) {
  return typeList.map((item) => <Menu.Item onClick={item.onClick}>{item.showName}</Menu.Item>);
}

const createList = (handleFunc, record, dataSet) => {
  const BidFlag = record.get('secondarySourceCategory') === 'NEW_BID';
  return BidFlag
    ? [
        record.get('createFlag') && {
          showName: intl.get(`${promptCode}.view.message.button.createBID`).d('新建BID'),
          onClick: () => handleFunc.createRFQ(record),
          key: 'BID',
        },
      ].filter(Boolean)
    : [
        record.get('createRFIFlag') && {
          showName: (
            <Lov
              noCache
              funcType="link"
              mode="button"
              clearButton={false}
              dataSet={dataSet?.rfiTemplateDs}
              name="rfTemplateLov"
              modalProps={{
                onOk: () => handleFunc.createRF(record, 'RFI'),
                onDoubleClick: () => handleFunc.createRF(record, 'RFI'),
                title: intl.get(`${promptCode}.view.message.button.createRFI`).d('新建RFI'),
              }}
            >
              {intl.get(`${promptCode}.view.message.button.createRFI`).d('新建RFI')}
            </Lov>
          ),
          key: 'RFI',
        },
        record.get('createRFPFlag') && {
          showName: (
            <Lov
              noCache
              funcType="link"
              mode="button"
              clearButton={false}
              dataSet={dataSet?.rfpTemplateDs}
              name="rfTemplateLov"
              modalProps={{
                onOk: () => handleFunc.createRF(record, 'RFP'),
                onDoubleClick: () => handleFunc.createRF(record, 'RFP'),
                title: intl.get(`${promptCode}.view.message.button.createRFP`).d('新建RFP'),
              }}
            >
              {intl.get(`${promptCode}.view.message.button.createRFP`).d('新建RFP')}
            </Lov>
          ),
          key: 'RFP',
        },
        record.get('createFlag') && {
          showName: intl.get(`${promptCode}.view.message.button.createRFQ`).d('新建RFQ'),
          onClick: () => handleFunc.createRFQ(record),
          key: 'RFQ',
        },
      ].filter(Boolean);
};

const manageList = (handleFunc, record) => {
  const List = record.get('sourceManagement') || [];
  const BidFlag = record.get('secondarySourceCategory') === 'NEW_BID';
  return BidFlag
    ? [
        {
          showName: intl.get(`${promptCode}.view.message.button.mangeBID`).d('管理BID'),
          onClick: () => handleFunc.mangeBID(record),
        },
      ]
    : [
        List.includes('RFI') && {
          showName: intl.get(`${promptCode}.view.message.button.mangeRFI`).d('管理RFI'),
          onClick: () => handleFunc.mangeRF(record, 'RFI'),
        },
        List.includes('RFP') && {
          showName: intl.get(`${promptCode}.view.message.button.mangeRFP`).d('管理RFP'),
          onClick: () => handleFunc.mangeRF(record, 'RFP'),
        },
        List.includes('RFX') && {
          showName: intl.get(`${promptCode}.view.message.button.mangeRFQ`).d('管理RFQ'),
          onClick: () => handleFunc.manage(record),
        },
      ].filter(Boolean);
};

const draftList = (handleFunc, record) => {
  const List = record.get('tempHeaderDTOList') || [];
  return List.map((item, i) => {
    const { sourceCategory, index, secondarySourceCategory } = item;
    const draftRecord = record.get('tempHeaderDTOList')[i];
    return {
      showName: `${intl.get(`${promptCode}.view.message.button.edit`).d('编辑')} ${
        secondarySourceCategory || sourceCategory
      } -${index}`,
      onClick: () => handleFunc(draftRecord, record),
      key: i,
    };
  });
};

// 查看版本
const renderViewVersionBtn = ({
  record,
  handleFunc,
  permissionCode,
  projectOldUIFlag,
  aggregation,
} = {}) => {
  // 查看版本
  const historyVersionProps = {
    aggregation,
    listFlag: true,
    sourceProjectId: record?.get('sourceProjectId'),
    status: ['FINISHED', 'CLOSED'].includes(record?.get('sourceProjectStatus')),
    permissionDisabled: permissionCode === -1,
    handleJumpVersion: handleFunc,
  };

  return permissionCode !== 0 && !isNil(projectOldUIFlag) && !projectOldUIFlag ? (
    <HistoryVersionListBtn {...historyVersionProps} />
  ) : null;
};

/**
 * 获取按钮节点
 * @param {!string} btnType - 按钮类型
 * @param {!Obejct} record - 行记录
 * @param {!Function} handleFunc - 事件处理函数
 *
 */
const getPermissionButtonNode = ({
  btnType,
  record,
  handleFunc,
  permissionCode,
  dataSet,
  className,
}) => {
  const commonBtnProps = {
    permissionCode,
    type: 'text',
    onClick: () => handleFunc(record),
  };
  const manageRfxBtn = renderCustPermissionMenu({
    overlay: renderMenuList(manageList(handleFunc, record)),
    list: renderRFQList(manageList(handleFunc, record)),
    children: intl.get(`${promptCode}.view.message.button.manageRfx`).d('寻源管理'),
    onClick: () =>
      record.get('secondarySourceCategory') === 'NEW_BID'
        ? handleFunc.mangeBID(record)
        : handleFunc.mangeRF(record, '', true),
    permissionCode,
  });
  const createRfxBtn = renderCustPermissionMenu({
    overlay: renderSubMenuList(
      createList(handleFunc, record, dataSet),
      draftList(handleFunc.draft, record)
    ),
    list: renderRFQList([
      ...createList(handleFunc, record, dataSet),
      ...draftList(handleFunc.draft, record),
    ]),
    children:
      createList(handleFunc, record, dataSet).length === 1 ? (
        record.get('createRFPFlag') ? (
          <Lov
            noCache
            funcType="link"
            mode="button"
            clearButton={false}
            dataSet={dataSet?.rfpTemplateDs}
            name="rfTemplateLov"
            modalProps={{
              onOk: () => handleFunc.createRF(record, 'RFP'),
              onDoubleClick: () => handleFunc.createRF(record, 'RFP'),
            }}
          >
            <span className={styles.createRfx}>
              {intl.get(`${promptCode}.view.message.button.createRfx`).d('新建寻源')}
            </span>
          </Lov>
        ) : record.get('createRFIFlag') ? (
          <Lov
            noCache
            funcType="link"
            mode="button"
            clearButton={false}
            dataSet={dataSet?.rfiTemplateDs}
            name="rfTemplateLov"
            modalProps={{
              onOk: () => handleFunc.createRF(record, 'RFI'),
              onDoubleClick: () => handleFunc.createRF(record, 'RFI'),
            }}
          >
            <span className={styles.createRfx}>
              {intl.get(`${promptCode}.view.message.button.createRfx`).d('新建寻源')}
            </span>
          </Lov>
        ) : (
          intl.get(`${promptCode}.view.message.button.createRfx`).d('新建寻源')
        )
      ) : (
        intl.get(`${promptCode}.view.message.button.createRfx`).d('新建寻源')
      ),
    // createList为1且创建rfq 或者 createList大于1
    onClick: () =>
      (createList(handleFunc, record, dataSet).length === 1 && record.get('createFlag')) ||
      createList(handleFunc, record, dataSet).length !== 1
        ? handleFunc.createRF(record, '', true)
        : null,
    permissionCode,
  });
  // const manageRfxBtn = renderCustPermissionButton({
  //   ...commonBtnProps,
  //   children: intl.get(`${promptCode}.view.message.button.manageRfx`).d('寻源管理'),
  // });
  // const createRfxBtn = renderCustPermissionButton({
  //   ...commonBtnProps,
  //   children: intl.get(`${promptCode}.view.message.button.createRfx`).d('新建寻源'),
  // });
  const approveBtn = renderCustPermissionButton({
    ...commonBtnProps,
    children: intl.get(`${promptCode}.view.message.button.approve`).d('审批'),
  });
  const revokeApprovalBtn = renderCustPermissionButton({
    ...commonBtnProps,
    children: intl.get(`${promptCode}.view.message.button.revoke`).d('撤销审批'),
  });
  const approveDetailBtn = renderCustPermissionButton({
    ...commonBtnProps,
    children: intl.get(`${promptCode}.view.message.button.approveDetail`).d('审批详情'),
  });
  const changeBtn = renderCustPermissionButton({
    ...commonBtnProps,
    type: 'button',
    funcType: 'link',
    children: intl.get(`${promptCode}.view.message.button.change`).d('变更'),
    style: { verticalAlign: 'baseline' },
  });
  const draftRecord = record.get('tempHeaderDTOList')?.length
    ? record.get('tempHeaderDTOList')[0]
    : {};
  let draftBtn;
  if (btnType === 'draftBtn' && !isEmpty(draftRecord)) {
    draftBtn = renderCustPermissionMenu({
      overlay: renderMenuList(draftList(handleFunc, record)),
      list: renderRFQList(draftList(handleFunc, record)),
      children: intl.get(`${promptCode}.view.message.button.draft`).d('草稿'),
      onClick: () => handleFunc(draftRecord, record),
      permissionCode,
    });
  }
  // if (btnType === 'draftBtn') {
  //   const draftRecord = record.get('tempHeaderDTOList')[index];
  //   const { sourceTitle, sourceHeaderNum } = draftRecord;
  //   const tempDraftBtn = renderCustPermissionButton({
  //     ...commonBtnProps,
  //     onClick: () => handleFunc(draftRecord, record),
  //     children: `${intl.get(`${promptCode}.view.message.button.draft`).d('草稿')}${index + 1}`,
  //   });
  //   draftBtn = tempDraftBtn ? (
  //     <Popover placement="topLeft" content={`${sourceTitle || ''}-${sourceHeaderNum || ''}`}>
  //       {tempDraftBtn}
  //     </Popover>
  //   ) : null;
  // }
  const maintainBtn = renderCustPermissionButton({
    ...commonBtnProps,
    className,
    children: intl.get(`${promptCode}.view.message.button.edit`).d('编辑'),
  });

  const copyBtn = renderCustPermissionButton({
    ...commonBtnProps,
    className,
    type: 'button',
    funcType: 'link',
    waitType: 'throttle',
    wait: 1200,
    children: intl.get(`${promptCode}.view.message.button.copy`).d('复制'),
    style: { verticalAlign: 'baseline' },
  });

  const sourceResultBtn = renderCustPermissionButton({
    ...commonBtnProps,
    className,
    children: intl.get(`${promptCode}.view.message.button.sourceResult`).d('寻源结果'),
  });

  const projectCloseBtn = renderCustPermissionButton({
    ...commonBtnProps,
    children: intl.get(`${promptCode}.view.message.button.projectClose`).d('项目关闭'),
  });

  const allBtnMap = {
    manageRfxBtn,
    createRfxBtn,
    approveBtn,
    revokeApprovalBtn,
    approveDetailBtn,
    changeBtn,
    draftBtn,
    maintainBtn,
    copyBtn,
    sourceResultBtn,
    projectCloseBtn,
  };

  return allBtnMap[btnType];
};

/**
 * 渲染操作列
 * @param {!Object} record - 行记录
 * @param {!Object} match - 路由信息对象
 * @param {!Object} handleFuncMap - 按钮操作事件对象
 * @param {!Object} permissionFlagMap - 权限标识对象
 */
const renderAction = (
  {
    record,
    aggregation,
    handleFuncMap = {},
    permissionFlagMap = {},
    tabKey,
    rfTemplateDs,
    projectOldUIFlag,
    workFlowMenuPermissionMap = {},
  },
  onRef
) => {
  const { sourceProjectStatus, closedStatus } =
    record.get(['sourceProjectStatus', 'closedStatus']) || {};

  const allBtns = [];
  // 全部页签上加上复制按钮
  const allTabFlag = tabKey === 'all';
  // 复制按钮
  const copyBtn = getComputedBtn({
    btnType: 'copy',
    record,
    permissionFlagMap,
    handleFunc: handleFuncMap.copy,
    className: styles.mainBtn,
  });
  // 寻源结果
  const sourceResultBtn = getComputedBtn({
    btnType: 'sourceResult',
    record,
    permissionFlagMap,
    handleFunc: handleFuncMap.result,
    className: allTabFlag ? styles['operate-column'] : null,
  });

  // 维护编辑
  const maintainBtn = getComputedBtn({
    btnType: 'maintain',
    record,
    permissionFlagMap,
    handleFunc: handleFuncMap.maintain,
    className: allTabFlag ? styles['operate-column'] : null,
  });

  // 历史版本
  const viewHistoryVersionBtn = getComputedBtn({
    btnType: 'viewHistoryVersion',
    record,
    aggregation,
    permissionFlagMap,
    projectOldUIFlag,
    handleFunc: handleFuncMap.viewHistoryVersion,
  });

  if (
    sourceProjectStatus === 'NEW' ||
    tabKey === 'toBeReleased' ||
    sourceProjectStatus === 'CHANGING'
  ) {
    // 理论上 `NEW` 单据也只会存在 `toBeReleased` 页签下面
    return [allTabFlag && copyBtn, maintainBtn].filter(Boolean);
  } else if (sourceProjectStatus === 'FINISHED') {
    return [allTabFlag && copyBtn, sourceResultBtn, viewHistoryVersionBtn].filter(Boolean);
  } else if (sourceProjectStatus === 'CLOSED') {
    return [
      allTabFlag && copyBtn,
      <a
        onClick={() => isFunction(handleFuncMap.closed) && handleFuncMap.closed(record)}
        className={styles['operate-column']}
      >
        {intl.get(`${promptCode}.view.message.button.view`).d('查看')}
      </a>,
      viewHistoryVersionBtn,
    ].filter(Boolean);
  }

  if (allTabFlag) {
    // 不需要手动处理mainBtn样式
    const copyBtnWithoutStyle = getComputedBtn({
      btnType: 'copy',
      record,
      permissionFlagMap,
      handleFunc: handleFuncMap.copy,
    });
    if (copyBtnWithoutStyle) allBtns.push(copyBtnWithoutStyle);
  }

  // 我们先整理所有按钮集合, 基于按钮权限和flag判断, 然后再通过数组取出第一项做为主按钮, 其余放在更多操作中

  const createBtn = getComputedBtn({
    btnType: 'create',
    record,
    permissionFlagMap,
    handleFunc: handleFuncMap,
    rfTemplateDs,
  });
  const manageBtn = getComputedBtn({
    btnType: 'manage',
    record,
    permissionFlagMap,
    handleFunc: handleFuncMap,
  });
  const changeBtn = getComputedBtn({
    btnType: 'change',
    record,
    permissionFlagMap,
    handleFunc: handleFuncMap.change,
  });
  const approveDetailBtn = getComputedBtn({
    btnType: 'detail',
    record,
    permissionFlagMap,
    workFlowMenuPermissionMap,
    handleFunc: handleFuncMap.detail,
  });
  const approveBtn = getComputedBtn({
    btnType: 'approve',
    record,
    permissionFlagMap,
    handleFunc: handleFuncMap.approve,
  });
  const revokeApprovalBtn = getComputedBtn({
    btnType: 'revokeApproval',
    record,
    permissionFlagMap,
    handleFunc: handleFuncMap.revokeApproval,
  });
  // const draftBtn = getComputedBtn('draft', record, permissionFlagMap, handleFuncMap.draft);

  switch (sourceProjectStatus) {
    case 'APPROVED': // 审批完成
      if (closedStatus === 'CLOSE_APPROVING') {
        if (approveBtn) {
          allBtns.push(approveBtn);
        }
        if (revokeApprovalBtn) {
          allBtns.push(revokeApprovalBtn);
        }
        if (approveDetailBtn) {
          allBtns.push(approveDetailBtn);
        }
        // 如果关闭状态是关闭审批中，则不显示下面的【createBtn、changeBtn】按钮
        break;
      }
      if (createBtn) {
        allBtns.push(createBtn);
      }
      if (changeBtn) {
        allBtns.push(changeBtn);
      }
      // 产品说只有待寻源的单子能关闭，将逻辑挪到此状态下
      if (record.get('sourcedFlag')) {
        // 项目关闭
        const projectCloseBtn = getComputedBtn({
          btnType: 'projectClose',
          record,
          permissionFlagMap,
          handleFunc: handleFuncMap.projectFinish,
        });
        if (projectCloseBtn && closedStatus !== 'CLOSE_APPROVING') {
          // 如果关闭状态是关闭审批中，则不显示按钮
          allBtns.push(projectCloseBtn);
        }
      }
      break;
    case 'REFUSE': // 审批拒绝
    case 'CHANGE_REFUSE': // 变更审批拒绝
      if (maintainBtn) {
        allBtns.push(maintainBtn);
      }
      if (approveDetailBtn) {
        allBtns.push(approveDetailBtn);
      }
      break;
    case 'SOURCING': // 寻源中
      if (createBtn) {
        allBtns.push(createBtn);
      }
      if (manageBtn) {
        allBtns.push(manageBtn);
      }
      // 剩下草稿 push
      // if (draftBtn) {
      // to do
      // allBtns.push(draftBtn);
      // const { tempHeaderDTOList = [] } = record.toData();
      // const { draftPermissionCode } = permissionFlagMap;
      // const commonParams = {
      //   record,
      //   handleFunc: handleFuncMap.draft,
      // };
      // // eslint-disable-next-line no-unused-expressions
      // if (isArray(tempHeaderDTOList) && tempHeaderDTOList[0]) {
      //   tempHeaderDTOList.forEach((_, index) => {
      //     const tempDraftBtn = getPermissionButtonNode({
      //       ...commonParams,
      //       index,
      //       btnType: 'draftBtn',
      //       permissionCode: draftPermissionCode,
      //     });
      //     allBtns.push(tempDraftBtn);
      //   });
      // }
      // }
      break;
    case 'APPROVING': // 审批中
    case 'CHANGE_APPROVING':
      if (approveBtn) {
        allBtns.push(approveBtn);
      }
      if (revokeApprovalBtn) {
        allBtns.push(revokeApprovalBtn);
      }
      if (approveDetailBtn) {
        allBtns.push(approveDetailBtn);
      }
      break;
    default:
      break;
  }

  // 只要发布成功就会有至少一个版本，因此判断立项单状态不是新建、发布审批中、发布审批拒绝即可
  if (!['NEW', 'APPROVING', 'REFUSE'].includes(sourceProjectStatus)) {
    allBtns.push(viewHistoryVersionBtn);
  }

  const actionList = [];
  if (allBtns.length > 3) {
    allBtns.slice(0, 2).forEach((btns) => {
      actionList.push(<a className={styles.mainBtn}>{btns}</a>);
    });
    actionList.push(
      <Dropdown
        overlay={renderMoreBtns(allBtns, 2)}
        trigger={['hover']}
        placement="bottomLeft"
        overlayClassName={styles.morePopover}
        ref={(vnode) => isFunction(onRef) && onRef(record, vnode)}
      >
        <a>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.more').d('更多')}
          <Icon type="expand_more" />
        </a>
      </Dropdown>
    );
  } else {
    allBtns.forEach((btns) => {
      actionList.push(<a className={styles.mainBtn}>{btns}</a>);
    });
  }

  return actionList;
};

/**
 * 判断是否显示按钮, 基于权限集配置 + 后端flag控制
 * @param {!string} btnType - 按钮类型
 * @returns {!ReactNode|null} - 返回btnNode
 */
const getComputedBtn = ({
  btnType,
  record,
  permissionFlagMap,
  handleFunc,
  rfTemplateDs,
  className,
  aggregation,
  projectOldUIFlag,
  workFlowMenuPermissionMap = {},
}) => {
  // changePermissionCode: 0, // 变更权限
  // createRfxPermissionCode: 0, // 新建寻源权限
  // manageRfxPermissionCode: 0, // 寻源管理权限
  // approveDetailPermissionCode: 0, // 审批详情权限
  // approvePermissionCode: 0, // 审批权限
  // revokePermissionCode: 0, //  撤销权限
  // draftPermissionCode: 0, // 草稿权限
  // maintainPermissionCode: 0, // 维护权限
  const {
    changePermissionCode,
    createRfxPermissionCode,
    manageRfxPermissionCode,
    approveDetailPermissionCode,
    approvePermissionCode,
    revokePermissionCode,
    draftPermissionCode,
    maintainPermissionCode,
    copyPermissionCode,
    projectClosePermissionCode,
    sourceResultPermissionCode,
    viewVersionPermissionCode, // 查看版本
  } = permissionFlagMap;

  const {
    // changeFlag, -- 暂时不需要后端返回
    // createFlag,
    // createRFIFlag,
    // createRFPFlag,
    // manageFlag,
    // pendingDetailFlag, // 审批详情
    pendingFlag, // 审批
    sourcingManagementFlag, // 寻源管理
  } = record.get([
    'createFlag',
    'pendingFlag',
    'sourcingManagementFlag',
    'createRFIFlag',
    'createRFPFlag',
  ]);
  const { dataSet } = record || {};
  const approvaFlags = dataSet?.getState('approvaFlags');
  const operationFlags = dataSet?.getState('operationFlags');
  const businessKey = record.get('businessKey');
  const approvaFlag = approvaFlags?.[businessKey];
  const operationFlag = operationFlags?.[businessKey]?.REVOKE;
  const commonParams = {
    record,
    handleFunc,
  };
  switch (btnType) {
    case 'create':
      return (
        // (createFlag || createRFIFlag || createRFPFlag) &&
        getPermissionButtonNode({
          ...commonParams,
          btnType: 'createRfxBtn',
          permissionCode: createRfxPermissionCode,
          dataSet: rfTemplateDs,
        })
      );
    case 'manage':
      return (
        sourcingManagementFlag &&
        getPermissionButtonNode({
          ...commonParams,
          btnType: 'manageRfxBtn',
          permissionCode: manageRfxPermissionCode,
        })
      );
    case 'change':
      return getPermissionButtonNode({
        ...commonParams,
        btnType: 'changeBtn',
        permissionCode: changePermissionCode,
      });
    case 'detail':
      return (
        getApprovedDetailBtn({ record, workFlowMenuPermissionMap })?.visible &&
        getPermissionButtonNode({
          ...commonParams,
          btnType: 'approveDetailBtn',
          permissionCode: approveDetailPermissionCode,
        })
      );
    case 'approve':
      return (
        pendingFlag &&
        approvaFlags &&
        approvaFlag &&
        getPermissionButtonNode({
          ...commonParams,
          btnType: 'approveBtn',
          permissionCode: approvePermissionCode,
        })
      );
    case 'revokeApproval':
      return (
        operationFlags &&
        operationFlag &&
        getPermissionButtonNode({
          ...commonParams,
          btnType: 'revokeApprovalBtn',
          permissionCode: revokePermissionCode,
        })
      );
    case 'draft':
      return getPermissionButtonNode({
        ...commonParams,
        btnType: 'draftBtn',
        permissionCode: draftPermissionCode,
      });
    case 'maintain':
      return getPermissionButtonNode({
        ...commonParams,
        btnType: 'maintainBtn',
        className,
        permissionCode: maintainPermissionCode,
      });
    case 'copy':
      return getPermissionButtonNode({
        ...commonParams,
        btnType: 'copyBtn',
        className,
        permissionCode: copyPermissionCode,
      });
    case 'sourceResult':
      return getPermissionButtonNode({
        ...commonParams,
        btnType: 'sourceResultBtn',
        className,
        permissionCode: sourceResultPermissionCode,
      });
    case 'projectClose':
      return getPermissionButtonNode({
        ...commonParams,
        btnType: 'projectCloseBtn',
        permissionCode: projectClosePermissionCode,
      });
    case 'viewHistoryVersion':
      // 查看版本
      return renderViewVersionBtn({
        ...commonParams,
        aggregation,
        projectOldUIFlag,
        permissionCode: viewVersionPermissionCode,
      });
    default:
      return false;
  }
};

const { SubMenu } = Menu;

/**
 * 渲染更多操作中按钮
 * @param {!Array} allBtns - 所有按钮集合
 */
const renderMoreBtns = (allBtns = [], number = 1) => {
  const menu = (
    <Menu>
      {allBtns
        .filter(Boolean)
        .slice(number)
        .map((item) => {
          if (item?.props?.SubMenu) {
            const { title, list = [] } = item.props;
            return (
              <SubMenu title={title} className={styles['dropdown-more-operate']}>
                {list.map((line) => line)}
              </SubMenu>
            );
          }
          return <Menu.Item className={styles['dropdown-more-operate']}>{item}</Menu.Item>;
        })}
    </Menu>
  );
  return menu;
};

export { renderAction };
