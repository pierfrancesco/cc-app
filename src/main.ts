import './styles/main.scss';
import { App } from './App';

function bootstrap(): void {
    try {
        const appInstance = new App();
        appInstance.init();
        console.log('Application initialized.');
    } catch (error) {
        console.error('Failed to initialize the application:', error);
    }
}

document.addEventListener('DOMContentLoaded', bootstrap);
