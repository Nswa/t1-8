//SvelteKit provides a way to protect routes using hooks. You can create a hooks.server.ts file in the 
//app.html
//directory to handle authentication checks before rendering any page.
import { redirect } from '@sveltejs/kit';
import { firebaseAuth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const handle = async ({ event, resolve }) => {
    const user = await new Promise((resolve) => {
        onAuthStateChanged(firebaseAuth, (user) => {
            resolve(user);
        });
    });

    // Protect routes that require authentication
    if (event.url.pathname.startsWith('/main') && !user) {
        throw redirect(302, '/');
    }

    return resolve(event);
};