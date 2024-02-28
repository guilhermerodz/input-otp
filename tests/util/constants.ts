export const INPUT_NAMES = ['react-input', 'vue-input', 'svelte-input']
export const getFrameworkName = (inputName: string) => inputName.split('-')[0]