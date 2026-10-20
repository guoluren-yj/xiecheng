import React from 'react';
import { connect } from 'dva';
import { compose, isEmpty, omit } from 'lodash';
import intl from 'utils/intl';
import { ModalProvider } from 'choerodon-ui/pro';
import { Icon, Dropdown, Menu, Popconfirm } from 'choerodon-ui';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import MessageDrawer from './MessageDrawer';
import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();

const List = (props) => {
  const {
    formDs,
    tableDs,
    onSaveMessage,
    searchBarRef,
    message: {
      languageList = [],
      issueLevelList = [],
      issueModuleList = [],
      issueRoleList = [],
      fieldType = [],
    },
    dispatch,
  } = props;
  const Modal = ModalProvider.useModal();
  const openModal = (record) => {
    const tenantId = record.get('tenantId');
    const isEdit = isTenant && tenantId === 0;
    Modal.open({
      title: isEdit
        ? intl.get('hzero.common.basicLayout.watchMessage').d('查看消息')
        : intl.get('hpfm.message.view.message.edit').d('编辑消息'),
      closable: true,
      drawer: true,
      style: { width: 742 },
      children: <MessageDrawer readonly={isEdit} formDs={formDs} />,
      onOk: () => onSaveMessage(record.toData()),
      cancelText: isEdit
        ? intl.get('hzero.common.btn.close').d('关闭')
        : intl.get('hzero.common.btn.cancel').d('取消'),
      cancelProps: isEdit ? { color: 'primary' } : {},
      footer: (okBtn, cancelBtn) => (
        <div>
          {/* {isTenant && tenantId === 0 ? (
              <Button onClick={handleCancel} color="primary">
                {intl.get('hzero.common.copy').d('复制')}
              </Button>
            ) : (
                okBtn
              )} */}
          {isEdit ? null : okBtn}
          {cancelBtn}
        </div>
      ),
    });
    // function handleCancel() {
    //   handleCopy(record);
    //   modal.close();
    // }
  };

  /**
   * 编辑消息模态框
   */
  const handleEditModal = (record) => {
    formDs.reset();
    const obj = record.toData();
    const detailObj = omit(obj, [
      '__dirty',
      '_token',
      'issueRoleFollow',
      'issueRoleFollowsByFollow',
      'messageDescTlList',
    ]);
    const { messageDescTlList } = obj;
    Object.keys(detailObj).forEach((item) => {
      let itemValue = detailObj[item];
      if (item === 'issueRoleFollows' && itemValue && Array.isArray(itemValue)) {
        itemValue = itemValue.filter((i) => i);
      }
      formDs.current.set(item, itemValue);
    });
    languageList.forEach((item) => {
      const meaning = messageDescTlList.find((i) => i.lang === item.value);
      formDs.current.set(`description_${item.value}`, meaning ? meaning.description : '');
    });
    dispatch({
      type: 'message/updateState',
      payload: {
        messageDetail: { messageId: messageDescTlList[0].messageId, tenantId: obj.tenantId },
      },
    });
    openModal(record);
  };

  // 列名
  const messageColumns = [
    {
      header: intl.get('hzero.common.view.title.baseInfo').d('基础信息'),
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const code = record.get('code');
        // const description = record.get('description');
        const enableResetFlag = record.get('enableResetFlag');
        const enableDeleteFlag = record.get('enableDeleteFlag');
        const tenantId = record.get('tenantId');
        const flag = enableResetFlag || enableDeleteFlag;
        const type = record.get('type');
        const messageTypeCode = record.get('messageTypeCode');
        const messageTypeCodeMeaning = fieldType.find((item) => item.value === messageTypeCode);
        return (
          <div className={styles['column-message']}>
            <div
              className={styles['column-message-text']}
              style={{ width: isTenant ? '' : '100%' }}
            >
              <div onClick={() => handleEditModal(record)} className={styles['code-content']}>
                <span className={`${styles['text-code']} ${styles['text-content']}`}>
                  {code || '-'}
                </span>
                {/* {isTenant && flag && (
                  <span className={styles['text-icon']}>
                    <Icon type="fiber_manual_record" />
                  </span>
                )} */}
              </div>
              <div className={styles['text-content']}>
                <span className={styles['text-label']}>
                  {intl.get('hzero.common.model.common.entryCategory').d('类别')}
                </span>
                <span style={{ textTransform: 'capitalize' }} className={styles.text}>
                  {type || '-'}
                </span>
              </div>
              <div className={styles['text-content']}>
                <span className={styles['text-label']}>
                  {intl.get('hpfm.message.model.message.type').d('消息类型')}
                </span>
                <span className={styles.text}>
                  {messageTypeCodeMeaning ? messageTypeCodeMeaning.meaning : '-'}
                </span>
              </div>
              {isTenant && (
                <div className={styles['text-content']}>
                  <span className={styles['text-label']}>
                    {intl.get('hzero.common.date.dataSource').d('数据来源')}
                  </span>
                  <span className={styles.text}>
                    {tenantId !== 0
                      ? intl.get('hzero.common.custom').d('自定义')
                      : intl.get('hzero.common.predefined').d('预定义')}
                  </span>
                </div>
              )}
              {/* <div className={styles['text-content']}>{description || '-'}</div> */}
            </div>
            {isTenant && flag && (
              <div className={styles['column-message-action']}>
                <Dropdown
                  placement="topLeft"
                  overlay={
                    <Menu className={styles['more-action-menu-list']}>
                      {enableResetFlag && (
                        <Menu.Item key="reset">
                          <Popconfirm
                            title={intl
                              .get('hzero.common.message.confirm.resetData')
                              .d('确定重置数据')}
                            onConfirm={() => handleReset(record)}
                          >
                            {intl.get('hzero.common.button.reset').d('重置')}
                          </Popconfirm>
                        </Menu.Item>
                      )}
                      {enableDeleteFlag && (
                        <Menu.Item key="delete">
                          <Popconfirm
                            title={intl
                              .get('hzero.common.message.confirm.removeData')
                              .d('确定删除数据')}
                            onConfirm={() => handleDelete(record)}
                          >
                            {intl.get('hzero.common.button.toDelete').d('删除')}
                          </Popconfirm>
                        </Menu.Item>
                      )}
                      {/* {tenantId === 0 && (
                        <Menu.Item key="copy" onClick={() => handleCopy(record)}>
                          {intl.get('hzero.common.copy').d('复制')}
                        </Menu.Item>
                      )} */}
                    </Menu>
                  }
                >
                  <Icon type="more_horiz" />
                </Dropdown>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: intl.get('hpfm.message.model.message.description').d('消息描述'),
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const langList = record.get('messageDescTlList');
        return (
          <>
            {languageList.map((item) => (
              <div>
                <span className={styles['text-label']}>{item.name}</span>
                <span className={styles.text}>
                  {langList.find((i) => i.lang === item.value)
                    ? langList.find((i) => i.lang === item.value).description
                    : '-'}
                </span>
              </div>
            ))}
          </>
        );
      },
    },
    {
      header: intl.get('hpfm.message.troubleshooting.suggestions').d('排查建议'),
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const { issueLevel, issueModule, issueRoleFollows, issueSolution } = record.get([
          'issueLevel',
          'issueModule',
          'issueRoleFollows',
          'issueSolution',
        ]);
        const roleArr = [];
        issueRoleList.forEach((item) => {
          if (issueRoleFollows.includes(item.value)) {
            roleArr.push(item.meaning);
          }
        });
        return (
          <>
            <div>
              <span className={styles['text-label']}>
                {intl.get('hpfm.message.model.issue.level').d('问题等级')}
              </span>
              <span className={styles.text}>
                {issueLevelList.find((item) => item.value === issueLevel)
                  ? issueLevelList.find((item) => item.value === issueLevel).meaning
                  : '-'}
              </span>
            </div>
            <div>
              <span className={styles['text-label']}>
                {intl.get('hpfm.message.model.issue.module').d('问题模块')}
              </span>
              <span className={styles.text}>
                {issueModuleList.find((item) => item.value === issueModule)
                  ? issueModuleList.find((item) => item.value === issueModule).meaning
                  : '-'}
              </span>
            </div>
            <div>
              <span className={styles['text-label']}>
                {intl.get('hpfm.message.model.issue.role.follow').d('默认跟进角色')}
              </span>
              <span className={styles.text}>{!isEmpty(roleArr) ? roleArr.join(',') : '-'}</span>
            </div>
            <div>
              <span className={styles['text-label']}>
                {intl.get('hpfm.message.model.issue.solution').d('解决方案')}
              </span>
              <span className={styles.text}>{issueSolution || '-'}</span>
            </div>
          </>
        );
      },
    },
    {
      header: intl.get('hpfm.message.maintenance.information').d('维护信息'),
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const langList = record.get('messageDescTlList');
        const { createByName, creationDate, lastUpdatedByName, lastUpdateDate } = langList[0] || [];
        return (
          <>
            <div>
              <span className={styles['text-label']}>
                {intl.get('hzero.common.date.creator').d('创建人')}
              </span>
              <span className={styles.text}>{createByName || '-'}</span>
            </div>
            <div>
              <span className={styles['text-label']}>
                {intl.get('hzero.common.date.creation').d('创建时间')}
              </span>
              <span className={styles.text}>{creationDate || '-'}</span>
            </div>
            <div>
              <span className={styles['text-label']}>
                {intl.get('hzero.common.date.lastUpdatedBy').d('更新人')}
              </span>
              <span className={styles.text}>{lastUpdatedByName || '-'}</span>
            </div>
            <div>
              <span className={styles['text-label']}>
                {intl.get('hzero.common.date.lastUpdateDate').d('更新时间')}
              </span>
              <span className={styles.text}>{lastUpdateDate || '-'}</span>
            </div>
          </>
        );
      },
    },
  ];

  // 平台级新增列：所属租户
  if (!isTenant) {
    messageColumns.splice(1, 0, {
      // 所属租户
      name: 'tenantName',
    });
  }

  // 租户级-重置
  const handleReset = (record) => {
    dispatch({
      type: 'message/resetMessage',
      payload: { messageId: record.data.messageId },
    }).then((res) => {
      if (res) {
        notification.success();
        tableDs.query();
      }
    });
  };

  // 租户级-删除
  const handleDelete = (record) => {
    dispatch({
      type: 'message/deleteMessage',
      payload: { ...record.data, messageId: record.data.messageId },
    }).then((res) => {
      if (res) {
        notification.success();
        tableDs.query();
      }
    });
  };

  return (
    <div className={styles['search-bar']}>
      <SearchBarTable
        cacheState
        searchBarRef={(ref) => {
          searchBarRef.current = ref;
        }}
        searchCode={isTenant ? 'HPFM.MESSAGE_USER_LIST.FILTER' : 'HPFM.MESSAGE_LIST.FILTER'}
        searchBarConfig={{
          fieldProps: {
            tenantId: {
              lovPara: {
                tenantId: undefined,
              },
            },
          },
        }}
        dataSet={tableDs}
        columns={messageColumns}
        autoHeight={{ type: 'maxHeight', diff: -80 }}
        customizable
        customizedCode="HPFM.NEW_MESSAGE.TABLE"
      />
    </div>
  );
};

export default compose(
  connect(({ message }) => ({
    message,
  }))
)(List);
