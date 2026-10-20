import React, { useEffect, useState } from 'react';

const imgJson = new Map([
  // 注册icon图片
  // type：XX , img name:XX
  ['type_release', 'cancellation-of-publication@3x.png'],
  ['type_management', 'version-management@3x.png'],
  ['type_play', 'preview@3x.png'],
  ['type_edit', 'edit@3x.png'],
  ['type_vert', 'operation@3x.png'],
  ['type_serach', 'serach@2x.png'],
  ['type_home', 'home@3x.png'],
  ['type_enable', 'enable@3x.png'],
  ['type_unenable', 'unenable@3x.png'],
  ['type_view', 'view@3x.png'],
  ['type_set_view', 'set-view@3x.png'],
  ['present-no-page', 'no-page@3x.png'],
  ['type-open-black', 'open-black.svg'],
  ['type-help', 'help.svg'],
]);

export default ({ type, style, className }) => {
  const [img, setImg] = useState('');
  useEffect(() => {
    const imgName = imgJson.get(type);
    if (imgName && typeof imgName === 'string') {
      import(`../../assets/icon/${imgName}`).then((item) => {
        // 获取 base64 数据，大图片不能使用
        setImg(item.default);
      });
    }
  }, [type]);
  return (
    <img
      src={img}
      alt="icon"
      style={{
        marginLeft: '0.02rem',
        verticalAlign: 'middle',
        width: '0.145rem',
        height: '0.145rem',
        ...style,
      }}
      className={`icon ${className}`}
    />
  );
};
