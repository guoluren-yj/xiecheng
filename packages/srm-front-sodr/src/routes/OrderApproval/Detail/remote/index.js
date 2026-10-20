export default [
  { code: 'SODR.ORDERAPPROVAL_DETAIL' },
  {
    process: {
      // 工作流审批提交处理promise
      approvalPromise: () => {
        return new Promise((resolve) => {
          resolve();
        });
      },
      // 订单头按钮组buttons
      processHeaderBtn(btns) {
        return btns;
      },
      processColumns: (columns) => columns,
    },
    render: {
      // 外部附件按钮（工作流审批表单场景下）
      renderOutUuidUpload: ({ children }) => children,
    },
  },
];
