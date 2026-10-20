import React from 'react';
import { connect } from 'dva';
import { isArray } from 'lodash';
import { checkPermission } from 'services/api';
import { getResponse } from 'utils/utils';
import { getMenuId } from 'utils/menuTab';

import { queryMenuId } from '@/services/taskService';
import {
  APPROVAL_WORKBENCH_PERMISSION_CODE,
  APPROVAL_WORKBENCH_FUNCTION_CODE,
  TASK_LIST_PERMISSION_CODE,
  TASK_LIST_FUNCTION_CODE,
  TASK_MENU_TYPE,
} from '@/utils/constant';

export default function TaskMenuProvider(option) {
  const { initMenu } = option || {};
  return (Component) => {
    class WrapperComponent extends React.Component {
      constructor(props) {
        super(props);
        const search = (props && props.location && props.location.search) || window.location.search;
        this.state = {
          isPub: search && search.includes('isPub=true'),
          taskMenu: undefined,
          taskMenuId: getMenuId(),
        };
      }

      componentDidMount() {
        if (initMenu || (this.state.isPub && !this.state.taskMenuId)) {
          this.initTaskMenu();
        }
      }

      async initTaskMenu() {
        const fixTempCodes = [
          // 我的审批--默认权限集
          'scux.watsons.todo_task.ps.default',
          // 默认权限集
          'hzero.wp.self.hy.my-todo-list.ps.default',
        ];
        const res = await checkPermission([
          APPROVAL_WORKBENCH_PERMISSION_CODE,
          TASK_LIST_PERMISSION_CODE,
          ...fixTempCodes,
        ]);
        if (getResponse(res) && res && isArray(res)) {
          const premissionObj = {};
          res.forEach((item) => {
            premissionObj[item.code] = item.approve;
          });
          let taskMenu;
          let taskMenuId;
          let functionCode;
          const pathname = (this.props && this.props.location && this.props.location.pathname) || window.location.pathname;
          const isTaskMenu = pathname.includes('/hwfp/task');
          const isApprovalWorkbench = pathname.includes('/hwfp/approval');
          // 先判断当前页面是否有权限
          if (isTaskMenu && (premissionObj[TASK_LIST_PERMISSION_CODE] || premissionObj[fixTempCodes[0]] || premissionObj[fixTempCodes[1]])) {
            taskMenu = TASK_MENU_TYPE.TASK_LIST;
            functionCode = TASK_LIST_FUNCTION_CODE;
          } else if (isApprovalWorkbench && premissionObj[APPROVAL_WORKBENCH_PERMISSION_CODE]) {
            taskMenu = TASK_MENU_TYPE.APPROVAL_WORKBENCH;
            functionCode = APPROVAL_WORKBENCH_FUNCTION_CODE;
          }
          // functionCode为空标识当前页面没权限。需要先判断审批工作台是否有权限，再判断我的待办事项是否有权限
          if (!functionCode) {
            if (premissionObj[APPROVAL_WORKBENCH_PERMISSION_CODE]) {
              taskMenu = TASK_MENU_TYPE.APPROVAL_WORKBENCH;
              functionCode = APPROVAL_WORKBENCH_FUNCTION_CODE;
            } else if (premissionObj[TASK_LIST_PERMISSION_CODE] || premissionObj[fixTempCodes[0]] || premissionObj[fixTempCodes[1]]) {
              taskMenu = TASK_MENU_TYPE.TASK_LIST;
              functionCode = TASK_LIST_FUNCTION_CODE;
            }
          }
          if (functionCode) {
            const menu = await queryMenuId(functionCode);
            if (getResponse(menu) && menu && menu.id) {
              taskMenuId = menu.id;
              this.props.dispatch({
                type: 'global/updateState',
                payload: {
                  activeTabMenuId: taskMenuId,
                },
              });
              this.setState({
                taskMenu,
                taskMenuId,
              });
            }
          }
        }
      }

      render() {
        const { isPub, taskMenu, taskMenuId } = this.state;
        if (!isPub && !initMenu) {
          return <Component {...this.props} />;
        }
        return taskMenuId ? (
          <Component taskMenu={taskMenu} taskMenuId={taskMenuId} {...this.props} />
        ) : null;
      }
    }

    return connect(({ global = {} }) => ({
      global,
    }))(WrapperComponent);
  };
}
