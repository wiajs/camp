/**
 * 获取 swc 编译选项
 * @param {*} dev 开发模式
 * @returns
 */
const getOpt = (dev = false) => {
  const opt = {
    jsc: {
      parser: {
        dynamicImport: false,
        privateMethod: true,
        functionBind: false,
        exportDefaultFrom: false,
        exportNamespaceFrom: false,
        decorators: false,
        decoratorsBeforeExport: false,
        topLevelAwait: false,
        importMeta: false,
      },
      // externalHelpers: true,
      transform: {
        // legacyDecorator: false, // 旧版（第 1 阶段）类装饰器语法和行为
        // decoratorMetadata: true, // decorators with emitDecoratorMetadata enabled
        // decoratorVersion: '2022-03', // "2021-12" (default)
        react: {
          runtime: 'classic', // automatic or classic automatic 使用 JSX 运行时（在React 17 中引入）
          // throwIfNamespace: true,
          // useBuiltins: true,
          development: dev,
          refresh: dev,
        },
      },
      loose: true,
      externalHelpers: true, // 帮助程序函数来支持目标环境。默认情况下，帮助程序函数内联到需要的输出文件中
      keepClassNames: true, // 保留原始类名
    },
    // 禁止服务端拆分成chunks
    // 问题：es6 调式模式没问题，生产模式报错，提示函数找不到，可能是一些函数被摇树掉了，cjs 是作为整体输出，不摇树
    // babel 编译 输出 es6 没有问题，原因不明
    // module: {
    // type: 'commonjs', // es6 commonjs 输出格式
    // ignoreDynamic: true,
    // },
    sourceMaps: dev, // 调试映射
  }

  // rspack 内置 swc 支持 env，标准 swc 不支持
  if (dev)
    // opt.target = 'es5' // Disable es5,es6,es2020,es2021,es2022 or use env
    opt.env = {
      targets: ['chrome >= 100'],
    }
  else {
    opt.env = {
      // mode: 'entry', // "usage" | "entry" | false ，默认为 false
      // "coreJs": "3.36.1" // 浏览器兼容补全
      // forceAllTransforms: true,
      // dynamicImport: true,
      targets: ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14'],
      // include: ['transform-async-to-generator', 'transform-regenerator'],
    }
  }

  return opt
}

/**
 *
 * @param {boolean} dev
 * @returns
 */
function getJsOpt(dev = false) {
  const opt = getOpt(dev)
  const R = {
    // test: ".(js|jsx|mjs|cjs)$",
    ...opt,
    jsc: {
      ...opt.jsc,
      parser: {
        syntax: 'ecmascript',
        jsx: true,
        // ...opt.jsc.parser,
      },
    },
  }

  // console.log(R, 'getJsOpt')

  return R
}

/**
 *
 * @param {boolean} dev
 * @returns
 */
const getTsOpt = (dev = false) => {
  const opt = getOpt(dev)
  const R = {
    // test: ".(ts|tsx)$",
    ...opt,
    jsc: {
      ...opt.jsc,
      parser: {
        syntax: 'typescript',
        tsx: true,
        // ...opt.jsc.parser,
      },
    },
  }
  // console.log({R}, 'getTsOpt')
  return R
}

module.exports = {
  getTsOpt,
  getJsOpt,
}
