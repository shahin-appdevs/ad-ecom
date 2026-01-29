/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line
export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	extend: {
    		backgroundImage: {
				banner__gradient: 'linear-gradient(to bottom right, #e0f0ff, #eeeae4, #ffffff)',
			},
    		colors: {
    			color__heading: 'rgb(var(--color__heading))',
    			color__paragraph: 'rgb(var(--color__paragraph))',
    			color__text: 'rgb(var(--color__text))',

    			white__color: 'rgb(var(--white__color))',

    			primary__color: 'rgb(var(--primary__color))',
    			secondary__color: 'rgb(var(--secondary__color))',

    			section__color: 'rgb(var(--section__color))',
    			section_secondary_color: 'rgb(var(--section_secondary_color))',

    			body__color: 'rgb(var(--body__color))',

    			gray__color: 'rgb(var(--gray__color))',
    			input_bg_color: 'rgb(var(--input_bg_color))',

    			primary_border_color: 'rgb(var(--primary_border_color))',
    			gray_border_color: 'rgb(var(--gray_border_color))',
    		},
    		boxShadow: {
    			primary__shadow: 'var(--primary__shadow)',
    			card__shadow: 'var(--card__shadow)'
    		},
    		lineHeight: {
    			font__line_height_body: 'var(--font__line_height_body)',
    			font__line_height_heading: 'var(--font__line_height_heading)',
    			font__line_height_paragraph: 'var(--font__line_height_paragraph)'
    		},
    		fontSize: {
    			small__font: 'var(--small__font)',
    			primary__font: 'var(--primary__font)',
    			heading__one: 'var(--heading__one)',
    			heading__two: 'var(--heading__two)',
    			heading__three: 'var(--heading__three)',
    			heading__four: 'var(--heading__four)',
    			heading__five: 'var(--heading__five)',
    			heading__six: 'var(--heading__six)'
    		},
			keyframes: {
				pops: {
					'0%, 100%': { transform: 'scale(1, 1)' },
					'50%': { transform: 'scale(1.2, 1.2)' },
				},
				topDown: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(30px)' },
				},
			}
    	}
    },
    plugins: [],
};