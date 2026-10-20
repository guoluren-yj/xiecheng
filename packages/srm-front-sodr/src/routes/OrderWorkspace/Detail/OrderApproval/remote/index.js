export default [
  { code: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL' },
  {
    process: {
      // 外部系统金额字段是否做精度控制
      bySourceCode: () => true,
      // 工作流审批提交处理promise
      approvalPromise: () => {
        return new Promise((resolve) => {
          resolve();
        });
      },
      // 头按钮组Porps
      transformHeaderButtonProps(props) {
        return props;
      },
      processColumns: (columns) => columns,
      processPanels: (panels) => panels,
      'SODR.WORKBENCH_DETAIL_ORDERAPPROVAL_DETAILLINE_BTNS': (btns) => btns,
      addEventCux: (params) => params,
    },
  },
];
