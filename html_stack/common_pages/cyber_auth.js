// cyber_auth.js - Centralized Authentication Script for Deep Hunt Platform
(function() {
    function getAuthCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }

    const token = localStorage.getItem('cyber_token') || getAuthCookie('token');
    window.cyberAuthToken = token;

    const path = window.location.pathname;
    const isPublicPage = path.includes('/login.html') || 
                         path.includes('/register.html') || 
                         path.includes('/forgot_password.html') || 
                         path === '/' || 
                         path.includes('/before_signup/');

    if (!token && !isPublicPage) {
        window.location.href = '/common_pages/login.html';
    }

    window.cyberLogout = function() {
        document.cookie = 'token=; Max-Age=0; path=/; SameSite=Lax';
        localStorage.removeItem('cyber_token');
        localStorage.removeItem('cyber_user');
        window.location.href = '/common_pages/login.html';
    };

    window.submitLabScore = function(scoreVal) {
        if (!window.cyberAuthToken) return;
        return fetch('/api/main/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.cyberAuthToken}`
            },
            body: JSON.stringify({ score: scoreVal })
        }).then(res => {
            if(res.ok) console.log("Lab score submitted successfully:", scoreVal);
        }).catch(err => {
            console.error("Failed to submit score:", err);
        });
    };
})();
