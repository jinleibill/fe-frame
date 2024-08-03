# 手撸前端 MVVM 框架

## 特性

- 文本，elements(div, input..)，fragment
- class, style, 属性绑定
- 生命周期钩子
- props
- 事件
- 组件

## 构建
```
cd packages/runtime
npm run build
```

## 示例

- [无框架 todos](examples/01)
- [有框架(每次挂载整个应用) todos](examples/02)
- [有框架(基于diff 算法修改) todos](examples/03)
- [有框架(组件化) todos](examples/04/todos)
- [有框架(组件化) 井字棋游戏](examples/04/tictactoe)

## 测试
```
cd packages/runtime
npm run test
```

## TODO

- 插槽
- 模版语法，编译
- router