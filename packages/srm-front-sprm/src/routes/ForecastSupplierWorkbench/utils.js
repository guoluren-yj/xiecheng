import intl from 'utils/intl';

const config = () => {
  return [
    {
      // 该向导组是否启用
      enable: true,
      // 向导组编码
      code: 'SRPM_FRSTSUPPLIER_EDIT', // COMMON_IMPORT_EXPORT
      // 向导组类型
      type: 'strong',
      // 向导组优先级，在多个向导同时满足条件时，数值大的优先显示
      priority: 0,
      // 版本，每次向导配置变更时，版本号+1，约定为数字
      version: 1,
      // 向导标题，暂未使用该属性
      title: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
      // 延时，在满足条件后多少毫秒显示弹窗，解决部分页面向导元素有过渡效果的问题
      delay: 300,
      // 是否为可选步骤，当该选项为true时，向导组内的各步骤遵循哪一步满足条件哪一步显示，直到整个向导组均已被阅读过为止
      optionalSteps: true,
      steps: [
        {
          selector: '.supplier-import',
          title: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
          htmlText: intl
            .get('sprm.common.viewtitle.frstBatchImport')
            .d('请先导出待反馈的预测数据，维护好反馈数据后，再执行导入操作'),
          placement: 'bottom-right',
        },
      ],
    },
  ];
};

export { config };
