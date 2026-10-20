export const getMultiLanguageDs = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'zh_CN',
      type: 'string',
      label: '简体中文',
    },
    {
      name: 'en_US',
      type: 'string',
      label: 'English',
    },
    {
      name: 'ja_JP',
      type: 'string',
      label: '日本語',
    },
    {
      name: 'ru_RU',
      type: 'string',
      label: 'Русский',
    },
  ],
});
