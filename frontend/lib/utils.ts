export async function checkAuthorization() {
    const user = localStorage.getItem("mpms_user");
    return user;
}

export function getToken() { return (typeof window!=='undefined') ? localStorage.getItem('mpms_token') : null; }
