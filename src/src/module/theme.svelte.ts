class Theme {
    value: 'light' | 'dark' = $state('light');
}

const THEME = new Theme();

export function getTheme() {
    return THEME.value;
}

export function setTheme(theme: 'light' | 'dark') {
    THEME.value = theme;
    window.localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', THEME.value);
}

export function useTheme() {
    const isDarkMode = (window.localStorage.getItem('theme') !== 'light') && (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(isDarkMode){
        THEME.value = 'dark';
    }
    else{
        THEME.value = 'light';
    }
    document.body.setAttribute('data-theme', THEME.value);
}