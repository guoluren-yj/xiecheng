// ds 是否触发validationRules key
const EditorSymbol = 'DSEditorSymbol';

/**
 * ds表格校验数据行数-通用方法
 * () rules string 'minLength' 'minLength,maxLength,...'
 * ()() rulesOptions object, { minLength: {}, maxLength: {}, ... }
 */
const commonValidationRules = (rules = '') => {
  if (!rules || typeof rules !== 'string') {
    throw TypeError('Validation Rules name Exist And Must Is string !');
  }

  const rulesKey = rules.split(',');
  const CommonRules = [
    {
      name: 'minLength',
      value: 1,
      message: null,
      disabled: ({ dataSet }) => {
        const result = dataSet.getState(EditorSymbol);
        return result !== true;
      },
    },
    // {
    //   name: 'maxLength',
    //   value: 1,
    //   message: null,
    //   disabled: ({ dataSet }) => {
    //     const result = dataSet.getState(EditorSymbol);
    //     return result === true;
    //   },
    // },
  ];

  return (rulesOptions = {}) => {
    const result = CommonRules.map((item) => {
      const { name } = item;
      const ExistIndex = rulesKey.findIndex((n) => n === name);

      if (ExistIndex < 0) {
        return;
      }

      return {
        ...item,
        ...(rulesOptions[name] || {}),
      };
    });

    return result.filter(Boolean);
  };
};

export { commonValidationRules, EditorSymbol };
