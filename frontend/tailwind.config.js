/** Colours are approximated from the Figma screenshots.
 *  Check them in Figma (Inspect panel) and replace the hex values below. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#FF1F1F',
          orange: '#F7931E',
          navy: '#1B2262',
          mist: '#F3F4FF',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
