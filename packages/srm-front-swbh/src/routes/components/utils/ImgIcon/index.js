import ImgIcon from './imgIcon';

/**
 * 使用方法，
 * 1，把一张或多张图片拖入 src/assets/icon 目录里
 * 2，项目根目录执行 yarn imglist
 * 3，引入使用
 *  import ImgIcon from '@/utils/ImgIcon';
 *  <ImgIcon name='attention@2x.png' size='20px'/>
 *  注：这里的name就是图片文件名。
 *  注：ImgIcon有name,size，style，className属性可供选择。
 * */
export default ImgIcon;
