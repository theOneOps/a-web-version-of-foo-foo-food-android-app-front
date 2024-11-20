/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"], theme: {
        extend: {
            fontFamily: {
                'sans': ['Sofia Pro', 'sans-serif'],
            },
        },
    }, plugins: [require("@tailwindcss/line-clamp")],
};
