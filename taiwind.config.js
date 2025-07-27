/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // 添加自定义阴影用于像素风效果
      boxShadow: {
        'pixel': `
          inset 1px 1px 0px rgba(255, 255, 255, 0.3),
          inset -1px -1px 0px rgba(0, 0, 0, 0.3),
          2px 2px 0px rgba(0, 0, 0, 0.4)
        `,
        'pixel-mobile': `
          inset 1px 1px 0px rgba(255, 255, 255, 0.2),
          inset -1px -1px 0px rgba(0, 0, 0, 0.2),
          1px 1px 0px rgba(0, 0, 0, 0.3)
        `
      },
      // 添加自定义 z-index 值
      zIndex: {
        '500': '500',
        '501': '501'
      }
    },
  },
  plugins: [],
}