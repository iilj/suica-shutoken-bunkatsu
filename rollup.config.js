import typescript from "rollup-plugin-typescript";
import html from "rollup-plugin-html";
import scss from 'rollup-plugin-scss';

export default [
    {
        input: "src/main.ts",
        output: {
            file: "dist/dist.js"
        },
        plugins: [
            html({
                include: "**/*.html"
            }),
            scss({
                output: false
            }),
            typescript()
        ]
    }
];