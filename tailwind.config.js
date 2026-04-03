/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "neon-green": "hsl(142, 70%, 50%)",
                "neon-blue": "hsl(199, 89%, 48%)",
                "deep-green": "hsl(160, 100%, 2%)",
            },
        },
    },
    plugins: [],
}
