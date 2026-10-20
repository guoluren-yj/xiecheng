// https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
let publicUrl = process.env.PUBLIC_URL || '';
publicUrl = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
module.exports = {
  'input-height-base': '28px',
  'btn-height-base': '28px',
  'font-size-base': '12px',
  'text-color': '#333',
  'border-radius-base': '2px',
  'primary-color': '#29BECE',
  'layout-header-height': '48px',
  'modal-mask-bg': 'rgba(0, 0, 0, 0.288)',
  'pagination-item-size': '26px',
  'form-item-margin-bottom': '14px',
  'hzero-primary-color-2-hover': '#23beff',
  'icon-url': `${publicUrl}assets/hzero-ui/font_148784_v4ggb6wrjmkotj4i`,
  // 'iconfont-css-prefix': 'c7n', // 设置 c7n 图标 class 前缀
  'icon-font-family': 'c7nIcon',
};
