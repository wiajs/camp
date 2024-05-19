/**
 * 类型定义
 * namespace无需 import，可直接使用
 * module 需 import 才能使用
 * tsc 中包含该文件，避免编译错误
 */

// 没有类型定义的第三方库，any 处理
declare module '@wiajs/core'
declare module '@wiajs/*'

declare module '*.webp';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';

declare module "*.svg" {
  const content: any;
  export default content;
}

declare module '*.css' {
  const styles: { [key: string]: string };
  export = styles;
}
// declare module '@wiajs/util'
// declare module '@wiajs/signal'
// declare module '@wiajs/lib/img/util'
// declare module '@wiajs/ui/uploader'
// declare module '@wiajs/ui/cropper'
// declare module '@wiajs/lib/signal'
// declare module '@wiajs/router'
// declare module '@wiajs/dom'
// declare module '@wiajs/lib/compress'
