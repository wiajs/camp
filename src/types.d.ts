/**
 * 类型定义
 * namespace无需 import，可直接使用
 * module 需 import 才能使用
 * tsc 中包含该文件，避免编译错误
 *
 * declare 关键字用来告诉编译器，某个类型是存在的，可以在当前文件中使用。
 * 使用外部库，编译器会因为不知道外部函数的类型而报错，就可以使用declare，告诉编译器外部函数的类型。
 * 这样的话，编译单个脚本就不会因为使用了外部类型而报错。
 * declare 关键字可以描述以下类型：
 * 变量（const、let、var 命令声明）
 * type 或者 interface 命令声明的类型
 * class
 * enum
 * 函数（function）
 * 模块（module）
 * 命名空间（namespace）
 *
 */

// 没有类型定义的第三方库，any 处理
declare module '@wiajs/core'
declare module '@wiajs/*'
// declare module '@wiajs/util'
// declare module '@wiajs/signal'
// declare module '@wiajs/lib/img/util'
// declare module '@wiajs/ui/uploader'
// declare module '@wiajs/ui/cropper'
// declare module '@wiajs/lib/signal'
// declare module '@wiajs/router'
// declare module '@wiajs/dom'
// declare module '@wiajs/lib/compress'

// CSS modules
type CSSModuleClasses = {readonly [key: string]: string}

declare module '*.module.css' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.module.scss' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.module.sass' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.module.less' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.module.styl' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.module.stylus' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.module.pcss' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.module.sss' {
  const classes: CSSModuleClasses
  export default classes
}

// CSS 文件
// declare module '*.css' {
//   const styles: {[key: string]: string}
//   export = styles
// }

declare module '*.css' {
  /**
   * @deprecated Use `import style from './style.css?inline'` instead.
   */
  const css: string
  export default css
}
declare module '*.scss' {
  /**
   * @deprecated Use `import style from './style.scss?inline'` instead.
   */
  const css: string
  export default css
}
declare module '*.sass' {
  /**
   * @deprecated Use `import style from './style.sass?inline'` instead.
   */
  const css: string
  export default css
}
declare module '*.less' {
  /**
   * @deprecated Use `import style from './style.less?inline'` instead.
   */
  const css: string
  export default css
}
declare module '*.styl' {
  /**
   * @deprecated Use `import style from './style.styl?inline'` instead.
   */
  const css: string
  export default css
}
declare module '*.stylus' {
  /**
   * @deprecated Use `import style from './style.stylus?inline'` instead.
   */
  const css: string
  export default css
}
declare module '*.pcss' {
  /**
   * @deprecated Use `import style from './style.pcss?inline'` instead.
   */
  const css: string
  export default css
}
declare module '*.sss' {
  /**
   * @deprecated Use `import style from './style.sss?inline'` instead.
   */
  const css: string
  export default css
}

// images
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
declare module '*.jfif' {
  const src: string
  export default src
}
declare module '*.pjpeg' {
  const src: string
  export default src
}
declare module '*.pjp' {
  const src: string
  export default src
}
declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const content: any
  export default content
}

// declare module '*.svg' {
//   const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
//   const content: string

//   export {ReactComponent}
//   export default content
// }

declare module '*.ico' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}
declare module '*.avif' {
  const src: string
  export default src
}

// media
declare module '*.mp4' {
  const src: string
  export default src
}
declare module '*.webm' {
  const src: string
  export default src
}
declare module '*.ogg' {
  const src: string
  export default src
}
declare module '*.mp3' {
  const src: string
  export default src
}
declare module '*.wav' {
  const src: string
  export default src
}
declare module '*.flac' {
  const src: string
  export default src
}
declare module '*.aac' {
  const src: string
  export default src
}

declare module '*.opus' {
  const src: string
  export default src
}

// fonts
declare module '*.woff' {
  const src: string
  export default src
}
declare module '*.woff2' {
  const src: string
  export default src
}
declare module '*.eot' {
  const src: string
  export default src
}
declare module '*.ttf' {
  const src: string
  export default src
}
declare module '*.otf' {
  const src: string
  export default src
}

// other
declare module '*.webmanifest' {
  const src: string
  export default src
}
declare module '*.pdf' {
  const src: string
  export default src
}
declare module '*.txt' {
  const src: string
  export default src
}
